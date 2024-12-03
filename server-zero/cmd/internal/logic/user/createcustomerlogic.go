package user

import (
	"context"

	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
	biz "server-zero/internal/biz/customer"

	"github.com/zeromicro/go-zero/core/logx"
)

type CreateCustomerLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 创建用户
func NewCreateCustomerLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateCustomerLogic {
	return &CreateCustomerLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateCustomerLogic) CreateCustomer(req *types.CreateCustomerReq) (resp *types.CreateCustomerResp, err error) {
	// todo: add your logic here and delete this line
	resp = &types.CreateCustomerResp{}

	// 调用业务层创建用户
	bizReq := &biz.CreateCustomerReq{
		Name:     req.Name,
		Password: req.Password,
	}

	bizResp, err := biz.NewCustomerBiz(l.svcCtx.Env).CreateCustomer(l.ctx, bizReq)
	if err != nil {
		return resp, err
	}

	resp.Result = bizResp.Result
	return
}
