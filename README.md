# server-zero


## internal 代码自动生成

cmd/api: 存放某一模块的api文件,例如user.api,操作用户相关的接口

cmd/server.api: 存放所有controller的api文件,例如user.api,auth.api,操作所有模块的接口,通过 import 引入各个模块的api文件

run_goctl.sh 执行脚本生成代码
```bash
# pwd -> server-zero/cmd
chmod +x ../../script/run_goctl.sh
../../script/run_goctl.sh server.api ./

# 手动删除生成的文件
rm -rf etc
rm -rf internal/config
```
