package server

import (
	"fmt"

	"server/app"
	"server/common/middleware/config"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/middleware/server"
	"server/common/middleware/storage/cache"
	"server/common/middleware/storage/oss"
	"server/common/server/middleware"

	"github.com/gin-gonic/gin"
	"github.com/spf13/cobra"
)

type Server struct {
	// 配置文件路径
	ConfigPath string
}

var (
	cmd      Server // 参数
	StartCmd = &cobra.Command{
		Use:     "server",
		Short:   "lodge server web",
		Example: "server -c config/config.yaml -l log",
		PreRun: func(cmd *cobra.Command, args []string) {
			setup()
		},
		RunE: func(cmd *cobra.Command, args []string) error {
			return run()
		},
	}
)

func init() {
	StartCmd.PersistentFlags().StringVarP(&cmd.ConfigPath, "config", "c", "config/config.yaml", "使用提供的配置文件启动服务器")
}

func setup() {
	// 配置初始化
	config.Setup(cmd.ConfigPath)

	// 日志初始化
	logger.Setup(logger.Entity)

	// 数据库初始化
	database.Setup(database.Config)

	// 缓存初始化
	cache.Setup(cache.Entity)

	// oss初始化
	oss.Setup(oss.Entity)
}

func tip() {
	usageStr := `欢迎使用 ` + `server` + ` 可以使用 ` + `-h` + ` 查看命令`
	fmt.Printf("%s \n\n", usageStr)
}

// runServer 启动服务
func runServer() {
	server.Setup(server.Entity)
	server.LoadRouterAndMiddleware(server.Entity, loadRouter(), loadMiddleware()...)
	server.Run(server.Entity)
}

// loadRouter 加载路由
func loadRouter() []func(router *gin.RouterGroup) {
	routers := []func(router *gin.RouterGroup){}
	for _, f := range app.GetAppRouters() {
		routers = append(routers, f)
	}
	return routers
}

// loadMiddleware 加载中间件
func loadMiddleware() []gin.HandlerFunc {
	middlewares := []gin.HandlerFunc{}
	middlewares = append(middlewares, middleware.Error(), middleware.Context(), middleware.Logger(), middleware.CrossDomain())
	return middlewares
}

func run() error {

	runServer() // 启动服务
	return nil
}
