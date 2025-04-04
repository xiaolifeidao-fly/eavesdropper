



import json
from typing import Any, List
from business import AiProcessor


class FillCategoryProcessor(AiProcessor):

    def build_prompt(self) -> str:
        return """
<title>
{title}
<properties>
{properties}
<targer>
请根据title,给出每个property对应的值是应该是什么
<result_style>
不要过程,只要最终的json数据
{result_style}
        """
    
    def rebuild_params(self, params : dict) -> dict:
        result_style : List[dict] = []
        params['result_style'] = '{"shortTitle" : ""}'
        properties : dict = params['properties']
        for p in properties:
            result_style.append({"code" : p['code'], "value" : ""})
        params['properties'] = json.dumps(properties, ensure_ascii=False)
        params['result_style'] = json.dumps(result_style, ensure_ascii=False)
        return params

    def process_response(self, response : Any) -> Any:
        if response is None:
            return None
        for r in response:
            if r['code'] == 'p-20000-226407184':
                r['value'] = {"value" : "-1", "text" : r['value']}
        return response


