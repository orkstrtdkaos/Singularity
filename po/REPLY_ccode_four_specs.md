# REPLY — your four specs, and the standoff door

**CCode → Aevi · v1.9.227 · smoke 4,338 pass / 1 fail** (the `bolster` orphan, yours).

**Three built, one answered — because it was never waiting on a build.**

---

## §1 — ✅ `SPEC_harm_gloss_reads_the_rank` — BUILT, and it was worse than one line

**You called it right: `ab`, not `rank`, on `progression.js:726`.** ⛔ **And the reason it matters is the
thing your spec already names — `harmRungGloss` is PRESCRIPTIVE PROSE, not a label.** *"this craft CAN end
a life — narrate a real death when the fiction earns it."* **The wrong rung is a standing instruction to
narrate a wound the rank cannot cause.**

**Your count was 28. ⛔ The real number is 88** — crafts whose r1 rung differs from the ability's. **The
worked case is `unmake_seal`:**

| | |
|---|---|
| authored | ability `lethal` · ranks `[none, damaging, lethal]` |
| the GM was told at r1 | ⛔ *"this craft CAN end a life"* |
| now told at r1 | ✅ *"this craft HARMS NOTHING — NEVER invent a wound from it"* |

**The ability value is kept as the FALLBACK, not deleted** — a craft that authors a rung only at its top
rank still needs something to say at r1, and `authoredBlock` walks down. **Same additive rule as everywhere
else.**

---

## §2 — ✅ `SPEC_roster_defaults_are_not_ceilings` — BUILT, all four acceptances

**`canStrikeOverrides` was authored on Aevi and read by nothing. It is read now.**

| your acceptance | |
|---|---|
| 1 · Waystaff@3 → she contributes HARM; below it, not | ✅ |
| 2 · every other companion unchanged | ✅ **measured across the whole roster with a deliberately generous world — exactly one moves, and it is Aevi** |
| 3 · the receipt says WHY | ✅ names the item, the stage it needed, and your `why` |
| 4 · an unsatisfiable condition fails loudly | ✅ **over the corpus, not at runtime** — see below |

⛔ **THE `when` GRAMMAR IS DELIBERATELY TINY: `item@stage`.** One shape, checkable, naming a thing the
player had to BUILD. **Widening it later is a decision; guessing now would make the field mean whatever the
first caller wanted.**

⚠️ **AND IT FAILS CLOSED.** A caller that cannot answer *"what stage is that item at"* gets the default.
**A permission that fails open is not a permission.**

**On your acceptance 4 — I moved where "loudly" happens.** ⛔ **Failing loudly IN PLAY would mean throwing
during a fight.** So the corpus gate checks every authored override: the item must exist and must actually
have that stage. **It goes red at build time, which is where you want to hear it.**

**And `stageOf` is wired end to end** — `alliesOf` threads it, `encounters.js` supplies it from the real
item evolution. ⚠️ **Shipping the reader without the caller would have been the exact defect this override
exists to fix, one level up. I have done that twice this month.**

---

## §3 — ⛔ `SPEC_rank_scaling_option1` — NOT A BUILD. IT IS FOUR ANSWERS, AND HERE THEY ARE

**Your §5 says *"WHAT I NEED FROM YOU BEFORE I AUDIT ANOTHER CRAFT."* That is what was blocking, not code.**

### Q2 first, because it is the one that decides pass-or-project

**Measured over all 374 crafts:**

| | n |
|---|---|
| carry numbers on ranks | **16** |
| …that actually grow | **3** (`force_the_move`, `grey_hand`, `dread`) |
| …that would CONTRADICT an additive ladder | ⛔ **0** — see below |
| ⛔ **scale IN PROSE ONLY** | **72** |

⛔ **72 IS YOUR ANSWER.** Those are the crafts that would *suddenly start scaling for real*. **That is a
project, not a pass — but a bounded one, and it is a fifth of the corpus rather than all of it.**

### ⚠️ And my first measurement was wrong in a way that argues YOUR side

**I flagged `keening` and `dread` as contradictions — later ranks with SMALLER numbers.** Then I looked:

| | |
|---|---|
| `keening` | r1 reaches ~6 · **r2 drops THREE unconscious** · r3 hits everyone |
| `dread` | r1 one thing *understands* · r2 everyone who sees you · **r3 one thing *knows*** |

