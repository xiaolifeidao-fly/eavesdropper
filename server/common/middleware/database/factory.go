package database

import (
	"fmt"
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

func RepositoryInit(DB *gorm.DB) {
	repoMutex.Lock()
	defer repoMutex.Unlock()

	for _, repo := range repoInstances {
		if repo, ok := any(repo).(interface{ SetDb(*gorm.DB) }); ok {
			repo.SetDb(DB)
		}
	}
}

// 获取类型名称，用于作为键
func getTypeName[R any]() string {
	return fmt.Sprintf("%T", new(R))
}
