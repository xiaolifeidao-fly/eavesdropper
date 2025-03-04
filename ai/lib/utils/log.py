from datetime import datetime
import logging
from logging.handlers import TimedRotatingFileHandler
from lib.settings.configuration import config
import os


def create_log_path():
    # 检查文件是否存在，如果不存在则创建
    if not os.path.isfile(file_path):
        # 确保所属文件夹存在，如果不存在则创建
        folder_path = os.path.dirname(file_path)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)


file_path = config.get("LOGGER", "file_name")
# 配置日志记录器
create_log_path()

log_file = f"{file_path}app_{datetime.now().strftime('%Y-%m-%d')}.log"

logger = logging.getLogger()
format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
formatter = logging.Formatter("%(asctime)s - %(levelname)s: %(message)s")

logger.setLevel(logging.INFO)
# 设置将日志输出到文件中，并且定义文件内容
log_handler = TimedRotatingFileHandler(log_file, when="midnight", interval=1, backupCount=7)
log_handler.setLevel(logging.INFO)
log_handler.setFormatter(formatter)
controlshow = logging.StreamHandler()
controlshow.setLevel(logging.INFO)
# 设置日志的格式
controlshow.setFormatter(formatter)
logger.addHandler(log_handler)
logger.addHandler(controlshow)


def info(msg, *args, **kwargs):
    logger.info(msg, *args, **kwargs)


def error(msg, *args, **kwargs):
    logger.error(msg, *args, **kwargs)


def debug(msg, *args, **kwargs):
    logger.debug(msg, *args, **kwargs)


def exception(msg, *args, **kwargs):
    logger.exception(msg, *args, **kwargs)


def warn(msg, *args, **kwargs):
    logger.warn(msg, *args, **kwargs)
