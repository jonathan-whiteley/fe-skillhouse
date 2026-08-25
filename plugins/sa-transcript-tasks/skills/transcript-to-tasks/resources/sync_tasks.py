#!/usr/bin/env python3
"""Sync Asana task completion status back to markdown notes.

Reads all tasks from configured Asana projects, finds linked tasks in
markdown notes (by Asana URL), and updates checkboxes to match
Asana's completed status.

Usage:
    python3 sync_tasks.py                    # Dry run - show what would change
    python3 sync_tasks.py --apply            # Apply changes to markdown files
    python3 sync_tasks.py --project Panda    # Sync only one account
    python3 sync_tasks.py --dashboard        # Sync from dashboard project only
    python3 sync_tasks.py --notes-dir DIR    # Override scan directory
"""

import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

CONFIG_PATH = Path.home() / ".claude" / "asana-config.json"

# Match: - [ ] or - [x] lines containing an Asana URL
CHECKBOX_RE = re.compile(
    r"^(\s*- \[)([x ])(\] .+?)(https://app\.asana\.com/0/\d+/(\d+))(.*)$"
)


def load_config():
    if not CONFIG_PATH.exists():
        print(json.dumps({"error": f"Config not found at {CONFIG_PATH}"}))
        sys.exit(1)
    return json.loads(CONFIG_PATH.read_text())


def die_auth():
    """Emit a reauth hint and exit (never fail silently on an expired PAT)."""
    print(json.dumps({
        "error": "Asana PAT expired or invalid (HTTP 401).",
        "action": "Re-run setup.py to refresh your Personal Access Token.",
    }, indent=2))
    sys.exit(2)


def notes_root(config, argv):
    """Resolve the directory to scan for markdown files with Asana links.

    Precedence: config["notes_dir"] > --notes-dir CLI flag > current working dir.
    """
    if config.get("notes_dir"):
        return Path(config["notes_dir"])
    if "--notes-dir" in argv:
        idx = argv.index("--notes-dir")
        if idx + 1 < len(argv):
            return Path(argv[idx + 1])
    return Path.cwd()


def api_call(path, token):
    url = f"https://app.asana.com/api/1.0{path}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        if e.code == 401:
            die_auth()
        raise


def api_get_all(path, token):
    """GET every page of a paginated Asana list endpoint.

    Asana caps a page at 100 rows and returns a next_page.offset cursor;
    without following it, results silently truncate at 100. `path` must
    already carry limit and opt_fields; this appends the offset cursor.
    """
    sep = "&" if "?" in path else "?"
    items = []
    offset = None
    while True:
        page_path = path if offset is None else f"{path}{sep}offset={offset}"
        result = api_call(page_path, token)
        items.extend(result.get("data", []))
        offset = (result.get("next_page") or {}).get("offset")
        if not offset:
            break
    return items


