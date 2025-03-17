package repositories

import (
	"server/common/middleware/database"
	"server/internal/door/models"
)

type DoorRecordRepository struct {
	database.Repository[*models.DoorRecord]
}

type SearchSkuRecordRepository struct {
	database.Repository[*models.SearchSkuRecord]
}

func (r *DoorRecordRepository) FindByDoorKeyAndItemKeyAndType(doorKey string, itemKey string, itemType string) (*models.DoorRecord, error) {
	return r.GetOne("select * from door_record where door_key = ? and item_key = ? and type = ?", doorKey, itemKey, itemType)
}

type DoorFileRecordRepository struct {
	database.Repository[*models.DoorFileRecord]
}

type DoorCatPropRepository struct {
	database.Repository[*models.DoorCatProp]
}

func (r *DoorCatPropRepository) FindBySourceAndItemKey(source string, itemKey string) ([]*models.DoorCatProp, error) {
	return r.GetList("select * from door_cat_prop where source = ? and item_key = ?", source, itemKey)
}
func (r *DoorCatPropRepository) FindBySourceAndItemKeyAndPropKey(source string, itemKey string, propKey string) (*models.DoorCatProp, error) {
	return r.GetOne("select * from door_cat_prop where source = ? and item_key = ? and prop_key = ?", source, itemKey, propKey)
}

func (r *DoorFileRecordRepository) FindBySourceAndFileId(source string, fileId string, resourceId uint64) (*models.DoorFileRecord, error) {
	return r.GetOne("select * from door_file_record where source = ? and file_id = ? and resource_id = ?", source, fileId, resourceId)
}

func (r *DoorFileRecordRepository) FindBySourceAndResourceIdAndFileKey(source string, resourceId uint64, fileKey string) (*models.DoorFileRecord, error) {
	return r.GetOne("select * from door_file_record where source = ? and resource_id = ? and file_key = ?", source, resourceId, fileKey)
}

func (r *SearchSkuRecordRepository) FindBySearchTypeAndPddSkuId(searchType string, pddSkuId string) (*models.SearchSkuRecord, error) {
	return r.GetOne("select * from search_sku_record where type = ? and pdd_sku_id = ? order by id desc limit 1", searchType, pddSkuId)
}

type DoorCategoryRepository struct {
	database.Repository[*models.DoorCategory]
}

func (r *DoorCategoryRepository) FindByPddCatId(pddCatId string) (*models.DoorCategory, error) {
	return r.GetOne("select * from door_category where pdd_cat_id = ?", pddCatId)
}
