package repository

import (
	"crypto/tls"
	"errors"
	"fmt"
	"repo_manager/internal/config"
	"strings"
	"time"

	ldap "github.com/go-ldap/ldap/v3"
)

func (a *AuthLdap) GetUser(username, password string, conf config.Auth) error {

	l, err := a.ldapConnect(username, password, conf)
	if err != nil {
		return err
	}
	defer l.Close()

	err = a.ldapSearchUser(l, username, conf)
	if err != nil {
		return err
	}

	return nil
}

func (a *AuthLdap) ldapConnect(username, password string, conf config.Auth) (*ldap.Conn, error) {

	ldap.DefaultTimeout = time.Second * 3

	l, err := ldap.DialURL(fmt.Sprintf("%s://%s", "ldap", conf.Server))
	if err != nil {
		return nil, err
	}

	// l.SetTimeout(200)

	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
	}

	err = l.StartTLS(tlsConfig)
	if err != nil {
		return nil, err
	}

	err = l.Bind(username+"@"+conf.Domain, password)
	if err != nil {
		return nil, err
	}

	return l, nil
}

func (a *AuthLdap) ldapSearchUser(conn *ldap.Conn, username string, conf config.Auth) error {

	var gfilter []string

	baseDn := []string{}

	for _, el := range strings.Split(conf.Domain, ".") {
		baseDn = append(baseDn, "dc="+el)
	}

	for _, el := range conf.Groups {
		gfilter = append(gfilter, fmt.Sprintf("(memberOf=%s)", ldap.EscapeFilter(el)))
	}

	filter := fmt.Sprintf("(&(sAMAccountName=%s)(|%s))", ldap.EscapeFilter(username), strings.Join(gfilter, ""))

	fmt.Println(filter)
	fmt.Println(strings.Join(baseDn, ","))

	searchRequest := ldap.NewSearchRequest(
		strings.Join(baseDn, ","),
		ldap.ScopeWholeSubtree,
		ldap.NeverDerefAliases,
		1,
		0,
		false,
		filter,
		[]string{"distinguishedName"},
		nil,
	)

	searchResult, err := conn.Search(searchRequest)
	if err != nil {
		return err
	}

	if len(searchResult.Entries) != 1 {
		return errors.New("user does not exist or too many entries returned")
	}

	// userdn := searchResult.Entries[0].DN

	return nil

}
