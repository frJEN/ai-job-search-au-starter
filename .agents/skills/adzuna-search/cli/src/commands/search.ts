import { searchJobs, toResult, writeError, type JobResult } from "../helpers.js"

export interface SearchOpts {
  query?: string
  location?: string
  jobage?: number
  page: number
  resultsPerPage?: number
  salaryMin?: number
  fullTime?: boolean
  permanent?: boolean
  whatExclude?: string
  limit?: number
  format: "json" | "table" | "plain"
}

function renderTable(jobs: JobResult[]): string {
  if (jobs.length === 0) return "No results."
  const rows = jobs.map((j) => {
    const title = (j.title || "").slice(0, 42).padEnd(42)
    const company = (j.company || "—").slice(0, 26).padEnd(26)
    const loc = (j.location || "—").slice(0, 24).padEnd(24)
    const date = (j.date || "—").slice(0, 10)
    return `${j.id.padEnd(20)} ${title} ${company} ${loc} ${date}`
  })
  const header =
    "ID (adref)".padEnd(20) + " " + "TITLE".padEnd(42) + " " + "COMPANY".padEnd(26) + " " + "LOCATION".padEnd(24) + " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const data = await searchJobs({
      what: opts.query,
      where: opts.location,
      page: opts.page,
      resultsPerPage: opts.resultsPerPage,
      maxDaysOld: opts.jobage,
      salaryMin: opts.salaryMin,
      fullTime: opts.fullTime,
      permanent: opts.permanent,
      whatExclude: opts.whatExclude,
    })
    let jobs = (data.results || []).map(toResult)
    if (opts.limit !== undefined && opts.limit >= 0) jobs = jobs.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(jobs) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        jobs
          .map(
            (j) =>
              `${j.title}\n  ${j.company || "—"} · ${j.location || "—"} · ${j.date || "—"}\n  id: ${j.id}\n  ${j.url || "—"}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: data.count ?? jobs.length, page: opts.page }, results: jobs }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
