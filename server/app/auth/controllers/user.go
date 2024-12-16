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
	UpdateUserSuccess = "更新用户成功"
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

// UpdateUser
// @Description 更新用户
// @Router /users/:id [put]
func UpdateUser(ctx *gin.Context) {
	userController := NewUserController(ctx)

	var req vo.UserUpdateReq
	err := userController.Bind(&req, nil, binding.JSON).Errors
	if err != nil {
		userController.Logger.Errorf("Update failed, with error is %v", err)
		userController.Error("系统错误")
		return
	}

	userUpdateDTO := converter.ToDTO[dto.UserUpdateDTO](&req)
	if err = services.UpdateUser(userUpdateDTO); err != nil {
		userController.Logger.Errorf("Update failed, with error is %v", err)
		userController.Error(err.Error())
		return
	}

	userController.OK(UpdateUserSuccess)
}

// GetUser
// @Description 获取用户
// @Router /users/:id [get]
func GetUser(ctx *gin.Context) {
	userController := NewUserController(ctx)

	var req vo.GetUserReq
	err := userController.Bind(&req, nil).Errors
	if err != nil {
		userController.Logger.Errorf("Get failed, with error is %v", err)
		userController.Error("系统错误")
		return
	}

	var userInfoDTO *dto.UserInfoDTO
	if userInfoDTO, err = services.GetUserInfo(req.ID); err != nil {
		userController.Logger.Errorf("Get failed, with error is %v", err)
		userController.Error(err.Error())
		return
	}

	var resp vo.GetUserInfoResp
	converter.Copy(&resp, userInfoDTO)
	userController.OK(&resp)
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
