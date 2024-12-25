package vo

// SkuAddReq 添加sku请求
type SkuAddReq struct {
	SourceSkuId       int    `json:"sourceSkuId" binding:"required"`
	TaskId            int    `json:"taskId" binding:"required"`
	Status            string `json:"status" binding:"required"`
	PublishResourceId int    `json:"publishResourceId" binding:"required"`
}
