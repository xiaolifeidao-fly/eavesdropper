#!/bin/bash

# 设置应用的目录路径
remote_path="/data/program/app/kakrolot/kakrolot-web"
cluster_name="cluster1"
app_name="kakrolot-web-0.0.1-SNAPSHOT.jar"
app_path="$remote_path/$cluster_name"

# 步骤 1: 使用 lsof 查找进程，筛选出在特定目录下运行的进程，并只获取第一条
pid=$(lsof +D "$app_path" |grep "$app_name" | awk '{print $2}' | grep -v "^PID" | head -n 1)

# 步骤 2: 如果找到 PID，则杀掉进程
if [ -n "$pid" ]; then
    echo "Found process with PID: $pid"
    kill -9 $pid
    echo "Process $pid [${app_path}/${app_name}] killed."
else
    echo "No process found for directory: $app_path/$app_name"
fi
