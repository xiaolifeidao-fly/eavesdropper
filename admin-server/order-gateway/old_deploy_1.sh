
cluster_name="cluster1"
remote_path="/data/program/app/kakrolot/order-gateway"
app_name="order-gateway-0.0.1-SNAPSHOT.jar"
# 建立SSH连接并执行远程命令
sshpass -p "$kakrolot_order_gateway_password" ssh -o StrictHostKeyChecking=no -T "$kakrolot_order_gateway_remote_server" << EOF
  mkdir -p $remote_path/$cluster_name
  cd $remote_path/$cluster_name
  rm -rf *.jar
EOF
sshpass -p "$kakrolot_order_gateway_password" scp -q ./target/$app_name "$kakrolot_order_gateway_remote_server:$remote_path/$cluster_name"
