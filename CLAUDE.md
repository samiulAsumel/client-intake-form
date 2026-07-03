# CLAUDE.md

Project-specific guidance for working on this repo. This is a single, self-contained
HTML file — no framework, no build step, no backend.

## Architecture

`index.html` contains everything: markup, CSS (in a `<style>` block), and vanilla JS
(in a `<script>` block at the bottom). Read it top-to-bottom; there is no other source
to cross-reference.

Key regions inside the `<script>` block:
- `REPORT_EMAIL` — the only config constant; destination for the "Send report by email"
  button (`mailto:`).
- `REF_NO` — generated reference number, display-only (`textContent`), not a form field.
- `RECO` / `bizTypeSelect` change handler — business-type-driven placeholder text and
  suggested-checkbox logic. This is intentional product behavior, not a form default —
  it only fires on user selection, and a restored draft's checkbox states always override it.
- `collectData()` — builds the structured object used for the summary text.
- `generateBtn` click handler — validates required fields, runs `qualityCheck()`, then
  builds and displays the summary.
- Draft system (`saveDraft` / `restoreDraft` / `clearDraft`, near the bottom) —
  `localStorage`-based autosave under key `intake_draft_v1`.

## Invariant: blank on load, localStorage-only persistence

This form must always start **completely empty** on a first visit — no hardcoded
`value=`, `checked`, or `selected` defaults on any field, and no JS that pre-fills a
field before the user or their saved draft does. Do not reintroduce this.

- The only exception is the "Signed date" field, which is stamped with the current date
  inside the `generateBtn` handler (at generate/"sign" time), not on page load. It is
  deliberately excluded from `saveDraft`/`restoreDraft` so it's always blank until the
  client generates a summary.
- If you add a new field, it must default to empty and be picked up automatically by
  `saveDraft`/`restoreDraft` (they iterate `#mainForm input, select, textarea` generically —
  no per-field wiring needed unless the field needs special handling like `signDate`).
- The **Reset Form** button must always fully return the form to this same blank,
  storage-cleared state.

## No backend

Earlier versions of this project included a Cloudflare Worker (`worker.js`) and admin
dashboard (`dashboard.html`) that stored submissions to a private GitHub repo. These were
removed because `index.html` sends reports via `mailto:` only and never called that Worker
API — keeping unused backend code around would have been misleading. If a backend intake
system is wanted again, it should be designed fresh against the current `mailto`-based flow
rather than resurrecting the old Worker/dashboard pair.

## When editing

- Preserve all existing business logic, validation, quality checks, and summary generation
  — this file's scope is intentionally narrow (init/persistence/reset), not a rewrite target.
- Keep everything in the one `index.html` file unless the user explicitly asks to split it
  up; there is no build pipeline to support multi-file assembly.
