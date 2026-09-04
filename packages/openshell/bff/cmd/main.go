package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/opendatahub-io/odh-dashboard/packages/openshell/bff/internal/api"
	"github.com/opendatahub-io/odh-dashboard/packages/openshell/bff/internal/models"
)

func main() {
	port := flag.Int("port", 4000, "HTTP listen port")
	flag.Parse()

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
	slog.SetDefault(logger)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthcheck", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /api/v1/workspaces", api.ListWorkspaces)
	mux.HandleFunc("GET /api/v1/workspaces/{id}", api.GetWorkspace)
	mux.HandleFunc("GET /api/v1/sandboxes/{id}", api.GetSandbox)

	addr := fmt.Sprintf(":%d", *port)
	slog.Info("OpenShell BFF starting", "addr", addr)

	_ = models.MockWorkspaces // ensure models package is used

	if err := http.ListenAndServe(addr, mux); err != nil {
		slog.Error("server failed", "error", err)
		os.Exit(1)
	}
}
