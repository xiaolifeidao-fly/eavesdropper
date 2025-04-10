package models

import "server/common/middleware/database"

type Version struct {
	database.BaseEntity
	AppId       string `json:"app_id" gorm:"column:app_id"`
	Version     string `json:"version" gorm:"column:version"`
	BuildNum    int    `json:"build_num" gorm:"column:build_num"`
	ChangeLog   string `json:"change_log" gorm:"column:change_log"`
	DownloadUrl string `json:"download_url" gorm:"column:download_url"`
	Status      string `json:"status" gorm:"column:status"`
}

func (v *Version) TableName() string {
	return "app_version"
}
