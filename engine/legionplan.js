// engine/legionplan.js — CCODE-407. SOMEBODY ELSE DRAWS UP THE ORDER OF BATTLE.
//
// ⛔ ERIK: "I want this to be easy on the PC so we can have a delegate (GM through a chosen npc) come up with the legion plan."
//
// ⚠️ AND THE SPLIT THAT MAKES THAT BUILDABLE: THE ARITHMETIC IS KNOWABLE, SO IT IS NOT GUESSED. Which holds have spare capacity,
// which people can be asked, which gaps a person would close, who is the highest level standing in a band — the engine knows every one
// of those exactly. What a delegate adds is a VOICE and a decision to trust somebody else with it; what it must not add is invented
// numbers. So this module drafts a plan DETERMINISTICALLY from what exists, and the delegate's name goes on it.
//
// ⛑ THEREFORE THE SAME SAVE ALWAYS DRAFTS THE SAME PLAN. No rng, no model call, no hidden state: it is a reader. That also means it is
// testable against the real saves, which a plan composed by a model would not be — and a plan the player is asked to approve had
// better be one the suite can check.
//
// ⛔ IT PROPOSES, IT NEVER WRITES. Every step names an existing writer (`addContingent`, `setUnitLeader`, `formLegion`) and the caller
// applies them. A planner that could also act would be a second way to change the same state, and the two would drift.
//
// ⛔ AND DRAFTING IS FREE, on Erik's ruling: "you should be able to build the legion (identify who and how many from where) without
// incurring the cost." The plan REPORTS what calling the result would cost and spends nothing.
//
// PURE. Reads the character and content; returns data.

import { canBeAskedToWork, musterCapacityOf } from "./holdings.js";
import { detachedFrom } from "./jobstate.js";   // ⛔ CCODE-431: the hands out on jobs are still the hold's
import { contributionsOf } from "./combatants.js";
import { unitsOf, levelOfPerson } from "./fellowship.js";
import { bandGaps, leaderBonusOf, callCostOf, contingentsOf } from "./melee.js";

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
const arr = (v) => (Array.isArray(v) ? v : []);

/** ⛔ WHO YOU COULD ASK, and why one of them is the obvious choice. ⚠️ THE ANSWER IS NOT "ANYONE": planning a campaign is reading the
 *  ground and knowing your people, so somebody who brings KNOW comes first — that is `contributionsOf`'s own family, the same word the
 *  band layer uses for it — and level breaks the tie. Anybody standing in one of your units or walking with you may be asked. */
export function planDraftersFor(character, { content = {}, worldDay = null } = {}) {
  const reg = character?.npcRegistry || {};
  const seen = new Map();
  const consider = (id) => {
    if (!id || seen.has(id)) return;
    const rec = reg[id] || content?.npcs?.[id] || null;
    if (!rec) return;
    const does = contributionsOf({ ...rec, id }, { evidence: true });
    seen.set(id, { id, name: rec.name || id, role: rec.role || null, does,
      reads: does.includes("KNOW"), level: levelOfPerson(character, id, { content, worldDay }) });
  };
  for (const m of arr(character?.company)) consider(m?.npcId || m?.id);
  for (const u of unitsOf(character, { content, worldDay }))
    for (const c of contingentsOf(u.unit)) if (c?.npcId) consider(String(c.npcId));
  return [...seen.values()].sort((a, b) => (b.reads ? 1 : 0) - (a.reads ? 1 : 0) || b.level - a.level
    || String(a.name).localeCompare(String(b.name)))
    // ⚠️ THE CLAUSE AGREES WITH "THEY", because that is what the sentence around it says: "asked of X because they read the ground".
    .map(d => ({ ...d, why: d.reads ? "read the ground — that is what planning is" : "know your people, if nobody here reads ground" }));
}

/** ⛔ THE PLAN. Steps in the order they must be applied, each naming the writer that applies it, plus what the result would be worth
 *  and what it would cost to call. ⚠️ EVERY STEP IS BOUNDED BY SOMETHING REAL — a hold's own `handsCap` less its crew and the heads
 *  already raised there, a person the WORK bar reaches, a leader who is actually standing in the unit. Nothing here can propose a
 *  head, a person or a place that does not exist. */
