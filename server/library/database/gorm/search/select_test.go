package search

import (
	"fmt"
	"testing"
	"time"
)

type SelectValue struct {
	ID        int       `json:"id" select:"table:auth_user;column:id"`
	Nickname  string    `json:"nickname" select:"table:auth_user;column:nickname"`
	Username  string    `json:"username" select:"table:auth_user;column:username"`
	UpdatedAt time.Time `json:"updatedAt" select:"table:auth_user;column:updated_at"`
	CreatedAt time.Time `json:"createdAt" select:"-"`
}

func TestResolveSelect(t *testing.T) {
	// s := &GormSelect{}
	// ResolveSelect(SelectValue{}, s)
	// fmt.Println(s.Values)

	// s2 := &GormSelect{}
	// ResolveSelect(&SelectValue{}, s2)
	// fmt.Println(s2.Values)

	s3 := &GormSelect{}
	list := make([]*SelectValue, 0)
	ResolveSelect(list, s3)
	fmt.Println(s3.Values)

	// s4 := &GormSelect{}
	// list2 := make([]*SelectValue, 0)
	// ResolveSelect(list2, s4)
	// fmt.Println(s4.Values)
}
