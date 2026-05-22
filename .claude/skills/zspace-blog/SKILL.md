---
name: blog
description: >
  Use this skill when the user wants to create a blog post for zSpace, write a blog,
  generate blog content, or asks about the blog writing workflow. Triggers include:
  "write a blog", "create a blog post", "new blog", "blog about", "write about",
  "SEO blog", "blog for zSpace", or any request to create marketing blog content.
  Handles the full flow: discovery → SEO plan → HTML writing → review PDF → link
  validation → Directus publish.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
  - WebSearch
---

# zSpace Blog Writer

Expert SEO blog writing system for zSpace's marketing team.

The skill is installed globally and reads everything from a fixed project root:

```
PROJECT_ROOT="${HOME}/zspace/blog-generation"
```

All paths below (`guidelines/...`, `drafts/...`, `.env`) resolve under `PROJECT_ROOT`. The user does **not** need to `cd` into the repo — `/blog` works from any folder. If `${HOME}/zspace/blog-generation` does not exist, tell the user to run `bash <(curl -fsSL https://raw.githubusercontent.com/jdonnelly-zspace/blog-generation/main/scripts/install.sh)` and stop.

## Pre-flight: Check for Repo Updates

Before anything else, check if `${PROJECT_ROOT}` is behind `origin/main` so we stay on the same guidelines as the team. Run this once per session:

```bash
PROJECT_ROOT="${HOME}/zspace/blog-generation"
if [ -d "${PROJECT_ROOT}/.git" ]; then
  git -C "${PROJECT_ROOT}" fetch --quiet 2>/dev/null || true
  behind=$(git -C "${PROJECT_ROOT}" rev-list --count HEAD..@{u} 2>/dev/null || echo 0)
  dirty=$(git -C "${PROJECT_ROOT}" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "behind=$behind dirty=$dirty"
fi
```

- If `behind > 0` AND `dirty = 0`: tell the user "The blog skill is N commits behind origin/main. Pull latest guidelines before writing? (recommended)" and, on approval, run `git -C "${PROJECT_ROOT}" pull --ff-only`.
- If `behind > 0` AND `dirty > 0`: tell the user "The blog skill is N commits behind origin/main, but you have uncommitted changes in ${PROJECT_ROOT}. I'll skip the auto-pull — resolve and pull when ready. Continuing with your current version."
- If `behind = 0` OR the check failed: continue silently.

Degrade gracefully — if `.git` is missing, there's no upstream configured, or any command fails, just continue. Never block blog writing on the update check.

## Setup

1. Read `${PROJECT_ROOT}/.env` to confirm the user's personal API token is set. If missing or empty, tell the user to open `${PROJECT_ROOT}/.env` and paste the token JP sent them (see `${PROJECT_ROOT}/guidelines/api-users-and-tokens.md`).
2. Note the active `DIRECTUS_ENV` and confirm with the user which environment to publish to.
3. **Verify Python + `reportlab`** (needed for Phase 4a PDF generation and Phase 5 publishing). **Install anything missing — never ask the writer to do it.**
   - Detect a working Python interpreter. Try `python3 --version`, then `python --version`, then `py --version` (Windows). Pick the first that works and use that command for everything else.
   - **If no Python is found:**
     - **Mac/Linux:** Run `xcode-select --install` (this also brings Python). Tell the writer to click *Install* in the dialog and wait, then re-check.
     - **Windows:** Run `winget install --id Python.Python.3.12 -e --source winget --accept-source-agreements --accept-package-agreements`. Tell the writer to click *Yes* on any UAC prompt, then close and reopen the terminal so `PATH` refreshes.
     - If automated install fails, open <https://www.python.org/downloads/> for the writer, walk them through it, and resume once `python --version` works.
   - **Verify `reportlab` is importable:** `<python> -c "import reportlab"`. If it errors, install it: `<python> -m pip install --user reportlab`.
   - On `pip install` failure (network, permissions), surface the error verbatim and try `--break-system-packages` only if the user agrees.
   - Once both checks pass, **continue silently** — don't re-announce success.

## Load Guidelines

At the start of every session, read these three files from `${PROJECT_ROOT}/guidelines/` — they are the authoritative source:

- `voice-and-style.md` — persona, tone, canonical URLs
- `writing-rules.md` — SEO, HTML, link validation
- `directus-schema.md` — Directus fields, category IDs

Follow all rules in these files. They take precedence over any defaults.

## Local-Only Workflow

Drafts under `${PROJECT_ROOT}/drafts/` are local working files. **Do not run `git add`, `git commit`, `git push`, `git checkout -b`, or any branch/remote operation in `${PROJECT_ROOT}` as part of the blog flow.** The skill publishes through the Directus API only. Guideline edits are the one exception, and those require the writer to ask for them explicitly. If the writer asks you to commit, confirm first and never push without explicit approval.

