# /outlook-sync - Sync Application Status from Outlook (DRAFT, unverified)

> **⚠️ DRAFT — unverified.** This command has never been run against a real Outlook mailbox. It is
> not wired into `/scrape`'s automated alert-ingestion step, and it is not part of the core, tested
> workflow the way `/gmail-sync` is. It requires a self-hosted, community-maintained MCP server (not
> built or vetted by this repo's maintainers) and an Azure App Registration. **Every tool name and
> query shape below is provisional** — written from that project's documented capabilities, not from
> a live test — confirm each one against your own configured server's actual schema before trusting
> its output, and expect to adjust this file once you do. See `SETUP.md` section 5a for setup.
>
> Anthropic's own [Claude for Outlook](https://support.claude.com/en/articles/14855664-use-claude-for-outlook)
> add-in is a **separate product** and cannot be used for this command — it has no MCP/tool-call
> interface at all, so it's irrelevant to everything below.

This is the Outlook-side equivalent of `/gmail-sync`: scanning the user's mailbox for status signals
on tracked job applications (interview invites, assessment links, offers, rejections) and, once
approved, writing detected changes into `job_search_tracker.csv` and
`documents/applications/<company>_<role>/outcome.md` — the same two places `/outcome` and
`/gmail-sync` write to, in the same schema. Mirrors `/gmail-sync`'s discipline exactly: classifies on
its own, but never writes without explicit batch approval first.

Follow these steps **in order** — they parallel `gmail-sync.md`'s steps 1:1 so the two stay easy to
compare and keep in sync if one changes.

---

## Step 0: Prerequisites

Confirm an Outlook-capable MCP server's tools are available (e.g. from
[`ryaker/outlook-mcp`](https://github.com/ryaker/outlook-mcp) or an equivalent Microsoft Graph-backed
MCP server you've configured — **the exact tool names depend on which server you set up**; this
draft assumes something like `list_messages` / `search_messages` / `get_message`, adjust to match
what your server actually exposes). If no such tools are available, tell the user to complete the
Azure App Registration and MCP server setup in `SETUP.md` section 5a, and stop — do not attempt this
via Bash, IMAP, SMTP, or any other channel.

---

## Step 1: Parse Input

`$ARGUMENTS` may contain:

- Nothing → default lookback (see Step 3)
- A company name, e.g. `/outlook-sync acme` → scope the search to that one tracked application
- `since <YYYY-MM-DD>` → override the lookback start date for this run only (does not change the persisted state file)

---

## Step 2: Load State

1. Read `job_search_tracker.csv`. If it does not exist, tell the user there is nothing to sync against yet (suggest `/outcome` or `/apply` first) and stop.
2. Read `outlook_sync/state.json` (create if missing: `{"last_sync": null, "processed_message_ids": []}`) — kept separate from `gmail_sync/state.json` so running both never double-counts a message ID from a different mailbox.
3. Build the set of **open applications**: tracker rows whose `status` is not a final value (`hired`, `rejected`, `no response`, `offer declined`, `withdrawn`). For each, derive its archive folder `documents/applications/<company>_<role>/` and check whether `outcome.md` exists there.
4. If `$ARGUMENTS` named a company, filter this set to the matching row(s) (case-insensitive). No match → tell the user and stop, do not guess.

---

## Step 3: Build the Search Query (provisional — confirm against your server)

Lookback window: `since <date>` argument if given, else `state.last_sync` if set, else 30 days back.

1. Normalize each open application's company name for matching later (lowercase; strip `inc`, `inc.`, `llc`, `ltd`, `a/s`, `corp`, `corporation`, `group`; strip punctuation; collapse whitespace).
2. Build a mailbox search combining, in whatever filter syntax your configured server's search tool actually accepts (Microsoft Graph typically uses OData `$filter`/`$search`, not Gmail's query operators — **do not assume Gmail syntax carries over**):
   - A folder/mailbox scope limited to the one account you configured for this repo (the equivalent of Gmail's `deliveredto:` restriction — confirm your server's tool is scoped to a single mailbox by construction, since Microsoft Graph app registrations are typically single-tenant/single-account already, unlike a shared Gmail query clause).
   - A quoted-name OR-group of the open applications' company names.
   - A sender-domain OR-group of common ATS platforms: `greenhouse.io`, `lever.co`, `myworkday.com`, `ashbyhq.com`, `smartrecruiters.com`, `icims.com`, `bamboohr.com`.
   - The lookback bound.
   - Inbox only (skip sent/drafts).
