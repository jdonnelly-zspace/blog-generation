# Writer Quickstart

Five minutes, four steps. You'll write your first zSpace blog post by typing `/blog` into Claude Code.

## 1. Install Claude Code

Download and install from <https://claude.ai/claude-code>. Sign in with your zSpace Google account.

## 2. Run the installer

Open the **Terminal** app (Cmd+Space → "Terminal") and paste this single line:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/jdonnelly-zspace/blog-generation/main/scripts/install.sh)
```

Press Return. The installer will:

- Confirm Claude Code is installed
- Download the blog skill to `~/zspace/blog-generation`
- Make the `/blog` command available from any folder
- Open your token file (`.env`) in TextEdit

## 3. Paste your tokens

Ask JP Donnelly (jdonnelly@zspace.com) for your two Directus tokens. When `.env` opens in TextEdit, find these two lines and paste a token after each `=`:

```
DIRECTUS_TOKEN_SANDBOX=paste-your-sandbox-token-here
DIRECTUS_TOKEN_PRODUCTION=paste-your-production-token-here
```

No quotes, no spaces around the `=`. Leave `DIRECTUS_ENV=sandbox` alone — that means your first posts go to the safe testing site, not the live one. Save and close.

## 4. Write a blog

Open Claude Code (any folder is fine — you don't need to be in the project folder) and type:

```
/blog
```

Claude will ask about your topic, propose an SEO plan, write the post, generate a review PDF, validate every link, and publish to Directus as a **draft**. You then review in Directus and flip to **published** when ready.

---

## When something changes

The skill auto-updates: every time you run `/blog`, it checks for new guidelines and offers to pull them. You don't have to do anything.

To force an update manually:

```bash
bash ~/zspace/blog-generation/scripts/update.sh
```

## Switching from sandbox to production

Your first few posts should go to **sandbox** (the default). Once you're comfortable, ask JP to walk you through flipping `DIRECTUS_ENV=production` in `~/zspace/blog-generation/.env`.

## Questions

JP Donnelly — jdonnelly@zspace.com.
