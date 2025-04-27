package vo

type GatherBatchInfoVO struct {
	ID uint64 `uri:"id"`
}

type GatherBatchSkuListVO struct {
	ID      uint64 `uri:"id"`
	SkuName string `json:"skuName" form:"skuName"`
}
