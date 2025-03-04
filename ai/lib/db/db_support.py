import copy

from sqlalchemy.sql import bindparam


def rebuild_params(sql, params):
    delete_keys = []
    for key in params.keys():
        if sql.find(":" + key) < 0:
            delete_keys.append(key)
    if len(delete_keys) == 0:
        return params
    new_params = copy.copy(params)
    for delete_key in delete_keys:
        new_params.pop(delete_key)
    return new_params


def bind_params(stmt, params):
    if params is None or len(params) == 0:
        return stmt
    for key, value in params.items():
        if isinstance(value, list):
            stmt = stmt.bindparams(bindparam(key, expanding=True))
    return stmt
