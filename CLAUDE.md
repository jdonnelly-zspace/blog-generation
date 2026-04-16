# zSpace Blog Generation

Claude Code workflow for writing and publishing SEO-optimized blogs for zSpace's marketing team, integrated with the Directus CMS at `admin.zspace.com`.

## Quick Start

1. Copy `.env.example` to `.env` and add your personal Directus API token.
2. Ask Claude to write a blog post: `/blog` or `"write a blog post about [topic]"`.
3. Claude runs discovery → SEO plan → HTML writing → review PDF → link validation → Directus publish.

## Structure

- `guidelines/` — editable writing rules (team-owned):
  - `voice-and-style.md` — persona, tone, **canonical zSpace URLs table**.
  - `writing-rules.md` — SEO, HTML structure, pre-publish link validation.
  - `directus-schema.md` — Directus fields, category IDs, API shape.
- `drafts/` — generated HTML, metadata JSON, and review PDFs before publish.
- `images/` — blog image staging + `images/examples/` (15 reference images).

The Claude skill lives at `~/.claude/skills/zspace-blog/SKILL.md` and loads all three guideline files at the start of every session.

## Environment

`.env` supports multiple environments via `DIRECTUS_ENV=sandbox` or `production`. Add more by adding `DIRECTUS_URL_<NAME>` / `DIRECTUS_TOKEN_<NAME>` pairs. Each team member uses their own personal API token. See `guidelines/api-users-and-tokens.md`.

## Directus Essentials

- Collection: `mkt_blog`. Content field: `content`. Date field: `display_date`. No `author` field — each person's token maps to their Directus user, providing an audit trail via `user_created`.
- Categories: M2M via junction table `mkt_blog_mkt_blog_categories`. Link as a separate POST after creating the post. IDs: 1=Immersive Learning, 4=STEM, 5=CTE.
- **Directus may auto-rewrite the slug from the title and may auto-change status.** Always GET the record after create and PATCH back if needed. See `guidelines/directus-schema.md`.

## zSpace.com Link Validation

zspace.com is an Angular SPA. Invalid routes return HTTP 200 with a shell, then client-side redirect to `/404`. **Automated HTTP status checks cannot detect broken zspace.com links.** Every blog post must have every zspace.com link verified in a real browser before publishing. See `guidelines/writing-rules.md` → Pre-Publish Link Validation.
