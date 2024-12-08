package base

// Page 分页
type Page struct {
	Current  int `json:"current" form:"current"`
	PageSize int `json:"pageSize" form:"pageSize"`
}

func (p *Page) GetPageInfo(count int64) PageInfo {
	return PageInfo{
		Total:    count,
		Current:  p.Current,
		PageSize: p.PageSize,
	}
}

func (p *Page) GetCurrent() int {
	if p.Current <= 0 {
		return 1
	}
	return p.Current
}

func (p *Page) GetSize() int {
	if p.PageSize <= 0 {
		return 10
	}
	return p.PageSize
}

// PageInfo 分页信息
type PageInfo struct {
	Total    int64 `json:"total"`
	Current  int   `json:"current"`
	PageSize int   `json:"pageSize"`
}

// PageResp 分页响应
type PageResp struct {
	PageInfo PageInfo    `json:"pageInfo"`
	Data     interface{} `json:"data"`
}

// BuildPageResp 构建分页响应
func BuildPageResp(list interface{}, pageInfo PageInfo) PageResp {
	return PageResp{
		PageInfo: pageInfo,
		Data:     list,
	}
}
