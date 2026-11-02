---
name: new-this-week
description: Builds a customer-facing "New This Week" slide of the most meaningful recent Databricks product releases for one customer, grouped into three pillars (Genie & BI; Data Eng & Platform/Governance; Data Science & AI) and tied to the customer's initiatives, as an on-brand open-slide deck exported to PDF or Google Slides. Use when the user says "new this week", "new-this-week", "what's new for <customer>", "product updates for <customer>", "weekly product highlights", "release roundup for <account>", or "what's new one-slider".
---

# New This Week

Build a 16:9 slide of the most meaningful Databricks product updates from a recent window, filtered and
framed for one customer. Reference look: the field "Weekly Product Highlights" slide (white pillar columns,
status badges, dated one-liners, one navy headline card), but **customer-facing**: public links only, no
field ammo, no confidential footer. The slide is generated into the user's open-slide project and exported
with the **dbx-open-slide** skill.

`<skill-dir>` is this skill's base directory (shown when it loads).

```
New This Week Progress:
- [ ] Step 0: dbx-open-slide available
- [ ] Step 1: Brief (customer, window, cloud, context, what stays off the slide)
- [ ] Step 2: Relevance anchors
- [ ] Step 3: Gather candidate releases
- [ ] Step 4: Curate, then STOP for review
- [ ] Step 5: Generate the deck
- [ ] Step 6: Verify (build, screenshot, fit)
- [ ] Step 7: Export and deliver
```

## Step 0: dbx-open-slide available
This skill needs the `dbx-open-slide` skill (from the `dbx-open-slide` plugin) for the project, build,
screenshots and Google Slides export. If it isn't in your available skills, stop and tell the user to run
`/plugin install dbx-open-slide --marketplace jonathan-whiteley/fe-skillhouse` and restart.

## Step 1: Brief
Take what the user already said; ask only for the rest, in one `AskUserQuestion` call:
1. **Customer**: the display name, exactly as it should appear on the slide.
2. **Window**: Last 7 days (Recommended) / Last 14 days / Last 30 days / Since a date.
3. **Cloud**: AWS / Azure / GCP / Not sure (then default to AWS and say so on the checkpoint).
4. **Context**: what the customer is working on. Options: "I'll describe it" (one or two sentences),
   "Pull their active use cases from Salesforce" (only if the `fe-salesforce-tools` plugin is installed), or
   "Paste notes / a doc link".

Then **always** ask, in plain text (it's free-form): *"Anything that must stay off the slide? Internal codenames,
use-case codes, project names, or products to leave out entirely."* Record two lists: **excluded products** (dropped
before curation) and **forbidden terms** (codenames etc.; the leak check in Step 5 refuses the deck if one appears).
"None" is a valid answer; don't skip the question.

## Step 2: Relevance anchors (2 minutes, not a research project)
Write down 4-8 anchors: initiatives, tools they're replacing, platforms they're on (e.g. "Power BI to Genie
migration", "store apps on Lakebase", "Azure East US 2").
- **Salesforce**: use `fe-salesforce-tools:salesforce-actions`, read-only, for the account's open use cases
  (name, stage, next steps). Use them to choose and frame items; never copy internal Salesforce wording,
  stage names, or dollar figures onto the slide.
- **Notes / doc**: read it fully first. A Google Docs link needs `fe-google-tools:google-docs`.
- **Described**: the user's sentence is the anchor set; don't go digging.

## Step 3: Gather candidate releases
The window is inclusive and ends today: "last 14 days" on Oct 30 means items dated Oct 17 through Oct 30.
1. **Release notes** (primary; authoritative): the official RSS feeds, one per cloud. `--clouds` takes the customer's
   cloud(s), first one primary; `--exclude` takes the products to keep off the slide (Step 1).
   ```bash
   python3 <skill-dir>/scripts/fetch_feeds.py --clouds <azure|aws|gcp>[,...] --days <N> \
     --exclude "<excluded products>" --out /tmp/new-this-week/<customer-slug>-candidates.json
   ```
   It prints the candidate count (often 50-80 for 14 days) and how many were excluded; a `FEED ERRORS` note means a
   cloud's feed failed, so read that cloud's monthly page instead
   (`https://learn.microsoft.com/en-us/azure/databricks/release-notes/product/<YYYY>/<month>` or
   `https://docs.databricks.com/<aws|gcp>/en/release-notes/product/<YYYY>/<month>`, read in full). Read the output
   JSON: every candidate has `title`, `date`, `status_hint`, `url` (the anchored release-note entry), `doc_url` (the
   feature's own page), `links` per cloud, `categories`, `text`.
2. **Databricks blog**: `https://www.databricks.com/blog` product posts in the window; page through until posts are
   older than the window. Catches launches that read better as a blog link.
3. Optional: `fe-internal-tools:glean-search` for `"Databricks announcement" <topic>` to sanity-check what the
   field considers big. Glean results are for judgment only; the slide links to public pages.

For each item you keep:
- **URL**: its `doc_url` when present, else its `url` (anchored entry), never the bare monthly page.
- **Status**: `status_hint` is a guess from the feed text (an item that merely *mentions* a Beta feature reads as
  Beta), so confirm each kept item's status on its `doc_url` page: the label there wins (GA / Public Preview /
  Beta). Use **New** only when the release note announces the feature as available with no maturity label. An item
  whose sources disagree, or that you can't place, is cut, never labeled New to fill the gap.

## Step 4: Curate (the whole point), then STOP
Apply `references/curation.md`. In short:
- Map every candidate to exactly one pillar: **Genie & BI**, **Data Eng & Platform/Governance**, **Data Science & AI**.
- Cut ticky-tacky items (UI polish, minor connector/runtime bumps, bug fixes, deprecations with no action, regional
  rollouts outside their cloud/region, Private Preview they aren't enrolled in).
- Score the rest on: tie to an anchor (strongest), platform significance, availability on their cloud.
- Keep **2-4 items per pillar, 7-11 total**. A pillar with no strong items gets its single best platform-level update.
- Mark at most **one** item `headline: true` (the biggest, most relevant release): the navy card.
- Each `why` is one concrete line naming their initiative, never generic ("improves productivity").

**Optional spotlight.** If the user names a feature that deserves its own slide, or one item clearly dominates
their agenda, add it under `spotlights`: a second page with a navy value panel, "How it works" in 3 steps (with
copyable commands where the product has them) and "What admins control" / "What you can see". Source it from the
feature's docs page; any workspace URL is the placeholder `https://<your-workspace>.cloud.databricks.com`.

**Checkpoint:** show the shortlist as a table (Pillar | Item | Status | Date | Why for <Customer>) plus a short
"cut" list with one-word reasons, the cloud assumption if you defaulted it, then **STOP** and wait for
`y / edit / swap N`. This is customer-facing content.

## Step 5: Generate the deck
1. Get the open-slide project from the **dbx-open-slide** skill's Step 1 (it finds the project, or runs its
   first-time setup). Call it `<project>`. Don't use its `create-slide` authoring flow: this deck is generated.
2. Set `kicker` from the window: "New This Week" (7 days), "What's New" (14 days or a custom range), "New This
   Month" (30 days). Write the content JSON (shape: `references/content-schema.md`; full example:
   `references/example-content.json`) to `/tmp/new-this-week/<customer-slug>.json`.
