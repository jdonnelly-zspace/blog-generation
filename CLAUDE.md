# zSpace Blog Generation

Claude Code workflow for writing and publishing SEO-optimized blogs for zSpace's marketing team, integrated with the Directus CMS at `admin.zspace.com`.

## Quick Start

- Writers: see [docs/WRITER_QUICKSTART.md](docs/WRITER_QUICKSTART.md).
- Admins: see [docs/ADMIN.md](docs/ADMIN.md).

In short: writers run `scripts/install.sh` once, paste tokens into `.env`, and then type `/blog` in Claude Code from any folder.

## Structure

- `guidelines/` — editable writing rules (team-owned):
  - `voice-and-style.md` — persona, tone, **canonical zSpace URLs table**.
  - `writing-rules.md` — SEO, HTML structure, pre-publish link validation.
  - `directus-schema.md` — Directus fields, category IDs, API shape.
- `drafts/` — generated HTML, metadata JSON, and review PDFs before publish.
- `images/` — blog image staging + `images/examples/` (15 reference images).

The Claude skill lives at `.claude/skills/zspace-blog/SKILL.md` in this repo. The installer symlinks it into `~/.claude/skills/zspace-blog` so it loads from any working directory. The skill reads guidelines and `.env` from `~/zspace/blog-generation/` (the canonical clone location).

## Environment

`.env` for writers is production-only and ships pre-configured (`DIRECTUS_ENV=production`, `DIRECTUS_URL_PRODUCTION`, and one empty `DIRECTUS_TOKEN_PRODUCTION` line). Writers paste their token and they're done — no env switching. Admins use `.env.admin.example` instead, which adds sandbox URLs and admin tokens for `setup_roles.js`. Each team member uses their own personal API token. See `guidelines/api-users-and-tokens.md`.

## Directus Essentials

- Collection: `mkt_blog`. Content field: `content`. Date field: `display_date`. No `author` field — each person's token maps to their Directus user, providing an audit trail via `user_created`.
- Categories: M2M via junction table `mkt_blog_mkt_blog_categories`. Link as a separate POST after creating the post. IDs: 1=Immersive Learning, 4=STEM, 5=CTE.
- **Directus may auto-rewrite the slug from the title and may auto-change status.** Always GET the record after create and PATCH back if needed. See `guidelines/directus-schema.md`.

## zSpace.com Link Validation

zspace.com is an Angular SPA. Invalid routes return HTTP 200 with a shell, then client-side redirect to `/404`. **Automated HTTP status checks cannot detect broken zspace.com links.** Every blog post must have every zspace.com link verified in a real browser before publishing. See `guidelines/writing-rules.md` → Pre-Publish Link Validation.
