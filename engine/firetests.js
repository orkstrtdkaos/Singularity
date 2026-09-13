// firetests.js — ⛔ THE PARTS THAT HAVE NEVER BEEN USED, GIVEN AN OCCASION.
//
// ⛑ ERIK: "Something I can play in to actually test drive any part of the game I want and it will actually produce usage
// data for you. Fire testing every part of the game. There are still parts that have never been used." Then: "go after
// the 15 never-emitted ops."
//
// ⚑ MEASURED ON HIS SAVE (369 counted turns, level 33), and the fifteen split in two — which is the whole point of
// measuring before building:
//
//   ⬜ UNTRIED (11) — the op never fired AND the state it writes is EMPTY. No occasion has arisen in the story.
//      debtOps · projectOps · deathOps · markTeacher · deriveItem · unlockSubstrate · unlockPrecursor · arcOps ·
//      offerPromotion · offerAcquisition · offerIntent
//      ⛑ THESE ARE WHAT A FIRE TEST IS FOR. A zero here is unambiguous: no state, no emission, nothing to misread.
//
//   ⚠️ UNKNOWN (4) — the op never fired but the state EXISTS: holdingOps (5 holdings), bandOps (1), adoptSchool (3),
//      newAbility (39). ⛔ I READ THESE AS "BYPASSED" AND THAT WAS UNSAFE: `_opEmitted` began on 2026-07-19 and Silas
//      has been played since 12 July, so the state may simply predate the counter. The epoch is stamped now
//      (`_opCountingSince`); until a save's counting covers its whole life, a zero beside existing state proves nothing.
//
// ⛔ EVERY TEST DRIVES THE PRODUCTION APPLIER. It builds a real turn and hands it to the same `applyTurn` a beat uses —
// no stub, no second implementation, no seam. Erik's own rule (2026-09-05): harnesses simulate the real game. A harness
// with its own copy of the logic certifies the copy.

/** One representative, MINIMAL op per never-fired class. ⚠️ `need` names what the op requires from the character to be
 *  applicable at all — a test that fires against a character with no holding is testing the refusal, not the op, and
 *  the harness must say which it did. `build(c)` returns the turn fragment, or null when the character cannot host it. */
export const FIRE_TESTS = [
  { op: "debtOps", what: "owe someone something, in the fiction's own terms",
    need: "nothing — a debt can be incurred anywhere",
    build: () => ({ debtOps: [{ op: "incur", to: "the wayhouse", what: "a night's lodging and a meal", worth: 12, why: "fire test" }] }) },

  { op: "projectOps", what: "begin a piece of work that continues while you are elsewhere",
    need: "nothing",
    build: () => ({ projectOps: [{ op: "start", name: "A fire-test bench", what: "squaring a length of lath", days: 2, why: "fire test" }] }) },

  { op: "deathOps", what: "a person in the registry dies or is incapacitated",
    need: "one known person who is currently active",
    build: (c) => { const who = Object.values(c.npcRegistry || {}).find(n => n?.status === "active");
      return who ? { deathOps: [{ op: "incapacitate", npcId: who.id, why: "fire test — a fall on the stair" }] } : null; } },

  { op: "markTeacher", what: "name someone as your teacher in a tradition",
    need: "one known person",
    build: (c) => { const who = Object.values(c.npcRegistry || {})[0];
      return who ? { markTeacher: { npcId: who.id, tradition: c.nativeTradition || null, why: "fire test" } } : null; } },

  { op: "deriveItem", what: "the fiction hands you a thing made from something you already had",
    need: "one item in inventory",
    build: (c) => { const it = (c.inventory || [])[0];
      return it ? { deriveItem: [{ fromName: it.customName || it.name, name: "A fire-test offcut", description: "trimmed from it, and kept", why: "fire test" }] } : null; } },

  { op: "unlockSubstrate", what: "the ground opens a source to you that was closed",
    need: "nothing",
    build: () => ({ unlockSubstrate: [{ source: "nanite", why: "fire test" }] }) },

  { op: "unlockPrecursor", what: "a precursor working answers you for the first time",
    need: "nothing",
    build: () => ({ unlockPrecursor: [{ what: "a lattice reading", why: "fire test" }] }) },

  { op: "arcOps", what: "a latent arc in the world turns toward an ending",
    need: "at least one latent arc on the world state",
    build: (c) => { const arc = (c.worldState?.latentArcs || [])[0];
      return arc ? { arcOps: [{ arcId: arc.id, fate: "quickened", why: "fire test" }] } : null; } },

  { op: "offerPromotion", what: "someone is offered a step up in a body they belong to",
    need: "one known person",
    build: (c) => { const who = Object.values(c.npcRegistry || {})[0];
      return who ? { offerPromotion: { npcId: who.id, to: "senior hand", why: "fire test" } } : null; } },

  { op: "offerAcquisition", what: "something is offered for you to take on",
    need: "nothing",
    build: () => ({ offerAcquisition: { thing: "a half-share in a lath bench", from: "the fire test", why: "fire test" } }) },

  { op: "offerIntent", what: "someone states what they mean to do next",
    need: "one known person",
    build: (c) => { const who = Object.values(c.npcRegistry || {})[0];
      return who ? { offerIntent: { npcId: who.id, intent: "to walk the east rim before dark", why: "fire test" } } : null; } },

  // ⚠️ THE FOUR WHOSE ZERO IS NOT YET SAFE TO READ — fired anyway, because whether the op WORKS is a separate question
  // from whether it has ever been used, and this harness answers the first one directly.
  { op: "holdingOps", what: "claim a post or an enterprise the fiction gave you",
    need: "nothing",
    build: () => ({ holdingOps: [{ op: "claim", kind: "post", name: "A fire-test post", locationId: null, why: "fire test" }] }) },

  { op: "bandOps", what: "raise or name a band under your command",
    need: "nothing",
    build: () => ({ bandOps: [{ op: "form", name: "The Fire-Test Hand", why: "fire test" }] }) },

  { op: "adoptSchool", what: "take on a school's way of working",
    need: "nothing",
    build: () => ({ adoptSchool: { schoolId: "fire-test-school", why: "fire test" } }) },

  { op: "newAbility", what: "the story confers a craft you did not buy",
    need: "nothing",
    build: () => ({ newAbility: [{ abilityId: "fire_test_craft", name: "A fire-test craft", why: "fire test" }] }) },
];

/** ⛔ WHAT CHANGED, AND NOTHING ELSE. A fire test's whole value is the diff, so this compares the two records at the
 *  TOP LEVEL and names the keys that moved — enough to answer "did the op write anything at all", which is the question,
 *  without printing a megabyte. ⚠️ `_` keys are excluded: bookkeeping always moves and would drown the signal. */
export function diffKeys(before, after) {
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  const moved = [];
  for (const k of keys) {
    if (k.startsWith("_")) continue;
    const a = JSON.stringify(before?.[k] ?? null), b = JSON.stringify(after?.[k] ?? null);
    if (a !== b) moved.push(k);
  }
  return moved.sort();
}
