package runtime

import (
	"net/http"
	"server/library/logger"
	"server/library/storage"

	"gorm.io/gorm"
)

type Runtime interface {
	SetDb(key string, db *gorm.DB)
	GetDb() map[string]*gorm.DB
	GetDbByKey(key string) *gorm.DB

	SetLogger(logger logger.Logger)
	GetLogger() logger.Logger

	GetEngine() http.Handler
	SetEngine(engine http.Handler)

	GetCacheAdapter() storage.AdapterCache
	SetCacheAdapter(cache storage.AdapterCache)
}
