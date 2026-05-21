# Admin Guide

For JP (and any future maintainer) of the zSpace Blog Generation workflow. Writers should use [WRITER_QUICKSTART.md](WRITER_QUICKSTART.md) instead.

## Onboarding a new writer

1. **Create their Directus user + token (production only):**
   ```bash
   cd ~/zspace/blog-generation
   node scripts/setup_roles.js --add-user name@zspace.com --policies blog --env production
   ```
   The script creates the user under the Blog Writer policy and prints a personal API token.

2. **Send the writer two things** (via 1Password share or another secure channel — never plain email/Slack):
   - Their **production** token
   - A link to [WRITER_QUICKSTART.md](WRITER_QUICKSTART.md)

3. Writers don't get sandbox tokens. Sandbox is admin-only — used when you're testing tone/style or SEO changes before they affect everyone.

## Listing / disabling writers

```bash
node scripts/setup_roles.js --list-users
```

When a teammate leaves, disable their Directus user from the admin UI to revoke both tokens.

## Admin `.env`

You need admin tokens in addition to your personal writer token to run `setup_roles.js`. Copy the admin template once:

```bash
cp .env.admin.example .env
```

Then fill in both your personal blog tokens and the admin tokens. See `guidelines/api-users-and-tokens.md` for permission details.

## Updating the skill / guidelines

The skill and all writing rules live in this repo. Edit and push:

```bash
cd ~/zspace/blog-generation
# edit .claude/skills/zspace-blog/SKILL.md or guidelines/*.md
git add -A && git commit -m "..."
git push
```

Writers pick up the change automatically — the next time anyone runs `/blog`, the skill's pre-flight check sees the new commit on `origin/main` and offers a fast-forward pull.

## Token rotation

If a token is exposed:

1. Disable the user in Directus admin → re-enable with a new token.
2. Send the writer the new token via secure channel.
3. Have them paste it into `~/zspace/blog-generation/.env`.

## Files at a glance

| File | Controls |
|---|---|
| `.claude/skills/zspace-blog/SKILL.md` | The workflow Claude runs |
| `guidelines/voice-and-style.md` | Persona, tone, canonical URLs |
| `guidelines/writing-rules.md` | SEO, HTML, link validation |
| `guidelines/directus-schema.md` | Directus fields, category IDs |
| `guidelines/api-users-and-tokens.md` | Tokens, policies, user mgmt |
| `scripts/install.sh` | Writer one-shot installer |
| `scripts/update.sh` | Writer update helper |
| `scripts/setup_roles.js` | Admin user/policy management |
