# Google Slides export

Turn a deck in `<project>/slides/<id>/` into an **editable, native Google Slides deck** in My Drive under
`open-slide/`. Re-running for the same deck **updates the same file in place**, so the Slides URL stays stable
across iterations. Assumes the deck already builds and renders (SKILL.md Steps 3-4). `<skill-dir>` is the
open-slide skill's base directory.

## Why the pad step exists (do not skip it)

open-slide's "Export as PPTX" sizes every text box to the exact width the browser measured and marks it `wrap="none"`. PowerPoint honours that. **Google Slides' importer ignores `wrap="none"`** and wraps at the box edge, and its DM Sans metrics run a few percent wider, so titles, bullets, and even "3 / 3" page numbers break one word early and overlap the next line. `scripts/pad_nowrap_boxes.py` widens those boxes (default ×1.15 + 8pt, alignment-aware, clamped to the slide). That is a no-op in PowerPoint because the text never wraps there.

Known, unfixable: Slides has no letter-spacing, so uppercase eyebrow labels lose their tracking. Everything else (DM Sans / DM Mono, colors, shapes, logos) survives.

## Workflow

```
Google Slides Progress:
- [ ] G1: Dev server up, export PPTX from the editor
- [ ] G2: Pad no-wrap text boxes
- [ ] G3: Upload / update as Google Slides in My Drive/open-slide
- [ ] G4: Validate (structure + thumbnails) and look at every slide
- [ ] G5: Deliver the link
```

### G1: Export the PPTX
There is no CLI export (`open-slide` only has dev/build/preview/sync:skills); it runs in the browser.
1. Start the dev server if it isn't running (`cd <project> && npm run dev`, background) and read the port from `node_modules/.open-slide/server.json`.
2. `touch /tmp/os-export-marker-<id>` so the new download can be found.
3. Chrome DevTools MCP: `new_page` / `navigate_page` to `http://localhost:<port>/s/<id>`, `take_snapshot`, click the **Download** button, then click the menu item by text (the menu re-renders, so use `evaluate_script`):
   ```js
   () => { const i = [...document.querySelectorAll('[role="menuitem"]')].find(e => e.textContent.trim() === 'Export as PPTX'); if (!i) return 'missing'; i.click(); return 'clicked'; }
   ```
   Pick **Export as PPTX** (editable), never "Export as image PPTX" for this flow.
4. Wait for the file: newest `~/Downloads/*.pptx` newer than the marker, with no `*.crdownload` left. Chrome appends ` (1)`, ` (2)` to repeat downloads, so always resolve the path this way rather than guessing the name. Use `find` rather than a bare glob, which errors under zsh when nothing matches:
   ```bash
   find ~/Downloads -maxdepth 1 -name '*.crdownload' | grep -q . || find ~/Downloads -maxdepth 1 -name '*.pptx' -newer /tmp/os-export-marker-<id> -print0 | xargs -0 ls -t | head -1
   ```

### G2: Pad
```bash
python3 <skill-dir>/scripts/pad_nowrap_boxes.py "<downloaded.pptx>" /tmp/<id>.gslides.pptx
```
Expect `padded N wrap="none" text boxes`, with N > 0. N = 0 means the export wasn't the editable PPTX (image PPTX has no text boxes); go back to G1.

### G3: Upload or update
If auth state is unknown, run the `fe-google-tools:google-auth` skill first and follow its routing for a Drive upload. This needs its CLI path; its MCP path can't upload. Then:
```bash
python3 <skill-dir>/scripts/pptx_to_gslides.py --file /tmp/<id>.gslides.pptx --name "<Deck title>" [--folder open-slide[/Subfolder]]
```
- Finds or creates the `open-slide` folder in My Drive root (nested paths like `open-slide/QBRs` create each missing level), converts the PPTX to a native Slides deck (`application/vnd.google-apps.presentation`).
- **Update key = deck name inside that folder.** If a Slides file with that name exists there, it's re-converted in place (`files.update`, same ID and URL); otherwise a new one is created. Use the deck's `meta.title` as the name so re-runs hit the same file. Output JSON has `action: created|updated`, `id`, `webViewLink`.
- Never add sharing permissions unless asked (fe-google-tools sharing policy: specific people, reader/commenter, never "anyone with the link").

### G4: Validate
```bash
python3 <skill-dir>/scripts/validate_gslides.py --id <id> --thumbs /tmp/<id>-gslides-<n>
```
Gate on all of:
- Slide count matches the open-slide deck.
- Every slide has `text_runs > 0` (real editable text, not one flattened picture) and `fonts` lists `DM Sans` (plus `DM Mono` where the deck uses it).
- **Look at every thumbnail** (`Read` each `slide-N.png`; stacking them with PIL into one image is fine). Fail on: lines breaking a word early and overlapping, text spilling out of cards, "N / M" footers splitting. If you see wrapping, re-run G2 with a larger `--scale` (e.g. 1.25) and G3 again (it updates in place).
Use a fresh `--thumbs` directory per run; the sandbox blocks `rm -rf` in `/tmp`.

### G5: Deliver
Give the user the Slides link, the folder (`My Drive/open-slide`), whether it was created or updated, and the one known gap (eyebrow letter-spacing). Stop the dev server if you started it (`pkill -f "open-slide dev"`).

## Scripts
- `scripts/pad_nowrap_boxes.py`: widen `wrap="none"` text boxes in the PPTX (stdlib only).
- `scripts/pptx_to_gslides.py`: find/create the My Drive folder, upload-convert or update in place.
- `scripts/validate_gslides.py`: Slides API structure check per slide + LARGE thumbnails.

Both Google scripts locate fe-google-tools' `google_auth.py` themselves and send the `gcp-dev-field-eng-aiapiquota` quota-project header.
