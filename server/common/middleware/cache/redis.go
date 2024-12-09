package cache

import "github.com/redis/go-redis/v9"

type Redis struct {
	Addr     string `json:"addr"`
	Password string `json:"password"`
	Prefix   string `json:"prefix"`
}

func (r *Redis) GetOptions() *redis.Options {
	return &redis.Options{
		Addr:     r.Addr,
		Password: r.Password,
	}
}
