import time
import requests
from lib.utils import log
from lib.settings.configuration import config
from llama_index.embeddings.base import BaseEmbedding, Embedding
from typing import Any, Coroutine, List, Optional

url = config.get("BGE", "url")


class BgeEmbed(BaseEmbedding):

    def _get_text_embedding(self, text: str) -> List[float]:
        """Get text embedding."""
        start_time = time.time()
        text = text.replace("\n", " ")
        data = {
            "data": text,
        }
        api = "/bge/em"
        response = requests.post(url+api, json=data)
        embedding_value = {}
        # log.debug('request bge embedding response time: %s',  time.time() - start_time)
        if response.status_code == 200:
            response_json = response.json()
            embedding_value = response_json['data']  # type: ignore
        return list(embedding_value)
    
    async def _aget_query_embedding(self, query: str) -> Embedding:
        return []
    
    def _get_query_embedding(self, query: str) -> Embedding:
        return self._get_text_embedding(query)

