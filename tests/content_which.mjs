// ⛔ SNG-534 · content_which.mjs — assertions that name WHICH, not WHETHER.
// Every check here would pass a coverage count and fail a correctness one.
import { readFileSync, readdirSync } from 'node:fs';
const R = 'content/packs/core';
const J = p => JSON.parse(readFileSync(`${R}/${p}`, 'utf8'));
const abilities = readdirSync(`${R}/abilities`).filter(f => f.endsWith('.json'))
  .flatMap(f => { const d = J(`abilities/${f}`); return (d.abilities || d.skills || []).filter(a => a && a.id).map(a => ({ ...a, _file: f })); });
const canon = J('rules/power_sources.json').byTradition_primary_20260815 || {};
const aes = J('rules/tradition_visual_aesthetics.json');
const fails = [];
const F = (gate, id, msg) => fails.push(`${gate}  ${id}  ${msg}`);

// ⛔ W1 — a craft's power source must be its tradition's canon primary, or `combination`.
// A count of "abilities with a legal powerSystem" was 373/373 while 13 named the WRONG legal one.
for (const a of abilities) {
  const want = canon[a.tradition]?.primary;
  // ⚠️ DELIBERATE DEEP-POWER GATES (SNG-131, SNG-140) are not violations — Erik authored them
  const GATES = new Set(['living_current', 'wild_current']);
  if (!want || a.powerSystem === 'combination' || a.powerSystem === '*' || GATES.has(a.powerSystem)) continue;
  if (a.powerSystem !== want) F('W1', a.id, `powerSystem=${a.powerSystem} but ${a.tradition} is ${want}`);
}

// ⛔ W2 — a palette must resolve through the namespace that MATCHES the thing.
// The flip was safe under both precedences, so a whether-check saw nothing. This names the route.
for (const a of abilities) {
  const byTrad = !!aes.traditions?.[a.tradition];
  const byForm = !!aes.forms?.[a.aestheticKey];
  const bySrc  = !!aes.powerSystems?.[a.powerSystem];
  if (!byTrad && !byForm && !bySrc) F('W2', a.id, `no palette by tradition, form or source`);
  // ⚠️ a PEOPLE must not be reached through the source namespace
  if (!byTrad && bySrc && canon[a.tradition]) F('W2', a.id, `${a.tradition} is a people and resolves via powerSystems — file its palette under traditions`);
}

// ⛔ W3 — a rank that claims a condition must name one the engine can impose.
const IMPOSABLE = new Set(['action_loss', 'staggered', 'unconscious', 'incapacitated']);
for (const a of abilities) for (const r of a.tree || []) {
  const im = r.imposes; if (!im) continue;
  for (const k of ['condition', 'onCrit', 'degradesTo']) {
    if (im[k] && !IMPOSABLE.has(im[k])) F('W3', `${a.id} r${r.rank}`, `${k}=${im[k]} is not imposable`);
  }
  // ⚠️ ESCALATE must escalate — an onCrit equal to the condition buys nothing
  if (im.onCrit && im.onCrit === im.condition && r.rank < 3) F('W3', `${a.id} r${r.rank}`, `onCrit equals condition — no escalation`);
}

// ⛔ W4 — a craft that claims heal-denial in prose must carry ongoingHarm.
// Two crafts said "stops closing" and "cannot stop bleeding" for weeks and denied nothing.
const DENIES = /stops? closing|cannot stop bleeding|will not close|does not close|refuses? to (mend|heal)/i;
for (const a of abilities) for (const r of a.tree || []) {
  if (DENIES.test(String(r.grants || '')) && !r.ongoingHarm) F('W4', `${a.id} r${r.rank}`, `claims heal-denial in prose and carries no ongoingHarm`);
}

// ⛔ W5 — a rank that says "until healed" must carry persistUntilHealed.
const UNTIL = /until (it is )?healed|until a mending|until restored/i;
for (const a of abilities) for (const r of a.tree || []) {
  if (UNTIL.test(String(r.grants || '') + String(r.cannot || '')) && !r.persistUntilHealed)
    F('W5', `${a.id} r${r.rank}`, `says "until healed" and carries no persistUntilHealed`);
}

// ⛔ W6 — a ward must not answer everything, and a typed attack must have SOME answer.
const wardTypes = new Set(abilities.flatMap(a => a.mechanic?.wardTypes || []));
for (const a of abilities) {
  const dt = a.mechanic?.damageType;
  if (dt && !wardTypes.has(dt)) F('W6', a.id, `damageType=${dt} and no ward in the corpus answers it`);
  const wt = a.mechanic?.wardTypes;
  if (wt && wt.length > 4) F('W6', a.id, `wards ${wt.length} types — a ward that answers everything has no character`);
}

console.log(fails.length ? `⛔ WHICH-CHECK FAILURES: ${fails.length}\n` + fails.join('\n') : `✅ content_which: all assertions hold (${abilities.length} abilities)`);
process.exit(fails.length ? 1 : 0);
