
cluster_name="cluster1"
remote_path="/data/program/app/kakrolot/kakrolot-web"
app_name="kakrolot-web-0.0.1-SNAPSHOT.jar"
# 建立SSH连接并执行远程命令
sshpass -p "$kakrolot_web_password" ssh -o StrictHostKeyChecking=no -T "$kakrolot_web_remote_server" << EOF
  mkdir -p $remote_path/$cluster_name
  cd $remote_path/$cluster_name
  rm -rf *.jar
EOF
sshpass -p "$kakrolot_web_password" scp -q ./target/$app_name "$kakrolot_web_remote_server:$remote_path/$cluster_name"
