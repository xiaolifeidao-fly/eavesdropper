package search

import (
	"strings"
)

type Condition interface {
	SetWhere(k string, v []interface{})
	SetOrder(k string)
	SetJoin(k string)
}

type GormCondition struct {
	Where map[string][]interface{}
	Order []string
	Join  []string
}

func (e *GormCondition) SetWhere(k string, v []interface{}) {
	if e.Where == nil {
		e.Where = make(map[string][]interface{})
	}
	e.Where[k] = v
}

func (e *GormCondition) SetOrder(k string) {
	if e.Order == nil {
		e.Order = make([]string, 0)
	}
	e.Order = append(e.Order, k)
}

func (e *GormCondition) SetJoin(k string) {
	if e.Join == nil {
		e.Join = make([]string, 0)
	}
	e.Join = append(e.Join, k)
}

type resolveSearchTag struct {
	isValue bool

	Type    string
	Column  string
	Table   string
	Join    string
	As      string
	On      []string
	Default string
}

// makeTag 解析search的tag标签
func makeTag(tag string) *resolveSearchTag {
	r := &resolveSearchTag{
		isValue: true,
	}
	tags := strings.Split(tag, ";")
	var ts []string
	for _, t := range tags {
		ts = strings.Split(t, ":")
		if len(ts) == 0 {
			continue
		}
		switch ts[0] {
		case "type":
			if len(ts) > 1 {
				r.Type = ts[1]
			}
			if r.Type == IsNull {
				r.isValue = false
			}
		case "column":
			if len(ts) > 1 {
				r.Column = ts[1]
			}
		case "table":
			if len(ts) > 1 {
				r.Table = ts[1]
			}
		case "join":
			if len(ts) > 1 {
				r.Join = ts[1]
				r.isValue = false
			}
		case "as":
			if len(ts) > 1 {
				r.As = ts[1]
			}
		case "on":
			if len(ts) > 1 {
				r.On = ts[1:]
			}
		case "default":
			if len(ts) > 1 {
				r.Default = ts[1]
			}
		}
	}

	if r.As == "" {
		r.As = r.Join
	}
	return r
}
