from lib.settings.configuration import config
broker = config.get("KAFKA", "broker")
group = config.get("KAFKA", "group")
timeout_ms = config.get("KAFKA", "timeout")
consumer_kafka_config = {
    'bootstrap.servers': broker,  # Kafka 服务器地址
    'group.id': group,  # 消费者组的标识符
    'auto.offset.reset': 'earliest',  # 设置消费者的起始偏移量
}

produce_kafka_config = {
    'bootstrap.servers': broker
}

