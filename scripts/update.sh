#!/usr/bin/env bash
# Pull the latest blog-generation skill and guidelines.
# The skill is symlinked into ~/.claude/skills, so changes apply on next /blog.

set -euo pipefail

INSTALL_DIR="${HOME}/zspace/blog-generation"

if [ ! -d "${INSTALL_DIR}/.git" ]; then
  echo "Not a git checkout: ${INSTALL_DIR}" >&2
  echo "Run scripts/install.sh first." >&2
  exit 1
fi

git -C "${INSTALL_DIR}" pull --ff-only
echo "Up to date. Next /blog will use the latest guidelines."
