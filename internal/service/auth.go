package service

import (
	"errors"
	"time"

	"repo_manager/internal/config"
	"repo_manager/internal/repository"

	"github.com/dgrijalva/jwt-go"
)

const (
	signingKey = "qrkjk#4#35FSFJlja#gbfgb548yty8jyyj"
	tokenTTL   = 12 * time.Hour
)

type tokenClaims struct {
	jwt.StandardClaims
	Repo string `json:"repo"`
}

type AuthService struct {
	repo repository.Authorization
}

func NewAuthService(repo repository.Authorization) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) GenerateToken(username, password, repo_name string, conf config.Auth) (string, error) {
	err := s.repo.GetUser(username, password, conf)
	if err != nil {
		return "", err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(tokenTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		repo_name,
	})

	return token.SignedString([]byte(signingKey))
}

func (s *AuthService) ParseToken(accessToken, repo_name string) error {
	token, err := jwt.ParseWithClaims(accessToken, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(signingKey), nil
	})
	if err != nil {
		return err
	}

	payload, ok := token.Claims.(*tokenClaims)
	if !ok || payload.Repo != repo_name {
		return errors.New("token claims are not of type *tokenClaims")
	}

	return nil
}
