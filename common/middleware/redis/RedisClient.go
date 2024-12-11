package redis

import (
	"fmt"
	"github.com/go-redis/redis"
	"time"
)

//// Rdb 声明一个全局的rdb变量
//var Rdb *redis.ClusterClient
//
//func InitRedisClient(addrs []string) (err error) {
//	Rdb = redis.NewClusterClient(&redis.ClusterOptions{
//		//Addrs: []string{"172.16.49.105:6379", "172.16.49.102:6380", "172.16.49.105:6380", "172.16.49.101:6379", "172.16.49.102:6379", "172.16.49.101:6380"},
//		Addrs: addrs,
//	})
//	_, err = Rdb.Ping().Result()
//	if err != nil {
//		return err
//	}
//	return nil
//}

// Rdb 声明一个全局的rdb变量
var Rdb *redis.Client

func InitRedisClient(addr string, password string) (err error) {
	Rdb = redis.NewClient(&redis.Options{
		//Addrs: []string{"172.16.49.105:6379", "172.16.49.102:6380", "172.16.49.105:6380", "172.16.49.101:6379", "172.16.49.102:6379", "172.16.49.101:6380"},
		Addr:     addr,
		Password: password,
	})
	_, err = Rdb.Ping().Result()
	if err != nil {
		return err
	}
	return nil
}

func SetEx(key string, value string, seconds int64) {
	err := Rdb.Set(key, value, time.Duration(seconds)*time.Second).Err()
	if err != nil {
		fmt.Printf("redis-setEX failed, err:%v\n", err)
		return
	}
}

func Get(key string) string {
	val, err := Rdb.Get(key).Result()
	if err != nil {
		fmt.Printf("redis-get failed, err:%v\n", err)
	}
	return val
}

func Del(keys ...string) int64 {
	val, err := Rdb.Del(keys[0]).Result()
	if err != nil {
		fmt.Printf("redis-get failed, err:%v\n", err)
	}
	return val
}

func ZScore(key string, member string) float64 {
	val, err := Rdb.ZScore(key, member).Result()
	if err != nil {
		fmt.Printf("redis-zscore failed, err:%v\n", err)
	}
	return val
}

func ZIncrby(key string, score float64, member string) float64 {
	val, err := Rdb.ZIncrBy(key, score, member).Result()
	if err != nil {
		fmt.Printf("redis-Zincrby failed, err:%v\n", err)
	}
	return val
}

func ZRange(key string, start int64, stop int64) []string {
	val, err := Rdb.ZRange(key, start, stop).Result()
	if err != nil {
		fmt.Printf("redis-zscore failed, err:%v\n", err)
	}
	return val
}

func Expire(key string, expiration time.Duration) bool {
	val, err := Rdb.Expire(key, expiration).Result()
	if err != nil {
		fmt.Printf("redis-Zincrby failed, err:%v\n", err)
	}
	return val
}

func ZRem(key string, member ...interface{}) int64 {
	val, err := Rdb.ZRem(key, member).Result()
	if err != nil {
		fmt.Printf("redis-zscore failed, err:%v\n", err)
	}
	return val
}
