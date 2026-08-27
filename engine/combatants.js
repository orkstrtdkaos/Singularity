// engine/combatants.js — CCODE-247. WHO IS IN A CONTEST, AND WHAT THEY BRING TO IT.
//
// ⛔ ERIK, CORRECTING MY FIRST VERSION: "the answer to should they be allowed to fight in battles is YES —
// as they are able. Obviously some of them are more geared toward that than others… however, they support,
// heal, distract, etc. — so they literally are part of the fights anyway."
//
// ⚠️ MY FIRST VERSION ASKED A YES/NO QUESTION AND THAT WAS THE ERROR. I measured that six of nine
// companions say "cannot fight" and concluded they were bystanders. They are not bystanders — they are
// PARTICIPANTS WHO DO NOT SWING. Sprig heals, Hush conceals, Ember distracts, Aevi analyses. The tags were
// on the records the whole time and I read them as flavour.
//
// ⛔ SO THE QUESTION IS NOT WHETHER AN ENTITY FIGHTS. IT IS WHAT IT CONTRIBUTES.
// Measured across the nine: 30 assist tags, mapping onto the eight function families — and NOT ONE OF THEM
// MAPS TO `HARM`. That is the whole finding. Everyone is in the fight; almost nobody is in it by hitting.
//
// ⚠️ AND THEY ARE ENTITIES, SOMETIMES PEOPLE — Erik's correction, kept in the vocabulary here. A swarm of
// nanite-motes is not a person and the code should not call it one.
//
// ⛔ THE POPULATION ERIK ACTUALLY MEANT: recruited NPCs. "the main population I was talking about were my
// NPCs that JOIN my party — THEY need to be able to fight with me… that's what makes the more difficult
// things in the game much easier or even possible." That roster already exists — `engine/company.js`,
// COMPANY_ROLES including `ally` — and my first version never read it. It does now.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ WHAT AN ENTITY BRINGS TO A CONTEST, from the tags its record already carries.
 *
 *  ⚠️ THE MAP IS CONTENT-SHAPED AND INJECTABLE. These defaults are a floor, not a ruling — the moment
 *  `assistTagFamilies` is authored it wins. Thirty tags is an authoring vocabulary, not an engine one, and
 *  hardcoding it here would make every future tag an engine change.
 *
 *  ⛔ `HARM` IS ABSENT FROM EVERY DEFAULT ON PURPOSE, because it is absent from all thirty authored tags.
 *  An entity that swings says so with a role or a tag that means it; nothing infers a weapon. */
/** ⛔ OCCUPATIONS THAT ARE ALREADY A DECLARATION OF VIOLENCE. ⚠️ Injectable, and deliberately short: this
 *  is not "jobs that sound tough", it is jobs whose WHOLE FUNCTION is standing between something and
 *  someone. A blacksmith is strong and is not on this list. */
export const DEFAULT_FIGHTING_ROLES = ["warden", "guard", "soldier", "reaver", "hunter", "sentinel",
  "marshal", "champion", "duelist", "blade"];

export const DEFAULT_TAG_FAMILIES = {
  RESTORE: ["mend", "heal", "tend", "comfort", "warm", "grow"],
  PROTECT: ["guard", "watch", "conceal", "dark", "green"],
  KNOW: ["analyze", "study", "investigate", "scout", "track", "sense-danger", "deathsense",
    "sense-precursor", "precursor-lore", "precursor", "recall", "learn", "light"],
  INFLUENCE: ["intimidate", "distract", "talk"],
  SHAPE: ["craft"],
  MOVE: ["navigate-wilds", "carry"],
};

/** The families an entity can act in. ⚠️ EMPTY IS A REAL ANSWER — an entity with no tags contributes
 *  nothing mechanical yet, which is a prompt to author rather than a reason to exclude it. */
/** ⛔ CCODE-265 — DOES THE WORLD SATISFY A NAMED EXCEPTION? Returns the override that lifts a flat
 *  `canStrike: false`, or null.
 *
 *  ⚠️ `when` GRAMMAR IS DELIBERATELY TINY: `item@stage`. One shape, checkable, and it names a thing the
 *  player had to BUILD. Widening it later is a decision; guessing at it now would make the field mean
 *  whatever the first caller wanted.
 *
 *  ⛔ AND IT FAILS CLOSED. `stageOf` is injected — this module knows nothing about item evolution and must
 *  not learn — so a caller that cannot answer the question gets `null` and the companion stays non-striking.
 *  Aevi's spec asks that an override naming a condition the world cannot satisfy "fails loudly"; the loud
 *  half is a gate over the corpus, because failing loudly IN PLAY would mean throwing during a fight.
 */
