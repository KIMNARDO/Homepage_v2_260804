#!/bin/bash
export GIT_DISCOVERY_ACROSS_FILESYSTEM=1
cd /mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main
echo "=== branch ==="
git rev-parse --abbrev-ref HEAD 2>&1
echo "=== remotes ==="
git remote -v
echo "=== log(5) ==="
git log --oneline -5 2>&1
echo "=== status count ==="
git status --short | wc -l
echo "=== status sample ==="
git status --short | head -20
echo "=== existing .gitignore ==="
cat .gitignore 2>/dev/null || echo "NO .gitignore"
echo "=== gh cli ==="
command -v gh >/dev/null && gh auth status 2>&1 || echo "gh NOT installed in WSL"
echo "=== dir sizes (top) ==="
du -sh --exclude=node_modules ./* 2>/dev/null | sort -rh | head -18
