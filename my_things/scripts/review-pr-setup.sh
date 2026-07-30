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

# Colors (only when stdout is a TTY; still color stderr errors if stderr is a TTY)
if [[ -t 1 ]]; then
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_CYAN=$'\033[36m'
  C_DIM=$'\033[2m'
else
  C_RESET='' C_BOLD='' C_GREEN='' C_YELLOW='' C_CYAN='' C_DIM=''
fi
if [[ -t 2 ]]; then
  C_RED=$'\033[31m'
  C_ORANGE=$'\033[38;5;208m'
  C_ERR_RESET=$'\033[0m'
else
  C_RED='' C_ORANGE='' C_ERR_RESET=''
fi

ok()   { printf '%s✓%s %s\n' "${C_GREEN}${C_BOLD}" "${C_RESET}${C_GREEN}" "$*${C_RESET}"; }
info() { printf '%s→%s %s\n' "${C_CYAN}" "${C_RESET}" "$*"; }
tip()  { printf '%s%s%s\n' "${C_YELLOW}" "$*" "${C_RESET}"; }
warn() { printf '%swarning:%s %s\n' "${C_ORANGE}${C_BOLD}" "${C_ERR_RESET}" "$*" >&2; }
die()  { printf '%serror:%s %s\n' "${C_RED}${C_BOLD}" "${C_ERR_RESET}" "$*" >&2; exit 1; }

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
  if ! git diff --quiet || ! git diff --cached --quiet; then
    warn "working tree has uncommitted changes; checkout may fail"
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

  info "PR #${pr_number}"
  info "local branch: ${C_BOLD}${branch}${C_RESET}"
  info "remote: ${REMOTE}"
  echo
  printf '%s+ git fetch %s pull/%s/head:%s%s\n' "${C_DIM}" "$REMOTE" "$pr_number" "$branch" "${C_RESET}"
  if ! git fetch "$REMOTE" "pull/${pr_number}/head:${branch}"; then
    die "git fetch failed for PR #${pr_number}"
  fi

  printf '%s+ git checkout %s%s\n' "${C_DIM}" "$branch" "${C_RESET}"
  if ! git checkout "$branch"; then
    die "git checkout failed for branch '${branch}'"
  fi

  echo
  ok "checked out ${C_BOLD}${branch}${C_RESET}${C_GREEN} (PR #${pr_number})"
  echo
  tip "When done reviewing, delete with:"
  tip "  $(basename "$0") --delete ${branch}"
  tip "  # or:"
  tip "  git checkout ${DEFAULT_BASE} && git branch -D ${branch}"
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
    printf '%s+ git checkout %s%s\n' "${C_DIM}" "$DEFAULT_BASE" "${C_RESET}"
    if ! git checkout "$DEFAULT_BASE"; then
      die "could not checkout '${DEFAULT_BASE}' before deleting '${branch}'"
    fi
  fi

  printf '%s+ git branch -D %s%s\n' "${C_DIM}" "$branch" "${C_RESET}"
  if ! git branch -D "$branch"; then
    die "failed to delete branch '${branch}'"
  fi
  ok "deleted local branch ${C_BOLD}${branch}"
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

git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || die "not inside a git repository"

case "$mode" in
  setup)  cmd_setup "$@" ;;
  delete) cmd_delete "$@" ;;
esac
