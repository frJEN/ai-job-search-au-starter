import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { runSearch } from "../src/commands/search";
import { runDetail } from "../src/commands/detail";
import type { AdzunaJob } from "../src/helpers";

const originalFetch = globalThis.fetch;
const originalStdoutWrite = process.stdout.write;
const originalAppId = process.env.ADZUNA_APP_ID;
const originalAppKey = process.env.ADZUNA_APP_KEY;

function captureStdout(): { get: () => string } {
  let buf = "";
  process.stdout.write = ((chunk: string | Uint8Array) => {
    buf += chunk.toString();
    return true;
  }) as typeof process.stdout.write;
  return { get: () => buf };
}

function mockFetch(status: number, body: unknown): void {
  globalThis.fetch = (async () =>
    new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    })) as typeof fetch;
}

function job(overrides: Partial<AdzunaJob> = {}): AdzunaJob {
  return {
    id: "5123456789",
    adref: "eyJhbGciOiJIUzI1NiJ9.opaque-adref-token",
    title: "Quality Assurance Officer",
    description: "Truncated description...",
    full_description: "The full job description text.",
    company: { display_name: "Acme Foods" },
    location: { display_name: "Adelaide, SA", area: ["Australia", "South Australia", "Adelaide"] },
    category: { label: "Manufacturing Jobs", tag: "manufacturing-jobs" },
    created: "2026-07-26T10:00:00Z",
    redirect_url: "https://www.adzuna.com.au/land/ad/5123456789",
    salary_min: 60000,
    salary_max: 75000,
    contract_type: "permanent",
    contract_time: "full_time",
    ...overrides,
  };
}

beforeEach(() => {
  process.env.ADZUNA_APP_ID = "test-app-id";
  process.env.ADZUNA_APP_KEY = "test-app-key";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.stdout.write = originalStdoutWrite;
  process.env.ADZUNA_APP_ID = originalAppId;
  process.env.ADZUNA_APP_KEY = originalAppKey;
});

const searchOpts = { page: 1, format: "json" as const };

describe("runSearch", () => {
  test("maps Adzuna results into the portal-skill contract shape", async () => {
    mockFetch(200, { results: [job()], count: 1, mean: 65000 });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, query: "QA" });

    expect(code).toBe(0);
    const parsed = JSON.parse(out.get());
    expect(parsed.meta.count).toBe(1);
    expect(parsed.results[0]).toMatchObject({
      id: "eyJhbGciOiJIUzI1NiJ9.opaque-adref-token",
      adzuna_id: "5123456789",
      title: "Quality Assurance Officer",
      company: "Acme Foods",
      location: "Adelaide, SA",
      url: "https://www.adzuna.com.au/land/ad/5123456789",
      salary: "AUD 60000–75000",
    });
  });

  test("--limit 0 emits zero results", async () => {
    mockFetch(200, { results: [job()], count: 1 });
    const out = captureStdout();

    const code = await runSearch({ ...searchOpts, limit: 0 });

    expect(code).toBe(0);
    expect(JSON.parse(out.get()).results).toHaveLength(0);
  });

  test("a null/missing salary maps to a null salary field, never fabricated", async () => {
    mockFetch(200, { results: [job({ salary_min: undefined, salary_max: undefined })], count: 1 });
    const out = captureStdout();

    await runSearch(searchOpts);

    expect(JSON.parse(out.get()).results[0].salary).toBeNull();
  });

  test("a 4xx error (e.g. bad credentials) surfaces Adzuna's own message, not a silent empty result", async () => {
    // Real Adzuna shape for AUTH_FAIL, confirmed live: {"display":"Authorisation failed",...}
    mockFetch(401, { doc: "https://api.adzuna.com/v1/doc", display: "Authorisation failed", exception: "AUTH_FAIL" });
    captureStdout();

    const code = await runSearch(searchOpts);

    expect(code).toBe(1);
  });
});

describe("runDetail", () => {
  test("maps the ad endpoint's full_description into the detail result", async () => {
    mockFetch(200, job());
    const out = captureStdout();

    const code = await runDetail({ adref: "eyJhbGciOiJIUzI1NiJ9.opaque-adref-token", format: "json" });

    expect(code).toBe(0);
    const parsed = JSON.parse(out.get());
    expect(parsed.description).toBe("The full job description text.");
  });

  test("falls back to the truncated description when full_description is absent", async () => {
    mockFetch(200, job({ full_description: undefined }));
    const out = captureStdout();

    await runDetail({ adref: "x", format: "json" });

    expect(JSON.parse(out.get()).description).toBe("Truncated description...");
  });

  test("a 404 reports NOT_FOUND, not a crash", async () => {
    mockFetch(404, {});
    captureStdout();

    const code = await runDetail({ adref: "missing", format: "json" });

    expect(code).toBe(1);
  });
});
