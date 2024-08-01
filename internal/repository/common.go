package repository

import (
	"os"
)

func getOdjectsInFolder(path string) ([]os.FileInfo, error) {

	dir, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer dir.Close()

	return dir.Readdir(-1)

}
