from abc import ABC
from typing import List, Optional

from lib.utils import json_utils


from llama_index.llms.types import ChatMessage, ChatResponse,MessageRole

from lib.utils import log

from llama_index.llms.llm import LLM as LLAMA_LLM
class ChatRequest():

    history : List[ChatMessage] = []
    
    def __init__(self, user_input = None, history : List[ChatMessage] = []):
        self.user_input = user_input
        self.history = history

class StreamChatCallback(ABC):

   def handler_message(self, message, index, end_flag) -> bool:
        return False
   
   def allow_split_config(self):
        return {}
   
   def do_finally(self, all_message):
        pass
   
class StreamChatRequest(ChatRequest):
    sub_allow_min = 15
    sub_wait_max = 100
    start_char = None
    end_char = None
    split_char = None
    split_config = {}
    stream_chat_callback : StreamChatCallback

    def __init__(self, stream_chat_callback) -> None:
        self.stream_chat_callback = stream_chat_callback
        self.split_config = stream_chat_callback.allow_split_config()
        
class LLM(LLAMA_LLM):

    history : List[ChatMessage] = []

    def update_system_prompt(self, system_prompt):
        self.system_prompt = system_prompt
        
    def build_message(self, request:Optional[ChatRequest] = None):
        chat_message = []
        if self.system_prompt:
            chat_message.append(ChatMessage(role=MessageRole.SYSTEM, content=self.system_prompt))
        if request and request.history is not None:
            self.history = request.history
        chat_message = self.history + chat_message
        if request and request.user_input:
            chat_message.append(ChatMessage(content=request.user_input))
        return chat_message
    
    def chat_message(self, request : Optional[ChatRequest] = None) -> ChatResponse:
        chat_messages = self.build_message(request)
        return self.chat(chat_messages)

    def stream_chat_message(self, request : StreamChatRequest):
        try:
            stream_handler = StreamHandler(request)
            chat_messages = self.build_message(request)
            chat_response_list = self.stream_chat(chat_messages)
            for chat_response in chat_response_list:
                self.do_handler_stream_response(stream_handler, chat_response)
            stream_handler.do_tail()
        finally:
            request.stream_chat_callback.do_finally(stream_handler.all_message)
        log.info("StreamChatAi response message: %s", stream_handler.all_message)

    def do_handler_stream_response(self, stream_chat, chat_stream_response):
        stream_chat.do_handler(chat_stream_response)

    def extract_json(self, response)  :
        response_text = self.response_to_str(response)
        if response_text is None:
            return None
        return json_utils.get_json_by_re(response_text)
    
    def response_to_str(self, chat_response : ChatResponse) -> str:
        if chat_response:
            return str(chat_response.message.content)
        return ""
    
