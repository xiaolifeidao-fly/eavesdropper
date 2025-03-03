package handler

import "server/common/http"

func GetTBCategoryHandler() error {
	var err error

	// 获取类目列表,14个
	url := "https://item.upload.taobao.com/router/asyncOpt.htm?optType=categorySelectChildren&fromSmart=true"

	var resp string
	if resp, err = http.Get(url, nil, nil); err != nil {
		return err
	}

	resp += ""
	return nil
}