export function draftLegionPlan(character, { content = {}, worldDay = null, cfg = null, holdCfg = null, byId = null, maxAsksPerBand = 2 } = {}) {
  // ⛔ TWO BAGS, NEVER CROSSED. `cfg` is the MELEE dials (`leaderStep`, the gap multipliers, the call price) and a person's LEVEL is
  // read from `rules.npcStanding` — the merged one. ⚑ Caught on the screen: the app handed `meleeCfg()` in as the level bag and Fendt
  // read level 4 in the plan against 16 on the roster two lines above. `memberRows`'s own comment records that exact trap collapsing
  // everyone to level 1, and this is the third time today I have crossed these two. `levelOfPerson` derives the right bag from
  // `content` when it is given none, so it is given none.
  const opts = { content, worldDay };
  const drafters = planDraftersFor(character, opts);
  const by = (byId && drafters.find(d => d.id === byId)) || drafters[0] || null;
  const units = unitsOf(character, opts);
  const bands = units.filter(u => !u.isLegion);
  const steps = [];
  if (!bands.length) {
    return { by, steps, after: null,
      why: "You have no band to plan around yet — raise one first, and there is something to arrange." };
  }

  // ⚑ WORKING COPIES: the plan reasons about what each band WOULD hold after the earlier steps, or it would propose the same
  // gap-closer to three bands and appoint one person captain of all of them.
  const heads = new Map(bands.map(b => [b.id, num(b.head, 0)]));
  const claimed = new Set();                           // people this plan has already spent
  const familiesOf = new Map(bands.map(b => [b.id, new Set(arr(b.can))]));
  const captains = new Map(bands.map(b => [b.id, b.leader?.id || null]));

  // ── 1 · A CAPTAIN FOR EVERY BAND THAT HAS NONE, from the people standing in it
  for (const b of bands) {
    if (captains.get(b.id)) continue;
    const inIt = [...new Set(contingentsOf(b.unit).map(c => c.npcId).filter(Boolean).map(String))]
      .filter(id => !claimed.has(id))
      .map(id => ({ id, level: levelOfPerson(character, id, opts),
        name: character?.npcRegistry?.[id]?.name || content?.npcs?.[id]?.name || id }))
      .sort((x, y) => y.level - x.level);
    const pick = inIt[0];
    if (!pick || pick.level <= 0) continue;
    const bonus = leaderBonusOf({ ...b.unit, captain: pick.id }, { levelOf: (id) => levelOfPerson(character, id, opts), cfg: cfg || {} });
    if (bonus <= 0) continue;                          // ⚠️ an appointment worth nothing is not a plan, it is paperwork
    captains.set(b.id, pick.id);
    claimed.add(pick.id);
    steps.push({ kind: "captain", writer: "setUnitLeader", unitId: b.id, unitName: b.name,
      npcId: pick.id, name: pick.name, level: pick.level, bonus,
      why: `+${bonus} to every head in ${b.name}` });
  }

  // ── 2 · SOMEBODY WHO CLOSES A GAP, for each band that has one
  const askable = Object.entries(character?.npcRegistry || {})
    .filter(([id, n]) => canBeAskedToWork({ ...n, id }))
    .map(([id, n]) => ({ id, name: n.name || id, role: n.role || null,
      does: contributionsOf({ ...n, id }, { evidence: true }), level: levelOfPerson(character, id, opts) }));
  const standingAnywhere = new Set(units.flatMap(u => contingentsOf(u.unit).map(c => c.npcId)).filter(Boolean).map(String));
  for (const b of bands) {
    let asks = 0;
    for (const gap of bandGaps(b.unit, { cfg: cfg || {} })) {
      if (asks >= maxAsksPerBand) break;
      if (familiesOf.get(b.id).has(gap.missing)) continue;
      const pick = askable
        .filter(p => !claimed.has(p.id) && !standingAnywhere.has(p.id) && p.does.includes(gap.missing))
        .sort((x, y) => y.level - x.level)[0];
      if (!pick) continue;
      claimed.add(pick.id);
      for (const f of pick.does) familiesOf.get(b.id).add(f);
      heads.set(b.id, heads.get(b.id) + 1);
      asks++;
      steps.push({ kind: "recruit", writer: "addContingent", unitId: b.id, unitName: b.name,
        npcId: pick.id, name: pick.name, role: pick.role, level: pick.level, does: pick.does, closes: gap.missing,
        why: `${gap.why} — ${pick.name} covers it` });
    }
  }

  // ── 3 · HANDS AT EVERY PLACE THAT CAN STILL FEED THEM. ⚠️ Provenance first: hands raised at a hold join the band that place is the
  //        seat of, and otherwise the band carrying the fewest people, so a plan spreads rather than piling everyone in one column.
  for (const h of arr(character?.holdings)) {
    if (!h || h.condition === "failing") continue;
    const already = units.reduce((a, u) => a + contingentsOf(u.unit)
      .reduce((s, c) => s + (!c.npcId && String(c.from || "") === String(h.id) ? num(c.n, 0) : 0), 0), 0)
      + detachedFrom(character, h.id);   // ⛔ CCODE-431: hands out on a job still eat this hold's bread
    const spare = musterCapacityOf(h, holdCfg, { mustered: already });
    if (spare <= 0) continue;
    const seated = bands.find(b => String(b.seatId || "") === String(h.id));
    const target = seated || [...bands].sort((a, b) => heads.get(a.id) - heads.get(b.id))[0];
    if (!target) continue;
    heads.set(target.id, heads.get(target.id) + spare);
    steps.push({ kind: "muster", writer: "addContingent", unitId: target.id, unitName: target.name,
      holdingId: h.id, holdName: h.name || h.id, n: spare,
      why: `${h.name || h.id} can feed ${spare} more${seated ? " and is their seat" : ""}` });
  }

  // ── 4 · AND FORM THEM UP, if there is more than one band to form
  const free = bands.filter(b => !b.inLegion);
  if (free.length >= 2) {
    const seat = arr(character?.holdings).find(h => h && h.id === free[0].seatId) || arr(character?.holdings)[0] || null;
    const name = seat?.name ? `the Legion of ${seat.name}` : `${character?.name || "the"} Legion`;
    const legionId = `legion-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32)}`;
    steps.push({ kind: "form", writer: "formLegion", id: legionId,
      name, from: free.map(b => b.id), fromNames: free.map(b => b.name),
      why: `${free.length} bands under one command, each keeping its own people` });
    // ⚑ AND ITS COMMANDER: the highest level anywhere in it, including the character, who commands most of what they raise.
    const cands = [{ id: "player", name: character?.name || "you", level: levelOfPerson(character, "player", opts) },
      ...[...standingAnywhere, ...claimed].map(id => ({ id, level: levelOfPerson(character, id, opts),
        name: character?.npcRegistry?.[id]?.name || content?.npcs?.[id]?.name || id }))]
      .sort((a, b) => b.level - a.level);
    const cmd = cands[0];
    // ⚠️ IT CARRIES THE LEGION'S ID, not only its name: the unit does not exist until the step before this one is applied, and a
    // caller matching on a NAME would appoint nobody the moment two legions were ever called something similar.
    if (cmd && cmd.level > 0) steps.push({ kind: "commander", writer: "setUnitLeader", unitId: legionId, unitName: name,
      npcId: cmd.id, name: cmd.name, level: cmd.level, why: `the highest level under the banner` });
  }

  // ── AND WHAT IT WOULD COME TO. ⚠️ The cost is REPORTED, never charged: drafting is free and calling is not.
  const totalHeads = [...heads.values()].reduce((a, n) => a + n, 0);
  const priced = callCostOf(arr(character?.bands), { contingents: [{ n: totalHeads, quality: 1, does: ["HARM"] }] },
    { cfg: cfg || {}, wagePerHand: num(holdCfg?.growth?.wagePerHand, 0) });
  return { by, steps,
    after: { heads: totalHeads, wouldCost: priced, bands: bands.length, legion: free.length >= 2 },
    why: steps.length
      ? `${by ? by.name : "Somebody"} would put ${totalHeads} under arms across ${bands.length} ${bands.length === 1 ? "band" : "bands"}${free.length >= 2 ? ", formed up as one legion" : ""} — and it costs nothing until they are called.`
      : "There is nothing left to arrange: every band is captained, every gap covered, and every place you hold is already feeding all it can." };
}
