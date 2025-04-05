package vo

import (
	"server/common/base"
	"server/common/base/page"
	"server/common/base/vo"
)

// VersionAddReq 添加版本请求
type VersionAddReq struct {
	AppId       string `json:"app_id" binding:"required"`
	Version     string `json:"version" binding:"required"`
	ChangeLog   string `json:"change_log"`
	DownloadUrl string `json:"download_url" binding:"required"`
}

// VersionUpdateReq 更新版本请求
type VersionUpdateReq struct {
	ID          uint64 `json:"id" binding:"required"`
	Version     string `json:"version" binding:"required"`
	ChangeLog   string `json:"change_log"`
	DownloadUrl string `json:"download_url" binding:"required"`
}

// CheckVersionExistenceReq 检查版本是否存在请求
type CheckVersionExistenceReq struct {
	AppId   string `form:"appId" binding:"required"`
	Version string `form:"version"`
}

// VersionPageReq 版本分页请求
type VersionPageReq struct {
	page.Query
	vo.BaseVO
	AppId string `form:"app_id" binding:"required"`
}

// VersionPageResp 版本分页响应
type VersionPageResp struct {
	ID          uint64    `json:"id"`
	AppId       string    `json:"app_id"`
	Version     string    `json:"version"`
	BuildNum    int       `json:"build_num"`
	ChangeLog   string    `json:"change_log"`
	DownloadUrl string    `json:"download_url"`
	Status      string    `json:"status"`
	CreatedAt   base.Time `json:"created_at"`
	UpdatedAt   base.Time `json:"updated_at"`
}
