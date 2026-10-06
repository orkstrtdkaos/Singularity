// po/tools/measure_films.mjs — SNG-681. WHAT THE NINE FILMS REFER TO, AND WHETHER IT RESOLVES.
//
// Her G1 is "every film plays to its title card with no missing visual, place, figure, tradition or arc id —
// tested on the data, not the canvas." This is that test's measurement: before a line of the player is
// generalised, every id in all ten films is resolved against the real content, and every visual token is
// counted. A painter built against a token census cannot silently draw nothing for a token nobody counted.
//
// Run: node po/tools/measure_films.mjs

import { loadContentHeadless } from "../../tests/headless_content.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const line = (s) => console.log(s);
const C = await loadContentHeadless();

const dir = join(root, "content/packs/core/world/films");
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const films = files.map((f) => ({ file: `world/films/${f}`, doc: JSON.parse(readFileSync(join(dir, f), "utf8")) }));
films.push({ file: "world/opening.json", doc: JSON.parse(readFileSync(join(root, "content/packs/core/world/opening.json"), "utf8")) });

line("═════ SNG-681 · THE FILMS, AGAINST THE REAL CONTENT ═════\n");

/* ── the shape they share ── */
const topKeys = new Set(), shotKeys = new Set(), unlockKinds = new Set();
const visuals = new Map(), keysByVisual = new Map();
let shots = 0;
for (const { doc } of films) {
  for (const k of Object.keys(doc)) topKeys.add(k);
  for (const k of Object.keys(doc.unlock || {})) unlockKinds.add(k);
  for (const mv of doc.movements || []) for (const s of mv.shots || []) {
    shots++;
    for (const k of Object.keys(s)) shotKeys.add(k);
    const v = String(s.visual || "?");
    visuals.set(v, (visuals.get(v) || 0) + 1);
    const extra = Object.keys(s).filter((k) => !["id", "visual", "lines", "after", "seconds"].includes(k));
    if (extra.length) keysByVisual.set(v, new Set([...(keysByVisual.get(v) || []), ...extra]));
  }
}
line(`${films.length} films · ${shots} shots · top-level keys: ${[...topKeys].join(", ")}`);
line(`shot keys: ${[...shotKeys].join(", ")}`);
line(`unlock kinds: ${[...unlockKinds].join(", ") || "(none)"}\n`);
line("visual tokens, with the keys each one carries:");
for (const [v, n] of [...visuals].sort((a, b) => b[1] - a[1])) {
  line(`  ${String(n).padStart(3)} × ${v.padEnd(16)} ${[...(keysByVisual.get(v) || [])].join(", ")}`);
}

/* ── does every id resolve? ── */
const locs = C.locations || {}, npcs = C.npcs || {};
const arcs = new Set((C.greaterArcs || []).map((a) => a.id));
const trads = new Set(Object.keys(C.traditionIndex?.byId || {}));
const SOURCES = new Set(["precursor", "nanite_ordered", "nanite_wild", "veil", "metaphysical", "body"]);
const bad = [];
const seen = { place: new Set(), figure: new Set(), tradition: new Set(), arc: new Set(), source: new Set() };
for (const { file, doc } of films) {
  for (const mv of doc.movements || []) for (const s of mv.shots || []) {
    const at = `${file}#${s.id}`;
    if (s.place != null) { seen.place.add(s.place); if (!locs[s.place]) bad.push(`${at}: place "${s.place}" is not a location`); }
    if (s.figure != null) { seen.figure.add(s.figure); if (!npcs[s.figure]) bad.push(`${at}: figure "${s.figure}" is not an npc`); }
    if (s.arc != null) { seen.arc.add(s.arc); if (!arcs.has(s.arc)) bad.push(`${at}: arc "${s.arc}" is not a greater arc`); }
    if (s.source != null) { seen.source.add(s.source); if (!SOURCES.has(s.source)) bad.push(`${at}: source "${s.source}" is not one of the six`); }
    for (const t of (s.traditions || [])) { seen.tradition.add(t); if (!trads.has(t)) bad.push(`${at}: tradition "${t}" is not on the ring`); }
  }
  for (const t of (doc.unlock?.traditions || [])) if (!trads.has(t)) bad.push(`${file}: unlock tradition "${t}" is not on the ring`);
  for (const p of (doc.unlock?.places || [])) if (!locs[p]) bad.push(`${file}: unlock place "${p}" is not a location`);
}
line(`\nids referenced: ${seen.place.size} places · ${seen.figure.size} figures · ${seen.tradition.size} traditions · ${seen.arc.size} arcs · ${seen.source.size} sources`);
line(bad.length ? `⛔ ${bad.length} DO NOT RESOLVE:\n   ${bad.slice(0, 12).join("\n   ")}` : "✅ every id resolves");

