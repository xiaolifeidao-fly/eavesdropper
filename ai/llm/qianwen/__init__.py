from llm import LLM
from llm.azureai import CustomAzureOpenAI
from lib.settings.configuration import config
from llama_index.llms.types import (
    ChatMessage,
    ChatResponseGen,
    MessageRole,
)
API_KEY = config.get("QIANWEN", "api_key")
import json
from typing import Any, Dict, Generator, Optional, Sequence
from llama_index.llms.openai import Tokenizer
from llama_index.llms.types import (
    ChatMessage,
    ChatResponse,
    MessageRole,
)
API_KEY = config.get("AZURE_AI", "api_key")
api_base = config.get("AZURE_AI", "api_base")

class QianWenAi(CustomAzureOpenAI, LLM):


    def __init__(
        self,
        temperature: float = 1.0,
        timeout: float = 30.0,
        max_tokens: Optional[int] = None,
        # azure specific
        azure_deployment: Optional[str] = "gpt35-16k",
        use_azure_ad: bool = False,
        api_version : str = "2024-02-15-preview", 
        # aliases for engine
        # custom httpx client
        # base class
        system_prompt: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        super(CustomAzureOpenAI, self).__init__(
            max_tokens=max_tokens,
            api_base= api_base,
            azure_deployment=azure_deployment,
            engine=azure_deployment,
            use_azure_ad = use_azure_ad,
            temperature=temperature,
            azure_endpoint=api_base,
            timeout = timeout,
            api_key=API_KEY, 
            system_prompt=system_prompt,
            api_version = api_version,
            **kwargs
        )

    def _chat(self, messages: Sequence[ChatMessage], **kwargs: Any) -> ChatResponse:
        response = self.request(messages)
        response_json = json.loads(response.content)
        result_message = response_json['output']['choices'][0]['message']['content'] #type:ignore
        return ChatResponse(message=ChatMessage(role=MessageRole.ASSISTANT,content=result_message))
        
    def to_json_messages(self, messages: Sequence[ChatMessage]):
        json_messages = []
        for message in messages:
            json_messages.append({
                "role": message.role.name.lower(),
                "content": message.content
            })
        return json_messages

       

    def _stream_chat(self, messages: Sequence[ChatMessage], **kwargs: Any) -> ChatResponseGen:
        return super()._stream_chat(messages, **kwargs)


    @property
    def _tokenizer(self) -> Optional[Tokenizer]:
        try:
            return super()._tokenizer() #type:ignore
        except:
            return None