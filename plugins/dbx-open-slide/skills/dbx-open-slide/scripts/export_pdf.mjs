// Export an open-slide deck to one multi-page PDF (1920x1080 pages, live links) without a print dialog.
//
// open-slide's own "Export as PDF" renders every page into a print root, waits for fonts and animations,
// then calls window.print() and waits for `afterprint`. This script drives that same export in headless
// Chrome over the DevTools protocol, swaps window.print() for a stub, prints with Page.printToPDF (which
// honours open-slide's @page size and keeps <a href> links), then fires `afterprint` so it cleans up.
//
// Usage:  node export_pdf.mjs <dev-server-url> <slide-id> <out.pdf>
//   e.g.  node export_pdf.mjs http://localhost:5173/ lakebase-overview ~/Downloads/lakebase-overview.pdf
// Needs: Node 22+ (built-in WebSocket), Google Chrome, and the project's dev server running (npm run dev).
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, resolve } from 'node:path';

const [base, slideId, outArg] = process.argv.slice(2);
if (!base || !slideId || !outArg) {
  console.error('usage: node export_pdf.mjs <dev-server-url> <slide-id> <out.pdf>');
  process.exit(2);
}
const out = resolve(outArg.replace(/^~(?=\/)/, homedir()));
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(CHROME)) fail(`Google Chrome not found at ${CHROME} (set CHROME_PATH)`);
if (typeof WebSocket === 'undefined') fail('Node 22+ is required (built-in WebSocket)');

const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'os-pdf-'))}`, '--window-size=1920,1080', 'about:blank',
], { stdio: 'ignore' });

function fail(msg) {
  console.error(`export_pdf: ${msg}`);
  try { chrome?.kill(); } catch {}
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 50; i++) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = pages.find((p) => p.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  fail('Chrome did not start');
}

const ws = new WebSocket(await target());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('CDP connect failed')); });
let seq = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) => new Promise((res) => {
  const id = ++seq;
  pending.set(id, res);
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result?.result?.value;
};

try {
  const url = new URL(`s/${slideId}`, base.endsWith('/') ? base : `${base}/`).href;
  await send('Page.enable');
  await send('Page.navigate', { url });
  // Wait for the editor UI (Download button) to mount.
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) {
    await sleep(500);
    ready = await evaluate(`!!document.querySelector('button[aria-label], button[title]') && document.readyState === 'complete'`);
  }
  if (!ready) fail(`editor did not load at ${url}`);
  await sleep(1500);

  const clicked = await evaluate(`(async () => {
    window.__osPrintRequested = false;
    window.print = () => { window.__osPrintRequested = true; };
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /download/i.test(b.getAttribute('aria-label') || b.title || b.textContent || ''));
    if (!btn) return 'no Download button';
    btn.click();
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 150));
      const item = [...document.querySelectorAll('[role="menuitem"]')].find((e) => e.textContent.trim() === 'Export as PDF');
      if (item) { item.click(); return 'ok'; }
    }
    return 'no "Export as PDF" menu item';
  })()`);
  if (clicked !== 'ok') fail(`could not start open-slide's PDF export: ${clicked}`);

  // open-slide calls window.print() once every page has rendered and settled.
  let requested = false;
  for (let i = 0; i < 240 && !requested; i++) {
    await sleep(500);
    requested = await evaluate('window.__osPrintRequested === true');
  }
  if (!requested) fail('timed out waiting for open-slide to finish rendering pages for print');

  const pdf = await send('Page.printToPDF', {
    printBackground: true, preferCSSPageSize: true,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });
  if (!pdf.result?.data) fail(`printToPDF failed: ${JSON.stringify(pdf.error || pdf)}`);
  const bytes = Buffer.from(pdf.result.data, 'base64');
  writeFileSync(out, bytes);
  await evaluate(`window.dispatchEvent(new Event('afterprint')); true`);

  const text = bytes.toString('latin1');
  const pages = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const box = text.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/);
  const links = new Set([...text.matchAll(/\/URI\s*\(([^)]*)\)/g)].map((m) => m[1])).size;
  console.log(JSON.stringify({ file: out, pages, page_size_pt: box ? `${Math.round(box[1])}x${Math.round(box[2])}` : null, distinct_links: links }));
} catch (e) {
  fail(e.message);
} finally {
  ws.close();
  chrome.kill();
}
