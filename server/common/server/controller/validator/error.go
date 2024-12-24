package validator

import (
	"errors"
	"fmt"

	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
)

func addError(err error, trans ut.Translator) error {
	if err == nil {
		return nil
	}

	errs, ok := err.(validator.ValidationErrors)
	if !ok {
		return err
	}

	var Errors error
	for _, e := range errs {
		if Errors == nil {
			Errors = errors.New(e.Translate(trans))
		} else {
			Errors = fmt.Errorf("%v;%s", Errors, e.Translate(trans))
		}
	}

	return Errors
}
