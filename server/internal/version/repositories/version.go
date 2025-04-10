package repositories

import (
	"server/common/middleware/database"
	"server/internal/version/models"
)

type VersionRepository struct {
	database.Repository[*models.Version]
}

func (r *VersionRepository) GetLatestVersion(appId string) (*models.Version, error) {
	sql := "SELECT * FROM app_version WHERE app_id = ? AND status = 'PUBLISHED' ORDER BY build_num DESC LIMIT 1"
	return r.GetOne(sql, appId)
}

func (r *VersionRepository) GetVersionById(versionId uint64) (*models.Version, error) {
	sql := "SELECT * FROM app_version WHERE id = ?"
	return r.GetOne(sql, versionId)
}

func (r *VersionRepository) GetVersionByVersion(appId string, version string) (*models.Version, error) {
	sql := "SELECT * FROM app_version WHERE app_id = ? AND version = ?"
	return r.GetOne(sql, appId, version)
}

func (r *VersionRepository) ListVersions(appId string) ([]*models.Version, error) {
	sql := "SELECT * FROM app_version WHERE app_id = ? ORDER BY build_num DESC"
	return r.GetList(sql, appId)
}
