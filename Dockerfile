#
ARG APP_VER="0.1.1"
ARG GIT_PROJECT="https://github.com/voldmir/repo_manager.git"
#

# Clone from gitlab project
FROM alpine/git:latest as cloner
ARG GIT_PROJECT
RUN mkdir /src && cd /src && git clone "${GIT_PROJECT}" .
WORKDIR /src

# Build React App
FROM node:20.15.1-alpine3.20 as build-react
ARG HTTP_PROXY
COPY --from=cloner /src/www /react
WORKDIR /react
run echo "proxy=${HTTP_PROXY}\nhttps-proxy=${HTTP_PROXY}\nfund=false" > ~/.npmrc
RUN npm install && npm run build

# Build binary
FROM golang:alpine3.19 as build-binary
ARG APP_VER
COPY --from=cloner /src /go/project
WORKDIR /go/project
RUN go mod tidy && go mod vendor
RUN GOOS=linux COARCH=amd64 CGO_ENABLED=0 GO111MODULE=on go build \
    -v \
    -mod vendor \
    -ldflags="-s -X main.version=${APP_VER}" \
    -o repo_manager ./cmd/main.go

# Image work
FROM alpine:3.19.1
WORKDIR /app
COPY --from=build-react /react/build /app/www
COPY --from=build-binary /go/project/repo_manager /app/repo_manager
COPY --from=cloner /src/configs /app/configs
