# sa-transcript-tasks (Claude Code plugin marketplace)

Turn meeting transcripts into a plain-markdown summary and confirmed Asana tasks,
right inside Claude Code. Account-agnostic: you configure your own accounts,
teammates, and Asana projects.

## Install

1. Add this marketplace (replace the URL with wherever this repo lives):

   ```
   /plugin marketplace add <git-url-or-path>
   ```

2. Install the plugin:

   ```
   /plugin install sa-transcript-tasks
   ```

3. Run the one-time setup wizard (it writes `~/.claude/asana-config.json`):

   ```bash
   python3 ~/.claude/plugins/cache/sa-transcript-tasks/sa-transcript-tasks/*/skills/transcript-to-tasks/resources/setup.py
   ```

   (The exact cache path is printed after install; the wizard is also documented
   in the plugin's own README.)

## What you need before setup

- **An Asana Personal Access Token (PAT)** — from https://app.asana.com/0/my-apps,
  "Create new token". It is *your* credential: it is stored locally in
  `~/.claude/asana-config.json`, never shared or committed.
- **Your Asana project GIDs** — the number in a project's URL
  (`https://app.asana.com/0/<GID>/list`).
- **Teammate GIDs** (optional) — for people whose action items you track. Mark
  anyone without an Asana account as `track_only`; their tasks are assigned to
  you and the name is prefixed `[Name]` so they stay attributable.
- **Python 3** on your machine.
- A transcript source — a recorder like MacWhisper, or just paste meeting notes.

## Usage

```
/transcript-to-tasks
```

or paste meeting notes and say "make Asana tasks from this". The skill produces a
summary, shows a numbered confirmation table, and only creates tasks after you
approve. Later, `sync_tasks.py` reconciles Asana completion state back into your
notes.

Full detail — every config key, the setup wizard walk-through, and sync usage —
is in [`plugins/sa-transcript-tasks/README.md`](plugins/sa-transcript-tasks/README.md)
and `config_schema.md` alongside it.