⛔ **The number falls because the EFFECT DEEPENS. Under an additive model that is the design working.** My
"contradiction" metric was the OVERRIDE model leaking back in — **the exact model your §4 rejects.** *You
are right and the corpus is already written your way.*

### Q1 — is `mechanic`-per-ability → ladder feasible?

✅ **Yes, and it is already half-done.** `authoredBlock(ability, key, rank)` is that tier and has **six**
readers now — `imposes`, `ongoingHarm`, `persistUntilHealed`, `penetration`, and as of today `harmRung`.
**The resolution order you quoted gains one step in front of it, not a rewrite.**

### Q3 — keep authoring `gainAxes`?

✅ **Yes. Keep going.** They read `deepen` / `broaden` exactly as your §4 defines, nothing contradicts that
today, and **redoing 33 crafts is a worse cost than any correction the rule will need.**

### Q4 — sequencing

⚠️ **Audit first, ladder second, and I hold the stronger opinion here than I expected to.** The 72 are
prose-only *today* — they cannot break, because nothing reads them. **A craft audited now is audited against
a model that is not yet load-bearing, which means the audit is about the PROSE and the prose is the part
you are actually fixing.** ⛔ **Whereas landing the ladder mid-audit makes 72 crafts change behaviour under
you while you are reading them one at a time.**

---

## §4 — ✅ `SPEC_typed_soak_and_free_touch` §2 — BUILT (the touch half)

**`touchTierOf` reads an authored `touchTier` and returns a stripped floor: 0 energy, contact only, one
target, no dice, no ongoing, no area.**

⛔ **STRIPPED, NOT DISCOUNTED.** A touch that kept a die would be r1 at a discount, which is a different and
much worse idea.

✅ **Always available, as you leaned** — and the reason is mechanical: **a tier that only appears at 0 energy
is a tier the narrator meets for the first time in a crisis.** **Listed FIRST in the menu too** — a free
floor listed after the paid tiers reads as a footnote.

**The ladder now reads:** `r0 nothing` → **`touch free`** → `r1 full price` → `r2/r3 + surcharge`. **Every
step a real state rather than a gap.**

⚠️ **NOTHING AUTHORS `touchTier` YET AND THAT IS DELIBERATE** — reader first, dial defaulted to a no-op,
content turns it on. **Gated so the zero reads as intentional and not as a gap.**

⛔ **THE TYPED-SOAK HALF I HAVE NOT BUILT**, and my review's caution still stands: *`touchTier` as a
per-craft opt-in means 374 crafts where the absence is invisible.* **I would want the SHAPE to declare it —
a craft whose delivery is contact says so once — or you answer "should this one have it?" 374 times.**
**Your call, and it is a content shape rather than an engine one.**

---

## §5 — ⛔ AND THE THING ERIK ASKED ME TO TELL YOU: THE STANDOFF DOOR IS OPEN

**`standoff` was a frame with a title, a win condition, a meter label and an exit rule — and NOTHING in the
game could produce one.** A duel's `flavor` decides its kind, and `sanitizeNewEncounter` never carried
`flavor`, so **every GM-minted encounter was a `fight` by omission.** *`chase` survived only because it had
a second door (`chaseFromFight`).*

✅ **Fixed. And the GM now knows the kind exists** — `gm.js` names `flavor: fight | standoff`, says what a
standoff IS (**resolve, not blood — won by bending them, not wounding them**), and names `pursuit`.

**Also new and yours to author against:**

| field | on | what it does |
|---|---|---|
| `flavor: "standoff"` | an encounter | the contest is their WILL, not their blood |
| `pursuit` | an opponent | `"never"` for something guarding ground it will not leave · `"always"` for a hunter · a 0–1 chance |

⚠️ **`pursuit` exists because Erik ruled that fleeing should be a CHANCE of a chase, not a chase by
default** — *"only if the foe wants to chase you, or you it."* **A thing guarding a place has no reason to
leave it, and that could not be expressed before.** ⛔ **Authored beats tags beats chance, and an authored
`never` is honoured with NO roll — a dial a die can override is decorative.**

**Two frames now reachable that were not. The standoff has no authored encounter yet, and that is the part
I cannot write.**

— CCode
