package biz

import (
	"context"
	"server-zero/internal/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateCustomerReq struct {
	Name     string
	Password string
}

type CreateCustomerResp struct {
	Result int
}

func (c *CustomerBiz) CreateCustomer(ctx context.Context, req *CreateCustomerReq) (resp *CreateCustomerResp, err error) {
	resp = &CreateCustomerResp{}
	defer func() {
		if err != nil {
			logx.Errorw("CreateCustomer error", logx.Field("err", err))
			resp.Result = 2
		} else {
			resp.Result = 1
		}
	}()

	customer := &model.Customer{
		Name:     req.Name,
		Password: req.Password,
		Active:   1,
	}

	err = c.env.Domain.CustomerDomain.Create(ctx, customer)
	if err != nil {
		return resp, err
	}

	return resp, nil
}
