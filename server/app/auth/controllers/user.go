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

const (
	DeleteUserSuccess = "删除用户成功"
)

type User struct {
	controller.Controller
}

func NewUserController(ctx *gin.Context) *User {
	return &User{Controller: *controller.NewController(ctx)}
}

// AddUser
// @Description 添加用户
// @Router /users [post]
func AddUser(ctx *gin.Context) {
	userController := NewUserController(ctx)

	var req vo.UserAddReq
	err := userController.Bind(&req, binding.JSON).Errors
	if err != nil {
		userController.Logger.Errorf("Add failed, with error is %v", err)
		userController.Error("系统错误")
		return
	}

	var userDTO *dto.UserDTO
	userAddDTO := converter.ToDTO[dto.UserAddDTO](&req)
	if userDTO, err = services.CreateUser(userAddDTO); err != nil {
		userController.Logger.Errorf("Add failed, with error is %v", err)
		userController.Error(err.Error())
		return
	}

	userController.OK(userDTO.ID)
}

// DeleteUser
// @Description 删除用户
// @Router /users/:id [delete]
func DeleteUser(ctx *gin.Context) {
	userController := NewUserController(ctx)

	var req vo.DeleteUserReq
	err := userController.Bind(&req, nil).Errors
	if err != nil {
		userController.Logger.Errorf("Delete failed, with error is %v", err)
		userController.Error("系统错误")
		return
	}

	if err = services.DeleteUser(req.ID); err != nil {
		userController.Logger.Errorf("Delete failed, with error is %v", err)
		userController.Error(err.Error())
		return
	}

	userController.OK(DeleteUserSuccess)
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
