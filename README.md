# Development
## Generation protofiles
### Move to folder project
```bash
cd /d E:\Project\Go\src\repo_manager
```

### gen api for go:
```bash
protoc --proto_path=proto --go_out=. proto\*.proto
```

### gen api for react:
```bash
protoc --plugin=protoc-gen-ts=www\node_modules\.bin\protoc-gen-ts.cmd --ts_out=www\src\api --proto_path=proto proto\*.proto
```

# Production
### Build application

```bash
docker build --build-arg HTTP_PROXY=$HTTP_PROXY . --tag=repo_manager:0.1.0
```
### Extract application in docker images
```bash
docker create --name dummy repo_manager:0.1.0
docker cp dummy:/app ~/tmp
docker rm -f dummy
```

### ACL for repo
```bash
useradd repo_manager

find /srv/public/mirror/kes -type d -exec setfacl -d -m u:repo_manager:rw {} \;
find /srv/public/mirror/kes -type d -exec setfacl -m u:repo_manager:rwx {} \;
find /srv/public/mirror/kes -type f -exec setfacl -m u:repo_manager:rw {} \;
find /srv/public/mirror/kes -type s -exec setfacl -m u:repo_manager:rw {} \;

```

### nginx:
/etc/nginx/sites-enabled.d/mirror.conf

```nginx
server {
    listen          443 ssl http2;
    server_name mirror.example.loc;


    ssl_certificate         /etc/nginx/ssl/mirror.example.loc.crt;
    ssl_certificate_key     /etc/nginx/ssl/mirror.example.loc.key;


    location ~ ^/ui/([^/]+)(/.*|)$ {
      rewrite_log on;
      access_log      /var/log/nginx/mirror.example.loc_ui_kes_access.log combined;
      error_log       /var/log/nginx/mirror.example.loc_ui_kes_error.log error;

      rewrite ^/(ui/[^/]+)$ $scheme://$host/$1/ redirect;
      rewrite ^/ui/(.*)$ /$1 break;

      proxy_pass         http://localhost:3001;
    }

    location / {
      return 301 http://mirror.example.loc;
    }
}
```

### systemd
/lib/systemd/system/repo_manager.service
```ini
[Unit]
Description=UI repo manager
After=syslog.target network.target remote-fs.target nss-lookup.target

[Service]
WorkingDirectory=/opt/service/repo_manager/
Type=simple
ExecStart=/opt/service/repo_manager/repo_manager --config-path configs/config.yaml
ExecStop=/bin/kill -TERM $MAINPID

User=repo_manager
Group=repo_manager

PrivateTmp=yes
ProtectControlGroups=yes
ProtectHome=yes

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl stop repo_manager.service && sleep 3 && systemctl start repo_manager.service
```

### Troubleshooting

```journalctl -f -u repo_manager```
```tail -f /var/log/nginx/mirror.example.loc_ui_kes_access.log```
```tail -f /var/log/nginx/mirror.example.loc_ui_all_error.log```
