import { getAd, toDetail, writeError } from "../helpers.js"

export interface DetailOpts {
  adref: string
  format: "json" | "plain"
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  try {
    const ad = await getAd(opts.adref)
    if (!ad) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = toDetail(ad)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        job.salary ? `Salary: ${job.salary}` : "",
        job.category ? `Category: ${job.category}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url || "—"}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
