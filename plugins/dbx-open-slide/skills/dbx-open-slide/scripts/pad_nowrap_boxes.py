"""Widen wrap="none" text boxes in an open-slide PPTX so Google Slides doesn't re-wrap them.

open-slide sizes each text box to the browser-measured width and sets wrap="none".
PowerPoint honours that; Google Slides' importer ignores it and wraps at the box edge,
where its DM Sans metrics run a few percent wider. Padding the box is a no-op in
PowerPoint (the text never wraps there) and stops the early wraps in Slides.

It also rewrites exact line spacing (spcPts) as a percentage. Slides imports spcPts as
"pts / font size" percent of the font's natural line height (~1.3em for DM Sans), so tight
leading grows ~30% and multi-line titles push into whatever sits below them.
"""
import argparse, re, shutil, sys, tempfile, zipfile

EMU_PER_PT = 12700


def pad_slide(xml, slide_w, scale, extra_emu):
    changed = 0

    def fix(m):
        nonlocal changed
        sp = m.group(0)
        if not re.search(r'<a:bodyPr[^>]*wrap="none"', sp):
            return sp
        xf = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>\s*<a:ext cx="(\d+)" cy="(\d+)"/>', sp)
        if not xf:
            return sp
        x, y, cx, cy = map(int, xf.groups())
        algn = (re.search(r'<a:pPr[^>]*algn="(\w+)"', sp) or [None, 'l'])[1]
        delta = int(cx * (scale - 1)) + extra_emu
        if algn == 'ctr':
            nx = x - delta // 2
        elif algn == 'r':
            nx = x - delta
        else:
            nx = x
        nx = max(0, nx)
        ncx = min(cx + delta, slide_w - nx)
        if ncx <= cx and nx == x:
            return sp
        changed += 1
        return sp[:xf.start()] + f'<a:off x="{nx}" y="{y}"/><a:ext cx="{ncx}" cy="{cy}"/>' + sp[xf.end():]

    return re.sub(r'<p:sp>.*?</p:sp>', fix, xml, flags=re.S), changed


def fix_line_spacing(xml, line_metric):
    """Convert exact spcPts line spacing to spcPct relative to the font's natural line height."""
    changed = 0

    def fix(m):
        nonlocal changed
        para = m.group(0)
        ls = re.search(r'<a:lnSpc><a:spcPts val="(\d+)"/></a:lnSpc>', para)
        sz = re.search(r'<a:(?:rPr|endParaRPr)[^>]*\ssz="(\d+)"', para)
        if not ls or not sz:
            return para
        pct = int(int(ls.group(1)) / int(sz.group(1)) / line_metric * 100000)
        changed += 1
        return para[:ls.start()] + f'<a:lnSpc><a:spcPct val="{pct}"/></a:lnSpc>' + para[ls.end():]

    return re.sub(r'<a:p>.*?</a:p>', fix, xml, flags=re.S), changed


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('src')
    ap.add_argument('dst')
    ap.add_argument('--scale', type=float, default=1.15, help='width multiplier (default 1.15)')
    ap.add_argument('--extra-pt', type=float, default=8, help='fixed extra width in pt (default 8)')
    ap.add_argument('--line-metric', type=float, default=1.302,
                    help="font's natural line height in em, DM Sans = 1.302 (0 keeps exact spacing)")
    a = ap.parse_args()
    with zipfile.ZipFile(a.src) as zin:
        pres = zin.read('ppt/presentation.xml').decode()
        slide_w = int(re.search(r'<p:sldSz cx="(\d+)"', pres).group(1))
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.pptx')
        total = lines = 0
        with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)
                if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
                    xml, n = pad_slide(data.decode(), slide_w, a.scale, int(a.extra_pt * EMU_PER_PT))
                    total += n
                    if a.line_metric:
                        xml, n = fix_line_spacing(xml, a.line_metric)
                        lines += n
                    data = xml.encode()
                zout.writestr(item, data)
    shutil.move(tmp.name, a.dst)
    print(f'padded {total} wrap="none" text boxes, converted {lines} line spacings -> {a.dst}')


if __name__ == '__main__':
    sys.exit(main())
