
from flask import request

from business import answer
from api.register.application import get_namespace, success, error
from lib import tenant_context
from lib.utils import log

namespace = get_namespace()



@namespace.route('/chat', methods=['POST'])
def chat():
    try:
        body_data = request.json
        if body_data is None:
            return error('无请求数据')
        log.info("start chat %s", body_data)
        sence_name = "";
        if 'sence_name' in body_data:
            sence_name = body_data['sence_name']
        params = body_data['params']
        response = answer.answer(sence_name, params)
        return success(response)
    except Exception as e:
        log.error("回答失败 %s", e)
        return error('发生未知异常')
    
