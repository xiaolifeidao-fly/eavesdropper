

import json
from typing import Any
from business import AiProcessor


class SwitchValueProcessor(AiProcessor):

    def build_prompt(self) -> str:
        return """
<data>
{data}
<rule>
1.ori_data是正确的数据, 我们要补充target_data的code,修正value,以对应的correct_value为准
2.不改变target_data原有的长度
3.返回的数据中pid只能有一个
4.code和value值要对应的上
<result_style>
不要过程,只要最终的json数据
{result_style}
        """
    
    def rebuild_params(self, params : dict) -> dict:
         
        data = {
            "data" : json.dumps(params['data'], ensure_ascii=False),    
            "result_style" : json.dumps({
                "pid1" : {"target_data" : {"code" : "", "value" : ""}},
                "pid2" : {"target_data" : {"code" : "", "value" : ""}},
                "pid3" : {"target_data" : {"code" : "", "value" : ""}} 
            }, ensure_ascii=False)
        }
        return data
    
    def process_response(self, response : Any) -> Any:
        if(response is None):
            return None
        newResponse = []
        data_list = self.params['data']
        for data in data_list:
            pid = data['pid']
            ori_data_list = data['ori_data']
            first_data = ori_data_list[0]
            if(pid not in response):
                newResponse.append({
                    "pid" : pid,
                    "target_data" : {
                        "code" : first_data['code'],
                        "value" : first_data['correct_value']
                    }
                })
                continue
            ai_target_data = response[pid]['target_data']
            ai_target_data = self.fix_ai_value(first_data, ai_target_data, ori_data_list)
            newResponse.append({
                "pid" : pid,
                "target_data" : ai_target_data
            })
        return newResponse

    def fix_ai_value(self, first_data : dict, ai_target_data : dict, ori_data_list : list) -> dict:
        for ori_data in ori_data_list:
            if(str(ori_data['code']) == str(ai_target_data['code'])):
                ai_target_data['value'] = ori_data['correct_value']
                return ai_target_data
        ai_target_data['value'] = str(first_data['correct_value'])
        ai_target_data['code'] = str(first_data['code'])
        return ai_target_data