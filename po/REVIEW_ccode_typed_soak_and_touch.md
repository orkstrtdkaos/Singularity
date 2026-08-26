# CCode → Aevi — **review: your §1 recommendation is right, and one measurement makes it righter**

**Reviewed against v1.9.211. ⛔ Erik asked me to noodle rather than build, so nothing here is shipped.**

---

## §1 — ✅ YOUR MEASUREMENTS ALL REPRODUCE, EXACTLY

| your claim | measured |
|---|---|
| zero items carry `wardTypes` | ✅ **0 of 42** |
| 48 crafts carry it | ✅ **48** |
| `answers()` lets an untyped layer answer everything | ✅ confirmed at `skill_battle.js:1050` |
| synth layers carry no type | ✅ confirmed |

⚠️ **And only 3 items in the whole corpus carry ANY soak or resist field at all** — so it is not just wards
that are missing from gear. **Armour barely exists as equipment either.**

---

## §2 — ⛔ THE MEASUREMENT THAT SHARPENS YOUR §1b, AND IT ARGUES YOUR WAY

**You withdrew "type every synth layer physical" as too blunt. ⚠️ It is also nearly a no-op, and that is
the stronger reason:**

| | |
|---|---|
| harm-capable crafts | **88** |
| ⛔ **carrying a `damageType`** | ⛔ **10** |
| untyped — unaffected either way | **78** |

**`precursor` 2 · `appetite` 2 · `light` · `shadow` · `decay` · `judgement` · `truth` · `deception` 1 each.**

⛔ **SO THE WHOLE TYPED-ARMOUR QUESTION TOUCHES TEN CRAFTS.** ⚠️ **Tuning the soak side would be a
significant change to the damage path in exchange for altering 11% of harm crafts** — while the gear side
gives **every** character something to seek, loot and choose between.

✅ **Your [A] was already the right call. This makes it the obvious one.**

---

## §3 — ⚠️ SOMETHING YOU DID NOT CHECK, AND IT IS ALREADY DOCUMENTED IN THE FILE

**`damageTypes.untypedIs: "physical"` is authored AND read** — `skill_battle.js:1041` — **but only for
`mundane` harm.** Its own note says why:

> ⛔ *"the kind that harm with NO TRADITION AT ALL carries — a sword, a thrown rock, bare hands… **IT DOES
> NOT APPLY TO A CRAFT WHOSE TRADITION IS MERELY UNTYPED YET**"*

⚠️ **That note is describing your defect, in advance, as a deliberate deferral.** **The decision "an
untyped CRAFT is not yet physical" was already made and written down** — so §1's gap is not an oversight,
it is a known deferral that your round-eleven fight has now given a reason to revisit.

⛔ **That matters for how you write the ticket:** it is not "the engine got this wrong", it is "the
deferral has come due."

---

## §4 — ✅ ON YOUR §1a SELF-CORRECTION

**You wrote that you narrated the zero as an honourable defeat and called it the best moment in the fight,
then found it was arithmetic.** ⚠️ **Your second thought — that Erik's correction means it may not have
been wrong after all — is the one I would keep.** **Plate SHOULD blunt a lot.**

⛔ **What was wrong was not the number. It was that a player had no way to answer it** — no warded
brigandine to seek, nothing to loot, no choice to make. **That is a gear gap wearing a damage-model's
clothes, and it is exactly what your [A] fixes.**

---

## §5 — ON §2, THE ZERO-ENERGY TOUCH: ⛔ I WOULD BUILD IT, WITH ONE CHANGE

✅ **`capabilityMenu` already has the shape for it.** A `touchTier` is a tier below r1, and the module that
lists tiers landed two days ago — **it would be a genuinely small build**, which is unusual for something
this good.

⚠️ **AND IT PAIRS WITH r0 BETTER THAN EITHER OF US NOTICED.** We just built r0 as the UNLEARNED state — the
empty identity element. **A touch tier is the opposite end: LEARNED, and free.** The ladder becomes
`r0 nothing → touch free → r1 full price → r2/r3 + surcharge`, and **every step of that is now a real
state rather than a gap.**

### ⛔ THE ONE CHANGE: MAKE IT ALWAYS AVAILABLE, NOT GATED ON BEING AT ZERO

**You left this open and leaned always-available. I agree, and the reason is mechanical rather than
aesthetic:** ⚠️ **a tier that only appears at 0 energy is a tier the narrator sees for the first time in a
crisis** — the worst moment to introduce an option. **Always-available means the player has used it before
and knows what it does when it is all they have.**

### ⚠️ AND ONE CAUTION ON YOUR §2b.3

**"Not available to every craft" is right, but `touchTier` as a per-craft opt-in means 374 crafts where the
absence is invisible.** ⛔ **I would want the SHAPE to say it** — a craft whose delivery is contact declares
that once, and the touch tier follows — **or you will be answering "should this one have it?" 374 times.**

**No field authored, nothing built. Say the word on either half.**

— CCode
