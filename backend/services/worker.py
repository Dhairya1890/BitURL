import os, json, time
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling
import redis

load_dotenv()


redis_client = redis.from_url(os.environ["REDIS_URL"], decode_responses=True)
db_pool = pooling.MySQLConnectionPool(
    pool_name = "worker_pool", pool_size=2,
    host=os.environ["DB_HOST"], port=int(os.environ["DB_PORT"]),
    user=os.environ["DB_USER"], password=os.environ["DB_PASSWORD"],
    database=os.environ["DB_NAME"], ssl_ca=os.environ["DB_SSL_CA"],
)

CLICK_QUEUE = "click:queue"
BATCH_SIZE = 100
BATCH_TIMEOUT = 5

def flush(events):
    if not events:
        return
    conn = db_pool.get_connection()
    try:
        cur = conn.cursor()
        cur.executemany(
            "INSERT INTO clicks (link_id, referrer, user_agent) VALUES (%s, %s, %s)",
            [(e["link_id"], e["referrer"], e["user_agent"]) for e in events],
        )
        conn.commit()
        print(f"flushed {len(events)} clicks")
    finally:
        conn.close()

def run():
    batch = []
    last_flush = time.time()
    while True:
        item = redis_client.rpop(CLICK_QUEUE)
        if item:
            batch.append(json.loads(item))
        else:
            time.sleep(0.1)
        
        if len(batch) >= BATCH_SIZE or (batch and time.time() - last_flush > BATCH_TIMEOUT):
            flush(batch)
            batch = []
            last_flush = time.time()

if __name__ == "__main__":
    run()