package routers

import (
	"github.com/gin-gonic/gin"
)

var (
	registerRouters = make([]func(v *gin.RouterGroup), 0)
)

func LoadRouter(g *gin.RouterGroup) {
	for _, f := range registerRouters {
		f(g)
	}
}
