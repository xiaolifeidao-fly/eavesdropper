import random
import threading
import queue
from lib.utils import log
from typing import Any, Callable


class TaskConsumer(threading.Thread):

    def __init__(self, queue, handler):
        super().__init__()
        self.queue = queue
        self.handler = handler

    def run(self) -> None:
        while True:
            item = self.queue.get()
            try:
                self.consumer(item)
            except Exception as e:
                log.error("process_queue process data error %s", e)
            finally:
                self.queue.task_done()

    def consumer(self, data):
        self.handler(data)


class TaskQueue():
    queues = []

    def __init__(self, thread_num, handler):
        self.thread_num = thread_num
        self.handler = handler

    def build_consumers(self):
        for i in range(self.thread_num):
            data_queue = queue.Queue()
            self.queues.append(data_queue)
            task_consumer = TaskConsumer(data_queue, self.handler)
            task_consumer.start()

    def start(self):
        self.build_consumers()

    # 生产者函数
    def producer(self, data):
        # 生成随机数
        random_number = random.randint(0, len(self.queues) - 1)  # 生成1到100之间的随机整数
        data_queue: queue.Queue = self.queues[random_number]
        data_queue.put(data)

    # 消费者函数


def build_queue(thread_num=5, handler=None):
    return TaskQueue(thread_num, handler)
