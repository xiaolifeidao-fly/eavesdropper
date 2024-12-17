package response

import (
	"net/http"
	"server/common"

	"github.com/gin-gonic/gin"
)

var Default = &response{}

// prepareResponse 准备响应
func prepareResponse(success bool, data interface{}, msg string) *response {
	res := Default.Clone()
	res.SetTraceID(common.GetRequestID())
	res.SetSuccess(success)
	res.SetData(data)
	res.SetMsg(msg)
	return res.(*response)
}

// Error 失败数据处理
func Error(c *gin.Context, msg string) {
	res := prepareResponse(false, nil, msg)
	c.AbortWithStatusJSON(http.StatusOK, res)
}

// OK 通常成功数据处理
func OK(c *gin.Context, data interface{}) {
	res := prepareResponse(true, data, "")
	c.AbortWithStatusJSON(http.StatusOK, res)
}
