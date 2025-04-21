#!/bin/bash

# 从环境变量获取配置
remote_server="root@$eavesdropper_admin_webview_remote_server"
remote_password="$eavesdropper_admin_webview_remote_password"
remote_path="/data/program/application/eavesdropper/admin-webview/dist"

# 检查环境变量是否设置
if [ -z "$remote_server" ] || [ -z "$remote_password" ]; then
    echo "错误: 请设置环境变量 DEPLOY_SERVER 和 DEPLOY_PASSWORD"
    exit 1
fi

# 构建项目
echo "开始构建项目..."
npm run build:prod

# 确保远程目录存在
sshpass -p "$remote_password" ssh -o StrictHostKeyChecking=no -T "$remote_server" << EOF
  mkdir -p $remote_path
  # 清空目标目录
  rm -rf $remote_path/*
EOF

# 将dist文件夹及其内容复制到远程服务器
sshpass -p "$remote_password" scp -r ./dist/* "$remote_server:$remote_path/"

echo "部署完成！"