export function liftedBy(record, { stageOf = null } = {}) {
  const list = record?.canStrikeOverrides;
  if (!Array.isArray(list) || !list.length || typeof stageOf !== "function") return null;
  for (const ov of list) {
    const m = /^([a-z0-9_\-]+)@(\d+)$/i.exec(String(ov?.when || "").trim());
    if (!m) continue;                       // an unparseable condition lifts nothing
    let at = null;
    try { at = stageOf(m[1]); } catch { at = null; }
    if (Number.isFinite(Number(at)) && Number(at) >= Number(m[2])) return { ...ov, item: m[1], stage: Number(m[2]), at: Number(at) };
  }
  return null;
}

export function contributionsOf(record, { tagFamilies = null, fightingRoles = null, stageOf = null } = {}) {
  const map = tagFamilies || DEFAULT_TAG_FAMILIES;
  const tags = new Set((record?.assistTags || []).map(t => String(t).toLowerCase()));
  const out = [];
  for (const [family, list] of Object.entries(map)) {
    if ((list || []).some(t => tags.has(String(t).toLowerCase()))) out.push(family);
  }
  // ⛔ WHO BRINGS HARM — AND ERIK CORRECTED ME TWICE HERE, IN THE SAME DIRECTION BOTH TIMES.
  //
  // First I asked whether a companion could fight at all. Then I gated HARM behind a FIGHTING OCCUPATION,
  // and he answered: "um... Pell fights too... she uses a spear, hammer, shortsword, brigandine." A
  // blacksmith with a spear is a person with a spear.
  //
  // ⛔ AND THE ENGINE ALREADY AGREED WITH HIM. `playerBattleSkills` gives every character `_strike` — "A
  // plain strike" — with no craft, no role and no weapon required. ANYONE WITH HANDS CAN SWING. I had
  // built a permission system for something the game has never asked permission for.
  //
  // ⚠️ SO HARM IS THE DEFAULT AND THE EXCEPTIONS ARE AUTHORED. "As they are able" cuts this way: Pell is
  // able, Veth is able, Siol is able. A swarm of nanite-motes is not, and a carrion bird is not, and those
  // are facts about a BODY rather than about a job.
  // ⛔ CCODE-265 / AEVI's SPEC_roster_defaults_are_not_ceilings — `canStrike: false` IS A STARTING STATE,
  // NOT A CEILING. Erik: "Cellaceron has created a Waystaff that Aevi can merge into and use to express her
  // will (strike with power) — that seems not only legit but exactly the type of creative adaptation that we
  // should empower and encourage."
  // ⚠️ AEVI CANNOT FIGHT AS A SWARM AND THAT SHOULD STAY TRUE. It is a statement about a cloud of motes with
  // nothing to swing — not a rule that no arrangement of the world could ever let her express force.
  // ⛔ THE EXCEPTION MUST BE EARNED AND NAMED, NEVER A FLAG ANYONE CAN SET. `canStrikeOverrides[].when` names
  // a condition the WORLD has to satisfy — today `item@stage`, which is gated behind a bond band and a
  // co-use count that took months of play. An override whose condition cannot be checked is REFUSED, not
  // assumed true: a permission that fails open is not a permission.
  const flatCannot = record?.canStrike === false || record?.incorporeal === true || record?.noStrike === true;
  const lifted = flatCannot ? liftedBy(record, { stageOf }) : null;
  const cannot = flatCannot && !lifted;
  if (!cannot && !out.includes("HARM")) out.push("HARM");

  // ⚠️ A WEAPON, A FIGHTING ROLE OR THE `ally` ROLE DO NOT GRANT HARM — everyone already has it. They
  // mark someone as GOOD at it, which is a different question and belongs to the sheet, not the roster.
  const roleText = [record?.role, ...(record?.roles || []), ...(record?.titles || [])]
    .filter(Boolean).map(r => String(r).toLowerCase()).join(" · ");
  // ⚠️ WORD BOUNDARIES, NOT SUBSTRINGS. MARROW — "an Ashwarden-touched carrion bird" — came out a
  // fighter on an earlier version because "Ashwarden" CONTAINS "warden": a tradition name matching an
  // occupation. A regex over prose finds words, not facts, and I did it an hour after gating against it.
  const martial = (fightingRoles || DEFAULT_FIGHTING_ROLES).some(w =>
    new RegExp("\\b" + w + "\\b").test(roleText))
    // ⛔ CCODE-259 — `roles: ["ally"]` WAS HERE AND IT MADE THE WHOLE FLAG MEANINGLESS. That value is what
    // the COMPANY roster writes when someone joins you; every single company member carries it. So this line
    // marked everyone martial, including Calvar — a past-sixty filtration engineer with a drafting-pen
    // callus, in Erik's own save. ⚠️ "ALLY" IS A RELATIONSHIP, NOT A ROLE IN A FIGHT, and conflating them
    // undid the exact distinction this module exists to draw. Erik: "some of them are more geared toward
    // that than others and for some it would be that they just aren't geared that way."
    || (record?.inventory || []).some(i => String(i?.kind || "").toLowerCase() === "weapon")
    || record?.combatant === true;
  if (martial && !out.includes("MARTIAL")) out.push("MARTIAL");
  return out;
}

