#!/usr/bin/env python3
"""Create Asana tasks from JSON input. Supports multi-homing to dashboard project."""

import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

CONFIG_PATH = Path.home() / ".claude" / "asana-config.json"


def load_config():
    if not CONFIG_PATH.exists():
        print(json.dumps({"error": f"Config not found at {CONFIG_PATH}. Run setup.py first."}))
        sys.exit(1)
    return json.loads(CONFIG_PATH.read_text())


def api_call(method, path, token, data=None):
    url = f"https://app.asana.com/api/1.0{path}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = json.dumps({"data": data}).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        return {"error": f"HTTP {e.code}: {error_body}"}


def resolve_assignee(config, assignee_name):
    """Resolve a teammate name to an Asana user gid and a proxy-owner label.

    Returns (assignee_gid, proxy_owner). proxy_owner is the teammate's name
    when the task must be parked on the installing user because that teammate
    has no Asana account (track_only), and None otherwise. Callers prefix the
    task name with the proxy_owner so ownership stays visible and filterable.

    config["assignee_map"] values may be either a bare gid string or a dict
    {"gid": str, "track_only": bool}.
    """
    self_gid = config.get("user_gid", "me")
    assignee_map = config.get("assignee_map", {})
    if not assignee_name or assignee_name not in assignee_map:
        return self_gid, None
    entry = assignee_map[assignee_name]
    if isinstance(entry, dict):
        if entry.get("track_only"):
            return self_gid, assignee_name
        return entry.get("gid", self_gid), None
    return entry, None


def create_task(config, task_input):
    token = config["personal_access_token"]
    account = task_input["account"]
    project_type = task_input.get("project_type", "customer_account")
    tag = task_input.get("tag", "FOLLOW-UP")
    text = task_input["text"]
    due_date = task_input.get("due_date")

    # Determine primary project and section
    if project_type == "internal" and account in config.get("internal_projects", {}):
        proj = config["internal_projects"][account]
        primary_project_id = proj["asana_project_id"]
        primary_section_id = proj.get("asana_section_id")
    elif account in config.get("accounts", {}):
        acct = config["accounts"][account]
        primary_project_id = acct["ae_project_id"]
        primary_section_id = acct.get("ae_section_id")
    else:
        return {"error": f"Unknown account: {account}. Check asana-config.json."}

    assignee, proxy_owner = resolve_assignee(config, task_input.get("assignee"))
    # When the owner has no Asana account, the task is parked on the installing
    # user; prefix the name with [Owner] so it stays attributable and filterable
    # (this is what config_schema.md promises for track_only).
    if proxy_owner and not text.startswith(f"[{proxy_owner}]"):
        text = f"[{proxy_owner}] {text}"
    account_field_gid = config.get("account_field_gid")
    # Display name for the account (strip hyphens for readability)
    account_display = account.replace("-", " ")
    task_data = {
        "name": text,
        "projects": [primary_project_id],
        "due_on": due_date,
        "assignee": assignee,
    }
    result = api_call("POST", "/tasks", token, task_data)
    if "error" in result:
        return result

    task_gid = result["data"]["gid"]
    task_url = f"https://app.asana.com/0/{primary_project_id}/{task_gid}"
    outcomes = {"task_gid": task_gid, "task_url": task_url, "actions": []}

    # Move to section in primary project
    if primary_section_id:
        sec_result = api_call(
            "POST",
            f"/sections/{primary_section_id}/addTask",
            token,
            {"task": task_gid},
        )
        outcomes["actions"].append(
            f"Moved to section in primary project"
            if "error" not in sec_result
            else f"Section move failed: {sec_result['error']}"
        )

    # Multi-home to dashboard project
    dashboard_id = config.get("dashboard_project_id")
    dashboard_sections = config.get("dashboard_sections", {})
    if dashboard_id:
        dash_result = api_call(
            "POST",
            f"/tasks/{task_gid}/addProject",
            token,
            {"project": dashboard_id},
        )
        if "error" not in dash_result:
            outcomes["actions"].append("Multi-homed to dashboard")
            # Move to tag section in dashboard
            section_id = dashboard_sections.get(tag)
            if section_id:
                api_call(
                    "POST",
                    f"/sections/{section_id}/addTask",
                    token,
                    {"task": task_gid},
                )
                outcomes["actions"].append(f"Dashboard section: {tag}")

            # Set Account custom field (field lives on dashboard project)
            if account_field_gid:
                api_call(
                    "PUT",
                    f"/tasks/{task_gid}",
                    token,
                    {"custom_fields": {account_field_gid: account_display}},
                )
                outcomes["actions"].append(f"Account: {account_display}")

            # Set Account Name enum field (colored) if configured
            account_name_field_gid = config.get("account_name_field_gid")
            account_name_enum_map = config.get("account_name_enum_map", {})
            if account_name_field_gid and account_display in account_name_enum_map:
                api_call(
                    "PUT",
                    f"/tasks/{task_gid}",
                    token,
                    {"custom_fields": {account_name_field_gid: account_name_enum_map[account_display]}},
                )
                outcomes["actions"].append(f"Account Name (colored): {account_display}")

    return outcomes


def main():
    config = load_config()
    raw = sys.stdin.read()
    payload = json.loads(raw)
    tasks = payload.get("tasks", [])

    results = []
    for t in tasks:
        result = create_task(config, t)
        result["input"] = t
        results.append(result)

    print(json.dumps({"results": results}, indent=2))


if __name__ == "__main__":
    main()
