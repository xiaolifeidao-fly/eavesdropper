import datetime
from typing import Generic, List, TypeVar
from lib.db.session_manager import get_session_instance
import lib.db.db_support as support
import inspect
from sqlalchemy import Column, String, text, DateTime, Boolean, BigInteger
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
from sqlalchemy.orm import scoped_session

class Page():
    total_num = 0
    data = []

    def __init__(self, total_num=0, data=[]):
        self.total_num = total_num
        self.data = data


class BaseEntity(Base):
    __abstract__ = True
    __tablename__ = "base"

    id = Column(BigInteger, primary_key=True)
    created_time = Column(DateTime)
    updated_time = Column(DateTime)
    created_by = Column(String)
    updated_by = Column(String)
    active = Column(Boolean)

    def __repr__(self):
        members = inspect.getmembers(self)
        result = []
        for k, v in members:
            if not k.startswith('__') and not inspect.ismethod(v):
                result.append('{}={!r}'.format(k, v))
        props = ', '.join(result)
        return self.__class__.__name__ + "(" + props + ")>"

    @classmethod
    def build_query(cls, sql, params, session : scoped_session):
        params = support.rebuild_params(sql, params)
        return session.query(cls).from_statement(text(sql)).params(params) # type: ignore

    @classmethod
    def list(cls, sql, params={}):
        with get_session_instance() as session: 
            return cls.build_query(sql, params, session).all()

    @classmethod
    def get_one(cls, sql, params={}):
        with get_session_instance() as session:  # type: ignore
            return cls.build_query(sql, params, session).first()

    @classmethod
    def find_by_id(cls, id):
        return cls.get_one(f"SELECT * FROM {cls.get_table_name()} WHERE id = :id", {'id': id})

    @classmethod
    def get_table_name(cls):
        return cls.__tablename__

    def to_dict(self):
        # 使用 vars() 获取对象的属性和属性值
        dict_json = {}
        attributes = dir(self)
        for attribute_name in attributes:
            if 'registry' == attribute_name or 'metadata' == attribute_name:
                continue
            attribute_value = getattr(self, attribute_name)
            if not attribute_name.startswith('__') and not attribute_name.startswith('_') and not callable(
                    attribute_value):
                if type(attribute_value) == datetime.datetime:
                    dict_json[attribute_name] = attribute_value.strftime('%Y-%m-%d %H:%M:%S')
                    continue
                dict_json[attribute_name] = attribute_value
        return dict_json

    @classmethod
    def page(cls, sql, params={}, page_index=1, page_size=10):
        total_num = cls.count_by_sub_sql(sql, params)
        if total_num == 0:
            return Page()
        offset = (page_index - 1) * page_size
        sql = f"{sql} limit {offset},{page_size}"
        data_list = cls.list(sql, params)
        return Page(total_num, cls.build_data_list(data_list))

    @classmethod
    def union_page(cls, sql, params={}, page_index=1, page_size=10):
        total_num = cls.count_by_sub_sql(sql, params)
        if total_num == 0:
            return Page()
        offset = (page_index - 1) * page_size
        sql = f"{sql} limit {offset},{page_size}"
        data_list = cls.union_list(sql, params)
        return Page(total_num, data_list)

    @classmethod
    def union_list(cls, sql, params):
        with get_session_instance() as session:
            params = support.rebuild_params(sql, params)
            query = text(sql).params(params)
            result = session.execute(query)
            columns = result.keys()
            rows = result.fetchall()
            return [dict(zip(columns, row)) for row in rows]

    @classmethod
    def build_data_list(cls, data_list) -> List:
        data_array = []
        for data in data_list:
            dict_result = data.to_dict()
            if dict_result is None:
                data_array.append(data)
                continue
            data_array.append(dict_result)
        return data_array

    @classmethod
    def count_by_sub_sql(cls, sql, params={}):
        with get_session_instance() as session:
            count_sql = f"SELECT COUNT(1) FROM ({sql}) as count_num"
            params = support.rebuild_params(sql, params)
            query = text(count_sql).params(params)
            result = session.execute(query)
            total_num = result.scalar()
            if total_num is None:
                return 0
            return int(total_num)

    @classmethod
    def count(cls, sql, params={}):
        with get_session_instance() as session:
            params = support.rebuild_params(sql, params)
            query = text(sql).params(params)
            result = session.execute(query)
            total_num = result.scalar()
            if total_num is None:
                return 0
            return int(total_num)

    def add(self):
        with get_session_instance() as session:
            self.init()
            session.add(self)
            session.commit()
            session.refresh(self)
            return self

    @classmethod
    def add_all(cls, objects):
        for obj in objects:
            obj.init()
        with get_session_instance() as session:
            session.add_all(objects)
            session.commit()
            for obj in objects:
                session.refresh(obj)
        return objects

    def update(self):
        with get_session_instance() as session:
            merged_obj = session.merge(self)
            session.commit()
            session.refresh(merged_obj)
            return self
    
    @classmethod
    def batch_insert(cls, list : List):
        with get_session_instance() as session:
            session.bulk_save_objects(list)
            session.commit()
        result : List[cls] = list 
        return result

    @classmethod
    def delete_by_id(cls, id):
        table_name = cls.get_table_name()
        cls.execute(f"DELETE FROM {table_name} WHERE id = :id", {'id': id})

    @classmethod
    def delete_by_id_in(cls, ids):
        if len(ids) > 0:
            cls.execute(f"DELETE FROM {cls.get_table_name()} WHERE id in :ids", {'ids': ids})

    @classmethod
    def get_all(cls):
        table_name = cls.get_table_name()
        sql = f"select * from {table_name}"
        return cls.list(sql, {})

    def init(self):
        self.active = True
        now_time = datetime.datetime.now()
        if not self.created_time:  # type: ignore
            self.created_time = now_time
        if not self.updated_time:  # type: ignore
            self.updated_time = now_time

    @classmethod
    def execute(cls, sql, params={}):
        with get_session_instance() as session:
            params = support.rebuild_params(sql, params)
            session.execute(text(sql), params)
            session.commit()
