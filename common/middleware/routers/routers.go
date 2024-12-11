package routers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

const (
	SuccessCode       = 0
	FailCode          = 1
	DefaultSuccessRes = "请求成功"
	DefaultFailRes    = "请求失败"
)

func ToJson(context *gin.Context, data interface{}, err error) {
	if err != nil {
		context.JSON(http.StatusOK, gin.H{
			"code":  FailCode,
			"data":  DefaultFailRes,
			"error": err.Error(),
		})
	}
	context.JSON(http.StatusOK, gin.H{
		"code":  SuccessCode,
		"data":  data,
		"error": nil,
	})
}

type Option func(*gin.RouterGroup)

type GinRouter struct {
	engine  *gin.Engine
	options []Option
}

func NewGinRouter() *GinRouter {
	engine := gin.New()
	var options []Option
	return &GinRouter{engine: engine, options: options}
}

func (g *GinRouter) Use(middleware ...gin.HandlerFunc) {
	g.engine.Use(middleware...)
}

// Include 注册app的路由配置
func (g *GinRouter) Include(opts ...Option) {
	g.options = append(g.options, opts...)
}

func (g *GinRouter) Run(addr ...string) error {
	routerGroup := g.engine.Group(viper.GetString("request.path"))
	for _, opt := range g.options {
		opt(routerGroup)
	}
	port := viper.GetString("server.port")

	if err := g.engine.Run(":" + port); err != nil {
		log.Fatalf("startup service failed, err:%v\n", err)
		return err
	}
	log.Panicln("server started at port:", port)
	return nil
}
