GOOS=linux GOARCH=amd64 go build -o server-zero cmd/main.go

scp server-zero root@111.180.188.251:/data/program/app/go_test
