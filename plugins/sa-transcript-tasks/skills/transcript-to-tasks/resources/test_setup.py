import setup

def test_build_config_merges_and_sets_keys():
    answers = {
        "personal_access_token": "PAT",
        "user_gid": "SELF",
        "dashboard_project_id": "DASH",
        "dashboard_sections": {"PROJECT": "S1"},
        "accounts": {"Acme": {"ae_project_id": "P1", "ae_section_id": None,
                              "domains": ["acme.com"], "aliases": ["Acme Corp"]}},
        "assignee_map": {"Alex": "GID_ALEX", "Sam": {"gid": "GID_SAM", "track_only": True}},
        "internal_projects": {},
        "notes_dir": "/tmp/notes",
        "custom_fields": None,
    }
    cfg = setup.build_config({}, answers)
    assert cfg["personal_access_token"] == "PAT"
    assert cfg["user_gid"] == "SELF"
    assert cfg["accounts"]["Acme"]["domains"] == ["acme.com"]
    assert cfg["assignee_map"]["Sam"]["track_only"] is True
    assert cfg["notes_dir"] == "/tmp/notes"

def test_build_config_preserves_existing_unrelated_keys():
    existing = {"some_other_tool_key": "keep me"}
    answers = {"personal_access_token": "PAT", "user_gid": "SELF",
               "dashboard_project_id": None, "dashboard_sections": {},
               "accounts": {}, "assignee_map": {}, "internal_projects": {},
               "notes_dir": None, "custom_fields": None}
    cfg = setup.build_config(existing, answers)
    assert cfg["some_other_tool_key"] == "keep me"

def test_build_config_omits_none_custom_fields():
    answers = {"personal_access_token": "PAT", "user_gid": "SELF",
               "dashboard_project_id": None, "dashboard_sections": {},
               "accounts": {}, "assignee_map": {}, "internal_projects": {},
               "notes_dir": None, "custom_fields": None}
    cfg = setup.build_config({}, answers)
    assert "account_field_gid" not in cfg
