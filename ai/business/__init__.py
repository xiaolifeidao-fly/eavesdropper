
from typing import Optional
from llm.openai import OpenAi
from lib.utils import log
from typing import List,Optional

from llama_index.prompts import PromptTemplate
from llama_index.llms.types import ChatMessage
from lib.utils import log
from abc import abstractmethod
from lib.settings.configuration import config
model = config.get("TBK", "model")



llm = OpenAi(model=model, temperature=1.0, timeout=60)
class AiProcessor:

    def __init__(self, params : dict):
        self.params = params

    def process(self) -> Optional[dict] | List[dict]:
        try:
            return self.do_ai()
        except Exception as e:
            log.error("AiProcessor process error %s", e)

    def rebuild_params(self, params : dict) -> dict:
        return params

    @abstractmethod
    def build_prompt(self) -> str:
        pass
    
    def do_ai(self) -> List[dict] | dict | None:
        log.info("do ai params is %s", self.params)
        rag_prompt_template = PromptTemplate(
                                    template=self.build_prompt(),
                                    **self.rebuild_params(self.params))
        rag_messages : List[ChatMessage] = rag_prompt_template.format_messages()
        log.info("rag prompt is %s", rag_messages[0].content)
        chat_response = llm.chat(rag_messages) # type: ignore
        log.info("rag response is %s", chat_response.message.content)
        response = llm.extract_json(chat_response)
        if response is None:
            return None
        return response

