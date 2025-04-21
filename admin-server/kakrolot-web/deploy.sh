#!/bin/bash

# 从环境变量获取配置
remote_server="$eavesdropper_admin_server_remote_server"
remote_password="$eavesdropper_admin_server_remote_password"

# 执行构建脚本
echo "开始构建应用..."
bash build.sh

remote_path="/data/program/application/eavesdropper/admin-server/kakrolot-web"
app_name="kakrolot-web-0.0.1-SNAPSHOT.jar"

# 检查环境变量是否设置
if [ -z "$remote_server" ] || [ -z "$remote_password" ]; then
    echo "错误: 请设置环境变量 kakrolot_web_remote_server 和 kakrolot_web_password"
    exit 1
fi

# 建立SSH连接并执行远程命令
sshpass -p "$remote_password" ssh -o StrictHostKeyChecking=no -T "$remote_server" << EOF
  mkdir -p $remote_path
  cd $remote_path
  rm -rf *.jar
EOF

# 上传新的jar包
sshpass -p "$remote_password" scp -q ./target/$app_name "$remote_server:$remote_path"

# 执行重启命令
sshpass -p "$remote_password" ssh -o StrictHostKeyChecking=no -T "$remote_server" << EOF
  cd $remote_path
  
  # 查找并杀死已存在的进程
  pid=\$(ps -ef | grep ${app_name} | grep -v grep | awk '{print \$2}')
  if [ -n "\$pid" ]; then
      echo "killing pid: \$pid"
      kill -9 \$pid
  fi
  
  # 等待进程停止
  sleep 3
  
  # 启动应用
  nohup java -jar ${app_name} --spring.config.location=file:$remote_path/application.properties > /dev/null 2>&1 &
  
  # 等待应用启动
  sleep 5
  
  # 检查是否成功启动
  new_pid=\$(ps -ef | grep ${app_name} | grep -v grep | awk '{print \$2}')
  if [ -n "\$new_pid" ]; then
      echo "Application started successfully with pid: \$new_pid"
  else
      echo "Application failed to start"
      exit 1
  fi
EOF
