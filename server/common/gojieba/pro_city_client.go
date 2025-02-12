package gojieba

import (
	"server/common/goroutine"
	"strings"
	"sync"

	"github.com/yanyiwu/gojieba"
)

var (
	jiebaMap = goroutine.NewThreadLocal()
	mu       sync.Mutex // 添加互斥锁
)

// 拆分省份和城市
func SplitProvinceCity(input string) (string, string) {
	jieba, ok := jiebaMap.Get()
	if !ok {
		mu.Lock()         // 加锁
		defer mu.Unlock() // 解锁
		jieba = gojieba.NewJieba()
		jiebaMap.Set(jieba)
	}
	jiebaClient := jieba.(*gojieba.Jieba)
	words := jiebaClient.Cut(input, true) // 精确模式分词
	city := strings.Join(words[1:], "")   // 连接剩余部分作为城市
	return words[0], city
}
