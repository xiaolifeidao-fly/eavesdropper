import threading

tenant_context = threading.local()


def put(value):
    setattr(tenant_context, get_key("tenant"), value)


def remove():
    try:
        delattr(tenant_context, str(get_key("tenant")))
    except AttributeError:
        pass


def get_key(key):
    return "tenant_" + key


def get():
    key = get_key("tenant")
    if key not in dir(tenant_context):
        return None
    return getattr(tenant_context, key)


def put_data(key, value):
    setattr(tenant_context, key, value)


def get_data(key):
    return getattr(tenant_context, key)
