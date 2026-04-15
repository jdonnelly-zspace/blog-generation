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

**What to paste in:** JP will send you two tokens. Put each on the line that already ends in `=`:

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

### Getting your API tokens

The workflow needs two Directus API tokens — one for the sandbox (testing), one for production (live site). **Request them from JP Donnelly (jdonnelly@zspace.com).** Ask for:

> "Blog-writer API tokens for Sandbox1 and Production."

These are scoped tokens with create/update rights on `mkt_blog` and the category junction table. They are NOT admin tokens. Tokens are **per-user** — don't share yours, and always request your own.

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
# open .env and paste in the tokens JP sent you
# confirm DIRECTUS_ENV=sandbox for your first run
```

Then open the project in Claude Code and say: `write a blog post about [your topic]`.

### Don't commit tokens

`.env` and `.claude/` are both gitignored. Never:
- Hardcode a token inside a script, doc, or blog post.
- Paste a token into chat, issues, or Slack threads.
- Push `.env` to any remote.

If a token is exposed, tell JP immediately so it can be rotated.

## Editing the Rules

All blog-writing rules live in editable markdown files. Change them to evolve voice, SEO, or schema — no code changes needed.

| File | Controls |
|---|---|
| [`guidelines/voice-and-style.md`](guidelines/voice-and-style.md) | Persona, tone, audience, canonical zSpace URLs |
| [`guidelines/writing-rules.md`](guidelines/writing-rules.md) | SEO, HTML structure, link validation |
| [`guidelines/directus-schema.md`](guidelines/directus-schema.md) | Directus fields, category IDs, API shape |

Changes take effect the next time Claude writes a blog.

## Questions

Contact JP Donnelly (jdonnelly@zspace.com).
