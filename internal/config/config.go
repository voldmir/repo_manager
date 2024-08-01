package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/mpvl/unique"
	"gopkg.in/yaml.v2"
)

type Auth struct {
	BaseDN         string   `yaml:"base_dn,omitempty"`
	Domain         string   `yaml:"domain"`
	Server         string   `yaml:"server"`
	Groups         []string `yaml:"groups"`
	DefaultTimeout int      `yaml:"default_timeout,omitempty"`
}

type Repo struct {
	Dir          string `yaml:"dir"`
	Name         string `yaml:"name"`
	RepoRootPath string `yaml:"repo_root_path,omitempty"`
	Auth         *Auth  `yaml:"auth,omitempty"`
}

type CorsOptions struct {
	AllowedOrigins   []string `yaml:"allowed_origins,omitempty"`
	AllowedHeaders   []string `yaml:"allowed_headers,omitempty"`
	AllowCredentials bool     `yaml:"allow_credentials,omitempty" default:"false"`
}

type Server struct {
	BindAddr       string        `yaml:"bind_addr,omitempty"`
	SessionKey     string        `yaml:"session_key,omitempty"`
	DocumentRoot   string        `yaml:"document_root,omitempty"`
	SessionLife    int           `yaml:"session_life,omitempty"`
	URLPrefix      string        `yaml:"url_prefix"`
	MaxHeaderBytes int           `yaml:"max_header_bytes,omitempty"`
	ReadTimeout    time.Duration `yaml:"read_timeout,omitempty"`
	WriteTimeout   time.Duration `yaml:"writetimeout,omitempty"`
	CorsOptions    CorsOptions   `yaml:"cors_options,omitempty"`
}

func (s Server) GetBindAddr() string {
	return s.BindAddr
}

func (s Server) GetMaxHeaderBytes() int {
	return s.MaxHeaderBytes
}

func (s Server) GetReadTimeout() time.Duration {
	return s.ReadTimeout
}

func (s Server) GetWriteTimeout() time.Duration {
	return s.WriteTimeout
}

type Repositories struct {
	ExecReindex      string `yaml:"exec_reindex"`
	BaseRepoRootPath string `yaml:"base_repo_root_path"`
	Auth             *Auth  `yaml:"auth,omitempty"`
	Entries          map[string]*Repo
}

type Config struct {
	LogLevel     string        `yaml:"log_level,omitempty"`
	Server       Server        `yaml:"server"`
	Repositories *Repositories `yaml:"repositories"`
}

func createConfig() *Config {
	return &Config{
		LogLevel: "info",
		Server: Server{
			BindAddr:       ":3000",
			DocumentRoot:   "./www",
			SessionLife:    3600,
			MaxHeaderBytes: 1 << 20, // 1 MB
			ReadTimeout:    10 * time.Second,
			WriteTimeout:   10 * time.Second,
		},
	}
}

func NewConfig(configPath string) (*Config, error) {

	path, err := filepath.Abs(configPath)
	if err != nil {
		return nil, err
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	config := createConfig()

	decoder := yaml.NewDecoder(file)
	if err := decoder.Decode(config); err != nil {
		return nil, err
	}

	config.Server.DocumentRoot, err = filepath.Abs(config.Server.DocumentRoot)
	if err != nil {
		return nil, err
	}

	if config.Server.URLPrefix == "" {
		return nil, errors.New("server.url_prefix is don't exist or empty")
	}

	_, err = url.Parse(config.Server.URLPrefix)
	if err != nil {
		return nil, err
	}

	if _, err := os.Open(config.Server.DocumentRoot); os.IsNotExist(err) {
		msg := fmt.Sprintf("non-existent path '%s' in server.document_root", config.Server.DocumentRoot)
		return nil, errors.New(msg)
	}

	if config.Repositories == nil || len(config.Repositories.Entries) < 1 {
		return nil, errors.New("no repositories announced")
	}

	if config.Repositories.BaseRepoRootPath == "" {
		return nil, errors.New("base_repo_root_path in repositories is don`t exist")
	}

	if config.Repositories.ExecReindex == "" {
		config.Repositories.ExecReindex = "echo repositories.exec_reindex is don`t exist, args: "
	}

	config.Repositories.BaseRepoRootPath, err = filepath.Abs(config.Repositories.BaseRepoRootPath)
	if err != nil {
		return nil, err
	}

	if _, err := os.Open(config.Repositories.BaseRepoRootPath); os.IsNotExist(err) {
		msg := fmt.Sprintf("non-existent path '%s' in repositories.base_repo_root_path", config.Repositories.BaseRepoRootPath)
		return nil, errors.New(msg)
	}

	return config, nil
}

func (c *Config) GetDocumentRoot(file_name string) string {
	return path.Join(c.Server.DocumentRoot, file_name)
}

func (c *Config) GetRepoAuth(repo_name string) *Auth {
	auth := c.Repositories.Entries[repo_name].Auth
	auth_def := c.Repositories.Auth

	if auth == nil && auth_def == nil {
		return nil
	}

	if auth == nil {
		auth = auth_def
	} else if auth.Server == "" || auth.BaseDN == "" || auth.Domain == "" {
		auth.BaseDN = auth_def.BaseDN
		auth.Domain = auth_def.Domain
		auth.Server = auth_def.Server
		auth.DefaultTimeout = auth_def.DefaultTimeout

		if len(auth.Groups) > 0 {
			auth.Groups = append(auth.Groups, auth_def.Groups...)
			unique.Strings(&auth.Groups)
		}
	}

	return auth
}

func (c *Config) IsExistsrepo(repo_name string) bool {
	_, exist := c.Repositories.Entries[repo_name]
	return exist
}

func (c *Config) GetRepo(repo_name string) *Repo {
	return c.Repositories.Entries[repo_name]
}

func (c *Config) GetRepoRootPath(repo_name string) string {
	repo_path := c.Repositories.Entries[repo_name].RepoRootPath
	if repo_path == "" {
		repo_path = c.Repositories.BaseRepoRootPath
	} else {
		repo_path, _ = filepath.Abs(repo_path)
	}

	return repo_path
}

func (c *Config) GetRepoDir(repo_name string) string {
	dir := c.Repositories.Entries[repo_name].Dir

	if dir != "" {
		return c.Repositories.Entries[repo_name].Dir
	} else {
		return c.GetRepoName(repo_name)
	}
}

func (c *Config) GetRepoName(repo_name string) string {
	return c.Repositories.Entries[repo_name].Name
}

func (c *Config) GetRepoVarPath(repo_name string) (string, string, string) {
	return c.GetRepoRootPath(repo_name),
		c.GetRepoDir(repo_name),
		c.GetRepoName(repo_name)

}

func (c *Config) JoinURL(base string, paths ...string) string {
	p := path.Join(paths...)
	return fmt.Sprintf("%s/%s", strings.TrimRight(base, "/"), strings.TrimLeft(p, "/"))
}

func (c *Config) GetURLPrefix(repo_name string) string {
	return c.JoinURL(c.Server.URLPrefix, repo_name, "/")
}

func (c *Config) GetPathInURLPrefix(repo_name string) (string, error) {
	url, err := url.Parse(c.GetURLPrefix(repo_name))
	if err != nil {
		return "", err
	}

	return url.Path, nil
}
