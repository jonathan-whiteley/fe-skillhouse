"""Fetch candidate releases for a window from the official Databricks release-note RSS feeds.

Usage:
    python3 fetch_feeds.py --clouds azure [--days 14 | --since YYYY-MM-DD] [--until YYYY-MM-DD]
                           [--exclude "Lakebase,Clean Rooms"] --out /tmp/new-this-week/<slug>-candidates.json

The window is inclusive and ends --until (default today): --days 14 on Oct 30 means Oct 17 through Oct 30.
Items announced on several clouds are merged into one candidate with a link per cloud. Items matching an
--exclude term (title, text, or category; case-insensitive, whole word) are dropped before curation.

Each candidate: title, date, status_hint (from the title or text: GA / Public Preview / Beta / Private
Preview / Experimental, else null), url (the release note entry on the first cloud), doc_url (the feature's
own docs page linked from the entry, if any), links per cloud, categories, text (plain, trimmed).
"""
import argparse
import datetime as dt
import email.utils
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin

FEEDS = {
    "aws": "https://docs.databricks.com/aws/en/feed.xml",
    "azure": "https://learn.microsoft.com/en-us/azure/databricks/feed.xml",
    "gcp": "https://docs.databricks.com/gcp/en/feed.xml",
}
BASES = {"aws": "https://docs.databricks.com", "azure": "https://learn.microsoft.com", "gcp": "https://docs.databricks.com"}
STATUS_PATTERNS = [
    ("Private Preview", r"\bprivate preview\b"),
    ("Public Preview", r"\bpublic preview\b"),
    ("Beta", r"\bbeta\b"),
    ("Experimental", r"\bexperimental\b"),
    ("GA", r"\b(?:generally available|general availability|\(GA\)|is now GA)\b"),
]


def plain(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment or ""))).strip()


def status_hint(title, text):
    m = re.search(r"\(([^)]+)\)\s*$", title)
    hay = [m.group(1)] if m else []
    hay.append(text[:400])
    for blob in hay:
        for label, rx in STATUS_PATTERNS:
            if re.search(rx, blob, re.I):
                return label
    return None


def doc_link(desc_html, cloud):
    """First link in the entry that points at a feature page, not back into the release notes."""
    for href in re.findall(r'href="([^"]+)"', desc_html or ""):
        url = urljoin(BASES[cloud], html.unescape(href))
        if "release-notes" not in url and url.startswith("https://"):
            return url
    return None


def fetch(cloud):
    req = urllib.request.Request(FEEDS[cloud], headers={"User-Agent": "new-this-week/1.1"})
    with urllib.request.urlopen(req, timeout=60) as r:
        root = ET.fromstring(r.read())
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        desc = it.findtext("description") or ""
        pub = email.utils.parsedate_to_datetime(it.findtext("pubDate")).date()
        text = plain(desc)
        yield {
            "cloud": cloud, "title": title, "date": pub, "url": (it.findtext("link") or "").strip(),
            "doc_url": doc_link(desc, cloud), "categories": [c.text for c in it.findall("category") if c.text],
            "text": text, "status_hint": status_hint(title, text),
        }


def norm(title):
    return re.sub(r"[^a-z0-9]+", " ", re.sub(r"\s*\([^)]*\)\s*$", "", title.lower())).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clouds", required=True, help="comma-separated: aws, azure, gcp (first one is primary)")
    ap.add_argument("--days", type=int, help="window length in days, inclusive of --until")
    ap.add_argument("--since", help="YYYY-MM-DD (instead of --days)")
    ap.add_argument("--until", help="YYYY-MM-DD, default today")
    ap.add_argument("--exclude", default="", help="comma-separated products/terms to drop before curation")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    clouds = [c.strip().lower() for c in a.clouds.split(",") if c.strip()]
    bad = [c for c in clouds if c not in FEEDS]
    if bad or not clouds:
        sys.exit(f"--clouds must be from {list(FEEDS)}; got {a.clouds!r}")
    until = dt.date.fromisoformat(a.until) if a.until else dt.date.today()
    if a.since:
        since = dt.date.fromisoformat(a.since)
    elif a.days:
        since = until - dt.timedelta(days=a.days - 1)
    else:
        sys.exit("give --days or --since")
    excludes = [t.strip() for t in a.exclude.split(",") if t.strip()]
    ex_rx = [re.compile(rf"(?<![A-Za-z0-9]){re.escape(t)}(?![A-Za-z0-9])", re.I) for t in excludes]

    merged, excluded, failed = {}, 0, []
    for cloud in clouds:
        try:
            entries = list(fetch(cloud))
        except Exception as e:  # report and keep going with the other clouds
            failed.append(f"{cloud}: {e}")
            continue
        for e in entries:
            if not since <= e["date"] <= until:
                continue
            blob = " ".join([e["title"], e["text"], *e["categories"]])
            if any(rx.search(blob) for rx in ex_rx):
                excluded += 1
                continue
            key = (norm(e["title"]), e["date"].isoformat())
            c = merged.setdefault(key, {
                "title": e["title"], "date": e["date"].isoformat(), "status_hint": e["status_hint"],
                "url": e["url"], "doc_url": e["doc_url"], "links": {}, "categories": e["categories"], "text": e["text"][:700],
            })
            c["links"][cloud] = e["url"]
            c["doc_url"] = c["doc_url"] or e["doc_url"]
            c["status_hint"] = c["status_hint"] or e["status_hint"]
    if failed and not merged:
        sys.exit("all feeds failed: " + "; ".join(failed))
    items = sorted(merged.values(), key=lambda c: c["date"], reverse=True)
    out = {"window": {"since": since.isoformat(), "until": until.isoformat()}, "clouds": clouds,
           "excluded_terms": excludes, "excluded_count": excluded, "feed_errors": failed, "count": len(items), "items": items}
    Path(a.out).expanduser().parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).expanduser().write_text(json.dumps(out, indent=2))
    print(f"{len(items)} candidates {since}..{until} on {','.join(clouds)}; excluded {excluded}"
          + (f"; FEED ERRORS: {'; '.join(failed)}" if failed else "") + f" -> {a.out}")


if __name__ == "__main__":
    main()
