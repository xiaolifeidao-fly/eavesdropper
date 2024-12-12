package page

// Query 查询参数
type Query struct {
	Current  int `json:"current"`
	PageSize int `json:"size"`
}

func (p *Query) GetCurrent() int {
	if p.Current <= 0 {
		return 1
	}
	return p.Current
}

func (p *Query) GetSize() int {
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

type Page[T any] struct {
	PageInfo PageInfo `json:"pageInfo"`
	Data     []*T     `json:"data"`
}

func BuildPage[T any](pageInfo PageInfo, data []*T) *Page[T] {
	var page Page[T]
	page.PageInfo = pageInfo
	page.Data = data
	return &page
}
