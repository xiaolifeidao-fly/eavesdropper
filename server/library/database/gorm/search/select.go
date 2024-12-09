package search

import (
	"fmt"
	"reflect"
	"strings"
)

const (
	// SelectTag 选择字段 select:"table:auth_user;column:id;as:userId"
	SelectTag = "select"
)

type GormSelect struct {
	Values []string
}

func (s *GormSelect) SetValue(v string) {
	if s.Values == nil {
		s.Values = make([]string, 0)
	}
	s.Values = append(s.Values, v)
}

func (s *GormSelect) makeTag(tag string) {
	tags := strings.Split(tag, ";")
	var table, column, as string
	for _, tag := range tags {
		ts := strings.Split(tag, ":")
		if len(ts) != 2 {
			continue
		}
		switch ts[0] {
		case "table":
			table = ts[1]
		case "column":
			column = ts[1]
		case "as":
			as = ts[1]
		}
	}

	if len(table) == 0 || len(column) == 0 {
		return
	}

	if len(as) == 0 {
		as = column
	}
	s.SetValue(fmt.Sprintf("%s.%s as %s", table, column, as))
}

func ResolveSelect(q interface{}, g *GormSelect) {
	qType := reflect.TypeOf(q)
	qValue := reflect.ValueOf(q)

	var elemType reflect.Type

	// 如果是指针，则取指针指向的类型
	if qType.Kind() == reflect.Ptr {
		if qValue.Elem().Kind() == reflect.Slice { // 如果是指针并且指向的是切片，则取切片元素的类型
			elemType = qValue.Elem().Type().Elem()
			if elemType.Kind() == reflect.Ptr {
				elemType = elemType.Elem()
			}
		} else {
			elemType = qType.Elem() // 如果是指针并且指向的不是切片，则取指针指向的类型
		}
	} else if qType.Kind() == reflect.Slice { // 如果输入是一个切片，则取切片元素的类型
		if qType.Elem().Kind() == reflect.Ptr {
			elemType = qType.Elem().Elem()
		} else if qType.Elem().Kind() == reflect.Struct {
			elemType = qType.Elem()
		}
	} else if qType.Kind() == reflect.Struct {
		elemType = qType
	}

	// 确保元素是结构体类型
	if elemType.Kind() == reflect.Struct {
		// 遍历结构体字段
		for i := 0; i < elemType.NumField(); i++ {
			field := elemType.Field(i)
			selectTag, ok := field.Tag.Lookup(SelectTag)
			if !ok {
				continue
			}
			g.makeTag(selectTag)
		}
	}
}
