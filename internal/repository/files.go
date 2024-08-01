package repository

import (
	"io"
	"os"
	"path/filepath"
	"repo_manager/api/files"

	"google.golang.org/protobuf/proto"
)

type FilesPath struct {
}

func NewFiles() *FilesPath {
	return &FilesPath{}
}

func (f *FilesPath) GetFiles(dirPath string) ([]byte, error) {

	obj, err := getOdjectsInFolder(dirPath)
	if err != nil {
		return nil, err
	}

	fls := &files.Files{}

	for _, file := range obj {
		if !file.IsDir() {
			fls.Files = append(fls.Files, &files.Files_File{Name: file.Name()})
		}
	}

	data, err := proto.Marshal(fls)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (f *FilesPath) FileUploading(filePath string, file io.Reader) ([]byte, error) {

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	uploadFile, err := os.Create(filePath)
	if err != nil {
		return nil, err
	}
	defer uploadFile.Close()

	_, err = uploadFile.Write(fileBytes)
	if err != nil {
		return nil, err
	}

	newFile := &files.Files_File{Name: filepath.Base(filePath)}

	data, err := proto.Marshal(newFile)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (f *FilesPath) FileDownloading(filePath string) ([]byte, error) {
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	return fileBytes, nil
}