3. Call the server's message-search tool with a reasonable page size, paginating until exhausted or results are clearly outside the relevant window.

---

## Step 4: Filter to New Messages

For each returned message, check its ID against `state.processed_message_ids`. Skip anything already processed. For unprocessed messages, fetch the full body (not just a preview/snippet) — **classification in Step 5 must never be based on a truncated preview**, since previews cut exactly the phrase that distinguishes "we'd like to schedule a call" from "thanks for applying."

---

## Step 5: Classify Each Unprocessed Message

Same as `gmail-sync.md`'s Step 5, in full — the signal/status/`outcome.md`-action table, the match-first-then-classify order, and the conflict rule. See there rather than duplicating it here.

---

## Step 6: Present Proposed Updates

**Nothing has been written yet.** Same format as `gmail-sync.md`'s Step 6:

```
## Outlook Sync - Proposed Updates - YYYY-MM-DD

Scanned N messages since <lookback date>.

### Proposed Changes (reply "approve all", or list which to skip, e.g. "skip 2")
| # | Company | Role | Signal | Current -> Proposed Status | Source Email (date) |
|---|---|---|---|---|---|

### Needs Manual Review (conflicting signal)
### Unmatched Emails (no change proposed)
### Stale Applications (30+ days, no activity)
```

If the Proposed Changes table would be empty, say so and skip to Step 8.

---

## Step 7: Wait for Approval

Stop and wait for the user's reply — identical rule to `gmail-sync.md`: "approve all" proceeds every row; a partial reply proceeds only the named rows; "no" proceeds none, straight to Step 8.

### Step 7a: Write Approved Updates

Same as `gmail-sync.md`'s Step 7a: update the tracker row, append a dated `outcome.md` Notes entry (never overwrite existing history), and create the archive folder/minimal `outcome.md` if one doesn't exist yet.

---

## Step 8: Update State

Add every message ID processed this run to `outlook_sync/state.json`'s `processed_message_ids`, set `last_sync` to today.

---

## Step 9: Staleness Check

Same as `gmail-sync.md`'s Step 9 — surfaced only, never written.

---

## Step 10: Present Closing Summary

Same format as `gmail-sync.md`'s Step 10.

---

## Important Rules

1. **This is a draft.** Every rule below is inherited intent from `/gmail-sync`, not yet proven against a live Outlook mailbox — verify, don't assume.
2. **Classify from full email bodies, never previews.**
3. **Nothing is written before the user approves the Step 6 batch.**
4. **Never propose `hired` or `offer_declined`.**
5. **A conflicting signal is a manual-review flag, not a proposed overwrite.**
6. **Append-only to `outcome.md` Notes.** Never rewrite or delete existing history.
7. **Idempotent by message ID.**
8. **Never fabricate a match.**
9. **Read-only against the mailbox itself** — this command reads and classifies; it should never label, move, delete, or send anything. If your configured MCP server's tools can do more than read (e.g. `ryaker/outlook-mcp` also exposes send/calendar-write actions), **do not call them from this command** — only read/search tools belong here.
10. **All state is personal data.** `outlook_sync/state.json`, `job_search_tracker.csv`, and `documents/applications/**` are gitignored — never suggest committing them (add `outlook_sync/` to `.gitignore` alongside the existing `gmail_sync/` entry before using this for real).
