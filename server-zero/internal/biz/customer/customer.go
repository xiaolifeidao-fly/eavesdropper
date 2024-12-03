package biz

import "server-zero/internal/environment"

type CustomerBiz struct {
	env *environment.ServiceContext
}

func NewCustomerBiz(env *environment.ServiceContext) *CustomerBiz {
	return &CustomerBiz{env: env}
}
