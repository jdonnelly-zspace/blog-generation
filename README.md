# zSpace Blog Generation

Claude Code workflow for writing and publishing SEO-optimized blogs to the zSpace Directus CMS.

## Quick Start

1. **Clone this repo and open it in [Claude Code](https://claude.ai/claude-code).**
2. **Get your API tokens** — see [For Team Members](#for-team-members) below.
3. **Copy `.env.example` to `.env`** and paste in the tokens.
4. **Ask Claude to write a blog** — say `/blog` or `"write a blog post about [topic]"`.
5. Claude runs discovery → SEO plan → HTML writing → review PDF → link validation → Directus publish (as a draft).
6. Review the Directus admin URL Claude provides and flip the post to `published` when ready.

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
