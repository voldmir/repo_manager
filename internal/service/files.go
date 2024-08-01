package service

import (
	"errors"
	"fmt"
	"io"
	"path/filepath"
	"repo_manager/internal/repository"

	"github.com/cavaliergopher/rpm"
)

type FilesService struct {
	repo repository.Files
}

func NewFilesService(repo repository.Files) *FilesService {
	return &FilesService{repo: repo}
}

func (f *FilesService) GetFiles(repo_path, repo_dir, folder, repo_name string) ([]byte, error) {

	repo_path = filepath.Join(repo_path, repo_dir, folder, fmt.Sprintf("RPMS.%s", repo_name))

	files, err := f.repo.GetFiles(repo_path)
	if err != nil {
		return nil, err
	}

	return files, nil
}

func (f *FilesService) FileDownloading(repo_path, repo_dir, folderId, repo_name, fileId string) ([]byte, error) {

	filePath := filepath.Join(repo_path, repo_dir, folderId, fmt.Sprintf("RPMS.%s", repo_name), fileId)

	fileBytes, err := f.repo.FileDownloading(filePath)
	if err != nil {
		return nil, err
	}

	return fileBytes, nil
}

func (f *FilesService) FileUploading(repo_path, repo_dir, folderId, repo_name, file_name string, file io.Reader) ([]byte, error) {

	repo_path = filepath.Join(repo_path, repo_dir, folderId, fmt.Sprintf("RPMS.%s", repo_name))

	pkg, err := rpm.Read(file)
	if err != nil {
		msg := fmt.Sprintf("Invalid file: '%s'", file_name)
		return nil, errors.New(msg)
	}

	if pkg.Architecture() != folderId {
		msg := fmt.Sprintf("Incorrect package architecture, specified: '%s' , file: '%s'", folderId, pkg.Architecture())
		return nil, errors.New(msg)
	}

	filePath := filepath.Join(repo_path, file_name)

	data, err := f.repo.FileUploading(filePath, file)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (f *FilesService) FileInfo(repo_path, repo_dir, folderId, repo_name, fileId string) ([]byte, error) {
	filePath := filepath.Join(repo_path, repo_dir, folderId, fmt.Sprintf("RPMS.%s", repo_name), fileId)

	data, err := f.repo.FileInfo(filePath)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (f *FilesService) FileReindexes(exec, repo_path, repo_dir, repo_name string) ([]byte, error) {

	repo_path = filepath.Join(repo_path, repo_dir)

	data, err := f.repo.FileReindexes(exec, repo_path, repo_name)
	if err != nil {
		return nil, err
	}

	return data, nil
}
