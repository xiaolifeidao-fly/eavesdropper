from typing import List, Optional

from business.switch_value import SwitchValueProcessor
from business.fill_category import FillCategoryProcessor


def answer(sence_name: str, params : dict) -> Optional[dict] | List[dict]:
    if(sence_name == "fill_category"):
        processor = FillCategoryProcessor(params)
        return processor.process()
    elif(sence_name == "switch_value"):
        processor = SwitchValueProcessor(params)
        return processor.process()
    return None
