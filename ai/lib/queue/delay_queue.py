import threading
import time
from lib.rediscli import redis_cli
from lib.utils import log


def delay(key : str, data : str, delay_time : int):
    delay_time = int(time.time()) + delay_time
    return redis_cli.zadd(key, delay_time, data)

class Consumer(threading.Thread):

    def __init__(self, key, handler):
        super().__init__()
        self.key = key
        self.handler = handler

    def run(self) -> None:
        while True:
              # 获取当前时间戳
            now = int(time.time())
            # 获取排序集合中分数最小的元素，如果分数大于当前时间戳，则等待

            next_task = redis_cli.zrangebyscore(self.key, min=0, max=now)
            if not next_task or len(next_task) == 0:
                time.sleep(0.5)  # 等待1秒
                continue
            item = next_task[0]
            if redis_cli.zrem(self.key, item) <= 0:
                continue
            try:
                self.consumer(item)
            except Exception as e:
                log.error("process_queue process data error %s", e)

    def consumer(self, data):
        self.handler(data)