3. Generate:
   ```bash
   python3 <skill-dir>/scripts/make_deck.py /tmp/new-this-week/<customer-slug>.json --project <project> \
     --forbid "<forbidden terms>,<excluded products>"
   ```
   Exit 2 is the leak check: a forbidden term reached the slide text or a link. Rewrite the lines it lists and
   re-run. Never drop a term from `--forbid` to get past it. Pass `--forbid ""` only when the user said "none"
   It checks the copy rules and prints every problem (fix the JSON and re-run), then writes
   `<project>/slides/new-this-week-<customer>-<as_of>/index.tsx` and prints the slide id. Warnings (more than 4 items
   in a pillar, total outside 7-11) mean the curation is off; fix them too. If the deck already exists, re-run with
   `--force` only after the user confirms they want it regenerated.

## Step 6: Verify
Follow the **dbx-open-slide** skill's Steps 3-4 for this slide id: `npm run build` must pass, then the dev server
and a 1920×1080 screenshot of `/s/<slide-id>/preview?p=1` (and `p=2…` for spotlights). Also read the fit result:
```js
() => { const d = document.querySelector('.ntw')?.dataset; return { fit: d?.fit, overflow: d?.overflow }; }
```
- `overflow: "true"` or `fit` below `15` means the slide is too dense: **cut an item** (the weakest `why`), regenerate
  with `--force`, re-shoot. Never ship small or clipped type.
- Look at the screenshot: nothing clipped, no column dramatically longer than the others, one headline card at
  most, badges and dates present, DM Sans rendering.
- Keep the dev server running for Step 7.

## Step 7: Export and deliver
- **PDF (default deliverable; keeps live links):** use the dbx-open-slide skill's exporter (its Step 5), with the
  dev server still running:
  ```bash
  node <dbx-open-slide skill-dir>/scripts/export_pdf.mjs http://localhost:<port>/ <slide-id> ~/Downloads/<slide-id>.pdf
  ```
  One PDF, every page (overview plus spotlights). Its JSON must show `pages` = 1 + spotlights, `page_size_pt`
  `1440x810`, and `distinct_links` close to the item count (items sharing a URL count once).
- **Google Slides** (on request): follow the dbx-open-slide skill's `references/google-slides.md`. Tell the user
  that open-slide's PPTX export doesn't carry hyperlinks, so the Slides version has none; the PDF does.
- When handing over, say plainly if a pillar is thin because the window was quiet for that area (that's a finding,
  not a gap to pad), and list any `why` line that assumes architecture the user didn't state, so they can confirm it
  before it goes to the customer.
- Stop the dev server. Report the PDF path(s), the slide id (re-open it with `cd <project> && npm run dev`, then
  `/s/<slide-id>`), and offer (don't do) a Gmail draft to the customer via `fe-google-tools:gmail`.

## Copy rules (checked by make_deck.py, still yours to get right)
- **No em or en dashes** anywhere. Use colons, commas, parentheses.
- Every item title links to a **public** source (docs, release notes, blog). Never Slack, Glean, Google Docs,
  Salesforce, Jira/Confluence, or a real workspace URL.
- Status words exactly: GA / Public Preview / Beta / New. Status truth comes from docs/release notes; if sources
  disagree, use the docs, and drop the item if it's still unclear.
- Never fabricate a release, date, or URL. If the window is quiet, say so and offer to widen it.
- Lava (`#FF3621`) is only the kicker; the navy headline card is the only dark block.
