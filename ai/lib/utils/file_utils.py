import os
import shutil
import time


def copy(source_file, targer_file):
    shutil.copy2(source_file, targer_file)


def unpack_archive(zip_path, extract_to_folder):
    """
    使用shutil解压ZIP文件到指定文件夹。

    :param zip_path: ZIP文件的路径
    :param extract_to_folder: 解压到的目标文件夹
    """
    # 确保目标文件夹存在
    if not os.path.exists(extract_to_folder):
        os.makedirs(extract_to_folder)

    # 使用shutil.unpack_archive解压文件
    shutil.unpack_archive(zip_path, extract_to_folder)


def get_file_list(folder_path):
    file_list = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_list.append(os.path.join(root, file))
    return file_list


def get_file_names(folder_path):
    file_list = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_list.append(file)
    return file_list


def rename_files(folder_path, prefix):
    '''
    修改文件中所有文件的文件名

    参数：
    folder_path: 文件夹路径
    prefix: 新文件名前缀
    '''
    now_time = int(time.time())
    file_list = os.listdir(folder_path)
    index = 0
    for _, file_name in enumerate(file_list):
        file_extension = os.path.splitext(file_name)[1]  # 获取文件扩展名

        # 构造新的文件名
        new_name = f"{prefix}_{str(now_time)}_{index + 1}{file_extension}"

        # 拼接完整的路径
        old_path = os.path.join(folder_path, file_name)
        new_path = os.path.join(folder_path, new_name)
        print('------>', new_path)

        # 重命名文件
        os.rename(old_path, new_path)
        index += 1
