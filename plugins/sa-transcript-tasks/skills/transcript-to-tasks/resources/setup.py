#!/usr/bin/env python3
"""Interactive setup for the transcript-to-tasks Asana integration.

Creates or updates ~/.claude/asana-config.json. Account-agnostic: you supply
your own accounts, teammates, and Asana project GIDs.
"""

import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

CONFIG_PATH = Path.home() / ".claude" / "asana-config.json"


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
        print(f"API error: {e.code} {e.read().decode()}")
        sys.exit(1)


def get_sections(project_id, token):
    result = api_call(f"/projects/{project_id}/sections", token)
    return result.get("data", [])


def print_sections(sections):
    for i, s in enumerate(sections):
        print(f"  [{i}] {s['name']} (gid: {s['gid']})")


def pick_section(sections, prompt):
    if not sections:
        return None
    print_sections(sections)
    idx = input(f"  {prompt} (number, or 'skip'): ").strip()
    if idx == "skip":
        return None
    try:
        return sections[int(idx)]["gid"]
    except (ValueError, IndexError):
        print("  Invalid selection, skipping.")
        return None


def build_config(existing, answers):
    """Assemble the config dict from collected answers, merging into existing."""
    config = dict(existing)
    config["personal_access_token"] = answers["personal_access_token"]
    config["user_gid"] = answers["user_gid"]
    if answers.get("dashboard_project_id"):
        config["dashboard_project_id"] = answers["dashboard_project_id"]
        config["dashboard_sections"] = answers.get("dashboard_sections", {})
    config["accounts"] = answers.get("accounts", {})
    config["assignee_map"] = answers.get("assignee_map", {})
    config["internal_projects"] = answers.get("internal_projects", {})
    if answers.get("notes_dir"):
        config["notes_dir"] = answers["notes_dir"]
    cf = answers.get("custom_fields")
    if cf:
        config.update(cf)
    return config


def _split_csv(raw):
    return [x.strip() for x in raw.split(",") if x.strip()]


def collect_answers(existing):
    pat = input("\nAsana Personal Access Token: ").strip()
    if not pat:
        print("No token provided, exiting.")
        sys.exit(1)
    me = api_call("/users/me", pat)
    user = me.get("data", {})
    print(f"\nAuthenticated as: {user.get('name')} ({user.get('email')})")
    user_gid = user.get("gid")

    answers = {
        "personal_access_token": pat,
        "user_gid": user_gid,
        "dashboard_project_id": None,
        "dashboard_sections": {},
        "accounts": {},
        "assignee_map": {},
        "internal_projects": {},
        "notes_dir": None,
        "custom_fields": None,
    }

    # Dashboard
    print("\n--- Dashboard Project (optional) ---")
    print("A personal board where every task is multi-homed. Press Enter to skip.")
    dash_id = input("Dashboard project GID: ").strip()
    if dash_id:
        answers["dashboard_project_id"] = dash_id
        sections = get_sections(dash_id, pat)
        for tag in ("PROJECT", "DEMO", "FOLLOW-UP"):
            print(f"\n  Section for [{tag}] tasks:")
            sid = pick_section(sections, f"Select section for {tag}")
            if sid:
                answers["dashboard_sections"][tag] = sid

    # Accounts
    print("\n--- Accounts ---")
    print("Add each account you track. Enter a blank name when done.")
    while True:
        name = input("\n  Account name (blank to finish): ").strip()
        if not name:
            break
        proj_id = input(f"  Asana project GID for {name}: ").strip()
        if not proj_id:
            print("  No project GID; skipping this account.")
            continue
        acct = {"ae_project_id": proj_id}
        sections = get_sections(proj_id, pat)
        sid = pick_section(sections, "Select default section for tasks")
        acct["ae_section_id"] = sid
        domains = input("  Email domains for this account (comma-separated, optional): ").strip()
        acct["domains"] = _split_csv(domains)
        aliases = input("  Keyword aliases for this account (comma-separated, optional): ").strip()
        acct["aliases"] = _split_csv(aliases)
        answers["accounts"][name] = acct

    # Teammates
    print("\n--- Teammates ---")
    print("People whose action items you assign. Enter a blank name when done.")
    while True:
        tname = input("\n  Teammate name (blank to finish): ").strip()
        if not tname:
            break
        gid = input(f"  Asana user GID for {tname}: ").strip()
        if not gid:
            print("  No GID; skipping.")
            continue
        track_only = input("  Track only (no Asana account, assign to you)? (y/n): ").strip().lower() == "y"
        answers["assignee_map"][tname] = {"gid": gid, "track_only": True} if track_only else gid

    # Internal projects
    print("\n--- Internal Projects (optional) ---")
    while True:
        iname = input("\n  Internal project name (blank to finish): ").strip()
        if not iname:
            break
        proj_id = input(f"  Project GID for {iname}: ").strip()
        if proj_id:
            sections = get_sections(proj_id, pat)
            sid = pick_section(sections, "Select default section")
            answers["internal_projects"][iname] = {"asana_project_id": proj_id, "asana_section_id": sid}

    # Notes dir
    print("\n--- Notes Directory (optional) ---")
    notes_dir = input("Folder for meeting-note summaries and status sync: ").strip()
    if notes_dir:
        answers["notes_dir"] = notes_dir

    # Custom fields
    print("\n--- Custom Fields (optional, advanced) ---")
    if input("Configure Account custom fields on the dashboard? (y/n): ").strip().lower() == "y":
        cf = {}
        v = input("  account_field_gid (text field): ").strip()
        if v:
            cf["account_field_gid"] = v
        v = input("  account_name_field_gid (colored enum, optional): ").strip()
        if v:
            cf["account_name_field_gid"] = v
        answers["custom_fields"] = cf or None

    return answers


def main():
    print("=== Transcript-to-Tasks Asana Setup ===\n")
    existing = {}
    if CONFIG_PATH.exists():
        existing = json.loads(CONFIG_PATH.read_text())
        print(f"Found existing config at {CONFIG_PATH}")
        if input("Update it? (y/n): ").strip().lower() != "y":
            print("Keeping existing config.")
            sys.exit(0)
    answers = collect_answers(existing)
    config = build_config(existing, answers)
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_PATH.write_text(json.dumps(config, indent=2))
    print(f"\nConfig saved to {CONFIG_PATH}")
    print("Re-run this script anytime to update settings.")


if __name__ == "__main__":
    main()
