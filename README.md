<p align="center">
  <img src="assets/mascot/pip_flight_loop.gif" alt="Pip, the courier bird" width="200">
</p>

# AI Job Search — Australia Starter

*The job search that runs on your machine, tuned for the Australian market.*

**Read this in:** English (this page) · [Plain-English beginner guide](README.beginner.md) · [中文](README.zh.md)

> If this project is useful to you, a ⭐ star on GitHub helps others find it — and if you'd like to support development directly, that's always appreciated too: [Buy Me a Coffee](https://buymeacoffee.com/frJEN) · [爱发电 Afdian](https://afdian.com/a/frJEN). Totally optional either way — enjoy the tool.

An AI-powered job application framework built on [Claude Code](https://claude.com/claude-code). Fill in your profile, and let Claude evaluate job postings, tailor your CV, write cover letters, and prepare you for interviews — with Australia-specific job discovery built in.

> Note: This is an independent open-source project and is not affiliated with, endorsed by, sponsored by, or maintained by Anthropic. Anthropic and Claude Code are referenced only to describe the toolchain this workflow uses.
>
> This project has **no affiliated cryptocurrency, token, or paid sponsorship program**. Anything claiming otherwise is unauthorized and should be treated as a scam.

## What this is

This is a fork of [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) — a structured workflow that turns Claude Code into a full-stack job application assistant (self-profiling, fit evaluation, and a drafter-reviewer CV/cover-letter pipeline). The core workflow is language- and country-agnostic.

**This fork adds Australia-specific job discovery on top of that core:**
- **`adzuna-search`** — an official, key-based CLI against the [Adzuna](https://developer.adzuna.com/) Job Search API for independent Australian job coverage.
- **Gmail job-alert ingestion** — Seek, Indeed, Jora, Fuse Recruitment, and Synergie block or don't offer automated scraping, so instead `/scrape` reads the job-alert emails these platforms already send to your own inbox, via the official Gmail connector. Hard-scoped to the one mailbox you connect — see `CLAUDE.md`'s Account Restriction section.
- **`/platform-sync`** — refines your profile on each of those platforms and sets up the job alerts above for you, via the [Claude in Chrome](https://claude.com/blog/claude-in-chrome) extension acting in your own signed-in browser session. Read its caution notes before using — see [Quick start](#quick-start-no-git-no-github-account-needed) step 8.
- **Application packets** — `/apply` now also generates a bundled `application_packet.md` (contact fields, screening-question answers, document paths, cover letter text) so Claude in Chrome — or you, manually — can fill out the actual application form without re-typing everything. Final submission is always a human action, never automated.

```
/setup       /platform-sync      /scrape              /apply <url>
  |                |                |                     |
  v                v                v                     v
Fill in        Refine profile   Search job           Evaluate fit
your profile   on each platform portals              Score & recommend
  |            + set up alerts      |                     |
  v                v                v                     v
Profile        Alerts flowing   Present matches      Draft CV + Cover Letter
files ready    to your inbox    with fit ratings     (LaTeX, tailored)
                                    |                     |
                                    v                     v
                               Pick a match         Reviewer agent critiques
                               -> /apply            -> Revise -> Package -> Final output
```

## Quick start (no git, no GitHub account needed)

### 1. Get the code

Go to [github.com/frJEN/jobhunt-au-starter](https://github.com/frJEN/jobhunt-au-starter), click the green **Code** button, choose **Download ZIP**, and unzip it somewhere on your computer. That's it — no `git clone`, no GitHub account.

*(Comfortable with git? `gh repo fork frJEN/jobhunt-au-starter --clone` or the ordinary GitHub fork-and-clone works too — see [SETUP.md](SETUP.md) for the git path.)*

### 2. Install Claude Code

Follow the [Claude Code install guide](https://docs.anthropic.com/en/docs/claude-code/getting-started) — either the native installer for your OS, or (if you already have Node.js) `npm install -g @anthropic-ai/claude-code`. You need a **Claude subscription** (Pro or Max) to just run `claude` day-to-day — you do **not** need a separate Anthropic API key.

### 3. Open the folder in Claude Code

```bash
cd path/to/jobhunt-au-starter
claude
```

### 4. Let Claude Code install the rest

The job-search tools need [Bun](https://bun.sh) and a LaTeX distribution (for compiling your CV/cover letter to PDF); the ATS-parseability check optionally uses `pdftotext`. You don't need to install these yourself — just tell Claude Code:

> "Please check whether Bun and a LaTeX distribution are installed, and install whatever's missing."

Claude Code will run the actual install commands via its Bash tool, asking your permission before each one. See [SETUP.md](SETUP.md) if you'd rather run the commands yourself.

### 5. Connect Gmail (for job-alert ingestion)

At [claude.ai](https://claude.ai) → **Settings → Connectors**, connect your Gmail account — the one you use (or will use) to subscribe to job alerts from Seek, Indeed, Jora, and LinkedIn. Then open `CLAUDE.md` and replace every `[YOUR_EMAIL]` placeholder with that same address (it also appears in `.claude/commands/gmail-sync.md` and `.claude/skills/job-scraper/gmail-alert-sources.md`). This is a safety gate, not a formality: every Gmail query this repo builds is hard-scoped to that one address, so a misconfigured connector returns nothing instead of silently reading the wrong inbox.

Gmail is the one built-in, fully automated path — genuinely the easy option. Using Outlook instead? See `CLAUDE.md`'s Account Restriction section for why Anthropic's official Claude for Outlook add-in can't power this repo's automation, and [SETUP.md](SETUP.md)'s advanced Outlook section for the self-directed alternative (`.claude/commands/outlook-sync.md`, currently an unverified draft). Whichever mailbox you use, keep it to one.

### 6. Get an Adzuna API key (optional, for extra job coverage)

Register at [developer.adzuna.com](https://developer.adzuna.com/), confirm the activation email, and grab your `app_id`/`app_key` from the dashboard. Export them before running `/scrape`:

```bash
export ADZUNA_APP_ID="your-app-id"
export ADZUNA_APP_KEY="your-app-key"
```

Or put them in a `.env` file in the repo root (already gitignored — **never commit the key itself**, only instructions to obtain one). If you skip this step, `/scrape` still works via the other portals; you just miss Adzuna's independent listings.

### 7. Set up your profile

```
/setup
```

`/setup` offers three paths — reading a `documents/` folder you've populated (CV PDF, LinkedIn export, diplomas, references), importing a single pasted CV, or a guided interview. **If this is your first time and you don't have documents ready, Path C (interview mode) is the easiest** — Claude asks you questions section by section and builds your profile from your answers.

### 8. Refine your platform profiles and set up alerts (optional but recommended)

```
/platform-sync
```

`/platform-sync` uses Claude in Chrome, acting in your own signed-in browser session, to refine your profile on LinkedIn/Seek/Indeed and set up job alerts on LinkedIn/Seek/Indeed/Jora/Fuse Recruitment/Synergie — all pointed at the email address from step 5, so `/scrape`'s Gmail step has more to read from the start. **Read its caution notes before running it** — it automates sign-in-adjacent actions on real accounts, which is a materially different (and higher-trust) thing than the read-only portal CLIs. It also documents a fully manual, by-hand alternative if you'd rather not use the automated path at all.

### 9. Search for jobs and apply

```
/scrape
/apply <url or pasted job posting text>
```

`/scrape` searches every connected portal (Adzuna, LinkedIn, plus Gmail alert ingestion for Seek/Indeed/Jora/Fuse/Synergie), dedupes, and presents matches sorted by fit. `/apply` evaluates fit, drafts a tailored CV and cover letter, has a second Claude agent review them, revises, compiles both to PDF, and generates the application packet described above.

Postings are treated as untrusted input (the workflow follows no instructions embedded in them and fetches no links from their body), but agentic defenses are instruction-level, not a sandbox — skim what was fetched and written before you hit send. Details in [SECURITY.md](SECURITY.md).

## Other commands

`/setup`, `/scrape`, and `/apply` form the core workflow. More commands extend it once your profile is in place:

- **`/platform-sync`** refines your profile on LinkedIn/Seek/Indeed and sets up job alerts across LinkedIn/Seek/Indeed/Jora/Fuse Recruitment/Synergie via Claude in Chrome — read its caution notes first; it also documents a manual alternative.
- **`/interview`** preps you for a scheduled interview on a tracked application, using the exact posting, CV, and cover letter the interviewer read.
- **`/outcome`** records what happened to an application, archives the submitted documents, and updates the tracker. It also surfaces stale applications and drafts follow-up notes (draft-only, never auto-sends).
- **`/gmail-sync`** reads your Gmail for status signals on open applications (interview invites, offers, rejections) and proposes tracker updates for you to approve — same account-restriction gate as `/scrape`'s alert ingestion.
- **`/notion-sync`** publishes a one-way, read-only pipeline view into Notion.
- **`/rank`** batch-scores newly scraped postings into a ranked shortlist before you pick one to `/apply` to.
- **`/expand`** enriches your profile from public sources you've linked (GitHub, portfolio, Scholar).
- **`/upskill`** analyzes the gap between your profile and tracked postings, with a prioritized learning plan.
- **`/html-report`** generates an offline HTML dashboard from your application tracker.
- **`/add-template`** registers your own CV/cover-letter template in place of the stock ones.
- **`/add-portal`** generates a search skill for a job board this fork doesn't already cover.
- **`/reset`** wipes profile data or the documents folder, with a confirmation step.

## File structure

```
jobhunt-au-starter/
├── CLAUDE.md                          # Main candidate profile + workflow rules (incl. Gmail account restriction)
├── .claude/
│   ├── commands/
│   │   ├── apply.md                   # /apply workflow (drafter-reviewer + application packet)
│   │   ├── scrape.md                  # /scrape job discovery (portals + Adzuna + Gmail alerts)
│   │   ├── setup.md                   # /setup onboarding
│   │   ├── platform-sync.md           # /platform-sync refine profile + set up alerts via Claude in Chrome
│   │   ├── gmail-sync.md              # /gmail-sync auto-detect application status from Gmail
│   │   └── ...                        # expand, add-template, add-portal, rank, outcome, interview, html-report, notion-sync, reset
│   ├── skills/
│   │   ├── job-application-assistant/  # Core application skill (candidate profile, evaluation, CV/cover-letter templates)
│   │   ├── job-scraper/               # Job search orchestration
│   │   │   └── gmail-alert-sources.md # Confirmed sender/parsing patterns for Seek/Indeed/Jora/LinkedIn/Fuse/Synergie alert emails
│   │   └── upskill/                   # /upskill skill gap analysis
│   └── settings.json                  # Claude Code permissions (shared, scoped)
├── .agents/skills/                    # Job portal CLI tools
│   ├── adzuna-search/                 # Adzuna Job Search API (Australia) — this fork's addition
│   ├── linkedin-search/               # LinkedIn public job listings (country-agnostic)
│   ├── freehire-search/               # freehire.me tech job aggregator (multi-market)
│   └── ...                            # Danish demo portals (jobbank, jobdanmark, jobindex, jobnet) — reference only
├── cv/, cover_letters/                # LaTeX templates + your generated documents
├── templates/                         # Custom templates registered via /add-template
├── documents/                         # Career source materials for /setup and /expand
│   └── applications/<company>_<role>/ # job_posting.md, cover_letter.tex, cv_draft.tex, application_packet.md, outcome.md
├── salary_lookup.py, tools/           # Salary benchmarking + CI/lint tooling
├── job_scraper/, gmail_sync/          # Scraper + Gmail-sync state (gitignored)
├── job_search_tracker.csv             # Application tracking spreadsheet (gitignored)
└── SETUP.md                           # Detailed setup guide
```

## Customization

If you prefer editing files directly instead of using `/setup`:

| File | What to change |
|------|---------------|
| `CLAUDE.md` | Your full profile (name, education, experience, skills, goals) and `[YOUR_EMAIL]` for Gmail |
| `01-candidate-profile.md` | Structured version of your CV data |
| `04-job-evaluation.md` | Skill match areas, career goals, motivation filters |
| `05-cv-templates.md` | Profile statement templates for different role types |
| `07-interview-prep.md` | Your STAR examples from actual experience |
| `search-queries.md` | Job search queries for your skills and location |

Custom CV/cover-letter template? Run `/add-template`. Job board this fork doesn't cover yet? Run `/add-portal`. Details in [SETUP.md](SETUP.md).

### Staying up to date

This fork tracks [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) as `upstream`. `python3 tools/check_upstream_updates.py` previews which of your personalized files an update touches before you merge. See [SETUP.md](SETUP.md) for the full walkthrough.

## Credits

- Australia-market adaptation (Adzuna integration, Gmail job-alert ingestion, application-packet handoff) maintained by [@frJEN](https://github.com/frJEN).
- Forked from [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) — the original framework, its full origin story, and the core drafter-reviewer workflow this fork builds on.
- [Mikkel Krogholm](https://github.com/mikkelkrogsholm) ([skills repo](https://github.com/mikkelkrogsholm/skills)) for the original job search CLI skill pattern.
- Built with [Claude Code](https://claude.com/claude-code) by [Anthropic](https://anthropic.com).

## License

MIT
