package vo

type AddSkuTaskReq struct {
	Count             int `json:"count" binding:"required"`
	PublishResourceId int `json:"publishResourceId" binding:"required"`
}

type UpdateSkuTaskReq struct {
	ID       uint64 `uri:"id" binding:"required"`
	Progress int    `json:"progress" binding:"required"`
	Status   string `json:"status" binding:"required"`
}