---

## Workflow — 6 Phases

### PHASE 1: Discovery

Ask the user for:
- **Topic & SEO:** main topic, primary keyword, related keywords, any trending angle.
- **Takeaways & intent:** what search question this answers; 3-5 key takeaways.
- **zSpace value & evidence:** which value prop to highlight (offline capability, curriculum alignment, screen-based AR, versatility, accessibility, teacher support, cost-effectiveness); any data, studies, or customer examples.
- **Linking & category:** specific zSpace pages or external sources to reference; blog category (Immersive Learning, STEM, or CTE); word count if not default 1,500-2,500.

Group questions conversationally — don't re-ask what the user already told you. Skip discovery entirely if the user gave a clear topic + source material up front and confirm a quick plan (Phase 2) instead.

### PHASE 2: Content Plan

Present for confirmation:

```
SEO Strategy:
- Primary Keyword: [keyword]
- Secondary Keywords: [list]
- Search Intent: [what question this answers]
- Proposed Title: [45-60 chars] (XX characters)
- Proposed URL Slug: [slug]
- Proposed Excerpt: [130-160 chars] (XXX characters)

Content Plan:
- Topic summary, key takeaways, zSpace value, data, customer examples,
  internal/external links, category, display date
```

Ask: "Does this plan look right? Should I proceed with writing?" Wait for confirmation.

### PHASE 3: Write

After confirmation, produce the blog post following the loaded guidelines:

1. SEO header block (Title, URL Slug, Excerpt, Primary Keyword, Secondary Keywords) with character counts.
2. Full HTML content (1,500-2,500 words).
3. Verify character counts: Title 45-60, Excerpt 130-160, plain ASCII only.
4. `<!--more-->` after opening.
5. Only `<h2>` / `<h3>` headers (never `<h1>`).
6. 3-5 internal + 2-4 external links.
7. **Use ONLY canonical zSpace URLs** (see Canonical URLs table in `voice-and-style.md`).

Save two files under `${PROJECT_ROOT}/drafts/`. Save the files and stop — do not stage, commit, or push them.
- `${PROJECT_ROOT}/drafts/[slug].html` — the HTML content.
- `${PROJECT_ROOT}/drafts/[slug].json` — metadata. Default `status` to `published` and `display_date` to **today** at 12:00 UTC (ISO 8601). Override only if the writer explicitly asked for a draft or a different date:
  ```json
  {
    "title": "...",
    "slug": "...",
    "excerpt": "...",
    "primary_keyword": "...",
    "secondary_keywords": ["..."],
    "category_id": 1,
    "display_date": "2026-05-21T12:00:00.000Z",
    "status": "published"
  }
  ```

### PHASE 4: Review (PDF + Link Validation)

Present the full output to the user, then:

**4a. Generate a review PDF** at `${PROJECT_ROOT}/drafts/[slug].pdf`:
- Letter size, 1" margins, 11pt body, 1.3 line spacing.
- Header: "zSpace" in brand blue #0066CC 24pt + "BLOG POST — DRAFT FOR REVIEW" label.
- Gray metadata block with title, slug, excerpt, keywords, category, date, status.
- Body: H2 as bold section breaks, preserved lists, links shown as blue underlined text, short paragraphs.
- Footer on every page: "DRAFT — Not for publication. Generated [date]. Page N".
- Use Python `reportlab` (already installed).

**4b. Validate every link** — zspace.com is an Angular SPA, so HTTP status checks miss client-side 404s:
- For each zspace.com URL: open in a real browser (Claude_in_Chrome MCP: `navigate` + `wait` ~5s + check tab title/URL). If title is "Page Not Found | zSpace" or final URL contains `/404`, it's broken — replace with a canonical URL from `voice-and-style.md` and re-check.
- For each blog.zspace.com URL: HTTP status check via `urllib` is reliable.
- For each external URL: HTTP status check. If 403 from Cloudflare, open in a browser to confirm before calling it broken.
- Update both the HTML draft file AND the content to be sent to Directus if any link changes.

Then ask: "Ready to publish to Directus as **published** with today's date? Or revisions? (You can also ask me to keep it as a draft or pick a future publish date.)" Only proceed on explicit approval.

### PHASE 5: Publish

Use Python to read `${PROJECT_ROOT}/.env`, POST to Directus, and link categories. Use `urllib` (no external deps needed).

