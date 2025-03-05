import os
import uuid
import requests

from lib.utils import log


def download(url : str, local_path : str) :
    if not os.path.exists(local_path):
        os.makedirs(local_path)
    file_path = f"{local_path}/{uuid.uuid4()}.wav"
    # 发送HTTP GET请求
    response = requests.get(url, stream=True)

    # 检查请求是否成功
    if response.status_code == 200:
        # 打开文件以写入二进制模式
        with open(file_path, 'wb') as f:
            # 写入内容到文件
            f.write(response.content)
        return file_path
    else:
        log.warn(f'下载失败，状态码：{response.status_code}')
        return None