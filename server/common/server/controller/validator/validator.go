package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

// Validator 验证器接口
type Validator interface {
	Validate() error
}

// 全局验证器
var v *validator.Validate

// 自定义tag
var myValidateMap = make(map[string]func(ut validator.FieldLevel) bool)

// InitValidator 初始化验证器
func InitValidator() {
	v = validator.New()

	// 注册自定义tag
	for tag, fn := range myValidateMap {
		v.RegisterValidation(tag, fn)
	}
}

// Struct 数据验证
// value 需要验证的结构体
// lang 语言，默认 "zh"
func Struct(value interface{}, lang string) error {
	if lang == "" {
		lang = defaultLang
	}

	trans, ok := translations[lang]
	if !ok {
		return fmt.Errorf("unsupported language: %s", lang)
	}

	// err := v.Struct(value)
	return addError(nil, trans)
}
