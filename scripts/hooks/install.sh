#!/bin/sh
# ⛔ GIT DOES NOT VERSION .git/hooks, so a hook installed on one machine protects only that machine.
# ⚠️ Run this after cloning: sh scripts/hooks/install.sh
cp "$(dirname "$0")/pre-push" "$(git rev-parse --git-dir)/hooks/pre-push"
chmod +x "$(git rev-parse --git-dir)/hooks/pre-push"
echo "pre-push hook installed"
