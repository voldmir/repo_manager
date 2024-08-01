//go:build windows
// +build windows

package repository

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"

	"github.com/xela07ax/XelaGoDoc/encodingStdout"
)

const ShellToUse = "cmd.exe"

func Shellout(command string) ([]byte, []byte, error) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd := exec.Command(ShellToUse, "/c", command)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	err := cmd.Run()
	return stdout.Bytes(), stderr.Bytes(), err
}

func (f *FilesPath) FileReindexes(exec, repo_path, repo_name string) ([]byte, error) {
	cmd := fmt.Sprintf("%s %s %s", exec, repo_path, repo_name)

	out, errout, err := Shellout(cmd)
	if err != nil {
		return nil, errors.New(err.Error() + ", " + string(encodingStdout.Convert(41, errout)))
	}

	return out, nil
}
