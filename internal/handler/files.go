package handler

import (
	"net/http"
	"path/filepath"

	"github.com/gorilla/mux"
)

func (s *Handler) handleFiles() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		vars := mux.Vars(r)

		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		folder := filepath.Clean(vars["folderId"])

		data, err := s.services.Files.GetFiles(repo_path, repo_dir, folder, repo_name)
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

func (s *Handler) handleFileDownloading() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/octet-stream")
		vars := mux.Vars(r)

		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		folderId := filepath.Clean(vars["folderId"])
		fileId := filepath.Clean(vars["fileId"])

		fileBytes, err := s.services.Files.FileDownloading(repo_path, repo_dir, folderId, repo_name, fileId)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		_, err = w.Write(fileBytes)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}
	}
}

func (s *Handler) handleFileUploading() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		vars := mux.Vars(r)

		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		folderId := filepath.Clean(vars["folderId"])

		file, handler, err := r.FormFile("rpm")
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}
		defer file.Close()

		data, err := s.services.Files.FileUploading(repo_path, repo_dir, folderId, repo_name, handler.Filename, file)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		_, err = w.Write(data)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}
	}
}

func (s *Handler) handleFileInfo() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		folderId := filepath.Clean(vars["folderId"])
		fileId := filepath.Clean(vars["fileId"])

		data, err := s.services.Files.FileInfo(repo_path, repo_dir, folderId, repo_name, fileId)
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

func (s *Handler) handleFileReindexes() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)

		repo_path, repo_dir, repo_name := s.config.GetRepoVarPath(vars["repoName"])

		exec := s.config.Repositories.ExecReindex

		data, err := s.services.Files.FileReindexes(exec, repo_path, repo_dir, repo_name)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		_, err = w.Write(data)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}
	}
}
