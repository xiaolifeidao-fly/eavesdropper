#!/bin/bash

# 远程服务器信息
remote_server="root@$eavesdropper_server_remote_server"
remote_password="$eavesdropper_server_password"
remote_path="/data/program/application/eavesdropper/server"
app_name="server"
app_port="8081"  # 替换为您的Go应用端口

echo "开始部署Go应用..."
echo "远程服务器: $remote_server"
echo "远程路径: $remote_path"

# 步骤1: 本地构建应用
echo "第1步: 执行本地构建..."
# 为Linux环境交叉编译
GOOS=linux GOARCH=amd64 go build -o $app_name
if [ $? -ne 0 ]; then
    echo "构建失败，退出部署"
    exit 1
fi

# 步骤2: 打包应用和配置文件
echo "第2步: 打包应用文件..."
rm -rf server.tar.gz
# 添加需要部署的文件，如配置文件、静态资源等
tar -zcvf server.tar.gz $app_name
rm -rf $app_name
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

# 上传文件
echo "开始上传文件..."
sshpass -p "$remote_password" scp $SSH_OPTS server.tar.gz "$remote_server:$remote_path"
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
    tar -zxf server.tar.gz
    
    echo "设置可执行权限..."
    chmod +x $app_name
    chmod +x start.sh stop.sh
    
    echo "停止旧服务..."
    bash stop.sh
    
    echo "启动新服务..."
    bash start.sh
    
    echo "清理临时文件..."
    rm -f server.tar.gz
    
    echo "检查服务状态..."
    sleep 3
    pid=\$(lsof -ti :$app_port)
    if [ -n "\$pid" ]; then
        echo "服务已成功启动，进程ID: \$pid"
    else
        echo "警告: 服务似乎未成功启动"
        exit 1
    fi
EOF

echo "部署完成!"
