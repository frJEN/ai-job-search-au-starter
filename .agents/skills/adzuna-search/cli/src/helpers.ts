// Data source: Adzuna's official Job Search API (v1) for Australia
// (https://api.adzuna.com/v1/api/jobs/au/search/{page}), confirmed live
// against the real Swagger 1.2 spec at
// https://api.adzuna.com/v1/api-docs/adzuna on 2026-07-28. This is an
// authenticated, ToS-compliant official API — not scraping — unlike
// Seek/Indeed/Jora, which explicitly disallow automated access (see
// search-queries.md). Reads require ADZUNA_APP_ID and ADZUNA_APP_KEY.

const BASE_URL = "https://api.adzuna.com/v1/api"
const COUNTRY = "au"
const UA = "adzuna-search-skill/1.0"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

/** ADZUNA_APP_ID / ADZUNA_APP_KEY from the environment, or null if either is unset. */
export function credentials(): { appId: string; appKey: string } | null {
  const appId = (process.env.ADZUNA_APP_ID ?? "").trim()
  const appKey = (process.env.ADZUNA_APP_KEY ?? "").trim()
  if (!appId || !appKey) return null
  return { appId, appKey }
}

export interface AdzunaCompany {
  display_name?: string
}
export interface AdzunaLocation {
  display_name?: string
  area?: string[]
}
export interface AdzunaCategory {
  label?: string
  tag?: string
}

/** The wire shape of a single job from Adzuna's search/ad endpoints. */
export interface AdzunaJob {
  id: string
  adref: string
  title: string
  description?: string
  full_description?: string
  company?: AdzunaCompany
  location?: AdzunaLocation
  category?: AdzunaCategory
  created?: string
  redirect_url?: string
  salary_min?: number
  salary_max?: number
  contract_type?: string | null
  contract_time?: string | null
}

export interface AdzunaSearchResults {
  results: AdzunaJob[]
  count: number
  mean?: number
}

/**
 * A search result in the portal-skill contract shape. `id` is Adzuna's
 * `adref` token — the only field the `ad` endpoint accepts for a detail
 * lookup — so it's what `detail <id>` consumes. `adzuna_id` is Adzuna's own
 * advert id, kept for reference/dedup only.
 */
export interface JobResult {
  id: string
  adzuna_id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string | null
  salary: string | null
  contract_type: string | null
  contract_time: string | null
  category: string | null
}

export interface JobDetailResult extends JobResult {
  description: string | null
}

function formatSalary(min?: number, max?: number): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `AUD ${Math.round(min)}–${Math.round(max)}`
  return `AUD ${Math.round((min ?? max)!)}`
}

/** Reshape an Adzuna job into the contract search-result fields. */
export function toResult(j: AdzunaJob): JobResult {
  return {
    id: j.adref,
    adzuna_id: j.id,
    title: j.title || "(untitled)",
    company: j.company?.display_name || null,
    location: j.location?.display_name || null,
    date: j.created || null,
    url: j.redirect_url || null,
    salary: formatSalary(j.salary_min, j.salary_max),
    contract_type: j.contract_type || null,
    contract_time: j.contract_time || null,
    category: j.category?.label || null,
  }
}

/**
 * Reshape an Adzuna job into the detail result. `full_description` is
 * preferred but "may not be present" per Adzuna's own docs — `description`
 * (truncated to 500 chars) is the fallback.
 */
export function toDetail(j: AdzunaJob): JobDetailResult {
  return {
    ...toResult(j),
    description: j.full_description || j.description || null,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * GET a JSON response from the Adzuna API. Retries 429/5xx with backoff;
 * returns `null` on a 404. Throws immediately (no retry) on missing
 * credentials or a connection failure.
 */
async function apiGet<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const creds = credentials()
  if (!creds) {
    throw new Error(
      "ADZUNA_APP_ID and ADZUNA_APP_KEY must both be set — sign up at https://developer.adzuna.com/",
    )
  }
  const qs = new URLSearchParams({ app_id: creds.appId, app_key: creds.appKey })
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) qs.set(k, v)
  }
  const url = `${BASE_URL}${path}?${qs.toString()}`
  const maxRetries = 6
  let delay = 500

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      })
    } catch (e) {
      throw new Error(`could not reach the Adzuna API (${e instanceof Error ? e.message : String(e)})`)
    }

    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Adzuna API request failed: ${response.status} ${response.statusText}`)
      }
      await sleep(delay + Math.floor(Math.random() * 500))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return null as unknown as T

    const body = (await response.json().catch(() => null)) as (T & { display?: string }) | null
    if (!response.ok) {
      throw new Error(body?.display || `Adzuna API request failed: ${response.status} ${response.statusText}`)
    }
    if (!body) throw new Error("Adzuna API returned an unparseable response body")
    return body as T
  }
  throw new Error("Adzuna API request failed after retries")
}

export interface SearchParams {
  what?: string
  where?: string
  page: number
  resultsPerPage?: number
  maxDaysOld?: number
  sortBy?: string
  salaryMin?: number
  fullTime?: boolean
  permanent?: boolean
  whatExclude?: string
}

export async function searchJobs(params: SearchParams): Promise<AdzunaSearchResults> {
  return apiGet<AdzunaSearchResults>(`/jobs/${COUNTRY}/search/${params.page}`, {
    what: params.what,
    where: params.where,
    results_per_page: params.resultsPerPage !== undefined ? String(params.resultsPerPage) : undefined,
    max_days_old: params.maxDaysOld !== undefined ? String(params.maxDaysOld) : undefined,
    sort_by: params.sortBy,
    salary_min: params.salaryMin !== undefined ? String(params.salaryMin) : undefined,
    full_time: params.fullTime ? "1" : undefined,
    permanent: params.permanent ? "1" : undefined,
    what_exclude: params.whatExclude,
  })
}

/** Look up a single advertisement by its `adref` token (from a search result's `id`). */
export async function getAd(adref: string): Promise<AdzunaJob | null> {
  return apiGet<AdzunaJob | null>(`/jobs/${COUNTRY}/ad/${encodeURIComponent(adref)}`, {})
}
