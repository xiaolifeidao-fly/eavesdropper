package user

import (
	"context"

	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type QueryCustomer2Logic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 用户列表查询2
func NewQueryCustomer2Logic(ctx context.Context, svcCtx *svc.ServiceContext) *QueryCustomer2Logic {
	return &QueryCustomer2Logic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *QueryCustomer2Logic) QueryCustomer2(req *types.CustomerListReq) (resp *types.CustomerListResp, err error) {
	// todo: add your logic here and delete this line

	return
}
