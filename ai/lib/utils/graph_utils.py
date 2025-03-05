import re
from typing import List


class PathNode():
    source_name: str
    edge: str
    target_nane: str

    def __init__(self, source_name, edge, target_nane):
        self.source_name = source_name
        self.edge = edge
        self.target_nane = target_nane


def path_to_node(path_data) -> List[PathNode]:
    # 定义一个空的列表来存储结构化的数据
    structured_data = []
    # 给定的字符串数据
    # 使用正则表达式提取每个节点和关系
    pattern = r'\[:(.*?)\s*"(.*?)"->"(.*?)"\s*@(.*?)\s*{relationship:\s*"(.*?)"}\]'
    matches = re.findall(pattern, path_data)
    # 遍历每个匹配项，并将其转化为结构化数据
    for match in matches:
        relationship_type, source, target, identifier, additional_info = match
        path_node = PathNode(source, additional_info, target)
        # 将构造的数据添加到结构化数据列表中
        structured_data.append(path_node)
    return structured_data
