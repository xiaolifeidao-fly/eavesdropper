import os
import importlib


def has_decorator(attr, decorator_name):
    if hasattr(attr, decorator_name):
        return True
    else:
        return False


def scan(folder_paths):
    for folder_path in folder_paths:
        folder_path = folder_path.replace(".", "/")
        # 列出文件夹中的所有 Python 文件
        py_files = [f for f in os.listdir(folder_path) if f.endswith('.py')]
        # 导入每个 Python 文件并获取其中的类和方法
        for file_name in py_files:
            # 构建完整的模块名称
            module_name = f'{folder_path}.{file_name[:-3]}'.replace("/", ".")  # 去除文件扩展名
            module = importlib.import_module(module_name)


def get_scan_cls(folder_path, decorator_name):
    scan_result = []
    folder_path = folder_path.replace(".", "/")
    # 指定包含 Python 文件的文件夹路径

    # 列出文件夹中的所有 Python 文件
    py_files = [f for f in os.listdir(folder_path) if f.endswith('.py')]

    # 导入每个 Python 文件并获取其中的类和方法
    for file_name in py_files:
        # 构建完整的模块名称
        module_name = f'{folder_path}.{file_name[:-3]}'.replace("/", ".")  # 去除文件扩展名
        module = importlib.import_module(module_name)
        # 获取模块中的所有成员（类、函数等）
        members = dir(module)
        # 打印类和方法的信息
        for member in members:
            # 这里假设你关注的是类和方法，可以根据需要添加其他条件
            value = getattr(module, member)
            if not (callable(value) or isinstance(value, type)):
                continue
            if not has_decorator(value, decorator_name):
                continue
            scan_result.append({"module": module, "value": value})
    return scan_result


def get_scan_func(folder_path, decorator_name):
    scan_result = []
    folder_path = folder_path.replace(".", "/")
    # 指定包含 Python 文件的文件夹路径

    # 列出文件夹中的所有 Python 文件
    py_files = [f for f in os.listdir(folder_path) if f.endswith('.py')]

    # 导入每个 Python 文件并获取其中的类和方法
    for file_name in py_files:
        # 构建完整的模块名称
        module_name = f'{folder_path}.{file_name[:-3]}'.replace("/", ".")  # 去除文件扩展名
        module = importlib.import_module(module_name)
        # 获取模块中的所有成员（类、函数等）
        members = dir(module)
        # 打印类和方法的信息
        for member in members:
            # 这里假设你关注的是类和方法，可以根据需要添加其他条件
            value = getattr(module, member)
            if not (callable(value) or isinstance(value, type)):
                continue
            if not has_decorator(value, decorator_name):
                continue
            scan_result.append({"module": module, "value": value})
    return scan_result
