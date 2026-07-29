# /platform-sync - Refine Your Job-Platform Profiles and Set Up Alerts

You are helping the user push their canonical candidate profile (already built by `/setup`) out to the job platforms this fork targets — refining each platform's own profile/resume to match the target role, and setting up a job alert on each pointed at the one email address `/scrape`'s Gmail-ingestion step reads. This is the reverse direction of `/gmail-sync` (which pulls status signals *in* from Gmail): `/platform-sync` pushes the profile *out*.

**Where this sits in the workflow:** run this once after `/setup` and before `/scrape` — the alerts it creates are what `/scrape` Step 1d's Gmail ingestion later reads, so setting them up earlier means more, better-targeted postings from the first `/scrape` run.

`$ARGUMENTS` may contain a target role/location override for this run only (does not touch the stored profile), or a specific platform name to run against just that one platform.

---

## ⚠️ Read this before using

This command signs into live accounts on real job platforms — under **your own** session, in **your own** browser, via Claude in Chrome — and edits your profile and creates job alerts there. That is a materially different thing from the CLI-based portal search this repo also ships (`.agents/skills/*/SKILL.md`, which only reads public, unauthenticated pages and stops rather than automate anything behind a login).

- Several of these platforms' Terms of Service broadly prohibit "automated" access to the account area, and this is automation — even though it's you, on your own account, reviewing and approving every change before it's submitted. Whether that crosses a line is a judgment call for you to make, not something this command can certify as compliant.
- Practical risk if a platform's bot-detection flags the session: at worst, a temporary limitation or lockout on that one account. Keep usage to normal, occasional frequency — this is not meant to run on a schedule or repeatedly in a short window.
- **If any platform shows a CAPTCHA or another bot-check, stop immediately and hand it to the user.** Never attempt to solve or work around one, under any circumstance.
- Every proposed profile edit and every alert is shown to you before it's submitted — nothing is written without your explicit confirmation, both for accuracy and because a human approving each action is itself part of what keeps this reasonable.
- Don't want to use the automated path at all? See **Manual Alternative** below — the identical outcome, done by hand, platform by platform.

---

## Step 0: Prerequisites

1. Confirm the candidate profile is populated: `01-candidate-profile.md` and `CLAUDE.md`'s Candidate Profile section should not still contain `[PLACEHOLDER]` tokens. If they do, stop and point the user at `/setup`.
2. Confirm `CLAUDE.md`'s `[YOUR_EMAIL]` placeholder has been replaced with a real address (see `SETUP.md` step 5 — this is the address every alert set up below will point to, and the same address `/scrape`'s Gmail step reads). If it's still a placeholder, stop and point the user there.
3. Resolve the target role and location: read `search-queries.md`'s Priority 1 category and `04-job-evaluation.md`'s career goals, unless `$ARGUMENTS` supplies an explicit override for this run.
4. Read the master CV (`cv/main_example.tex`, or whichever tailored CV is most current) alongside `01-candidate-profile.md` — once, here. Step 2 reuses both across every platform iteration; never re-read either mid-loop.

---

## Step 1: Chrome Preflight

1. Call `tabs_context_mcp` (create the group if empty) and, if more than one browser is connected, `list_connected_browsers` per standard practice — ask the user which browser to act in before doing anything else.
2. Ask the user to confirm, before proceeding:
   - They are already signed into each platform they want synced (Step 2 list below), in the browser Claude will act in — this command never enters a password or handles login credentials itself.
   - Every one of those accounts uses the **same email address** configured in Step 0.2 — this is what makes the alerts land in the one inbox `/scrape` reads.
   - They've approved the Claude in Chrome extension's site permission for each platform's domain (this is a **per-site permission in the extension's own settings**, not a browser tab group — a tab group is just an organizational label with no bearing on what Claude is allowed to access).
3. If the user hasn't done the above yet, stop here and point them at `SETUP.md`'s Chrome-permissions step rather than attempting to proceed without it.

---

## Step 2: Per-Platform Refinement and Alert Setup

Default platform list (skip any not relevant, or restrict to one via `$ARGUMENTS`). Both this table's paths and the Manual Alternative section below point back to this single source — the paths themselves live here, not repeated in either place:

