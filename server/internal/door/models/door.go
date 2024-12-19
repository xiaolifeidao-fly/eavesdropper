package models

import (
	"server/common/base"
	"server/common/middleware/database"
)

type DoorRecord struct {
	database.BaseEntity
	ItemKey    string    `json:"item_key"`
	Type       string    `json:"type"`
	DoorKey    string    `json:"door_key"`
	Url        string    `json:"url"`
	Data       string    `json:"data"`
	ExpireTime base.Time `json:"expire_time"`
}

/**
 给出DoorRecord的表创建语句
 create table door_record (
	id bigint not null auto_increment,
	created_at datetime not null,
	updated_at datetime not null,
	deleted_at datetime,
	item_key varchar(255) not null,
	item_type varchar(255) not null,
	door_key varchar(255) not null,
	url varchar(255) not null,
	data text not null,
	expire_time datetime not null,
	primary key (id)
) engine=InnoDB default charset=utf8mb4;
*/

func (u *DoorRecord) TableName() string {
	return "door_record"
}
