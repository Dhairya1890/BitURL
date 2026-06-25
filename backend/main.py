import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling
import redis
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import string
import secrets
import json

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bit-url-brown.vercel.app"
]

db_pool = pooling.MySQLConnectionPool(
    pool_name="url_pool",
    pool_size=15,
    host=os.environ["DB_HOST"],
    port=int(os.environ["DB_PORT"]),
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
    database=os.environ["DB_NAME"],
    ssl_ca=os.environ["DB_SSL_CA"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLICK_QUEUE = "click:queue"

def get_conn():
    # return mysql.connector.connect(
    #     host=os.environ["DB_HOST"],
    #     port=int(os.environ["DB_PORT"]),
    #     user=os.environ["DB_USER"],
    #     password=os.environ["DB_PASSWORD"],
    #     database=os.environ["DB_NAME"],
    #     ssl_ca=os.environ["DB_SSL_CA"]
    # )
    return db_pool.get_connection()

redis_client = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

CACHE_TTL = 60 * 60 * 24

def generate_short_code():

    allowed_chars = string.ascii_letters + string.digits
    code_len = 6

    return ''.join(secrets.choice(allowed_chars) for _ in range(code_len))


class CreateLink(BaseModel):
    long_url : str

@app.post('/shorten')
def shorten(body : CreateLink):
    '''Recieves a long URL, Generates and Returns a short URL'''

    url = body.long_url

    if not url.startswith(("https://", "http://")):
        raise HTTPException(status_code=400, detail="URL must start with https:// or http://")
    
    conn = get_conn()

    try:
        cur = conn.cursor()

        while True:
            code = generate_short_code()
            try:
                cur.execute(
                    "INSERT INTO links (short_code, long_url) VALUES (%s, %s)",
                    (code, body.long_url),
                )
                conn.commit()
                return {"short_code": code}
            
            except mysql.connector.IntegrityError:
                conn.rollback()
                continue

    finally:
        conn.close()

def enqueue_click(link_id, referrer, user_agent):
    event = json.dumps({
        "link_id" : link_id,
        "referrer" : referrer,
        "user_agent" : user_agent
    })
    redis_client.lpush(CLICK_QUEUE, event)

# def record_click(link_id: int, referrer: str | None, user_agent: str | None):
#     """Runs in the background so it doesn't slow the redirect."""
#     '''Update : moved it to enqueue_clicks with redis queue'''
#     '''Implement Producer-consumer architecture'''
#     # conn = get_conn()
#     # try:
#     #     cur = conn.cursor()
#     #     cur.execute(
#     #         "INSERT INTO clicks (link_id, referrer, user_agent) VALUES (%s, %s, %s)",
#     #         (link_id, referrer, user_agent),
#     #     )
#     #     conn.commit()
#     # finally:
#     #     conn.close()

    
  
@app.get("/{code}/stats")
def stats(code: str):
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM links WHERE short_code = %s", (code,))
        row = cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="short code not found")
        link_id = row[0]
 
        cur.execute("SELECT COUNT(*) FROM clicks WHERE link_id = %s", (link_id,))
        total = cur.fetchone()[0]
 
        cur.execute(
            "SELECT clicked_at, referrer, user_agent FROM clicks "
            "WHERE link_id = %s ORDER BY clicked_at DESC LIMIT 10",
            (link_id,),
        )
        recent = [
            {"clicked_at": str(r[0]), "referrer": r[1], "user_agent": r[2]}
            for r in cur.fetchall()
        ]
        return {"short_code": code, "total_clicks": total, "recent": recent}
    finally:
        conn.close()

@app.get("/health")
def status():
    return {"status" : "healthy"}

@app.get("/{code}")
def redirect(code: str, request: Request, background: BackgroundTasks):
    
    cache_key = f"link:{code}"
    cached = redis_client.get(cache_key)

    if cached is not None:
    # cache is store like id|url as a single string, here we are unpacking them into two sepeate entities
        link_id_str, long_url = cached.split("|", 1)
        link_id = int(link_id_str)
        # cached the url and sent to redirect, but no stat recording on cache hit
    else:
        conn = get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, long_url FROM links WHERE short_code = %s",
                (code,),
            )
            row = cur.fetchone()
        finally:
            conn.close()
    
        if row is None:
            raise HTTPException(status_code=404, detail="short code not found")
        
        
        link_id, long_url = row
        redis_client.set(cache_key, f"{link_id}|{long_url}", ex=CACHE_TTL)

    background.add_task(
        enqueue_click,
        link_id,
        request.headers.get("referer"),
        request.headers.get("user-agent"),
    )
    return RedirectResponse(long_url, status_code=302)