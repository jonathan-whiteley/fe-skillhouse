# dbx-open-slide

Databricks-branded slide decks written as React components with [open-slide](https://www.npmjs.com/package/@open-slide/core).

## Install

**Claude Code** (inside a session):

```
/plugin install dbx-open-slide --marketplace jonathan-whiteley/fe-skillhouse
```

On Claude Code older than 2.1.275, add the marketplace first:
`/plugin marketplace add https://github.com/jonathan-whiteley/fe-skillhouse`, then
`/plugin install dbx-open-slide@fe-skillhouse`.

**Isaac (local CLI):** `isaac plugin add` only covers the internal marketplace, so use the `claude` CLI and then
restart Isaac:

```bash
claude plugin marketplace add jonathan-whiteley/fe-skillhouse
claude plugin install dbx-open-slide@fe-skillhouse
```

Isaac Web (cloud) sessions can't load it: they only take internal-marketplace plugins, and the skill needs a local
Node, Chrome and dev server.

## Use it

1. Run `/dbx-open-slide:dbx-open-slide` (or just ask for "an open-slide deck") and describe it, for example:
   "3-slide Genie One deck for a retail exec, light mode, with an architecture slide and a rollout plan."
2. The first run asks where to put your project, sets it up, and downloads the brand pack.
3. View or present: Claude starts the dev server and gives you `http://localhost:5173/s/<deck-id>`. Present mode
   shows the speaker notes.
4. Export: ask for "PDF", "editable PPTX", or "put it in Google Slides".

One skill, `dbx-open-slide`:

| Say | Does |
|---|---|
| "make an open-slide deck on …" | First run: sets up your project (asks where). Then drafts the deck with the Databricks theme, builds it, screenshots every slide to check it renders on-brand, and exports HTML / PDF / editable PPTX on request. |
| "put this deck in Google Slides" | Exports editable PPTX, fixes Google Slides' text re-wrapping, uploads to `My Drive/open-slide` (updates in place on re-runs) and checks every slide's thumbnail. |

## Requirements

- Node.js 22+ and npm (22+ for the headless PDF export; the Databricks npm proxy works, the project pins versions it serves)
- Python 3
- The **fe-google-tools** plugin from vibe, signed in with your databricks.com account (`/google-auth`). It's used to
  download the brand pack and for the Google Slides upload.
- Chrome DevTools MCP for the screenshot check and browser export (comes with vibe)

## Brand assets

This repo is public, so it contains no Databricks logos or product icons. Setup downloads them (367 SVGs) from a
Drive file shared with databricks.com only, into your project's `assets/brand/`, which is gitignored. Don't commit
that folder to a public repository.
