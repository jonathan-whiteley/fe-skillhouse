"""Lint the visible copy of an open-slide deck for AI-slop tells and copy-rule breaks.

Usage: python3 deslop_lint.py <slides/<id>/index.tsx | slides/<id>/>

Extracts user-visible text (JSX text and prose-like string literals; comments, imports, class names,
style values and URLs are skipped) and reports:
  HARD  em/en dashes, emoji, leftover placeholders            -> exit 1; fix before delivering
  SOFT  hype words, "X, not Y" titles, "not just X but Y",
        "One X. One Y." motifs, exclamation marks,
        periods on short titles                               -> review each; rewrite if it reads as filler
Prints one line per finding: <severity> <line>: <rule>: "<text>".
"""
import re
import sys
from pathlib import Path

HARD = [
    ("em/en dash (use a colon, comma or parentheses)", re.compile("[–—]")),
    # Check/cross marks (U+2713-2718) are allowed; they're common in UI mock-ups and tables.
    ("emoji", re.compile("[\U0001F300-\U0001FAFF☀-⛿✀-✒✙-➿️]")),
    ("placeholder left in", re.compile(r"lorem ipsum|\bTODO\b|\bTBD\b|\bXX+%?|\[(?:placeholder|insert)[^\]]*\]|<insert", re.I)),
]
HYPE = (r"seamless(?:ly)?|unlock(?:s|ing)?|unleash(?:es|ing)?|game[- ]chang\w*|cutting[- ]edge|revolutioni[sz]\w*|"
        r"supercharg\w*|empower\w*|elevat(?:e|es|ing)|delv(?:e|es|ing)|robust|synerg\w*|best[- ]in[- ]class|"
        r"world[- ]class|next[- ]gen(?:eration)?|transformative|harness(?:ing)? the power|in today's|"
        r"leverag(?:e|es|ing) (?:the|our|your|its)|paradigm|turbocharg\w*|effortless(?:ly)?")
SOFT = [
    ("hype word", re.compile(rf"\b(?:{HYPE})\b", re.I)),
    ('"X, not Y" title formula', re.compile(r"^[^.!?]{3,60}, not [^.!?]{2,40}[.!]?$", re.I)),
    ('"not just X, but Y"', re.compile(r"\bnot (?:just|only|merely) [^.]{1,60}\bbut\b|\bit'?s not [^.]{1,40}, it'?s\b", re.I)),
    ('"One X. One Y." motif', re.compile(r"\bOne \w+\.\s+One \w+\.", re.I)),
    ("exclamation mark", re.compile(r"!(?:\s|$)")),
]

SKIP_LINE = re.compile(r"^\s*(?:import |export \{|//|\*|/\*)|className=|fontFamily|letterSpacing|"
                       r"\bhref=|\bsrc=|url\(|rgba?\(|#[0-9a-fA-F]{3,8}\b|@keyframes|var\(--")
JSX_TEXT = re.compile(r">([^<>{}]*[A-Za-z][^<>{}]*)<")
STRING = re.compile(r"""(?<![\w$])(['"`])((?:\\.|(?!\1).)*?)\1""")


def prose(s):
    """A string literal that reads like copy: has letters and a space, isn't code/CSS/a path."""
    s = s.strip()
    if len(s) < 4 or " " not in s or not re.search(r"[A-Za-z]{2}", s):
        return False
    if re.match(r"^(?:https?:|/|\.|@|#|--)", s) or "${" in s:
        return False
    if re.search(r"[;{}]|\b\d+px\b|\b(?:flex|grid|solid|inherit|absolute|relative|center)\b", s):
        return False
    return True


def visible_text(src):
    src = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), src, flags=re.S)
    for n, line in enumerate(src.splitlines(), 1):
        if SKIP_LINE.search(line):
            # still read JSX text on lines that also carry a className
            for m in JSX_TEXT.finditer(line):
                yield n, m.group(1).strip()
            continue
        for m in JSX_TEXT.finditer(line):
            yield n, m.group(1).strip()
        for m in STRING.finditer(line):
            if prose(m.group(2)):
                yield n, m.group(2).strip()


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    p = Path(sys.argv[1]).expanduser()
    if p.is_dir():
        p = p / "index.tsx"
    findings = []
    seen = set()
    for n, text in visible_text(p.read_text()):
        if not text or (n, text) in seen:
            continue
        seen.add((n, text))
        for sev, rules in (("HARD", HARD), ("SOFT", SOFT)):
            for name, rx in rules:
                if rx.search(text):
                    findings.append((sev, n, name, text))
        if len(text.split()) <= 6 and text.endswith(".") and not text.endswith("..") and text[:1].isupper() \
                and not re.search(r"\b(?:Inc|Ltd|etc|vs|e\.g|i\.e)\.$", text):
            findings.append(("SOFT", n, "period on a short title (titles take no period)", text))
    for sev, n, name, text in sorted(findings, key=lambda f: (f[0] != "HARD", f[1])):
        print(f'{sev} {n}: {name}: "{text[:110]}"')
    hard = sum(f[0] == "HARD" for f in findings)
    print(f"{p}: {hard} hard, {len(findings) - hard} soft")
    sys.exit(1 if hard else 0)


if __name__ == "__main__":
    main()
