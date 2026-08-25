# fe-skillhouse

A Claude Code plugin marketplace: Jonathan Whiteley's collection of plugins for
Field Engineering workflows. Add the marketplace once, then install whichever
plugins you want from it.

## Add the marketplace

In Claude Code (works anonymously over HTTPS, no GitHub account needed):

```
/plugin marketplace add https://github.com/jonathan-whiteley/fe-skillhouse
```

Then install any plugin listed below.

## Plugins

### sa-transcript-tasks

Turn meeting transcripts into a plain-markdown summary and confirmed Asana tasks.
Account-agnostic: configure your own accounts, teammates, and Asana projects.

```
/plugin install sa-transcript-tasks
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

_More plugins will be added here over time._

## Prerequisites

- `git` installed (Claude Code shells out to it to fetch the marketplace)
- Python 3 (the plugins' resource scripts run on it)
