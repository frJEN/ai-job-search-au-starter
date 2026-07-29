# Gmail Job-Alert Sources

<!-- SETUP: sampled from a real Australian inbox via the Gmail connector,
scoped with deliveredto:[YOUR_EMAIL]. Only sender addresses and body
structure actually observed should be recorded here — do not extend this
file from guesses. If a platform's alert template changes, or you start
receiving alerts from a platform not yet listed, re-sample it yourself
(open the email via the Gmail connector, `get_thread` with
`messageFormat: FULL_CONTENT`) and add a section below the same way (same
principle a portal skill's url-reference.md follows). -->

## Account restriction

Every Gmail query built from this file **must** include
`deliveredto:[YOUR_EMAIL]`. See the "Account Restriction (Gmail)"
section in `CLAUDE.md` — this is not optional and never gets loosened.

## Recency & noise filter

All platforms below also send non-alert mail from the same domains (welcome
emails, profile nudges, "come back" marketing, security notices). Query with
`newer_than:14d in:inbox` plus the sender OR-group, then filter by the
subject-line patterns noted per platform below — do not treat every message
from these senders as a job alert.

---

## LinkedIn

- **Real alerts:** `jobalerts-noreply@linkedin.com`
- **Noise (same domain, not alerts):** `messages-noreply@linkedin.com` (network activity), `security-noreply@linkedin.com` (account security), `career-interests-noreply@linkedin.com` (profile nudges), `jobs-noreply@linkedin.com` (generic marketing)
- **Subject pattern (real alert):** `"<title>": <company> - <role> posted on <date>` or `<role> @ <company>` or `<YOUR NAME>: your job alert for <query> in <location> has been created` (the last one is just an alert-creation receipt, not postings — skip it)
- **Body:** `plaintextBody` is clean and already used by this repo's `linkedin-search` CLI's own ID scheme. Per-job blocks are separated by a `---------------------------------------------------------` line:
  ```
  <Title>
  <Company>
  <Location>
  [optional signal line, e.g. "This company is actively hiring" / "N school alumni"]

  View job: https://www.linkedin.com/comm/jobs/view/<numeric_id>/?trackingId=...
  ```
- **Parsing:** extract `<numeric_id>` from the `jobs/view/<id>` path — this is the **same ID format** `linkedin-search detail <id>` already consumes, so a Gmail-sourced LinkedIn job can go straight to the existing CLI's `detail` command for the full description instead of needing separate parsing logic.

## Indeed

Two distinct alert senders, both carrying real postings:

### `donotreply@jobalert.indeed.com` (saved-search digest, multiple jobs)
- **Subject pattern:** `<query> in <location>: <first job title> at <first company> and N more new jobs`
- **Body:** `plaintextBody` per-job blocks, blank-line separated:
  ```
  <Title>
  <Company> - <Location>
  [Easily apply]
  <Description snippet>
  <Recency, e.g. "5 days ago" / "Just posted">
  https://au.indeed.com/rc/clk/dl?jk=<job_key>&...
  ```
- **Parsing:** the `jk=` query param is Indeed's job key; the full URL (including tracking params) is the apply/view link — keep it as-is, don't try to strip tracking params.

### `donotreply@match.indeed.com` (personalized single-job match)
- **Subject pattern:** the job title itself, e.g. `QA Assistant @ Example Bakery`
- **Body:** single job, plaintext:
  ```
  Hi <YOUR NAME>,
  <personalized blurb>

  <Title>
  <Company>
  <Location>
  Job type: ...
  Schedule: ...
  Work setting: ...

  View job: https://cts.indeed.com/v3/<opaque-redirect-token>
  Apply now: https://cts.indeed.com/v3/<opaque-redirect-token>
  ```
- **Parsing note:** the `View job:`/`Apply now:` URLs are single-use, opaque, tracked redirects through `cts.indeed.com` (not a stable `jk=`-keyed URL like the digest sender). Store the redirect URL as-is for `url`; do not attempt to resolve/follow it repeatedly (it may be single-use) — treat these as lower dedup confidence than the digest sender and dedupe primarily on title+company text.

### Noise (same domain family, not postings)
- `no-reply@indeed.com` — generic tips/marketing ("Hot tip: The universe says...", "Let your next job find you")

## Seek

- **Real alerts:** `jobmail@s.seek.com.au` (saved-search digest) and `noreply@s.seek.com.au` (recommendation digest) — both carry real postings, same body shape
- **Noise (same domain family, not postings):** `noreply@email.seek.com.au` (profile-completion / career-goal marketing nudges)
- **Subject pattern:** `N new job(s) for <query> in <location>` (jobmail) or `<first job title> + N new jobs` (noreply)
- **Body:** `plaintextBody`, per-job blocks:
  ```
  <Title>
  <Company>

  [$salary range]
  <Location>

  [https://au.seek.com/job/<job_id>?savedSearchID=...&tracking=...]
  ```
  A second "Jobs you may have missed" section appears further down the same email with the same per-job shape plus a `Posted on <date>` line — include it, it's still real postings from the same saved search.
- **Parsing:** extract `<job_id>` from `/job/<job_id>?` — this is Seek's numeric posting ID. The URL itself (`au.seek.com/job/<id>`) is fine to store and present to the user, but per `CLAUDE.md`/`04-job-evaluation.md`, **never WebFetch it** (Seek's robots.txt blocks automated fetching) — if the user wants the full description, they open it themselves or paste it into `/apply`.

