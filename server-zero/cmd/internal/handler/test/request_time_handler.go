package test

import (
	"fmt"
	"net/http"
	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
	"time"

	"github.com/google/uuid"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// 请求时间统计
func TimeHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.TimeReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.Error(w, err)
			return
		}

		// 生成traceId
		traceId := uuid.New().String()

		// 开始时间
		startTime := time.Now()
		fmt.Printf("[%s] Request start at: %v\n", traceId, startTime.Format("2006-01-02 15:04:05"))

		// 模拟处理时间
		if req.SleepTime > 0 {
			time.Sleep(time.Duration(req.SleepTime) * time.Millisecond)
		}

		// 结束时间
		endTime := time.Now()
		duration := endTime.Sub(startTime).Milliseconds()
		fmt.Printf("[%s] Request end at: %v, duration: %dms\n", traceId, endTime.Format("2006-01-02 15:04:05"), duration)

		resp := types.TimeResp{
			TranceId: traceId,
			Duration: int(duration),
		}
		httpx.OkJson(w, resp)
	}
}
