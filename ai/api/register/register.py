from api.register.application import app, namespaces
from lib.utils import scan_utils


def run():
    scan_utils.scan(["api.handler"])

    for key, namespace in namespaces.items():
        app.register_blueprint(namespace)
