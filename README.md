# Client Project Requirement Form

An 18-section project requirement intake form for freelance and contract work. A client fills in
their business and project details, reviews an auto-generated summary, and submits it. A small
serverless backend stores each submission, and a password-protected admin dashboard tracks every
lead from first contact to a decision.

**Live:** [clif91.pages.dev](https://clif91.pages.dev)

## What it does

- Walks the client through business info, project type, goals, pages/features, localization,
  marketing, compliance, handover, and a typed-name declaration. The first answer ("what are you
  building?") decides which later sections appear.
- Generates a structured plain-text summary from the answers.
- Submits the summary to `/api/submit`. If that call fails, it falls back to opening the client's own
  email app (`mailto:`) with the summary ready to send.
- Autosaves a draft in the client's browser so a closed tab does not lose the work.

## Architecture

| Piece | What it is |
|---|---|
| `index.html` | The whole client-side app: markup, styles and vanilla JS in one dependency-free file |
| `functions/api/submit.js` | Validates the reference format (`REQ-YYYYMMDD-NNNNNN`), silently drops honeypot spam, stamps the time, and writes the submission as a JSON file through the GitHub Contents API |
| `functions/api/login.js` | Admin login: verifies the password against a PBKDF2-SHA-256 hash and returns an HMAC-signed token that expires after 12 hours |
| `functions/api/list.js`, `item.js`, `status.js` | Admin-only: list submissions, read one, and set its status (`New`, `Contacted`, `Quoted`, `Negotiating`, `Won`, `Lost`). All return 401 without a valid token |
| `admin.html` | The admin dashboard |

Deployed on Cloudflare Pages: the static files plus Pages Functions.

## Configuration

Set these as Cloudflare Pages environment variables/secrets. None belong in the repository.

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Token with Contents read/write on the storage repository |
| `GITHUB_OWNER`, `GITHUB_REPO` | Where submissions are stored as `submissions/<ref>.json` |
| `GITHUB_BRANCH` | Optional, defaults to `main` |
| `ADMIN_HASH` | Admin password hash, format `iterations$saltHex$hashHex` (PBKDF2-SHA-256) |
| `SESSION_SECRET` | Secret used to sign admin tokens |
| `CALLMEBOT_PHONE`, `CALLMEBOT_APIKEY` | Optional: send a WhatsApp alert on each new submission |

The email fallback address is the `REPORT_EMAIL` constant in `index.html`.

> **Use a private repository for `GITHUB_REPO`.** Submissions contain a client's business and contact
> details. Pointing `GITHUB_REPO` at this public repository would publish them. The two files
> currently in `submissions/` are test data (a connectivity check and a sample brief).

## Data & privacy

- The client form is blank on a fresh visit. A draft is saved to `localStorage` (`intake_draft_v1`)
  in that browser only, and cleared after a successful submit or on **Reset Form**.
- The "Signed date" field is stamped only when the client presses **Generate summary**.
- Submissions are sent to the API only when the client presses the send button.

## Running locally

Open `index.html` in a browser to try the form. The submit and admin endpoints need Cloudflare Pages
Functions (for example `wrangler pages dev`) and the variables above.

## Status

Working and in use. There is no automated test suite yet.
