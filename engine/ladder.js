/** SNG-356 — THE SUB-ATTRIBUTE LADDER'S DERIVED GRANTS.
 *
 *  Erik: "specify what each point up to 20 gets you so we can better control the impact and the player can
 *  see it exactly." Every rank's grant is AUTHORED in rules/sub_attribute_ladder.json, never computed here
 *  — so Erik retunes without a build, and the player can read the same table the engine pays from.
 *
 *  ⛔ PAID AGAINST A HIGH-WATER MARK, NOT RECOMPUTED. The ladder's `cumulative[rank]` is the TOTAL owed for
 *  standing at that rank, so applying it naively would re-add the whole amount on every pass and inflate a
 *  pool without limit. `character.ladderPaid[sub]` records the rank each pool has been paid to; the grant
 *  is always the DIFFERENCE. That makes it idempotent, and makes the retroactive pass (Erik ruled the
 *  ladder retroactive) just the ordinary case with a starting mark of zero.
 *
 *  ⚠️ POOLS ONLY. Four subs are `kind: "rate"` — agility→defenseBonus, insight→senseTier,
 *  presence→reputationGain, wits→critChance. A rate is not a grant you bank; it is a modifier READ at the
 *  moment it applies, and paying it into a stored field would be the writer-with-no-reader shape from the
 *  other side. Those need consumers at their own sites and are deliberately NOT touched here.
 */

/** The pool-governing subs, from the content — never a list retyped in code. */
export function poolSubs(ladder) {
  return Object.entries(ladder?.subs || {}).filter(([, def]) => def?.kind === "pool");
}

/** What this character is owed right now: one entry per pool sub whose rank has outrun its paid mark. */
export function ladderGrantsOwed(character, ladder) {
  if (!ladder || !character) return [];
  const paid = character.ladderPaid || {};
  const owed = [];
  for (const [sub, def] of poolSubs(ladder)) {
    const rank = Math.max(0, Math.min(20, Math.round(Number(character.subAttributes?.[sub] || 0))));
    if (!rank) continue;
    const from = Math.max(0, Math.min(20, Math.round(Number(paid[sub] || 0))));
    if (rank <= from) continue;
    const total = Number(def.cumulative?.[String(rank)] ?? 0);
    const already = from ? Number(def.cumulative?.[String(from)] ?? 0) : 0;
    const amount = total - already;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    owed.push({ sub, field: def.governs, unit: def.unit || "", from, to: rank, amount });
  }
  return owed;
}

/** Apply what is owed. Returns the applied entries so a caller can toast or log them once.
 *
 *  ⚠️ THE POOL AND THE CURRENT VALUE MOVE TOGETHER. Raising maxHealth without raising health hands the
 *  player a bigger bar that is already partly empty — a grant that reads as a loss. */
export function applyLadderGrants(character, ladder) {
  const owed = ladderGrantsOwed(character, ladder);
  if (!owed.length) return [];
  character.ladderPaid = character.ladderPaid || {};
  for (const g of owed) {
    const cur = Number(character[g.field] || 0);
    character[g.field] = cur + g.amount;
    if (g.field === "maxHealth") character.health = Math.min(character.maxHealth, Number(character.health || 0) + g.amount);
    if (g.field === "maxEnergy") character.energy = Math.min(character.maxEnergy, Number(character.energy || 0) + g.amount);
    character.ladderPaid[g.sub] = g.to;
  }
  return owed;
}

/** What a rank BUYS, for the player-facing readout — the same authored line the engine pays from, so the
 *  screen and the arithmetic can never disagree. Returns null past the authored top. */
export function ladderRungLine(ladder, sub, rank) {
  const def = ladder?.subs?.[sub];
  if (!def) return null;
  const r = Math.max(1, Math.min(20, Math.round(Number(rank) || 1)));
  const per = Number(def.perRank?.[String(r)] ?? 0);
  const cum = Number(def.cumulative?.[String(r)] ?? 0);
  return { sub, rank: r, governs: def.governs, unit: def.unit || "", perRank: per, cumulative: cum, line: def.line || "" };
}

/** The roll contribution for a rank — the ONE place that reads the shared roll column, so the resolver,
 *  any readout, and the harness cannot drift about what a rank is worth on the dice. */
export function ladderRoll(ladder, rank) {
  const table = ladder?.rollCumulative;
  if (!table) return null;
  const r = Math.max(1, Math.round(Number(rank) || 1));
  const capped = Math.min(20, r);
  const base = Number(table[String(capped)] ?? 0);
  const beyond = Math.max(0, r - 20) * Number(ladder.rollPerRank?.["20"] ?? 0);
  return base + beyond;
}

