package vo

// SkuAddReq 添加sku请求
type SkuAddReq struct {
	Name              string `json:"name" binding:"required"`
	SourceSkuID       string `json:"sourceSkuId" binding:"required"`
	TaskID            int    `json:"taskId" binding:"required"`
	Status            string `json:"status" binding:"required"`
	PublishResourceID int    `json:"publishResourceId" binding:"required"`
}
