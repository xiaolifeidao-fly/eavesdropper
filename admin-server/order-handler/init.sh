#!/bin/bash

# 设置远程服务器和路径
remote_path="/data/program/app/kakrolot/order-handler"
# 建立SSH连接并执行远程命令
sshpass -p "$kakrolot_order_handler_password" ssh -o StrictHostKeyChecking=no -T "$kakrolot_order_handler_remote_server" << EOF
  mkdir -p $remote_path
  rm -rf $remote_path/*.sh
EOF

sshpass -p "$kakrolot_order_handler_password" scp -q ./start.sh "$kakrolot_order_handler_remote_server:$remote_path"
sshpass -p "$kakrolot_order_handler_password" scp -q ./stop.sh "$kakrolot_order_handler_remote_server:$remote_path"
