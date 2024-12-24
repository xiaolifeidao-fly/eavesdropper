package logger

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const timeFormat = "2006-01-02"

type FileWriter struct {
	currentFile *os.File

	input      chan []byte // 输入通道
	basePath   string      // 基础文件路径
	pathSuffix string      // 文件路径后缀
	num        uint        // 文件编号
	cap        int         // 切割文件大小,MB
}

func NewFileWriter(basePath string, cap int) *FileWriter {
	if basePath == "" {
		basePath = "logs"
	}

	// 创建基础文件夹
	if _, err := os.Stat(basePath); os.IsNotExist(err) {
		if err := os.MkdirAll(basePath, 0755); err != nil {
			panic(err)
		}
	}

	fileWriter := FileWriter{
		input:      make(chan []byte, 1000),
		basePath:   basePath,
		pathSuffix: "log",
		num:        1,
		cap:        cap << 20, // 转为byte
	}

	var err error
	var filename string

	for {
		filename = fileWriter.generateFileName()
		_, err = os.Stat(filename)
		if err != nil {
			if os.IsNotExist(err) {
				if fileWriter.num > 1 {
					fileWriter.num--
					filename = fileWriter.generateFileName()
				}
				break
			}
			panic(err)
		}
		fileWriter.num++
		if fileWriter.cap == 0 {
			break
		}
	}

	fileWriter.currentFile, err = os.OpenFile(filename, os.O_WRONLY|os.O_APPEND|os.O_CREATE|os.O_SYNC, 0600)
	if err != nil {
		panic(err)
	}

	go fileWriter.write()
	return &fileWriter
}

func (w *FileWriter) Write(p []byte) (n int, err error) {
	if w == nil {
		return 0, errors.New("fileWriter is nil")
	}

	if w.currentFile == nil {
		return 0, errors.New("fileWriter currentFile is nil")
	}

	n = len(p)
	buf := make([]byte, n)
	copy(buf, p)
	w.input <- buf

	return n, nil
}

func (w *FileWriter) write() {
	for p := range w.input {
		_, err := w.currentFile.Write(p) // 写入日志
		if err != nil {
			log.Printf("write log error: %s\n", err.Error())
		}
		w.checkFile()
	}
}

func (w *FileWriter) checkFile() {
	date := time.Now().Format(timeFormat) // 当前日期
	filename := w.currentFile.Name()      // 当前文件名
	info, _ := w.currentFile.Stat()       // 当前文件信息

	// 如果文件名不包含当前日期, 则生成新文件
	if !strings.Contains(filename, date) {
		w.num = 1
		w.createNewFile()
		return
	}

	if w.cap == 0 {
		return
	}

	// 如果文件大小超过指定大小, 则生成新文件
	if uint(info.Size()) > uint(w.cap) {
		w.num++
		w.createNewFile()
		return
	}
}

func (w *FileWriter) Sync() error {
	if w.currentFile != nil {
		return w.currentFile.Sync()
	}
	return nil
}

func (w *FileWriter) createNewFile() {
	filename := w.generateFileName()
	_ = w.currentFile.Close()
	w.currentFile, _ = os.OpenFile(filename, os.O_WRONLY|os.O_APPEND|os.O_CREATE|os.O_SYNC, 0600)
}

func (w *FileWriter) generateFileName() string {
	basePath := w.basePath

	// 文件名格式为：basePath/[date].log
	// 例如：logs/2024-01-01.log
	date := time.Now().Format(timeFormat)
	if w.cap == 0 {
		return filepath.Join(basePath, fmt.Sprintf("%s.%s", date, w.pathSuffix))
	}

	// 文件名格式为：basePath/[date]-[num].log
	// 例如：logs/2024-01-01-[1].log
	return filepath.Join(basePath, fmt.Sprintf("%s-[%d].%s", date, w.num, w.pathSuffix))
}
