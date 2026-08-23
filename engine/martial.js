/** SNG-345 — BASELINE DEFENSE, FORM KITS, AND THE MARTIAL FLOOR.
 *
 *  Erik (2026-07-07, via martial_paths.json): "every character can defend itself, no build required."
 *  Aevi's principle line: "No character is helpless… not a class, a FLOOR: the universal animal competence
 *  of protecting yourself. Small numbers, always available, never gated."
 *
 *  ⛔ THIS FILE EXISTS BECAUSE THE CONTENT DID AND THE CODE DIDN'T. martial_paths.json has been registered,
 *  authored, and complete since 2026-07-07, carrying an `engineNote` that spells out the implementation —
 *  "4 free zero-cost abilities at creation, powerSystem 'baseline', excluded from skill-point costs and
 *  caps" — and nothing read it. It surfaced in the SNG-342 sweep as one of two files that were REAL GAPS
 *  rather than reference docs. A field that describes behaviour is not evidence the behaviour exists.
 *
 *  ⚠️ THE RECORDS ARE DERIVED FROM THE RULES FILE, NOT COPIED INTO AN ABILITIES PACK. Two hand-synced
 *  copies of the same kit is the SNG-344 crosswalk failure before it happens — the braid tables drifted
 *  within ten minutes of being written. martial_paths is the single source; these are its projection.
 */

export const BASELINE_POWER_SYSTEM = "baseline";

/** The kit entries carry `functions` (strike/shield/move/reveal/bind) — the vocabulary skill_functions
 *  already uses. Map them to the action TAGS the resolver reads, so a baseline ability is a real option
 *  in the same way an authored one is, not a label on a button. */
const FUNCTION_TAGS = {
  shield: ["defend", "guard", "block", "brace"],
  strike: ["attack", "strike"],
  move:   ["flee", "disengage", "move"],
  reveal: ["alert", "call", "reveal"],
  bind:   ["rally", "bind"],
};

const tagsFor = (functions = []) => [...new Set(functions.flatMap(f => FUNCTION_TAGS[f] || [f]))];

/** One kit entry → a whole ability record. SNG-250 §3: born whole or not born — a record missing
 *  `description`/`notFor` renders blank in the very panels the player uses to choose it. */
function toAbility(entry, { origin, form, aestheticKey = null }) {
  return {
    // ⛔ SNG-531 / CCODE-218 — THE KIT'S LOOK RIDES ONTO EVERY GRANT IT MAKES. Aevi authored
    // `aestheticKey: "form_ent"` on the KIT, which is the right place - a whole body shares one look - and
    // this builder produced a fixed record that never copied it, so five crafts stayed unpainted while the
    // palette for them existed. ⚠️ Same shape as `deniesPhase` (CCODE-41): a flag left on the definition
    // reads `undefined` on the record and is inert while still advertised in content.
    ...(aestheticKey ? { aestheticKey } : {}),
    id: entry.id,
    name: entry.name,
    levelReq: 1,
    energyCost: 0,                       // "free at creation… never gated" — a floor you cannot be too tired to have
    powerSystem: BASELINE_POWER_SYSTEM,
    attribute: "physical",
    axes: {},
    effectTags: entry.functions || [],
    actionTags: tagsFor(entry.functions),
    description: entry.grants || entry.desc || "",
    notFor: entry.cannot || "",
    narrationHints: entry.desc || entry.grants || "",
    baseline: true,
    formKit: form || null,
    _origin: origin,                     // "baselineDefense" | "formKit:<form>" — provenance, per SNG-250
    tree: [{ rank: 1, name: entry.name, grants: entry.grants || entry.desc || "" }],
  };
}

/** Every ability record martial_paths implies: the universal kit plus every form kit. */
export function martialAbilityRecords(martial) {
  const out = {};
  for (const e of martial?.baselineDefense?.kit || []) out[e.id] = toAbility(e, { origin: "baselineDefense" });
  for (const k of martial?.formKits?.kits || []) {
    for (const g of k.grants || []) out[g.id] = toAbility(g, { origin: `formKit:${k.form}`, form: k.form, aestheticKey: k.aestheticKey || null });
  }
  return out;
}

