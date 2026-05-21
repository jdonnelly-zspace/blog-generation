# Writer Quickstart

You need **Claude Code** installed (download from <https://claude.ai/claude-code>) and a **production Directus token** from JP Donnelly (jdonnelly@zspace.com).

You do **not** need a GitHub account. The skill repo is public — Claude will download it for you.

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
> 3. **Install any missing dependencies — don't ask me to do it.** The skill needs `git`, `python3`, and the Python package `reportlab` (for generating review PDFs). Check each and install whatever's missing:
>    - **git** — `git --version`.
>      - Mac: `xcode-select --install` (also brings Python). A dialog pops up — tell me to click **Install** and accept the license, then wait (~5–10 minutes).
>      - Windows: `winget install --id Git.Git -e --source winget --accept-source-agreements --accept-package-agreements`. If UAC prompts, tell me to click **Yes**, then close and reopen the terminal so `PATH` refreshes.
>    - **Python** — try `python3 --version`, then `python --version`, then `py --version`. Pick the first that works.
>      - Mac: usually arrives with the xcode tools above. If still missing, re-run `xcode-select --install`.
>      - Windows: `winget install --id Python.Python.3.12 -e --source winget --accept-source-agreements --accept-package-agreements`. Accept UAC, reopen the terminal.
>    - **reportlab** — `<python> -c "import reportlab"`. If it errors, run `<python> -m pip install --user reportlab`.
>    - If any automated install fails: open <https://git-scm.com/downloads> or <https://www.python.org/downloads/> for me, walk me through the installer, and resume once the missing tool reports a version.
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
>    - Then tell me: "Paste your token on the `DIRECTUS_TOKEN_PRODUCTION=` line. No quotes, no spaces around the `=`. Save and close." (The file is pre-configured for production; nothing else to change.)
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

Claude will ask about your topic, propose an SEO plan, write the post, generate a review PDF, validate every link, and publish to Directus as **published** with today's date. When it's done it hands you the public blog URL.

Want a draft or a future publish date instead? Just tell Claude — e.g. *"keep it as a draft"* or *"set the publish date to next Tuesday"* — and it'll update Directus for you.

## When something changes

The skill auto-updates: every `/blog` run checks for new guidelines and offers to pull them. You don't have to do anything.

To force an update manually, paste this into Claude Code:

> Pull the latest from `~/zspace/blog-generation` (Mac/Linux) or `%USERPROFILE%\zspace\blog-generation` (Windows). Run `git pull --ff-only` there.

## Production only

Your `.env` is pre-configured for **production** — posts publish to the live blog at `blog.zspace.com` with today's date. There's no sandbox token to manage. JP runs sandbox separately when testing tone/style changes.

## Questions

JP Donnelly — jdonnelly@zspace.com.
