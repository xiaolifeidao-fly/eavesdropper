package page

// Query 查询参数
type Query struct {
	Current  int `form:"current" json:"current"`
	PageSize int `form:"pageSize" json:"size"`
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

func (p *Query) ToPageInfo(total int64) PageInfo {
	return PageInfo{
		Total:    total,
		Current:  p.GetCurrent(),
		PageSize: p.GetSize(),
	}
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

func BuildEmptyPage[T any](pageInfo PageInfo) *Page[T] {
	return &Page[T]{
		PageInfo: pageInfo,
		Data:     make([]*T, 0),
	}
}

func BuildPage[T any](pageInfo PageInfo, data []*T) *Page[T] {
	var page Page[T]
	page.PageInfo = pageInfo
	page.Data = data
	return &page
}
