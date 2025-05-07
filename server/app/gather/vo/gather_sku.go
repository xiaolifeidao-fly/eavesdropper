package vo

type FavoriteGatherSkuVO struct {
	ID         uint64 `uri:"id"`
	IsFavorite bool   `json:"isFavorite"`
}
