package user

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"server-zero/cmd/internal/logic/user"
	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
)

// 用户列表查询2
func QueryCustomer2Handler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.CustomerListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := user.NewQueryCustomer2Logic(r.Context(), svcCtx)
		resp, err := l.QueryCustomer2(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}