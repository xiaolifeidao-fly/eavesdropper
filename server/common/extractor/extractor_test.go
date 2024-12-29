package extractor

import (
	"encoding/json"
	"os"
	"testing"
)

func TestResolveJSON(t *testing.T) {
	var err error

	// 读取文件
	var input []byte
	if input, err = os.ReadFile("sku.json"); err != nil {
		t.Errorf("read file error: %v", err)
		return
	}

	var rule []byte
	if rule, err = os.ReadFile("rule.json"); err != nil {
		t.Errorf("read file error: %v", err)
		return
	}
	ruleMap := make(map[string]interface{})
	if err = json.Unmarshal(rule, &ruleMap); err != nil {
		t.Errorf("unmarshal rule error: %v", err)
		return
	}

	skuPublishInfoMap := ResolveJSON(string(input), ruleMap)
	t.Logf("skuPublishInfoMap: %v", skuPublishInfoMap)
}
