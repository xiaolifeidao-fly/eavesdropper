package database

import (
	"fmt"
	"server/common"
	"sync"

	"gorm.io/gorm"
)

// 存储仓库实例的映射
var (
	repoInstances = make(map[string]interface{})
	repoMutex     sync.Mutex
)

func NewRepository[R any]() *R {
	repoType := getTypeName[R]()
	repoMutex.Lock()
	defer repoMutex.Unlock()

	var repoValue *R = new(R)
	repoInstances[repoType] = repoValue
	return repoValue
}

func RepositoryInit() {
	repoMutex.Lock()
	defer repoMutex.Unlock()

	for _, repo := range repoInstances {
		if repo, ok := any(repo).(interface{ SetDb(*gorm.DB) }); ok {
			Db := common.Runtime.GetDbByKey("*")
			repo.SetDb(Db)
		}
	}
}

// func GetRepository[R any]() *R {
// 	repoType := getTypeName[R]()
// 	repoMutex.Lock()
// 	defer repoMutex.Unlock()

// 	// 检查是否已经存在实例
// 	if instance, exists := repoInstances[repoType]; exists {
// 		return instance.(*R)
// 	}

// 	// 创建新实例并保存到映射中
// 	var repoValue *R = new(R)
// 	if repo, ok := any(repoValue).(interface{ SetDb(*gorm.DB) }); ok {
// 		Db := common.Runtime.GetDbByKey("*")
// 		repo.SetDb(Db)
// 	}
// 	repoInstances[repoType] = repoValue
// 	return repoValue

// }

// 获取类型名称，用于作为键
func getTypeName[R any]() string {
	return fmt.Sprintf("%T", new(R))
}
