import time
from lib.redis.redis_cli import redis_client


def build_key(key):
    return "STARK_LOCK_" + key


def lock(key, timeout=10):
    start_time = time.time()
    while True:
        end_time = time.time() - start_time
        if end_time > timeout:
            return False
        if redis_client.set(build_key(key), "1", nx=True, ex=int(timeout)):
            return True
        time.sleep(0.1)


def unlock(key):
    redis_client.delete(build_key(key))
