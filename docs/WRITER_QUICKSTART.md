# Writer Quickstart

You need **Claude Code** installed (download from <https://claude.ai/claude-code>) and **two Directus tokens** from JP Donnelly (jdonnelly@zspace.com).

Once you have both, open Claude Code and paste the prompt below. Claude will set everything up for you — Mac or Windows.

---

## The Setup Prompt

Copy everything between the lines below and paste it into Claude Code. Press Return.

---

> Set up the zSpace blog-generation skill on this machine. Follow these steps and ask me for input only where noted.
>
> 1. **Detect my OS.** Run `uname -s` (Mac/Linux) or check `$env:OS` / `ver` (Windows PowerShell). Use the right path separators and commands for the rest of the steps.
>
> 2. **Pick install locations:**
>    - Mac/Linux: clone to `~/zspace/blog-generation`, skill link at `~/.claude/skills/zspace-blog`.
>    - Windows: clone to `%USERPROFILE%\zspace\blog-generation`, skill link at `%USERPROFILE%\.claude\skills\zspace-blog`.
>
> 3. **Verify git is installed.** If not, tell me to install it (Mac: `xcode-select --install`; Windows: <https://git-scm.com/download/win>) and stop.
>
> 4. **Clone or update the repo** from `https://github.com/jdonnelly-zspace/blog-generation.git` into the install location. If it already exists, `git pull --ff-only` it.
>
> 5. **Link the skill into my Claude skills folder** so `/blog` works from any folder:
>    - Mac/Linux: `ln -snf <install>/.claude/skills/zspace-blog ~/.claude/skills/zspace-blog` (create `~/.claude/skills` first).
>    - Windows: use a directory junction — `cmd /c mklink /J "%USERPROFILE%\.claude\skills\zspace-blog" "%USERPROFILE%\zspace\blog-generation\.claude\skills\zspace-blog"`. Create the parent folder first. If a non-symlink already exists at the target, warn me and stop — don't overwrite.
>
> 6. **Create my `.env` file** if it doesn't already exist by copying `.env.example` to `.env` inside the install location. If it already exists, leave it alone.
>
> 7. **Open `.env` for me to edit:**
>    - Mac: `open -e <path>` (TextEdit).
>    - Windows: `notepad <path>`.
>    - Then tell me: "Paste your sandbox token after `DIRECTUS_TOKEN_SANDBOX=` and your production token after `DIRECTUS_TOKEN_PRODUCTION=`. No quotes, no spaces around the `=`. Leave `DIRECTUS_ENV=sandbox` alone. Save and close."
>
> 8. **Confirm success.** Print the three paths (install folder, skill symlink, `.env`) and tell me: "Done. Type `/blog` in Claude Code from any folder to write a blog post."
>
> Be terse. Echo each command before running it. If any step fails, stop and tell me exactly what went wrong and what to try.

---

## After setup

Open Claude Code from **any folder** (you don't need to be in the project folder) and type:

```
/blog
```

Claude will ask about your topic, propose an SEO plan, write the post, generate a review PDF, validate every link, and publish to Directus as a **draft**. You then review in Directus and flip to **published** when ready.

## When something changes

The skill auto-updates: every `/blog` run checks for new guidelines and offers to pull them. You don't have to do anything.

To force an update manually, paste this into Claude Code:

> Pull the latest from `~/zspace/blog-generation` (Mac/Linux) or `%USERPROFILE%\zspace\blog-generation` (Windows). Run `git pull --ff-only` there.

## Switching from sandbox to production

Your first few posts should go to **sandbox** (the default). Once you're comfortable, ask JP to walk you through flipping `DIRECTUS_ENV=production` in your `.env` file.

## Questions

JP Donnelly — jdonnelly@zspace.com.
