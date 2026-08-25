# Config Schema: `~/.claude/asana-config.json`

This file documents every key in the configuration file shared by `asana_client.py`,
`sync_tasks.py`, and `setup.py`. All keys are at the top level unless noted.

Run `python3 setup.py` to create or update this file interactively.

---

## Required keys

### `personal_access_token`

**Type:** string
**Required:** yes
**Read by:** `asana_client.py`, `sync_tasks.py`

Your Asana Personal Access Token (PAT). Used as the `Bearer` value in every API request.
Treat this like a password: never commit it to a repository and never share it. Generate one
at https://app.asana.com/0/my-apps.

### `user_gid`

**Type:** string (Asana GID, numeric)
**Required:** yes
**Read by:** `asana_client.py` (via `resolve_assignee`), `setup.py`

The Asana GID for the installing user. Collected automatically during `setup.py` from
`/users/me`. Tasks with no explicit assignee (or whose assignee has `track_only: true`) are
assigned to this GID.

---

## Optional keys (dashboard)

### `dashboard_project_id`

**Type:** string (Asana project GID)
**Required:** no
**Read by:** `asana_client.py`, `sync_tasks.py`

GID of a personal Asana project used as a dashboard. When present, every created task is
multi-homed into this project in addition to the per-account project. Also used by
`sync_tasks.py --dashboard` to sync completion status from this single project instead of
all account projects.

### `dashboard_sections`

**Type:** object: `{ "PROJECT": "<gid>", "DEMO": "<gid>", "FOLLOW-UP": "<gid>" }`
**Required:** no (only meaningful when `dashboard_project_id` is set)
**Read by:** `asana_client.py`

Maps each task tag to a section GID inside the dashboard project. After multi-homing a task,
`asana_client.py` moves it into the matching section. Keys must be `PROJECT`, `DEMO`, or
`FOLLOW-UP`. Omit a key to leave tasks in the project's default section for that tag.

---

## Accounts

### `accounts`

**Type:** object: `{ "<AccountName>": { ... } }`
**Required:** yes (can be empty `{}` if you only use internal projects)
**Read by:** `asana_client.py`, `sync_tasks.py`

One entry per customer or partner account you track. The key is the canonical account name
used in task input. Each value is an object with the following sub-keys:

#### `accounts.<name>.ae_project_id`

**Type:** string (Asana project GID)
**Required:** yes (per account)

The GID of the Asana project for this account. Tasks with `"project_type": "customer_account"`
are created in this project as the primary home. Find it in your browser: open the project
and copy the number from the URL (e.g. `https://app.asana.com/0/123456789012345/...` gives
GID `123456789012345`).

#### `accounts.<name>.ae_section_id`

**Type:** string (Asana section GID) or null
**Required:** no

GID of the default section inside `ae_project_id`. When set, newly created tasks are moved
into this section immediately after creation. Set to `null` to use the project default.

#### `accounts.<name>.domains`

**Type:** array of strings
**Required:** no (can be `[]`)

Email domains associated with this account (e.g. `["acme.com", "acme.net"]`). Used by the
skill to infer which account owns an action item when the transcript contains email addresses.

#### `accounts.<name>.aliases`

**Type:** array of strings
**Required:** no (can be `[]`)

Keyword aliases for this account (e.g. `["Acme Corp", "Acme Inc"]`). Used alongside `domains`
for account inference when matching transcript text against known accounts.

---

## Assignee map

### `assignee_map`

**Type:** object: `{ "<Name>": <value> }`
**Required:** no (can be `{}`)
**Read by:** `asana_client.py` (via `resolve_assignee`)

Maps teammate names to Asana assignee information. The skill uses these names when extracting
action items from transcripts. Each value may take one of two forms:

**Form 1: bare GID string**

```json
"assignee_map": {
  "Alex": "<alex-user-gid>"
}
```

`Alex` has an Asana account. Tasks assigned to Alex are set to Alex's GID directly.

**Form 2: dict with `gid` and `track_only`**

```json
"assignee_map": {
  "Sam": { "gid": "<sam-user-gid>", "track_only": true }
}
```

`track_only: true` means Sam has no Asana account. The task is still created (so it appears
in the task list), but it is assigned to `user_gid` (the installing user) instead of Sam.
The task name is automatically prefixed with `[Sam]` so ownership stays visible and
filterable in every Asana view. Use this for AEs, customers, or teammates who do not use Asana.

`track_only: false` (or omitting the key) behaves the same as the bare GID form: the task
is assigned to Sam's GID.

---

## Internal projects

### `internal_projects`

**Type:** object: `{ "<ProjectName>": { ... } }`
**Required:** no (can be `{}`)
**Read by:** `asana_client.py`

Non-customer Asana projects (e.g. team initiatives, personal backlogs). Tasks with
`"project_type": "internal"` look up the account name here instead of in `accounts`.

#### `internal_projects.<name>.asana_project_id`

