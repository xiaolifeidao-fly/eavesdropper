package http

import (
	"errors"

	"github.com/parnurzeal/gorequest"
)

func Get(url string, query, header map[string]string) (string, error) {
	request := getRequest(header)
	response, body, errs := request.Get(url).Query(query).End()

	if err := getError(errs); err != nil {
		return "", err
	}

	if response.StatusCode != 200 {
		return "", errors.New("response code != 200")
	}

	return body, nil
}

func Post(url string, query, data, header map[string]string) (string, error) {
	request := getRequest(header)
	response, body, errs := request.Post(url).Query(query).End()

	if err := getError(errs); err != nil {
		return "", err
	}

	if response.StatusCode != 200 {
		return "", errors.New("response code != 200")
	}

	return body, nil
}

func getRequest(header map[string]string) *gorequest.SuperAgent {
	request := gorequest.New()

	if header == nil || len(header) == 0 {
		header = map[string]string{
			"Accept": "application/json",
		}
	}

	for k, v := range header {
		request.Set(k, v)
	}

	return request
}

func getError(errs []error) error {
	if errs == nil || len(errs) == 0 {
		return nil
	}

	var msg string
	for _, err := range errs {
		msg += err.Error()
		msg += ";"
	}
	return errors.New(msg)
}
