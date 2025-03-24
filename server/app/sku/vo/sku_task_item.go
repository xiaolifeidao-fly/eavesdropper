package vo

import (
	"server/common/base"
	"server/common/base/vo"
)

type GetSkuTaskItemListReq struct {
	TaskID uint64 `uri:"id"`
}

type GetSkuTaskItemListResp struct {
	ID               uint64          `json:"id"`
	TaskId           uint64          `json:"taskId"`
	Url              string          `json:"url"`
	Status           string          `json:"status"`
	StatusLableValue vo.LabelValueVO `json:"statusLableValue"`
	Remark           string          `json:"remark"`
	SkuID            uint64          `json:"skuId"`
	Name             string          `json:"name"`
	SourceSkuID      string          `json:"sourceSkuId"`
	Source           string          `json:"source"`
	SourceLableValue vo.LabelValueVO `json:"sourceLableValue"`
	Title            string          `json:"title"`
	CreatedAt        base.Time       `json:"createdAt"`
	NewSkuUrl        string          `json:"newSkuUrl"`
}

type AddSkuTaskItemReq struct {
	ID          uint64 `json:"id"`
	TaskID      uint64 `json:"taskId"`
	Url         string `json:"url" binding:"required"`
	Status      string `json:"status" binding:"required"`
	Remark      string `json:"remark"`
	Source      string `json:"source"`
	SkuID       uint64 `json:"skuId"`
	SourceSkuId string `json:"sourceSkuId"`
	Title       string `json:"title"`
}
