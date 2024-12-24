package validator

import (
	"fmt"

	"github.com/go-playground/locales"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"

	"github.com/go-playground/locales/en"
	"github.com/go-playground/locales/zh"
	enTranslations "github.com/go-playground/validator/v10/translations/en"
	zhTranslations "github.com/go-playground/validator/v10/translations/zh"
)

const defaultLang = "zh"

var (
	translations = make(map[string]ut.Translator)
	uni          *ut.UniversalTranslator
)

type languageConfig struct {
	locale       locales.Translator
	translations func(*validator.Validate, ut.Translator) error
}

var supportedLanguages = map[string]languageConfig{
	"zh": {
		locale:       zh.New(),
		translations: zhTranslations.RegisterDefaultTranslations,
	},
	"en": {
		locale:       en.New(),
		translations: enTranslations.RegisterDefaultTranslations,
	},
}

func init() {
	InitValidator()

	var defaultTrans locales.Translator

	// 初始化翻译器
	locales := make([]locales.Translator, 0, len(supportedLanguages))
	for key, config := range supportedLanguages {
		if key == defaultLang {
			defaultTrans = config.locale
		}
		locales = append(locales, config.locale)
	}

	if defaultTrans == nil {
		defaultTrans = locales[0]
	}
	uni = ut.New(defaultTrans, locales...)

	// 注册所有支持的语言
	for lang, config := range supportedLanguages {
		trans, _ := uni.GetTranslator(lang)
		translations[lang] = trans
		if err := config.translations(v, trans); err != nil {
			fmt.Printf("Failed to register translations for %s: %v\n", lang, err)
		}

		customTrans, ok := customTranslations[lang]
		if ok {
			customTrans(trans)
		}
	}
}

var customTranslations = map[string]func(ut.Translator){
	"zh": zhCustomTranslations,
}

func zhCustomTranslations(trans ut.Translator) {
	_ = v.RegisterTranslation("required", trans, func(ut ut.Translator) error {
		return ut.Add("required", "[{0}] 不能为空", true)
	}, func(ut ut.Translator, fe validator.FieldError) string {
		t, _ := ut.T("required", fe.Field())
		return t
	})
}
