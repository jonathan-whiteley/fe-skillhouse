---
name: transcript-to-tasks
description: Turn a meeting transcript into a plain-markdown summary and confirmed Asana tasks. Use when the user says "process this transcript", "make tasks from this meeting", "summarize this call", or pastes meeting notes/action items.
---

# Transcript to Tasks

Turn a meeting transcript (or pasted notes) into a plain-markdown meeting summary and a set
of confirmed Asana tasks. Account-agnostic: accounts, teammates, and Asana projects come
from `~/.claude/asana-config.json`. `resources/` paths below are relative to this skill's base directory.

## Setup

Before first use, check if `~/.claude/asana-config.json` exists. If not, run:

```bash
python3 resources/setup.py   # from this skill's base directory
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

Tie-breaker: something finished in one sitting (send, share, book, schedule, answer) is FOLLOW-UP, even when it's
for a demo; building an artifact is PROJECT; DEMO is only rehearsing or delivering the demo itself.

## Workflow

### Step 0: Summarize the transcript

Always do this for a raw transcript (file path or pasted text); skip it only when the input is already a summary
or a bare list of action items. Write a plain-markdown summary that someone who missed the meeting could act on. Sections, in order (drop any that would be empty):

1. **Title, date, attendees** (names as spoken; mark guesses `(?)`).
2. **TL;DR**: 2-4 sentences. The main outcome and why it matters, including any big-picture goal and the numbers
   or commitments that define it.
3. **Topics**: one heading per topic, named for what was actually discussed ("Genie rollout to store managers",
   not "Discussion" or "Topic 1"). Under each: what was said and concluded, with every specific kept (names,
   numbers, dates, tools, volumes, dollar figures). Quote a speaker verbatim when the exact words matter:
   _"quote"_ (Name).
4. **Decisions**: only what was explicitly agreed. Decision, who made it, why ("reason not stated" if nobody said).
5. **Open questions**: raised but not answered, with who owes the answer if anyone said.
6. **Dates and milestones**: every date or event mentioned, with what happens and who's responsible.
7. **Action items**: Owner | Action | Due (as stated in the meeting, else blank).

Never invent: when the meeting referred to an owner, date, or figure but didn't pin it down, write `[UNKNOWN]`,
not a guess. A field nobody mentioned (e.g. no deadline stated) is just left blank. If `notes_dir` is set in config,
write it to `<notes_dir>/YYYY-MM-DD <title>.md`; otherwise print it inline and offer to save it. No frontmatter, no
wikilinks: keep it portable markdown.

### Step 1: Accept input

Input is one of: a raw transcript, a just-written summary, or pasted action items.

### Step 2: Pick the action items that become tasks

Start from the summary's Action Items (or the input). An item becomes a task only if it passes all three:
1. **Clear owner**: the installing user or someone in `assignee_map` (match an attendee's first or full name to a
   key, case-insensitive). Customer-owned items stay in the summary unless the user asks to track them (e.g. "track
   Tom's export too"); a tracked one is assigned to you with the owner's name in the task text.
2. **Concrete action**: a verb you can finish (send, schedule, write, review, share, book, confirm, build,
   deliver, present). "Look into", "think about", "discuss", "explore", "circle back" are not tasks.
3. **Real consequence**: someone is waiting, there's a deadline, or a next step is blocked without it.

Action items that fail stay in the summary's Action Items table; list them under "Not tasks" in the confirmation,
each with the test it failed, so the user can promote one. Open questions and decisions aren't action items: they
stay in their summary sections, not in "Not tasks".

For each task: account (infer from email domains and keyword aliases in `config["accounts"]`; an item that names no
account takes the meeting's account, from the title and attendee domains; if it could be more than one account,
ask at the gate), tag
(PROJECT/DEMO/FOLLOW-UP), assignee (a key in `assignee_map`; omit for the installing user), the deadline the
meeting stated (if any), and the task text. **Word the text so it stands alone** in a list of 50 tasks across ten
accounts: verb first, naming the counterpart and the object, at least 6 words ("Send Contoso the Lakebase sizing
estimate for the store-ops app", not "Send sizing").

### Step 3: Due dates

No due date by default: priority is set in Asana, and a date nobody stated is noise. A task gets a date only when
the meeting stated one or the user sets one at the gate. Convert stated deadlines **relative to the meeting date**
(a "Friday" said on Wednesday Oct 28 is Oct 30, even if you process the transcript the next week):

```bash
python3 resources/due_date.py --from <meeting YYYY-MM-DD> "Friday"
python3 resources/due_date.py --from <meeting YYYY-MM-DD> "EOW"
```

It exits 1 on text it can't read (say so; don't guess a date) and warns when the date is already past (show the date
and flag it at the gate). An event date ("the council is Nov 19") is context for the task text, not its deadline,
unless someone said the work is due then.

### Step 4: Show the confirmation table, then STOP

Present a numbered table (# / Account / Tag / Assignee / Task / Due), with each stated deadline in Due and the rest
blank, then the "Not tasks" list. End the turn with:

`Create these tasks? (y / drop N,N / skip). Any need a due date? (e.g. "3: Friday"; default none)`

Then STOP and WAIT. Never call `asana_client.py` in the same turn the table is shown. This
gate is mandatory: approving the workflow is not approving the specific tasks.

- `y` creates all; `drop 2,3` creates all but those; `skip` creates none. Any other reply (rewording a task, changing
  an assignee or account) is an edit: apply it and show the table again.
- Dates the user gives here go through `due_date.py` (with `--from` today); stated deadlines keep the date shown in
  the table; every other task is created with no due date.

### Step 5: Create tasks (only after y / drop)

```bash
echo '{"tasks": [{"account":"Acme","project_type":"customer_account","tag":"DEMO","text":"...","due_date":null,"assignee":"Alex"}]}' | python3 resources/asana_client.py
```

Use `"project_type": "internal"` for non-customer tasks. `due_date` is `YYYY-MM-DD` or `null` (no due date).

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