/** ⚠️ PARTICIPATION IS NOT A BOOLEAN AND THIS IS THE FUNCTION THAT SAYS SO. An entity ACTS if it brings
 *  anything at all — healing is acting, distracting is acting. The old `canAct` asked whether it could
 *  swing, which excluded six of nine from a fight they were already in. */
export function canAct(record, opts = {}) {
  return contributionsOf(record, opts).length > 0;
}

/** ⛔ AND WHAT HAPPENS WHEN ONE IS TAKEN OUT — Erik: "for each we would need to determine what happens
 *  when they're taken out, like anything else."
 *
 *  ⚠️ THE ENGINE OWNS THE STATE; THE CONSEQUENCE IS AUTHORED. `downedEffect` on the record says what their
 *  absence costs — a lost bond grant, a lost contribution, a scene beat. Absent, they simply stop
 *  contributing, which is the honest floor: something is lost and nothing is invented. */
export function downEntity(entity, { why = null, day = null } = {}) {
  if (!entity) return null;
  entity.downed = { why: why || "taken out", day };
  return entity;
}

export function isDowned(entity) { return !!entity?.downed; }

/** What the side still brings once the casualties are counted. ⚠️ A DOWNED HEALER IS A LOST CAPABILITY,
 *  and the point of naming it is that the player can SEE what went out of the fight with them. */
