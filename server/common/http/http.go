package http

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"time"

	"github.com/parnurzeal/gorequest"
)

var client = Init()

func Init() *http.Client {
	transport := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,
	}
	client := &http.Client{
		Transport: transport,
	}
	return client
}
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

func Post(requestUrl string, requestBody map[string]interface{}, cookie string, headers map[string]string) (map[string]interface{}, error) {
	// Encode the struct to JSON
	jsonData, _ := json.Marshal(requestBody)
	request, err := http.NewRequest("POST", requestUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	// Set the appropriate headers
	request.Header.Set("Content-Type", "application/json")
	if cookie != "" {
		request.Header.Set("Cookie", cookie)
	}
	if headers != nil {
		for key, value := range headers {
			request.Header.Set(key, value)
		}
	}
	result := map[string]interface{}{}
	response, err := client.Do(request)
	if err != nil {
		return result, err
	}
	defer response.Body.Close()

	// Read and print the response body
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return result, err
	}
	json.Unmarshal(body, &result)
	return result, err
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
