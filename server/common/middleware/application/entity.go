package application

var ApplicationConfig = new(Application)

type Application struct {
	Mode   string `json:"mode"`
	Host   string `json:"host"`
	Port   int    `json:"port"`
	Prefix string `json:"prefix"`
}