/** The universal four — everyone, always. No form, no origin, no level, no points. */
export function baselineAbilityIds(martial) {
  return (martial?.baselineDefense?.kit || []).map(e => e.id);
}

/** ⚠️ `character.form` IS FREE PROSE — "a towering treefolk of bark and heartwood" — not an enum. Nothing
 *  in the game writes a machine-readable form, so a form kit cannot simply be looked up.
 *
 *  ⛔ AND THE ENGINE MUST NOT GUESS AT CANON. Resolving player prose to a mechanical grant is the coerced-
 *  name hazard (SNG-228: travelTo must be a PLACE, never a PERSON) pointed at the character sheet. So:
 *  an EXPLICIT `character.formKit` wins outright; failing that, an UNAMBIGUOUS match against authored
 *  aliases is accepted and RECORDED with its reason; two matches REFUSE rather than pick.
 *
 *  This is `rulePath`'s lesson (SNG-331/342) applied to content: one match is a convention, two is a bug,
 *  and guessing between them is how `ties` resolved to `location_affinities`.
 */
export function formKitFor(character, martial) {
  const kits = martial?.formKits?.kits || [];
  if (character?.formKit) {
    const k = kits.find(k => k.form === character.formKit);
    return k ? { kit: k, why: "explicit character.formKit" } : { kit: null, why: `unknown formKit "${character.formKit}"` };
  }
  const prose = String(character?.form || "").toLowerCase();
  if (!prose) return { kit: null, why: "no form recorded" };
  // ⛔ WORD BOUNDARIES, NOT `includes`. I wrote `prose.includes(alias)` first and the alias "ent" then
  // matched "gentle", "present", "different", "patient" — every one of which grants a bark-and-timber
  // combat kit to a human. That is EXACTLY the SNG-331 bug (`ties` matching `location_affinities`) that I
  // fixed one file over, reintroduced by me within the hour. A substring is not a word.
  const wordHit = (a) => new RegExp(`\\b${String(a).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(prose);
  const hits = kits.filter(k => (k.aliases || []).some(wordHit));
  if (hits.length === 1) return { kit: hits[0], why: `form prose matched "${hits[0].form}" unambiguously` };
  if (hits.length > 1) {
    console.warn(`[martial] form "${prose}" matches ${hits.length} kits ambiguously — refusing to guess:`, hits.map(k => k.form).join(", "));
    return { kit: null, why: `ambiguous: ${hits.map(k => k.form).join(", ")}` };
  }
  return { kit: null, why: "no kit matches this form" };
}

/** Grant the floor. Idempotent: returns only what was actually ADDED, so a caller can toast it once and a
 *  reconcile pass can run on every login without re-granting. */
export function grantMartialKit(character, martial) {
  if (!character || !martial) return { granted: [], kit: null, why: "no rules" };
  character.abilities = character.abilities || [];
  const has = new Set(character.abilities.map(a => a.abilityId));
  const granted = [];
  const give = (id) => { if (!has.has(id)) { character.abilities.push({ abilityId: id, level: 1, baseline: true }); has.add(id); granted.push(id); } };

  for (const id of baselineAbilityIds(martial)) give(id);
  const { kit, why } = formKitFor(character, martial);
  if (kit) for (const g of kit.grants || []) give(g.id);
  return { granted, kit: kit?.form || null, why };
}

/** ⛔ A BASELINE ABILITY IS NOT A PURCHASE. The engineNote is explicit that these sit outside skill-point
 *  costs and caps — otherwise the floor would eat the build it was meant to underwrite, and a character
 *  would be charged for the ability to raise its arms. */
export function isBaselineAbility(abilityId, martial) {
  if (!martial) return false;
  if (baselineAbilityIds(martial).includes(abilityId)) return true;
  return (martial.formKits?.kits || []).some(k => (k.grants || []).some(g => g.id === abilityId));
}

/** Owned abilities that COUNT against caps — everything the character actually chose. */
export function chosenAbilities(character, martial) {
  return (character?.abilities || []).filter(a => !a.baseline && !isBaselineAbility(a.abilityId, martial));
}
