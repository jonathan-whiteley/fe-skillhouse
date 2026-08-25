from pathlib import Path

import urllib.error

import pytest

import sync_tasks

def test_notes_root_from_config():
    cfg = {"notes_dir": "/tmp/notes"}
    assert sync_tasks.notes_root(cfg, []) == Path("/tmp/notes")

def test_notes_root_from_cli_flag():
    cfg = {}
    assert sync_tasks.notes_root(cfg, ["--notes-dir", "/tmp/cli"]) == Path("/tmp/cli")

def test_notes_root_config_beats_cli():
    cfg = {"notes_dir": "/tmp/cfg"}
    assert sync_tasks.notes_root(cfg, ["--notes-dir", "/tmp/cli"]) == Path("/tmp/cfg")

def test_notes_root_defaults_to_cwd():
    cfg = {}
    assert sync_tasks.notes_root(cfg, []) == Path.cwd()


# --- Pagination -------------------------------------------------------------

def test_api_get_all_follows_next_page(monkeypatch):
    # Two pages: first returns a cursor, second closes it out.
    pages = [
        {"data": [{"gid": "1"}, {"gid": "2"}], "next_page": {"offset": "abc"}},
        {"data": [{"gid": "3"}], "next_page": None},
    ]
    calls = []

    def fake_api_call(path, token):
        calls.append(path)
        return pages[len(calls) - 1]

    monkeypatch.setattr(sync_tasks, "api_call", fake_api_call)
    items = sync_tasks.api_get_all("/projects/9/tasks?opt_fields=name&limit=100", "tok")

    assert [i["gid"] for i in items] == ["1", "2", "3"]
    assert len(calls) == 2
    assert "offset=abc" in calls[1]  # cursor threaded into the second request


def test_api_get_all_single_page(monkeypatch):
    monkeypatch.setattr(
        sync_tasks, "api_call",
        lambda path, token: {"data": [{"gid": "1"}], "next_page": None},
    )
    items = sync_tasks.api_get_all("/projects/9/tasks?limit=100", "tok")
    assert [i["gid"] for i in items] == ["1"]


# --- 401 handling -----------------------------------------------------------

def test_api_call_401_exits_with_reauth(monkeypatch):
    def raise_401(req):
        raise urllib.error.HTTPError(req.full_url, 401, "Unauthorized", {}, None)

    monkeypatch.setattr(sync_tasks.urllib.request, "urlopen", raise_401)
    with pytest.raises(SystemExit) as exc:
        sync_tasks.api_call("/users/me", "expired")
    assert exc.value.code == 2  # clean reauth exit, not an uncaught traceback


def test_api_call_non_401_reraises(monkeypatch):
    def raise_500(req):
        raise urllib.error.HTTPError(req.full_url, 500, "Server Error", {}, None)

    monkeypatch.setattr(sync_tasks.urllib.request, "urlopen", raise_500)
    with pytest.raises(urllib.error.HTTPError):
        sync_tasks.api_call("/users/me", "tok")
