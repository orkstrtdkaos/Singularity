// toolkit.js — SNG-142: the "WHAT YOU COULD REACH FOR" block. Each turn the engine holds up a compact
// summary of the player's OWN toolkit — crafts they may have forgotten, two that might combine, a declared
// aspiration to practice, a carried item / companion / party-member that could serve, the function-gap, and
// the always-available attribute action — so the GM can OFFER ONE, lightly (rule 16B). A good GM holds the
// toolkit up in the moment so the player needn't remember it all. Pure; never throws. Reuses built systems
// (practice uses/aspirations/coActivations, SNG-124 coverage, inventory/companions/party) — it SURFACES
// them to the GM; it does not rebuild them.

import { familiesOfAbility } from "./functions.js";

const cap = (arr, n) => (arr || []).slice(0, n);
const pairKey = (a, b) => [a, b].sort().join("|");

/** A carried item's OFFERABLE capability (what it could DO), from its authored uses / consumable / tags. */
function itemCapability(item) {
  if ((item.uses || []).length) return item.uses.map(u => u.label).filter(Boolean).slice(0, 2).join(", ");
  if (item.consumable) return "consumable";
  if ((item.bonusTags || []).length) return `aids ${item.bonusTags.slice(0, 2).join("/")}`;
  return item.description ? String(item.description).slice(0, 60) : "";
}

/** A companion's CAPABILITY (role + what they know), not just their presence. */
function companionCapability(c) {
  if (!c || !c.name) return null;
  const know = (c.knowledge || []).slice(0, 2).join("; ");
  return `${c.name}${c.role ? ` (${c.role})` : ""}${know ? ` — knows ${know}` : ""}`;
}

/** The strongest pair of the character's OWN owned abilities that might braid: adjacency by a shared function
 *  family, ranked by any prior co-use (a braid they've actually leaned toward). No authored pair-generator
 *  exists (the combination machinery targets unowned catalog entries), so this is the light heuristic the
 *  spec's OQ1 recommends — the engine surfaces the candidate; the GM decides if the beat fits. */
function bestComboPair(owned, catalog, fnIndex, co) {
  const fams = {};
  for (const a of owned) fams[a.abilityId] = new Set(familiesOfAbility(catalog[a.abilityId] || {}, fnIndex) || []);
  let best = null;
  for (let i = 0; i < owned.length; i++) for (let j = i + 1; j < owned.length; j++) {
    const ai = owned[i].abilityId, aj = owned[j].abilityId;
    const shared = [...(fams[ai] || [])].filter(f => (fams[aj] || new Set()).has(f));
    const coUse = co[pairKey(ai, aj)] || 0;
    if (!shared.length && !coUse) continue;
    const score = coUse * 2 + shared.length;
    if (!best || score > best.score) best = { score, a: catalog[ai]?.name || ai, b: catalog[aj]?.name || aj, why: coUse ? "you've woven these before" : `both ${shared[0]}` };
  }
  return best;
}

/** Build the compact TOOLKIT block string (or "" when there's nothing worth offering beyond the attribute
 *  floor). Pure over the character + resolved helpers.
 *  opts: { catalog, fnIndex, coverageMissing, companions, party, rules }. */
