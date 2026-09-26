// SNG-658 — fears for the 53 tradition epics that reach `npcs` with none.
// Text insertion (the file carries literals like 0.0 that a JSON round-trip would rewrite): for each epic id,
// the fears array goes on the line after that epic's own "wants" line. Verified by parsing afterwards.
const fs = require('fs');
const path = 'content/packs/valley/tradition_epics.json';
let raw = fs.readFileSync(path, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const fears = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const before = JSON.parse(raw);
let n = 0; const skipped = [];
for (const [id, f] of Object.entries(fears)) {
  const e = before.epics.find(x => x.id === id);
  if (!e) { skipped.push(id + ' (no epic)'); continue; }
  if (e.fears) { skipped.push(id + ' (has fears)'); continue; }
  const at = raw.indexOf(`${eol}   "id": ${JSON.stringify(id)},`);
  if (at < 0) { skipped.push(id + ' (id line not found)'); continue; }
  const nextId = raw.indexOf(`${eol}   "id": `, at + 5);
  const w = raw.indexOf(`${eol}   "wants": `, at);
  if (w < 0 || (nextId > 0 && w > nextId)) { skipped.push(id + ' (no wants line)'); continue; }
  const lineEnd = raw.indexOf(eol, w + eol.length);
  const body = f.map(x => `    ${JSON.stringify(x)}`).join(',' + eol);
  raw = raw.slice(0, lineEnd) + `${eol}   "fears": [${eol}${body}${eol}   ],` + raw.slice(lineEnd);
  // "wants" line ends with a comma already (it is never last), so the inserted line ends with one too.
  n++;
}
const after = JSON.parse(raw);
for (const [id, f] of Object.entries(fears)) {
  const e = after.epics.find(x => x.id === id);
  if (e && JSON.stringify(e.fears) !== JSON.stringify(f) && !skipped.some(s => s.startsWith(id + ' '))) throw new Error('verify failed: ' + id);
}
if (after.epics.length !== before.epics.length) throw new Error('epic count changed');
fs.writeFileSync(path, raw);
console.log('added', n, 'skipped', skipped);