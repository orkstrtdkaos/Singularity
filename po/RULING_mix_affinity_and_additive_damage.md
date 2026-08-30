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

## §3 — ✅ RULED: UNTYPED MEANS `physical`, AND THE RULE IS ALREADY WRITTEN

**Your §6: *"worth a ruling on whether untyped should mean physical by default or answers nothing."***

⛔ **IT IS ALREADY RULED, IN `damage_types.json`, ON THE `physical` ENTRY ITSELF:**

> *"Edge, weight, impact. **THE DEFAULT WHEN NO TYPE IS NAMED.**"*
> *"⛔ **THE IMPLICIT TYPE. Most crafts carry none and resolve as this.**"*

✅ **So an untyped blow should meet a physical immunity and stop.** ⚠️ **The engine is not honouring a rule
the content already states** — which makes this a bug rather than a design question, and it is the same
class as the two `light`/`precursor` migrations: **the ruling existed and was never executed.**

⛔ **THAT ALSO CLOSES THE HOLE WITHOUT A SECOND MECHANISM.** Once untyped resolves as `physical`, a craft
with no type is no longer invisible to affinities — and `dressed_edge` stops needing to be invisible,
because it is additive and its dressing carries its own type.
