package user

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"server-zero/cmd/internal/logic/user"
	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
)

// 创建用户
func CreateCustomerHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.CreateCustomerReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := user.NewCreateCustomerLogic(r.Context(), svcCtx)
		resp, err := l.CreateCustomer(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
