package dto

type SkuBaseItem struct {
	DoorId    uint64   `json:"doorId"`
	ItemId    string   `json:"itemId"`
	Title     string   `json:"title"`
	TitleIcon string   `json:"titleIcon"`
	Images    []string `json:"images"`
}

type SkuProperty struct {
	PropertyId    string `json:"propertyId"`
	PropertyValue string `json:"propertyValue"`
}
