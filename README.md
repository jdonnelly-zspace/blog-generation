# zSpace Blog Generation

Claude Code workflow for writing and publishing SEO-optimized blogs to the zSpace Directus CMS.

## Quick Start

1. **Clone this repo and open the project directory in [Claude Code](https://claude.ai/claude-code).** The skill lives in `.claude/skills/zspace-blog/` and is only picked up when your working directory is this repo root — always `cd` here before running `/blog`.
2. **Get your API tokens** — see [For Team Members](#for-team-members) below.
3. **Create your local `.env` file** (details below).
4. **Ask Claude to write a blog** — say `/blog` or `"write a blog post about [topic]"`.
5. Claude runs discovery → SEO plan → HTML writing → review PDF → link validation → Directus publish (as a draft).
6. Review the Directus admin URL Claude provides and flip the post to `published` when ready.

### Creating your local `.env` file

The `.env` file holds your personal API tokens. It **lives only on your computer**, never in the repo. It's already listed in `.gitignore`, so git will refuse to commit it — but don't try to force it.

**Where it goes:** the project root, right next to `.env.example`, `README.md`, and `CLAUDE.md`. Same folder.

**Option A — Terminal (fastest):**

```bash
cd path/to/blog-generation   # wherever you cloned the repo
cp .env.example .env         # makes a local copy
open -e .env                 # opens it in TextEdit (Mac)
# or use your editor of choice: code .env  /  nano .env  /  vim .env
```

**Option B — Finder / File Explorer:**

1. In Finder, navigate to the cloned `blog-generation` folder.
2. Enable "Show Hidden Files" (on Mac: `Cmd+Shift+.`).
3. Right-click `.env.example` → Duplicate, then rename the copy from `.env.example copy` to `.env`.
4. Open `.env` in TextEdit or your editor.

**What to paste in:** JP (or the setup script) will give you two tokens. Put each on the line that already ends in `=`:

```
DIRECTUS_TOKEN_SANDBOX=paste-the-sandbox-token-here
DIRECTUS_TOKEN_PRODUCTION=paste-the-production-token-here
```

Leave the URL lines alone (already correct), leave `DIRECTUS_ENV=sandbox` for your first run, save the file, and you're done. No spaces around `=`, no quotes around the token.

**Quick check:**
```bash
cat .env | grep TOKEN        # should show both token lines, each with a value
```

## Staying in Sync with the Team

The skill, guidelines, and reference drafts all live in this repo. Every time you run `/blog`, the skill runs a **pre-flight check** that compares your local copy to `origin/main`:

- **Behind with a clean working tree** → Claude offers to `git pull --ff-only` before writing, so you get the latest guidelines and skill version.
- **Behind with uncommitted changes** → Claude warns you and continues with your current version. Resolve your changes and pull when ready.
- **Up to date** → continues silently.

This means you only need to clone the repo once. Pulls happen on demand when drift is detected. If you want to force an update, just run `git pull` before `/blog`.

## For Team Members

### Getting your API token

Each team member gets their own personal Directus user with the "Blog Writer" policy attached. This means `user_created` in Directus reflects who actually published the post.

**To get your account**, ask JP Donnelly (jdonnelly@zspace.com) — or, if you have admin access, run:

```bash
node scripts/setup_roles.js --add-user YOUR_EMAIL --policies blog
```

JP (or the setup script) will give you a token for each environment. These are scoped tokens with create/update rights on `mkt_blog` and the category junction table — NOT admin tokens. Tokens are **per-person** — don't share yours.

### Which environment does what

| Environment | URL | Use for |
|---|---|---|
| `sandbox` | `sandbox1.admin.zspace.com` | Safe testing. **Start here for your first blog.** |
| `production` | `admin.zspace.com` | The live site. Flip to this once you're comfortable. |

Switch environments by changing `DIRECTUS_ENV` in `.env`.

### Setup steps

```bash
cd Blog\ Generation
cp .env.example .env
# open .env and paste in your personal tokens
# confirm DIRECTUS_ENV=sandbox for your first run
```

Then open the project in Claude Code and say: `write a blog post about [your topic]`.

### Don't commit tokens

`.env` and `.claude/` are both gitignored. Never:
- Hardcode a token inside a script, doc, or blog post.
- Paste a token into chat, issues, or Slack threads.
- Push `.env` to any remote.

If a token is exposed, tell JP immediately so the user can be disabled and a new token issued. When a team member leaves the project, disable their Directus user to revoke access.

## For Admins

If you manage blog API users and policies, you'll need admin tokens in addition to your personal token.

### Setup

```bash
cp .env.admin.example .env     # includes admin token fields
# Fill in your personal + admin tokens, then:

# One-time: create the Blog Writer policy and API Tools User role
node scripts/setup_roles.js

# Add a team member
node scripts/setup_roles.js --add-user name@zspace.com --policies blog

# List all blog API users
node scripts/setup_roles.js --list-users
```

See [`guidelines/api-users-and-tokens.md`](guidelines/api-users-and-tokens.md) for permission details and the full user management workflow.

## Editing the Rules

All blog-writing rules live in editable markdown files. Change them to evolve voice, SEO, or schema — no code changes needed.

| File | Controls |
|---|---|
| [`guidelines/voice-and-style.md`](guidelines/voice-and-style.md) | Persona, tone, audience, canonical zSpace URLs |
| [`guidelines/writing-rules.md`](guidelines/writing-rules.md) | SEO, HTML structure, link validation |
| [`guidelines/directus-schema.md`](guidelines/directus-schema.md) | Directus fields, category IDs, API shape |
| [`guidelines/api-users-and-tokens.md`](guidelines/api-users-and-tokens.md) | API access, tokens, permissions |

Changes take effect the next time Claude writes a blog.

## Questions

Contact JP Donnelly (jdonnelly@zspace.com).
