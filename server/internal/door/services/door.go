package services

import (
	"fmt"
	"server/common/base"
	"server/common/http"
	"server/common/middleware/ai"
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
var doorCatPropRepository = database.NewRepository[repositories.DoorCatPropRepository]()
var doorCategoryRepository = database.NewRepository[repositories.DoorCategoryRepository]()

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

func FindSearchSkuRecordBySearchTypeAndPddSkuId(searchType string, pddSkuId string) (*dto.SearchSkuRecordDTO, error) {
	searchSkuRecord, err := searchSkuRecordRepository.FindBySearchTypeAndPddSkuId(searchType, pddSkuId)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.SearchSkuRecordDTO](searchSkuRecord), nil
}

func CreateSearchSkuRecord(searchSkuRecordDTO *dto.SearchSkuRecordDTO) (*dto.SearchSkuRecordDTO, error) {
	searchSkuRecord, err := searchSkuRecordRepository.FindBySearchTypeAndPddSkuId(searchSkuRecordDTO.Type, searchSkuRecordDTO.PddSkuId)
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

func GetDoorCatProps(source string, itemKey string) ([]*dto.DoorCatPropDTO, error) {
	doorCatProps, err := doorCatPropRepository.FindBySourceAndItemKey(source, itemKey)
	if err != nil {
		return nil, err
	}
	return database.ToDTOs[dto.DoorCatPropDTO](doorCatProps), nil
}

func CreateDoorCatProp(doorCatPropDTO []*dto.DoorCatPropDTO) error {
	for _, doorCatPropDTO := range doorCatPropDTO {
		doorCatProp, err := doorCatPropRepository.FindBySourceAndItemKeyAndPropKey(doorCatPropDTO.Source, doorCatPropDTO.ItemKey, doorCatPropDTO.PropKey)
		if err != nil {
			return err
		}
		if doorCatProp != nil {
			doorCatProp.PropValue = doorCatPropDTO.PropValue
		} else {
			doorCatProp = database.ToPO[models.DoorCatProp](doorCatPropDTO)
		}
		_, err = doorCatPropRepository.SaveOrUpdate(doorCatProp)
		if err != nil {
			return err
		}
	}
	return nil
}

func GetDoorCatPropsByAi(params map[string]interface{}) (any, error) {
	// // http 请求 ai 服务
	header := map[string]string{
		"Content-Type": "application/json",
	}
	body, err := http.Post(ai.Entity.Url, params, "", header)
	if err != nil {
		return nil, err
	}
	if body != nil {
		if body["code"] == float64(0) {
			return body["data"], nil
		}
	}
	return nil, nil
}

func GetDoorCategoryByPddCatId(pddCatId string) (*dto.DoorCategoryDTO, error) {
	doorCategory, err := doorCategoryRepository.FindByPddCatId(pddCatId)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorCategoryDTO](doorCategory), nil
}

func CreateDoorCategory(doorCategoryDTO *dto.DoorCategoryDTO) (*dto.DoorCategoryDTO, error) {
	doorCategory, err := doorCategoryRepository.FindByPddCatId(doorCategoryDTO.PddCatId)
	if err != nil {
		return nil, err
	}
	if doorCategory != nil {
		doorCategory.TbCatId = doorCategoryDTO.TbCatId
		doorCategory.TbCatName = doorCategoryDTO.TbCatName
	} else {
		doorCategory = database.ToPO[models.DoorCategory](doorCategoryDTO)
	}
	doorCategory, err = doorCategoryRepository.SaveOrUpdate(doorCategory)
	if err != nil {
		return nil, err
	}
	return database.ToDTO[dto.DoorCategoryDTO](doorCategory), nil
}
