package environment

import (
	"github.com/zeromicro/go-zero/core/stores/redis"
	"gorm.io/gorm"
	"server-zero/config"
	"server-zero/internal/svc/xhssvc"
)

type SvcEnv struct {
	XhsSvc *xhssvc.XhsSvc
}

func NewSvc(rds *redis.Redis, dbEngin *gorm.DB, c config.Config) *SvcEnv {
	return &SvcEnv{
		XhsSvc: xhssvc.NewXhsSvc(c.XhsSvc.Host),
	}
}
