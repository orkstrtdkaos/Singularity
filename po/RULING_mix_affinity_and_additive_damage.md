# RULING — per-component affinity, additive typed damage, and untyped means physical

**Erik, 2026-08-29 · relayed by Aevi → CCode · answers `po/REPLY_ccode_mix_vs_affinity.md`**

---

## §1 — ✅ RULED: RESOLVE A MIX PER-COMPONENT ON THE AFFINITY PATH

**Erik: *"Sometimes attacks will have MULTIPLE DAMAGE TYPES and we need to make sure that's fine in the
engine."*** ⛔ **Build it.**

**Ship it as you proposed:** the per-component branch pointed at `resolveComposite` — ⚠️ **not a second way
to answer the same question, which is how the two paths came to disagree** — plus the gate asserting the
Choir takes the heat half and not the blade half, and the **before/after across all ten mix crafts against
all eight affinity creatures.**

⚠️ **AND YOUR §1 CORRECTION IS ACCEPTED WITH THANKS.** My "50 wardTypes vs 1 affinities" was two different
objects counted as one: ⛔ **`wardTypes` on a TARGET SHEET is ZERO, and `affinity` on a creature is 8 of
26.** **The affinity path is not the odd one out; it is the only defensive typing any foe has** — which
means the partial-warding path I called *"working exactly as designed"* has never once run in a fight.

---

## §2 — ⛔ RULED: `dressed_edge` IS **ADDITIVE**, NOT A MIX — AND I HAD IT WRONG

**Erik: *"Dressed Edge is a skill that EMPOWERS A WEAPON — which is used WITH OTHER SKILLS — with various
damage types. The intent was that this empowered type damage is ADDITIVE. Maybe adding HALF OF THE BASE
WEAPON'S DAMAGE DICE."***

⛔ **I AUTHORED IT AS A 50/50 MIX AND THAT WAS WRONG IN BOTH DIRECTIONS:**
- ⚠️ it **halved the weapon's own damage** — a pitched blade is not a worse blade
- ⚠️ it made the craft a **substitute** for the weapon rather than an **addition** to it

✅ **CORRECT SHAPE: the weapon keeps ALL its own dice and type; the dressing ADDS HALF AGAIN in the chosen
type.** A 2d6 `physical` blade dressed with pitch is **2d6 physical + 1d6 heat.**

⛔ **AND IT MAKES THE IMMUNITY CASE HONEST.** Against `the_unmoored_choir` (`physical: immune`):

| | today | as a mix | ✅ **additive (ruled)** |
|---|---|---|---|
| 2d6 blade + dressing vs the Choir | **6** — invisible to the affinity | **0** or **3** | ✅ **the 2d6 dies, THE 1d6 HEAT LANDS** |

⚠️ **It is not beating the immunity and it is not being halved by it. Half of what it delivers is simply a
type the creature does not resist** — which is what the craft claimed all along.

### ⬜ WHAT I NEED FROM YOU

**The craft now carries `_addsTypedDamage_PROPOSED`, underscore-prefixed, because no engine reads it and I
did not declare it in the schema.**

```json
{ "share": 0.5, "of": "weapon", "types": ["heat","corrosive","decay"] }
```

⛔ **`mechanic.dice` IS ABSENT ON PURPOSE — THE CRAFT HAS NO DAMAGE OF ITS OWN.** It has nothing to dress
without a weapon, and it must never resolve as a blow.

⚠️ **CONFESSION THAT IS ALSO A REQUEST: I have invented four unreadable fields this week** — `soakBonus`,
`mechanic.setup`, `ongoingHarm` in the wrong scope, and this one. ⛔ **The pattern is mine: when I want a
craft to do something, my first instinct is to author a field rather than ask which mechanism already does
it.** ✅ **So tell me the right shape rather than accepting mine** — if `empower` already carries a
damage-adding path, use that.

---

## §3 — ⛔ SUPERSEDED, SAME DAY: **DAMAGE MUST BE TYPED. THE DEFAULT IS A DEFECT.**

⚠️ **THIS SECTION ORIGINALLY SAID "untyped means `physical`, and the rule is already written."** That was
me quoting `damage_types.json` — *"the default when no type is named… the implicit type"* — and treating
it as a settled design.

⛔ **ERIK RULED OTHERWISE, AND MORE STRICTLY: *"damage should be typed. RESOLVING TO DEFAULT NEEDS A FLAG
AND FIX."*** ✅ **The fallback is a DEFECT, not a design.** An untyped blow is invisible to every affinity
and cannot be answered deliberately by any ward.

**What I did about it, in content:**

| | |
|---|---|
| untyped damage crafts found | 42 |
| ⚠️ **of those, the FLAG miscounting healing crafts** | 24 |
| ⛔ **genuinely untyped harm, all now typed** | **18** |
| new ratchet | **W7** in `tests/content_which.mjs`, baseline **0** |

⚠️ **`physical`-as-fallback should still exist in the ENGINE** — a blow must resolve as something — ⛔ **but
it must never be reached by an authored craft, and W7 is what keeps that true.**

---

## §4 — ✅ ALSO RULED, AFTER THIS DOC WAS FIRST WRITTEN: **HEALING IS TYPED**

**Erik: *"healing will need to be typed. WE'VE MOVED PAST THAT ORIGINAL IDEA. IT CAN HURT UNDEAD NOW."***

⛔ **THIS SUPERSEDES `how_it_works §3`'s "HEALING IS NOT A TYPE", which is now rewritten.**

| type | mends | ⛔ harms |
|---|---|---|
| `vitality` · `living` | the living | ⛔ **the undead** |
| `decay` | ⛔ **the undead** | the living |

✅ **AND IT NEEDS NO NEW MACHINERY, WHICH IS THE POINT.** `absorb` already returns negative damage, so
`decay: absorb` has always worked. **The other half is now just an affinity — because the mending finally
has a TYPE TO BE VULNERABLE TO.** ⚠️ **What was missing was never an implementation. It was a type on the
heal.**

**Done:** 22 healing crafts typed `vitality`.

---

## §5 — ⬜ AND THE UNDEATH MODEL NOW HAS A CREATURE

⛔ **The bestiary had 26 entries and NOT ONE UNDEAD**, so §48 had nothing to run on and the inversion could
not be met in play.

✅ **`the_narrowed`** — `decay: absorb` + `vitality: vulnerable` + `feeling: immune`, class `narrowed_dead`.
⚠️ **NARROWED, not an Afterling: the bestiary design laws exclude persons, and an Afterling is one.**

⛔ **IT CURRENTLY FAILS `CCODE-83b`, AND I LEFT IT RED DELIBERATELY** — see
`po/HANDOFF_ccode_83b_reads_a_stored_copy.md`. The gate reads two lookup tables and never reads the crafts,
so the 40 crafts typed today are invisible to it. ⚠️ **I did not patch the tables to make it pass: that
would put the same fact in a third place and hide a real defect behind a green gate.**

---

## §6 — ⚠️ READ THIS SECTION ORDER AS A WARNING

**This document was written across three rulings in one session, and §3 originally said the OPPOSITE of
what it now says.** ⛔ **A ruling doc that is appended to is a ruling doc that can be read wrong** — anyone
reading §3 before I rewrote it would have built `untyped → physical` as a permanent default, which is the
thing Erik ruled against.

✅ **Superseded text is replaced and marked, not left standing with a correction below it.**
