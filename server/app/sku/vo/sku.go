package vo

// SkuAddReq 添加sku请求
type SkuAddReq struct {
	Name string `json:"name" binding:"required"`
	Url  string `json:"url" binding:"required"`
}
