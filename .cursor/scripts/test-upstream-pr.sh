#!/usr/bin/env bash
# Test an upstream PR in odh-dashboard midstream.
#
# Usage:
#   bash .cursor/scripts/test-upstream-pr.sh <PR_URL>
#   bash .cursor/scripts/test-upstream-pr.sh --cleanup [branch-name]
#   bash .cursor/scripts/test-upstream-pr.sh --list
#
# Examples:
#   bash .cursor/scripts/test-upstream-pr.sh https://github.com/kubeflow/model-registry/pull/2338
#   bash .cursor/scripts/test-upstream-pr.sh --cleanup tmp-sync-pr-2338
#   bash .cursor/scripts/test-upstream-pr.sh --cleanup           # cleans up current tmp-sync-pr-* branch
#   bash .cursor/scripts/test-upstream-pr.sh --list              # lists all tmp-sync-pr-* branches
#
# What it does:
#   1. Infers the package from the PR URL (matches against subtree.repo in packages/*/package.json)
#   2. Creates a branch: tmp-sync-pr-<pr-number>
#   3. Runs `npm run update-subtree -- --pr=<url>` to apply the upstream PR's changes
#   4. On conflict, pauses for resolution; re-run with --continue to resume
#   5. On success, prints test instructions
#
# Cleanup:
#   --cleanup removes the test branch and switches back to main.
#   --list shows all existing tmp-sync-pr-* branches.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

die()  { echo -e "${RED}ERROR: $1${NC}" >&2; exit 1; }
info() { echo -e "${CYAN}$1${NC}"; }
ok()   { echo -e "${GREEN}$1${NC}"; }
warn() { echo -e "${YELLOW}$1${NC}"; }

# ── Helpers ────────────────────────────────────────────────────────────────

find_package_for_repo() {
  local search_owner="$1" search_repo="$2"
  for pkg_json in packages/*/package.json; do
    local repo_url
    repo_url=$(jq -r '.subtree.repo // empty' "$pkg_json" 2>/dev/null) || continue
    [[ -z "$repo_url" ]] && continue
    if echo "$repo_url" | grep -qi "${search_owner}/${search_repo}"; then
      basename "$(dirname "$pkg_json")"
      return 0
    fi
  done
  return 1
}

extract_pr_number() {
  echo "$1" | grep -oE '/pull/[0-9]+' | grep -oE '[0-9]+'
}

extract_owner_repo() {
  echo "$1" | grep -oE 'github\.com/[^/]+/[^/]+' | sed 's|github\.com/||'
}

list_test_branches() {
  git branch --list 'tmp-sync-pr-*' | sed 's/^[* ]*//'
}

# ── --list ─────────────────────────────────────────────────────────────────

if [[ "${1:-}" == "--list" ]]; then
  branches=$(list_test_branches)
  if [[ -z "$branches" ]]; then
    info "No tmp-sync-pr-* branches found."
  else
    info "Test sync branches:"
    echo "$branches" | while read -r b; do
      count=$(git log main.."$b" --oneline 2>/dev/null | wc -l | tr -d ' ')
      echo "  $b  ($count commits ahead of main)"
    done
  fi
  exit 0
fi

# ── --cleanup ──────────────────────────────────────────────────────────────

if [[ "${1:-}" == "--cleanup" ]]; then
  branch="${2:-}"

  # If no branch specified, try current branch
  if [[ -z "$branch" ]]; then
    branch=$(git branch --show-current)
    if [[ ! "$branch" =~ ^tmp-sync-pr- ]]; then
      die "Not on a tmp-sync-pr-* branch and no branch name given.\n  Usage: $0 --cleanup [branch-name]\n  Available: $(list_test_branches | tr '\n' ' ')"
    fi
  fi

  if [[ ! "$branch" =~ ^tmp-sync-pr- ]]; then
    die "Refusing to clean up '$branch' — only tmp-sync-pr-* branches are allowed."
  fi

  current=$(git branch --show-current)
  if [[ "$current" == "$branch" ]]; then
    warn "Switching to main first..."
    git checkout main
  fi

  info "Deleting local branch: $branch"
  git branch -D "$branch"

  # Delete remote branch if it exists
  if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
    warn "Deleting remote branch: origin/$branch"
    git push origin --delete "$branch" 2>/dev/null || warn "Could not delete remote branch (may need permissions)."
  fi

  # Close any open PR from this branch
  pr_number=$(gh pr list --head "$branch" --json number --jq '.[0].number' 2>/dev/null || echo "")
  if [[ -n "$pr_number" ]]; then
    warn "Closing PR #$pr_number from branch $branch"
    gh pr close "$pr_number" 2>/dev/null || warn "Could not close PR (may already be closed)."
  fi

  ok "Cleanup complete."
  exit 0
