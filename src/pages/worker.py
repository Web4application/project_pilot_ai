from rq import Queue
from redis import Redis
import time

r = Redis()
q = Queue('pilotai', connection=r)

def long_task(data):
    time.sleep(5)
    return data.upper()