| Platform | Profile/registration area | Alert creation area |
|---|---|---|
| LinkedIn | Profile → edit headline/About | Jobs → job search → "Get notified about new jobs" |
| Seek | Profile → career summary/headline, upload resume | Search results → "Create Alert" (or Account → Job Alerts) |
| Indeed | Home → resume/headline | Search results → "Get new jobs for this search by email" toggle |
| Jora | No account/profile — aggregator only | Search results → "Get new jobs by email" signup |
| Fuse Recruitment | Candidate registration (upload CV) | Uncertain — investigate live, may be a "register your interest" or subscription checkbox rather than a dedicated alerts feature |
| Synergie | Candidate registration (upload CV) | Uncertain — investigate live, same caveat as Fuse |

For each platform in scope, in turn:

### 2a. Navigate and read the current state

Navigate to the platform's profile/candidate-registration area (or, for Jora, straight to its job-alert signup). **Do not assume a fixed page layout or URL path** — sites change, and Fuse/Synergie in particular don't have a confirmed structure yet (unlike `gmail-alert-sources.md`'s sender documentation, there is no pre-verified page map for this step). Use `read_page`/`find` to locate the actual profile fields, resume-upload control, or alert-creation form live, every run.

### 2b. Propose edits, grounded only in the canonical profile

For platforms with an editable profile (LinkedIn, Seek, Indeed): compare the on-platform headline, summary, and skills against `01-candidate-profile.md` / the master CV, and propose specific edits that better match the target role. **Every proposed edit must trace to the canonical profile or CV — never invent or embellish**, same rule `/apply` follows for CVs and cover letters. Present the proposed diff (current text → proposed text, field by field) to the user.

**Do not submit anything until the user explicitly confirms this specific platform's edits.** This mirrors `/apply`'s application-packet handoff ("stop before submit") and is not optional.

For Fuse/Synergie: if a registration form exists and hasn't been completed, propose filling it from the canonical profile/CV the same way; if it's already registered, skip to alerts.

### 2c. Set up the job alert

Navigate to the platform's alert-management area first (most platforms list existing alerts there) and check whether one already matches this run's target role, location, **and the email address configured in Step 0.2**. An alert for the right role/location but pointed at a different or older email does not count as a match - it means `/scrape`'s Gmail ingestion would never see results from it, so create the correct one instead of skipping. If a genuinely matching alert already exists, skip creating a duplicate and note it as "already exists" in the Step 3 summary instead. Otherwise, navigate to the alert creation area (per the table above). Fill in the target role, location, and the configured email address; set a reasonable frequency (daily, where offered). **Show the filled form and get explicit confirmation before saving/submitting.**

### 2d. Handle anything that can't be completed

2FA prompts, a CAPTCHA, an unrecognized page layout, or a field that doesn't map cleanly to the canonical profile: stop for that platform, note it plainly in the Step 3 summary as needing the user's own follow-up, and move to the next platform. Never guess your way past an obstacle.

---

## Step 3: Closing Summary

Report, per platform: what was changed (or would have been, if declined), whether an alert was created, and anything left for the user to finish by hand (2FA, a CAPTCHA, an unclear field). Remind the user that `/scrape` will start picking up whatever alerts land in the connected inbox from here on.

---

## Manual Alternative

Prefer not to use the automated path, or want to finish something Step 2 flagged? Same outcome, done by hand, using Step 2's table for where to go on each platform:

1. Open the platform (linkedin.com, seek.com.au, au.indeed.com, au.jora.com, fuserecruitment.com, or synergieaustralia.com.au) and sign in.
2. If it has an editable profile (per the table), update it using language from your CV/`01-candidate-profile.md` to reflect the target role.
3. Check the platform's alert-management area for an existing alert matching your target role, location, **and email address** first (same check as Step 2c) — only create a new one at the alert creation area (per the table) if none exists, sent to the email address configured in `CLAUDE.md`.

---

## Important Rules

1. **Never handle passwords or perform sign-in.** The user must already be signed into each platform before this command touches it.
2. **Nothing is written before the user approves it** — every profile edit and every alert, individually, not as a bundled batch.
3. **Never fabricate profile content.** Every on-platform edit traces to `01-candidate-profile.md` or the master CV, same sourcing discipline `/apply` follows.
4. **Never guess a page's structure.** Investigate live with `read_page`/`find` every run; if a platform's layout doesn't match what's expected, stop and ask rather than clicking blind.
5. **Never attempt to solve or bypass a CAPTCHA or bot-check**, under any circumstance — stop and hand it to the user.
6. **This is not a scheduled or repeated job.** Run it when the target role/location genuinely changes, not routinely.
