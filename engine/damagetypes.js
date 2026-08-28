// engine/damagetypes.js — CCODE-281. FAMILIES, COMPOSITE DAMAGE, AND WHAT A WARD ANSWERS.
//
// ⛔ ERIK: "once we get the basic damage types down, we can start showing COMBINATIONS — that makes WARDING
// ABLE TO BE PARTIAL, and makes attacks more viable because they can BRING CERTAIN DAMAGE TYPES THROUGH."
// And: "wards can start with just one type, like Cold... but some higher level wards will protect against
// multiple types - elemental ward for example. also, initial ranks will add resist then soak then immunity."
//
// ⚠️ THREE FAMILIES, FROM AEVI'S CORRECTION OF HER OWN AXIS TABLE. My objection was that cold and fire are
// both TAKINGS rather than two ends of one thing; her answer is that this is exactly why neither is polar —
// they are SIBLINGS in the elemental family. A ward against fire is not a ward against ice, and under a
// family model it never can be.
//
// ⛔ AND THIS IS WHERE `wardTypes` FINALLY GETS A READER. It is documented to the GM at length, authored on
// 48 crafts, and read by NOTHING in the resolution path — the largest authored-and-unread field left.

const num = (v, d = 0) => (v == null || v === "" || !Number.isFinite(Number(v)) ? d : Number(v));

/** ⛔ WHAT A CRAFT ACTUALLY DEALS, AS A MIX. Erik's composite damage: a psionic blast is `physical` +
 *  `psychic`, and a ward that stops one lets the other through.
 *
 *  ⚠️ A SINGLE `damageType` READS AS A MIX OF ONE, so every craft authored before this behaves identically
 *  and nothing has to be re-authored to keep working. That is the whole reason the shape is a list of
 *  {type, share} rather than a new field beside the old one.
 *
 *  ⛔ SHARES ARE NORMALISED, NEVER TRUSTED. Authored shares that sum to 3 would otherwise triple a blow. */
export function damageMixOf(decl, fallbackType = null) {
  const authored = decl?.damageMix || decl?.mechanic?.damageMix;
  let parts;
  if (Array.isArray(authored) && authored.length) {
    parts = authored.map(p => ({ type: String(p?.type || p), share: Math.max(0, num(p?.share, 1)) }))
      .filter(p => p.type && p.share > 0);
  } else {
    const one = decl?.damageType || decl?.mechanic?.damageType || fallbackType;
    parts = one ? [{ type: String(one), share: 1 }] : [];
  }
  if (!parts.length) return [];
  const total = parts.reduce((a, p) => a + p.share, 0) || 1;
  return parts.map(p => ({ type: p.type, share: p.share / total }));
}

/** Which family a type belongs to. ⚠️ UNKNOWN TYPES ANSWER `null` RATHER THAN A GUESS — a type nobody has
 *  classified must not silently join a family and become warded by accident. */
export function familyOf(type, families = null) {
  const F = families || {};
  const t = String(type || "");
  if ((F.physical?.types || []).includes(t)) return "physical";
  if ((F.elemental?.types || []).includes(t)) return "elemental";
  const polar = F.polar || {};
  if ((polar.unpaired || []).includes(t)) return "polar";
  if ((polar.pairs || []).some(p => p.minus === t || p.plus === t)) return "polar";
  return null;
}

/** ⛔ THE OPPOSITE END OF AN AXIS, WHERE THERE IS ONE. Only polar PAIRS have one — a sibling is not an
 *  opposite, which is the distinction that keeps a fire ward from answering ice. */
export function oppositeOf(type, families = null) {
  for (const p of ((families || {}).polar?.pairs || [])) {
    if (p.minus === type) return p.plus;
    if (p.plus === type) return p.minus;
  }
  return null;
}

/** ⛔ WHAT A WARD ANSWERS, AND HOW WELL. Erik's two rulings meet here.
 *
 *  BREADTH (`wardTypes`): one type at low rank; a whole FAMILY at high rank — "elemental ward for example".
 *  ⚠️ A FAMILY IS THE WIDEST A WARD SHOULD EVER REACH. The which-check already ruled that a ward answering
 *  everything has no character, and a family is a real idea where "everything" is not.
 *
 *  DEPTH (`wardLadder`): resist → soak → immunity. ⛔ THREE DIFFERENT KINDS OF ANSWER, not three sizes of
 *  one — resist moves the ROLL, soak moves the DAMAGE, immunity means that type does not touch you. */
