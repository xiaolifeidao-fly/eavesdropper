#!/bin/bash

# 脚本名称：run_goctl.sh

API_FILE=$1
TARGET_DIR=$2

# 检查参数
if [ -z "$API_FILE" ] || [ -z "$TARGET_DIR" ]; then
    echo "Usage: $0 <api_file> <target_dir>"
    exit 1
fi

# 检查 goctl 是否安装
if ! command -v goctl &> /dev/null; then
    echo "Error: goctl is not installed or not in PATH."
    exit 1
fi

# 检查 API 文件是否存在
if [ ! -f "$API_FILE" ]; then
    echo "Error: $API_FILE file not found."
    exit 1
fi

# 执行 goctl 命令
echo "Running: goctl api go -api $API_FILE -dir $TARGET_DIR"
goctl api go -api "$API_FILE" -dir "$TARGET_DIR"

# 检查命令执行状态
if [ $? -eq 0 ]; then
    echo "Command executed successfully!"
else
    echo "Error: Command failed."
    exit 1
fi