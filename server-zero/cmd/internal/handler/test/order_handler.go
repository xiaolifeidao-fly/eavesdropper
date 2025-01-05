package test

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"server-zero/cmd/internal/svc"
	"server-zero/cmd/internal/types"
	"strings"

	"github.com/zeromicro/go-zero/rest/httpx"
)

// 订单处理
func OrderHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 打印所有请求头信息
		fmt.Printf("\n========== Request Headers ==========\n")
		for name, values := range r.Header {
			for _, value := range values {
				fmt.Printf("%s: %s\n", name, value)
			}
		}
		fmt.Printf("===================================\n\n")

		// 获取并特别标注 Content-Type
		contentType := r.Header.Get("Content-Type")
		fmt.Printf(">>> Content-Type: %s <<<\n\n", contentType)

		var requestData map[string]interface{}

		if strings.Contains(contentType, "application/json") {
			// 处理 JSON 请求
			body, err := ioutil.ReadAll(r.Body)
			if err != nil {
				httpx.Error(w, err)
				return
			}
			defer r.Body.Close()

			if err := json.Unmarshal(body, &requestData); err != nil {
				httpx.Error(w, err)
				return
			}

			fmt.Printf("========== JSON Request Body ==========\n")
		} else if strings.Contains(contentType, "application/x-www-form-urlencoded") {
			// 处理 Form 请求
			if err := r.ParseForm(); err != nil {
				httpx.Error(w, err)
				return
			}

			// 将 Form 数据转换为 map
			requestData = make(map[string]interface{})
			for key, values := range r.Form {
				if len(values) > 0 {
					requestData[key] = values[0]
				}
			}

			fmt.Printf("========== Form Request Body ==========\n")
		} else {
			// 不支持的 Content-Type
			httpx.Error(w, fmt.Errorf("unsupported Content-Type: %s", contentType))
			return
		}

		// 打印请求数据
		prettyJSON, err := json.MarshalIndent(requestData, "", "    ")
		if err != nil {
			httpx.Error(w, err)
			return
		}
		fmt.Printf("%s\n", string(prettyJSON))
		fmt.Printf("=====================================\n\n")

		// 返回处理结果
		resp := types.OrderResp{
			Code: 200,
			Msg:  "订单处理成功",
		}

		httpx.OkJson(w, resp)
	}
}
