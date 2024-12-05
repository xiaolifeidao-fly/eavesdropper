package svc

import (
	"server-zero/cmd/internal/middleware"
	"server-zero/config"

	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config config.Config
	Token  rest.Middleware
}

func NewServiceContext(c config.Config) *ServiceContext {
	return &ServiceContext{
		Config: c,
		Token:  middleware.NewTokenMiddleware().Handle,
	}
}
