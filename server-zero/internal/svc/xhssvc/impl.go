package xhssvc

import (
	"encoding/json"
	"server-zero/comm"
)

type XhsSvc struct {
	host string
}

func NewXhsSvc(host string) *XhsSvc {
	return &XhsSvc{host: host}
}

type SemSDKResponse struct {
	Code    int  `json:"code"`
	Success bool `json:"success"`
	Data    struct {
		AllowKey map[string]string `json:"allowKey"`
		ClickId  map[string]string `json:"clickId"`
	} `json:"data"`
}

func (s *XhsSvc) GetSemSDK() (*SemSDKResponse, error) {
	get, err := comm.Get(s.host + "/data/sem_sdk")
	if err != nil {
		return nil, err
	}

	var res = new(SemSDKResponse)
	err = json.Unmarshal(get, res)
	if err != nil {
		return nil, err
	}

	return res, nil
}
