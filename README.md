# Client Project Requirement Form

A single-file, client-side project requirement intake form. Clients fill in their
business/project details, review an auto-generated summary, and send it as an email —
no backend, database, or build step required.

## What it does

- Walks the client through business info, project type, goals, pages/features,
  localization, marketing, compliance, handover, and a signed declaration.
- Generates a structured plain-text summary from the answers.
- Sends the summary via the client's own email app (`mailto:`) to the address configured
  in `REPORT_EMAIL`.

## Running it

Just open `index.html` in a browser, or serve the folder with any static file host
(e.g. `python3 -m http.server`, Cloudflare Pages, Netlify, GitHub Pages). There is no
server, API, or dependency to install.

## Configuration

One constant in `index.html` controls where completed reports are sent:

```js
// index.html, near line 1359
const REPORT_EMAIL = "sa.sumel91@gmail.com";
```

Change it to redirect the "Send report by email" button to a different address.

## Data & privacy

- **No server.** All logic runs in the browser; nothing is transmitted anywhere except
  the email the client explicitly sends via their own email client.
- **Draft autosave.** As the client types, answers are saved to `localStorage`
  (`intake_draft_v1`) in their own browser, debounced and flushed on blur/tab-hide/unload.
  This is private to that browser and is never bundled with or shipped as part of the app.
- **Blank by default.** Every field starts empty on a fresh visit. If a saved draft exists
  in that browser, it's restored automatically; otherwise the form is completely blank.
- **Reset Form** button clears every field, deletes the saved draft from `localStorage`,
  and reloads to the original blank state.
- The "Signed date" field is stamped with the current date only when the client presses
  **Generate summary** (i.e. at the moment they "sign") — it is not persisted across visits
  and is blank again on reload/reset.

## File structure

```
index.html   the entire application (markup, styles, and vanilla JS)
README.md    this file
CLAUDE.md    notes for AI-assisted development on this repo
```