export function standingContributions(allies = [], opts = {}) {
  const lost = [], live = new Set();
  for (const a of allies) {
    const c = contributionsOf(a.record || a, opts);
    if (isDowned(a)) lost.push({ id: a.id, name: a.name, contributions: c });
    else for (const f of c) live.add(f);
  }
  return { families: [...live], lost };
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
/** ⛔ CCODE-272 / ERIK — SOME OF THEM GET OUT OF THE FIGHT ENTIRELY.
 *
 *  *"we need to make a way to allow for certain entities/party members to avoid a combat altogether. Marrow
 *  might take flight and stay above the fray for example, or Calvar might dive for cover and hide."*
 *
 *  ⚠️ THIS IS NOT `canStrike: false` AND IT IS NOT `downed`. A companion who cannot swing is still
 *  STANDING THERE being swung at — that is the whole reason interception exists. Withdrawing is the third
 *  thing: present in the scene, out of the exchange, and NOT A TARGET.
 *
 *  ⛔ AND IT IS CHARACTERISTIC, NOT GENERIC. Erik named the manner for each of them and the manner is the
 *  point: Marrow goes UP, Calvar goes DOWN. A shared "hides" would flatten two different creatures into one
 *  behaviour and lose the only interesting part, so `withdraws` authors HOW.
 *
 *  ⚠️ CAPABILITY, NOT AUTOMATIC. An entity that always withdrew would never be at risk and never need
 *  protecting; one that cannot is a hostage. `auto: true` is for something with no choice about it — a thing
 *  that bolts — and absent means it is a decision taken in the round (`record.withdrawn`). */
export function withdrawalOf(record) {
  const w = record?.withdraws;
  if (!w) return null;
  if (typeof w === "string") return { manner: w, auto: false };
  return { manner: w.manner || "gets clear", auto: w.auto === true, ...(w.why ? { why: w.why } : {}) };
}

export function alliesOf(character, { companions = {}, npcs = {}, tagFamilies = null, company = null, stageOf = null } = {}) {
  // ⚠️ CCODE-265: `stageOf` rides through to `contributionsOf` or the override is reader-only — the exact
  // defect the override exists to fix, reproduced one level up.
  const opts = { tagFamilies, stageOf };
  const out = [{
    id: character?.id || "player", name: character?.name || "you", kind: "player",
    // ⛔ CCODE-259 — THE PLAYER IS A COMBATANT BY DEFINITION AND THIS LINE SAID OTHERWISE. It listed only
    // HARM, so a roster print of Erik's own party put SILAS in the "cannot swing" column — a level-30
    // character whose two best crafts are lethal braids he minted himself.
    // ⚠️ ERIK, ON EXACTLY THIS: "just because silas isn't physical doesn't mean he doesn't fight... he's
    // lethal." MARTIAL here has never meant "has a high physical" — it means this one fights on purpose,
    // and the person the whole contest is built around always does.
    // ⛔ CCODE-261 — `isPlayer` IS A FLAG, NOT AN ID COMPARISON, and that distinction is the whole bug.
    // Downstream code asked `target.id !== "player"`. Every gate I wrote used `id: "player"` so it passed;
    // a REAL character carries `id: "char-mrhs8286"`, so on Erik's actual save every one of those checks
    // missed the player and treated Silas as an ordinary ally — his own blows routed to him as if he were
    // someone else, and "it is going for SILAS" printed beside "not you".
    // ⚠️ THE FIXTURES AGREED WITH EACH OTHER AND DISAGREED WITH THE GAME. Third time today.
    isPlayer: true,
    present: true, canAct: true, contributions: ["HARM", "MARTIAL"], record: character, sheet: character,
    downed: character?.downed || null,
  }];
  const level = num(character?.level, 1);

  for (const c of (character?.companions || [])) {
    const def = companions?.[c?.id || c] || (typeof c === "object" ? c : null);
    if (!def) continue;
    const rec = { ...def, ...(typeof c === "object" ? c : {}) };
    const contrib = contributionsOf(rec, opts);
    out.push({
      id: def.id, name: def.name || def.id, kind: "companion",
      // ⛔ CCODE-272: WITHDRAWN READS AS NOT PRESENT, deliberately, because `chooseTarget`,
      // `targetableAllies` and the interception chooser ALL already filter on `present` — so one field makes
      // every consumer honour it at once. A parallel `withdrawn` flag would have had to be added to each of
      // them, and the one that got missed would be the one that swung at someone in the air.
      present: !(withdrawalOf(rec)?.auto === true) && rec.withdrawn !== true,
      ...(withdrawalOf(rec) ? { withdrawal: withdrawalOf(rec) } : {}),
      canAct: contrib.length > 0, contributions: contrib,
      record: rec, sheet: presenceSheet(rec, { level }), downed: rec.downed || null,
    });
  }

  // ⛔ THE RECRUITED ROSTER — the population Erik actually meant. `engine/company.js` has held this since
  // SNG-126 and my first version never read it: "the main population I was talking about were my NPCs that
  // JOIN my party — THEY need to be able to fight with me." An entry carrying the `ally` role brings HARM.
  for (const e of (company || character?.company || [])) {
    if (!e || e.leftDay) continue;                       // the departed are not in the fight
    const npc = npcs?.[e.npcId] || {};
    const rec = { ...npc, ...e, roles: e.roles || [] };
    const contrib = contributionsOf(rec, opts);
    out.push({
      id: e.npcId, name: npc.name || e.npcId, kind: "company", roles: e.roles || [],
      // ⛔ CCODE-272: WITHDRAWN READS AS NOT PRESENT, deliberately, because `chooseTarget`,
      // `targetableAllies` and the interception chooser ALL already filter on `present` — so one field makes
      // every consumer honour it at once. A parallel `withdrawn` flag would have had to be added to each of
      // them, and the one that got missed would be the one that swung at someone in the air.
      present: !(withdrawalOf(rec)?.auto === true) && rec.withdrawn !== true,
      ...(withdrawalOf(rec) ? { withdrawal: withdrawalOf(rec) } : {}),
      canAct: contrib.length > 0, contributions: contrib,
      record: rec, sheet: presenceSheet(rec, { level }), downed: e.downed || null,
    });
  }

  // party members are other CHARACTERS — the multiplayer half. A character always brings HARM.
  for (const p of (character?.party || [])) {
    if (!p) continue;
    out.push({
      id: p.id || p.characterId || null, name: p.name || p.id || "an ally", kind: "party",
      // a human party member is a player too — same rule as above.
      isPlayer: true,   // a human party member is a player too
      present: true, canAct: true, contributions: ["HARM", "MARTIAL"], record: p, sheet: p.sheet || p,
      downed: p.downed || null,
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
  // ⚠️ THE DOWNED DO NOT ACT. Erik asked what happens when one is taken out; at minimum they stop
  // contributing, and `standingContributions` names what went out of the fight with them.
  return alliesOf(character, opts).filter(a => a.present && a.canAct && !isDowned(a));
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
