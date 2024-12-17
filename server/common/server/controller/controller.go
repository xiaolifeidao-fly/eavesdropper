package controller

import (
	"fmt"

	"server/common/server/response"
	"server/library/logger"
	"server/library/plugins/validator"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

// Error 通常错误数据处理
func Error(context *gin.Context, err string) {
	response.Error(context, err)
}

// OK 通常成功数据处理
func OK(context *gin.Context, data interface{}) {
	response.OK(context, data)
}

// Bind 绑定请求数据
func Bind(context *gin.Context, d interface{}, bindings ...binding.Binding) error {
	var err1 error
	if len(bindings) == 0 {
		bindings = constructor.GetBindingForGin(d)
	}

	for i := range bindings {
		var err2 error
		if bindings[i] == nil {
			err2 = context.ShouldBindUri(d)
		} else {
			err2 = context.ShouldBindWith(d, bindings[i])
		}

		if err2 != nil {
			if err2.Error() == "EOF" {
				logger.Warn("request body is not present anymore. ")
				err2 = nil
				continue
			}
			if bindings[i] == nil {
				logger.Warn("request body is not present anymore. ")
				err2 = nil
				continue
			}
			err1 = AddError(err1, err2)
			break
		}
	}

	if err2 := validator.Struct(d, ""); err2 != nil {
		err1 = AddError(err1, err2)
	}

	if v, ok := d.(validator.Validator); ok {
		if err2 := v.Validate(); err2 != nil {
			err1 = AddError(err1, err2)
		}
	}

	return err1
}

func AddError(err1, err2 error) error {
	if err1 == nil {
		return err2
	}
	if err2 == nil {
		return err1
	}
	return fmt.Errorf("%v; %w", err1, err2)
}