## Jora

- **Real alerts:** `donotreply@jora.com`
- **Subject pattern (real alert):** `<company> is hiring for <role> + N other similar jobs in <location>` — **skip** subjects starting with `Nice one! Your ... job alert is all set up.` (those are alert-creation receipts, not postings)
- **Body:** HTML only (no usable `plaintextBody`). Per-job structure after stripping tags:
  ```
  <Title>
  <Company>[rating]-<Location>
  <employment tags, e.g. "Full time" "Permanent" "Quick apply">[$salary]<Description snippet>
  ```
  Href pattern: `https://au.jora.com/job/<Title-Slug>-<32charhash>?alert_id=...` (occasionally `https://au.jora.com/job/rd/<hash>?...` as a redirect variant) — hrefs appear in the same order as the job blocks in the stripped text.
- **Parsing:** match each `<a href="https://au.jora.com/job/...">` in document order against the corresponding stripped-text job block (same order); use the full URL as `url`, the slug portion as `id`.

## Fuse Recruitment

- **Real alerts:** `no-reply@fuserecruitment.com`
- **Noise (same sender, not alerts):** the same address also sends the registration welcome email
  ("Welcome to Fuse Recruitment") — filter by **subject**, not sender, since Fuse uses one address for
  everything.
- **Subject pattern (real alert):** `"We have new jobs for you!"` — every alert uses this exact
  subject regardless of which saved search triggered it.
- **Body:** HTML only (no usable `plaintextBody`). Intro line names the matched alert:
  `"We have N new jobs that match your job alert <Alert Name>."` Per-job blocks, stripped-text order:
  ```
  <Title>
  <Location>
  [$salary range or hourly rate]
  <Recency, e.g. "TODAY" / "N days ago">
  ```
  **No employer/company name is shown** in this digest — Fuse is the agency, and unlike Seek/Indeed/
  Jora it doesn't name the client company in the alert email itself; treat `company` as `null` for
  Fuse-sourced results.
- **Parsing:** hrefs appear in the same document order as the job blocks:
  `https://www.fuserecruitment.com/jobview/<title-slug>/<uuid>?utm_source=JobAlerts&utm_medium=Email&utm_campaign=Collection&utm_content=job-area` — match each href to its corresponding stripped-text block by position, use the full URL as `url`, the UUID as `id`.

## Synergie

- **Status: alert structure not yet observed.** No job-alert email has arrived yet from
  `synergieaustralia.com.au` or any related domain — do not guess a body structure.
- **Noise (confirmed, not an alert):** `support@recruitonline.com.au`, subject `"Confirmation of your
  Online Application"` — an application-received receipt, not a posting. This confirms Synergie's
  applications route through a third-party ATS called **RecruitOnline** (`recruitonline.com.au`), so
  that's the domain to watch for a future alert email, alongside `synergieaustralia.com.au` itself.
  Once a real alert arrives, sample it with `get_thread` (`messageFormat: FULL_CONTENT`) and fill in
  this section the same way as the platforms above.

## Adding another platform

Not every Australian job board is listed above. If you subscribe to alerts from one that isn't (a niche or regional board, a recruitment agency, etc.), don't guess its sender address or body structure — wait for a real alert to land, sample it the same way as the platforms above, and add a new section here before wiring it into `/scrape` Step 1d.
