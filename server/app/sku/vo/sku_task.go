package vo

import (
	"errors"
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
	"server/internal/sku/services/dto"
)

type PriceRangeConfigReq struct {
	MinPrice        float64 `json:"minPrice" binding:"required"`
	MaxPrice        float64 `json:"maxPrice" binding:"required"`
	PriceMultiplier float64 `json:"priceMultiplier" binding:"required"`
	FixedAddition   float64 `json:"fixedAddition"`
	RoundTo         string  `json:"roundTo"`
}

type AddSkuTaskReq struct {
	PublishResourceID int                    `json:"publishResourceId" binding:"required"`
	Count             int                    `json:"count" binding:"required"`
	Remark            string                 `json:"remark"`
	Source            string                 `json:"source"`
	PriceRange        []*PriceRangeConfigReq `json:"priceRange"`
}

type UpdateSkuTaskReq struct {
	ID     uint64               `uri:"id" binding:"required"`
	Status string               `json:"status" binding:"required"`
	Remark string               `json:"remark"`
	Items  []*AddSkuTaskItemReq `json:"items"`
}

func (r *UpdateSkuTaskReq) Validate() error {
	status := r.Status

	skuTaskStatusEnum := dto.GetSkuTaskStatusEnum(status)
	if skuTaskStatusEnum == nil {
		return errors.New("status enum failed")
	}
	if err := skuTaskStatusEnum.Validate(); err != nil {
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

type SkuTaskPageReq struct {
	page.Query
	vo.BaseVO
	UserID  uint64 `form:"userId"`
	Account string `form:"account"`
	Source  string `form:"source"`
}

type SkuTaskPageResp struct {
	ID               uint64          `json:"id"`
	ResourceID       uint64          `json:"resourceId"`
	ResourceAccount  string          `json:"resourceAccount"`
	Status           string          `json:"status"`
	StatusLableValue vo.LabelValueVO `json:"statusLableValue"`
	Source           string          `json:"source"`
	SourceLableValue vo.LabelValueVO `json:"sourceLableValue"`
	Count            int             `json:"count"`
	CreatedBy        string          `json:"createdBy"`
	CreatedAt        base.Time       `json:"createdAt"`
	ShopName         string          `json:"shopName"`
	SuccessCount     int             `json:"successCount"`
	FailedCount      int             `json:"failedCount"`
	CancelCount      int             `json:"cancelCount"`
	ExistenceCount   int             `json:"existenceCount"`
}
