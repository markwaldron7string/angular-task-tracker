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

echo "==> Fetching latest from GitHub..."
git fetch origin

echo "==> Checking out main..."
git checkout main
git pull origin main

MAIN_SHA="$(git rev-parse HEAD)"
if git merge-base --is-ancestor d98456a HEAD 2>/dev/null || [[ "$MAIN_SHA" == d98456a* ]]; then
  echo "main already includes the drag-reorder + CI fix commits."
elif git cat-file -e d98456a 2>/dev/null; then
  echo "==> Cherry-picking verified commits onto main..."
  git cherry-pick 022f7fd d98456a
else
  echo "==> Downloading verified patch..."
  PATCH_URL="https://raw.githubusercontent.com/markwaldron7string/angular-task-tracker/cursor/fullstack-drag-reorder-patch-61a6/patches/task-tracker-fullstack-drag-reorder-and-ci.patch"
  curl -fsSL -o /tmp/task-tracker-fullstack.patch "$PATCH_URL"
  git am /tmp/task-tracker-fullstack.patch
fi

echo "==> Running tests..."
(cd client && yarn install --frozen-lockfile && yarn test:ci && yarn build)
dotnet test TaskTracker.slnx --configuration Release

echo "==> Pushing main (this triggers Vercel production deploy)..."
git push origin main

echo ""
echo "Done. Watch Vercel: https://vercel.com/mark-waldrons-projects/task-tracker-fullstack"
echo "Production URL: https://task-tracker-fullstack-nu.vercel.app"
