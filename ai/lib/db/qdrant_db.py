import json
import uuid

import requests

import lib.utils.log as log
from lib.settings.configuration import config

host = config.get("QDRANT", "host")
url = config.get("QDRANT", "url")


def insert_qdrant(collection_name, vector_content, payload):
    uuid_str = str(uuid.uuid1())
    data = {
        "points": [
            {
                "id": uuid_str,
                "vector": vector_content,
                "payload": payload
            }
        ]
    }
    headers = get_header(data)

    response = requests.put(
        url + "/collections/"+collection_name+"/points", headers=headers, json=data)
    result = response.json()
    return result


def upsert(collection_name, uuid_str, vector_content, payload):
    data = {
        "points": [
            {
                "id": uuid_str,
                "vector": vector_content,
                "payload": payload
            }
        ]
    }
    headers = get_header(data)
    # log.info('insert_update_qdrant request: url=%s', url +
    #          "/collections/"+collection_name+"/points")
    # log.info('insert_update_qdrant request: data=%s', data)
    # log.info('insert_update_qdrant request: header=%s', headers)
    response = requests.put(
        url + "/collections/"+collection_name+"/points", headers=headers, json=data)
    return response.json()


def batch_insert_qdrant(collection_name, points):
    data = {
        "points": points
    }
    headers = get_header(data)
    response = requests.put(
        url + "/collections/"+collection_name+"/points", headers=headers, json=data)
    result = response.json()
    log.debug('insert_update_qdrant response:  %s', result)


def delete_vectors(collection_name, id):
    headers = {'Content-Type': 'application/json'}
    if isinstance(id, int):
        id = int(id)
    if isinstance(id, str):
        id = str(id)
    data = {'points': [id]}
    log.debug('delete_vectors request: url=%s, headers=%s, body=%s',
             url + "/collections/"+collection_name+"/points/delete", headers, data)
    response = requests.post(
        url + "/collections/"+collection_name+"/points/delete", headers=headers, json=data)
    log.debug('delete_vectors response:  %s', response.text)
    result = response.json()
    return result


def search_points(collection_name, search_vector_content, filter={}, top=1, score_threshold : float=0.0):
    data = {
        "vector": search_vector_content,
        "filter": filter,
        "top": top,
        "score_threshold": score_threshold,
        "with_payload": True
    }
    headers = get_header(data)
    response = requests.post(
        url + "/collections/"+collection_name+"/points/search", headers=headers, json=data)
    result = response.json()
    return result


def count_points(collection_name, filter={}):
    data = {
        "filter": filter,
        "exact": True
    }
    headers = get_header(data)
    response = requests.post(
        url + "/collections/"+collection_name+"/points/count", headers=headers, json=data)
    result = response.json()
    return result['result']['count']


def scroll_points(collection_name, filter={}, limit=None, with_payload=False, with_vector=False):
    if limit is None:
        limit = 10000

    data = {
        "filter": filter,
        "limit": limit,
        "with_payload": with_payload,
        "with_vector": with_vector
    }
    headers = get_header(data)
    response = requests.post(
        url + "/collections/"+collection_name+"/points/scroll", headers=headers, json=data)
    result = response.json()
    return result['result']['points']


def update_point(collection_name, data={}):
    headers = get_header(data)
    response = requests.post(
        url + "/collections/"+collection_name+"/points/payload", headers=headers, json=data)
    result = response.json()


def get_header(data):
    headers = {
        "Content-Length": str(len(json.dumps(data))),
        "Host": host,
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Content-Type": "application/json"
    }
    return headers
