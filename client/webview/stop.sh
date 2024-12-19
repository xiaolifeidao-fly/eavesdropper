#!/bin/bash

# 端口号
PORT=8899

# 查找监听指定端口的进程ID (PID)
PID=$(lsof -ti :$PORT)

# 检查是否找到了进程ID
if [ -z "$PID" ]; then
  echo "No process is listening on port $PORT"
else
  # 停止进程
  kill $PID
  echo "Stopped process $PID that was listening on port $PORT"
fi