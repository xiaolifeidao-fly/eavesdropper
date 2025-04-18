#!/bin/bash

cluster_name="cluster1"
remote_path="/data/program/app/kakrolot/order-handler"
app_name="order-handler-0.0.1-SNAPSHOT.jar"

# 建立SSH连接并执行远程命令
sshpass -p "$kakrolot_order_handler_password" ssh -q -o StrictHostKeyChecking=no -T "$kakrolot_order_handler_remote_server" << EOF
  mkdir -p $remote_path/$cluster_name
  cd $remote_path/$cluster_name
  rm -rf *.jar
EOF

# 上传新的jar包
sshpass -p "$kakrolot_order_handler_password" scp -q ./target/$app_name "$kakrolot_order_handler_remote_server:$remote_path/$cluster_name"

# 执行重启命令
sshpass -p "$kakrolot_order_handler_password" ssh -q -o StrictHostKeyChecking=no -T "$kakrolot_order_handler_remote_server" << EOF
  cd $remote_path/$cluster_name
  
  # 查找并杀死已存在的进程
  pid=\$(ps -ef | grep ${app_name} | grep -v grep | awk '{print \$2}')
  if [ -n "\$pid" ]; then
      echo "killing pid: \$pid"
      kill -9 \$pid
  fi
  
  # 等待进程停止
  sleep 3
  
  # 启动应用
  nohup java -jar ${app_name} --spring.config.location=file:$remote_path/$cluster_name/application.properties > /dev/null 2>&1 &
  
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