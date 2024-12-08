package runtime

import (
	"net/http"
	"server/library/logger"
	"server/library/storage"
	"sync"

	"gorm.io/gorm"
)

type Application struct {
	mux sync.RWMutex

	dbs    map[string]*gorm.DB
	logger logger.Logger
	engine http.Handler
	cache  storage.AdapterCache
}

func NewApplication() *Application {
	return &Application{
		dbs: make(map[string]*gorm.DB),
	}
}

func (a *Application) SetDb(key string, db *gorm.DB) {
	a.mux.Lock()
	defer a.mux.Unlock()

	a.dbs[key] = db
}

func (a *Application) GetDb() map[string]*gorm.DB {
	a.mux.RLock()
	defer a.mux.RUnlock()

	return a.dbs
}

func (a *Application) GetDbByKey(key string) *gorm.DB {
	a.mux.RLock()
	defer a.mux.RUnlock()

	if db, ok := a.dbs["*"]; ok {
		return db
	}

	return a.dbs[key]
}

func (a *Application) SetLogger(l logger.Logger) {
	a.logger = l
	logger.DefaultLogger = l
}

func (a *Application) GetLogger() logger.Logger {
	if a.logger == nil {
		a.logger = logger.DefaultLogger
	}
	return a.logger
}

func (a *Application) GetEngine() http.Handler {
	return a.engine
}

func (a *Application) SetEngine(engine http.Handler) {
	a.engine = engine
}

func (a *Application) GetCacheAdapter() storage.AdapterCache {
	return a.cache
}

func (a *Application) SetCacheAdapter(cache storage.AdapterCache) {
	a.cache = cache
}
