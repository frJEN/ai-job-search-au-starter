#!/usr/bin/env bun
// Self-contained CLI for Adzuna's official Australia job search API. No
// external CLI framework, so it runs anywhere `bun` is available. Unlike the
// scraping-based portal skills in this repo, this is an authenticated,
// ToS-compliant official API — requires ADZUNA_APP_ID / ADZUNA_APP_KEY
// (sign up free at https://developer.adzuna.com/).

import { runSearch, type SearchOpts } from "./commands/search.js"
import { runDetail, type DetailOpts } from "./commands/detail.js"

interface Flags {
  _: string[]
  [k: string]: string | boolean | string[]
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { _: [] }
  const alias: Record<string, string> = { q: "query", l: "location", n: "limit" }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith("--") || a.startsWith("-")) {
      const key = alias[a.replace(/^-+/, "")] ?? a.replace(/^-+/, "")
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) {
        flags[key] = true
      } else {
        flags[key] = next
        i++
      }
    } else {
      ;(flags._ as string[]).push(a)
    }
  }
  return flags
}

const HELP = `adzuna-cli — search Australian jobs via Adzuna's official API

USAGE
  bun run src/cli.ts search [flags]
  bun run src/cli.ts detail <adref> [--format json|plain]

REQUIRES
  ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables
  (sign up free at https://developer.adzuna.com/)

SEARCH FLAGS
  --query, -q <text>      Keywords (job title, skill, or role).
  --location, -l <text>   Place name or postcode, e.g. "Adelaide", "5000".
  --jobage <days>         Only ads posted within N days.
  --page <n>              1-indexed page. Default 1.
  --results-per-page <n>  Results per page (Adzuna default applies if omitted).
  --salary-min <n>        Minimum salary (AUD).
  --full-time             Only full-time jobs.
  --permanent             Only permanent jobs.
  --exclude <text>        Keywords to exclude.
  --limit, -n <n>         Cap results emitted (client-side).
  --format <fmt>          json (default) | table | plain.

DETAIL
  <adref>                 The \`id\` field from a search result (Adzuna's adref token).

EXAMPLES
  bun run src/cli.ts search -q "quality assurance" -l "Adelaide" --jobage 14 --format table
  bun run src/cli.ts search -q "research assistant" -l "Adelaide" --full-time --format table
  bun run src/cli.ts detail <adref> --format plain
`

async function main(): Promise<number> {
  const argv = process.argv.slice(2)
  const flags = parseFlags(argv)
  const cmd = (flags._ as string[])[0]

  if (!cmd || flags.help || flags.h) {
    process.stdout.write(HELP)
    return cmd ? 0 : 1
  }

  const parseIntFlag = (name: string, raw: string | boolean | string[]): number | null => {
    const val = parseInt(raw as string, 10)
    if (isNaN(val)) {
      process.stderr.write(JSON.stringify({ error: `--${name} must be a number, got "${raw}"`, code: "BAD_ARG" }) + "\n")
      return null
    }
    return val
  }

  if (cmd === "search") {
    const fmt = (flags.format as string) || "json"

    let jobage: number | undefined
    if (flags.jobage !== undefined) {
      const v = parseIntFlag("jobage", flags.jobage)
      if (v === null) return 1
      jobage = v
    }
    let page = 1
    if (flags.page !== undefined) {
      const v = parseIntFlag("page", flags.page)
      if (v === null) return 1
      page = Math.max(1, v)
    }
    let resultsPerPage: number | undefined
    if (flags["results-per-page"] !== undefined) {
      const v = parseIntFlag("results-per-page", flags["results-per-page"])
      if (v === null) return 1
      resultsPerPage = v
    }
    let salaryMin: number | undefined
    if (flags["salary-min"] !== undefined) {
      const v = parseIntFlag("salary-min", flags["salary-min"])
      if (v === null) return 1
      salaryMin = v
    }
    let limit: number | undefined
    if (flags.limit !== undefined) {
      const v = parseIntFlag("limit", flags.limit)
      if (v === null) return 1
      limit = v
    }

    const opts: SearchOpts = {
      query: typeof flags.query === "string" ? flags.query : undefined,
      location: typeof flags.location === "string" ? flags.location : undefined,
      jobage,
      page,
      resultsPerPage,
      salaryMin,
      fullTime: flags["full-time"] === true,
      permanent: flags.permanent === true,
      whatExclude: typeof flags.exclude === "string" ? flags.exclude : undefined,
      limit,
      format: (["json", "table", "plain"].includes(fmt) ? fmt : "json") as SearchOpts["format"],
    }
    return runSearch(opts)
  }

  if (cmd === "detail") {
    const adref = (flags._ as string[])[1]
    if (!adref) {
      process.stderr.write(JSON.stringify({ error: "detail requires an <adref>", code: "NO_ID" }) + "\n")
      return 1
    }
    const fmt = (flags.format as string) || "json"
    const opts: DetailOpts = {
      adref,
      format: (fmt === "plain" ? "plain" : "json") as DetailOpts["format"],
    }
    return runDetail(opts)
  }

  process.stderr.write(JSON.stringify({ error: `Unknown command "${cmd}"`, code: "BAD_CMD" }) + "\n")
  return 1
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    process.stderr.write(
      JSON.stringify({
        error: e instanceof Error ? e.message : String(e),
        code: "INTERNAL_ERROR",
      }) + "\n",
    )
    process.exit(1)
  })
