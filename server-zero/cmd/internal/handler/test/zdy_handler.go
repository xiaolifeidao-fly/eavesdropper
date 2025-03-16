package test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"server-zero/cmd/internal/svc"
	"strconv"

	"golang.org/x/exp/rand"
)

// ProxyIP 代表单个代理IP的信息
type ProxyIP struct {
	IP             string `json:"ip"`
	Port           int    `json:"port"`
	Address        string `json:"adr"`
	Timeout        int    `json:"timeout"`
	ComeTime       int    `json:"cometime"`
	Area           string `json:"area,omitempty"`
	ID             string `json:"id,omitempty"`
	LastScore      int    `json:"lastscore,omitempty"`
	YesterdayScore int    `json:"yestodayscore,omitempty"`
}

// ProxyResponse 代表API响应的结构
type ProxyResponse struct {
	Code string `json:"code"`
	Msg  string `json:"msg"`
	Data struct {
		Count     int       `json:"count"`
		ProxyList []ProxyIP `json:"proxy_list"`
	} `json:"data"`
}

// ZdyHandler 处理代理IP请求
func ZdyHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 获取查询参数
		query := r.URL.Query()
		api := query.Get("api")
		akey := query.Get("akey")
		proStr := query.Get("pro")
		orderStr := query.Get("order")
		typeStr := query.Get("type")
		// countStr := query.Get("count")

		// 参数验证
		if api == "" || akey == "" || proStr == "" || orderStr == "" || typeStr == "" {
			respondError(w, "12003", "参数不完整或有错误")
			return
		}

		// 转换参数
		pro, err := strconv.Atoi(proStr)
		if err != nil || (pro != 1 && pro != 2) {
			respondError(w, "12003", "代理协议参数错误")
			return
		}

		// 模拟成功响应
		response := ProxyResponse{
			Code: "10001",
			Msg:  "获取成功",
		}
		response.Data.Count = 5
		response.Data.ProxyList = []ProxyIP{
			{
				IP:       "223.241.180.245",
				Port:     41301,
				Address:  "安徽省安庆市 电信",
				Timeout:  10 + rand.Intn(11), // 生成10到20之间的随机数
				ComeTime: 284,
			},
			{
				IP:       "36.26.119.214",
				Port:     39557,
				Address:  "浙江省 电信",
				Timeout:  10 + rand.Intn(11), // 生成10到20之间的随机数
				ComeTime: 259,
			},
			// 可以添加更多示例数据
		}

		// 根据type参数返回不同格式
		responseType, _ := strconv.Atoi(typeStr)
		switch responseType {
		case 1: // Text
			respondText(w, response)
		case 2: // XML
			respondXML(w, response)
		case 3: // JSON
			respondJSON(w, response)
		default:
			respondError(w, "12003", "返回类型参数错误")
		}
	}
}

func respondError(w http.ResponseWriter, code string, msg string) {
	response := ProxyResponse{
		Code: code,
		Msg:  msg,
	}
	json.NewEncoder(w).Encode(response)
}

func respondJSON(w http.ResponseWriter, response ProxyResponse) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(response)
}

func respondText(w http.ResponseWriter, response ProxyResponse) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	for _, proxy := range response.Data.ProxyList {
		fmt.Fprintf(w, "%s:%d|%s|%d|%d\n",
			proxy.IP, proxy.Port, proxy.Address, proxy.Timeout, proxy.ComeTime)
	}
}

func respondXML(w http.ResponseWriter, response ProxyResponse) {
	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	// 这里可以实现XML格式的响应
	// 为了简单起见，这里暂时返回JSON格式
	json.NewEncoder(w).Encode(response)
}
