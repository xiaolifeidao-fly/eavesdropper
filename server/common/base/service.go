package base

import (
	"server/common"
	"server/library/logger"
	"server/library/storage"
)

type Service struct {
	OperatorId uint64
	Logger     *logger.Helper
	Cache      storage.AdapterCache
}

func NewService() *Service {
	return &Service{
		OperatorId: common.GetLoginUserID(),
		Logger:     common.GetLogger(),
		Cache:      common.Runtime.GetCacheAdapter(),
	}
}

func (s *Service) GetOperatorId() uint64 {
	return s.OperatorId
}
