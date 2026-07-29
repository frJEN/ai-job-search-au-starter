# Security Policy

## Reporting a vulnerability

Please report security findings privately via **[GitHub private vulnerability reporting](https://github.com/frJEN/ai-job-search-au-starter/security/advisories/new)** rather than a public issue. You will get a response within a few days, credit in the fix unless you prefer otherwise, and public disclosure coordinated with the patch.

If the private form is unavailable, open a public issue that describes the *class* of problem without a working recipe, and note that you have details to share privately.

## Threat model, honestly stated

This is an agentic workflow: an LLM with file access reads untrusted web content (job postings) alongside your personal data (CV, profile, application history). That combination is the main risk surface, and it cannot be fully eliminated - only narrowed. What the framework does about it:

- **Untrusted-input rules**: `/apply` and `/rank` treat posting text as data, never instructions - agents are told not to follow directions embedded in postings and not to fetch URLs found inside posting text (the user-supplied posting URL is the one exception). Reviewer research starts from the company identity the user confirmed, never from links in the posting body.
- **Permission allowlist**: `.claude/settings.json` pre-approves only the specific commands the workflow needs; the `security-guards` CI job fails any PR that widens it, adds package-manifest lifecycle scripts, or weakens the personal-data gitignore rules. Note the allowlist governs Bash commands - the model's native WebFetch/WebSearch tools are outside its reach, which is exactly why the instruction-level rules above exist.
- **Personal data boundaries**: your populated profile, tracker, salary data, and application archive are gitignored; documents never leave the machine by design (`/notion-sync` syncs filenames only; nothing uploads document content anywhere).

Instruction-level defenses raise the bar; they are not a sandbox. If you run this workflow against job boards you do not trust at all, review what the agent fetched and wrote before sending anything out.

## Australia-specific additions: what's new in the trust surface

This fork adds three features beyond the upstream template, each with its own scope:

- **`adzuna-search`** - an authenticated, key-based API client, not scraping. `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` are read from environment variables or a gitignored `.env` file, and are only ever placed in outbound query strings to Adzuna's own fixed host (`api.adzuna.com`) - never logged, echoed, or included in thrown error messages.
- **Gmail job-alert ingestion** (`/scrape` Step 1d) - read-only, hard-scoped to the single connected mailbox via a mandatory `deliveredto:` clause on every query (see `CLAUDE.md`'s Account Restriction section). Never labels, drafts, archives, or deletes anything.
- **`/platform-sync`** - a materially higher-trust action than the rest of this framework: it signs into real accounts in the user's own already-authenticated browser session to make live changes (profile edits, alert subscriptions). It never handles or stores credentials itself, never attempts to bypass a CAPTCHA, and requires explicit per-action confirmation before anything is submitted - one platform, one edit, one alert at a time, never a bundled batch. Review `.claude/commands/platform-sync.md`'s caution notes before running it.

## Scope notes

- Portal CLI skills make live requests only when you run them; CI never does.
- Community fork skills listed in the [forks index](https://github.com/MadsLorentzen/ai-job-search/discussions/78) are **not** covered by this policy - review the code you copy, as the index itself says.