/* ── the figure cards: do the people have a place, and what is public about them? ── */
const figs = [...seen.figure].filter((id) => npcs[id]);
const placed = figs.filter((id) => {
  const n = npcs[id];
  const where = n.homeLocation || n.locationId || n.home || n.where || null;
  return where && locs[where];
});
line(`\nfigure cards: ${figs.length} people named by a shot`);
line(`  with a resolvable home location: ${placed.length}/${figs.length}   ← F2: the card falls back to the turning globe without one`);
const fields = new Set(figs.flatMap((id) => Object.keys(npcs[id] || {})));
line(`  place-ish fields present on ANY of them: ${[...fields].filter((f) => /location|home|where|place|region/i.test(f)).join(", ") || "NONE"}`);
line(`  nameKnown values: ${[...new Set(figs.map((id) => String(npcs[id]?.nameKnown ?? "(absent)")))].join(", ")}`);
const titled = figs.filter((id) => npcs[id]?.title);
line(`  carrying a \`title\` for the name card: ${titled.length} — ${titled.slice(0, 6).map((id) => `${id}: ${JSON.stringify(String(npcs[id].title).slice(0, 40))}`).join(" · ")}`);

/* ── G2's public rule, run here so the player is built against a true population ── */
const MYTHIC = /myth/i;
const barredPeoples = new Set(["sovereign", "precursor", "seraph"]);
const g2 = [];
for (const id of figs) {
  const n = npcs[id];
  if (["gm", "few"].includes(String(n.nameKnown || ""))) g2.push(`${id}: nameKnown ${n.nameKnown}`);
  if (MYTHIC.test(String(n.kind || "")) || n.mythic) g2.push(`${id}: mythic`);
  if (barredPeoples.has(String(n.people || ""))) g2.push(`${id}: people ${n.people}`);
}
line(`\nG2 (public rule) on the figures actually named: ${g2.length ? "⛔ " + g2.join(" · ") : "✅ clean"}`);

/* ── §29.7 ── */
const BAD = /\b(SNG|CCODE)-\d|\.json\b|\.js\b|schemaVersion|TODO|FIXME/i;
const strings = [];
for (const { doc } of films) {
  const walk = (v) => {
    if (typeof v === "string") strings.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { if (!k.startsWith("_")) walk(x); }
  };
  for (const mv of doc.movements || []) for (const s of mv.shots || []) { (s.lines || []).forEach(walk); (s.after || []).forEach(walk); }
  walk(doc.title); walk(doc.begin); walk(doc.controls);
}
const dirty = strings.filter((s) => BAD.test(s));
line(`§29.7: ${strings.length} player-facing strings · ${dirty.length ? "⛔ " + dirty.slice(0, 3).join(" · ") : "✅ clean"}`);

/* ── runs ── */
const secondsOf = (s, p) => {
  if (Number.isFinite(Number(s?.seconds))) return Math.max(0.2, Number(s.seconds));
  const base = Number.isFinite(Number(p?.secondsBase)) ? Number(p.secondsBase) : 1.6;
  const per = Number.isFinite(Number(p?.secondsPerWord)) ? Number(p.secondsPerWord) : 0.28;
  const text = [...(s?.lines || []), ...(s?.after || [])].join(" ").trim();
  return Math.max(0.2, base + (text ? text.split(/\s+/).length : 0) * per);
};
line("");
for (const { file, doc } of films) {
  const all = (doc.movements || []).flatMap((m) => m.shots || []);
  const run = all.reduce((n, s) => n + secondsOf(s, doc.pacing), 0) + (doc.title ? secondsOf(doc.title, doc.pacing) : 0);
  const un = doc.unlock ? Object.keys(doc.unlock).join("+") : "(none)";
  line(`  ${String(all.length).padStart(3)} shots · ${(run / 60).toFixed(2)} min · unlock ${un.padEnd(12)} ${doc.id || file}`);
}
