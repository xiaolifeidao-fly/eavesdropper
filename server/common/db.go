package common

import "gorm.io/gorm"

// GetDB
// @Description 获取数据库
func GetDB() *gorm.DB {
	return Runtime.GetDbByKey("*")
}
