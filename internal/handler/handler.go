package handler

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"repo_manager/internal/config"
	"repo_manager/internal/service"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/rs/cors"
	"github.com/sirupsen/logrus"
)

type ctxKey int8

const (
	ctxKeyUser ctxKey = iota
	ctxKeyRequestID
)

var (
	errIncorrectLoginOrPassword = errors.New("incorrect login or password")
	errNotAuthenticated         = errors.New("not authenticated")
	errNotExistRepository       = errors.New("repository not exist")
	errNotExistAuth             = errors.New("auth server not exist")
)

type Handler struct {
	router       *mux.Router
	logger       *logrus.Logger
	sessionStore sessions.Store
	config       *config.Config
	services     *service.Service
}

func NewHandler(config *config.Config, services *service.Service) http.Handler {
	sessionStore := sessions.NewCookieStore([]byte(config.Server.SessionKey))

	c := cors.New(cors.Options{
		AllowedOrigins:   config.Server.CorsOptions.AllowedOrigins,
		AllowedHeaders:   config.Server.CorsOptions.AllowedHeaders,
		AllowCredentials: config.Server.CorsOptions.AllowCredentials,
		Debug:            config.LogLevel == "debug",
	})

	s := &Handler{
		router:       mux.NewRouter(),
		logger:       logrus.New(),
		sessionStore: sessionStore,
		config:       config,
		services:     services,
	}
	s.configureRouter()

	return c.Handler(s)
}

func (s *Handler) configureRouter() {

	prefix := "/{repoName}"
	router := s.router.PathPrefix(prefix).Subrouter()

	router.Use(s.setRequestID, s.logRequest, s.setRequestChekRepo)

	router.HandleFunc("/sign-in", s.signIn()).Methods("POST")

	router.HandleFunc("/folders", s.handleFolders())

	filesRouter := router.PathPrefix("/files").Subrouter()

	auth := filesRouter.NewRoute().Subrouter()
	auth.Use(s.authenticate)
	auth.HandleFunc("/reindex", s.handleFileReindexes()).Methods("POST")
	auth.HandleFunc("/{folderId}", s.handleFileUploading()).Methods("POST")

	filesRouter.HandleFunc("/{folderId}", s.handleFiles())
	filesRouter.HandleFunc("/{folderId}/{fileId}", s.handleFileDownloading())
	filesRouter.HandleFunc("/{folderId}/{fileId}/info", s.handleFileInfo())

	router.HandleFunc("/", s.handleIndex())

	fs := http.FileServer(http.Dir(s.config.GetDocumentRoot("")))
	router.PathPrefix("/").Handler(StripPrefix(prefix, fs))
}

func StripPrefix(prefix string, h http.Handler) http.Handler {
	if prefix == "" {
		return h
	}

	idxs := _braceIndices(prefix)
	var end int
	pattern := bytes.NewBufferString("^")
	defaultPattern := "[^/]+"

	patt := defaultPattern

	for i := 0; i < len(idxs); i += 2 {
		raw := prefix[end:idxs[i]]
		end = idxs[i+1]

		fmt.Fprintf(pattern, "%s%s", regexp.QuoteMeta(raw), patt)
	}

	raw := prefix[end:]
	pattern.WriteString(regexp.QuoteMeta(raw))
	re, _ := regexp.Compile(pattern.String())

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		p := re.ReplaceAllString(r.URL.Path, "")
		rp := re.ReplaceAllString(r.URL.RawPath, "")

		if len(p) < len(r.URL.Path) && (r.URL.RawPath == "" || len(rp) < len(r.URL.RawPath)) {
			r2 := new(http.Request)
			*r2 = *r
			r2.URL = new(url.URL)
			*r2.URL = *r.URL
			r2.URL.Path = p
			r2.URL.RawPath = rp
			h.ServeHTTP(w, r2)
		} else {
			http.NotFound(w, r)
		}
	})
}

func _braceIndices(s string) []int {
	var level, idx int
	var idxs []int
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case '{':
			if level++; level == 1 {
				idx = i
			}
		case '}':
			if level--; level == 0 {
				idxs = append(idxs, idx, i+1)
			} else if level < 0 {
				return nil
			}
		}
	}
	if level != 0 {
		return nil
	}
	return idxs
}

func (s *Handler) error(w http.ResponseWriter, r *http.Request, code int, err error) {
	w.Header().Set("Content-Type", "application/json")
	s.respond(w, r, code, map[string]string{"error": err.Error()})
}

func (s *Handler) respond(w http.ResponseWriter, _ *http.Request, code int, data interface{}) {
	w.WriteHeader(code)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

func (s *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
