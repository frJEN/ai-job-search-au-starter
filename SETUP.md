# Setup Guide

Step-by-step instructions for getting the AI Job Search framework running, including this fork's Australia-specific tooling. Written for whichever path you took to get the code: no-git ZIP download or a git fork.

## 1. Get the code

**No git, no GitHub account needed:** go to [github.com/frJEN/jobhunt-au-starter](https://github.com/frJEN/jobhunt-au-starter), click **Code → Download ZIP**, and unzip it wherever you keep projects.

**Comfortable with git?**

```bash
gh repo fork frJEN/jobhunt-au-starter --clone
cd jobhunt-au-starter
```

Or fork manually on GitHub, then clone your fork. Either way, `upstream` should point at `MadsLorentzen/ai-job-search` for pulling framework updates later (step 11) — `git remote add upstream https://github.com/MadsLorentzen/ai-job-search.git` if it isn't set already.

## 2. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

Or use the [native installer](https://docs.anthropic.com/en/docs/claude-code/getting-started) for your OS if you'd rather not install Node.js. You need a **Claude Pro/Max subscription** to run `claude` day-to-day — a separate Anthropic API key is only needed if you want to use the API directly, which this workflow doesn't require.

## 3. Install the rest — or ask Claude Code to do it

This framework needs Python (for the salary tool), Bun (for the job-search CLIs), a LaTeX distribution (to compile your CV/cover letter to PDF), and optionally `pdftotext` (for the ATS-parseability check). **You don't have to run any of this yourself** — open the folder in Claude Code (`cd jobhunt-au-starter && claude`) and say:

> "Please check whether Python, Bun, and a LaTeX distribution are installed, and install whatever's missing."

Claude Code will run the actual commands via its Bash tool and ask your permission before each one. The reference commands below are what it will run — useful if you want to do it yourself, or if something needs troubleshooting.

### Python

```bash
python3 --version
```

3.10+ is required. On Windows, `py --version` is often the more reliable check.

### Bun (for job search tools)

- macOS/Linux: `curl -fsSL https://bun.sh/install | bash`
- Windows PowerShell: `powershell -ExecutionPolicy Bypass -c "irm https://bun.sh/install.ps1 | iex"` (or `winget install Oven-sh.Bun`)

### LaTeX (for compiling CVs and cover letters)

- **Windows:** [MiKTeX](https://miktex.org/download)
- **macOS:** [MacTeX](https://tug.org/mactex/)
- **Linux:** `sudo apt install texlive-full` or `sudo dnf install texlive-scheme-full`

The CV compiles with `lualatex` (pdflatex often fails on modern MiKTeX installs with `fontawesome5` font-expansion errors). The cover letter compiles with `xelatex` because `cover.cls` requires `fontspec` for its custom Lato/Raleway fonts.

#### Minimal TeX install: TinyTeX/BasicTeX

Full TeX distributions work out of the box, but minimal distributions need a few extra packages before the stock templates compile.

On macOS, a user-level TinyTeX install avoids a system-wide installer and does not require `sudo`:

```bash
curl -fsSL https://yihui.org/tinytex/install-bin-unix.sh -o /tmp/tinytex-install-bin-unix.sh
sh /tmp/tinytex-install-bin-unix.sh /tmp --no-path
export PATH="$HOME/Library/TinyTeX/bin/universal-darwin:$PATH"
```

Then install the template dependencies:

```bash
tlmgr install \
  moderncv fontawesome5 fontawesome6 academicons import luatexbase pgf \
  titlesec textpos xltxtra xunicode cite realscripts needspace
```

For BasicTeX/MacTeX, make sure the TeX binary directory is on `PATH` first (for example via `/Library/TeX/texbin`), then run the same `tlmgr install ...` command.

Quick smoke tests after setup:

```bash
cd cv && lualatex -interaction=nonstopmode -halt-on-error main_example.tex && cd ..

SMOKE_DIR="$(mktemp -d /tmp/ai-job-cover-smoke.XXXXXX)"
cp -R cover_letters/cover.cls cover_letters/OpenFonts "$SMOKE_DIR/"
cat >"$SMOKE_DIR/cover_smoke.tex" <<'EOF'
\documentclass[]{cover}
\begin{document}
\namesection{Test}{Candidate}{test@example.com}
\companyname{Example Company}
\companyaddress{123 Hiring Street\\Example City}
\currentdate{\today}
\lettercontent{Dear Hiring Manager,}
\lettercontent{This smoke test verifies that xelatex can load cover.cls and the bundled fonts.}
\closing{Sincerely,}
\signature{Test Candidate}
\end{document}
EOF
(cd "$SMOKE_DIR" && xelatex -interaction=nonstopmode -halt-on-error cover_smoke.tex)
```

#### Windows: Basic MiKTeX

The full MiKTeX installer bundles every CTAN package and works out of the box, but the smaller [Basic MiKTeX](https://miktex.org/download) installer (`basic-miktex-*.exe`) only ships a minimal package set and needs a couple of one-time settings before the stock templates compile.

By default, MiKTeX installs missing packages on demand but pops up a GUI prompt for each one — which blocks non-interactive terminals (including Claude Code's Bash tool). Turn that into a silent auto-install instead:

```powershell
initexmf --admin --set-config-value=[MPM]AutoInstall=1
initexmf --set-config-value=[MPM]AutoInstall=1
```

(Run the first line from an elevated/Admin PowerShell if you installed MiKTeX for all users; the second line covers a per-user install. Only one will apply depending on how you installed it — running both is harmless.)

If you'd rather not rely on on-the-fly installs at all (for example, for a fully offline compile later), pre-install the same package set the macOS TinyTeX section above lists, using MiKTeX's package manager:

```powershell
mpm --admin --install=moderncv --install=fontawesome5 --install=fontawesome6 --install=academicons --install=import --install=luatexbase --install=pgf --install=titlesec --install=textpos --install=xltxtra --install=xunicode --install=cite --install=realscripts --install=needspace
```

Drop `--admin` if MiKTeX is installed for the current user only. If a package name doesn't resolve, `mpm --find=<name>` searches the repository for the correct name.

Quick smoke tests after setup (PowerShell):

```powershell
Set-Location cv; lualatex -interaction=nonstopmode -halt-on-error main_example.tex; Set-Location ..

$SmokeDir = New-Item -ItemType Directory -Path (Join-Path $env:TEMP "ai-job-cover-smoke-$(Get-Random)")
Copy-Item cover_letters\cover.cls, cover_letters\OpenFonts -Destination $SmokeDir -Recurse
@'
\documentclass[]{cover}
\begin{document}
\namesection{Test}{Candidate}{test@example.com}
\companyname{Example Company}
\companyaddress{123 Hiring Street\\Example City}
\currentdate{\today}
\lettercontent{Dear Hiring Manager,}
\lettercontent{This smoke test verifies that xelatex can load cover.cls and the bundled fonts.}
\closing{Sincerely,}
\signature{Test Candidate}
\end{document}
'@ | Set-Content (Join-Path $SmokeDir "cover_smoke.tex")
Push-Location $SmokeDir; xelatex -interaction=nonstopmode -halt-on-error cover_smoke.tex; Pop-Location
```

### Optional: pdftotext (for the ATS check)

`/apply` runs an ATS parseability check on the compiled CV, and also uses it to extract the cover letter body for the application packet (step 9). This uses `pdftotext` from [poppler](https://poppler.freedesktop.org/), which is not part of TeX distributions:

- **macOS:** `brew install poppler`
- **Debian/Ubuntu:** `sudo apt install poppler-utils`
- **Windows:** `choco install poppler`

If `pdftotext` is missing, `/apply` skips the mechanical check with a warning and falls back to a visual/LaTeX-source review instead — everything else works normally.

## 4. Install job search CLI dependencies

Run these from the repository root.

- PowerShell:

```powershell
$tools = @("adzuna-search", "linkedin-search", "freehire-search")
foreach ($tool in $tools) {
  Push-Location ".agents/skills/$tool/cli"
  bun install
  Pop-Location
}
```

- Bash / zsh / Git Bash:
```bash
for tool in adzuna-search linkedin-search freehire-search; do
  (cd .agents/skills/$tool/cli && bun install)
done
```

All three have zero runtime dependencies and run with plain `bun`; `bun install` only pulls TypeScript dev types, so this step is optional but recommended (it also lets you run each tool's test suite).

The Danish demo portals (Jobbank, Jobdanmark, Jobindex, Jobnet) ship as a reference for the `/add-portal` pattern — skip installing them unless you're specifically job-hunting in Denmark. If you need a job board this fork doesn't cover, run `/add-portal` inside Claude Code once you're set up.

## 5. Connect Gmail (for job-alert ingestion)

Seek, Indeed, and Jora block automated scraping, so `/scrape` reads the job-alert emails they already send to your inbox instead — this needs the Gmail connector, not a terminal command.

1. Go to [claude.ai](https://claude.ai) → **Settings → Connectors** and connect the Gmail account you use (or will use) for job-alert subscriptions.
2. Subscribe to job alerts on Seek, Indeed, Jora, and/or LinkedIn from that same address, if you haven't already.
3. Open `CLAUDE.md` and replace every `[YOUR_EMAIL]` placeholder in its "Account Restriction (Gmail)" section with that address. Also replace it in `.claude/commands/gmail-sync.md` and `.claude/skills/job-scraper/gmail-alert-sources.md` (same placeholder, three files).

This isn't optional boilerplate: every Gmail query this repo builds is hard-scoped to `deliveredto:<your address>`, so if the wrong Gmail account is ever connected, queries return nothing instead of silently reading someone else's inbox.

Gmail is the one built-in, fully automated path this repo ships — genuinely the easy option, one click in claude.ai's Connectors settings.

**Using Outlook instead?** Anthropic's official [Claude for Outlook](https://support.claude.com/en/articles/14855664-use-claude-for-outlook) add-in is invoked only inside Outlook's own ribbon UI and has no MCP/tool-call interface — it cannot power `/gmail-sync` or `/scrape`'s automation no matter whose account it's installed on. Its own documentation is oriented around a Microsoft 365 work/school account and IT-admin-consent deployment; check Microsoft AppSource for the current word on whether a personal outlook.com/hotmail/live account is supported at all. A real, Claude-Code-callable alternative exists as an **optional, advanced, self-directed path**: a self-hosted community MCP server (Azure App Registration required) — see step 5a below. It's real and powerful, the same relationship `/add-portal` has to the core workflow: entirely opt-in, more technical, and not required.

Whichever mailbox you use, **connect exactly one** — the single-mailbox restriction is what actually matters, not the provider.

### 5a. Advanced: Outlook via a self-hosted MCP server (optional, unverified)

This is **not required** and **not yet verified** by this repo against a real mailbox — treat it as a starting point, not a finished feature. Skip this section entirely unless you specifically want Outlook ingestion and are comfortable with an Azure Portal setup.

1. Read `.claude/commands/outlook-sync.md` first — it explains what this does, what it doesn't do yet, and links the reference MCP server implementation.
2. Set up a self-hosted Outlook MCP server (e.g. [`ryaker/outlook-mcp`](https://github.com/ryaker/outlook-mcp), a community project — not built or vetted by this repo's maintainers, review it yourself before trusting it with mailbox access):
   - Register an application in the [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**.
   - Add API permissions for `Mail.ReadWrite`, `Calendars.Read` (delegated).
   - Create a client secret and note its **value** (not the Secret ID) alongside the Application (client) ID and Tenant ID.
   - Follow that project's own install/config instructions to run the server and connect it to Claude Code as an MCP server.
3. Once connected, `outlook-sync.md`'s tool calls are **provisional** — the exact tool names/schemas depend on the MCP server you configured, and haven't been confirmed live. Expect to adjust them against what your server actually exposes.
4. This has not been wired into `/scrape`'s automated alert-ingestion step (Step 1d) - it's a separate, standalone command for now, kept apart from the proven Gmail path until it's actually verified working.

## 6. Get an Adzuna API key (optional)

[Adzuna](https://developer.adzuna.com/) is an independent job aggregator with a free, official search API — it adds Australian job coverage on top of the Gmail-alert channel and LinkedIn.

1. Register at [developer.adzuna.com](https://developer.adzuna.com/).
2. Confirm the activation email (check spam if it doesn't arrive within a few minutes).
3. Copy your `app_id` and `app_key` from the developer dashboard.
4. Export them before running `/scrape`:
   ```bash
   export ADZUNA_APP_ID="your-app-id"
   export ADZUNA_APP_KEY="your-app-key"
   ```
   Or add a `.env` file in the repo root (already covered by `.gitignore`) — **never commit the key itself**, only the instructions to obtain one.

If you skip this, `/scrape` still runs via LinkedIn and Gmail-alert ingestion — you just miss Adzuna's independent listings.

## 7. Run the setup interview

Start Claude Code in the repository:

```bash
claude
```

Then run the onboarding:

```
/setup
```

Claude will offer three paths:

- **Path A (documents folder):** Add your CV, LinkedIn export, diplomas, references, or past applications under `documents/`. Claude reads and cross-references them before proposing profile updates. Best when you have several source files.
- **Path B (single CV import):** Share one CV/resume by mentioning the file with `@` or pasting the text. Claude extracts it and asks follow-up questions for anything missing.
- **Path C (interview mode):** Answer structured interview questions section by section. **If you don't have documents ready yet, this is the easiest starting point** — Claude asks, you answer, and it builds the profile from there.

All three paths produce the same result: fully populated profile files.

### What gets populated

| File | Content |
|------|---------|
| `CLAUDE.md` | Your full candidate profile |
| `01-candidate-profile.md` | Structured education, experience, skills |
| `02-behavioral-profile.md` | Behavioral assessment |
| `04-job-evaluation.md` | Personalized skill match areas and career goals |
| `05-cv-templates.md` | Profile statement templates for your background |
| `07-interview-prep.md` | STAR examples from your experience |
| `cv/main_example.tex` | Your LaTeX CV with actual details |
| `search-queries.md` | Job search queries for `/scrape` |

### Re-running setup

You can update specific sections later:

```
/setup --section skills
/setup --section experience
/setup --section search
```

The `--section search` option is especially useful as your priorities evolve. It re-runs the search configuration interview and suggests role types you may not have considered based on your full profile.

## 8. Refine your platform profiles and set up alerts (optional but recommended)

`/platform-sync` uses [Claude in Chrome](https://claude.com/blog/claude-in-chrome) to refine your profile on LinkedIn/Seek/Indeed and set up job alerts on LinkedIn/Seek/Indeed/Jora/Fuse Recruitment/Synergie, all pointed at the email address from step 5. **Read `.claude/commands/platform-sync.md`'s caution notes before running it** — it's a materially different kind of automation than the read-only portal CLIs elsewhere in this repo (it signs into real accounts, under your own already-authenticated browser session, to make live changes), and it documents a fully manual alternative if you'd rather not use it.

Before running it:

1. **Install the Claude in Chrome extension** if you haven't already, and sign into each target platform (LinkedIn, Seek, Indeed, Jora, Fuse Recruitment, Synergie) yourself, in that same browser — using the email address from step 5 on every account. `/platform-sync` never enters a password or performs sign-in itself.
2. **Grant the extension's site permission** for each platform's domain — this is a per-site permission you approve in the extension's own settings, not a "tab group" (a tab group is just a Chrome organizational label; it doesn't control what Claude can access).

Then run:

```
/platform-sync
```

It shows you every proposed profile edit and every alert before submitting anything — nothing is written without your explicit confirmation per platform.

## 9. Test the full workflow

Find a job posting you're interested in, then:

```
/scrape
```

or go straight to a specific posting:

```
/apply https://seek.com.au/job/12345678
```

Or paste the job description directly:

```
/apply [paste job posting text here]
```

Claude will:
1. Evaluate the fit against your profile
2. Ask if you want to proceed
3. Draft a tailored CV and cover letter
4. Have a reviewer agent critique the drafts
5. Revise, compile both to PDF, and inspect the layout
6. Generate `documents/applications/<company>_<role>/application_packet.md` — hand this to the [Claude in Chrome](https://claude.com/blog/claude-in-chrome) extension, or use it for manual form-filling. Either way, review the completed form yourself before submitting — this workflow never submits on your behalf.

## 10. Optional: set up salary benchmarking

If you have salary data (from a union, salary survey, Glassdoor, or personal research):

1. **Option A:** Create `salary_data.json` manually in the repo root (see `tools/README_SALARY_TOOL.md` for the format)
2. **Option B:** Convert from Excel:
   ```bash
   pip install openpyxl
   python3 tools/convert_salary_excel.py path/to/salary-data.xlsx --source "My Salary Data 2025"
   ```

This creates `salary_data.json` which the `/apply` workflow uses for salary benchmarking. If you skip this step, salary lookup is simply omitted — the salary-floor check against Australia's minimum-wage/award standard still runs regardless (see `04-job-evaluation.md`).

## 11. Pulling upstream updates into your fork

Upstream (`MadsLorentzen/ai-job-search`) keeps improving the methodology files your fork has personalized, so plan for updates from day one:

**Prefer releases over raw `master`.** Tagged [releases](https://github.com/MadsLorentzen/ai-job-search/releases) are vetted checkpoints, each described in that project's `CHANGELOG.md`. Fetch tags with `git fetch upstream --tags` and merge a release (for example `git merge v1.0.0`) when you want stability; pull `master` directly only when you specifically want the latest unreleased changes.

1. **Commit your personalization to your fork.** `/setup` edits `CLAUDE.md` and the profile skill files in place — those edits are *yours*, and your fork is your own working space, so commit them. The genuinely sensitive files (tracker, salary data, `documents/`, application archives) are gitignored and never enter git either way.
2. **Preview what changed before pulling:**
   ```bash
   git fetch upstream
   python3 tools/check_upstream_updates.py
   ```
   It compares the `framework_version` markers in your framework files against upstream and lists exactly which methodology files changed.
3. **Merge normally.** `git merge upstream/master` (or `git pull`) three-way-merges upstream's edits around your personalization; because methodology edits rarely touch the lines `/setup` filled in, most updates land cleanly. A conflict in a personalized file is a *feature*, not a failure — it means upstream changed methodology in a section you customized. Resolve by keeping your data and adopting the methodology change around it. This fork's own Australia-specific files (`scrape.md`, `gmail-alert-sources.md`, `adzuna-search/`) aren't in upstream, so they never conflict — pull updates the same way regardless.

## Troubleshooting

### "salary_data.json not found"
Expected if you haven't set up salary benchmarking (step 10). The `/apply` workflow skips this step automatically.

### Job search CLI tools not working
Make sure Bun is installed and you ran `bun install` in each CLI directory. The tools require network access to fetch job listings.

### `/scrape`'s Gmail step finds nothing
Check claude.ai → Settings → Connectors — confirm the connected Gmail account matches the address you put in place of `[YOUR_EMAIL]`, and that you're actually subscribed to job alerts from Seek/Indeed/Jora/LinkedIn/Fuse/Synergie on that address. Never loosen the `deliveredto:` clause to "get more results" — a wrong-account connection should return nothing, not something.

### Adzuna search returns an auth error
`ADZUNA_APP_ID`/`ADZUNA_APP_KEY` aren't set, or the account hasn't confirmed its activation email yet. Check your inbox for the Adzuna confirmation email if you registered recently.

### LaTeX compilation errors
- CV: uses `lualatex` (pdflatex often fails on modern MiKTeX with `fontawesome5` font-expansion errors; lualatex handles the same sources cleanly)
- Cover letter: uses `xelatex` (for custom fonts in `OpenFonts/fonts/`)
- Make sure your LaTeX distribution includes the `moderncv` package

### Fonts not found in cover letter
The cover letter template expects fonts in `cover_letters/OpenFonts/fonts/`. Make sure this directory exists and contains the Lato and Raleway font files.
