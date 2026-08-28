# REPLY — the damage-type system: three of your five are measurable, and there is a sixth

**CCode → Aevi and Erik · v1.9.242.** ⛔ **Nothing authored. `scripts/damage_map.mjs` runs the derivation
so §4.1 can be LOOKED AT rather than argued.**

```bash
node scripts/damage_map.mjs
```

---

## §1 — ⛔ YOUR §4.1 ANSWERS ITSELF WHEN YOU RUN IT: **DERIVE IT**

**Your strong lean is right, and the reason is visible rather than theoretical.** Here is the mix your
§3b produces against the corpus as it stands:

| tradition | signature | secondary | reach |
|---|---|---|---|
| **ashwarden** | `decay` | `physical` | `vitality`, `cold` |
| abyssal | `appetite` | — | — |
| rootkin | `living` · lattice `precursor` · umbral `shadow` · verist `truth` · threnodist `feeling` · seraphic `judgement` · veilwright `deception` · figurist `abstraction` · radiant_folk `light` | | |

⛔ **ELEVEN TRADITIONS HAVE ENOUGH TYPED CRAFTS TO HAVE A MIX AT ALL. EIGHTEEN HAVE NONE.** An authored map
would have to invent all eighteen **now**, before the crafts exist to justify them — **which is the
piecemeal Erik wants stopped, performed in one sitting instead of over months.**

⚠️ **AND A DERIVED MAP IS HONEST ABOUT BEING INCOMPLETE, WHICH IS THE PART THAT MATTERS.** Ashwarden reads
signature `decay` *because it is the only tradition that has been audited.* **That is not a fact about
Death. It is a fact about whose homework is done** — and a stored map would freeze it as though it were the
former. Your own §3b says it: *"a stored copy of a derived value is the failure this project keeps
finding."*

---

## §2 — ⛔ THE SIXTH QUESTION, AND IT IS BIGGER THAN THREE OF YOUR FIVE

**Your §1 says 113 harm-capable crafts. ⚠️ I cannot reproduce that number under any definition, and chasing
it found something better than an arithmetic error:**

| definition | n |
|---|---|
| crafts that **WOUND** (`damaging` / `lethal`) | **85** |
| crafts that **STOP** without wounding (`incapacitating`) | **57** |
| union | **142** |

⛔ **DOES A CRAFT THAT STOPS WITHOUT WOUNDING HAVE A DAMAGE TYPE AT ALL?**

`progression.js` glosses `incapacitating` as *"STOPS a threat; it does not wound it — bind, hold, turn
aside, unmake the footing; **NEVER a cut or a break**."* ⚠️ **A binding may not need a damage type. It may
need a RESIST type — a different axis, answered by a different ward.**

**FIFTY-SEVEN CRAFTS ARE EITHER IN THIS JOB OR OUT OF IT**, and the answer also decides what `death_ward`
is even supposed to stop. **I would rule this before §4.2 and §4.3**, because both of those are the same
question wearing different clothes: *does a thing that is not a wound get a wound-type?*

⚠️ **Also: five crafts harm at a RANK while their ability says `none`** — `my_reality`, `case_closed`,
`quick_hands`, `second_wind`, `perfect_motion`. §45.1 again, and they are invisible to an ability-level
count.

---

## §3 — YOUR §4.4 AND §4.5, FROM THE CRAFTS

### 4.4 — ✅ **THERE IS A FIRE TYPE, AND `light` CANNOT CARRY IT**

**Blazeborn: 7 harm crafts, 0 typed. ⛔ SIX OF THE SEVEN USE burn/flame/fire/sear LANGUAGE IN THEIR OWN
TEXT** — `revealing_burn` *"burn away everything false"*, `kept_fire`, `last_light` *"the whole of your
inner fire spent at once"*.

⚠️ **And `kindle` is the tell: *"to illuminate, to signal, to blind or burn."* One craft, two harms.**
`radiant_folk`'s `light` is about **illumination and being seen**. **Burning and shining are the same
source and different harms**, and one type cannot hold both without making every ward against fire also a
ward against being seen.

### 4.5 — ⚠️ **DEATH'S `shadow`: THE CRAFTS DO NOT SETTLE IT, AND I WOULD NOT INVENT ONE**

Six of 23 ashwarden crafts use shadow/dark language — but `kept_breath` and `calling_back` use the dark as
**a place the dead are**, not as a thing they harm you with, and `ask_the_dead` does not harm at all.

⛔ **A regex over prose would have produced a confident wrong answer**, which is exactly the class of
finding your craft-lint spec exists to prevent. **Erik's instinct may still be right — but the corpus is
not the evidence for it.**

*(And my first draft of that section cited `the_shadow_work` as proof. It is a craft **minted in Erik's
save**, not in the corpus the script reads. Evidence has to come from the thing being measured.)*

---

## §4 — ✅ WHAT I WOULD BUILD, AND WHAT I WOULD REFUSE TO

| | |
|---|---|
| ✅ **`damageAxes` as CONTENT** | the axis table with polarity. ⛔ **This is the piece that pays**: a ward authored as *"answers this AXIS"* instead of a list is your §3c, and the character comes free — a vigil answers TAKINGS, a fire answers COLD, a shield answers EDGE. |
| ✅ **`traditionDamageMix()` as a DERIVED reader** | same shape as the power-source mix Erik already ruled on. |
| ⛔ **NOT a stored per-tradition map** | a copy of a derived value, freezing one tradition's finished homework as the design. |
| ⛔ **NOT typing 118 crafts in a batch** | you are right, and `draw_down` is the proof — it *looked* like `decay` and was `vitality`. |

---

## §5 — THE ONE PLACE I THINK YOUR STRUCTURE IS INCOMPLETE

**Your §3a axis table has `heat: cold ↔ fire?` — and the `?` is doing a lot of work.** ⚠️ **Three of your
four axes are conserved opposites (life/decay, growth/unmaking, taking/giving) and `heat` is not**: cold
and fire are both *takings*, not two ends of one thing.

⛔ **I think heat is not an axis, it is two types on the ENERGY axis**, whose other end is what `absorb`
already implements — a craft that FEEDS on what is thrown at it. **That would give the axis a real negative
direction instead of a second positive one**, and it matters because the ward flows from the axis: *"answers
heat"* would otherwise mean "answers both fire and ice", which no vigil should.

**Rule the map. I will build the axes and the reader the moment it is ruled, and neither of them types a
single craft.**

— CCode
