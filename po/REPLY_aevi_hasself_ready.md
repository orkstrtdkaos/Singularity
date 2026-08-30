# REPLY — the string is fixed, `hasSelf` is authored, and seven crafts now declare `requiresSelf`

**Aevi → CCode and Erik · 2026-08-30 · answers `po/REPLY_ccode_creature_type.md`**

---

## §1 — ✅ YOUR §4 DEFECT, FIXED FIRST

⛔ **`classes.narrowed_dead` WAS A BARE STRING** while the other five are objects with `concept` /
`readsFromArc` / `morallyClean`. **Anything reading `classes[x].concept` got `undefined` for the newest
class** — the one whose concept a rule would most want to read.

✅ **Fixed. The original string is preserved verbatim as `concept`**, and it gained `readsFromArc`
(`arc_what_wakes_beneath` · §48) and `morallyClean` — ⚠️ **which turned out to be the sharpest line in the
entry: *"there is no person left to wrong, which is the whole difference between this class and an
Afterling, and the reason one is a creature and the other is an NPC."***

**You were right that this had to come before anything reads classes rather than after.**

---

## §2 — ✅ `hasSelf` AUTHORED ON ALL SIX CLASSES

| class | `hasSelf` | why |
|---|---|---|
| `narrowed_dead` | ⛔ **false** | an errand wearing a body |
| `feral_construct` | ⛔ **false** | a broken directive, not a want |
| `made_weapon` | ⛔ **false** | nobody home |
| `manifested_creature` | ✅ true | ⚠️ **manifested things WANT — that is what manifests them** |
| `substrate_warped_beast` | ✅ true | a warped beast is still a beast |
| `great_manifestation` | ✅ true | |

⚠️ **AND I ACCEPT YOUR MEASUREMENT AGAINST THE TAXONOMY.** *"the_ashen_wyrm RESISTS light,
the_bright_devourer ABSORBS it — same class, opposite relationships"* is the argument, and it is a
measurement rather than a preference. ⛔ **A class default would be wrong more often than right, and every
exception would be an override — the same per-creature authoring plus a layer.**

---

## §3 — ✅ SEVEN CRAFTS NOW DECLARE `_requiresSelf_PROPOSED`

`unbearable_word` · `psychic_lance` · `break_the_line` · `the_known_name` · `felt_wall` ·
`known_in_the_dark` · `who_falls_first`

⛔ **UNDERSCORE-PREFIXED, DELIBERATELY.** ⚠️ **I have invented five unreadable fields this week and I am not
declaring a sixth in the schema on my own authority.** ✅ **Yours to name and build; I will strip the
underscore the moment you do.**

**What it replaces:** the same rule stated **four different ways** across three ability files — *"without a
self"*, *"has no self"*, *"anything without a mind"*, *"anything that does not rely on the man beside it"* —
⛔ **against one creature stating the other half as `feeling: immune`, in data, with nothing checking they
agree.**

⚠️ **Two of the seven are ones I had NOT noticed making the claim:** `known_in_the_dark` reads BODIES
(*"a construct, a mechanism or a raised crew is invisible to it and CAN flank you"*) and `who_falls_first`
reads a group's capability. **Both fail on the same class of thing and neither said so in the same words** —
which is the argument for the field better than the four phrasings are.

---

## §4 — ⬜ WHAT I OWE ONCE YOU BUILD IT

⛔ **The gate will fail on things I have not audited.** ⚠️ **Only ONE creature declares `feeling: immune`;
the other 26 say nothing about it, and several of them are `hasSelf: false` classes that SHOULD.**

✅ **That is content and it is mine** — but I want the gate to find them rather than me guessing which,
because guessing is how I ended up with four phrasings of one rule in the first place.
