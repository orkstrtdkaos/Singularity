// Y — the Coliseum's bench, driven on the real content.
import * as CO from "../engine/coliseum.js";
import { loadContentHeadless } from "../tests/headless_content.mjs";
const C = await loadContentHeadless();
const by = CO.benchAt(C);
const reaches = Object.keys(by);
console.log(`benchAt: ${reaches.length} reaches`);
const heads = reaches.reduce((n, r) => n + by[r].heads.length, 0);
const ch = reaches.reduce((n, r) => n + by[r].challengers.length, 0);
console.log(`  ${heads} heads, ${ch} challengers`);
const empty = reaches.filter(r => !by[r].heads.length && !by[r].challengers.length);
console.log(`  reaches with nobody: ${empty.length}`);
// every head's npcId resolves
const bad = reaches.flatMap(r => by[r].heads).filter(h => !C.npcs[h.npcId]);
console.log(`  heads whose npcId does not resolve: ${bad.length} ${bad.map(h=>h.npcId).join(", ")}`);
// every families entry is one of the eight
const F = (await import("../engine/functions.js")).FUNCTION_FAMILIES;
const badFam = reaches.flatMap(r => by[r].challengers).flatMap(c => (c.families||[]).filter(f => !F.includes(f)));
console.log(`  families outside the eight: ${badFam.length} ${[...new Set(badFam)].join(", ")}`);

// the blind-grid four
let rs = 7;
const rng = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
const sample = by.valley?.challengers?.[0] || reaches.flatMap(r=>by[r].challengers)[0];
console.log(`\nbenchAxis for ${sample.name} (families ${sample.families.join("/")}):`);
for (const a of CO.benchAxis(sample, { rng })) console.log(`   ${a.family.padEnd(10)} ${a.from.padEnd(22)} weight ${a.weight}`);
// over many draws the first-listed family should lead
const tally = {};
for (let i = 0; i < 4000; i++) for (const a of CO.benchAxis(sample, { rng })) if (a.from === "practice") tally[a.family] = (tally[a.family]||0)+1;
console.log(`   practice draws over 4000: ${JSON.stringify(tally)} (first listed = ${sample.families[0]})`);
// every slot must be one of the eight, and never repeat
let dupes = 0, outside = 0;
for (let i = 0; i < 2000; i++) {
  const ax = CO.benchAxis(reaches.flatMap(r=>by[r].challengers)[i % ch], { rng });
  if (new Set(ax.map(a=>a.family)).size !== ax.length) dupes++;
  if (ax.some(a => !F.includes(a.family))) outside++;
  if (ax.length !== 4) outside++;
}
console.log(`   2000 draws: ${dupes} with a repeated family (want 0), ${outside} malformed (want 0)`);

const bout = CO.benchBout(C, { reach: "valley", rng });
console.log(`\nbenchBout(valley): ${bout ? bout.challenger.name + " — " + bout.axis.map(a=>a.family).join("/") : "none"}`);
const byPeople = CO.benchBout(C, { people: "djinn", rng });
console.log(`benchBout(people djinn): ${byPeople ? byPeople.challenger.name + " of " + byPeople.reach : "none"}`);
const noSuch = CO.benchBout(C, { reach: "valley", people: "gorgon", rng });
console.log(`benchBout(valley + gorgon): ${noSuch ? "FOUND (unexpected)" : "null, correctly"}`);

const gm = CO.benchForGM(C, { here: "valley", npcs: C.npcs, day: 18 });
console.log(`\nbenchForGM at the valley, day 18 — ${gm.reaches} reaches:`);
for (const c of gm.onTheCard) console.log(`   on the card: ${c.say}`);
if (gm.fromHere) {
  console.log(`   from here: champion ${gm.fromHere.champion.map(c=>c.name).join(", ") || "(none)"}`);
  for (const f of gm.fromHere.fighters) console.log(`              ${f.say}`);
}
