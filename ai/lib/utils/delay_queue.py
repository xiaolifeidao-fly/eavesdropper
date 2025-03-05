from abc import abstractmethod
import heapq
import time
from threading import Thread, Event
from typing import List

from lib.utils import log


class DelayedTask:

    def set_run_at(self, run_at):
        self.run_at = run_at

    def __lt__(self, other):
        return self.run_at < other.run_at

    def run(self):
        self._run()

    @abstractmethod
    def _run(self):
        pass


class DelayQueue:
    def __init__(self, loop=True):
        self.queue: List[DelayedTask] = []
        self.new_task_event = Event()
        self.stop_event = Event()
        self.worker_thread = Thread(target=self._worker)
        self.worker_thread.start()
        self.loop = loop

    def put(self, delay: int, delayed_task: DelayedTask):
        if self.stop_event.is_set():
            self.restart_worker()
        run_at = time.time() + delay
        delayed_task.set_run_at(run_at)
        heapq.heappush(self.queue, delayed_task)
        self.new_task_event.set()

    def restart_worker(self):
        self.stop_event.clear()
        self.worker_thread = Thread(target=self._worker)
        self.worker_thread.start()

    def _worker(self):
        while not self.stop_event.is_set():
            if not self.queue:
                self.new_task_event.wait()
                self.new_task_event.clear()
                continue

            now = time.time()
            task = self.queue[0]
            if task.run_at <= now:
                heapq.heappop(self.queue)
                try:
                    task.run()
                except Exception as e:
                    log.error("DelayQueue task run failed ", e)
                if not self.loop and not self.has_tasks():
                    self.stop(False)
            else:
                timeout = task.run_at - now
                self.new_task_event.wait(timeout=timeout)
                self.new_task_event.clear()

    def has_tasks(self):
        return len(self.queue) > 0

    def stop(self, join=True):
        self.stop_event.set()
        self.new_task_event.set()
        if join:
            self.worker_thread.join()
