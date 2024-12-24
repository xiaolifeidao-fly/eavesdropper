package controllers

import (
	"server/app/auth/vo"
	"server/common/base/page"
	"server/common/converter"
	"server/common/middleware/logger"
	"server/common/server/controller"
	"server/common/server/middleware"
	"server/internal/auth/services"
	"server/internal/auth/services/dto"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

const (
	DeleteUserSuccess = "删除用户成功"
	UpdateUserSuccess = "更新用户成功"
)

func LoadUserRouter(router *gin.RouterGroup) {
	r := router.Group("/users")
	{
		r.Use(middleware.Authorization()).POST("", AddUser)
		r.Use(middleware.Authorization()).DELETE("/:id", DeleteUser)
		r.Use(middleware.Authorization()).PUT("/:id", UpdateUser)
		r.Use(middleware.Authorization()).GET("/:id", GetUser)
		r.Use(middleware.Authorization()).GET("/page", Page)
	}
}

// AddUser
// @Description 添加用户
// @Router /users [post]
func AddUser(ctx *gin.Context) {
	var err error

	var req vo.UserAddReq
	if err = controller.Bind(ctx, &req, binding.JSON); err != nil {
		logger.Errorf("Add failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	var userDTO *dto.UserDTO
	userAddDTO := converter.ToDTO[dto.UserAddDTO](&req)
	if userDTO, err = services.CreateUser(userAddDTO); err != nil {
		logger.Errorf("Add failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, userDTO.ID)
}

// DeleteUser
// @Description 删除用户
// @Router /users/:id [delete]
func DeleteUser(ctx *gin.Context) {
	var err error

	var req vo.DeleteUserReq
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("Delete failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	if err = services.DeleteUser(req.ID); err != nil {
		logger.Errorf("Delete failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, DeleteUserSuccess)
}

// UpdateUser
// @Description 更新用户
// @Router /users/:id [put]
func UpdateUser(ctx *gin.Context) {
	var err error

	var req vo.UserUpdateReq
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("Update failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	userUpdateDTO := converter.ToDTO[dto.UserUpdateDTO](&req)
	if err = services.UpdateUser(userUpdateDTO); err != nil {
		logger.Errorf("Update failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	controller.OK(ctx, UpdateUserSuccess)
}

// GetUser
// @Description 获取用户
// @Router /users/:id [get]
func GetUser(ctx *gin.Context) {
	var err error

	var req vo.GetUserReq
	if err = controller.Bind(ctx, &req, nil); err != nil {
		logger.Errorf("Get failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	var userInfoDTO *dto.UserInfoDTO
	if userInfoDTO, err = services.GetUserInfo(req.ID); err != nil {
		logger.Errorf("Get failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var resp vo.GetUserInfoResp
	converter.Copy(&resp, userInfoDTO)
	controller.OK(ctx, &resp)
}

// Page
// @Description 分页获取用户
// @Router /users/page [get]
func Page(ctx *gin.Context) {
	var err error

	var req vo.UserPageReq
	if err = controller.Bind(ctx, &req, binding.Query); err != nil {
		logger.Errorf("Page failed, with error is %v", err)
		controller.Error(ctx, "系统错误")
		return
	}

	param := converter.ToDTO[dto.UserPageParamDTO](&req)
	var pageDTO *page.Page
	if pageDTO, err = services.PageUser(param); err != nil {
		logger.Errorf("Page failed, with error is %v", err)
		controller.Error(ctx, err.Error())
		return
	}

	var pageData []vo.UserPageResp
	converter.Copy(&pageData, pageDTO.Data)
	pageResp := page.BuildPage(pageDTO.PageInfo, pageData)
	controller.OK(ctx, pageResp)
}
