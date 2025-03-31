#!/bin/bash

# 远程服务器信息
remote_server="$eavesdropper_client_webview_remote_server"
remote_password="$eavesdropper_client_webview_password"
remote_path="/data/program/application/eavesdropper/client/webview"

echo "开始部署Next.js应用..."
echo "远程服务器: $remote_server"
echo "远程路径: $remote_path"

# 步骤1: 本地构建应用
echo "第1步: 执行本地构建..."
npm run build
if [ $? -ne 0 ]; then
    echo "构建失败，退出部署"
    exit 1
fi

# 步骤2: 打包.next文件夹
echo "第2步: 打包.next文件夹..."
rm -rf webview.tar.gz
tar -zcvf webview.tar.gz .next
if [ $? -ne 0 ]; then
    echo "打包失败，退出部署"
    exit 1
fi

# 步骤3: 上传压缩包到服务器
echo "第3步: 上传压缩包到服务器..."
echo "检查sshpass是否安装..."
which sshpass || echo "sshpass未安装，请先安装: brew install sshpass"

# 配置SSH选项
echo "配置SSH选项..."
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

# 上传文件，避免在调试输出中显示密码
echo "开始上传文件..."
sshpass -p "$remote_password" scp $SSH_OPTS webview.tar.gz "$remote_server:$remote_path"
upload_status=$?

echo "上传状态码: $upload_status"
if [ $upload_status -ne 0 ]; then
    echo "上传失败，退出部署。具体错误请查看上方日志。"
    echo "如果是sshpass未安装，请使用brew install sshpass安装"
    echo "如果是密码认证问题，请检查环境变量是否正确设置"
    exit 1
fi

# 步骤4: 在服务器上解压并重启服务
echo "第4步: 在服务器上解压并重启服务..."
sshpass -p "$remote_password" ssh $SSH_OPTS "$remote_server" << EOF
    cd $remote_path
    echo "正在解压文件..."
    tar -zxf webview.tar.gz
    
    echo "停止旧服务..."
    bash stop.sh
    
    echo "启动新服务..."
    bash start.sh
    
    echo "清理临时文件..."
    rm -f webview.tar.gz
    
    echo "检查服务状态..."
    sleep 3
    pid=\$(lsof -ti :8899)
    if [ -n "\$pid" ]; then
        echo "服务已成功启动，进程ID: \$pid"
    else
        echo "警告: 服务似乎未成功启动"
        exit 1
    fi
EOF

echo "部署完成!"