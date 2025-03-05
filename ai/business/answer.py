from typing import List, Optional

from business.fill_category import FillCategoryProcessor


def answer(sence_name: str, params : dict) -> Optional[dict] | List[dict]:
    processor = FillCategoryProcessor(params)
    if(sence_name == "fill_category"):
        return processor.process()
    return None