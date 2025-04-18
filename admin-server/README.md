### 初始化和部署
```
cd order-gateway
## 进入到具体的项目中进行初始化服务器
sh init.sh
```

### 服务初始化配置

```
1.服务脚本会上传到/data/program/app/kakrolot/order-gateway下的 (start.sh, stop.sh)
2.服务应用包会上传到/data/program/app/kakrolot/order-gateway/cluster1目录下(有几个节点，就会建立几个cluster)
3.登录服务器,进入到该目录后,将start.sh stop.sh copy到具体的节点中 
4.stop.sh 脚本是根据文件目录杀掉进程的，请根据具体服务的路径进行修正
5.在具体的节点中目录中，配置应用层的配置文件（application.properties）
```

### 后续部署
```
### 1.执行编译，在根目录下执行 
sh order-gateway/build.sh

### 2.部署具体的节点push到服务器(多个节点，请建立多个多个deploy.sh)
cd order-gateway
sh deploy_1.sh

### 3.登录服务器,进入到具体的目录后
    sh stop.sh
    sh start.sh
```
