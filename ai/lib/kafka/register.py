from lib.utils import reflection_utils, scan_utils

consumers = {

}


def run(folder_paths):
    # 初始化
    for folder_path in folder_paths:
        clazz_array = scan_utils.get_scan_cls(folder_path, "topic_name")
        for clazz_config in clazz_array:
            module = clazz_config['module']
            clazz = clazz_config['value']
            instance = reflection_utils.create_instance(module, clazz.__name__)
            instance.init()
            topic_name = instance.topic_name
            if topic_name not in consumers:
                consumers[topic_name] = instance
                instance.start()
