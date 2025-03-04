import threading

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

from lib.settings.configuration import config
from lib.utils import log, memory_context

section = "DATABASE"


# 定义一个上下文管理器，用于简化 session 管理
class SessionManager:
    def __init__(self, engine):
        self.Session :scoped_session = scoped_session(sessionmaker(bind=engine))

    def __enter__(self):
        session : scoped_session = self.Session()
        memory_context.put("current_session", session)
        return session

    def __exit__(self, exc_type, exc_val, exc_tb):
        current_thread = threading.current_thread()
        session = memory_context.get('current_session')
        if session is None:
            return
        try:
            if exc_type:
                session.rollback()
        except Exception as e:
            log.error(f"Current thread name: {current_thread.name} Exception during rollback: {e}")
        finally:
            memory_context.remove_value("current_session");
            try:
                session.close()
            except Exception as e:
                log.error(f"Current thread name: {current_thread.name} Exception during close: {e}")
        return exc_type is None


def build_engine():
    host = config.get(section, "host")
    user = config.get(section, "username")
    port = config.getint(section, "port")
    password = config.get(section, "password")
    database = config.get(section, "database")
    return create_engine('mysql+pymysql://%s:%s@%s:%s/%s?charset=utf8'
                         % (user, password, host, port, database), pool_size=20, max_overflow=40, pool_recycle=300,
                         pool_pre_ping=True)


def init():
    engine = build_engine()
    return SessionManager(engine)


session_instance = init()


def get_session_instance():
    return session_instance
