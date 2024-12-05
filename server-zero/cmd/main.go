package main

import (
	"flag"
	"fmt"
	"server-zero/config"
	"server-zero/internal/environment"

	"github.com/zeromicro/go-zero/core/logx"

	"server-zero/cmd/internal/handler"
	"server-zero/cmd/internal/svc"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "config/config.yaml", "the config file")

func main() {
	flag.Parse()

	//加载配置文件
	conf.MustLoad(*configFile, &config.Global)
	c := config.Global

	// 设置log
	logx.MustSetup(c.LogConf)
	defer logx.Close()
	// 拿到资源管理器
	env := environment.NewServiceContext(c)

	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	ctx := svc.NewServiceContext(env)
	handler.RegisterHandlers(server, ctx)

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	server.Start()
}
