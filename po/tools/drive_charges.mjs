// ⛑ AEVI item 14, driven on the real saves: one record, read on the PERSON and on the PLACE.
import { readFileSync, readdirSync } from "node:fs";
const A = await import("../../engine/assignments.js");
const { reconcile } = await import("../../engine/reconcile.js");
// ⛔ THE SAVES ON DISK ARE THE PRE-RECONCILE STATE. Step 93 stamps a charge with the hold and purpose it is about when
// the app LOADS a character — so reading the raw JSON asks the question before the answer exists. Every save below goes
// through `reconcile(save, "character")` first, which is exactly what play does.
const load = (s) => { const c = JSON.parse(JSON.stringify(s)); try { reconcile(c, "character", {}); } catch (e) { console.log("  ⚠️ reconcile refused:", e.message); } return c; };
const saves = [];
for (const d of readdirSync("characters")) {
  let fs2; try { fs2 = readdirSync(`characters/${d}`); } catch { continue; }
  for (const f of fs2) if (f.endsWith(".json")) { try { saves.push(JSON.parse(readFileSync(`characters/${d}/${f}`, "utf8"))); } catch {} }
}
const pick = (n) => load(saves.filter(s => s.name === n).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0]);
let fails = 0;
const check = (ok) => { if (!ok) fails++; return ok ? "ok" : "⛔ FAIL"; };

/* ══ 1 · EVERY SAVE THAT HOLDS A CHARGE — the population, not one example ═════════════════ */
console.log(`\n══ 1 · what each person is doing for you\n`);
let people = 0, withCharges = 0;
for (const raw of saves) {
  const ch = load(raw);
  const asg = Object.values(ch?.worldState?.assignments || {});
  if (!asg.length) continue;
  const ids = [...new Set(asg.map(a => a.npcId || a.bandId).filter(Boolean))];
  console.log(`  ${String(ch.name).padEnd(18)} ${asg.length} charge(s) to ${ids.length} person/people`);
  for (const id of ids) {
    const mine = A.chargesOf(ch, id);
    people++;
    if (mine.length) withCharges++;
    const name = asg.find(a => (a.npcId || a.bandId) === id)?.npcName || id;
    console.log(`    ${String(name).padEnd(16)} ${mine.length} — ${mine.map(c => `${String(c.charge || "").slice(0, 38)}${c.holdId ? ` [${c.holdId}]` : ""}`).join(" · ")}`);
  }
}
console.log(`\n  ${check(people > 0 && withCharges === people)} — every person holding a charge reads back at least one (${withCharges} of ${people})`);
// ⚠️ AND THE READER MUST NOT ANSWER FOR SOMEONE WHO HOLDS NOTHING, which is how a "reads for everyone" check passes vacuously
const loki = pick("Loki");
console.log(`  ${check(A.chargesOf(loki, "nobody_at_all").length === 0)} — and somebody with no charge reads back nothing`);
console.log(`  ${check(A.chargesOf(loki, null).length === 0 && A.chargesOf(null, "cy").length === 0)} — and a missing id or save answers nothing rather than everything`);

/* ══ 2 · A CHARGE THAT NAMES A HOLD READS ON THAT HOLD ════════════════════════════════════ */
console.log(`\n══ 2 · and on the place it names\n`);
for (const raw of saves) {
  const ch = load(raw);
  for (const h of ch.holdings || []) {
    const rows = A.chargesAbout(ch, h.id);
    if (rows.length) console.log(`  ${String(ch.name).padEnd(12)} ${String(h.name).padEnd(24)} ${rows.map(r => `${r.name} (${r.purpose || "—"})`).join(", ")}`);
  }
}
// Loki's Cy is the one stamped pair in the live saves (reconcile step 93 put it there)
const annex = loki.holdings[0];
const about = A.chargesAbout(loki, annex.id);
console.log(`\n  ${annex.name}: ${about.length} charge(s) — ${about.map(r => r.name).join(", ") || "none"}`);
console.log(`  ${check(about.length >= 1 && about.every(r => r.name && r.purpose))} — the stamped charge reads on its hold, with a name and a purpose`);
console.log(`  ${check(A.chargesAbout(loki, "no_such_hold").length === 0)} — and a hold nobody was charged with reads back nothing`);

/* ══ 3 · IT IS ONE RECORD, NOT A COPY ═════════════════════════════════════════════════════ */
console.log(`\n══ 3 · one record, three readings\n`);
// ⚠️ AND THIS SECTION MUST HAVE SOMEBODY TO ASK ABOUT. Indexing `about[0]` on an empty list made two checks below
// compare `undefined` with `undefined` and pass — the second vacuous fixture I have written today.
console.log(`  ${check(about.length > 0)} — there is a charged person to ask about at all`);
const who = about[0];
const cy = who ? A.chargesOf(loki, who.id) : [];
const stored = who ? Object.values(loki.worldState.assignments).filter(a => (a.npcId || a.bandId) === who.id) : [];
console.log(`  the store holds ${stored.length} record(s) for ${who?.name ?? "(nobody)"}`);
console.log(`  the person's card reads ${cy.length} · the hold's list reads ${about.filter(r => r.id === who?.id).length}`);
console.log(`  ${check(!!who && stored.length > 0 && stored.length === cy.length)} — the person's card is a READING of the store, not a second copy`);
// ⛔ and the hold's list and the growth job must agree about who is on it
const charged = A.chargedWith(loki, annex.id, "growth");
console.log(`  the growth job counts ${charged.length}; the hold's list shows ${about.filter(r => r.purpose === "growth").length}`);
console.log(`  ${check(charged.length > 0 && charged.length === about.filter(r => r.purpose === "growth").length)} — the list and the job it feeds agree, over a job that HAS somebody on it`);

console.log(`\n${fails ? `⛔ ${fails} check(s) FAILED` : "✅ every check passed"}\n`);
process.exit(fails ? 1 : 0);
