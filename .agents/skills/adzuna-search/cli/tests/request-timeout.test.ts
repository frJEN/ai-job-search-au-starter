import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { searchJobs } from "../src/helpers";

// A stalled upstream connection (accepted socket, no response) would otherwise
// hang the CLI forever - fetch has no default timeout. Assert the request
// wrapper carries an AbortSignal timeout.
const originalFetch = globalThis.fetch;
const originalAppId = process.env.ADZUNA_APP_ID;
const originalAppKey = process.env.ADZUNA_APP_KEY;

beforeEach(() => {
  process.env.ADZUNA_APP_ID = "test-app-id";
  process.env.ADZUNA_APP_KEY = "test-app-key";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.ADZUNA_APP_ID = originalAppId;
  process.env.ADZUNA_APP_KEY = originalAppKey;
});

describe("searchJobs request timeout", () => {
  test("passes an AbortSignal timeout to fetch", async () => {
    let init: RequestInit | undefined;
    globalThis.fetch = (async (_url: string | URL | Request, i?: RequestInit) => {
      init = i;
      return new Response(JSON.stringify({ results: [], count: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as unknown as typeof fetch;

    await searchJobs({ page: 1 });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });
});
