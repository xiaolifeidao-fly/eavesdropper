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
	AppId       string `json:"appId"`
	Version     string `json:"version"`
	BuildNum    int    `json:"buildNum"`
	ChangeLog   string `json:"changeLog"`
	DownloadUrl string `json:"downloadUrl"`
	Status      string `json:"status"`
}
