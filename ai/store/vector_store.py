
from llama_index.schema import BaseNode
from llama_index.vector_stores.types import (
    BasePydanticVectorStore,
    VectorStoreQuery,
    VectorStoreQueryMode,
    VectorStoreQueryResult,
)
from llama_index.vector_stores import QdrantVectorStore,VectorStoreQuery,VectorStoreQueryResult
from typing import Any, List, Optional
from lib.db import qdrant_db
from llama_index.schema import BaseNode, TextNode
from lib.utils import log

class RestVectorStoreQuery(VectorStoreQuery):

    filter_json = {}

class RestQdrantStore(QdrantVectorStore):

    collection_name: str

    def __init__(
        self,
        collection_name: str
    ) -> None:
        super().__init__(collection_name, url="", api_key="")

    def add(self, nodes: List[BaseNode], **add_kwargs: Any) -> List[str]:
        for node in nodes:
            result = qdrant_db.upsert(self.collection_name, node.id_, node.embedding, node.metadata)
            
            log.info("qdrant add node result: %s", result)
        return []


    def _collection_exists(self, collection_name: str) -> bool:
        return True
    
    def delete(self, ref_doc_id: str, **delete_kwargs: Any) -> None:
        result = qdrant_db.delete_vectors(self.collection_name, ref_doc_id)
        log.debug("qdrant delete node result: %s", result)

    def query(
        self,
        query: RestVectorStoreQuery,
        **kwargs: Any,
    ) -> VectorStoreQueryResult:
       if not query.alpha:
            query.alpha = 0.0
       filter = {}
       if hasattr(query, 'filter_json'):
           filter = query.filter_json
       response_json = qdrant_db.search_points(self.collection_name, query.query_embedding, filter=filter, top=query.similarity_top_k, score_threshold=query.alpha)
       result = response_json['result']
       vector_result = VectorStoreQueryResult([],[],[])
       if result is None or len(result) == 0 :
            return vector_result
       nodes = []
       similarities = []
       ids = []
       for r in result:
            node = TextNode()
            node.metadata = r['payload']
            node.id_ = r['id']
            nodes.append(node)
            similarities.append(r['score'])
            ids.append(r['id'])
       vector_result.nodes = nodes
       vector_result.ids = ids
       vector_result.similarities = similarities
       return vector_result