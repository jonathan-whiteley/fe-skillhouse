#!/usr/bin/env python3
"""Resolve fuzzy due-date strings to YYYY-MM-DD."""

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


def resolve(text: str, reference: datetime | None = None) -> str:
    """Return YYYY-MM-DD from a fuzzy date string."""
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

    # Fallback: +7 days
    return (ref + timedelta(days=DEFAULT_DAYS)).strftime("%Y-%m-%d")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(resolve(" ".join(sys.argv[1:])))
    else:
        print(resolve(""))
