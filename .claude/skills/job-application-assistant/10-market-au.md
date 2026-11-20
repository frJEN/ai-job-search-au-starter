# Australian Market Rules

Fork-specific rules for Australian applications. The generic framework files point here, so upstream syncs only conflict on those one-line pointers. **Read this file only when a rule below applies to the posting or profile.**

**Last verified: 2026-11.** These facts are checked against the linked official sources.
- Re-check a source only when this stamp is more than ~6 months old, or the user disputes a rule.
- `/rank` never re-checks: it's triage and does no web lookups (`rank.md`).

## Eligibility: what AU posting wording means

This supplements the generic Eligibility Gate in `04-job-evaluation.md`; that table's verdicts apply unchanged. Citizenship-gated rows below **FAIL** for non-citizens unless the posting says non-citizens or waivers are considered. A waiver is the employer's decision, never something to assume.

| Posting says / role is | Practical reading | Source |
|---|---|---|
| **APS (Commonwealth) role** | Citizenship is a condition of engagement (Public Service Act 1999 s 22(8)). Only the agency head can waive it, and a non-citizen still needs work rights. | [APSC](https://www.apsc.gov.au/working-aps/hr-practitioners/recruitment-aps/onboarding/citizenship-aps) |
| **State/territory public service, local council** | Varies by jurisdiction; many accept PR. Read the posting, then the state's eligibility page. | The state careers site |
| **Baseline / NV1 / NV2 / PV clearance** (or "ability to obtain") | AGSVA requires citizenship plus a checkable background. A sponsor can waive this only for an exceptional business need, and a waiver doesn't guarantee a clearance. | [AGSVA](https://www.agsva.gov.au/applicants/eligibility-suitability) |
| **"Full / unrestricted working rights"** | Citizen, PR, NZ citizen, or a visa with no work restrictions (e.g. 485). Employer-tied or hours-capped visas usually don't qualify. | |
| **Candidate on Student visa (500)** | 48 hours per fortnight while the course is in session (fortnights start Monday); no cap in official breaks. Record it as the hours/timing gate. | [Home Affairs](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500/temporary-relaxation-of-working-hours-for-student-visa-holders) |
| **Candidate on Temporary Graduate (485)** | No work restrictions and no employer tie. The remaining visa duration is the real constraint. | [Home Affairs](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-graduate-485) |
| **Candidate on Skills in Demand (482)**, or the posting offers sponsorship | Only the sponsor (or an associated entity) may employ them, in the nominated occupation. "We sponsor" means PASS; silence means unverified. | [Home Affairs](https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482) |

## Salary: put the pay on a base basis first

Award rates and most salary data are **base pay excluding super**. Before the Salary Floor check (`04-job-evaluation.md` § 6) or the benchmark, classify the posting's figure:

| Posting wording | Base salary |
|---|---|
| "$X + super", "plus super", "$X base" | X |
| "$X inclusive of super", "package", "TRP"/"total remuneration", "incl. super" | X ÷ 1.12 |
| Pay stated, super not mentioned | Assume X is base, and say so |

- 1.12 reflects the 12% super guarantee, the final legislated step since 1 July 2025 ([ATO](https://www.ato.gov.au/businesses-and-organisations/small-business-newsroom/the-final-sg-rate-increase-is-coming-on-1-july)). No lookup is needed.
- Show both figures, e.g. "$100k package ≈ $89.3k base + super", and compare the **base** figure.
- **APS and state roles:** pay is set by classification (APS1–6, EL1–2, SES; state bands vary) under the agency's enterprise agreement, and is quoted excluding super (APS super is usually 15.4%).
  - Read the band from the posting.
  - If the posting doesn't state it: `/apply` may look up that agency's EA once and cite it; `/rank` reports "band not stated, not checked".
  - Don't rely on a remembered pay table.

## Public-sector applications: selection criteria and the pitch

Applies to APS, state/territory and local government, universities, and many not-for-profits. These jobs are often decided on this document more than on the CV, so `/apply` always offers it (`08-application-forms.md`, "When this applies"). The application kit sets one of three formats:

1. **Pitch / statement of claims.** One statement, usually 1–2 pages or 500–1,000 words. Use the kit's own limit. Don't repeat the CV; pick specific examples that show the duties the kit lists.
2. **Addressed criteria.** One response per criterion, under the criterion's text verbatim, often with a per-criterion word limit.
3. **Targeted questions.** Two or three form questions with character caps. Use the "hard character limits" method in `08-application-forms.md`.

Rules:
- Build each claim in STAR (`07-interview-prep.md` § STAR Format), with the weight on Action and Result.
- Use one or two of the strongest examples per criterion, not a list ([APSC: Cracking the Code](https://www.apsc.gov.au/working-aps/joining-aps/cracking-code/3-applying-aps-job-cracking-code)).
- Pitch at the advertised level. For APS roles, choose examples that show the scope the [Work Level Standards](https://legacy.apsc.gov.au/work-level-standards-aps-level-and-executive-level-classifications) describe for that classification, and never claim scope the profile doesn't support.
- Mirror the kit's wording in each response's opening sentence; panels often score against it.
- A criterion the profile genuinely can't meet gets a short, honest transferable-skills answer, or a note flagging the gap to the user. Never invent an example.
- Grounding and output follow `08-application-forms.md` unchanged. In addition, state each criterion's word count against its limit, and add a `NOTE TO SELF` mapping each example to the interview questions it invites.

APS postings almost always carry a citizenship condition and often a clearance, so run § Eligibility first.

## CV conventions

- **Leave out** the photo, date of birth or age, marital status, gender, nationality, religion and health. Australian recruiters expect them absent, because anti-discrimination law makes them irrelevant to selection.
- **Work rights:** add one line under contact details ("Australian citizen", "Permanent resident", "Full working rights") only when it helps. Don't volunteer a restricted visa; § Eligibility decides whether to apply at all.
- **Length:** 2–3 pages is normal. `CV pages:` in CLAUDE.md sets it.
- **Referees:** in an Australian-English CV, title the References section "Referees".
- **Spelling:** Australian English (organise, analyse, licence as a noun). "Program" is standard, including in government usage.
- "Resume" and "CV" are interchangeable here, so mirror the posting's word in the cover letter.
