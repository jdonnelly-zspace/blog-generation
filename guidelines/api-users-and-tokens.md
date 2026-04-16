# API Users & Tokens

## How It Works

Each team member gets a **personal Directus user** under the "API Tools User" role. The "Blog Writer" policy is attached directly to the user, granting create/update access to blog posts. Directus tracks who did what via `user_created` and `user_updated` audit fields.

**One person = one token.** Your `.env` has:
```
DIRECTUS_TOKEN_SANDBOX=<your-personal-token>
DIRECTUS_TOKEN_PRODUCTION=<your-personal-token>
```

## Policies

| Policy | What it enables |
|--------|----------------|
| **Blog Writer** | Creating and updating blog posts (`mkt_blog`) and linking categories (`mkt_blog_mkt_blog_categories`) |

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

- **create** on `mkt_blog` — POST new blog posts.
- **read** on `mkt_blog` — GET to verify slug/status after create.
- **update** on `mkt_blog` — PATCH to fix slug/status when Directus auto-rewrites them.
- **create** on junction table — POST to link categories after blog creation.
- **read** on junction table — verify category links.
- No **delete** on either collection — blog deletion is an admin action via the Directus UI.

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
