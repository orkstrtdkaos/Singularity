// SNG-660 + SNG-661: apply the staged bestiary to content/packs/valley/bestiary.json by TEXT insertion
// (the file does not round-trip through JSON.stringify, so a rewrite would reformat 600 lines).
// Re-tiers five, adds the storied_beast class, adds 4 (SNG-660) + 55 (SNG-661) creatures, each with schemaVersion 1.
const fs = require('fs');
const P = 'content/packs/valley/bestiary.json';
let t = fs.readFileSync(P, 'utf8');
const eol = t.includes('\r\n') ? '\r\n' : '\n';
const before = JSON.parse(t);
const s660 = JSON.parse(fs.readFileSync('po/staged_content/SNG-660_bestiary_top.json', 'utf8'));
const s661 = JSON.parse(fs.readFileSync('po/staged_content/SNG-661_storied_bestiary.json', 'utf8'));
const have = new Set(before.roster.map(c => c.id));
// 1. re-tier
for (const r of s660.retier) {
  const at = t.indexOf(`"id": ${JSON.stringify(r.id)}`);
  if (at < 0) throw new Error('retier: no ' + r.id);
  const tierAt = t.indexOf('"tier": ', at);
  const nextId = t.indexOf('"id": ', at + 5);
  if (tierAt < 0 || (nextId > 0 && tierAt > nextId)) throw new Error('retier: no tier on ' + r.id);
  const old = `"tier": ${JSON.stringify(r.from)}`;
  if (t.slice(tierAt, tierAt + old.length) !== old) throw new Error(`retier: ${r.id} is not ${r.from}`);
  t = t.slice(0, tierAt) + `"tier": ${JSON.stringify(r.to)}` + t.slice(tierAt + old.length);
}
// 2. new class, inserted as the last entry of "classes"
const block = (obj, pad) => JSON.stringify(obj, null, 1).split('\n').map((l, i) => (i ? pad : '') + l).join(eol);
const clsStart = t.indexOf('"classes": {');
const rosterStart = t.indexOf('"roster": [');
const clsEnd = t.lastIndexOf(eol + ' }', rosterStart);
if (clsStart < 0 || clsEnd < clsStart) throw new Error('classes block');
if (before.classes.storied_beast) throw new Error('class exists');
t = t.slice(0, clsEnd) + ',' + eol + '  "storied_beast": ' + block(s661.newClass.storied_beast, '  ') + t.slice(clsEnd);
// 3. new creatures, appended to the roster
const adds = [...s660.add, ...s661.roster].map(c => ({ schemaVersion: 1, ...c }));
for (const c of adds) if (have.has(c.id)) throw new Error('dup ' + c.id);
const rStart = t.indexOf('"roster": [');
const rEnd = t.indexOf(eol + ' ]', rStart);
t = t.slice(0, rEnd) + adds.map(c => ',' + eol + '  ' + block(c, '  ')).join('') + t.slice(rEnd);
// verify
const after = JSON.parse(t);
const tiers = {}; for (const c of after.roster) tiers[c.tier] = (tiers[c.tier] || 0) + 1;
if (after.roster.length !== before.roster.length + adds.length) throw new Error('count');
for (const r of s660.retier) if (after.roster.find(c => c.id === r.id).tier !== r.to) throw new Error('retier check ' + r.id);
fs.writeFileSync(P, t);
console.log('roster', before.roster.length, '->', after.roster.length, JSON.stringify(tiers), 'classes', Object.keys(after.classes).filter(k => !k.startsWith('_')).length);