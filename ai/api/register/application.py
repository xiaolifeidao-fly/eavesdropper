import uuid

from flask import Blueprint, Flask, jsonify

app = Flask(__name__, static_folder='static')

namespaces = {

}


def get_namespace(name=None):
    if name is None or name == '':
        name = str(uuid.uuid4())
    if name in namespaces:
        return namespaces[name]
    bp = Blueprint(name, __name__)
    namespaces[name] = bp
    return bp


def success(data):
    return jsonify({
        "code": 0,
        "data": data
    })


def error(error):
    return jsonify({
        "code": 1,
        "error": error
    })
