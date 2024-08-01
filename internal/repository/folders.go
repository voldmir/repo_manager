package repository

import (
	"repo_manager/api/folders"
	"slices"

	"google.golang.org/protobuf/proto"
)

type FoldersPath struct {
}

func NewFolders() *FoldersPath {
	return &FoldersPath{}
}

func (f *FoldersPath) GetFolders(dirPath, repo_name string) ([]byte, error) {

	obj, err := getOdjectsInFolder(dirPath)
	if err != nil {
		return nil, err
	}

	no_skip := []string{"noarch", "x86_64", "x86_64-i586"}

	b := true

	files := &folders.Folders{Name: repo_name, Root: &b}

	for _, file := range obj {
		if file.IsDir() {
			name := file.Name()
			if slices.Contains(no_skip, name) {
				files.Children = append(files.Children, &folders.Folders{Name: name})
			}
		}
	}

	data, err := proto.Marshal(files)
	if err != nil {
		return nil, err
	}

	return data, nil
}
