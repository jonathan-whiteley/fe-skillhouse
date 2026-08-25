---
name: transcript-to-tasks
description: Turn a meeting transcript into a plain-markdown summary and confirmed Asana tasks. Use when the user says "process this transcript", "make tasks from this meeting", "summarize this call", or pastes meeting notes/action items.
---

# Transcript to Tasks

Turn a meeting transcript (or pasted notes) into a plain-markdown meeting summary and a set
of confirmed Asana tasks. Account-agnostic: accounts, teammates, and Asana projects come
from `~/.claude/asana-config.json`.

## Setup

Before first use, check if `~/.claude/asana-config.json` exists. If not, run:

```bash
python3 resources/setup.py
```

It configures your Asana token, accounts (with email domains and keyword aliases for
inference), teammates (assignee map), optional dashboard/internal projects, and an optional
notes directory. See `resources/config_schema.md` for every key.

## Task Tags

| Tag | When to use |
|---|---|
| PROJECT | Building something: demos, POCs, notebooks, pipelines, migrations |
| DEMO | Preparing or delivering a demo, training, walkthrough, video |
| FOLLOW-UP | Emails to send, docs to share, questions to answer, meetings to schedule |

## Workflow

### Step 0: Summarize the transcript (optional)

If given a raw transcript (file path or pasted text), produce a plain-markdown summary:
title, date, attendees, key discussion points, decisions, and an Action Items list. If
`notes_dir` is set in config, write it to `<notes_dir>/YYYY-MM-DD <title>.md`; otherwise ask
where to save or print it inline. No frontmatter, no wikilinks: keep it portable markdown.

### Step 1: Accept input

Input is one of: a raw transcript, a just-written summary, or pasted action items.

### Step 2: Extract team action items

Extract items owned by the installing user or anyone in `assignee_map`. Infer the account
per item by matching email domains and keyword aliases from `config["accounts"]`. For each:
account, tag (PROJECT/DEMO/FOLLOW-UP), clear task text, due-date hint, and optional assignee
name (a key in `assignee_map`; omit for the installing user). Skip customer-owned items
unless the user asks to include them.

### Step 3: Resolve due dates

```bash
python3 resources/due_date.py "next Monday"
python3 resources/due_date.py "EOW"
python3 resources/due_date.py ""   # +7 days default
```

### Step 4: Show the confirmation table, then STOP

Present a numbered table (# / Account / Tag / Assignee / Task / Due). End the turn with:

`Create these tasks? (y / edit N,N / skip)`

Then STOP and WAIT. Never call `asana_client.py` in the same turn the table is shown. This
gate is mandatory: approving the workflow is not approving the specific tasks.

- `y` creates all; `edit 2,3` drops those items and creates the rest; `skip` creates none.

### Step 5: Create tasks (only after y / edit)

```bash
echo '{"tasks": [{"account":"Acme","project_type":"customer_account","tag":"DEMO","text":"...","due_date":"2026-08-25","assignee":"Alex"}]}' | python3 resources/asana_client.py
```

Use `"project_type": "internal"` for non-customer tasks.

### Step 6: Report results

Show created task names and URLs.

### Step 7: Link tasks in the summary note (optional)

If `notes_dir` is set, append the created Asana links under an `## Action Items` section in
the summary note so status can later be synced.

## Syncing status (Asana to markdown)

```bash
python3 resources/sync_tasks.py                 # dry run
python3 resources/sync_tasks.py --apply         # write changes
python3 resources/sync_tasks.py --notes-dir DIR # override scan dir
```

Scans the notes directory for lines with Asana URLs and updates checkbox state to match
Asana completion.

## Error handling

- Missing `~/.claude/asana-config.json`: run `setup.py`.
- Account not in config: warn, offer to skip or add it.
- API 401: PAT expired, re-run `setup.py`. API 403: check project permissions.
