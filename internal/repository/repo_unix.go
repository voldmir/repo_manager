//go:build !windows
// +build !windows

package repository

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"
)

const ShellToUse = "bash"

func Shellout(command string) ([]byte, string, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command(ShellToUse, "-c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.Bytes(), stderr.String(), err
}

func (f *FilesPath) FileReindexes(exec, repo_path, repo_name string) ([]byte, error) {
	cmd := fmt.Sprintf("%s %s %s", exec, repo_path, repo_name)
	out, errout, err := Shellout(cmd)
	if err != nil {
		return nil, errors.New(err.Error() + ", " + errout)
	}

	return out, nil
}
