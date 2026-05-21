#!/usr/bin/env bash
# zSpace Blog Generation — one-shot installer for content writers.
#
# Usage (after cloning the repo, or via curl pipe):
#   bash scripts/install.sh
#   curl -fsSL https://raw.githubusercontent.com/jdonnelly-zspace/blog-generation/main/scripts/install.sh | bash
#
# What it does:
#   1. Confirms Claude Code is installed.
#   2. Clones (or pulls) the repo into ~/zspace/blog-generation.
#   3. Symlinks the skill into ~/.claude/skills/zspace-blog so /blog works
#      from any folder.
#   4. Copies .env.example to .env if missing, then opens it for you.

set -euo pipefail

REPO_URL="https://github.com/jdonnelly-zspace/blog-generation.git"
INSTALL_DIR="${HOME}/zspace/blog-generation"
SKILL_LINK="${HOME}/.claude/skills/zspace-blog"

say() { printf "\n\033[1;34m==>\033[0m %s\n" "$*"; }
warn() { printf "\n\033[1;33m!!\033[0m %s\n" "$*"; }
die() { printf "\n\033[1;31mxx\033[0m %s\n" "$*" >&2; exit 1; }

# 1. Claude Code check
say "Checking for Claude Code..."
if ! command -v claude >/dev/null 2>&1; then
  warn "Claude Code (the 'claude' command) was not found on your PATH."
  warn "Install it from https://claude.ai/claude-code and re-run this script."
  die  "Claude Code is required."
fi
echo "   found: $(command -v claude)"

# 2. Clone or update
mkdir -p "${HOME}/zspace"
if [ -d "${INSTALL_DIR}/.git" ]; then
  say "Updating existing copy at ${INSTALL_DIR}..."
  git -C "${INSTALL_DIR}" pull --ff-only
else
  say "Cloning repo to ${INSTALL_DIR}..."
  git clone "${REPO_URL}" "${INSTALL_DIR}"
fi

# 3. Symlink the skill
say "Linking skill into ~/.claude/skills/..."
mkdir -p "${HOME}/.claude/skills"
SKILL_SRC="${INSTALL_DIR}/.claude/skills/zspace-blog"
[ -d "${SKILL_SRC}" ] || die "Skill source not found at ${SKILL_SRC}"

if [ -L "${SKILL_LINK}" ]; then
  ln -snf "${SKILL_SRC}" "${SKILL_LINK}"
  echo "   refreshed symlink: ${SKILL_LINK} -> ${SKILL_SRC}"
elif [ -e "${SKILL_LINK}" ]; then
  warn "${SKILL_LINK} exists and is not a symlink — leaving it alone."
  warn "Move it aside and re-run if you want the linked version."
else
  ln -s "${SKILL_SRC}" "${SKILL_LINK}"
  echo "   created symlink: ${SKILL_LINK} -> ${SKILL_SRC}"
fi

# 4. .env setup
ENV_FILE="${INSTALL_DIR}/.env"
if [ -f "${ENV_FILE}" ]; then
  say ".env already exists at ${ENV_FILE} — leaving it alone."
else
  say "Creating .env from .env.example..."
  cp "${INSTALL_DIR}/.env.example" "${ENV_FILE}"
  echo "   created: ${ENV_FILE}"
  echo
  echo "Next: paste the two tokens JP sent you on the lines ending in '='."
  echo "Save the file when done. Opening it now..."
  if command -v open >/dev/null 2>&1; then
    open -e "${ENV_FILE}" || true
  else
    warn "Could not auto-open editor. Edit ${ENV_FILE} manually."
  fi
fi

cat <<EOF

\033[1;32mDone.\033[0m

  Skill installed:  ${SKILL_LINK}
  Project files:    ${INSTALL_DIR}
  Token file:       ${ENV_FILE}

To write a blog: open Claude Code from any folder and type:

  /blog

To update later:  bash ${INSTALL_DIR}/scripts/update.sh
EOF