def api_put(path, token, data):
    """PUT request to Asana API."""
    url = f"https://app.asana.com/api/1.0{path}"
    body = json.dumps({"data": data}).encode()
    req = urllib.request.Request(url, data=body, method="PUT", headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def get_task_statuses(config, project_filter=None, use_dashboard=False):
    """Fetch completed status for all tasks in configured projects."""
    token = config["personal_access_token"]
    task_statuses = {}  # task_gid -> {completed, name}

    if use_dashboard:
        projects = [("Dashboard", config["dashboard_project_id"])]
    elif project_filter:
        acct = config["accounts"].get(project_filter, {})
        if not acct:
            print(f"Unknown account: {project_filter}")
            sys.exit(1)
        projects = [(project_filter, acct["ae_project_id"])]
    else:
        projects = [
            (name, acct["ae_project_id"])
            for name, acct in config["accounts"].items()
        ]

    for name, project_id in projects:
        tasks = api_get_all(
            f"/projects/{project_id}/tasks?opt_fields=completed,name&limit=100",
            token,
        )
        for task in tasks:
            task_statuses[task["gid"]] = {
                "completed": task["completed"],
                "name": task["name"],
                "project": name,
            }

    return task_statuses


def update_urgency(config):
    """Set the Urgency custom field on dashboard tasks based on due date.

    - OVERDUE (red): due before today
    - DUE TODAY (yellow): due today
    - DUE TOMORROW (orange): due tomorrow
    - Clear: due later or no due date
    """
    from datetime import date, timedelta

    token = config["personal_access_token"]
    dashboard_id = config["dashboard_project_id"]
    urgency_cfg = config.get("urgency_field", {})
    field_gid = urgency_cfg.get("field_gid")

    if not field_gid:
        return []

    today = date.today()
    tomorrow = today + timedelta(days=1)

    option_map = {
        "overdue": urgency_cfg.get("overdue_gid"),
        "due_today": urgency_cfg.get("due_today_gid"),
        "due_tomorrow": urgency_cfg.get("due_tomorrow_gid"),
    }

    tasks = api_get_all(
        f"/projects/{dashboard_id}/tasks"
        f"?opt_fields=name,due_on,completed,custom_fields.gid,custom_fields.enum_value.gid"
        f"&completed_since=now&limit=100",
        token,
    )

    updates = []
    for task in tasks:
        if task.get("completed"):
            continue
        due_on = task.get("due_on")
        if not due_on:
            continue

        due_date = date.fromisoformat(due_on)

        if due_date < today:
            desired_gid = option_map["overdue"]
            label = "OVERDUE"
        elif due_date == today:
            desired_gid = option_map["due_today"]
            label = "DUE TODAY"
        elif due_date == tomorrow:
            desired_gid = option_map["due_tomorrow"]
            label = "DUE TOMORROW"
        else:
            desired_gid = None
            label = None

        # Check current value to avoid unnecessary API calls
        current_gid = None
        for cf in task.get("custom_fields", []):
            if cf.get("gid") == field_gid:
                ev = cf.get("enum_value")
                current_gid = ev.get("gid") if ev else None
                break

        if current_gid == desired_gid:
            continue

        api_put(
            f"/tasks/{task['gid']}",
            token,
            {"custom_fields": {field_gid: desired_gid}},
        )
        updates.append({
            "task": task["name"],
            "due_on": due_on,
            "urgency": label or "cleared",
        })

    return updates


def scan_and_update(task_statuses, root, apply=False):
    """Scan markdown notes for Asana links and sync checkbox status."""
    changes = []

    md_files = list(root.rglob("*.md"))

    for md_file in md_files:
        content = md_file.read_text()
        lines = content.split("\n")
        file_changed = False

        for i, line in enumerate(lines):
            match = CHECKBOX_RE.match(line)
            if not match:
                continue

            prefix, current_check, middle, url, task_gid, suffix = match.groups()
            if task_gid not in task_statuses:
                continue

            task = task_statuses[task_gid]
            expected_check = "x" if task["completed"] else " "

            if current_check != expected_check:
                new_line = f"{prefix}{expected_check}{middle}{url}{suffix}"
                lines[i] = new_line
                file_changed = True
                action = "completed" if task["completed"] else "reopened"
                rel_path = md_file.relative_to(root)
                changes.append({
                    "file": str(rel_path),
                    "line": i + 1,
                    "task": task["name"],
                    "action": action,
                    "task_gid": task_gid,
                })

        if file_changed and apply:
            md_file.write_text("\n".join(lines))

    return changes


def main():
    apply = "--apply" in sys.argv
    project_filter = None
    use_dashboard = "--dashboard" in sys.argv

    if "--project" in sys.argv:
        idx = sys.argv.index("--project")
        if idx + 1 < len(sys.argv):
            project_filter = sys.argv[idx + 1]

    config = load_config()
    root = notes_root(config, sys.argv)
    task_statuses = get_task_statuses(config, project_filter, use_dashboard)
    changes = scan_and_update(task_statuses, root, apply=apply)

    # Update Urgency field on dashboard tasks based on due date
    urgency_updates = []
    if apply and config.get("urgency_field"):
        urgency_updates = update_urgency(config)

    output = {
        "mode": "apply" if apply else "dry_run",
        "tasks_checked": len(task_statuses),
        "changes": changes,
        "urgency_updates": urgency_updates,
    }

    print(json.dumps(output, indent=2))

    if changes and not apply:
        print(f"\n{len(changes)} change(s) found. Run with --apply to update files.", file=sys.stderr)


if __name__ == "__main__":
    main()
