from confluent_kafka import Consumer, KafkaError, Producer, TopicPartition

from lib.kafka.config import consumer_kafka_config, produce_kafka_config, timeout_ms
from lib.utils import log


def topic(topic_name):
    def decorator(cls):
        cls.topic_name = topic_name
        return cls

    return decorator


producer = Producer(produce_kafka_config)

import threading


class KafkaConsumer():

    def init(self):
        self.consumer = Consumer(consumer_kafka_config)
        if hasattr(self.__class__, 'topic_name'):
            self.topic_name = self.__class__.topic_name  # type: ignore

    def start(self):
        self.consumer.assign([TopicPartition(self.topic_name, 0)])
        self.consumer.subscribe([self.topic_name])
        threading.Thread(target=self.run).start()

    def run(self):
        while True:
            try:
                msg = self.consumer.poll(timeout=int(timeout_ms))
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        log.error("Reached end of partition")
                    else:
                        log.error(f"Error while consuming: {msg.error()}")
                else:
                    self.on_message(msg.value())
            except Exception as e:
                log.exception("%s  error ", self.topic_name, e)

    def on_message(self, msg):
        pass

    @classmethod
    def push(cls, msg, key=None, partition=0):
        # 在 @classmethod 方法中访问装饰器的值
        if hasattr(cls, 'topic_name'):
            topic_name = cls.topic_name  # type: ignore
            producer.produce(topic_name, key=key, value=msg, partition=partition)
            producer.flush()
            return
        raise
