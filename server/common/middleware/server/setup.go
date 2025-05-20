package server

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"time"

	"server/common/middleware/logger"

	"github.com/gin-gonic/gin"
)

func Setup(entity *ServerEntity) {
	if entity == nil {
		panic("server entity is nil")
	}
	entity.Default()

	// 路由
	router := gin.New()
	router.MaxMultipartMemory = 100 << 20 // 100MB
	Router = router

}

func LoadRouterAndMiddleware(entity *ServerEntity, routers []func(router *gin.RouterGroup), middlewares ...gin.HandlerFunc) {
	group := Router.Group(entity.Prefix)
	for _, middleware := range middlewares {
		group.Use(middleware)
	}

	for _, loadRouter := range routers {
		loadRouter(group)
	}
}

func Run(entity *ServerEntity) {
	srv := &http.Server{
		Addr:    ":" + entity.Port,
		Handler: Router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Errorf("listen: %v", err)
		}
	}()

	logger.Infof("Server %s run success", entity.Name)
	logger.Infof("Local: %s://localhost:%s", "http", entity.Port)
	logger.Infof("Network: %s://%s:%s", "http", entity.Host, entity.Port)

	quit()        // 监听退出信号
	shutdown(srv) // 等待5秒，等待请求完成
}

func quit() {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
}

func shutdown(srv *http.Server) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	logger.Infof("%s Shutdown Server ...", time.Now().Format("2006-01-02 15:04:05"))

	if err := srv.Shutdown(ctx); err != nil {
		logger.Errorf("Server Shutdown: %v", err)
	}
	logger.Infof("Server exiting")
}
