package service

import (
	"io"
	"repo_manager/internal/config"
	"repo_manager/internal/repository"
)

type Authorization interface {
	GenerateToken(username, password, repo_name string, conf config.Auth) (string, error)
	ParseToken(token, repo_name string) error
}

type Files interface {
	GetFiles(repo_path, repo_dir, folder, repo_name string) ([]byte, error)
	FileDownloading(repo_path, repo_dir, folderId, repo_name, fileId string) ([]byte, error)
	FileUploading(repo_path, repo_dir, folderId, repo_name string, file_name string, file io.Reader) ([]byte, error)
	FileInfo(repo_path, repo_dir, folderId, repo_name, fileId string) ([]byte, error)
	FileReindexes(exec, repo_path, repo_dir, repo_name string) ([]byte, error)
}

type Folders interface {
	GetFolders(repo_path, repo_dir, repo_name string) ([]byte, error)
}

type Service struct {
	Authorization
	Files
	Folders
}

func NewService(repos *repository.Repository) *Service {
	return &Service{
		Authorization: NewAuthService(repos.Authorization),
		Files:         NewFilesService(repos.Files),
		Folders:       NewFoldersService(repos.Folders),
	}
}
