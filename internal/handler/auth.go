package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

type signInInput struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func (s *Handler) signIn() http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		req := &signInInput{}
		vars := mux.Vars(r)

		repo_name := vars["repoName"]

		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		session, err := s.sessionStore.Get(r, repo_name)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		ldapAuthConf := s.config.GetRepoAuth(repo_name)
		if ldapAuthConf == nil {
			s.error(w, r, http.StatusInternalServerError, errNotExistAuth)
			return
		}

		token, err := s.services.Authorization.GenerateToken(req.Login, req.Password, repo_name, *ldapAuthConf)
		if err != nil {
			s.error(w, r, http.StatusUnauthorized, errIncorrectLoginOrPassword)
			return
		}

		cookie_path, err := s.config.GetPathInURLPrefix(repo_name)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		session.Options.Path = cookie_path
		session.Options.MaxAge = s.config.Server.SessionLife
		session.Options.HttpOnly = false

		session.Values[repo_name] = token
		if err := s.sessionStore.Save(r, w, session); err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		s.respond(w, r, http.StatusOK, nil)
	}
}
