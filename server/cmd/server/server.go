package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"

	authControllers "server/app/auth/controllers"

	"server/common"
	"server/common/middleware/application"
	"server/common/middleware/cache"
	"server/common/middleware/config"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/common/network"
	"server/common/server/middleware"

	log "server/library/logger"

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

var AppRouters = make([]func(g *gin.RouterGroup), 0)

func init() {
	StartCmd.PersistentFlags().StringVarP(&cmd.ConfigPath, "config", "c", "config/config.yaml", "使用提供的配置文件启动服务器")

	AppRouters = append(AppRouters, authControllers.LoadAuthRouter) // 添加认证路由
	AppRouters = append(AppRouters, authControllers.LoadUserRouter) // 添加用户路由
}

func setup() {
	// 配置初始化
	config.Setup(cmd.ConfigPath)

	// 日志初始化
	logger.LoggerEntity.Setup()

	// 数据库初始化
	database.Setup()

	// 缓存初始化
	cache.Setup()
}

func tip() {
	usageStr := `欢迎使用 ` + `server` + ` 可以使用 ` + `-h` + ` 查看命令`
	fmt.Printf("%s \n\n", usageStr)
}
func run() error {

	// 初始化路由
	initRouter()

	host := application.ApplicationConfig.Host
	port := application.ApplicationConfig.Port
	srv := &http.Server{
		Addr:    fmt.Sprintf("%s:%d", host, port),
		Handler: common.Runtime.GetEngine(),
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("listen: ", err)
		}
	}()

	tip()
	log.Infof("Server %s run success", application.ApplicationConfig.Mode)
	log.Infof("Local:   %s://localhost:%d \r", "http", port)
	log.Infof("Network: %s://%s:%d \r", "http", network.GetLocalHost(), port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	log.Infof("%s Shutdown Server ... \r\n", time.Now().Format("2006-01-02 15:04:05"))

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}
	log.Infof("Server exiting")
	return nil
}

func initRouter() {
	h := common.Runtime.GetEngine()
	if h == nil {
		h = gin.New()
		common.Runtime.SetEngine(h) // 设置引擎至全局
	}

	var r *gin.Engine
	switch h := h.(type) {
	case *gin.Engine:
		r = h
	default:
		log.Fatal("not support other engine")
	}

	g := r.Group(application.ApplicationConfig.Prefix)
	// 添加中间件
	g.Use(middleware.Error()).
		Use(middleware.Context()).
		Use(middleware.Logger()).
		Use(middleware.CrossDomain())

	// 加载路由
	for _, f := range AppRouters {
		f(g)
	}
}
