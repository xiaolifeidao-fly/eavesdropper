package database

import (
	"log"
	"testing"
)

func TestSimpleSetupDatabase(t *testing.T) {
	db, err := SimpleSetupDatabase("test", &Database{
		Driver: "mysql",
		Source: "root:root@tcp(127.0.0.1:3306)/aris_test?charset=utf8&parseTime=True&loc=Local",
	})

	if err != nil {
		log.Fatalln("error: ", err)
	}

	user := &map[string]interface{}{}
	result := db.Table("auth_user").Take(user)
	if result.Error != nil {
		log.Fatalln("error: ", result.Error)
	}
	log.Println("user: ", user)
}
