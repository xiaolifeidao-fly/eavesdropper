package biz

import (
	"context"
	"server-zero/internal/domain"

	"github.com/zeromicro/go-zero/core/logx"
)

type QueryCustomerReq struct {
	Name string
}

type CustomerInfo struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Active    int    `json:"active"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
	CreatedBy string `json:"createdBy"`
	UpdatedBy string `json:"updatedBy"`
}

type QueryCustomerResp struct {
	Result []*CustomerInfo
}

func (c *CustomerBiz) Query(ctx context.Context, req *QueryCustomerReq) (resp *QueryCustomerResp, err error) {
	resp = &QueryCustomerResp{}
	defer func() {
		if err != nil {
			logx.Errorw("QueryCustomer error", logx.Field("err", err))
		}
	}()

	// 构造查询参数
	params := domain.QueryParams{
		Name: req.Name,
	}

	// 调用领域层查询
	customers := c.env.Domain.CustomerDomain.Query(ctx, params)

	// 转换数据
	resp.Result = make([]*CustomerInfo, len(customers))
	for i, customer := range customers {
		resp.Result[i] = &CustomerInfo{
			ID:        customer.ID,
			Name:      customer.Name,
			Active:    customer.Active,
			CreatedAt: customer.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt: customer.UpdatedAt.Format("2006-01-02 15:04:05"),
			CreatedBy: customer.CreatedBy,
			UpdatedBy: customer.UpdatedBy,
		}
	}

	return resp, nil
}