export function wardAnswer(ward, rank = 1, { families = null, ladder = null, breadth = null } = {}) {
  if (!ward) return null;
  const L = ladder || { r1: "resist", r2: "soak", r3: "immunity" };
  const B = breadth || { oneTypeAtRank: 1, familyAtRank: 3 };
  const r = Math.max(1, num(rank, 1));
  const depth = L["r" + Math.min(3, r)] || "resist";

  const listed = (ward.wardTypes || []).map(String);
  // ⚠️ A WARD MAY NAME A FAMILY DIRECTLY — "elemental" — but only once it is ranked to hold one. Naming a
  // family at r1 does not widen it; it narrows to the family's first type, because breadth is EARNED.
  const named = listed.filter(t => ["physical", "elemental", "polar"].includes(t));
  const canHoldFamily = r >= num(B.familyAtRank, 3);
  const answers = new Set();
  for (const t of listed) {
    if (named.includes(t)) {
      const fam = (families || {})[t];
      const types = fam?.types || (t === "polar"
        ? [...((families || {}).polar?.unpaired || []),
           ...(((families || {}).polar?.pairs || []).flatMap(p => [p.minus, p.plus]))]
        : []);
      if (canHoldFamily) for (const x of types) answers.add(x);
      else if (types.length) answers.add(types[0]);
    } else answers.add(t);
  }
  return { depth, answers: [...answers], breadthEarned: canHoldFamily,
    why: `${depth} against ${[...answers].join(", ") || "nothing named"}` };
}

/** ⛔ RESOLVE A COMPOSITE BLOW AGAINST A WARD — the payoff Erik named: "warding able to be PARTIAL… attacks
 *  more viable because they can BRING CERTAIN DAMAGE TYPES THROUGH."
 *
 *  ⚠️ THE WARD'S CHARACTER IS THE LIST OF WHAT IT DOES NOT STOP — Aevi's line, and it is why this returns
 *  the unanswered portion by name rather than a single number.
 *
 *  ⛔ AND NOTHING IS EVER FULLY BLOCKED. `minHit` already says no foe is immune; a blow whose every
 *  component is warded still lands its floor, because a zero reads as broken rather than as a wall. */
export function resolveComposite(hit, mix, ward, { minHit = 1, cfg = {}, families = null } = {}) {
  const total = Math.max(0, num(hit, 0));
  if (!mix?.length) return { landed: total, blocked: 0, through: [], stopped: [] };
  const answered = new Set(ward?.answers || []);
  const depth = ward?.depth || null;
  const through = [], stopped = [];
  let landed = 0, blocked = 0;
  for (const p of mix) {
    const portion = total * p.share;
    // ⚠️ EACH COMPONENT CARRIES ITS FAMILY AND, IF POLAR, WHAT WOULD HAVE ANSWERED IT. A player meets this
    // system through receipts, and "decay came through — living is what answers it" TEACHES the map, where a
    // bare number teaches nothing. It is also the only honest use for `oppositeOf` today: naming the counter
    // is real work, and inventing a consumer for it would have been worse than deleting it.
    const note = families ? { family: familyOf(p.type, families),
      ...(oppositeOf(p.type, families) ? { answeredBy: oppositeOf(p.type, families) } : {}) } : {};
    if (!answered.has(p.type)) { landed += portion; through.push({ type: p.type, amount: Math.round(portion), ...note }); continue; }
    // ⚠️ THE DEPTH DECIDES WHAT ANSWERING MEANS. Immunity removes the portion; soak reduces it; resist does
    // NOT belong here at all — it moved the roll before the blow was ever sized, and applying it again here
    // would charge the attacker twice for the same ward.
    if (depth === "immunity") { blocked += portion; stopped.push({ type: p.type, amount: Math.round(portion), by: "immunity" }); }
    else if (depth === "soak") {
      const keep = Math.max(0, Math.min(1, num(cfg.soakKeeps, 0.4)));
      landed += portion * keep; blocked += portion * (1 - keep);
      stopped.push({ type: p.type, amount: Math.round(portion * (1 - keep)), by: "soak" });
      through.push({ type: p.type, amount: Math.round(portion * keep), soaked: true });
    } else { landed += portion; through.push({ type: p.type, amount: Math.round(portion), resisted: true }); }
  }
  const floored = Math.max(total > 0 ? num(minHit, 1) : 0, Math.round(landed));
  return { landed: floored, blocked: Math.round(blocked), through, stopped,
    flooredBy: floored > Math.round(landed) ? "minHit" : null,
    why: through.length
      ? `${through.map(t => t.type).join(" and ")} ${through.length > 1 ? "come" : "comes"} through`
      : `every part of it answered — only the floor lands` };
}
