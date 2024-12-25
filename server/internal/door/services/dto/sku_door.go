package dto

type SkuBaseItem struct {
	SkuId     uint64   `json:"skuId"`
	ItemId    string   `json:"itemId"`
	Title     string   `json:"title"`
	TitleIcon string   `json:"titleIcon"`
	Images    []string `json:"images"`
}

type SkuProperty struct {
	PropertyId    string `json:"propertyId"`
	PropertyValue string `json:"propertyValue"`
}
