package vo

import (
	"server/internal/sku/services/dto"
)

type AddSkuTaskReq struct {
	PublishResourceID int    `json:"publishResourceId" binding:"required"`
	Count             int    `json:"count" binding:"required"`
	Remark            string `json:"remark"`
}

type UpdateSkuTaskReq struct {
	ID     uint64               `uri:"id" binding:"required"`
	Status string               `json:"status" binding:"required"`
	Remark string               `json:"remark"`
	Items  []*AddSkuTaskItemReq `json:"items"`
}

func (r *UpdateSkuTaskReq) Validate() error {
	status := r.Status
	if err := dto.SkuTaskStatus(status).Validate(); err != nil {
		return err
	}

	for _, item := range r.Items {
		if err := dto.SkuTaskItemStatus(item.Status).Validate(); err != nil {
			return err
		}
	}
	return nil
}

type AddSkuTaskItemReq struct {
	TaskID uint64 `json:"taskId" binding:"required"`
	Url    string `json:"url" binding:"required"`
	Status string `json:"status" binding:"required"`
	Remark string `json:"remark"`
}
