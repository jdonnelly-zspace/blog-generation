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
| `user_created` | string | auto | Tracks authorship (no separate `author` field). |

**Categories:** M2M via junction table `mkt_blog_mkt_blog_categories`. Must be linked via a separate POST **after** creating the blog post.

**Category IDs:**
| ID | Name |
|---|---|
| 1 | Immersive Learning |
| 4 | STEM |
| 5 | CTE |

## Creating a Blog Post

1. **POST** `/items/mkt_blog` (no categories in body):
   ```json
   {
     "title": "...",
     "slug": "...",
     "content": "<p>HTML...</p>",
     "excerpt": "...",
     "status": "draft",
     "display_date": "2026-04-15T12:00:00.000Z"
   }
   ```

2. **POST** `/items/mkt_blog_mkt_blog_categories`:
   ```json
   { "mkt_blog_id": NEW_POST_ID, "mkt_blog_categories_id": 1 }
   ```

3. **GET** `/items/mkt_blog/{id}` and verify:
   - `slug` matches what you submitted (Directus may have overwritten it — PATCH back if so).
   - `status` is still `draft` (a Flow may have auto-published — PATCH back if unintended).

## Admin URL Pattern

`{DIRECTUS_URL}/admin/content/mkt_blog/{id}`

## Environments

`.env` → `DIRECTUS_ENV=sandbox` or `production`. Add `DIRECTUS_URL_<NAME>` + `DIRECTUS_TOKEN_<NAME>` for new environments.

- Canonical zSpace URLs for blog content → `voice-and-style.md` (Canonical URLs table).
- Writing and link rules → `writing-rules.md`.
