"""Download the Databricks brand pack (internal, databricks.com-only Drive file) into an open-slide project.

Usage: python3 fetch_brand_pack.py --dest <project>/assets/brand

The pack is not in the plugin repo because the repo is public. It is fetched with the Google auth that
fe-google-tools already set up (run /google-auth first if this fails with 401/403).
"""
import argparse, glob, hashlib, io, os, subprocess, sys, urllib.error, urllib.request, zipfile

FILE_ID = '1QGFPZYzaFuF8w46UUoFS6SiUHcXrVNfL'  # My Drive/open-slide brand pack/dbx-open-slide-brand-pack.zip
SHA256 = 'ff8f079005892264045e78e25c471be933556d8de3fc16c15059e5dc4fcaf0e7'
QUOTA = 'gcp-dev-field-eng-aiapiquota'


def find_auth():
    """Locate fe-google-tools' google_auth.py (vibe marketplace checkout first, then plugin cache)."""
    cands = [os.path.expanduser('~/.vibe/marketplace/plugins/fe-google-tools/skills/google-auth/resources/google_auth.py')]
    cands += sorted(glob.glob(os.path.expanduser('~/.claude/plugins/cache/*/fe-google-tools/*/skills/google-auth/resources/google_auth.py')), reverse=True)
    for c in cands:
        if os.path.exists(c):
            return c
    sys.exit('google_auth.py not found: install fe-google-tools and run /google-auth')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dest', required=True, help='target folder, normally <project>/assets/brand')
    ap.add_argument('--file-id', default=FILE_ID)
    ap.add_argument('--sha256', default=SHA256, help="expected hash; pass '' to skip when using another --file-id")
    a = ap.parse_args()

    tok = subprocess.check_output([sys.executable, find_auth(), 'token'], text=True).strip()
    req = urllib.request.Request(f'https://www.googleapis.com/drive/v3/files/{a.file_id}?alt=media',
                                 headers={'Authorization': f'Bearer {tok}', 'x-goog-user-project': QUOTA})
    try:
        with urllib.request.urlopen(req) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f'download failed: HTTP {e.code}. 401: run /google-auth. 403/404: you need a databricks.com '
                 f'Google account (the pack is shared with the domain only).')

    digest = hashlib.sha256(data).hexdigest()
    if a.sha256 and digest != a.sha256:
        sys.exit(f'sha256 mismatch: got {digest}, expected {a.sha256}. The pack changed; update the plugin.')

    os.makedirs(a.dest, exist_ok=True)
    n = 0
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for info in z.infolist():
            name = os.path.basename(info.filename)  # flat pack: never trust paths inside the zip
            if not name.endswith('.svg') or info.is_dir():
                continue
            with open(os.path.join(a.dest, name), 'wb') as f:
                f.write(z.read(info))
            n += 1
    print(f'extracted {n} brand SVGs to {a.dest}')


if __name__ == '__main__':
    main()
