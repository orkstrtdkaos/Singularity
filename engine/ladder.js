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
