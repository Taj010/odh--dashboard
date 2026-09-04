package api

import (
	"encoding/json"
	"net/http"

	"github.com/opendatahub-io/odh-dashboard/packages/openshell/bff/internal/models"
)

func ListWorkspaces(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.MockWorkspaces)
}

func GetWorkspace(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	for _, ws := range models.MockWorkspaces {
		if ws.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(ws)
			return
		}
	}
	http.NotFound(w, r)
}

func GetSandbox(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	for _, sb := range models.MockSandboxes {
		if sb.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(sb)
			return
		}
	}
	http.NotFound(w, r)
}
