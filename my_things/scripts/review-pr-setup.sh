#!/usr/bin/env bash
# review-pr-setup.sh — fetch a GitHub PR locally for review, or delete that branch later.
#
# Usage:
#   ./review-pr-setup.sh <pr-url-or-number> [owner:branch]
#   ./review-pr-setup.sh --delete <pr-url-or-number|branch-name> [owner:branch]
#
# Examples:
#   ./review-pr-setup.sh https://github.com/opendatahub-io/odh-dashboard/pull/8758
#   ./review-pr-setup.sh 8758 danreed-rh:RHOAIENG-56820/route-name-length
#   ./review-pr-setup.sh --delete RHOAIENG-56820/route-name-length
#   ./review-pr-setup.sh --delete https://github.com/opendatahub-io/odh-dashboard/pull/8758
#
# What setup does:
#   git fetch upstream pull/<N>/head:<local-branch>
#   git checkout <local-branch>

set -euo pipefail

REMOTE="${REVIEW_PR_REMOTE:-upstream}"
DEFAULT_BASE="${REVIEW_PR_BASE:-main}"
REPO="${REVIEW_PR_REPO:-opendatahub-io/odh-dashboard}"

usage() {
  cat <<EOF
Usage:
  $(basename "$0") <pr-url-or-number> [owner:branch]
  $(basename "$0") --delete <pr-url-or-number|branch-name> [owner:branch]

Options:
  -h, --help     Show this help
  -d, --delete   Delete the local review branch (checks out ${DEFAULT_BASE} first)

Env overrides:
  REVIEW_PR_REMOTE   Git remote to fetch from (default: upstream)
  REVIEW_PR_BASE     Branch to return to on delete (default: main)
  REVIEW_PR_REPO     GitHub repo for gh lookups (default: opendatahub-io/odh-dashboard)
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

# Extract PR number from a URL or bare number. Returns empty if not a PR ref.
extract_pr_number() {
  local input="$1"
  if [[ "$input" =~ pull/([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
  elif [[ "$input" =~ ^[0-9]+$ ]]; then
    echo "$input"
  else
    echo ""
  fi
}

# From "owner:branch" → branch; otherwise echo the input as-is.
extract_branch_name() {
  local input="$1"
  if [[ "$input" == *:* ]]; then
    echo "${input#*:}"
  else
    echo "$input"
  fi
}

# Resolve local branch name: explicit arg → gh headRefName → pr-<N>
resolve_branch_name() {
  local pr_number="$1"
  local branch_arg="${2:-}"

  if [[ -n "$branch_arg" ]]; then
    extract_branch_name "$branch_arg"
    return
  fi

  if [[ -n "$pr_number" ]] && command -v gh >/dev/null 2>&1; then
    local head_ref
    head_ref="$(gh pr view "$pr_number" --repo "$REPO" --json headRefName -q .headRefName 2>/dev/null || true)"
    if [[ -n "$head_ref" ]]; then
      echo "$head_ref"
      return
    fi
  fi

  if [[ -n "$pr_number" ]]; then
    echo "pr-${pr_number}"
    return
  fi

  die "could not determine branch name (pass owner:branch or a PR number)"
}

ensure_remote() {
  git remote get-url "$REMOTE" >/dev/null 2>&1 \
    || die "git remote '${REMOTE}' not found. Add it, or set REVIEW_PR_REMOTE=origin"
}

ensure_clean_enough() {
  # Allow setup even with dirty tree, but warn — checkout may fail.
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "warning: working tree has uncommitted changes; checkout may fail" >&2
  fi
}

cmd_setup() {
  local pr_input="$1"
  local branch_arg="${2:-}"

  local pr_number
  pr_number="$(extract_pr_number "$pr_input")"
  [[ -n "$pr_number" ]] || die "expected a PR URL or number, got: ${pr_input}"

  ensure_remote
  ensure_clean_enough

  local branch
  branch="$(resolve_branch_name "$pr_number" "$branch_arg")"

  echo "→ PR #${pr_number}"
  echo "→ local branch: ${branch}"
  echo "→ remote: ${REMOTE}"
  echo
  echo "+ git fetch ${REMOTE} pull/${pr_number}/head:${branch}"
  git fetch "$REMOTE" "pull/${pr_number}/head:${branch}"

  echo "+ git checkout ${branch}"
  git checkout "$branch"

  echo
  echo "✓ checked out ${branch} (PR #${pr_number})"
  echo
  echo "When done reviewing, delete with:"
  echo "  $(basename "$0") --delete ${branch}"
  echo "  # or:"
  echo "  git checkout ${DEFAULT_BASE} && git branch -D ${branch}"
}

cmd_delete() {
  local target="$1"
  local branch_arg="${2:-}"

  local pr_number
  pr_number="$(extract_pr_number "$target")"

  local branch
  if [[ -n "$pr_number" ]]; then
    branch="$(resolve_branch_name "$pr_number" "$branch_arg")"
  elif [[ -n "$branch_arg" ]]; then
    # rare: --delete somename owner:branch
    branch="$(extract_branch_name "$branch_arg")"
  else
    branch="$(extract_branch_name "$target")"
  fi

  [[ -n "$branch" ]] || die "could not resolve branch to delete"

  if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
    die "local branch '${branch}' does not exist"
  fi

  local current
  current="$(git branch --show-current)"
  if [[ "$current" == "$branch" ]]; then
    echo "+ git checkout ${DEFAULT_BASE}"
    git checkout "$DEFAULT_BASE"
  fi

  echo "+ git branch -D ${branch}"
  git branch -D "$branch"
  echo "✓ deleted local branch ${branch}"
}

# --- main ---
[[ $# -ge 1 ]] || { usage; exit 1; }

mode="setup"
case "${1:-}" in
  -h|--help)
    usage
    exit 0
    ;;
  -d|--delete|delete)
    mode="delete"
    shift
    ;;
esac

[[ $# -ge 1 ]] || { usage; exit 1; }

# Must run inside a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || die "not inside a git repository"

case "$mode" in
  setup)  cmd_setup "$@" ;;
  delete) cmd_delete "$@" ;;
esac
