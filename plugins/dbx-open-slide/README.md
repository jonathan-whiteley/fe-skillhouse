# dbx-open-slide

Databricks-branded slide decks written as React components with [open-slide](https://www.npmjs.com/package/@open-slide/core).

```
/plugin install dbx-open-slide --marketplace jonathan-whiteley/fe-skillhouse
```

| Skill | Say | Does |
|---|---|---|
| `open-slide` | "make an open-slide deck on …" | First run: sets up your project (asks where). Then drafts the deck with the Databricks theme, builds it, screenshots every slide to check it renders on-brand, and exports HTML / PDF / editable PPTX on request. |
| `open-slide-gslides` | "put this deck in Google Slides" | Exports editable PPTX, fixes Google Slides' text re-wrapping, uploads to `My Drive/open-slide` (updates in place on re-runs) and checks every slide's thumbnail. |

## Requirements

- Node.js 20+ and npm (the Databricks npm proxy works; the project pins versions it serves)
- Python 3
- The **fe-google-tools** plugin from vibe, signed in with your databricks.com account (`/google-auth`). It's used to
  download the brand pack and for the Google Slides upload.
- Chrome DevTools MCP for the screenshot check and browser export (comes with vibe)

## Brand assets

This repo is public, so it contains no Databricks logos or product icons. Setup downloads them (367 SVGs) from a
Drive file shared with databricks.com only, into your project's `assets/brand/`, which is gitignored. Don't commit
that folder to a public repository.
