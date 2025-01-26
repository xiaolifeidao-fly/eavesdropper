package server

var Entity = new(ServerEntity)

type ServerEntity struct {
	Mode   string `json:"mode"`   // 模式
	Name   string `json:"name"`   // 服务名称
	Host   string `json:"host"`   // 主机
	Port   string `json:"port"`   // 端口
	Prefix string `json:"prefix"` // 路由前缀
}

func (entity *ServerEntity) Default() {
	if entity.Mode == "" {
		entity.Mode = "dev"
	}
	if entity.Name == "" {
		entity.Name = "server"
	}
	if entity.Host == "" {
		entity.Host = ""
	}
	if entity.Port == "" {
		entity.Port = "8080"
	}
}
