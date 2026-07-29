# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

- **`adzuna-search`**: official, key-based Adzuna Job Search API (Australia). Requires `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` exported (see `SETUP.md`). An independent aggregator, not a Seek/Indeed/Jora mirror — adds broad incremental Australian coverage.

**No Seek/Indeed/Jora CLI is installed, on purpose.** Live `robots.txt` checks on these Australian job boards name-block or blanket-disallow automated crawlers (several name the `anthropic-ai` user-agent specifically). Building scrapers against that would go against their stated policy, so none were built. Fuse Recruitment and Synergie are recruitment agencies with no public search API or CLI-friendly listing page at all. All five are covered two ways instead — both fully compliant, zero ToS risk:

1. **Gmail job-alert ingestion** (`/scrape` Step 1d) — reads the alert emails these platforms already send to your own inbox once you subscribe to job alerts on their site (`/platform-sync` can set this subscription up for you). See `gmail-alert-sources.md` for the confirmed sender patterns and parsing anchors per platform — add a platform there only once you've actually received a real alert from it; nothing is guessed.
2. **Discovery** via the `site:` WebSearch queries below (WebSearch queries a search engine's index, not the site directly — outside its robots.txt entirely).

The `site:` query templates in this file are the **WebSearch fallback** — for Seek/Indeed/Jora/Fuse/Synergie, any other portal without a CLI, company career pages, or when a CLI fails.

## Search Sites

Primary (Australia-wide job boards):
- **seek.com.au** — Australia's largest general job board (WebSearch fallback + Gmail alert ingestion, see note above)
- **linkedin.com/jobs** — filter: Australia / [YOUR_CITY]; also covered by the `linkedin-search` CLI directly, plus Gmail alert ingestion as a second channel
- **au.indeed.com** — general job board (WebSearch fallback + Gmail alert ingestion, see note above)
- **au.jora.com** — general job board (WebSearch fallback + Gmail alert ingestion, see note above)
- **adzuna.com.au** — general job board with an official search API, wired up as the `adzuna-search` CLI
- **[YOUR_INDUSTRY_JOB_BOARD]** - a niche/industry board for your field (optional, scaffold with `/add-portal`)

Recruitment agencies (candidate-registration model, not a general job board):
- **fuserecruitment.com** — Fuse Recruitment (Gmail alert ingestion only, once subscribed)
- **synergieaustralia.com.au** — Synergie (Gmail alert ingestion only, once subscribed)

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for known target companies

## Query Categories

Queries are grouped by priority. Each query should be combined with your location terms (e.g. your city, region, or metro area) where the site supports it.

### Priority 1: [YOUR_PRIMARY_ROLE_TYPE]

These match your strongest and most desired career direction.

```
site:[YOUR_JOB_BOARD] "[YOUR_PRIMARY_JOB_TITLE]" [YOUR_CITY]
site:[YOUR_JOB_BOARD] "[YOUR_KEY_SKILL]" [YOUR_CITY]
site:linkedin.com/jobs "[YOUR_PRIMARY_JOB_TITLE]" [YOUR_COUNTRY]
```

### Priority 2: [YOUR_DOMAIN_EXPERTISE]

These match your domain expertise.

```
site:[YOUR_JOB_BOARD] [YOUR_DOMAIN_KEYWORD_1] [YOUR_CITY] OR [YOUR_REGION]
site:[YOUR_JOB_BOARD] [YOUR_DOMAIN_KEYWORD_2] [YOUR_COUNTRY]
site:linkedin.com/jobs [YOUR_DOMAIN_KEYWORD_1] [YOUR_CITY] [YOUR_COUNTRY]
```

### Priority 3: [YOUR_ADJACENT_ROLE_TYPE]

Adjacent roles you could pivot into.

```
site:[YOUR_JOB_BOARD] "[YOUR_ADJACENT_TITLE_1]" [YOUR_KEY_SKILL] [YOUR_CITY]
site:[YOUR_JOB_BOARD] "[YOUR_ADJACENT_TITLE_2]" [YOUR_KEY_SKILL] [YOUR_CITY]
```

### Priority 4: Broader Technical / Consulting

Wider net for general technical roles.

```
site:[YOUR_JOB_BOARD] [YOUR_KEY_SKILL] developer [YOUR_CITY]
site:linkedin.com/jobs "[YOUR_KEY_SKILL] developer" [YOUR_CITY]
site:[YOUR_JOB_BOARD] "technical consultant" [YOUR_DOMAIN] [YOUR_CITY]
```

## Location Filter

When evaluating results, verify the job location is within reasonable commute distance from your home. Define acceptable areas:
- [YOUR_CITY] and surrounding areas
- [ACCEPTABLE_AREA_1]
- [ACCEPTABLE_AREA_2]
- [BORDERLINE_AREA] (borderline - ~X min by transit)
- [TOO_FAR_AREA] (too far)

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
