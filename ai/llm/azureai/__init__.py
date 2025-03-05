import json
import requests
from llm import LLM
from lib.settings.configuration import config
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.llms.types import ChatMessage, ChatResponse,ChatResponseGen


API_KEY = config.get("AZURE_AI", "api_key")
api_base = config.get("AZURE_AI", "api_base")
import json
from typing import Any, Dict, Generator, Optional, Sequence
from llama_index.llms import AzureOpenAI
from llama_index.llms.types import (
    ChatMessage,
    ChatResponse,
    MessageRole,
)
import requests

def parse_stream_helper(line) :
            if line:
                if line.strip() == b"data: [DONE]":
                    # return here will cause GeneratorExit exception in urllib3
                    # and it will close http connection with TCP Reset
                    return 'DONE'
                if line.startswith(b"data: "):
                    line = line[len(b"data: "):]
                    return line.decode("utf-8")
                else:
                    return None
            return None

def gen(response) -> ChatResponseGen:
    content = ""
    for line in response.iter_lines():
        chunk_message = parse_stream_helper(line)
        if chunk_message == 'DONE':
            break
        if chunk_message is None:
            continue
        chunk_message_json = json.loads(chunk_message)
        if 'choices' not in chunk_message_json:
                continue
        choices = chunk_message_json['choices']
        if len(choices) == 0:
            continue
        choices_first = choices[0]
        if 'delta' not in choices_first:
            continue
        delta = choices_first['delta']
        if delta is None or len(delta) == 0:
            continue
        role = MessageRole.ASSISTANT
        if 'content' not in delta:
            continue
        content_delta = delta['content']
        content += content_delta
        additional_kwargs = {}
        yield ChatResponse(
            message=ChatMessage(
                role=role,
                content=content,
                additional_kwargs=additional_kwargs,
            ),
            delta=content_delta
        )
class CustomAzureOpenAI(AzureOpenAI):

    def _stream_chat(
        self, messages: Sequence[ChatMessage], **kwargs
    ) -> ChatResponseGen:
        response = self.request(messages, True)
        return gen(response)
    
    def request(self, messages: Sequence[ChatMessage], stream = False):
        azure_endpoint = self.azure_endpoint
        azure_deployment= self.azure_deployment
        api_version = self.api_version
        api_key = self.api_key
        message_json = {'stream':stream,"temperature":self.temperature}
        message_arrays = []
        for chat_message in messages:
            message_arrays.append({
                "role":chat_message.role.value,
                "content":chat_message.content
            })
        message_json['messages'] = message_arrays # type: ignore
        request_url = f"{azure_endpoint}/openai/deployments/{azure_deployment}/chat/completions?api-version={api_version}"
        return requests.post(request_url,headers={"api-key":api_key}, stream=True, json = message_json)
    
class CustomAzureWenxinAI(CustomAzureOpenAI):

    def _chat(self, messages: Sequence[ChatMessage], **kwargs: Any) -> ChatResponse:
        response = self.request(messages)
        response_json = response.json()
        result = response_json['result']
        return ChatResponse(
            message=result
        )

class AzureOpenAi(CustomAzureOpenAI, LLM):

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


class AzureWenxinAi(CustomAzureWenxinAI, LLM):

   def __init__(
        self,
        temperature: float = 1.0,
        timeout: float = 60.0,
        max_tokens: Optional[int] = None,
        # azure specific
        azure_deployment: Optional[str] = "ERNIE-Bot-turbo",
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