import asana_client

def test_assignee_bare_string_gid():
    cfg = {"user_gid": "SELF", "assignee_map": {"Alex": "GID_ALEX"}}
    assert asana_client.resolve_assignee(cfg, "Alex") == ("GID_ALEX", None)

def test_assignee_track_only_maps_to_self_with_proxy_owner():
    cfg = {"user_gid": "SELF", "assignee_map": {"Sam": {"gid": "GID_SAM", "track_only": True}}}
    # Parked on self, but the owner name is returned so callers can attribute it.
    assert asana_client.resolve_assignee(cfg, "Sam") == ("SELF", "Sam")

def test_assignee_dict_not_track_only():
    cfg = {"user_gid": "SELF", "assignee_map": {"Sam": {"gid": "GID_SAM", "track_only": False}}}
    assert asana_client.resolve_assignee(cfg, "Sam") == ("GID_SAM", None)

def test_assignee_unknown_name_falls_back_to_self():
    cfg = {"user_gid": "SELF", "assignee_map": {}}
    assert asana_client.resolve_assignee(cfg, "Nobody") == ("SELF", None)

def test_assignee_none_defaults_to_self():
    cfg = {"user_gid": "SELF", "assignee_map": {}}
    assert asana_client.resolve_assignee(cfg, None) == ("SELF", None)


# --- track_only prefixes the task name (config_schema.md promise) -----------

def _capture_created_task(monkeypatch):
    """Stub the network so create_task runs offline; capture the POST payload."""
    captured = {}

    def fake_api_call(method, path, token, data=None):
        if method == "POST" and path == "/tasks":
            captured["task"] = data
            return {"data": {"gid": "NEW_GID"}}
        return {"data": {}}  # section moves, multi-home, custom fields

    monkeypatch.setattr(asana_client, "api_call", fake_api_call)
    return captured


def test_track_only_owner_prefixes_task_name(monkeypatch):
    captured = _capture_created_task(monkeypatch)
    cfg = {
        "personal_access_token": "tok",
        "user_gid": "SELF",
        "assignee_map": {"Sam": {"gid": "GID_SAM", "track_only": True}},
        "accounts": {"Acme": {"ae_project_id": "P1"}},
    }
    asana_client.create_task(cfg, {"account": "Acme", "text": "Send recap", "assignee": "Sam"})
    assert captured["task"]["name"] == "[Sam] Send recap"
    assert captured["task"]["assignee"] == "SELF"


def test_real_assignee_name_not_prefixed(monkeypatch):
    captured = _capture_created_task(monkeypatch)
    cfg = {
        "personal_access_token": "tok",
        "user_gid": "SELF",
        "assignee_map": {"Sam": {"gid": "GID_SAM"}},
        "accounts": {"Acme": {"ae_project_id": "P1"}},
    }
    asana_client.create_task(cfg, {"account": "Acme", "text": "Send recap", "assignee": "Sam"})
    assert captured["task"]["name"] == "Send recap"
    assert captured["task"]["assignee"] == "GID_SAM"
