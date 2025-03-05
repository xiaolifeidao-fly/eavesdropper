def create_instance(module, class_name, init_params={}):
    class_obj = getattr(module, class_name)
    return class_obj(**init_params)
