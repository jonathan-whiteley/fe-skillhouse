"""Upload a PPTX to Google Drive as a native Google Slides deck, in a named My Drive folder.

Re-running with the same --name updates the existing deck in place (same file ID/URL).
"""
import argparse, glob, json, os, subprocess, sys, urllib.parse, urllib.request, uuid

QUOTA = 'gcp-dev-field-eng-aiapiquota'


def find_auth():
    """Locate fe-google-tools' google_auth.py (vibe marketplace checkout first, then plugin cache)."""
    cands = [os.path.expanduser('~/.vibe/marketplace/plugins/fe-google-tools/skills/google-auth/resources/google_auth.py')]
    cands += sorted(glob.glob(os.path.expanduser('~/.claude/plugins/cache/*/fe-google-tools/*/skills/google-auth/resources/google_auth.py')), reverse=True)
    for c in cands:
        if os.path.exists(c):
            return c
    sys.exit('google_auth.py not found: install fe-google-tools and run /google-auth')
FOLDER_MIME = 'application/vnd.google-apps.folder'
SLIDES_MIME = 'application/vnd.google-apps.presentation'
PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'


def token():
    return subprocess.check_output([sys.executable, find_auth(), 'token'], text=True).strip()


def call(method, url, tok, body=None, headers=None):
    h = {'Authorization': f'Bearer {tok}', 'x-goog-user-project': QUOTA, **(headers or {})}
    if isinstance(body, dict):
        body = json.dumps(body).encode()
        h['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, method=method, headers=h)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read() or b'{}')


def find(tok, q):
    url = 'https://www.googleapis.com/drive/v3/files?' + urllib.parse.urlencode(
        {'q': q, 'fields': 'files(id,name,webViewLink)', 'spaces': 'drive'})
    return call('GET', url, tok)['files']


def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")


def ensure_folder(tok, path):
    """Walk a slash-separated My Drive path (e.g. 'open-slide/Event'), creating missing folders."""
    parent, created = 'root', False
    for name in [p for p in path.split('/') if p]:
        hits = find(tok, f"name = '{esc(name)}' and mimeType = '{FOLDER_MIME}' and '{parent}' in parents and trashed = false")
        if hits:
            parent = hits[0]['id']
            continue
        parent = call('POST', 'https://www.googleapis.com/drive/v3/files?fields=id', tok,
                      {'name': name, 'mimeType': FOLDER_MIME, 'parents': [parent]})['id']
        created = True
    return parent, created


def upload(tok, path, name, folder_id):
    hits = find(tok, f"name = '{esc(name)}' and mimeType = '{SLIDES_MIME}' and '{folder_id}' in parents and trashed = false")
    meta = {'name': name}
    if hits:
        method, url = 'PATCH', f"https://www.googleapis.com/upload/drive/v3/files/{hits[0]['id']}?uploadType=multipart&fields=id,name,webViewLink"
    else:
        meta.update(mimeType=SLIDES_MIME, parents=[folder_id])
        method, url = 'POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink'
    b = uuid.uuid4().hex
    with open(path, 'rb') as f:
        data = f.read()
    body = (f'--{b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{json.dumps(meta)}\r\n'
            f'--{b}\r\nContent-Type: {PPTX_MIME}\r\n\r\n').encode() + data + f'\r\n--{b}--\r\n'.encode()
    res = call(method, url, tok, body, {'Content-Type': f'multipart/related; boundary={b}'})
    res['action'] = 'updated' if hits else 'created'
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--file', required=True)
    ap.add_argument('--name', required=True, help='Google Slides title (also the update key)')
    ap.add_argument('--folder', default='open-slide', help="My Drive folder path, e.g. 'open-slide' or 'open-slide/Event' (created if missing)")
    a = ap.parse_args()
    tok = token()
    folder_id, created = ensure_folder(tok, a.folder)
    res = upload(tok, a.file, a.name, folder_id)
    print(json.dumps({'folder': a.folder, 'folder_id': folder_id, 'folder_created': created, **res}, indent=2))


if __name__ == '__main__':
    main()