class StreamHandler():
    all_message = ''
    continue_flag = True
    temp_sub_message = ''
    assistant_text = []
    chunk_message_split_index = 0
    recv_start = False
    recv_end = False
    is_handler = False
    chunk_messages=''
    retry_num = 3
    current_retry_index = 0

    def __init__(self, request):
        self.request = request

    # def retry(self):
    #     user_input = self.request.user_input
    #     if user_input is not None and len(user_input) > 0:
    #        user_content = self.request.build_user_content(user_input)
    #        self.assistant_text.append(user_content)
    #     if self.all_message is not None and len(self.all_message) > 0:
    #         assistant_content = self.request.build_assistant_content(self.all_message)
    #         self.assistant_text.append(assistant_content)
    #         self.request.user_input = '继续'
    #     self.current_retry_index += 1
    #     response = self.chat_llm.chat_complete()
    #     self.request.user_input = user_input
    #     return response
    
    def is_allow_split_index(self, index):
        return index in self.request.split_config

    def handler_sub_message(self, message, index, end_flag):
        try:
            self.continue_flag = self.request.stream_chat_callback.handler_message(message, index, end_flag) 
        except Exception as e:
            self.continue_flag = False
            log.error('handler_sub_message error: %s',  str(e))
        
    def is_sub_split(self, index, message):
        sub_split = self.get_sub_split(index)
        if sub_split is None or sub_split == '':
            return False
        return True
    def get_sub_split(self, index):
        if self.is_allow_split_index(index) == False:
            return None
        sub_split_config =  self.request.split_config[index]
        sub_split_configs = sub_split_config.split("|")
        for split_message in sub_split_configs:
            if self.chunk_messages.find(split_message) > 0:
                return split_message
        return sub_split_configs[0]
    
    def inc_chunk_message_split_index(self):
        self.chunk_message_split_index+=1

    def handler(self, message, index, end_flag):
         if self.is_sub_split(index, message):
            sub_split = self.get_sub_split(index)
            split_message = message.split(sub_split)
            end_with_flag = message.endswith(sub_split)
            sub_index = 0
            for sub_message in split_message:
                sub_index += 1
                if sub_message is None or sub_message == '':
                     continue
                if (end_with_flag == False and sub_index == len(split_message)) == False:
                    sub_message = sub_message + sub_split;
                sub_message = self.temp_sub_message + sub_message
                if (self.is_allow_split_index(index) and len(sub_message) < self.request.sub_allow_min) or end_flag:
                    self.temp_sub_message = sub_message
                    continue
                self.temp_sub_message = ''
                self.handler_sub_message(sub_message, index, end_flag)
            if end_flag and self.temp_sub_message != '':
               self.handler_sub_message(self.temp_sub_message, index, end_flag)
         else:
            self.handler_sub_message(message, index, end_flag)

    def is_continue(self):
        return self.continue_flag

    def push_message(self, message):
        self.all_message += message

    def do_tail(self):
        if self.temp_sub_message != '':
            log.info("do_tail temp_sub_message")
            self.request.stream_chat_callback.handler_message(self.temp_sub_message, self.chunk_message_split_index, True)
        if self.chunk_messages != '':
            log.info("do_tail chunk_messages")
            self.request.stream_chat_callback.handler_message(self.chunk_messages, self.chunk_message_split_index, True)


    def do_handler(self, chunk : ChatResponse):
        #     response = self.chat_llm.chat_complete()
        #     self.chat_llm.do_handler_response(response)
        #     self.do_tail()
        # except Exception as e:
        #     log.error('async_request_gpt error: %s',  str(e))
        #     if self.is_continue() == False :
        #         return
        #     error_flag = False
        #     while self.current_retry_index < self.retry_num:
        #         try:
        #             if self.is_continue() == False :
        #                 return
        #             response = self.retry()
        #             self.chat_llm.do_handler_response(response)
        #             error_flag = True
        #             self.do_tail()
        #         except Exception as e:
        #             if error_flag:
        #                 self.current_retry_index = 0
        #             log.error('StreamChatAi again error: %s',  str(e))
        self.handler_message(chunk)
           


    def handler_message(self, chunk : ChatResponse):
        start_char = self.request.start_char
        end_char = self.request.end_char
        split_char = self.request.split_char
        if self.recv_end == True:
            return
        if self.is_continue() == False:
            return
        chunk_message = chunk.delta
        # self.chat_llm.get_chunk_message(chunk)
        if chunk_message is None or chunk_message == '':
            return
        self.push_message(chunk_message)
        self.chunk_messages += chunk_message
        if self.recv_start == False:
            if start_char is None:
                self.recv_start = True
            else:
                start_data = self.get_start(self.chunk_messages)
                if start_data is not None:
                    self.recv_start = True
                    self.chunk_messages = start_data
        if self.recv_start == False:
            return

        if split_char is not None and split_char in self.chunk_messages:
            data_array = self.chunk_messages.split(split_char)
            split_data_index = 1
            end_with_split = self.chunk_messages.endswith(split_char)
            split_lenth = len(data_array)

            for split_data in data_array:
                if split_data_index == split_lenth:
                    self.chunk_messages = split_data
                    break
                end_flag = False
                if end_with_split and split_data_index == split_lenth - 1: 
                    end_flag = True
                self.handler(split_data, self.chunk_message_split_index, end_flag)
                # stream_message.handler(split_data, chunk_message_split_index, end_flag)
                self.inc_chunk_message_split_index()
                self.is_handler = True
                split_data_index += 1
                self.chunk_messages = ''
            end_data = self.get_end(self.chunk_messages)
            if end_data is not None:
                self.recv_end = True
                self.handler(end_data, self.chunk_message_split_index, True)
                # stream_message.handler(end_data, chunk_message_split_index, True)
                self.is_handler = True
            return
        sub_split = self.get_sub_split(self.chunk_message_split_index)
        if  self.is_allow_split_index(self.chunk_message_split_index) and (end_char is not None and end_char in self.chunk_messages) == False:
            if self.chunk_messages.find(str(sub_split)) < 0 and len(self.chunk_messages + self.temp_sub_message) < self.request.sub_wait_max:
                return
            self.handler(self.chunk_messages, self.chunk_message_split_index, False)
            self.chunk_messages = ''
            
        if end_char is not None and end_char in self.chunk_messages:
            end_data = self.get_end(self.chunk_messages)
            if end_data is not None:
                # 如果找到了 ]end，则把 ]end 及之后的部分截掉，并且特殊处理最后一组数据
                self.recv_end = True
                self.handler(end_data, self.chunk_message_split_index, True)
                # stream_message.handler(end_data, chunk_message_split_index, True)
                self.is_handler = True

    def get_start(self, ori_data):
        if self.request.start_char is None:
            return None
        start_index = ori_data.find(self.request.start_char) 
        if start_index  < 0:
            return None
        if start_index == len(ori_data):
            return ''
        return ori_data[(start_index + len(self.request.start_char)):]

    def get_end(self, ori_data):
        end_index = ori_data.find(self.request.end_char) 
        if end_index < 0:
            return None
        if end_index == 0:
            return ''
        return ori_data[:end_index]