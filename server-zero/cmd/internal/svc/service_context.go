package svc

import (
	"server-zero/cmd/internal/middleware"
	"server-zero/config"
	"server-zero/internal/environment"

	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Config config.Config
	Token  rest.Middleware
}

func NewServiceContext(env *environment.ServiceContext) *ServiceContext {
	return &ServiceContext{
		Config: *env.Config,
		Token:  middleware.NewTokenMiddleware().Handle,
	}
}
