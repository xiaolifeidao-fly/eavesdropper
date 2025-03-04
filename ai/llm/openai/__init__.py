from typing import Any, Dict, Generator, Optional, Sequence,AsyncGenerator


from lib.settings.configuration import config
from llm import LLM
from llama_index.llms.openai import OpenAI,Tokenizer
from llama_index.llms.types import (
    LLMMetadata
)

API_KEY = config.get("OPENAI", "api_key")

from llama_index.llms.openai_utils import (
    is_chat_model,
    is_function_calling_model,
    openai_modelname_to_contextsize,
)
class CustomOpenAI(OpenAI):

    @property
    def metadata(self) -> LLMMetadata:
        window_size = 32768 
        try:
            window_size = openai_modelname_to_contextsize(self._get_model_name())
        except:
            pass
        return LLMMetadata(
            context_window=window_size,
            num_output=self.max_tokens or -1,
            is_chat_model=True,
            is_function_calling_model=is_function_calling_model(
                model=self._get_model_name()
            ),
            model_name=self.model,
        )
    
    @property
    def _tokenizer(self) -> Optional[Tokenizer]:
        try:
            return super()._tokenizer() #type:ignore
        except:
            return None


class OpenAi(CustomOpenAI, LLM):

    def __init__(
        self,
        model: str = "gpt-3.5-turbo",
        temperature: float = 1.0,
        max_tokens: Optional[int] = None,
        additional_kwargs: Optional[Dict[str, Any]] = None,
        max_retries: int = 3,
        timeout: float = 60.0,
        reuse_client: bool = True,
        default_headers: Optional[Dict[str, str]] = None,
        # base class
        system_prompt: Optional[str] = None,
        **kwargs: Any):
        api_base : Optional[str] = None
        try:
            api_base = config.get("OPENAI", "api_base")
        except:
            pass
        super(CustomOpenAI, self).__init__(
            model = model,
            temperature = temperature,
            max_tokens = max_tokens, 
            additional_kwargs = additional_kwargs,
            max_retries = max_retries,
            timeout = timeout,
            reuse_client = reuse_client,
            api_key = API_KEY,
            api_base = api_base,
            default_headers = default_headers,
            system_prompt = system_prompt,
            **kwargs
        )
    