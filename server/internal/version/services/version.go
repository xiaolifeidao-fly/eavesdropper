package services

import (
	"errors"
	"server/common/middleware/database"
	"server/common/middleware/logger"
	"server/internal/version/models"
	"server/internal/version/repositories"
	"server/internal/version/services/dto"
)

var versionRepository = database.NewRepository[repositories.VersionRepository]()

func GetLatestVersion(appId string) (*dto.VersionDto, error) {
	version, err := versionRepository.GetLatestVersion(appId)
	if err != nil {
		return nil, err
	}
	if version == nil {
		return nil, errors.New("找不到版本信息")
	}
	return database.ToDTO[dto.VersionDto](version), nil
}

func GetVersionByVersionId(versionId uint64) (*dto.VersionDto, error) {
	version, err := versionRepository.GetVersionById(versionId)
	if err != nil {
		return nil, err
	}
	if version == nil {
		return nil, errors.New("找不到版本信息")
	}
	return database.ToDTO[dto.VersionDto](version), nil
}

func GetVersionByVersion(appId string, version string) (*dto.VersionDto, error) {
	versionData, err := versionRepository.GetVersionByVersion(appId, version)
	if err != nil {
		return nil, err
	}
	if versionData == nil {
		return nil, nil
	}
	return database.ToDTO[dto.VersionDto](versionData), nil
}

func CreateVersion(versionDto *dto.VersionDto) (*dto.VersionDto, error) {
	existVersion, err := versionRepository.GetVersionByVersion(versionDto.AppId, versionDto.Version)
	if err != nil {
		return nil, err
	}
	if existVersion != nil {
		return nil, errors.New("版本号已存在")
	}

	newVersion := database.ToPO[models.Version](versionDto)
	newVersion.Status = dto.VERSION_DRAFT

	saved, err := versionRepository.SaveOrUpdate(newVersion)
	if err != nil {
		logger.Errorf("CreateVersion failed, with error is %v", err)
		return nil, errors.New("保存版本信息失败")
	}

	return database.ToDTO[dto.VersionDto](saved), nil
}

func UpdateVersion(versionDto *dto.VersionDto) (*dto.VersionDto, error) {
	existVersion, err := versionRepository.GetVersionById(versionDto.ID)
	if err != nil {
		return nil, err
	}
	if existVersion == nil {
		return nil, errors.New("版本不存在")
	}

	existVersion.Version = versionDto.Version
	existVersion.ChangeLog = versionDto.ChangeLog
	existVersion.DownloadUrl = versionDto.DownloadUrl

	saved, err := versionRepository.SaveOrUpdate(existVersion)
	if err != nil {
		logger.Errorf("UpdateVersion failed, with error is %v", err)
		return nil, errors.New("更新版本信息失败")
	}

	return database.ToDTO[dto.VersionDto](saved), nil
}

func PublishVersion(versionId uint64) (*dto.VersionDto, error) {
	existVersion, err := versionRepository.GetVersionById(versionId)
	if err != nil {
		return nil, err
	}
	if existVersion == nil {
		return nil, errors.New("版本不存在")
	}

	existVersion.Status = dto.VERSION_PUBLISHED

	saved, err := versionRepository.SaveOrUpdate(existVersion)
	if err != nil {
		logger.Errorf("PublishVersion failed, with error is %v", err)
		return nil, errors.New("发布版本失败")
	}

	return database.ToDTO[dto.VersionDto](saved), nil
}

func DeleteVersion(versionId uint64) (bool, error) {
	existVersion, err := versionRepository.GetVersionById(versionId)
	if err != nil {
		return false, err
	}
	if existVersion == nil {
		return false, errors.New("版本不存在")
	}

	existVersion.Status = dto.VERSION_DELETED

	_, err = versionRepository.SaveOrUpdate(existVersion)
	if err != nil {
		logger.Errorf("DeleteVersion failed, with error is %v", err)
		return false, errors.New("删除版本失败")
	}

	return true, nil
}

func ListVersions(appId string) ([]*dto.VersionDto, error) {
	versions, err := versionRepository.ListVersions(appId)
	if err != nil {
		return nil, err
	}

	var result = make([]*dto.VersionDto, 0, len(versions))
	for _, v := range versions {
		result = append(result, database.ToDTO[dto.VersionDto](v))
	}

	return result, nil
}
