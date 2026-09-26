// SNG-662: apply the staged verbs (po/staged_content/SNG-662_protectors_verbs.merged.json) and the kind palettes.
const fs = require('fs');
function edit(p, fn) {
  const raw = fs.readFileSync(p, 'utf8'); const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const d = JSON.parse(raw); let ind = null;
  for (const n of [1, 2, 4]) if (JSON.stringify(d, null, n).replace(/\n/g, eol) + (raw.endsWith(eol) ? eol : '') === raw) ind = n;
  if (ind === null) throw new Error('roundtrip ' + p);
  fn(d); fs.writeFileSync(p, JSON.stringify(d, null, ind).replace(/\n/g, eol) + (raw.endsWith(eol) ? eol : ''));
}
const m = JSON.parse(fs.readFileSync('po/staged_content/SNG-662_protectors_verbs.merged.json', 'utf8')).powers;
let n = 0;
edit('content/packs/valley/powers.json', d => {
  for (const p of d.powers) if (m[p.id]) {
    const want = m[p.id].verbs;
    const kept = (p.verbs || []).filter(v => !want.includes(v));
    if (kept.length) throw new Error(p.id + ' would lose ' + kept.join(','));
    p.verbs = want; p._verbsWhy = m[p.id]._verbsWhy; n++;
  }
});
edit('content/packs/core/rules/powers.json', d => {
  const add = { order: ['quest', 'crusade'], sovereignty: ['quest', 'crusade'], lordship: ['quest'] };
  for (const [k, vs] of Object.entries(add)) for (const v of vs) if (!d.kinds[k].verbs.includes(v)) d.kinds[k].verbs.push(v);
});
console.log('powers updated', n, 'of', Object.keys(m).length);