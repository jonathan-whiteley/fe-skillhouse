# sa-transcript-tasks

Turn meeting transcripts into a plain-markdown summary and confirmed Asana tasks.

## What it does

Given a raw transcript file or pasted meeting notes, the skill produces a clean
plain-markdown summary (title, date, attendees, discussion points, decisions, action items),
then extracts team-owned action items and presents them in a numbered confirmation table.
After you approve, it creates the tasks in Asana: each task lands in the right per-account
project, gets assigned to the right teammate, and (if you have a dashboard project) is
multi-homed there with a colored section and account label. Run `sync_tasks.py` later to
update checkbox state in your notes as tasks complete in Asana.

## Install

1. Add the marketplace source (if not already added):

   ```
   /plugin marketplace add <repo-or-shared-path>
   ```

   The marketplace JSON must be reachable from a git remote or a shared file path that all
   users of this plugin can access. See the Claude Code plugin documentation for details.

2. Install the plugin:

   ```
   /plugin install sa-transcript-tasks
   ```

## Get an Asana PAT and find project GIDs

**Personal Access Token (PAT):** go to https://app.asana.com/0/my-apps, click
"Create new token", give it a name, and copy the token. You will enter it during setup.
The PAT is personal credentials: never commit it or share it.

**Project GIDs:** open any Asana project in your browser. The number in the URL is the
project GID. For example, in `https://app.asana.com/0/123456789012345/list` the project GID
is `123456789012345`. Section GIDs work the same way: click into a section and the URL
updates to show the section GID.

**User GIDs:** `setup.py` fetches your own GID automatically from `/users/me`. For
teammates, open their profile in Asana; their GID appears in the URL.

## Setup

Run the interactive wizard once before using the skill:

```bash
python3 <path-to-plugin>/skills/transcript-to-tasks/resources/setup.py
```

The wizard walks you through:

1. Your Asana PAT (verified against the API immediately).
2. An optional personal dashboard project (for multi-homing all tasks).
3. One or more accounts: each needs a project GID, an optional default section, email
   domains, and keyword aliases for automatic account inference.
4. Teammates whose action items you track: enter their name and Asana GID. If a teammate
   has no Asana account, mark them `track_only` and tasks will be assigned to you while
   preserving their name.
5. Optional internal (non-customer) projects.
6. An optional notes directory where summaries are written and `sync_tasks.py` scans.
7. Optional custom fields for colored account labels on the dashboard.

The wizard writes `~/.claude/asana-config.json`. Re-run it anytime to update settings.
See `skills/transcript-to-tasks/resources/config_schema.md` for a full reference of every
key.

## Usage

Invoke the skill in Claude Code:

```
/transcript-to-tasks
```

Or describe what you want in plain language:

- "Process this transcript"
- "Make tasks from this meeting"
- "Summarize this call and create Asana tasks"
- Paste meeting notes directly into the conversation

The skill will:

1. Produce a plain-markdown summary of the meeting.
2. Extract team-owned action items (yours and any teammates in `assignee_map`).
3. Show a numbered confirmation table with account, tag, assignee, task text, and due date.
4. Wait for your approval: type `y` to create all, `edit 2,3` to drop specific rows and
   create the rest, or `skip` to create nothing.
5. Create the approved tasks in Asana and report back URLs.

The confirmation step is mandatory. The skill will never create tasks in the same turn it
shows the table.

### Syncing task status back to notes

After tasks complete in Asana, sync their status back into your markdown notes:

```bash
python3 skills/transcript-to-tasks/resources/sync_tasks.py          # dry run
python3 skills/transcript-to-tasks/resources/sync_tasks.py --apply  # write changes
```

This scans the notes directory for Asana URLs inside checkbox lines and updates them to
match Asana's completion state.

## What this does NOT do

This plugin is a standalone Asana integration with no Obsidian vault coupling:

- No Obsidian frontmatter, wikilinks, or graph-view links.
- No daily/weekly rollup notes.
- No account dashboard maintenance.
- No Dataview queries or vault-specific folder conventions.

If you use an Obsidian vault and want those features, look at a vault-integrated plugin
instead. This plugin produces plain markdown only.

## Configuration reference

Config lives in `~/.claude/asana-config.json`. The PAT stored there is personal
credentials: never commit this file to a repository, never share it, and never include it
in screenshots or logs.

For a full description of every key (types, required/optional, which script reads each key,
and a complete example JSON), see:

```
skills/transcript-to-tasks/resources/config_schema.md
```
