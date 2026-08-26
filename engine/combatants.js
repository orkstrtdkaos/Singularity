// engine/combatants.js — CCODE-247. WHO IS IN A CONTEST, AND IN WHAT CAPACITY.
//
// ⛔ ERIK: "even a single player has NPC companions and party members — they need to fight with you and
// need protection." ⚠️ MEASURED, THOSE ARE TWO DIFFERENT ASKS AND THE CONTENT ONLY SUPPORTS ONE OF THEM
// TODAY: six of the nine authored companions say, in their own bond grants, that they CANNOT FIGHT.
// Aevi's own companion "cannot fight, cannot lift"; Coil, Ember, Hush, Marrow and Sprig say the same.
//
// ⛔ SO PRESENCE AND PARTICIPATION ARE SEPARATE, AND THAT SPLIT IS THE WHOLE MODULE.
//
//   PRESENT      — in the scene, and therefore TARGETABLE. Keening drops everyone in earshot, including
//                  the healer who never swung at anyone. ⚠️ THIS IS WHAT INTERCEPTION IS FOR: standing in
//                  front of someone is only meaningful when they can be hit and cannot help it.
//   PARTICIPATING — declares and rolls.
//
// ⚠️ A companion who cannot fight STILL NEEDS PROTECTING — more than a fighter does, because they have no
// answer of their own. Making everyone a combatant would have contradicted six authored records; making
// everyone TARGETABLE contradicts none and is what Erik's second clause actually asks for.
//
// ⛔ AND `canAct` IS READ FROM AN AUTHORED FIELD, NOT INFERRED FROM PROSE. "Cannot fight" lives in
// `bondGrants.description` today, and a regex over prose finds words rather than facts — Aevi's warning,
// and the water-word audit stands behind it. The field is `combatant: true`; absent means NO, because the
// documented majority cannot fight and a wrong default here puts a healer in a duel.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ CAN THIS COMPANION TAKE A COMBAT ACTION? Authored, never inferred. ⚠️ DEFAULTS TO FALSE: six of nine
 *  say they cannot, so an absent field means the documented majority rather than the convenient one. */
export function isCombatant(record) {
  return record?.combatant === true;
}

/** A sheet good enough to be HIT. ⚠️ Deliberately minimal — a target needs attributes to resist with, a
 *  health pool, and nothing else. A full combat sheet is what `combatant: true` would need and this is not
 *  that: giving a non-combatant a fighter's statline would be inventing the thing the content refuses. */
export function presenceSheet(record, { level = 1, sb = null } = {}) {
  const a = record?.attributes || {};
  const base = Math.max(1, num(level, 1));
  const fill = (k, d) => Math.max(1, num(a[k], d));
  return {
    id: record?.id || null,
    name: record?.name || record?.id || "a companion",
    level: base,
    // a bystander resists with what they have; absent, a modest floor that scales with the character they
    // travel with, because a companion of a level-9 character is not a level-1 bystander
    attributes: {
      physical: fill("physical", Math.max(1, Math.round(base / 2))),
      mental: fill("mental", Math.max(1, Math.round(base / 2))),
      social: fill("social", Math.max(1, Math.round(base / 2))),
      practical: fill("practical", Math.max(1, Math.round(base / 2))),
    },
    subAttributes: record?.subAttributes || {},
    health: num(record?.health, base * 2),
    maxHealth: num(record?.maxHealth, base * 2),
    conditions: record?.conditions || [],
    skills: [],
  };
}

/** ⛔ EVERYONE ON THE PLAYER'S SIDE OF A CONTEST, with what each may do.
 *
 *  ⚠️ THE PLAYER IS ALWAYS FIRST AND ALWAYS PARTICIPATES. Everyone else is present by default and
 *  participates only where the content says so. */
export function alliesOf(character, { companions = {}, sb = null } = {}) {
  const out = [{
    id: character?.id || "player", name: character?.name || "you", kind: "player",
    present: true, canAct: true, sheet: character,
  }];
  const level = num(character?.level, 1);

  for (const c of (character?.companions || [])) {
    const def = companions?.[c?.id || c] || (typeof c === "object" ? c : null);
    if (!def) continue;
    out.push({
      id: def.id, name: def.name || def.id, kind: "companion",
      present: true,
      // ⛔ AUTHORED. Absent means no — see the header.
      canAct: isCombatant(def),
      cannotFightReason: isCombatant(def) ? null : "this companion does not fight",
      sheet: presenceSheet({ ...def, ...(c.sheet || {}) }, { level, sb }),
    });
  }

  // party members are other CHARACTERS — they act, because a character always can
  for (const p of (character?.party || [])) {
    if (!p) continue;
    out.push({
      id: p.id || p.characterId || null, name: p.name || p.id || "an ally", kind: "party",
      present: true, canAct: true, sheet: p.sheet || p,
    });
  }
  return out;
}

/** ⛔ WHO CAN BE HIT. The set interception cares about — and it is deliberately WIDER than who can fight,
 *  because the person who cannot answer is the one who most needs someone in front of them. */
export function targetableAllies(character, opts = {}) {
  return alliesOf(character, opts).filter(a => a.present);
}

/** Who actually declares. ⚠️ A contest that let a non-combatant declare would be putting a healer who
 *  "cannot fight" into the initiative order — the content says no and this is where that is honoured. */
export function actingAllies(character, opts = {}) {
  return alliesOf(character, opts).filter(a => a.present && a.canAct);
}

/** ⚠️ THE HONEST STATE OF THE ROSTER, for a report rather than a rule: how many travel with you, how many
 *  can act, and how many are present-but-defenceless. The last number is the one that makes interception
 *  worth having, and it should be visible rather than inferred. */
export function rosterSummary(character, opts = {}) {
  const all = alliesOf(character, opts);
  const acting = all.filter(a => a.canAct).length;
  return {
    total: all.length,
    acting,
    defenceless: all.length - acting,
    byKind: all.reduce((m, a) => ({ ...m, [a.kind]: (m[a.kind] || 0) + 1 }), {}),
  };
}
