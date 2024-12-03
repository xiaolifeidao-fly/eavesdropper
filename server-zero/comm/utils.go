package comm

import (
	"encoding/json"
	"github.com/jinzhu/copier"
	"github.com/pkg/errors"
	"io"
	"io/ioutil"
	"net/http"
	"reflect"
	"strings"
	"time"
)

func Get(url string) ([]byte, error) {
	method := "GET"
	client := &http.Client{
		Timeout: time.Second * 5,
	}
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, errors.WithMessage(err, "http.NewRequest")
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.WithMessage(err, "client.Do")
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, errors.WithMessage(err, "ioutil.ReadAll")
	}
	return body, nil
}

func Post(url string, body any) ([]byte, error) {
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, errors.WithMessage(err, "json.Marshal")
	}
	b := strings.NewReader(string(jsonBody))

	method := "POST"
	client := &http.Client{
		Timeout: time.Second * 5,
	}
	req, err := http.NewRequest(method, url, b)
	if err != nil {
		return nil, errors.WithMessage(err, "http.NewRequest")
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.WithMessage(err, "client.Do")
	}
	defer res.Body.Close()

	resp, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, errors.WithMessage(err, "ioutil.ReadAll")
	}
	return resp, nil
}
func GetHeader(url string, headerMap map[string]string) ([]byte, error) {
	method := "GET"
	client := &http.Client{
		Timeout: time.Second * 5,
	}
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, errors.WithMessage(err, "http.NewRequest")
	}
	for k, v := range headerMap {
		req.Header.Set(k, v)
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, errors.WithMessage(err, "client.Do")
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, errors.WithMessage(err, "ioutil.ReadAll")
	}
	return body, nil
}

func Convert(source interface{}, target interface{}) interface{} {
	if source == nil {
		return nil
	}
	copier.Copy(target, source)
	return target
}

func ConvertArray(source interface{}, target interface{}) interface{} {
	sourceValue := reflect.ValueOf(source)
	targetValue := reflect.ValueOf(target).Elem()
	targetType := targetValue.Type().Elem()

	for i := 0; i < sourceValue.Len(); i++ {
		sourceItem := sourceValue.Index(i)
		targetItem := reflect.New(targetType).Elem()

		copier.Copy(targetItem.Addr().Interface(), sourceItem.Addr().Interface())
		targetValue.Set(reflect.Append(targetValue, targetItem))
	}

	return targetValue.Interface()
}