fi

# ── --continue (resume after conflict) ─────────────────────────────────────

if [[ "${1:-}" == "--continue" ]]; then
  current=$(git branch --show-current)
  if [[ ! "$current" =~ ^tmp-sync-pr- ]]; then
    die "Not on a tmp-sync-pr-* branch. Nothing to continue."
  fi

  # Find the package for this branch by looking at which package.json has DO_NOT_MERGE
  pkg=""
  for pkg_json in packages/*/package.json; do
    flag=$(jq -r '.subtree.DO_NOT_MERGE_OVERRIDDEN_FOR_PR // empty' "$pkg_json" 2>/dev/null) || continue
    if [[ -n "$flag" ]]; then
      pkg=$(basename "$(dirname "$pkg_json")")
      break
    fi
  done

  if [[ -z "$pkg" ]]; then
    die "Could not find a package with PR override. Are you on the right branch?"
  fi

  info "Continuing sync for package: $pkg"
  cd "packages/$pkg" && npm run update-subtree -- --continue
  exit $?
fi

# ── Main: test a PR ───────────────────────────────────────────────────────

PR_URL="${1:-}"
[[ -z "$PR_URL" ]] && die "Usage: $0 <PR_URL>\n\n  Example: $0 https://github.com/kubeflow/model-registry/pull/2338"

# Validate URL shape
[[ "$PR_URL" =~ github\.com/.+/pull/[0-9]+ ]] || die "Invalid PR URL: $PR_URL\n  Expected: https://github.com/<owner>/<repo>/pull/<number>"

PR_NUMBER=$(extract_pr_number "$PR_URL")
OWNER_REPO=$(extract_owner_repo "$PR_URL")
OWNER="${OWNER_REPO%%/*}"
REPO="${OWNER_REPO##*/}"

info "PR #$PR_NUMBER from $OWNER/$REPO"

# Find matching package
PKG=$(find_package_for_repo "$OWNER" "$REPO") || die "No package found with subtree.repo matching '$OWNER/$REPO'.\n  Checked packages/*/package.json for subtree config."
info "Matched package: $PKG"

# Ensure we're on main with clean working tree
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" =~ ^tmp-sync-pr- ]]; then
  die "Already on test branch '$CURRENT_BRANCH'.\n  To continue: $0 --continue\n  To clean up: $0 --cleanup"
fi

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  die "Not on main (currently on '$CURRENT_BRANCH').\n  Switch to main first: git checkout main"
fi

if [[ -n "$(git diff --stat HEAD)" ]] || [[ -n "$(git diff --cached --stat)" ]]; then
  die "Working tree has uncommitted changes. Commit or stash them first."
fi

# Create branch
BRANCH="tmp-sync-pr-${PR_NUMBER}"
if git branch --list "$BRANCH" | grep -q "$BRANCH"; then
  warn "Branch '$BRANCH' already exists."
  echo -e "  To clean up: ${CYAN}$0 --cleanup $BRANCH${NC}"
  echo -e "  To resume:   ${CYAN}git checkout $BRANCH && $0 --continue${NC}"
  die "Aborting. Clean up or resume the existing branch."
fi

info "Creating branch: $BRANCH"
git checkout -b "$BRANCH"

# Run the subtree sync with --pr flag
echo ""
info "Running subtree sync for $PKG with PR #$PR_NUMBER..."
echo ""

cd "packages/$PKG"
set +e
npm run update-subtree -- --pr="$PR_URL"
SYNC_EXIT=$?
set -e
cd "$ROOT"

if [[ $SYNC_EXIT -ne 0 ]]; then
  echo ""
  warn "Sync paused (likely conflicts). To resolve:"
  echo ""
  echo -e "  1. Resolve conflicts in ${CYAN}packages/$PKG/${NC}"
  echo -e "  2. Stage:    ${YELLOW}git add packages/$PKG${NC}"
  echo -e "  3. Continue: ${GREEN}bash .cursor/scripts/test-upstream-pr.sh --continue${NC}"
  echo ""
  echo -e "  To abort:    ${RED}bash .cursor/scripts/test-upstream-pr.sh --cleanup${NC}"
  exit 1
fi

# Success
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  PR #$PR_NUMBER synced successfully!${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Test the changes:"
echo -e "  ${CYAN}bash .cursor/scripts/federated-dev-fix-b.sh${NC}   (if model-registry)"
echo -e "  ${CYAN}npm run dev${NC}                                    (main dashboard)"
echo ""
echo "When done, clean up:"
echo -e "  ${YELLOW}bash .cursor/scripts/test-upstream-pr.sh --cleanup${NC}"
echo ""
