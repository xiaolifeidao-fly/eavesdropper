
import json
import subprocess
from lib.utils import log

def switch(input_file : str, output_file : str, sample_rate : int, channels : str = "2"):
    # 构建ffmpeg命令
    cmd = [
        'ffmpeg',
        '-i', input_file,              # 输入文件
        '-ar', str(sample_rate),       # 设置音频采样率
        '-ac', channels,                    # 保持立体声道
        output_file                     # 输出文件
    ]
    # 运行ffmpeg命令
    try:
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        log.error("Switch voice error ", e)
        return False