package svc

import (
	"server-zero/cmd/internal/middleware"
	"server-zero/internal/environment"

	"github.com/zeromicro/go-zero/rest"
)

type ServiceContext struct {
	Env   *environment.ServiceContext
	Sign  rest.Middleware
	Token rest.Middleware
	Cors  rest.Middleware
}

func NewServiceContext(env *environment.ServiceContext) *ServiceContext {
	return &ServiceContext{
		Env:   env,
		Sign:  middleware.NewSignMiddleware().Handle,
		Token: middleware.NewTokenMiddleware().Handle,
		Cors:  middleware.NewCorsMiddleware().Handle,
	}
}
