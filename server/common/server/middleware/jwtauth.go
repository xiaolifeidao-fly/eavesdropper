package middleware

import (
	"server/common"
	"server/common/middleware/jwtauth"
	serverCommon "server/common/server/common"
	"server/common/server/response"

	"github.com/gin-gonic/gin"
)

// JwtAuth 验证jwt
func JwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		logger := serverCommon.GetRequestLogger()

		token, err := c.Cookie(serverCommon.AuthHeader)
		if err != nil {
			response.Error(c, serverCommon.NoLogin)
			return
		}

		if token == "" || token == "undefined" {
			response.Error(c, serverCommon.NoLogin)
			return
		}

		var data interface{}
		data, err = jwtauth.ParseJwtToken(token)
		if err != nil {
			logger.Errorf("JwtAuth failed, with error is %v", err)
			response.Error(c, serverCommon.TokenError)
			return
		}

		// 设置登录用户
		gContext := common.GetContext()
		gContext.Set(common.LoginUserIDKey, data)

		c.Next()
	}
}
