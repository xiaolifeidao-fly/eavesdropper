package vo

type VO interface{}

type BaseVO struct {
}

type LabelValueVO struct {
	Label string `json:"label"`
	Value string `json:"value"`
	Color string `json:"color"`
}