export function toolkitForGM(character, opts = {}) {
  const { catalog = {}, fnIndex = null, coverageMissing = [], companions = [], party = [], rules = {} } = opts;
  const owned = character?.abilities || [];
  const uses = character?.practice?.uses || {};
  const co = character?.practice?.coActivations || {};
  const lines = [];

  // (1) SNG-173: crafts gone QUIET — never used, or not used lately. This read `uses === 0`, which
  // meant a single use removed an ability from the pool forever: the block emptied precisely as the
  // toolkit grew large enough to be worth holding up. Recency restores it without loosening rule
  // 16B's offer rate — the pool is what was broken, not the rate.
  //
  // MIGRATION MATTERS HERE, and the obvious version is wrong. A save from before `lastUsed` existed
  // has no stamps at all. Treating every unstamped ability as long-quiet made the block name Silas's
  // THREE MOST-USED crafts — Order-Sense (58 uses), Palework (27), Deathsense (25) — as "gone quiet",
  // which reads as nonsense to the player and would have discredited the whole block on first sight.
  // So an unstamped ability is judged by frequency instead: heavily-used ones are presumed in play
  // and wait until they earn a stamp; lightly-used ones (the five Silas used exactly once) come back.
  const quietAfter = rules?.practice?.toolkitQuietDays ?? 7;
  const presumedInUse = rules?.practice?.toolkitInUseThreshold ?? 5;
  const lastUsed = character?.practice?.lastUsed || {};
  const day = Number.isFinite(Number(opts.day)) ? Number(opts.day) : null;
  // Returns null when the craft is NOT quiet; otherwise a rank where larger = quieter.
  const quietness = (id) => {
    const n = uses[id] || 0;
    if (!n) return Infinity;                               // never leaned on — the quietest of all
    const at = lastUsed[id];
    if (at == null) return n <= presumedInUse ? presumedInUse - n : null;  // pre-stamp save: judge by frequency
    if (day == null) return null;                          // stamped but no clock — cannot judge recency
    const quiet = day - at;
    return quiet >= quietAfter ? quiet : null;
  };
  const forgotten = cap(
    owned.map(a => ({ id: a.abilityId, q: quietness(a.abilityId) }))
      .filter(x => x.q != null)
      .sort((a, b) => b.q - a.q)
      .map(x => catalog[x.id]?.name || x.id), 3);
  if (forgotten.length) lines.push(`- Crafts gone quiet: ${forgotten.join(", ")}.`);

  // (2) two owned crafts that might braid further together (rule 16 combo, as an INVITATION)
  if (fnIndex && owned.length >= 2) {
    const pair = bestComboPair(owned, catalog, fnIndex, co);
    if (pair) lines.push(`- Might reach further together: ${pair.a} + ${pair.b}${pair.why ? ` (${pair.why})` : ""}.`);
  }

  // (3) a declared aspiration in play — bend a beat toward practicing it (THE gap: the GM couldn't see these)
  const ripeAt = rules?.practice?.aspirationRipe ?? 10;
  for (const asp of cap(character?.practice?.aspirations || [], 2)) {
    const nm = catalog[asp.abilityId]?.name || asp.abilityId;
    lines.push(`- Aspiration in play: working toward ${nm} (${asp.progress || 0}/${ripeAt}) — a beat that practices it advances it.`);
  }

  // (3b) SNG-215 §A1: crafts the PLAYER flagged (boosted) to use more — a thumb on the scale for which craft a
  // choice pre-fills (feeds the SNG-214 diversity rule), never a force: surface a boosted craft when it FITS.
  const boosted = cap((character?.boostedCrafts || []).map(id => catalog[id]?.name || id), 4);
  if (boosted.length) lines.push(`- Player wants to use these MORE (favour them when a beat genuinely fits — never force an ill-fitting one): ${boosted.join(", ")}.`);

  // (4) a carried item that could serve — a named/legendary/evolving item, a consumable, or one with authored uses/tags
  const notableItems = cap((character?.inventory || []).filter(i => i && (i.customName || i.evoStageName || (i.uses || []).length || i.consumable || (i.bonusTags || []).length)), 2)
    .map(i => { const capy = itemCapability(i); return `${i.customName || i.evoStageName || i.name}${capy ? ` — ${capy}` : ""}`; });
  if (notableItems.length) lines.push(`- Carried, could serve a fitting beat: ${notableItems.join("; ")}.`);

  // (5) a companion's CAPABILITY (role + what they know), so the GM can offer them, not just narrate their presence
  const compCaps = cap((companions || []).map(companionCapability).filter(Boolean), 2);
  if (compCaps.length) lines.push(`- With you: ${compCaps.join("; ")}.`);

  // (6) a party member (another PLAYER's character) — a COOPERATIVE move is possible; invite, never commit them
  const partyNames = cap((party || []).map(m => m?.name).filter(Boolean), 2);
  if (partyNames.length) lines.push(`- In this shared scene: ${partyNames.join(", ")} — a cooperative move together is possible (INVITE their player; never commit their character).`);

  // (7) the function-gap (SNG-124) — a craft-family the kit lacks, a door to point at
  if ((coverageMissing || []).length) lines.push(`- Not yet in your kit: no ${cap(coverageMissing, 2).join(" / ")} craft — a beat may come to want one.`);

  // (8) the always-available floor — a plain attribute action, for when no craft fits
  lines.push(`- Always available: a plain attribute action (a feat of Strength/Agility/Wits/Presence — or the same from someone present) serves when no craft is a clean fit.`);

  // Only the bare attribute floor isn't worth surfacing as a block — offer it when there's something specific too.
  return lines.length > 1 ? lines.join("\n") : "";
}
