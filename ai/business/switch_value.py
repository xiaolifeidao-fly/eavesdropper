

import json
from business import AiProcessor


class SwitchValueProcessor(AiProcessor):

    def build_prompt(self) -> str:
        return """
<data>
{data}
<rule>
1.ori_data是正确的数据, 请修正target_data, 使其符合ori_data的规则
2.修正后的target_data数组长度和原有的target_data数组长度一致
<result_style>
不要过程,只要最终的json数据
{result_style}
        """
    
    def rebuild_params(self, params : dict) -> dict:
         
        data = {
            "data" : json.dumps(params['data'], ensure_ascii=False),    
            "result_style" : json.dumps([{
                "pid" : "",
                "target_data" : [{"code" : "", "correct_value" : ""}]
            }], ensure_ascii=False)
        }
        return data
