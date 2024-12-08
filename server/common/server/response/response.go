package response

type Response struct {
	RequestId    string `json:"requestId"`
	Success      bool   `json:"success"`
	ErrorMessage string `json:"errorMessage"`
}

type response struct {
	Response
	Data interface{} `json:"data"`
}

func (e *response) Clone() Responses {
	return e
}

func (e *response) SetData(data interface{}) {
	e.Data = data
}

func (e *response) SetTraceID(id string) {
	e.RequestId = id
}

func (e *response) SetMsg(s string) {
	e.ErrorMessage = s
}

func (e *response) SetSuccess(success bool) {
	e.Success = success
}
