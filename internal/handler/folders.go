package handler

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func (s *Handler) handleFolders() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)

		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		fmt.Printf("%s %s %s \n", repo_path, repo_dir, repo_name)

		data, err := s.services.Folders.GetFolders(repo_path, repo_dir, repo_name)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		w.Header().Set("Content-Type", "application/protobuf")
		_, err = w.Write(data)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

	}
}