1. **POST** `/items/mkt_blog` with title, slug, content, excerpt, status=`published` (the default — use `draft` only if the writer asked), display_date=today (use the writer's date if they specified one).
2. **POST** `/items/mkt_blog_mkt_blog_categories` with `{ mkt_blog_id, mkt_blog_categories_id }`. Category IDs: 1=Immersive Learning, 4=STEM, 5=CTE.
3. **Verify Directus did not rewrite the slug or status.** GET the record back and check:
   - `slug` matches what you submitted. If Directus auto-generated a title-based slug, PATCH it back to the SEO-optimized one.
   - `status` matches what you submitted. If a Flow demoted `published` → `draft`, PATCH back to `published` (unless the writer asked for draft). If a Flow promoted `draft` → `published` and the writer wanted draft, PATCH back to `draft`.
   - Flag any mismatch to the user.
4. **Capture both URLs** for the Phase 6 Jira task and the completion summary:
   - Public URL: `https://blog.zspace.com/{slug}` — this is the link the writer should share.
   - Directus admin URL: `{DIRECTUS_URL}/admin/content/mkt_blog/{id}` — internal only.

Proceed directly to Phase 6 (file the image task) before showing the completion summary.

### PHASE 6: File image task with creative team

Right after a successful publish, automatically create a Jira ticket asking the creative team for a header image. **Do not prompt the writer** — just file it and include the link in the final summary. If Jira fails, the blog is already published; surface the error but don't roll anything back.

Use the Atlassian MCP. If the tool schema isn't loaded, call `ToolSearch` with `select:mcp__ea6c6a90-421c-445c-869d-ea36016341d9__createJiraIssue,mcp__ea6c6a90-421c-445c-869d-ea36016341d9__lookupJiraAccountId` first (the server prefix may vary — search for `createJiraIssue` and `lookupJiraAccountId` if that exact id misses).

**Resolve the writer's email** (used for the Jira reporter and one of the mentions). GET `/users/me` from Directus with the writer's token from `.env`; the response includes `email`. Cache it for the session.

**Assemble the issue:**
- **cloudId:** `64848c61-aba7-4435-aa3c-4d499b2eaa9b` (zspace.atlassian.net).
- **projectKey:** `ZW`
- **issueTypeName:** `Task`
- **summary:** `Provide image for blog: {title}`
- **assignee accountId:** `5c475b0481ec9e450cead0f4` (David Cipres, dcipres@zspace.com).
- **reporter accountId:** look up the writer's email via `lookupJiraAccountId`.
- **description (ADF):** four paragraphs —
  1. `An image is needed for this blog: https://blog.zspace.com/{slug}`
  2. `Upload the .png to the Directus entry: {DIRECTUS_URL}/admin/content/mkt_blog/{id}`
  3. `Size: 1920px by 1080px`
  4. `cc: ` followed by ADF `mention` nodes for each of: the writer's email, `jdonnelly@zspace.com`, `jparlier@zspace.com`, `aaustin@zspace.com`. Resolve each via `lookupJiraAccountId`. If any lookup fails, fall back to plain-text emails for the unresolved addresses in that same paragraph and flag the gap to the writer at the end of the run.

**On Jira API failure:** show the error and the assembled summary/description, plus the manual-create URL `https://zspace.atlassian.net/secure/CreateIssue.jspa?pid=12605&issuetype=10100`. Continue to the completion summary; do not block.

### Completion summary

Show this after Phase 6 finishes (or fails gracefully):

```
Blog Post Published
- Public URL:     https://blog.zspace.com/[slug]    ← share this
- Title:          [title]
- Category:       [category]
- Display Date:   [YYYY-MM-DD]
- Status:         [published|draft]
- Directus admin: [admin url]  (internal)
- Image task:     https://zspace.atlassian.net/browse/[ZW-NNNN]
```

If the Jira create failed, replace the `Image task:` line with `Image task:     NOT FILED — see error above; create manually` and keep going.

Then add a one-line nudge so the writer knows they can change the result conversationally:

> If you'd like to keep this as a draft or set a future publish date, just tell me — e.g. *"change it to a draft"* or *"set the publish date to next Tuesday"* — and I'll update Directus.

---

## Error Handling

- `${PROJECT_ROOT}` doesn't exist → tell the user to run the installer (see top of this file) and stop.
- `${PROJECT_ROOT}/.env` missing or token empty → tell the user to open `${PROJECT_ROOT}/.env` and paste the token JP sent them (see `${PROJECT_ROOT}/guidelines/api-users-and-tokens.md`).
- Directus API error → show the error, suggest fixes.
- Unknown category ID → create without categories and flag the gap.
- Pre-flight check fails → continue silently; don't block on it.

## Quick Reference

- "What categories are available?" → read `${PROJECT_ROOT}/guidelines/directus-schema.md`.
- "Update the guidelines" → edit the appropriate file in `${PROJECT_ROOT}/guidelines/` and commit to the repo so the team gets the update.
- "Show recent drafts" → list files in `${PROJECT_ROOT}/drafts/`.

<!-- FUTURE: Directus notification flow exists but is inactive (SMTP not configured).
Flow ID: b93b2f03-e384-4515-8321-5de4b597b49f — reactivate once email transport is set up. -->
