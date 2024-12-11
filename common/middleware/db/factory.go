package db

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

func GetRepository[R any]() *R {
	repoType := getTypeName[R]()
	repoMutex.Lock()
	defer repoMutex.Unlock()

	// 检查是否已经存在实例
	if instance, exists := repoInstances[repoType]; exists {
		return instance.(*R)
	}

	// 创建新实例并保存到映射中
	var repoValue *R = new(R)
	if repo, ok := any(repoValue).(interface{ SetDb(*gorm.DB) }); ok {
		repo.SetDb(Db)
	}
	repoInstances[repoType] = repoValue
	return repoValue

}

// 获取类型名称，用于作为键
func getTypeName[R any]() string {
	return fmt.Sprintf("%T", new(R))
}
