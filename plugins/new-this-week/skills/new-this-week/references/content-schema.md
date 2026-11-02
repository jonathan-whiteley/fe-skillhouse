# Content JSON schema (input to scripts/make_deck.py)

A complete, valid example: `references/example-content.json` (fictional customer). Copy its shape.

| Field | Required | Notes |
|---|---|---|
| `customer` | yes | Display name; also used in the output filename and "For <customer>:" labels |
| `as_of` | yes | `YYYY-MM-DD`; used in filename and footer |
| `window_label` | no | Shown next to the title; defaults to "as of <as_of>" |
| `kicker` | no | Small label above the title; defaults to "New This Week". Match it to the window |
| `subtitle` | no | One line naming the customer's 2-3 initiatives |
| `pillars` | yes | Exactly three, in this order: `Genie & BI`, `Data Eng & Platform/Governance`, `Data Science & AI` |
| `items[].status` | yes | `GA`, `Public Preview`, `Beta`, or `New` (badge color keys off this) |
| `items[].url` | yes | Public docs/blog URL; never Slack or internal links |
| `items[].headline` | no | At most one `true` across the whole slide (navy feature card) |
| `items[].title`, `what`, `why` | yes | See `curation.md` "Writing" |
| `items[].date` | no | Short form, e.g. `Oct 6` |

`make_deck.py` rejects: a pillar list that isn't exactly those three names in order; more than one
headline; a status other than the four allowed; a non-https or internal URL (Slack, Glean, Google Docs/Drive,
Salesforce, Atlassian, `*.databricksapps.com`, `*.cloud.databricks.com` unless it contains `<your-workspace>`);
any em or en dash anywhere. It warns on more than 4 items in a pillar or a total outside 7-11.
With `--forbid`, it also refuses (exit 2) when a forbidden term appears in any slide text or link URL.

## Optional `spotlights` (one extra slide each)

```json
"spotlights": [{
  "title": "<Feature name>", "status": "Beta", "date": "Oct 8",
  "url": "https://docs.databricks.com/aws/en/ai-gateway/coding-agent-configure-govern",
  "tagline": "One line under the title",
  "value": "Two-sentence value statement for the navy panel.",
  "for_customer": ["**Lead-in:** customer-specific point", "..."],
  "steps": [
    {"title": "Edit and publish", "body": "..."},
    {"title": "Deploy to your team", "body": "...", "code": [{"label": "Install", "cmd": "uv tool install ..."}]},
    {"title": "Launch", "body": "..."}
  ],
  "controls": ["**Agents:** ...", "..."],
  "observe": ["**Tracing:** ...", "..."],
  "links": [{"label": "Setup guide", "url": "https://..."}]
}]
```

List items accept `**bold**` lead-ins. Keep 3 steps, 4-6 bullets per card; the deck auto-fits type per slide.
