package user

import (
	"context"

	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type QueryCustomer3Logic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 用户列表查询3
func NewQueryCustomer3Logic(ctx context.Context, svcCtx *svc.ServiceContext) *QueryCustomer3Logic {
	return &QueryCustomer3Logic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *QueryCustomer3Logic) QueryCustomer3(req *types.CustomerListReq) (resp *types.CustomerListResp, err error) {
	// todo: add your logic here and delete this line

	return
}