/** SNG-365 — THE RATE SUBS. Four of the eight are `kind: "rate"`, and a rate is READ where it applies
 *  rather than banked into a field — banking one would be the writer-with-no-reader bug inverted.
 *
 *  ⛔ ONE READER, FOUR SITES. Each rate has its own consumer (a defence term, a crit dial, attunement,
 *  renown), and they must all consult the ladder the SAME way or the four drift into four opinions about
 *  what a rank is worth. This is the one function they share.
 *
 *  Returns 0 when the ladder is absent, which is the right degradation: a missing table means no bonus,
 *  never a broken roll. */
export function rateValue(ladder, character, sub) {
  const def = ladder?.subs?.[sub];
  if (!def || def.kind !== "rate") return 0;
  const rank = Math.max(0, Math.min(20, Math.round(Number(character?.subAttributes?.[sub] || 0))));
  if (!rank) return 0;
  return Number(def.cumulative?.[String(rank)] ?? 0);
}

/* ═══ SNG-390 — MILESTONE EFFECTS. The ladder authors 56 milestones and marks 16 of them ⚑ to
 * mean "this one is mechanical, not flavour". ⛔ THE MARKER HAD NO READER — nothing in the engine could
 * tell a milestone that DOES something from one that only says something, so a promise with no
 * implementation read exactly like a promise with one. Two of them turned out to be exactly that.
 *
 * ⚠️ THE EFFECTS ARE TRANSCRIBED, NOT INVENTED. `milestoneEffects` in the content states what each
 * ⚑ line already said in prose; this reads that structure. Nothing new is promised here, and where a
 * milestone names something the engine does not have, the entry carries `blocked` and a reason rather
 * than being dropped — an unbuilt promise that is written down is a decision waiting to be made, and one
 * that is deleted is a lie the player already read.
 */

/** ⚠️ HOW STRONG A MILESTONE EFFECT IS, when it says so at all. ⛔ ONLY THE FIELDS THAT ARE ACTUAL
 *  MAGNITUDES — a state like `householdEndures` has none, and comparing states by number would be
 *  inventing an order the ruling explicitly refuses ("household never becomes a number"). Returning null
 *  there is what sends the comparison back to `at`. */
function magnitudeOf(eff) {
  for (const k of ["places", "rungs", "extra"]) if (Number.isFinite(eff?.[k])) return Number(eff[k]);
  return null;
}

/** Every milestone effect this character has REACHED, by kind. Blocked entries are excluded from the live
 *  map and returned separately, so a caller can never accidentally act on an unbuilt promise. */
export function milestoneEffects(ladder, character) {
  const live = {}, blocked = [];
  for (const [sub, def] of Object.entries(ladder?.subs || {})) {
    const rank = Math.max(0, Math.min(20, Math.round(Number(character?.subAttributes?.[sub] || 0))));
    for (const [at, entry] of Object.entries(def?.milestoneEffects || {})) {
      if (rank < Number(at)) continue;                 // not reached
      // ⛔ R25a (ERIK 2026-09-02) — A RANK MAY CARRY MORE THAN ONE EFFECT, AND NOW ONE DOES.
      // `presence` 14 already held `unstewardedFloor`; R25a gives the same rank the SIXTH company place.
      // ⚠️ THE OLD SHAPE COULD NOT SAY THAT — one object per rank, so the second effect would have
      // silently replaced the first and a milestone the player had already earned would stop working.
      // ⛔ THE RULING NAMES THIS AS DELIBERATE: "Milestones may be compound — but it must be deliberate."
      // A bare object still means one effect, so all 15 existing entries are untouched.
      for (const eff of (Array.isArray(entry) ? entry : [entry])) {
      if (eff?.blocked) { blocked.push({ sub, at: Number(at), ...eff }); continue; }
      // ⚠️ THE HIGHEST REACHED WINS, not the sum. `harmRung 1` at agility 7 and `harmRung 2` at 14 are
      // ABSOLUTE readings of the same effect — "a second rung" — so adding them would give a rank-14
      // character three rungs and quietly double the milestone they just earned.
      // ⛔ R25a — CROSS-SUB TIES ARE NOW POSSIBLE, AND `at` CANNOT BREAK THEM. Ranks from DIFFERENT subs
      // are not comparable magnitudes: rapport 10 ("a fourth place") and presence 10 ("a fifth") both sit
      // at 10, so the winner fell out of JSON KEY ORDER. ⚠️ MEASURED, NOT SUSPECTED — reversing the order
      // of `subs` in the ladder file changed a rapport-10/presence-10 character from 5 places to 4.
      //
      // ⚠️ IT WAS NEVER WRONG BEFORE, WHICH IS WHY IT SURVIVED: while exactly one sub owned each `kind`,
      // `at` was a faithful proxy for magnitude. R25a made presence a second writer of `companyCapacity`
      // and the proxy stopped holding — the defect arrived with the content, not with the code.
      //
      // ✅ COMPARE THE EFFECT'S OWN MAGNITUDE WHERE IT HAS ONE, which is what "the highest reached wins"
      // always meant. `harmRung` 1 at agility 7 vs 2 at agility 14 still resolves to 2 — same answer, and
      // now for the stated reason rather than by coincidence of ordering.
      const prev = live[eff.kind];
      const wins = !prev || (() => {
        const a = magnitudeOf(eff), b = magnitudeOf(prev);
        return (a !== null && b !== null) ? a > b : Number(at) > prev.at;
      })();
      if (wins) live[eff.kind] = { sub, at: Number(at), ...eff };
      }
    }
  }
  return { live, blocked };
}

