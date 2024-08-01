package handler

import (
	"net/http"
	"text/template"

	"github.com/gorilla/mux"
)

type indexVars struct {
	URLPrefix  string
	CookiePath string
	RepoName   string
}

func (s *Handler) handleIndex() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		repo_name := vars["repoName"]

		some_template, _ := template.ParseFiles(s.config.GetDocumentRoot("index.html"))

		cookie_path, err := s.config.GetPathInURLPrefix(repo_name)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		index_vars := indexVars{
			URLPrefix:  s.config.GetURLPrefix(repo_name),
			CookiePath: cookie_path,
			RepoName:   repo_name,
		}

		err = some_template.Execute(w, index_vars)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}
	}
}
