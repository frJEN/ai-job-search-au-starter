import { describe, test, expect } from "bun:test";
import { runCLI } from "./helpers";

// These assert on validation error codes that are emitted BEFORE any network
// call, so the suite is network-free — no ADZUNA_APP_ID/APP_KEY required.

function parsedStderr(stderr: string): { error?: string; code?: string } {
  try {
    return JSON.parse(stderr);
  } catch {
    return {};
  }
}

describe("adzuna CLI flag validation", () => {
  describe("numeric flag validation", () => {
    for (const name of ["jobage", "page", "results-per-page", "salary-min", "limit"]) {
      test(`--${name} non-numeric exits 1 with BAD_ARG`, async () => {
        const result = await runCLI(["search", `--${name}`, "foo"]);
        expect(result.exitCode).not.toBe(0);
        const err = parsedStderr(result.stderr);
        expect(err.code).toBe("BAD_ARG");
        expect(err.error).toMatch(new RegExp(name));
      });
    }
  });

  describe("detail argument validation", () => {
    test("missing adref exits 1 with NO_ID", async () => {
      const result = await runCLI(["detail"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("NO_ID");
    });
  });

  describe("command dispatch", () => {
    test("unknown command exits 1 with BAD_CMD", async () => {
      const result = await runCLI(["frobnicate"]);
      expect(result.exitCode).not.toBe(0);
      expect(parsedStderr(result.stderr).code).toBe("BAD_CMD");
    });

    test("no command prints help and exits 1", async () => {
      const result = await runCLI([]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toMatch(/USAGE/);
    });
  });

  describe("missing credentials", () => {
    test("search without ADZUNA_APP_ID/APP_KEY fails clearly, not silently", async () => {
      const result = await runCLI(["search", "-q", "test"], { ADZUNA_APP_ID: "", ADZUNA_APP_KEY: "" });
      expect(result.exitCode).not.toBe(0);
      const err = parsedStderr(result.stderr);
      expect(err.code).toBe("SEARCH_FAILED");
      expect(err.error).toMatch(/ADZUNA_APP_ID/);
    });
  });
});
