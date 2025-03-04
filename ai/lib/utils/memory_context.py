import threading

memory_context = threading.local()


def put(key, value):
    setattr(memory_context, get_key(key), value)


def remove_value(key):
    try:
        delattr(memory_context, str(get_key(key)))
    except AttributeError:
        pass


def remove_all():
    all_keys = [key for key in dir(memory_context) if not key.startswith('__')]
    for key in all_keys:
        delattr(memory_context, key)


def get(key):
    key = get_key(key)
    if key not in dir(memory_context):
        return None
    return getattr(memory_context, key)


def get_key(key):
    return key + "_chat"
