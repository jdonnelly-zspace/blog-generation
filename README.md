# zSpace Blog Generation

Claude Code skill for writing and publishing SEO-optimized blogs to the zSpace Directus CMS.

Type `/blog` in Claude Code and it runs the full flow: discovery → SEO plan → HTML writing → review PDF → link validation → Directus publish (as a draft).

## Get started

- **Writers** — follow [docs/WRITER_QUICKSTART.md](docs/WRITER_QUICKSTART.md). One installer command + paste two tokens.
- **Admins** — follow [docs/ADMIN.md](docs/ADMIN.md) for token creation, rotation, and updating the skill.

## What's in here

- `.claude/skills/zspace-blog/SKILL.md` — the workflow Claude runs.
- `guidelines/` — editable writing rules (voice, SEO, Directus schema). Change a file, commit, and the whole team picks it up on their next `/blog`.
- `scripts/install.sh` / `scripts/update.sh` — writer-facing installer + update helper.
- `scripts/setup_roles.js` — admin tool for creating per-writer Directus users.
- `drafts/` — generated HTML, metadata JSON, and review PDFs (writer-local).

## How it works

The installer clones this repo to `~/zspace/blog-generation` and symlinks the skill into `~/.claude/skills/zspace-blog`, so `/blog` works from any folder. The skill reads `~/zspace/blog-generation/.env` for tokens and the `guidelines/` files for rules. A pre-flight check on every run offers a `git pull` when the repo is behind `origin/main` — writers never have to think about updates.

## Directus essentials (for context)

- Collection: `mkt_blog`. Content field: `content`. Date field: `display_date`. No `author` field — each writer's token maps to their Directus user via `user_created`.
- Categories: M2M via `mkt_blog_mkt_blog_categories`. IDs: 1=Immersive Learning, 4=STEM, 5=CTE.
- Directus may auto-rewrite the slug or status. The skill always GETs the record after create and PATCHes back if needed.

## zSpace.com link validation

zspace.com is an Angular SPA — invalid routes return HTTP 200 with a shell, then client-redirect to `/404`. The skill validates every zspace.com link in a real browser (via Claude_in_Chrome MCP) before publishing. See [`guidelines/writing-rules.md`](guidelines/writing-rules.md) → Pre-Publish Link Validation.

## Questions

JP Donnelly — jdonnelly@zspace.com.
