# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are vetted checkpoints of `master`. If you maintain a personalized fork,
prefer updating to a tagged release over pulling raw `master` (see
[SETUP.md, section 11](SETUP.md#11-pulling-upstream-updates-into-your-fork)). The
`framework_version` markers on methodology files tell you which of your customized
files a release touched; `python3 tools/check_upstream_updates.py` lists them with
per-file diff commands.

## Fork-Specific Changes

Changes specific to this fork (`frJEN/ai-job-search-au-starter`), tracked separately from
the sections below since they're not part of upstream's release versioning.

- **Security policy repointed at this fork** - vulnerability reports and `FUNDING.yml`
  now point at this repo instead of upstream.
- **LICENSE** - credits AU-specific contributions alongside the original copyright.
- **Removed `CONTRIBUTING.md`** - it described upstream's contribution process, not this
  fork's.
- **CI** - `adzuna-search` added to the CLI test matrix; `dependency-review` no longer
  gated to the upstream repo name, so it runs on this fork too.
- **`salary_lookup.py`: Australian legal suffixes** - `STRIP_PATTERNS` now strips
  `Pty Ltd`/`Pty`/`Ltd`/`Limited` and an `Australia` noise-word, alongside the existing
  Danish/Nordic ones, so AU company names fuzzy-match correctly. This powers the optional
  Salary Benchmark check only.
- **Salary Floor check wired into presentation** - the always-on salary-floor flag
  (posting rate vs. minimum-wage/award standard) now actually surfaces in both `/apply`'s
  evaluation output and `/rank`'s triage shortlist - previously computed but dropped
  before either command's output.
- **`/platform-sync`: duplicate-alert guard** - skips creating a job alert that already
  exists for the same platform, role, location, and target email.
- **`/gmail-sync`: first-run security notice** - explains the read-only, untrusted-content
  scope of inbox scanning before the first run, and recommends a `CLAUDE.md` restriction
  for handing off sensitive, unrelated content unprocessed.
- **Docs consistency** - Gmail platform count, donate link, and Outlook framing corrected
  across `README.md`, `README.beginner.md`, and `README.zh.md`.

## [Unreleased]

- **freehire-search: full descriptions come back with the search** - `search` now calls
  freehire's agent search endpoint (`/api/v1/agent/jobs/search`), which serves each hit's
  complete description instead of the search index's truncated preview. A 20-role search is
  one request rather than 1 + 20 `detail` calls, and `/scrape`'s Step 2 no longer needs a
  per-hit fetch for this portal. `--description-format markdown|text|html` (default
  `markdown`) selects the rendering; `table` and `plain` output is unchanged.

- **Custom templates: any compile-to-PDF toolchain (Typst, ...)** - `/add-template` no longer
  hardcodes a `lualatex`/`xelatex`/`pdflatex` engine enum. Custom templates now declare a
  source extension and a full compile command, so Typst (`typst compile`) registers the same
  way a custom LaTeX template does. Stock CV/cover letter templates stay LaTeX, unchanged.

## [1.0.0] - 2026-07-22

First tagged release. This marks the framework as stable and gives forks a described
checkpoint to update against instead of a moving `master`. It is a baseline of what
already exists rather than a set of new changes; subsequent releases will document
what changed since the previous tag.

At this baseline the framework provides:

- **Application workflow** - a drafter/reviewer `/apply` pipeline (CV + cover letter),
  plus `/setup`, `/scrape`, `/rank`, `/interview`, `/outcome`, `/upskill`,
  `/expand`, `/html-report`, `/gmail-sync`, `/notion-sync`, `/add-portal`,
  `/add-template`, and `/reset`.
- **Portal search skills** - country-agnostic job-board CLIs (LinkedIn, freehire, and
  the Danish boards) in the portable Agent Skills format under `.agents/skills/`,
  discovered and orchestrated by `/scrape`, with an `enabled:` toggle for skipping
  portals.
- **Framework versioning** - `framework_version` markers on methodology files plus
  `tools/check_framework_version.py` (CI guard) and `tools/check_upstream_updates.py`
  (fork-side update preview).
- **Privacy and safety guards** - `.gitignore` protection for personal data, the
  `tools/security_guards.py` allowlist for `.gitignore` negations, and a CI policy of
  making no live portal requests.
- **Cross-runtime support** - a root `AGENTS.md` pointer so Codex and Antigravity can
  discover the portable portal skills, with Claude Code as the reference runtime.

[Unreleased]: https://github.com/frJEN/ai-job-search-au-starter/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/frJEN/ai-job-search-au-starter/releases/tag/v1.0.0
