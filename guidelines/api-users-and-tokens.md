# API Users & Tokens

## How It Works

Each team member gets a **personal Directus user** under the "API Tools User" role. The "Blog Writer" policy is attached directly to the user, granting create/update access to blog posts. Directus tracks who did what via `user_created` and `user_updated` audit fields.

**One person = one token.** Your `.env` has:
```
DIRECTUS_TOKEN_SANDBOX=<your-personal-token>
DIRECTUS_TOKEN_PRODUCTION=<your-personal-token>
```

## Policies

| Policy | What it enables | Managed by |
|--------|----------------|------------|
| **Blog Writer** | Creating and updating blog posts (`mkt_blog`) and linking categories (`mkt_blog_mkt_blog_categories`) | `setup_roles.js` |
| **Creative Image Uploader** | Uploading blog header images and attaching them to a post | By hand, in Directus |
| **Add Resources & Images** | Directus admin UI access for the creative team | By hand, in Directus |
| **Blog API Access** | Read-only across the blog collections | By hand, in Directus |

Only **Blog Writer** is provisioned by the script. See [Policies not managed by `setup_roles.js`](#policies-not-managed-by-setup_rolesjs) below.

## Managing Users

```bash
# One-time setup: create the Blog Writer policy and API Tools User role
node scripts/setup_roles.js

# Add a team member with the Blog Writer policy
node scripts/setup_roles.js --add-user name@zspace.com --policies blog

# List all blog API users and their policies
node scripts/setup_roles.js --list-users
```

The admin token is read from `.env` (`DIRECTUS_ADMIN_TOKEN_{ENV}`) or can be passed via `--admin-token TOKEN`. Use `--env sandbox` or `--env production` to target an environment. Use `--dry-run` to preview without changes.

## Permission Details

### Blog Writer

| Collection | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| `mkt_blog` | X | X | X | |
| `mkt_blog_mkt_blog_categories` | X | X | | |
| `mkt_blog_authors` | | X | | |

- **create** on `mkt_blog` — POST new blog posts.
- **read** on `mkt_blog` — GET to verify slug/status after create.
- **update** on `mkt_blog` — PATCH to fix slug/status when Directus auto-rewrites them.
- **create** on junction table — POST to link categories after blog creation.
- **read** on junction table — verify category links.
- **read** on `mkt_blog_authors` — resolve the byline author list. Nothing reads it today (`SKILL.md` shows the list from `guidelines/directus-schema.md`), but it lets a future version query the collection instead of trusting a hand-maintained table.
- No **delete** on either collection — blog deletion is an admin action via the Directus UI.

### Creative Image Uploader (hand-managed)

For the creative team — uploading blog header images and attaching them to a post through the Directus UI. Attached to the **role** `API - Blog Writer`, not to individual users, so anyone in that role inherits it.

| Collection | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| `directus_files` | X | X | | |
| `mkt_blog` | | X | X | |
| `mkt_blog_categories` | | X | | |
| `mkt_blog_mkt_blog_categories` | X | X | | |

- **create/read** on `directus_files` — upload the 1920x1080 header image.
- **read/update** on `mkt_blog` — attach the uploaded file to `featured_image`.
- Renamed from "Blog Writer Policy" on 2026-09-03. The old name broke the duplicate check in `setup_roles.js`, which matches on the substring `blog` and so treated anyone holding it as already provisioned for Blog Writer.
- `mkt_blog` **create** was removed at the same time. It carried a full post-creation grant (title, slug, content, excerpt, status, display_date, categories, both image fields) that the image workflow never needed.

### Add Resources & Images (hand-managed)

Directus admin UI access for the creative team. Held by one user. Alongside the app collections it needs (`directus_presets`, `directus_settings`, `directus_comments`, `directus_fields` and similar), it grants:

| Collection | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| `mkt_blog` | X¹ | X | X¹ | |

¹ Scoped to the `featured_image` field only. Since `title`, `content`, and `excerpt` are required on `mkt_blog`, the field-scoped **create** cannot produce a valid post — it exists so the UI can attach an image.

### Policies not managed by `setup_roles.js`

The script knows about **Blog Writer** and nothing else. Two consequences worth knowing before you touch policies:

- **A fresh environment will be incomplete.** Running `setup_roles.js` against a new Directus instance creates Blog Writer and the `API Tools User` role. The creative-team policies above are not recreated — set them up by hand.
- **Editing `POLICY_DEFS` never updates a live policy.** `findOrCreatePolicy` returns early when a policy of that name already exists, so its permissions are written only at creation time. To change an existing policy, apply the change directly against the API or in the Directus UI — then update `POLICY_DEFS` so a fresh environment matches.

## Admin Setup

Admins who manage users and policies need admin tokens in addition to their personal token. Use `.env.admin.example` as your template:

```
DIRECTUS_TOKEN_SANDBOX=<your-personal-token>       # for writing blogs
DIRECTUS_ADMIN_TOKEN_SANDBOX=<your-admin-token>     # for setup_roles.js
DIRECTUS_TOKEN_PRODUCTION=<your-personal-token>
DIRECTUS_ADMIN_TOKEN_PRODUCTION=<your-admin-token>
```

- **Personal token**: Used by the blog workflow. Carries the Blog Writer policy. Directus tracks your identity.
- **Admin token**: Used ONLY by `setup_roles.js` to create/manage users and policies. This is your personal Directus admin account's static token (Settings -> Users -> Your user -> Token).

The `setup_roles.js` script reads the admin token from `.env` automatically. You can also override it with `--admin-token TOKEN` on the command line.

## Security Notes

- **No DELETE permissions** — blog deletion is an admin action through the Directus UI.
- **Tokens are per-person** — don't share. Each team member gets their own.
- **Rotate tokens** if a team member leaves the project — disable their Directus user.
- **`.env` is gitignored** — tokens are never committed.
- **Directus tracks identity** — `user_created`/`user_updated` fields show who made each change.
