package service

import (
	"path/filepath"
	"repo_manager/internal/repository"
)

type FoldersService struct {
	repo repository.Folders
}

func NewFoldersService(repo repository.Folders) *FoldersService {
	return &FoldersService{repo: repo}
}

func (f *FoldersService) GetFolders(repo_path, repo_dir, repo_name string) ([]byte, error) {
	repo_path = filepath.Join(repo_path, repo_dir)

	data, err := f.repo.GetFolders(repo_path, repo_name)
	if err != nil {
		return nil, err
	}

	return data, nil
}
