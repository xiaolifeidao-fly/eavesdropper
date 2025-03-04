package ai

func Setup(entity *AiEntity) {
	if entity == nil {
		panic("oss entity is nil")
	}
	entity.Default()
}
