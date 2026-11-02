"""Turn a curated content JSON into an open-slide deck: <project>/slides/<slide-id>/index.tsx.

Usage:
    python3 make_deck.py <content.json> --project <open-slide project dir> --forbid "term1,term2" [--slide-id ID] [--force]

Checks the content against the copy rules first (schema, statuses, public links, no em/en dashes) and
exits 1 with every problem listed. Then the leak check: any --forbid term (internal codenames, use-case
codes, excluded products) found in the slide's text or link URLs exits 2 with each hit in context, and
nothing is written. --forbid is required; pass --forbid "" only when the user said there are none.
Prints the slide id and file path on success.
"""
import argparse
import datetime
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE.parent / "deck" / "index.tsx.template"
STATUSES = {"GA", "Public Preview", "Beta", "New"}
PILLARS = ["Genie & BI", "Data Eng & Platform/Governance", "Data Science & AI"]
INTERNAL_HOSTS = ("slack.com", "glean.com", "docs.google.com", "drive.google.com", "databricksapps.com",
                  "atlassian.net", "salesforce.com", "lightning.force.com")
DASHES = re.compile("[–—]")


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def strings(obj, path=""):
    """Yield (path, string) for every string in the content."""
    if isinstance(obj, str):
        yield path, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield from strings(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from strings(v, f"{path}[{i}]")


def check_url(u, where, problems):
    p = urlparse(u or "")
    host = p.netloc.lower()
    if p.scheme != "https" or not host:
        problems.append(f"{where}: not a public https URL: {u!r}")
    elif "<your-workspace>" in u:
        pass
    elif any(host == h or host.endswith("." + h) for h in INTERNAL_HOSTS) or host.endswith(".cloud.databricks.com") \
            or host.startswith("go") and "." not in host:
        problems.append(f"{where}: internal or workspace link not allowed on a customer slide: {u}")


def validate(c):
    problems, warnings = [], []
    for k in ("customer", "as_of", "pillars"):
        if not c.get(k):
            problems.append(f"missing required field: {k}")
    if c.get("as_of") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", c["as_of"]):
        problems.append(f"as_of must be YYYY-MM-DD, got {c['as_of']!r}")
    pillars = c.get("pillars") or []
    if [p.get("name") for p in pillars] != PILLARS:
        problems.append(f"pillars must be exactly {PILLARS} in that order, got {[p.get('name') for p in pillars]}")
    headlines, total = 0, 0
    for pi, p in enumerate(pillars):
        items = p.get("items") or []
        if not items:
            warnings.append(f"pillar {p.get('name')!r} has no items (give it its single best platform-level update)")
        if len(items) > 4:
            warnings.append(f"pillar {p.get('name')!r} has {len(items)} items; keep 2-4 per pillar or the column will overflow")
        for ii, it in enumerate(items):
            where = f"pillars[{pi}].items[{ii}] ({it.get('title', '?')})"
            total += 1
            headlines += bool(it.get("headline"))
            for k in ("title", "status", "url", "what", "why"):
                if not it.get(k):
                    problems.append(f"{where}: missing {k}")
            if it.get("status") and it["status"] not in STATUSES:
                problems.append(f"{where}: status must be one of {sorted(STATUSES)}, got {it['status']!r}")
            check_url(it.get("url"), where, problems)
    if headlines > 1:
        problems.append(f"at most one item may have headline: true (found {headlines})")
    if pillars and not 7 <= total <= 11:
        warnings.append(f"{total} items total; the brief works best with 7-11")
    for si, s in enumerate(c.get("spotlights") or []):
        where = f"spotlights[{si}] ({s.get('title', '?')})"
        for k in ("title", "status", "url", "value", "for_customer", "steps", "controls", "observe"):
            if not s.get(k):
                problems.append(f"{where}: missing {k}")
        if s.get("status") and s["status"] not in STATUSES:
            problems.append(f"{where}: status must be one of {sorted(STATUSES)}")
        check_url(s.get("url"), where, problems)
        for li, l in enumerate(s.get("links") or []):
            check_url(l.get("url"), f"{where}.links[{li}]", problems)
    for path, s in strings(c):
        if DASHES.search(s):
            problems.append(f"{path}: contains an em or en dash (use a colon, comma or parentheses): {s!r}")
    return problems, warnings


def leaks(content, terms):
    """{term: [snippets]} for forbidden terms anywhere in the slide's strings, including URLs."""
    hits = {}
    for path, s in strings(content):
        for t in terms:
            for m in re.finditer(rf"(?<![A-Za-z0-9]){re.escape(t)}(?![A-Za-z0-9])", s, re.I):
                hits.setdefault(t, []).append(f"{path}: ...{s[max(0, m.start() - 40):m.end() + 40]}...")
    return hits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("content")
    ap.add_argument("--project", required=True, help="open-slide project dir (dbx-open-slide's project_dir)")
    ap.add_argument("--slide-id", help="default: new-this-week-<customer>-<as_of>")
    ap.add_argument("--force", action="store_true", help="overwrite an existing deck with the same id")
    ap.add_argument("--forbid", required=True,
                    help='comma-separated internal terms that must not reach the slide; "" if the user named none')
    a = ap.parse_args()

    content = json.loads(Path(a.content).read_text())
    problems, warnings = validate(content)
    for w in warnings:
        print(f"warning: {w}", file=sys.stderr)
    if problems:
        print("content check failed:\n  - " + "\n  - ".join(problems), file=sys.stderr)
        sys.exit(1)
    terms = [t.strip() for t in a.forbid.split(",") if t.strip()]
    hits = leaks(content, terms)
    if hits:
        print("leak check failed: forbidden terms on the slide (rewrite these; never drop a term to pass):",
              file=sys.stderr)
        for t, snippets in hits.items():
            for sn in snippets:
                print(f"  - {t!r} in {sn}", file=sys.stderr)
        sys.exit(2)

    project = Path(a.project).expanduser()
    if not (project / "open-slide.config.ts").exists():
        sys.exit(f"not an open-slide project: {project} (run the dbx-open-slide skill's setup first)")
    slide_id = a.slide_id or f"new-this-week-{slug(content['customer'])}-{content['as_of']}"
    out = project / "slides" / slide_id / "index.tsx"

    created = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    if out.exists():
        if not a.force:
            sys.exit(f"{out} exists; pass --force to regenerate it")
        m = re.search(r"createdAt: '([^']+)'", out.read_text())
        created = m.group(1) if m else created  # keep the original sort position

    title = f"{content.get('kicker') or 'New This Week'}: {content['customer']} ({content['as_of']})"
    tsx = (TEMPLATE.read_text()
           .replace("/*__CONTENT__*/", json.dumps(content, indent=2, ensure_ascii=False))
           .replace("__SLIDE_ID__", slide_id)
           .replace("__TITLE__", title.replace("\\", "\\\\").replace("'", "\\'"))
           .replace("__CREATED_AT__", created))
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(tsx)
    print(json.dumps({"slide_id": slide_id, "file": str(out), "leak_check": f"passed ({len(terms)} terms)",
                      "items": sum(len(p["items"]) for p in content["pillars"]),
                      "spotlights": len(content.get("spotlights") or [])}))


if __name__ == "__main__":
    main()
