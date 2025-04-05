package dto

import (
	"server/common/base/dto"
)

const (
	VERSION_DRAFT     = "DRAFT"
	VERSION_PUBLISHED = "PUBLISHED"
	VERSION_DELETED   = "DELETED"
)

type VersionDto struct {
	dto.BaseDTO
	AppId       string `json:"app_id"`
	Version     string `json:"version"`
	BuildNum    int    `json:"build_num"`
	ChangeLog   string `json:"change_log"`
	DownloadUrl string `json:"download_url"`
	Status      string `json:"status"`
}
