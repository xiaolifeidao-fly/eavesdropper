import requests

from lib.settings.configuration import config
from lib.utils import log

# app_code = config.get("VOICE", "voice_app_code")
# app_key = config.get("VOICE", "voice_app_key")
# host = config.get("VOICE", "host")

transfer_host = config.get("TRANSFER", "host")


# def request(request_record_id, voice_url) -> bool:
#     data = {
#         "requestId": request_record_id,
#         "appCode": app_code,
#         "appKey": app_key,
#         "voiceUrl": voice_url,
#         "type": "speechFileTranscriberLite"
#     }
#     url = f"{host}/simple-voice-stt/stt"
#     log.info(f"Requesting voice {url}, data: {data}")
#     response = requests.post(url, json=data)
#     log.info(f'voice_transfer response: {response.json()}')
#     if response.status_code != 200:
#         return False
#     return True


def request(tenant_id, request_record_id, voice_url) -> bool:
    data = {
        "request_id": request_record_id,
        "tenant_id": tenant_id,
        "voice_url": voice_url
    }
    url = f"{transfer_host}/voice/recognized"
    log.info(f"Requesting transfer {url}, data: {data}")
    response = requests.post(url, json=data)
    if response.status_code != 200:
        log.info(f'transfer response: {response}')
        return False
    log.info(f'transfer response: {response.json()}')
    return True
