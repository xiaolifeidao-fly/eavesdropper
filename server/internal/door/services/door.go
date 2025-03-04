package services

import (
	"fmt"
	"server/common/ai"
	"server/common/base"
	"server/common/encryption"
	"server/common/http"
	"server/common/middleware/database"
	"server/common/middleware/storage/oss"
	"server/internal/door/models"
	"server/internal/door/repositories"
	"server/internal/door/services/dto"
	"time"
)

var doorRecordRepository = database.NewRepository[repositories.DoorRecordRepository]()
var doorFileRecordRepository = database.NewRepository[repositories.DoorFileRecordRepository]()
var searchSkuRecordRepository = database.NewRepository[repositories.SearchSkuRecordRepository]()
var doorSkuCatPropRepository = database.NewRepository[repositories.DoorSkuCatPropRepository]()

func FindByDoorKeyAndItemKeyAndType(doorKey string, itemKey string, itemType string) (*dto.DoorRecordDTO, error) {
	doorRecord, err := doorRecordRepository.FindByDoorKeyAndItemKeyAndType(doorKey, itemKey, itemType)
	if err != nil {
		return nil, err
	}
	now := base.Now()
	if doorRecord == nil || doorRecord.ExpireTime.ToTime().Before(now.ToTime()) {
		return nil, nil
	}
	doorRecordDTO := database.ToDTO[dto.DoorRecordDTO](doorRecord)
	if doorRecordDTO.OssUrl != "" {
		jsonData, err := convertToJsonData(doorRecordDTO.OssUrl)
		if err != nil {
			return nil, err
		}
		doorRecordDTO.Data = jsonData
	}
	return doorRecordDTO, nil
}

func getPath(doorKey string, itemKey string, itemType string) string {
	return fmt.Sprintf("%s/%s/%s.json", itemType, doorKey, itemKey)
}

func convertToJsonData(path string) (string, error) {
	bytes, err := oss.Get(path)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func storeJsonData(doorRecordDTO *dto.DoorRecordDTO) (string, error) {
	path := getPath(doorRecordDTO.DoorKey, doorRecordDTO.ItemKey, doorRecordDTO.Type)
	return path, oss.Put(path, []byte(doorRecordDTO.Data))
}

func CreateDoorRecord(doorRecordDTO *dto.DoorRecordDTO) (*dto.DoorRecordDTO, error) {
	doorRecord, err := doorRecordRepository.FindByDoorKeyAndItemKeyAndType(doorRecordDTO.DoorKey, doorRecordDTO.ItemKey, doorRecordDTO.Type)
	if err != nil {
		return nil, err
	}
	if doorRecord == nil {
		doorRecord = database.ToPO[models.DoorRecord](doorRecordDTO)
	}
	now := base.Now()
	doorRecord.ExpireTime = base.Time(now.ToTime().Add(time.Hour * 24 * 30))
	doorRecord.UpdatedAt = now
	if doorRecordDTO.Data != "" {
		path, err := storeJsonData(doorRecordDTO)
		if err != nil {
			return nil, err
		}
		doorRecord.OssUrl = path
	}
	doorRecordPO, err := doorRecordRepository.SaveOrUpdate(doorRecord)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorRecordDTO](doorRecordPO), nil
}

func FindDoorFileRecordBySourceAndFileId(source string, fileId string, resourceId uint64) (*dto.DoorFileRecordDTO, error) {
	doorFileRecord, err := doorFileRecordRepository.FindBySourceAndFileId(source, fileId, resourceId)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorFileRecordDTO](doorFileRecord), nil
}

func SaveDoorFileRecord(doorFileRecordDTO *dto.DoorFileRecordDTO) (*dto.DoorFileRecordDTO, error) {
	doorFileRecord, err := doorFileRecordRepository.FindBySourceAndResourceIdAndFileKey(doorFileRecordDTO.Source, doorFileRecordDTO.ResourceId, doorFileRecordDTO.FileKey)
	if err != nil {
		return nil, err
	}
	if doorFileRecord != nil {
		return database.ToDTO[dto.DoorFileRecordDTO](doorFileRecord), nil
	}
	doorFileRecordPO := database.ToPO[models.DoorFileRecord](doorFileRecordDTO)
	saveDoorFileRecord, err := doorFileRecordRepository.SaveOrUpdate(doorFileRecordPO)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorFileRecordDTO](saveDoorFileRecord), nil
}

func FindDoorFileRecordBySourceAndResourceIdAndFileKey(source string, resourceId uint64, fileKey string) (*dto.DoorFileRecordDTO, error) {
	doorFileRecord, err := doorFileRecordRepository.FindBySourceAndResourceIdAndFileKey(source, resourceId, fileKey)
	if err != nil {
		return nil, err
	}
	if doorFileRecord == nil {
		return nil, nil
	}
	return database.ToDTO[dto.DoorFileRecordDTO](doorFileRecord), nil
}

func FindSearchSkuRecordBySearchTypeAndTitle(searchType string, title string) (*dto.SearchSkuRecordDTO, error) {
	hashedTitle := encryption.HashString(title)
	searchSkuRecord, err := searchSkuRecordRepository.FindBySearchTypeAndTitle(searchType, hashedTitle)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SearchSkuRecordDTO](searchSkuRecord), nil
}

func CreateSearchSkuRecord(searchSkuRecordDTO *dto.SearchSkuRecordDTO) (*dto.SearchSkuRecordDTO, error) {
	hashedTitle := encryption.HashString(searchSkuRecordDTO.Title)
	searchSkuRecordDTO.Title = hashedTitle
	searchSkuRecord, err := searchSkuRecordRepository.FindBySearchTypeAndTitle(searchSkuRecordDTO.Type, hashedTitle)
	if err != nil {
		return nil, err
	}
	if searchSkuRecord != nil {
		searchSkuRecord.SkuId = searchSkuRecordDTO.SkuId
	} else {
		searchSkuRecord = database.ToPO[models.SearchSkuRecord](searchSkuRecordDTO)
	}
	saveSearchSkuRecord, err := searchSkuRecordRepository.SaveOrUpdate(searchSkuRecord)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SearchSkuRecordDTO](saveSearchSkuRecord), nil
}

func GetDoorSkuCatProps(source string, itemKey string) ([]*dto.DoorSkuCatPropDTO, error) {
	doorSkuCatProps, err := doorSkuCatPropRepository.FindBySourceAndItemKey(source, itemKey)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.DoorSkuCatPropDTO](doorSkuCatProps), nil
}

func CreateDoorSkuCatProp(doorSkuCatPropDTO []*dto.DoorSkuCatPropDTO) error {
	for _, doorSkuCatPropDTO := range doorSkuCatPropDTO {
		doorSkuCatProp, err := doorSkuCatPropRepository.FindBySourceAndItemKeyAndPropKey(doorSkuCatPropDTO.Source, doorSkuCatPropDTO.ItemKey, doorSkuCatPropDTO.PropKey)
		if err != nil {
			return err
		}
		if doorSkuCatProp != nil {
			doorSkuCatProp.PropValue = doorSkuCatPropDTO.PropValue
		} else {
			doorSkuCatProp = database.ToPO[models.DoorSkuCatProp](doorSkuCatPropDTO)
		}
		_, err = doorSkuCatPropRepository.SaveOrUpdate(doorSkuCatProp)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetDoorSkuCatPropsByAi(params map[string]string) ([]*dto.DoorSkuCatPropDTO, error) {
	// // http 请求 ai 服务
	body, err := http.Post(ai.Entity.Url, nil, params, nil)
	if err != nil {
		return nil, err
	}
	return nil, nil
}
