package ai

var Entity = new(AiEntity)

type AiEntity struct {
	Url string `json:"url"`
}

func (entity *AiEntity) Default() {
}
