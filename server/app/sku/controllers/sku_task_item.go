package controllers

import (
	"server/app/sku/vo"
	baseVO "server/common/base/vo"
	"server/common/converter"
	"server/common/server/controller"
	resourceDTO "server/internal/resource/services/dto"
	"server/internal/sku/services"
	"server/internal/sku/services/dto"

	"github.com/gin-gonic/gin"
)

func LoadSkuTaskItemRouter(router *gin.RouterGroup) {
	r := router.Group("/sku/task/:id/item")
	{
		r.GET("", GetSkuTaskItemList)
	}
}

// PageSkuTaskItem
// @Description 获取商品任务项列表
func GetSkuTaskItemList(ctx *gin.Context) {
	var err error

	var req vo.GetSkuTaskItemListReq
	if err := controller.Bind(ctx, &req, nil); err != nil {
		controller.Error(ctx, "参数错误")
		return
	}

	var skuTaskItemList []*dto.SkuTaskItemDTO
	if skuTaskItemList, err = services.GetSkuTaskItemListByTaskID(req.TaskID); err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	skuTaskDTO, err := services.GetSkuTask(req.TaskID)
	if err != nil {
		controller.Error(ctx, err.Error())
		return
	}

	resp := make([]*vo.GetSkuTaskItemListResp, 0)
	for _, item := range skuTaskItemList {
		itemResp := &vo.GetSkuTaskItemListResp{}
		converter.Copy(itemResp, item)
		var sourceLableValue baseVO.LabelValueVO
		if sourceLableValueEnum := resourceDTO.GetResourceSourceEnumByValue(itemResp.Source); sourceLableValueEnum != nil {
			converter.Copy(&sourceLableValue, sourceLableValueEnum)
			itemResp.SourceLableValue = sourceLableValue
		}
		itemResp.ResourceId = skuTaskDTO.PublishResourceID
		var statusLableValue baseVO.LabelValueVO
		if statusLableValueEnum := dto.GetSkuTaskItemStatusEnumByValue(itemResp.Status); statusLableValueEnum != nil {
			converter.Copy(&statusLableValue, statusLableValueEnum)
			itemResp.StatusLableValue = statusLableValue
		}

		resp = append(resp, itemResp)
		if item.Status != dto.SkuTaskItemStatusSuccess.Value {
			continue
		}

		skuID := item.SkuID
		if skuID == 0 {
			continue
		}
		var skuDTO *dto.SkuDTO
		if skuDTO, err = services.GetSkuByID(skuID); err != nil {
			controller.Error(ctx, err.Error())
			return
		}

		itemResp.SourceSkuID = skuDTO.SourceSkuID
		itemResp.Title = skuDTO.Name
		itemResp.NewSkuUrl = services.GetSkuSourceUrl(skuDTO.Source, skuDTO.PublishSkuID)
	}
	controller.OK(ctx, resp)
}
