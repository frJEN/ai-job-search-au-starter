<p align="center">
  <img src="assets/mascot/pip_flight_loop.gif" alt="Pip, the courier bird" width="200">
</p>

# AI Job Search — Australia Starter

*The job search that runs on your machine, tuned for the Australian market.*

**Read this in:** [English (full)](README.md) · Plain-English beginner guide (this page) · [中文](README.zh.md)

> If this project is useful to you, a ⭐ star on GitHub helps others find it — and if you'd like to support development directly, that's always appreciated too: [Buy Me a Coffee](https://buymeacoffee.com/frJEN) · [爱发电 Afdian](https://afdian.com/a/frJEN). Totally optional either way — enjoy the tool.

> Note: independent open-source project, not affiliated with Anthropic. No cryptocurrency, no token, no paid sponsorship program — anything claiming otherwise is a scam.

---

This page assumes you've never used a terminal or coding tool before. No experience needed — just follow the steps in order.

## What is this, in plain words?

It's an AI assistant that lives on your computer and helps you job-hunt. You tell it about yourself once. After that, it can:

- Search job sites for postings that match you
- Read the job alert emails you already get, so you don't have to
- Check whether a job is actually a good fit before you spend time on it
- Write you a tailored CV and cover letter for a specific job
- Keep track of what you've applied to and what happened

**It never clicks "Submit" for you.** It prepares everything, you review it, you send it. You stay in control the whole time.

## What you need before starting

- A Mac or Windows computer
- A Gmail account (free — sign up at [gmail.com](https://gmail.com) if you don't have one). This is the inbox your job alerts will land in, and the assistant will read it (with your permission) to check for new postings and application updates.
- About 15–20 minutes for one-time setup
- No coding knowledge required

## One-time setup

Do these steps once, in order. Whenever a step says "type this," you're typing it into the black terminal window that Claude Code opens — treat it like chatting with a helpful assistant, not writing code.

**1. Download the toolkit**

Go to [github.com/frJEN/ai-job-search-au-starter](https://github.com/frJEN/ai-job-search-au-starter), click the green **Code** button, choose **Download ZIP**, then unzip it somewhere easy to find (like your Desktop).

**2. Install Claude Code**

This is the assistant itself. Follow the [install guide](https://docs.anthropic.com/en/docs/claude-code/getting-started) for your computer. You'll need a Claude subscription (Pro or Max) — think of it like a Netflix subscription, not a one-off purchase.

**3. Open the folder and start Claude Code**

Open your terminal app (search "Terminal" on Mac, or use the one the Claude Code installer sets up on Windows), and copy-paste this, replacing the path with wherever you unzipped the folder in step 1:

```bash
cd path/to/ai-job-search-au-starter
claude
```

If you're not sure of the exact path, just say so once Claude Code starts — it can help you find it.

**4. Let it finish setting itself up**

Once Claude Code is running, type:

> Please check whether Bun and a LaTeX distribution are installed, and install whatever's missing.

It will explain each thing it wants to install and ask your permission before doing it. Just say yes.

**5. Connect your Gmail**

Go to [claude.ai](https://claude.ai) → **Settings → Connectors**, and connect the Gmail account from the "what you need" section above. This is the account you'll register with job sites too — keeping everything on one email is what lets the assistant read your job alerts safely.

**6. Tell it about yourself**

Back in the terminal, type:

```
/setup
```

It will ask you questions about your background, skills, and what kind of job you want — just answer naturally, like a conversation. This is the easiest path if you don't have documents ready.

**7. (Optional but recommended) Let it set up job alerts for you**

```
/platform-sync
```

This logs into job sites like LinkedIn/Seek/Indeed *in your own browser, as you* and sets up job alerts pointed at the Gmail address from step 5. It will explain and ask for your OK before each real action — read what it tells you before approving. If you'd rather do this by hand, it also gives you a manual, step-by-step alternative.

Setup is done. 🎉

## What you'll actually run, day to day

Once set up, you don't need to repeat any of the above. Just run these commands whenever you feel like job hunting:

| Command | What it does | How often |
|---|---|---|
| `/scrape` | Looks for new job postings across job sites and your inbox | Every few days, or whenever you're checking in |
| `/rank` | Sorts what `/scrape` found into a shortlist, best fit first | Right after `/scrape`, before you pick what to apply to |
| `/apply <paste a job link or the job text>` | Checks if it's a good fit, then drafts you a tailored CV and cover letter to review | Whenever a job catches your eye |
| `/interview` | Preps talking points and likely questions for a specific interview, using the exact posting and CV it saw | Once you've got an interview scheduled |
| `/outcome` | Tell it what happened (interview, rejection, offer) so it keeps your tracker up to date | After you hear back from a company |
| `/gmail-sync` | Reads your inbox for status updates (interview, offer, rejection) and proposes the same tracker update as `/outcome` — for you to approve, never written without your OK | Whenever you'd rather it check your inbox than type the update yourself |
| `/html-report` | Turns your tracker into a simple offline dashboard you can open in a browser | Whenever you want a visual overview of everything you've applied to |

That's genuinely most of it — a handful of other commands exist for more advanced use, see the [full README](README.md) if you want to go further.

## Good to know

- **Outlook / Hotmail email support is still being built** and may be added in a future update — right now, this only fully works with Gmail.
- You are always the one who clicks the final "Submit application" button — nothing here applies on your behalf.
- There's no cryptocurrency, token, or paid sponsorship tied to this project. If anyone claims otherwise, it's a scam.

## If you get stuck

Just tell Claude Code what's going wrong, in plain language, inside the terminal — it can usually fix or explain the problem itself. For more detail on any step, see [SETUP.md](SETUP.md) or the [full README](README.md).
