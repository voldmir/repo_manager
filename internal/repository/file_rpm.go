package repository

import (
	"repo_manager/api/files"

	"github.com/cavaliergopher/rpm"
	"google.golang.org/protobuf/proto"
)

func (f *FilesPath) FileInfo(filePath string) ([]byte, error) {

	p, err := rpm.Open(filePath)
	if err != nil {
		return nil, err
	}

	pkg := &files.RPM{
		Name:         p.Name(),
		Version:      p.Version(),
		Release:      p.Release(),
		Architecture: p.Architecture(),
		Distribution: p.Distribution(),
		Groups:       p.Groups(),
		Size:         p.Size(),
		License:      p.License(),
		Source:       p.Source(),
		BuildTime:    p.BuildTime().Format("02.01.2006 15:04:05"),
		BuildHost:    p.BuildHost(),
		Vendor:       p.Vendor(),
		Url:          p.URL(),
		Packager:     p.Packager(),
		Summary:      p.Summary(),
		Description:  p.Description(),
	}
	data, err := proto.Marshal(pkg)
	if err != nil {
		return nil, err
	}

	return data, nil
}
