from datetime import datetime

import due_date

MON = datetime(2026, 8, 24)  # a Monday
WED = datetime(2026, 8, 26)  # a Wednesday


def test_next_monday_on_a_monday_is_plus_7_not_14():
    # Regression: "next <weekday>" used to double-bump to +14 when today
    # already was that weekday.
    assert due_date.resolve("next monday", MON) == "2026-08-31"


def test_next_week_matches_next_monday():
    assert due_date.resolve("next week", MON) == "2026-08-31"


def test_bare_weekday_today_rolls_to_next_week():
    assert due_date.resolve("monday", MON) == "2026-08-31"


def test_this_friday_is_coming_friday():
    assert due_date.resolve("this friday", MON) == "2026-08-28"


def test_next_friday_no_double_bump():
    assert due_date.resolve("next friday", MON) == "2026-08-28"


def test_by_thursday_is_next_day():
    assert due_date.resolve("by thursday", WED) == "2026-08-27"


def test_next_wednesday_on_a_wednesday_is_plus_7():
    assert due_date.resolve("next wednesday", WED) == "2026-09-02"


def test_empty_defaults_to_plus_7():
    assert due_date.resolve("", MON) == "2026-08-31"
