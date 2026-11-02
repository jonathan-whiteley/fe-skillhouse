#!/usr/bin/env python3
"""Resolve fuzzy due-date strings to YYYY-MM-DD.

CLI:  python3 due_date.py [--from YYYY-MM-DD] "<when>"
  --from is the reference day, normally the MEETING date: "Friday" said on Wed Oct 28 means Oct 30, even if the
  transcript is processed the next week. Default: today. Unrecognized text exits 1 (never a silent guess); a date
  that is already past prints a warning on stderr.
"""

import argparse
import re
import sys
from datetime import datetime, timedelta

DAY_MAP = {
    "monday": 0, "mon": 0,
    "tuesday": 1, "tue": 1,
    "wednesday": 2, "wed": 2,
    "thursday": 3, "thu": 3,
    "friday": 4, "fri": 4,
    "saturday": 5, "sat": 5,
    "sunday": 6, "sun": 6,
}

DEFAULT_DAYS = 7


def resolve(text: str, reference: datetime | None = None, strict: bool = False) -> str:
    """Return YYYY-MM-DD from a fuzzy date string. strict=True raises ValueError instead of guessing +7 days."""
    ref = reference or datetime.now()
    t = text.strip().lower()

    if not t:
        return (ref + timedelta(days=DEFAULT_DAYS)).strftime("%Y-%m-%d")

    # Already a date
    if re.match(r"^\d{4}-\d{2}-\d{2}$", t):
        return t

    # "by March 10" / "March 10" / "Mar 10, 2026"
    for fmt in ("%B %d, %Y", "%B %d %Y", "%b %d, %Y", "%b %d %Y", "%B %d", "%b %d"):
        try:
            parsed = datetime.strptime(t.replace("by ", "").strip(), fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=ref.year)
                if parsed < ref:
                    parsed = parsed.replace(year=ref.year + 1)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # EOW / end of week
    if t in ("eow", "end of week", "this week"):
        days_until_friday = (4 - ref.weekday()) % 7 or 7
        return (ref + timedelta(days=days_until_friday)).strftime("%Y-%m-%d")

    # EOD / today
    if t in ("eod", "today", "end of day"):
        return ref.strftime("%Y-%m-%d")

    # Tomorrow
    if t == "tomorrow":
        return (ref + timedelta(days=1)).strftime("%Y-%m-%d")

    # Next week
    if t in ("next week",):
        return (ref + timedelta(days=7)).strftime("%Y-%m-%d")

    # Next month
    if t in ("next month",):
        return (ref + timedelta(days=30)).strftime("%Y-%m-%d")

    # "by Thursday" / "this Thursday" / "next Monday" / "on Friday".
    # All resolve to the COMING instance of that weekday. When today already
    # is that weekday, the (0 -> 7) bump rolls to the same day next week, so
    # "next monday" on a Monday is +7 (consistent with "next week"), never +14.
    for prefix in ("by ", "this ", "next ", "on "):
        if t.startswith(prefix):
            day_name = t[len(prefix):].strip()
            if day_name in DAY_MAP:
                target = DAY_MAP[day_name]
                days_ahead = (target - ref.weekday()) % 7 or 7
                return (ref + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

    # Bare day name
    if t in DAY_MAP:
        target = DAY_MAP[t]
        days_ahead = (target - ref.weekday()) % 7 or 7
        return (ref + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

    # "+N days"
    m = re.match(r"\+?(\d+)\s*d(?:ays?)?", t)
    if m:
        return (ref + timedelta(days=int(m.group(1)))).strftime("%Y-%m-%d")

    if strict:
        raise ValueError(f"unrecognized due date: {text!r}")
    # Fallback: +7 days
    return (ref + timedelta(days=DEFAULT_DAYS)).strftime("%Y-%m-%d")


def main(argv=None):
    ap = argparse.ArgumentParser(description="Resolve a stated deadline to YYYY-MM-DD.")
    ap.add_argument("--from", dest="ref", help="reference day YYYY-MM-DD (the meeting date); default today")
    ap.add_argument("when", nargs="+", help='e.g. "Friday", "EOW", "next Monday", "Nov 19"')
    a = ap.parse_args(argv)
    ref = datetime.strptime(a.ref, "%Y-%m-%d") if a.ref else datetime.now()
    text = " ".join(a.when).strip()
    if not text:
        ap.error("no date given (tasks have no due date unless one was stated)")
    try:
        out = resolve(text, ref, strict=True)
    except ValueError as e:
        print(f"due_date: {e}; give a weekday, 'EOW', 'next week', '+N days', a month and day, or YYYY-MM-DD",
              file=sys.stderr)
        return 1
    if out < datetime.now().strftime("%Y-%m-%d"):
        print(f"warning: {out} is already past; confirm the date with the user", file=sys.stderr)
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
