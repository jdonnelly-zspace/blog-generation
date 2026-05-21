# zSpace Blog — Directus Schema

## Collection: `mkt_blog`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | integer (PK) | auto | Auto-increment. |
| `title` | string | yes | 45-60 chars. |
| `slug` | string | yes | Lowercase, hyphens. **May be auto-rewritten by Directus on create** — verify post-create. |
| `content` | text (HTML) | yes | Full blog HTML. |
| `excerpt` | text | yes | 130-160 chars, plain ASCII only. |
| `display_date` | dateTime | no | Display date for the post. |
| `status` | string | yes | `draft` or `published`. |
| `featured_image` | uuid (file) | no | Directus file UUID. CDN URL: `https://cdn.zspace.com/assets/{uuid}`. |
| `user_created` | string | auto | Tracks authorship (no separate `author` field). Each team member's personal API token means this reflects the actual person who published the post. |

**Categories:** M2M via junction table `mkt_blog_mkt_blog_categories`. Must be linked via a separate POST **after** creating the blog post.

**Category IDs:**
| ID | Name |
|---|---|
| 1 | Immersive Learning |
| 4 | STEM |
| 5 | CTE |

## Creating a Blog Post

1. **POST** `/items/mkt_blog` (no categories in body). Default `status` to `published` and `display_date` to today; only use `draft` or a future date when the writer asks:
   ```json
   {
     "title": "...",
     "slug": "...",
     "content": "<p>HTML...</p>",
     "excerpt": "...",
     "status": "published",
     "display_date": "2026-05-21T12:00:00.000Z"
   }
   ```

2. **POST** `/items/mkt_blog_mkt_blog_categories`:
   ```json
   { "mkt_blog_id": NEW_POST_ID, "mkt_blog_categories_id": 1 }
   ```

3. **GET** `/items/mkt_blog/{id}` and verify:
   - `slug` matches what you submitted (Directus may have overwritten it — PATCH back if so).
   - `status` matches what you submitted. If a Flow demoted `published` → `draft` (or vice versa) against the writer's intent, PATCH back.

## URL Patterns

- **Public URL:** `https://blog.zspace.com/{slug}` — what the skill hands back to the writer.
- **Admin URL:** `{DIRECTUS_URL}/admin/content/mkt_blog/{id}` — for editing in Directus.

## API Access

Each team member uses their own personal API token (per-person model). Tokens carry the "Blog Writer" policy. See `guidelines/api-users-and-tokens.md` for token setup, permissions, and user management.

## Environments

`.env` → `DIRECTUS_ENV=sandbox` or `production`. Add `DIRECTUS_URL_<NAME>` + `DIRECTUS_TOKEN_<NAME>` for new environments. Tokens are per-person — each team member has their own.

- Canonical zSpace URLs for blog content → `voice-and-style.md` (Canonical URLs table).
- Writing and link rules → `writing-rules.md`.
