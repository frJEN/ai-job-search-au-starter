---
name: adzuna-search
version: 1.0.0
description: >
  Use this skill to search Australian job listings via Adzuna's official job
  search API. Adzuna is an independent job aggregator covering employer and
  recruiter feeds across Australia — a legitimate, key-based alternative
  source alongside Seek/Indeed/Jora's email alerts. Trigger phrases: find a
  job in Australia, job search Adelaide, Adzuna search, search jobs Australia,
  Australian job listings, adzuna.com.au.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/adzuna-search/cli/src/cli.ts *)
---

# Adzuna Search Skill

Search live Australian job listings via Adzuna's official Job Search API v1.
Requires a free API key (`ADZUNA_APP_ID` / `ADZUNA_APP_KEY`) — this is an
authenticated, ToS-compliant API, not scraping.

## Why Adzuna, and what it isn't

Seek, Indeed, and Jora all explicitly disallow automated access in
`robots.txt` (two of them name-block `anthropic-ai` specifically) — see
`.claude/skills/job-scraper/search-queries.md` for the full reasoning. Adzuna
is a **separate, independent aggregator** (its own employer/recruiter feeds
plus a newspaper-syndication network); it does not mirror Seek's, Indeed's,
or Jora's specific inventories. It adds broad, incremental Australian
coverage through a legitimate official API — it is not a substitute feed for
those three, which stay covered via their email job-alerts instead (see
`.claude/skills/job-scraper/gmail-alert-sources.md`).

## Setup

```bash
cd .agents/skills/adzuna-search/cli
bun install   # optional — only installs TypeScript dev types
export ADZUNA_APP_ID=<your app id>
export ADZUNA_APP_KEY=<your app key>
```

Sign up free at https://developer.adzuna.com/ — the account needs activating
via the emailed confirmation link before the dashboard shows real credentials.

## When to use this skill

- Search for Australian job openings by keyword and location
- Filter by recency, salary floor, employment type (full-time/permanent)
- Get the full description of a specific listing

## Commands

### Search job listings

```bash
bun run .agents/skills/adzuna-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (title, skill, role).
- `--location <text>` / `-l <text>` — place name or postcode, e.g. `"Adelaide"`, `"5000"`.
- `--jobage <days>` — only ads posted within N days.
- `--salary-min <n>` — minimum salary (AUD).
- `--full-time` — only full-time jobs.
- `--permanent` — only permanent jobs.
- `--exclude <text>` — keywords to exclude.
- `--page <n>` — page number (1-indexed).
- `--results-per-page <n>` — results per page (Adzuna's own default applies if omitted).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/adzuna-search/cli/src/cli.ts detail <adref> [--format json|plain]
```

`<adref>` is the `id` field from a `search` result (Adzuna's own `adref`
token — required for this lookup, not the plain numeric advert id, which is
returned separately as `adzuna_id` for reference/dedup only).

## Usage examples

```bash
# QA/QC roles in Adelaide, last 14 days
bun run .agents/skills/adzuna-search/cli/src/cli.ts search -q "quality assurance" -l "Adelaide" --jobage 14 --format table

# Research assistant roles, full-time only
bun run .agents/skills/adzuna-search/cli/src/cli.ts search -q "research assistant" -l "Adelaide" --full-time --format table

# Bioinformatics roles, Australia-wide
bun run .agents/skills/adzuna-search/cli/src/cli.ts search -q "bioinformatics" -l "Australia" --format table

# Widen with a salary floor
bun run .agents/skills/adzuna-search/cli/src/cli.ts search -q "laboratory technician" -l "Adelaide" --salary-min 55000 --format table

# Full details for a specific listing
bun run .agents/skills/adzuna-search/cli/src/cli.ts detail <adref> --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing `id` (adref) to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Country is hardcoded to `au`.
- `redirect_url` points to the advertiser's own page — Adzuna's ToS requires
  sending users there rather than any other link; keep it as-is.
- `full_description` on the `detail` command may still be absent for some
  ads (Adzuna's own docs say so) — the CLI falls back to the truncated
  `description` field automatically in that case.
- See `url-reference.md` for the full endpoint/parameter/response reference.
