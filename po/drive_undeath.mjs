// po/drive_undeath.mjs — §48 driven end to end against the real content, before anything depends on it.
// ⛑ A NEW MODULE GETS DRIVEN, because every wrong shape passes `node --check` and the whole suite.
import { loadContentHeadless } from "../tests/headless_content.mjs";
import * as U from "../engine/undeath.js";
import { affinityOf } from "../engine/skill_battle.js";

const C = await loadContentHeadless();
const rules = C.rules || {};
const sb = rules.skillBattleSystem || rules.skill_battle_system || null;
const line = (s) => console.log(s);

line("\n══════ §48 · UNDEATH, DRIVEN ══════");

/* ---- 1 · the four authored undead, and what the class floor changes ---- */
line("\n── 1 · the authored undead: what the declared class supplies ──");
const roster = (C.bestiary?.roster || []).filter((r) => r.class === "narrowed_dead");
for (const r of roster) {
  const a = U.undeadAffinity(r, { rules });
  const added = Object.keys(a.added);
  line(`  ${r.id.padEnd(20)} authored ${Object.keys(r.affinity || {}).length} type(s) | floor added: ${added.length ? added.map((k) => `${k}=${a.added[k]}`).join(" ") : "nothing"}`);
  // ⛔ THE POINT OF THE FLOOR: does a mending burn it now?
  const before = affinityOf(r, "vitality", sb);
  const after = affinityOf({ ...r, affinity: a.affinity }, "vitality", sb);
  line(`${" ".repeat(24)}vitality: ${before || "—"} → ${after || "—"}${before !== after ? "   ⛔ a mending burns it now, and did not before" : ""}`);
}

/* ---- 2 · the cocoon, and Wither's three outcomes off one act ---- */
line("\n── 2 · §48.2 the cocoon → §48.8 what Wither does, and the warden does not choose ──");
for (const d of [0, 10, 30, 90, 120, 400]) {
  const e = U.enterUndeath({ id: "crew", name: "a set crew" }, { kind: "mindless", day: 0 });
  const ph = U.cocoonPhase(e, d, rules);
  const w = U.witherOutcome(e, { currentDay: d, rules });
  const l = U.lashOut(e, { currentDay: d, rules });
  line(`  day ${String(d).padStart(3)} | ${ph.phase.padEnd(9)} | wither → ${w.outcome.padEnd(10)} | lash: ${l.ok ? "⛔ YES — past armour, past position" : "no"}`);
}

/* ---- 3 · Deathsense as a diagnostic that reports its own limit ---- */
line("\n── 3 · §48.6/§6 Deathsense — silence means a tool, and the rest it cannot tell apart ──");
const cases = [
  ["a living person", { id: "a" }, {}],
  ["someone dying", { id: "b" }, { dying: true }],
  ["a corpse", { id: "c", status: "dead" }, {}],
  ["a crew raised today", U.enterUndeath({ id: "d" }, { kind: "mindless", day: 0 }), { currentDay: 0 }],
  ["a crew 60 days on", U.enterUndeath({ id: "e" }, { kind: "mindless", day: 0 }), { currentDay: 60 }],
  ["an Afterling", U.enterUndeath({ id: "f" }, { kind: "afterling", day: 0 }), { currentDay: 0 }],
];
for (const [label, ent, opts] of cases) {
  const r = U.deathsenseRead(ent, { rules, ...opts });
  line(`  ${label.padEnd(22)} → ${String(r.reads).padEnd(9)} felt=${r.felt ? "yes" : "NO "} tells=${r.tells ? "yes" : "⛔ NO"}${r.ambiguous ? `  (${r.ambiguous.join(" or ")})` : ""}`);
}

/* ---- 4 · §48.7's consequence: one road closes, the other does not ---- */
line("\n── 4 · §48.7 divergent curves — the ORDERING is the ruling, not the numbers ──");
const { retrievalOdds } = await import("../engine/death.js");
line("  prior | retrieve (threshold, r3, bond 10) | raise (r1) | ");
for (const n of [0, 1, 2, 3, 4, 6]) {
  const dead = { status: "dead", deathState: { diedDay: 0, bodyStatus: "intact", sealed: false, depthOverride: 0 }, priorRaisings: n };
  const ro = retrievalOdds(dead, { rank: 3, currentDay: 0, rules, bond: 10 });
  const pen = U.raisingPenalty(dead, { to: "living", rules });
  const retrieve = Math.max(0, ro.pct - pen.penalty);
  const raise = U.raiseOdds(dead, { rank: 1, rules });
  line(`  ${String(n).padStart(5)} | ${String(retrieve).padStart(3)}%  (raw ${ro.pct}% − ${pen.penalty})            | ${String(raise.pct).padStart(3)}%      | ${retrieve === 0 && raise.open ? "⛔ the road back is CLOSED and continuing is still OPEN" : ""}`);
}

/* ---- 5 · the kind that is derived, and the kind that is not ---- */
line("\n── 5 · §6's one ruled derivation, and §48.3's unruled question ──");
const m = U.enterUndeath({ id: "g" }, { kind: "mindless", day: 0 });
line(`  mindless, shell intact            → ${U.undeathKind(m, 10, rules)}`);
m.undeath.released = true;
line(`  mindless, cocoon run, RELEASED    → ${U.undeathKind(m, 400, rules)}   ⛑ §6 rules this one derivation`);
const sig = U.narrowingSignals(m, { depthRaisedFrom: 2, rules });
line(`  narrowing vs stable               → ruled=${sig.ruled}  known signals: ${sig.known.join(", ") || "none"}`);
line(`     ⛔ ${sig.why}`);

/* ---- 6 · maintenance, not medicine ---- */
line("\n── 6 · §48.9 which repair works ──");
const rp = U.repairPathFor(U.enterUndeath({ id: "h" }, { day: 0 }), { currentDay: 40, rules });
line(`  body: ${rp.body.works ? "yes — " + rp.body.how + " (" + rp.body.craft + ")" : "no"}`);
line(`  spirit: ${rp.spirit.works ? "yes" : "⛔ no — " + rp.spirit.why.slice(0, 60)}`);
line(`  healing: ${rp.healing.works ? "yes" : "⛔ no — it burns it"}`);
line("");
