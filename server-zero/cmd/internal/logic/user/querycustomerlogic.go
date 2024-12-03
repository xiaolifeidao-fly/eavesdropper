package user

import (
	"context"

	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
	biz "server-zero/internal/biz/customer"

	"github.com/zeromicro/go-zero/core/logx"
)

type QueryCustomerLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 用户列表查询
func NewQueryCustomerLogic(ctx context.Context, svcCtx *svc.ServiceContext) *QueryCustomerLogic {
	return &QueryCustomerLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *QueryCustomerLogic) QueryCustomer(req *types.CustomerListReq) (resp *types.CustomerListResp, err error) {
	// todo: add your logic here and delete this line
	resp = &types.CustomerListResp{}

	// 调用业务层查询用户
	bizReq := &biz.QueryCustomerReq{
		Name: req.Name,
	}

	bizResp, err := biz.NewCustomerBiz(l.svcCtx.Env).Query(l.ctx, bizReq)
	if err != nil {
		return resp, err
	}

	// 将 bizResp.Result 转换为 []*types.Item
	var items []*types.Item
	for _, customerInfo := range bizResp.Result {
		item := &types.Item{
			Name:      customerInfo.Name,
			Active:    customerInfo.Active,
			CreatedAt: 0, // 需要将时间字符串转换为int
			UpdatedAt: 0, // 需要将时间字符串转换为int
			CreatedBy: customerInfo.CreatedBy,
			UpdatedBy: customerInfo.UpdatedBy,
		}
		items = append(items, item)
	}

	resp.Result = items
	return
}
