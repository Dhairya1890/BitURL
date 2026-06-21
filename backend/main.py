import os
from dotenv import load_dotenv
import mysql.connector
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import string
import secrets

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://bit-url-brown.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_conn():
    return mysql.connector.connect(
        host=os.environ["DB_HOST"],
        port=int(os.environ["DB_PORT"]),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        ssl_ca=os.environ["DB_SSL_CA"]
    )

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

def record_click(link_id: int, referrer: str | None, user_agent: str | None):
    """Runs in the background so it doesn't slow the redirect."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO clicks (link_id, referrer, user_agent) VALUES (%s, %s, %s)",
            (link_id, referrer, user_agent),
        )
        conn.commit()
    finally:
        conn.close()
  
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
    background.add_task(
        record_click,
        link_id,
        request.headers.get("referer"),
        request.headers.get("user-agent"),
    )
    return RedirectResponse(long_url, status_code=302)