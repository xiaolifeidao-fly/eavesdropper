package vo

import (
	"server/common"
	"server/common/converter"
	"server/internal/feedback/services/dto"
)

type GetFeedbackInfoReqVo struct {
	ID uint64 `uri:"id"`
}

type MarkFeedbackProcessingReqVo struct {
	ID uint64 `uri:"id"`
}

type ResolvedFeedbackReqVo struct {
	ID     uint64 `uri:"id"`
	Result string `json:"result"`
}

func (v *ResolvedFeedbackReqVo) ToProcessDTO() *dto.ProcessDTO {
	processDTO := dto.ProcessDTO{}
	converter.Copy(&processDTO, v)
	processDTO.ID = 0
	processDTO.FeedbackID = v.ID
	userID := common.GetLoginUserID()
	processDTO.UserID = userID
	processDTO.CreatedBy = userID
	processDTO.UpdatedBy = userID
	return &processDTO
}
