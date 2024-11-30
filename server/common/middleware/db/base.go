package db

import (
	"fmt"
	"galactus/common/base/dto"
	"time"

	"github.com/jinzhu/copier"
	"gorm.io/gorm"
)

type BaseRepository[T Entity] interface {
	FindById(id uint) (T, error)
	FindAll() ([]T, error)
	Create(entity T) (T, error)
	SaveOrUpdate(entity T) (T, error)
	Delete(id uint) error
	GetOne(sql string, values ...interface{}) (T, error)
	GetList(sql string, values ...interface{}) ([]T, error)
	Execute(sql string, params map[string]interface{}) error
	SetDb(db *gorm.DB)
}
type Repository[T Entity] struct {
	Db *gorm.DB
}

func (r *Repository[T]) SetDb(db *gorm.DB) {
	r.Db = db
}

func (r *Repository[T]) GetOne(sql string, values ...interface{}) (T, error) {
	var repoValue *T = new(T)
	err := r.Db.Raw(sql, values).Scan(&repoValue).Error
	if err == gorm.ErrRecordNotFound {
		return *repoValue, err
	}
	return *repoValue, nil
}

func (r *Repository[T]) GetList(sql string, values ...interface{}) ([]T, error) {
	var entities []T
	err := r.Db.Raw(sql, values).Find(&entities).Error
	if err == gorm.ErrRecordNotFound {
		return []T{}, err
	}
	return entities, nil
}

func (r *Repository[T]) Execute(sql string, params map[string]interface{}) error {
	return r.Db.Exec(sql, params).Error
}

func (r *Repository[T]) FindById(id uint) (T, error) {
	var entity T
	err := r.Db.First(&entity, id).Error
	if err == gorm.ErrRecordNotFound {
		return entity, err
	}
	return entity, nil
}

func (r *Repository[T]) FindAll() ([]T, error) {
	var entities []T
	result := r.Db.Find(&entities)

	// 检查错误
	if result.Error != nil {
		fmt.Println("Error fetching users:", result.Error)
		return []T{}, result.Error
	}
	return entities, result.Error

}

func (r *Repository[T]) Create(entity T) (T, error) {
	if e, ok := interface{}(entity).(Entity); ok {
		e.Init()
	}
	err := r.Db.Create(entity).Error
	if err != nil {
		return entity, err
	}
	return entity, nil
}

func (r *Repository[T]) SaveOrUpdate(entity T) (T, error) {
	if e, ok := interface{}(entity).(Entity); ok {
		e.Init()
	}
	err := r.Db.Save(entity).Error
	if err != nil {
		return entity, err
	}
	return entity, nil
}

func (r *Repository[T]) Delete(id uint) error {
	var entity T
	err := r.Db.Delete(&entity, id).Error
	if err != nil {
		return err
	}
	return nil
}

type Entity interface {
	TableName() string
	Init()
}

type BaseEntity struct {
	Id          int       `orm:"column(id);auto" description:"主键"`
	Active      int8      `gorm:"column(active);default:1;" description:"记录是否有效(1有效，0无效)，逻辑删除标识"`
	CreatedTime time.Time `gorm:"column(created_time);type:timestamp;default:CURRENT_TIMESTAMP" description:"创建时间"`
	UpdatedTime time.Time `gorm:"column(updated_time);type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" description:"更新时间"`
	CreatedBy   string    `orm:"column(created_by);size(32);null" description:"创建人"`
	UpdatedBy   string    `orm:"column(updated_by);size(32);null" description:"更新人"`
}

func (e *BaseEntity) TableName() string {
	return ""
}

func (e *BaseEntity) Init() {
	if e.CreatedTime.IsZero() {
		e.CreatedTime = time.Now()
	}
	if e.UpdatedTime.IsZero() {
		e.UpdatedTime = time.Now()
	}
}

func ToPO[V any](dto dto.DTO) *V {
	var voInstance V
	copier.Copy(&voInstance, dto)
	return &voInstance
}

func ToPOs[V any, D dto.DTO](dtos []D) []*V {
	var vos []*V
	for _, dto := range dtos {
		vos = append(vos, ToPO[V](dto))
	}
	return vos
}

func ToDTO[D any](po Entity) *D {
	var dtoInstance D
	copier.Copy(&dtoInstance, po)
	return &dtoInstance
}

func ToDTOs[D any, P Entity](vos []P) []*D {
	var dtos []*D
	for _, vo := range vos {
		dtos = append(dtos, ToDTO[D](vo))
	}
	return dtos
}
