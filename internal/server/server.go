package server

import (
	"context"
	"net/http"
	"time"
)

type ServerConfig interface {
	GetBindAddr() string
	GetMaxHeaderBytes() int
	GetReadTimeout() time.Duration
	GetWriteTimeout() time.Duration
}

type Server struct {
	httpServer *http.Server
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

func (s *Server) Run(conf ServerConfig, handler http.Handler) error {
	s.httpServer = &http.Server{
		Addr:           conf.GetBindAddr(),
		Handler:        handler,
		MaxHeaderBytes: conf.GetMaxHeaderBytes(),
		ReadTimeout:    conf.GetReadTimeout(),
		WriteTimeout:   conf.GetWriteTimeout(),
	}
	return s.httpServer.ListenAndServe()
}
