package repository

import (
	"io"
	"repo_manager/internal/config"
)

type Authorization interface {
	GetUser(username, password string, conf config.Auth) error
}

type Files interface {
	GetFiles(dirPath string) ([]byte, error)
	FileDownloading(filePath string) ([]byte, error)
	FileUploading(filePath string, file io.Reader) ([]byte, error)
	FileInfo(filePath string) ([]byte, error)
	FileReindexes(exec, repo_path, repo_name string) ([]byte, error)
}

type Folders interface {
	GetFolders(dirPath, repo_name string) ([]byte, error)
}

type Repository struct {
	Authorization
	Files
	Folders
}

func NewRepository() *Repository {
	return &Repository{
		Authorization: NewAuthLdap(),
		Files:         NewFiles(),
		Folders:       NewFolders(),
	}
}
