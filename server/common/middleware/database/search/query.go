package search

import (
	"fmt"
	"reflect"
	"strings"
)

const (
	// FromQueryTag tag标记
	FromQueryTag = "search"
)

// ResolveSearchQuery 解析
func ResolveSearchQuery(q interface{}, condition Condition) {
	qType := reflect.TypeOf(q)
	qValue := reflect.ValueOf(q)
	var tag string
	var ok bool
	var t *resolveSearchTag

	for i := 0; i < qType.NumField(); i++ {
		tag, ok = "", false
		tag, ok = qType.Field(i).Tag.Lookup(FromQueryTag)
		if !ok {
			//递归调用
			ResolveSearchQuery(qValue.Field(i).Interface(), condition)
			continue
		}
		switch tag {
		case "-":
			continue
		}
		t = makeTag(tag)
		if t.isValue && qValue.Field(i).IsZero() && t.Default == "" {
			continue
		}
		otherSql(t, condition, qValue, i)
	}
}

// 查询条件
const (
	Eq         = "eq"     // 等于 =, search:"type:eq;table:auth_user;column:name;"
	Gt         = "gt"     // 大于 >, search:"type:gt;table:auth_user;column:name;"
	Lt         = "lt"     // 小于 <, search:"type:lt;table:auth_user;column:name;"
	Gte        = "gte"    // 大于等于 >=, search:"type:gte;table:auth_user;column:name;"
	Lte        = "lte"    // 小于等于 <=, search:"type:lte;table:auth_user;column:name;"
	Like       = "like"   // 包含 like '%test%', search:"type:like;table:auth_user;column:name;"
	NLike      = "nLike"  // 不包含 not like '%test%', search:"type:nLike;table:auth_user;column:name;"
	StartsWith = "sLike"  // 以…起始 like 'test%', search:"type:sLike;table:auth_user;column:name;"
	EndsWith   = "eLike"  // 以…结束 like '%test', search:"type:eLike;table:auth_user;column:name;"
	In         = "in"     // 在范围内 in (1, 2, 3), search:"type:in;table:auth_user;column:name;"
	NIn        = "nIn"    // 不在范围内 not in (1, 2, 3), search:"type:nIn;table:auth_user;column:name;"
	IsNull     = "isNull" // 为空 is null, search:"type:isNull;table:auth_user;column:name;"

	Order = "order" // 排序, search:"type:order;table:auth_user;column:id;"
	DESC  = "desc"  // 降序
	ASC   = "asc"   // 升序

	Left  = "left"  // 左连, search:"type:left;table:auth_user;join:auth_user;as:user;on:id:id"
	Right = "right" // 右连
	Inner = "inner" // 内连
)

func otherSql(t *resolveSearchTag, condition Condition, qValue reflect.Value, i int) {
	switch t.Type {
	case Left:
		join := "left join `%s` as `%s` on `%s`.`%s` = `%s`.`%s`"
		condition.SetJoin(fmt.Sprintf(
			join,
			t.Join,
			t.As,
			t.As,
			t.On[0],
			t.Table,
			t.On[1],
		))

	// 查询条件
	case Eq:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` = ?", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case Gt:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` > ?", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case Lt:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` < ?", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case Gte:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` >= ?", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case Lte:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` <= ?", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case Like:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` like ?", t.Table, t.Column), []interface{}{"%" + qValue.Field(i).String() + "%"})
	case NLike:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` not like ?", t.Table, t.Column), []interface{}{"%" + qValue.Field(i).String() + "%"})
	case StartsWith:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` like ?", t.Table, t.Column), []interface{}{qValue.Field(i).String() + "%"})
	case EndsWith:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` like ?", t.Table, t.Column), []interface{}{"%" + qValue.Field(i).String()})
	case In:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` in (?)", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case NIn:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` not in (?)", t.Table, t.Column), []interface{}{qValue.Field(i).Interface()})
	case IsNull:
		condition.SetWhere(fmt.Sprintf("`%s`.`%s` is null", t.Table, t.Column), make([]interface{}, 0))

	// 排序
	case Order:
		order := qValue.Field(i).String()
		if t.Default != "" {
			order = t.Default
		}
		switch strings.ToLower(order) {
		case DESC, ASC:
			condition.SetOrder(fmt.Sprintf("`%s`.`%s` %s", t.Table, t.Column, order))
		}
	}
}
