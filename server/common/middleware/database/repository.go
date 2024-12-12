package database

import (
	"server/common/base/page"
	"server/library/database/gorm/search"

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

// GetOne 获取单个
func (r *Repository[T]) GetOne(sql string, values ...interface{}) (T, error) {
	var repoValue *T = new(T)
	err := r.Db.Raw(sql, values).Scan(&repoValue).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return *repoValue, err
		}
		return *repoValue, err
	}
	return *repoValue, nil
}

// GetList 获取列表
func (r *Repository[T]) GetList(sql string, values ...interface{}) ([]T, error) {
	var entities []T
	err := r.Db.Raw(sql, values).Find(&entities).Error
	if err == gorm.ErrRecordNotFound {
		return []T{}, err
	}
	return entities, nil
}

// Execute 执行SQL
func (r *Repository[T]) Execute(sql string, params map[string]interface{}) error {
	return r.Db.Exec(sql, params).Error
}

// FindById 根据ID查找
func (r *Repository[T]) FindById(id uint64) (T, error) {
	var entity T
	err := r.Db.First(&entity, id).Error
	if err == gorm.ErrRecordNotFound {
		return entity, err
	}
	return entity, nil
}

// FindAll 查找所有
func (r *Repository[T]) FindAll() ([]T, error) {
	var entities []T
	result := r.Db.Find(&entities)
	if result.Error != nil {
		return []T{}, result.Error
	}
	return entities, result.Error

}

// Create 创建
func (r *Repository[T]) Create(e T) (T, error) {
	if e, ok := interface{}(e).(Entity); ok {
		e.Init()
	}
	err := r.Db.Create(e).Error
	if err != nil {
		return e, err
	}
	return e, nil
}

// SaveOrUpdate 保存或更新
func (r *Repository[T]) SaveOrUpdate(e T) (T, error) {
	if e, ok := interface{}(e).(Entity); ok {
		e.Init()
	}
	err := r.Db.Save(e).Error
	if err != nil {
		return e, err
	}
	return e, nil
}

// Delete 删除
func (r *Repository[T]) Delete(id uint64) error {
	var entity T
	err := r.Db.Delete(&entity, id).Error
	if err != nil {
		return err
	}
	return nil
}

// Page 分页
func (r *Repository[T]) Page(entity T, queryParam interface{}, query page.Query, list interface{}, count *int64) error {
	var err error

	db := r.Db.Model(entity).Debug()

	if err = db.Scopes(r.buildCondition(queryParam, true)).Count(count).Error; err != nil {
		return err
	}

	if *count <= 0 {
		return nil
	}

	if err = db.Scopes(r.buildSelect(list), r.buildCondition(queryParam, false), r.buildPaginate(query)).Find(list).Error; err != nil {
		return err
	}

	return nil
}

// FindAllByCondition 根据条件查找列表
func (r *Repository[T]) FindAllByCondition(entity T, queryParam interface{}, list interface{}) error {
	var err error

	db := r.Db.Debug().Model(entity)

	if err = db.Scopes(r.buildSelect(list), r.buildCondition(queryParam, false)).Find(list).Error; err != nil {
		return err
	}

	return nil
}

func (r *Repository[T]) buildCondition(queryParam interface{}, isCount bool) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		condition := &search.GormCondition{}
		search.ResolveSearchQuery(queryParam, condition)

		for _, v := range condition.Join {
			db = db.Joins(v)
		}

		for k, v := range condition.Where {
			db = db.Where(k, v...)
		}

		if !isCount {
			for _, o := range condition.Order {
				db = db.Order(o)
			}
		}

		return db
	}
}

func (r *Repository[T]) buildSelect(list interface{}) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		s := &search.GormSelect{}
		search.ResolveSelect(list, s)
		if len(s.Values) == 0 {
			return db
		}

		db = db.Select(s.Values)
		return db
	}
}

func (r *Repository[T]) buildPaginate(query page.Query) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		pageIndex := query.GetCurrent()
		pageSize := query.GetSize()

		offset := (pageIndex - 1) * pageSize
		if offset < 0 {
			offset = 0
		}
		return db.Offset(offset).Limit(pageSize)
	}
}
