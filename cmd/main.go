package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"repo_manager/internal/config"
	"repo_manager/internal/handler"
	"repo_manager/internal/repository"
	"repo_manager/internal/server"
	"repo_manager/internal/service"
	"syscall"

	"github.com/sirupsen/logrus"
)

var (
	configPath string
	version    string
)

func init() {
	flag.StringVar(&configPath, "config-path", "", "path to config file")
}

func main() {
	displayVersion := flag.Bool("version", false, "Display version and exit")
	flag.Parse()

	if *displayVersion {
		fmt.Printf("Version:\t%s\n", version)
		os.Exit(0)
	}

	logrus.Info("Run application")

	config, err := config.NewConfig(configPath)
	if err != nil {
		panic(err)
	}

	repos := repository.NewRepository()
	services := service.NewService(repos)
	handlers := handler.NewHandler(config, services)

	srv := new(server.Server)
	go func() {
		if err := srv.Run(config.Server, handlers); err != nil {
			logrus.Fatalf("error occured while running http server: %s", err.Error())
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	<-quit

	if err := srv.Shutdown(context.Background()); err != nil {
		logrus.Errorf("error occured on server shutting down: %s", err.Error())
	}

}
