package models

type Workspace struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
	Description string `json:"description,omitempty"`
}

type Sandbox struct {
	ID          string `json:"id"`
	WorkspaceID string `json:"workspaceId"`
	Name        string `json:"name"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

var MockWorkspaces = []Workspace{
	{
		ID:          "ws-001",
		Name:        "dev-workspace",
		Status:      "running",
		CreatedAt:   "2026-09-01T10:00:00Z",
		Description: "Development workspace for testing",
	},
	{
		ID:          "ws-002",
		Name:        "staging-workspace",
		Status:      "stopped",
		CreatedAt:   "2026-08-28T14:30:00Z",
		Description: "Staging environment workspace",
	},
}

var MockSandboxes = []Sandbox{
	{
		ID:          "sb-001",
		WorkspaceID: "ws-001",
		Name:        "sandbox-alpha",
		Status:      "running",
		CreatedAt:   "2026-09-01T11:00:00Z",
	},
	{
		ID:          "sb-002",
		WorkspaceID: "ws-001",
		Name:        "sandbox-beta",
		Status:      "stopped",
		CreatedAt:   "2026-09-02T09:15:00Z",
	},
}
