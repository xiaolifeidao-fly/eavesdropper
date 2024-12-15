package controllers

import (
	"server/app/auth/vo"
	"server/common/base/page"
	"server/common/converter"
	"server/common/server/controller"
	"server/internal/auth/services"
	"server/internal/auth/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type User struct {
	controller.Controller
}

func NewUserController(ctx *gin.Context) *User {
	return &User{Controller: *controller.NewController(ctx)}
}

// Page
// @Description 分页获取用户
// @Router /users/page [get]
func Page(ctx *gin.Context) {
	userController := NewUserController(ctx)

	var req vo.UserPageReq
	err := userController.Bind(&req, binding.Query).Errors
	if err != nil {
		userController.Logger.Errorf("Page failed, with error is %v", err)
		userController.Error("系统错误")
		return
	}

	param := converter.ToDTO[dto.UserPageParamDTO](&req)
	var pageDTO *page.Page
	if pageDTO, err = services.PageUser(param); err != nil {
		userController.Logger.Errorf("Page failed, with error is %v", err)
		userController.Error(err.Error())
		return
	}

	var pageData []vo.UserPageResp
	converter.Copy(&pageData, pageDTO.Data)
	pageResp := page.BuildPage(pageDTO.PageInfo, pageData)
	userController.OK(pageResp)
}
