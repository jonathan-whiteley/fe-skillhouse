# open-slide workspace (Databricks theme)

Slides as React components. Each deck lives under `slides/<id>/index.tsx` and default-exports an array of
page components. The `@open-slide/core` runtime handles layout, scaling, navigation, thumbnails, present mode
and export (HTML, PDF, editable PPTX).

Set up by the `dbx-open-slide` Claude Code plugin. Ask Claude for an "open-slide deck" and it authors,
verifies and exports decks here.

```bash
npm install
npm run dev      # gallery at the printed URL; editor at /s/<deck-id>
```

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static bundle |
| `npm run preview` | Preview the built bundle |
| `npm run sync:skills` | Refresh open-slide's authoring skills in `.agents/skills/` |

- **Theme:** `themes/databricks.md` (Oat/Navy light, Deep-ink dark, Lava accent, DM Sans / DM Mono).
- **Starter decks:** `hello-world-dark`, `databricks-core`, `databricks-data`, `databricks-architecture`,
  `databricks-narrative`, `getting-started`.
- **Brand assets:** `assets/brand/` is downloaded at setup from an internal (databricks.com-only) Drive file and
  is gitignored. Keep it out of any public repository.
- **Fonts:** `assets/fonts/` has DM Sans and DM Mono under the SIL Open Font License (see the `OFL-*.txt` files).
  Install them locally if you present exported PPTX files in PowerPoint or Keynote.