**Type:** string (Asana project GID)
**Required:** yes (per internal project)

GID of the Asana project for this internal project.

#### `internal_projects.<name>.asana_section_id`

**Type:** string or null
**Required:** no

Default section GID inside the internal project. Behaves the same as `ae_section_id`.

---

## Custom fields (dashboard)

These top-level keys are optional and only apply when `dashboard_project_id` is configured.
They control custom field values set on tasks after multi-homing.

### `account_field_gid`

**Type:** string (Asana custom field GID)
**Required:** no
**Read by:** `asana_client.py`

GID of a text-type custom field on the dashboard project that stores the account name as a
plain string. When set, `asana_client.py` writes the account display name (spaces substituted
for hyphens) into this field after multi-homing.

### `account_name_field_gid`

**Type:** string (Asana custom field GID)
**Required:** no
**Read by:** `asana_client.py`

GID of a colored enum-type custom field on the dashboard project. Used alongside
`account_name_enum_map` to set a color-coded per-account label. Both keys must be set for
the enum field to be written.

### `account_name_enum_map`

**Type:** object: `{ "<AccountDisplayName>": "<enum_option_gid>" }`
**Required:** no (required only if `account_name_field_gid` is set and you want colored labels)
**Read by:** `asana_client.py`

Maps account display names (with spaces, as produced by replacing hyphens in the account key)
to the GID of the corresponding enum option in `account_name_field_gid`. Find option GIDs
via the Asana API: `GET /custom_fields/<field_gid>` returns all `enum_options` with their GIDs.

---

## Notes directory

### `notes_dir`

**Type:** string (absolute filesystem path)
**Required:** no
**Read by:** `sync_tasks.py`, SKILL.md workflow

Absolute path to the folder where meeting-note markdown files are stored. Used by
`sync_tasks.py` as the root directory to scan for Asana links (overridable with
`--notes-dir DIR` on the command line; config wins over the CLI flag). Also used by the
skill to determine where to write the summary note produced from a transcript.

When omitted, `sync_tasks.py` defaults to the current working directory.

---

## Urgency field (sync_tasks.py only)

### `urgency_field`

**Type:** object
**Required:** no
**Read by:** `sync_tasks.py` (`update_urgency` function; only invoked when `--apply` is passed)

When present, `sync_tasks.py --apply` reads incomplete tasks from the dashboard project and
sets a colored urgency enum field based on each task's due date. The object has these sub-keys:

#### `urgency_field.field_gid`

**Type:** string (Asana custom field GID)
**Required:** yes (within `urgency_field`)

GID of the urgency enum custom field on the dashboard project.

#### `urgency_field.overdue_gid`

**Type:** string (Asana enum option GID)
**Required:** no

GID of the enum option to set when a task is past its due date (displayed in red or similar).

#### `urgency_field.due_today_gid`

**Type:** string (Asana enum option GID)
**Required:** no

GID of the enum option to set when a task is due today.

#### `urgency_field.due_tomorrow_gid`

**Type:** string (Asana enum option GID)
**Required:** no

GID of the enum option to set when a task is due tomorrow.

Tasks due later than tomorrow, or with no due date, have the urgency field cleared (set to
`null`).

---

## Complete example

```json
{
  "personal_access_token": "<your-asana-pat>",
  "user_gid": "<your-user-gid>",

  "dashboard_project_id": "<dashboard-project-gid>",
  "dashboard_sections": {
    "PROJECT": "<project-section-gid>",
    "DEMO": "<demo-section-gid>",
    "FOLLOW-UP": "<followup-section-gid>"
  },

  "accounts": {
    "Acme": {
      "ae_project_id": "<acme-project-gid>",
      "ae_section_id": "<acme-section-gid>",
      "domains": ["acme.com"],
      "aliases": ["Acme Corp", "Acme Inc"]
    },
    "Globex": {
      "ae_project_id": "<globex-project-gid>",
      "ae_section_id": null,
      "domains": ["globex.com"],
      "aliases": []
    }
  },

  "assignee_map": {
    "Alex": "<alex-user-gid>",
    "Sam": { "gid": "<sam-user-gid>", "track_only": true }
  },

  "internal_projects": {
    "Team Enablement": {
      "asana_project_id": "<team-enablement-project-gid>",
      "asana_section_id": null
    }
  },

  "account_field_gid": "<account-field-gid>",
  "account_name_field_gid": "<account-name-field-gid>",
  "account_name_enum_map": {
    "Acme": "<acme-enum-option-gid>",
    "Globex": "<globex-enum-option-gid>"
  },

  "notes_dir": "/Users/you/notes",

  "urgency_field": {
    "field_gid": "<urgency-field-gid>",
    "overdue_gid": "<overdue-option-gid>",
    "due_today_gid": "<due-today-option-gid>",
    "due_tomorrow_gid": "<due-tomorrow-option-gid>"
  }
}
```
