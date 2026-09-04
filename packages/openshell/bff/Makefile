.PHONY: build run lint test clean

BINARY_NAME=openshell-bff

build:
	go build -o $(BINARY_NAME) ./cmd/...

run:
	go run ./cmd/... -port 4000

dev: run

lint:
	golangci-lint run ./...

test:
	go test ./... -v

clean:
	rm -f $(BINARY_NAME)
