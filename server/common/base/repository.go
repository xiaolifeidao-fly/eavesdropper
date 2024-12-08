package base

import (
	"server/common"
	"server/library/database/gorm/search"

	"gorm.io/gorm"
)

const (
	DefaultDBKey = "*"
)

type Repository[T ModelInterface] struct {
	DB *gorm.DB
}

func NewRepository[T ModelInterface](dbs ...*gorm.DB) *Repository[T] {
	db := getDB(dbs...) // 获取数据库
	return &Repository[T]{DB: db}
}

// getDB 获取数据库
func getDB(dbs ...*gorm.DB) *gorm.DB {
	if len(dbs) > 0 {
		return dbs[0]
	}
	return common.Runtime.GetDbByKey(DefaultDBKey)
}

// Create 创建
func (r *Repository[T]) Create(entity T) error {
	return r.DB.Debug().Create(entity).Error
}

// BatchCreate 批量创建
func (r *Repository[T]) BatchCreate(entities []T) error {
	return r.DB.Debug().Create(entities).Error
}

// Update 更新
func (r *Repository[T]) Update(entity T) error {
	return r.DB.Debug().Save(entity).Error
}

// FindByID 根据ID查找
func (r *Repository[T]) FindByID(id uint64, entity T) error {
	return r.DB.Debug().Model(entity).Find(entity, "id = ?", id).Error
}

// FindAll 查找所有
func (r *Repository[T]) FindAll(entities []T) error {
	return r.DB.Debug().Model(entities).Find(entities).Error
}

// Delete 删除
func (r *Repository[T]) Delete(entity T) error {
	entity.SetDeletedAt()
	return r.DB.Debug().Select("DeletedAt", "UpdatedBy").Updates(entity).Error
}

// Page 分页
func (r *Repository[T]) Page(entity T, req interface{}, pageInfo Page, list interface{}, count *int64) error {
	var err error

	db := r.DB.Model(entity).Debug()

	if err = db.Scopes(r.buildCondition(req, true)).Count(count).Error; err != nil {
		return err
	}

	if *count <= 0 {
		return nil
	}

	if err = db.Scopes(r.buildSelect(list), r.buildCondition(req, false), r.buildPaginate(pageInfo)).Find(list).Error; err != nil {
		return err
	}

	return nil
}

// FindAllByCondition 根据条件查找列表
func (r *Repository[T]) FindAllByCondition(entity T, req interface{}, list interface{}) error {
	var err error

	db := r.DB.Debug().Model(entity)

	if err = db.Scopes(r.buildSelect(list), r.buildCondition(req, false)).Find(list).Error; err != nil {
		return err
	}

	return nil
}

func (r *Repository[T]) buildCondition(req interface{}, isCount bool) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		condition := &search.GormCondition{}
		search.ResolveSearchQuery(req, condition)

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

func (r *Repository[T]) buildPaginate(pageInfo Page) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		pageIndex := pageInfo.GetCurrent()
		pageSize := pageInfo.GetSize()

		offset := (pageIndex - 1) * pageSize
		if offset < 0 {
			offset = 0
		}
		return db.Offset(offset).Limit(pageSize)
	}
}
