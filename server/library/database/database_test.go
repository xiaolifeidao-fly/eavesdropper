package database

import (
	"log"
	"testing"
)

func TestDBConnection(t *testing.T) {
	configure := NewDBConfig("root:root@tcp(127.0.0.1:3306)/aris_test?charset=utf8&parseTime=True&loc=Asia%2FShanghai&timeout=1000ms", 10, 100, 10, 100)
	db, err := configure.Init("mysql", nil)
	if err != nil {
		log.Fatalln(err)
	}

	user := &map[string]interface{}{}
	result := db.Table("auth_user").Take(user)
	if result.Error != nil {
		log.Fatalln("error: ", result.Error)
	}
	log.Println("user: ", user)
}
