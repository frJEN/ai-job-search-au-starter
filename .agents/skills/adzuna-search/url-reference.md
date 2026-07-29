# Adzuna API — Endpoint Reference

<!-- SETUP: confirmed live on 2026-07-28 against the real Swagger 1.2 spec at
https://api.adzuna.com/v1/api-docs/adzuna (the JS-rendered /activedocs page
doesn't expose this in a WebFetch-readable form — hit the JSON spec directly
if this ever needs re-verifying). An unauthenticated probe against the search
endpoint (app_id=test&app_key=test) also confirmed the URL pattern responds
with a structured `AUTH_FAIL` JSON error rather than a 404, proving the route
itself before any real credentials existed. -->

## Base

```
https://api.adzuna.com/v1/api
```

Every request requires `app_id` and `app_key` query params (sign up free at
https://developer.adzuna.com/ — account must be activated via the emailed
link before the dashboard shows real credentials).

## Search

```
GET /jobs/au/search/{page}
```

`{page}` is a required 1-indexed path segment (not a query param).

| Param | Required | Notes |
|---|---|---|
| `app_id`, `app_key` | Yes | Credentials |
| `what` | No | Keywords, space/comma-separated |
| `what_and` | No | Keywords, all must match |
| `what_phrase` | No | Exact phrase in title/description |
| `what_exclude` | No | Keywords to exclude |
| `title_only` | No | Keywords, title only |
| `where` | No | Place name or postcode — geographic centre of the search |
| `distance` | No | km from `where`; Adzuna defaults to 10km |
| `max_days_old` | No | Oldest ad age in days |
| `category` | No | Category tag (see the `categories` endpoint) |
| `sort_by`, `sort_direction` | No | Result ordering |
| `salary_min`, `salary_max` | No | AUD |
| `salary_include_unknown` | No | `"1"` to include unknown-salary ads when filtering by salary |
| `full_time`, `part_time`, `contract`, `permanent` | No | `"1"` to filter |
| `results_per_page` | No | Page size |

### Response (`Adzuna::API::Response::JobSearchResults`)

```json
{
  "results": [ /* Job objects, see below */ ],
  "count": 1234,
  "mean": 78500.5
}
```

### Job object

| Field | Notes |
|---|---|
| `id` | Adzuna's own advert id (string) |
| `adref` | Opaque token — **this is what the `ad` endpoint needs**, not `id` |
| `title` | |
| `description` | Truncated to 500 chars |
| `full_description` | Full text — "may not be present" per Adzuna's own docs |
| `company.display_name` | |
| `location.display_name`, `location.area[]` | `area` is most-general → most-specific |
| `category.label`, `category.tag` | |
| `created` | ISO 8601 |
| `redirect_url` | The advertiser's own page — required by Adzuna's ToS to be the link a user is sent to |
| `salary_min`, `salary_max` | AUD, may be predicted (`salary_is_predicted`) |
| `contract_type` | `"permanent"` \| `"contract"` \| `null` |
| `contract_time` | `"full_time"` \| `"part_time"` \| `null` |

## Single-ad detail

```
GET /jobs/au/ad/{adref}
```

Takes the `adref` field from a search result (path segment, URL-encode it).
Returns a single `Adzuna::API::Response::Ad` object — same shape as a search
result's Job object. `full_description` is preferred when present; it can
still be absent, in which case fall back to the truncated `description`.

## Errors

Non-2xx responses return a JSON body:

```json
{"doc":"https://api.adzuna.com/v1/doc","display":"Authorisation failed","exception":"AUTH_FAIL","__CLASS__":"Adzuna::API::Response::Exception"}
```

Surface the `display` field as the error message — it's Adzuna's own
human-readable explanation (confirmed live for `AUTH_FAIL` on bad/placeholder
credentials).

## Notes

- This is an official, authenticated API — not scraping. No robots.txt or
  ToS concern like Seek/Indeed/Jora (see `search-queries.md`).
- Country is hardcoded to `au` in this skill (hardcoded to the Australian
  job market for this template). The API supports other ISO country codes
  if this skill is ever generalized.
- Adzuna is an independent aggregator (its own employer/recruiter feeds plus
  a newspaper-syndication network) — it does **not** mirror Seek's, Indeed's,
  or Jora's specific inventories, so it adds broad incremental AU coverage
  rather than substituting for those platforms.