/** How many places at your side your rapport has earned. ⚠️ The BASE is 1 and it is authored, not
 *  assumed: rapport rank 1 reads "Someone will travel with you." The ⚑ milestones then name the second,
 *  third and fourth explicitly, so the cap is read rather than computed from a curve. */
export function companyPlaces(ladder, character) {
  const e = milestoneEffects(ladder, character).live.companyCapacity;
  return e && Number.isFinite(e.places) ? e.places : 1;
}

/** ⛔ R25b (ERIK 2026-09-02) — HOW MANY PEOPLE CAN RUN SOMETHING IN YOUR NAME WHILE YOU ARE ELSEWHERE.
 *
 *  ⚠️ THIS IS A DIFFERENT SCALE FROM `companyPlaces` AND THE RULING SEPARATES THEM ON PURPOSE. Company is
 *  who is AT YOUR SIDE — a milestone count, capped at 6. Delegation is who is ABSENT and running what you
 *  would otherwise run yourself, and Erik ruled it a FORMULA, not a milestone: "how many you can delegate
 *  to manage things you would otherwise need to should grow with level AND ability."
 *
 *  ⛔ `floor(level / 10)` IS THE SHAPE ERIK RULED; the constants were left to me. ⚠️ IT STARTS AT ZERO AND
 *  THAT IS THE POINT — a level-5 character has nobody running holdings in their absence, and the first
 *  delegate at level 10 is a threshold worth feeling. ✅ VALIDATED AGAINST SILAS: L30 → 3, and he is running
 *  exactly 3 delegates. ⛔ THE MODEL WAS NOT FITTED TO HIM — the ruling's own numbers landed on him.
 *
 *  ⚠️ RAPPORT 14 IS THE ONLY RANK THAT ADDS A NUMBER. R25c: 14 "raises delegation capacity", while 18
 *  ("a household, and it holds without you") and 20 are STATES. ⛔ HOUSEHOLD NEVER BECOMES A NUMBER —
 *  those two change what your people DO in your absence and must never count them.
 *
 *  ⚠️ COUNTS PEOPLE, NOT CHARGES. Silas's Edvar Crane holds two assignments and is one delegate; capacity
 *  is attention, and a second errand for someone you already trust does not cost a new relationship. */
export function delegationCapacity(ladder, character) {
  const level = Math.max(1, Number(character?.level) || 1);
  const e = milestoneEffects(ladder, character).live.delegationCapacity;
  const bonus = e && Number.isFinite(e.extra) ? e.extra : 0;
  return Math.max(0, Math.floor(level / 10) + bonus);
}

/** ⚠️ THE TWO STATES RAPPORT BUYS, WHICH ARE NOT NUMBERS AND MUST NEVER BECOME ONE. R25c rules rapport 18
 *  "a household, and it holds without you" and 20 "they would not be talked out of it" as STATES. This
 *  reports them so narration and the GM can read them; ⛔ NOTHING HERE ADDS TO A ROLL, and the module
 *  comment this ruling upholds stands: "the moment a pregnant wife grants a combat bonus the game has
 *  said something false." */
export function serviceStates(ladder, character) {
  const live = milestoneEffects(ladder, character).live;
  return { householdEndures: !!live.householdEndures, loyaltyUnbought: !!live.loyaltyUnbought };
}
/** ⛔ HOW MANY RUNGS LIGHTER A BLOW LANDS. agility 7: "a blow that would incapacitate lands one rung
 *  lighter." agility 14: "a second rung. What kills others wounds you." */
export function harmRungDrop(ladder, character) {
  const e = milestoneEffects(ladder, character).live.harmRung;
  return e && Number.isFinite(e.rungs) ? e.rungs : 0;
}
