import json


def get_value(key, json_data):
    if key not in json_data:
        return None
    return json_data[key]


def is_json(obj):
    try:
        json.dumps(obj)
        return True
    except:
        return False


def get_json_by_re(response_text):
    message = extract_json_str(response_text)
    message = message.replace(" ", "")
    message = message.replace("\n", "")
    try:
        return json.loads(message)
    except:
        return None


def extract_json_str(message):
    start_array_index = message.find('[')
    end_array_index = message.rfind(']')
    start_json_index = message.find('{')
    end_json_index = message.rfind('}')
    if start_array_index >= 0 and (start_array_index < start_json_index or start_json_index == -1):
        return message[start_array_index:end_array_index + 1]
    if start_json_index >= 0 and (start_json_index < start_array_index or start_array_index == -1):
        return message[start_json_index:end_json_index + 1]
    return message
