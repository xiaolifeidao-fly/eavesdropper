package oss

func Setup(entity *OssEntity) {
	if entity == nil {
		panic("oss entity is nil")
	}
	entity.Default()

	var err error

	var oss AdapterOss
	if oss, err = NewAliyun(entity); err != nil {
		panic(err.Error())
	}
	Oss = oss
}
