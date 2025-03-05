



import json
from typing import List
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



