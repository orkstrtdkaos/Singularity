// scripts/prompt_grid.mjs — SNG-435 §B3: the ordering grid. ERIK'S EYE IS THE VERDICT.
//
// ⛔ AEVI COULD NOT RUN THIS AND SAID SO: *"my test runs poisoned the URLs (Part A), so I have ZERO verified
// evidence about which ordering actually looks better. The ordering argument is inference from how these
// models are known to weight tokens. It may be wrong. Do not ship B1/B2 on my say-so — measure it."*
//
// So this produces the grid and NOTHING ELSE. It does not score, rank, or recommend. If the current live
// output wins, that is a real result and B1/B2 do not ship.
//
// ⚠️ ONE SEED HELD CONSTANT ACROSS ALL VARIANTS OF A SUBJECT, so ordering is the only moving part. A
// different seed would make every comparison a coin-flip about the draw rather than about the prompt.
//
// ⛔ AND IT CANNOT POISON ITS OWN INPUTS — the reason §B3 was gated on §A. Every request carries a unique
// cache-buster, they go one at a time 12s apart, and every response is size-checked. A run that gets a
// zero-byte body says so and stops rather than handing Erik a blank tile to judge.
//
// Run: node scripts/prompt_grid.mjs [--delay 12000] [--out grid.html]

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : d; };
const DELAY = Number(arg("delay", 12000));
const OUT = arg("out", "prompt_grid.html");
const MIN_BYTES = 1000;
const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const MEDIUM = "digital painting, atmospheric concept art, painterly, no text, no watermark";
const HOUSE = "muted earth tones with teal and gold accents";

// ---------- the two subjects, from live data ----------
function findCevaine() {
  const files = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); e.isDirectory() ? walk(p) : e.name.endsWith(".json") && files.push(p); } };
  walk(join(root, "characters"));
  for (const f of files) {
    try {
      const s = JSON.parse(readFileSync(f, "utf8"));
      const c = s.npcRegistry?.cevaine;
      if (c) return { rec: c, from: relative(root, f).replace(/\\/g, "/") };
    } catch { /* another gate's problem */ }
  }
  return null;
}

const cev = findCevaine();
if (!cev) { console.error("Cevaine not found in any save — the grid needs her live record."); process.exit(1); }

// ⛔ HER LIVE PROMPT LEADS WITH "a person". Measured on the URL her record actually holds: the builder reads
// `form` and `appearance`, and BOTH ARE EMPTY on her — while `description` carries the whole picture. That is
// variant A's handicap and it is not the ordering question; it is reported separately.
const cevSubject = String(cev.rec.description || "").trim();
const cevLive = String(cev.rec.image || "");
const cevSeed = (cevLive.match(/seed=(\d+)/) || [])[1] || "39649";
const LATTICE = "cold white, glass-blue, precise grid-lines";

const abilities = JSON.parse(readFileSync(join(root, "content/packs/core/abilities/radiant.json"), "utf8")).abilities;
const rl = abilities.find(a => /radiant lance/i.test(a.name || ""));
const rlHints = String(rl?.narrationHints || "").trim();
const rlOld = `${rl?.name}: ${rl?.description || ""}`;
const RADIANT = "white-gold core, hard cyan edge, black cast shadows with knife borders";

