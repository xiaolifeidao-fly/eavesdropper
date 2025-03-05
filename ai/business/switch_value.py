

import json
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
