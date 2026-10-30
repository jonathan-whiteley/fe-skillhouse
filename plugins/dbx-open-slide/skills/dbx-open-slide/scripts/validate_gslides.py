"""Validate a Google Slides deck converted from an open-slide PPTX: per-slide editable text, fonts, thumbnails."""
import argparse, glob, json, os, subprocess, sys, urllib.request

QUOTA = 'gcp-dev-field-eng-aiapiquota'


def find_auth():
    """Locate fe-google-tools' google_auth.py (vibe marketplace checkout first, then plugin cache)."""
    cands = [os.path.expanduser('~/.vibe/marketplace/plugins/fe-google-tools/skills/google-auth/resources/google_auth.py')]
    cands += sorted(glob.glob(os.path.expanduser('~/.claude/plugins/cache/*/fe-google-tools/*/skills/google-auth/resources/google_auth.py')), reverse=True)
    for c in cands:
        if os.path.exists(c):
            return c
    sys.exit('google_auth.py not found: install fe-google-tools and run /google-auth')


def get(url, tok):
    req = urllib.request.Request(url, headers={'Authorization': f'Bearer {tok}', 'x-goog-user-project': QUOTA})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def walk(elements):
    for el in elements:
        yield el
        if 'elementGroup' in el:
            yield from walk(el['elementGroup']['children'])


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--id', required=True)
    ap.add_argument('--thumbs', help='directory to save LARGE PNG thumbnails into')
    a = ap.parse_args()
    tok = subprocess.check_output([sys.executable, find_auth(), 'token'], text=True).strip()
    deck = get(f'https://slides.googleapis.com/v1/presentations/{a.id}', tok)
    out = {'title': deck['title'], 'slides': []}
    for n, s in enumerate(deck['slides'], 1):
        texts, fonts, images = [], set(), 0
        for el in walk(s.get('pageElements', [])):
            if 'image' in el:
                images += 1
            for te in el.get('shape', {}).get('text', {}).get('textElements', []):
                run = te.get('textRun')
                if run and run['content'].strip():
                    texts.append(run['content'].strip())
                    ff = run.get('style', {}).get('fontFamily')
                    if ff:
                        fonts.add(ff)
        info = {'slide': n, 'text_runs': len(texts), 'images': images, 'fonts': sorted(fonts), 'first_text': texts[:2]}
        if a.thumbs:
            os.makedirs(a.thumbs, exist_ok=True)
            t = get(f"https://slides.googleapis.com/v1/presentations/{a.id}/pages/{s['objectId']}/thumbnail?thumbnailProperties.thumbnailSize=LARGE", tok)
            path = os.path.join(a.thumbs, f'slide-{n}.png')
            urllib.request.urlretrieve(t['contentUrl'], path)
            info['thumbnail'] = path
        out['slides'].append(info)
    print(json.dumps(out, indent=2))


if __name__ == '__main__':
    main()
