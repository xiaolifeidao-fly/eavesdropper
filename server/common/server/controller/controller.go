package controller

import (
	"fmt"

	"server/common/server/common"
	"server/common/server/response"
	"server/library/logger"
	"server/library/plugins/validator"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

// Controller 基础控制器
type Controller struct {
	Context *gin.Context
	Logger  *logger.Helper
	Errors  error
}

func NewController(ctx *gin.Context) *Controller {
	return &Controller{Context: ctx, Logger: common.GetRequestLogger()}
}

func (c *Controller) AddError(err error) {
	if c.Errors == nil {
		c.Errors = err
	} else if err != nil {
		c.Logger.Error(err)
		c.Errors = fmt.Errorf("%v; %w", c.Errors, err)
	}
}

// Error 通常错误数据处理
func (c *Controller) Error(err string) {
	response.Error(c.Context, err)
}

// OK 通常成功数据处理
func (c *Controller) OK(data interface{}) {
	response.OK(c.Context, data)
}

func (c *Controller) Bind(d interface{}, bindings ...binding.Binding) *Controller {
	var err error
	if len(bindings) == 0 {
		bindings = constructor.GetBindingForGin(d)
	}

	for i := range bindings {
		if bindings[i] == nil {
			err = c.Context.ShouldBindUri(d)
		} else {
			err = c.Context.ShouldBindWith(d, bindings[i])
		}
		if err != nil {
			if err.Error() == "EOF" {
				c.Logger.Warn("request body is not present anymore. ")
				err = nil
				continue
			}
			if bindings[i] == nil {
				c.Logger.Warn("request body is not present anymore. ")
				err = nil
				continue
			}
			c.AddError(err)
			break
		}
	}

	if err := validator.Struct(d, ""); err != nil {
		c.AddError(err)
	}

	if v, ok := d.(validator.Validator); ok {
		if err := v.Validate(); err != nil {
			c.AddError(err)
		}
	}

	return c
}
