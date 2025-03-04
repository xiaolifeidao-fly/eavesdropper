from rediscluster import RedisCluster

from lib.settings.configuration import config
from lib.utils import log

password = config.get('REDIS', "password")
nodes = config.get('REDIS', "nodes")
max_connections = config.get('REDIS', "max_connections")
health_check_interval = config.get('REDIS', "health_check_interval")
pre_key = config.get('REDIS', "pre_key")
tenant_name = "gibraltar"


def build_redis_client():
    log.info('build_redis_client start')
    nodes_array = nodes.split(",")
    redis_nodes = []
    for node in nodes_array:
        node_config = node.split(":")
        config = {'host': node_config[0], 'port': int(node_config[1])}
        redis_nodes.append(config)
    redis_client = RedisCluster(
        startup_nodes=redis_nodes,
        max_connections=50,
        decode_responses=True,
        skip_full_coverage_check=True,
        password=password,
        socket_keepalive=True,
        health_check_interval=int(health_check_interval),
        retry_on_timeout=True)
    log.info('build_redis_client end')
    return redis_client


redis_client = build_redis_client()


def build_key(key):
    return tenant_name + pre_key + "_" + key


def client_pool(func):
    def wrapper(*args, **kwargs):
        try:
            # 执行原始方法
            return func(*args, **kwargs)
        finally:
            redis_client.close()

    return wrapper


def get(key):
    return redis_client.get(build_key(key))


def get_key_hash(key):
    return redis_client.get(build_key(key))


def set(key, value):
    key = build_key(key)
    redis_client.set(key, value)
    redis_client.expire(key, 6000)


def rpush(key, value):
    key = build_key(key)
    result = redis_client.rpush(key, value)
    redis_client.expire(key, 6000)
    return result


def remove(key):
    key = build_key(key)
    redis_client.delete(key)


def rpop(key):
    key = build_key(key)
    redis_client.rpop(key)


def lrem(key, value):
    key = build_key(key)
    redis_client.lrem(key, 0, value)


def expire(key, seconds):
    redis_client.expire(key, seconds)


def llen(key):
    key = build_key(key)
    return redis_client.llen(key)


def incr(key, value):
    key = build_key(key)
    return redis_client.incr(key, value)


def lset(key, index, value):
    key = build_key(key)
    redis_client.lset(key, index, value)


def lrange(key, start, end):
    key = build_key(key)
    return redis_client.lrange(key, start, end)


def getLast(key, num):
    # 获取列表长度
    key = build_key(key)
    list_length = redis_client.llen(key)
    # 获取最后 10 个元素
    start_index = max(list_length - num, 0)
    end_index = -1
    value = redis_client.lrange(key, start_index, end_index)
    return value

def zrangebyscore(key : str, min, max , start=0, num=1):
    key = build_key(key)
    return redis_client.zrangebyscore(key, min,max, start, num)

def zrem(key : str, value : str):
    key = build_key(key)
    return redis_client.zrem(key, value)

def zadd(key : str, time : int, value : str):
    key = build_key(key)
    return redis_client.zadd(key,  {value: time}, ch=True)

def zcard(key : str):
    key = build_key(key)
    return redis_client.zcard(key)