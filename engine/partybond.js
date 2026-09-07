// engine/partybond.js — WHAT ONE PLAYER'S CHARACTER FEELS ABOUT ANOTHER'S.
//
// ⛔ SPEC_intent_heard_and_unheard §3 (Aevi, answering SPEC_party_mode_phase2 §3d, which I held open as a ruling):
// **being listened to is worth something, and being overruled costs nothing.** Aevi's own original proposal had the
// penalty half and she withdrew it:
//
//   ⚠️ "A player who is charged for being overruled stops stating intents, and the leader loses the briefing that makes
//      the leader model work at all." — same fact, opposite effect on whether the feature gets used.
//
// ⛑ SO THERE IS NO NEGATIVE CASE IN THIS FILE. Not a smaller positive; none. A function that lowered a party bond would
// be a rule about two friends at one table, and that is not ours to write.
//
// ⚑ AND IT IS ITS OWN THING, NOT `growBond` (Aevi's Q3). Three reasons, measured:
//   1. ⛔ `companionBonds` DRIVES ABILITY RANKS — `growBond` calls `syncStageTaughtRanks`, so `progression: "stage"`
//      crafts take their rank from the bond. A player character must never grant another player character ranks.
//   2. companion bonds carry romance stages and a departure model that mean nothing between two players' characters.
//   3. the append-only bond log (SNG-361) is keyed to companion sources; this has exactly one source.

const CAP = 10;                 // the same ceiling every bond in this game has
const HEARD_DEFAULT = 0.25;     // "small. A nudge" — the assist rate, not the encounter rate
const SCENES_KEPT = 12;         // enough to enforce once-per-scene without growing the save

export function ensurePartyBonds(character) {
  if (!character) return null;
  if (!character.partyBonds || typeof character.partyBonds !== "object") character.partyBonds = {};
  return character.partyBonds;
}

/** PURE-ish (mutates the character, like every bond writer here). What this character feels toward another PLAYER's. */
export function partyBondOf(character, otherId) {
  const b = character?.partyBonds?.[otherId];
  return b ? { score: Number(b.score) || 0, name: b.name || otherId, heardIn: b.heardIn || [] } : { score: 0, name: otherId, heardIn: [] };
}

/** ⛔ THE ONE WRITER, AND IT ONLY GOES UP. The leader took their suggestion: a nudge between the two CHARACTERS,
 *  ⚑ once per scene per pair (Aevi: "small. A nudge, and one per scene per pair"), clamped, and it says what it did.
 *  ⚠️ Returns null when nothing moved — a second hearing in the same scene is not an error, it is simply not news. */
export function noteHeard(character, { by, name = null, sceneId = null, rules = null } = {}) {
  if (!character || !by || by === character.id) return null;
  const bonds = ensurePartyBonds(character);
  const prev = bonds[by] || { score: 0, name: name || by, heardIn: [] };
  const seen = Array.isArray(prev.heardIn) ? prev.heardIn : [];
  if (sceneId && seen.includes(sceneId)) return null;            // once per scene per pair
  const step = Number(rules?.party?.heardBond);
  const grow = Number.isFinite(step) ? step : HEARD_DEFAULT;
  const before = Number(prev.score) || 0;
  const after = Math.min(CAP, Math.round((before + grow) * 100) / 100);
  bonds[by] = {
    score: after,
    name: name || prev.name || by,
    heardIn: (sceneId ? [...seen, sceneId] : seen).slice(-SCENES_KEPT),
  };
  if (after === before) return null;
  return { by, name: bonds[by].name, from: before, to: after };
}

/** ⚑ §2 — THE INTENTS THAT WENT UNHEARD. PURE. The caller writes them as beats; nothing here moves a number, and
 *  nothing here is a debt. ⚠️ The person who stated it is excluded from `heard` by id OR by name, because the GM
 *  reports whoever it can name and a party is small enough that a name is unambiguous. */
export function unheardOf(intents = [], heard = []) {
  const said = new Set((heard || []).map(h => String(h || "").trim().toLowerCase()).filter(Boolean));
  return (intents || []).filter(i => i && !said.has(String(i.by).toLowerCase()) && !said.has(String(i.name || "").trim().toLowerCase()));
}

/** ⚑ THE BEAT ITSELF, in the ordered log, attributed to whoever wanted it. ⛔ It moves NO number — it is a THREAD:
 *  the GM may bring it back a scene later, which is the whole value of remembering instead of charging. */
export function unheardBeat(intent, at = new Date().toISOString()) {
  if (!intent?.by) return null;
  return {
    by: intent.by,
    name: intent.name || intent.by,
    label: "wanted otherwise",
    degree: null,
    summary: `${intent.name || intent.by} had wanted to ${String(intent.text || "").replace(/^(to|that)\s+/i, "")}, and the party did not.`,
    at,
    unheard: true,
  };
}
