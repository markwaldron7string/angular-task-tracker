#!/usr/bin/env bash
# Deploy task-tracker-fullstack to production (Vercel + Azure).
# Run from your Mac in the fullstack repo clone.
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" || ! -f "$REPO_ROOT/client/package.json" ]]; then
  echo "Run this script from inside your task-tracker-fullstack git clone."
  exit 1
fi
cd "$REPO_ROOT"

cleanup_stuck_am() {
  if [[ -d .git/rebase-apply ]] || [[ -d .git/rebase-apply.backup ]]; then
    echo "==> Clearing stuck git am / rebase-apply state..."
    git am --abort 2>/dev/null || true
    rm -rf .git/rebase-apply .git/rebase-apply.backup
  fi
}

echo "==> Fetching latest from GitHub..."
git fetch origin

cleanup_stuck_am

echo "==> Checking out main..."
git checkout main
git pull origin main

if git rev-parse d98456a >/dev/null 2>&1 && git merge-base --is-ancestor d98456a HEAD; then
  echo "main already includes the drag-reorder + CI fix commits."
elif git rev-parse d98456a >/dev/null 2>&1; then
  echo "==> Cherry-picking verified commits..."
  git cherry-pick 022f7fd d98456a
else
  # If a previous git am left uncommitted changes, start clean.
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "==> Uncommitted changes detected — resetting to origin/main before applying patch."
    git reset --hard origin/main
  fi

  echo "==> Downloading verified patch..."
  PATCH_URL="https://raw.githubusercontent.com/markwaldron7string/angular-task-tracker/cursor/fullstack-drag-reorder-patch-61a6/patches/task-tracker-fullstack-drag-reorder-and-ci.patch"
  curl -fsSL -o /tmp/task-tracker-fullstack.patch "$PATCH_URL"

  echo "==> Applying patch (2 commits)..."
  git am /tmp/task-tracker-fullstack.patch
fi

AHEAD="$(git rev-list --count origin/main..HEAD)"
if [[ "$AHEAD" -eq 0 ]]; then
  echo "ERROR: No new commits on main. Patch may have failed silently."
  git status
  exit 1
fi

echo "==> $AHEAD new commit(s) ready to push:"
git log --oneline origin/main..HEAD

echo "==> Running tests..."
(cd client && yarn install --frozen-lockfile && yarn test:ci && yarn build)
dotnet test TaskTracker.slnx --configuration Release

echo "==> Pushing main (this triggers Vercel production deploy)..."
git push origin main

echo ""
echo "Done. Watch Vercel: https://vercel.com/mark-waldrons-projects/task-tracker-fullstack"
echo "Production URL: https://task-tracker-fullstack-nu.vercel.app"
