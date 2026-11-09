# fe-skillhouse

A Claude Code plugin marketplace: Jonathan Whiteley's collection of plugins for
Field Engineering workflows. Add the marketplace once, then install whichever
plugins you want from it.

## Install

The repo is public, so this works over HTTPS with no GitHub account or invite.

### Claude Code

Inside Claude Code, add the marketplace once, then install the plugins you want:

```
/plugin marketplace add https://github.com/jonathan-whiteley/fe-skillhouse
/plugin install dbx-open-slide@fe-skillhouse
```

Or from a terminal:

```bash
claude plugin marketplace add jonathan-whiteley/fe-skillhouse
claude plugin install dbx-open-slide@fe-skillhouse
```

Restart Claude Code after installing. Skills show up as `<plugin>:<skill>`, for example
`/dbx-open-slide:dbx-open-slide`.

### Isaac (local CLI)

`isaac plugin add` only knows the internal `@experimental` and `@production` tiers, so add this
marketplace with the `claude` CLI that Isaac runs on, then restart your Isaac session:

```bash
claude plugin marketplace add jonathan-whiteley/fe-skillhouse
claude plugin install dbx-open-slide@fe-skillhouse
```

Isaac Web (cloud) sessions only load plugins from the internal plugin marketplace, so use these
plugins in a local Claude Code or Isaac session. `dbx-open-slide` also needs a local Node, Chrome
and dev server.

### Updating

```bash
claude plugin marketplace update fe-skillhouse
claude plugin update dbx-open-slide@fe-skillhouse
```

Swap in `sa-transcript-tasks` or `new-this-week` for any of the plugins below.

## Plugins

### sa-transcript-tasks

Turn meeting transcripts into a plain-markdown summary and confirmed Asana tasks.
Account-agnostic: configure your own accounts, teammates, and Asana projects.

```
/plugin install sa-transcript-tasks@fe-skillhouse
```

Then run the one-time setup wizard (it writes `~/.claude/asana-config.json`):

```bash
python3 ~/.claude/plugins/cache/sa-transcript-tasks/sa-transcript-tasks/*/skills/transcript-to-tasks/resources/setup.py
```

(The exact cache path is printed after install.) You will need your own Asana
Personal Access Token (from https://app.asana.com/0/my-apps) and your Asana
project GIDs; the wizard walks you through the rest. Full config reference:
[`plugins/sa-transcript-tasks/README.md`](plugins/sa-transcript-tasks/README.md)
and `config_schema.md` alongside it.

Usage: run `/transcript-to-tasks`, or paste meeting notes and say "make Asana
tasks from this." The skill produces a summary, shows a numbered confirmation
table, and only creates tasks after you approve.

### dbx-open-slide

On-brand Databricks slide decks written as React code with open-slide, which stay editable after the AI is done.
Most AI-generated decks are fixed HTML, so every typo fix or moved text box is another LLM call. Here you edit
text, move and resize boxes, and change formatting yourself in the open-slide editor, with no LLM call. Export to
editable PPTX or native Google Slides and teammates can keep editing, or you can blend the AI slides with existing
corporate decks.

First use sets up a local project (theme, fonts, starter decks; logos and product icons are downloaded from an
internal Drive file). Then Claude authors decks, screenshots them to check the render, and exports to HTML, PDF,
editable PPTX or native Google Slides.

```
/plugin install dbx-open-slide@fe-skillhouse
```

Needs Node 22+, Python 3, Google Chrome, and the vibe `fe-google-tools` plugin signed in with your
databricks.com account. Usage: "make an open-slide deck on our Lakebase launch, dark mode", then "put it in
Google Slides". Details: [`plugins/dbx-open-slide/README.md`](plugins/dbx-open-slide/README.md).

### new-this-week

A customer-facing one-slider of the most meaningful recent Databricks releases for one customer: three pillars,
7-11 items, each tied to what that customer is working on. It reads the public release notes and blog, shows you
the shortlist to approve, then builds the slide with `dbx-open-slide` and exports a PDF with live links (or Google
Slides).

```
/plugin install new-this-week@fe-skillhouse
```

Needs the `dbx-open-slide` plugin and Google Chrome. Usage: "new this week for Northwind Retail, last 14 days".
Details: [`plugins/new-this-week/README.md`](plugins/new-this-week/README.md).

_More plugins will be added here over time._

## Prerequisites

- `git` installed (Claude Code shells out to it to fetch the marketplace)
- Python 3 (the plugins' resource scripts run on it)