const url = (prompt, w, h, seed, bust) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true&_cb=${bust}`;

const VARIANTS = [
  // ⚠️ A / RL_A ARE THE CURRENT LIVE SHAPE, reproduced exactly — the control. Without it the grid compares
  // three new things to each other and cannot answer "is any of this better than what ships".
  { id: "A", subject: "Cevaine", label: "current live shape (role only, house palette)", w: 512, h: 640, seed: cevSeed,
    prompt: `a person, character portrait, named Cevaine, Woman, ${cev.rec.role}, ${MEDIUM}, ${HOUSE}` },
  { id: "B", subject: "Cevaine", label: "subject → medium (no palette tail)", w: 512, h: 640, seed: cevSeed,
    prompt: `${cevSubject}, character portrait, named Cevaine, ${MEDIUM}` },
  { id: "C", subject: "Cevaine", label: "medium → subject", w: 512, h: 640, seed: cevSeed,
    prompt: `${MEDIUM}, ${cevSubject}, character portrait, named Cevaine` },
  { id: "D", subject: "Cevaine", label: "subject → medium → palette only", w: 512, h: 640, seed: cevSeed,
    prompt: `${cevSubject}, character portrait, named Cevaine, ${MEDIUM}, ${LATTICE}` },

  { id: "RL_A", subject: "Radiant Lance", label: "current live shape (description, house palette)", w: 1024, h: 512, seed: "48556",
    prompt: `${rlOld}, ${MEDIUM}, ${HOUSE}` },
  { id: "RL_B", subject: "Radiant Lance", label: "narrationHints as subject → medium", w: 1024, h: 512, seed: "48556",
    prompt: `${rl?.name}: ${rlHints}, ${MEDIUM}` },
  { id: "RL_C", subject: "Radiant Lance", label: "medium → palette → subject", w: 1024, h: 512, seed: "48556",
    prompt: `${MEDIUM}, ${RADIANT}, ${rl?.name}: ${rlHints}` },
  { id: "RL_D", subject: "Radiant Lance", label: "narrationHints → medium → palette (what v1.9.159 now ships)", w: 1024, h: 512, seed: "48556",
    prompt: `${rl?.name}: ${rlHints}, ${MEDIUM}, ${RADIANT}` },
];

console.log(`Cevaine    : from ${cev.from}, seed ${cevSeed}`);
console.log(`             description: "${cevSubject.slice(0, 90)}…"`);
console.log(`             ⚠️ her LIVE prompt leads with "a person" — form and appearance are both empty on her record`);
console.log(`Radiant L. : seed 48556`);
console.log(`             narrationHints: "${rlHints.slice(0, 90)}…"`);
console.log(`\n${VARIANTS.length} variants, ${DELAY}ms apart, unique cache-buster on every request\n`);

const RUN = Date.now().toString(36);   // this run's token: every request it makes is a first request
const rows = [];
for (let i = 0; i < VARIANTS.length; i++) {
  const v = VARIANTS[i];
  // ⛔ UNIQUE PER RUN, NOT PER INDEX. The first version keyed the buster on the loop index, so a second
  // run requested the IDENTICAL urls — a cache-buster that busts nothing, which is worse than none because it
  // reads like a safeguard. The re-run then hit an evicted entry, the regeneration was rate-limited, and
  // variant A came back 0 bytes. (The halt caught it, which is the one part that worked.)
  const u = url(v.prompt, v.w, v.h, v.seed, `${RUN}_${i}`);
  // ⛔ A FETCH THAT NEVER COMPLETED IS NOT A ZERO-BYTE BODY, and the first version of this loop said it
  // was: it caught the network error, left `bytes` at 0, and halted with "came back 0 bytes." That is the
  // exact distinction I built into `mintAction` for the runtime an hour earlier and then failed to apply
  // here — a transport failure is evidence about the wire, not about the picture. So the two are separate,
  // and only the second one stops the run.
  let bytes = 0, why = "", data = "", threw = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(u);
      if (!res.ok) { why = `http ${res.status}`; threw = ""; break; }
      const buf = Buffer.from(await res.arrayBuffer());
      bytes = buf.length;
      // ⛔ EMBEDDED, NOT LINKED. The first grid rendered as eight broken tiles: a viewer with a strict CSP
      // blocks every external host, so the <img src="https://…"> never loaded and the page said nothing
      // about why. A comparison sheet that needs the network to be READ is not a deliverable — and these are
      // exactly the urls that get evicted, so it would rot anyway.
      data = `data:${res.headers.get("content-type") || "image/jpeg"};base64,${buf.toString("base64")}`;
      threw = "";
      break;
    } catch (e) {
      threw = e?.message || "fetch failed";
      if (attempt < 2) { console.log(`      ${v.id}: ${threw} — waiting ${Math.round(DELAY / 1000)}s and trying again`); await sleep(DELAY); }
    }
  }
  const ok = bytes >= MIN_BYTES;
  rows.push({ ...v, url: u, data, bytes, ok });
  console.log(`${v.id.padEnd(5)} ${ok ? String(bytes).padStart(7) + " bytes" : (threw ? "UNREACHED " + threw : "EMPTY  " + why)}   ${v.label}`);
  // ⚠️ UNREACHED is not a result and not a burn — the grid is incomplete and says so, without claiming
  // anything about the endpoint. A 200 with no bytes IS a burn, and that one halts.
  if (!ok && !threw) { console.error(`
⛔ halted: ${v.id} returned a body under ${MIN_BYTES} bytes. Wait, then re-run with a larger --delay.`); break; }
  if (!ok) { console.error(`
⚠️ ${v.id} could not be reached after 3 tries — the grid is incomplete, not the prompt's fault.`); }
  if (i < VARIANTS.length - 1) await sleep(DELAY);
}

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const bySubject = [...new Set(rows.map(r => r.subject))];
const html = `<!doctype html><meta charset="utf-8"><title>SNG-435 §B3 — ordering grid</title>
<style>
 body{background:#14140f;color:#e8e2d0;font:14px/1.5 system-ui,sans-serif;margin:0;padding:24px}
 h1{font-size:18px;letter-spacing:1px;text-transform:uppercase;color:#d4a24a;margin:0 0 4px}
 h2{font-size:15px;margin:32px 0 10px;color:#d4a24a}
 p.note{max-width:70ch;color:#a49b86;font-style:italic}
 .grid{display:flex;flex-wrap:wrap;gap:18px}
 figure{margin:0;background:#1d1c16;border:1px solid #33301f;border-radius:8px;padding:10px;max-width:540px}
 img{display:block;max-width:100%;border-radius:4px;background:#000}
 figcaption{font-size:12px;color:#a49b86;margin-top:8px}
 .id{color:#d4a24a;font-weight:700}
 code{font-size:11px;color:#8d8672}
 pre{white-space:pre-wrap;word-break:break-word;font-size:11px;color:#7e7663;margin:6px 0 0}
</style>
<h1>SNG-435 §B3 — prompt ordering grid</h1>
<p class="note">One seed held constant per subject, so ordering is the only moving part. Erik's eye is the
verdict. Images are embedded, so this page needs no network. Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")}.</p>
${bySubject.map(sub => `<h2>${esc(sub)}</h2><div class="grid">${rows.filter(r => r.subject === sub).map(r => `
 <figure>
  <img src="${r.data}" width="${r.w}" height="${r.h}" alt="${esc(r.id)}">
  <figcaption><span class="id">${esc(r.id)}</span> — ${esc(r.label)} · ${r.bytes.toLocaleString()} bytes
   <pre>${esc(r.prompt)}</pre></figcaption>
 </figure>`).join("")}</div>`).join("")}
`;
writeFileSync(join(root, OUT), html);
console.log(`\nwrote ${OUT} — open it and judge. ⛔ This script does not pick a winner.`);
