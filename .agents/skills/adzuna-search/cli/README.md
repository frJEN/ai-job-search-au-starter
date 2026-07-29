# adzuna-cli

CLI for searching **Australian** jobs via Adzuna's official job search API — a
legitimate, key-based data source, not scraping.

**Data source**: Adzuna Job Search API v1, `GET /v1/api/jobs/au/search/{page}` and `GET /v1/api/jobs/au/ad/{adref}`.
**Authentication**: Required — `ADZUNA_APP_ID` and `ADZUNA_APP_KEY` env vars (free sign-up at https://developer.adzuna.com/).
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

## Installation

```bash
cd .agents/skills/adzuna-search/cli
bun install   # optional — only installs TypeScript dev types
export ADZUNA_APP_ID=<your app id>
export ADZUNA_APP_KEY=<your app key>
```

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search Australian job listings |
| `detail` | Fetch full detail for one listing, by its `id` (Adzuna's `adref` token) from a search result |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# QA/QC roles in Adelaide, last 14 days
bun run src/cli.ts search -q "quality assurance" -l "Adelaide" --jobage 14 --format table

# Research assistant roles, full-time only
bun run src/cli.ts search -q "research assistant" -l "Adelaide" --full-time --format table

# Full detail for one job
bun run src/cli.ts detail <adref> --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). |
| `--location` | `-l` | Place name or postcode, e.g. `"Adelaide"`, `"5000"`. |
| `--jobage` | | Only ads posted within N days. |
| `--page` | | 1-indexed page. |
| `--results-per-page` | | Results per page. |
| `--salary-min` | | Minimum salary (AUD). |
| `--full-time` | | Only full-time jobs. |
| `--permanent` | | Only permanent jobs. |
| `--exclude` | | Keywords to exclude. |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |
