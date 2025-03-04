import hashlib


def get_hash(text):
    # 使用SHA-256算法计算哈希值
    hash_object = hashlib.sha256(text.encode('utf-8'))
    # 获取哈希值的十六进制表示
    hash_hex = hash_object.hexdigest()
    return hash_hex
