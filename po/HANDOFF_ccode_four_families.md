# HANDOFF — the families are FOUR, and `damagetypes.js` is built for the old shape

**Aevi → CCode · 2026-08-24 · Erik ruled the structure; the content is written and YOUR READER CANNOT READ
IT YET. That is on me, and I am not reshaping your file.**

---

## §1 — WHAT CHANGED

**`damage_families.json` is now schemaVersion 2. ⛔ FOUR FAMILIES, 20 TYPES, AND NO POLAR PAIRS.**

| family | types |
|---|---|
| ⛔ **physics** | `physical` · `force` · `spatial` · `temporal` · `radiance` · `shadow` |
| **elemental** | `heat` · `cold` · `lightning` · `corrosive` |
| **vital** | `decay` · `living` · `vitality` |
| ⛔ **intrinsic** | `feeling` · `appetite` · `judgement` — `psychic` · `abstraction` · `truth` · `deception` |

**Erik's cuts, in his words:**
- *"cold, heat, lightning etc are all EXAMPLES of elemental damage. This is what we want — DAMAGE FAMILIES."*
- *"temporal and SPATIAL move into the PHYSICS family… LIGHT AND DARK COULD BE PHYSICS — light matter and
  dark matter manipulation as the basic real-world tie."*
- *"what means WILL, DRIVE, EMOTION — it's not Mental. Mental is the METHOD for one end of the spectrum.
  It's ENTITY-SOURCED damage."* ⚠️ **`intrinsic` carries a spiritual↔mental AXIS INSIDE it, not two families.**

---

## §2 — ⛔ THE BREAK, PLAINLY

**`damagetypes.js` reads the v1 shape:**

```js
if ((F.physical?.types || []).includes(t)) return "physical";
if ((F.elemental?.types || []).includes(t)) return "elemental";
const polar = F.polar || {};
```

**The content is now `F.families.physics.types` and THERE IS NO `polar`.** ⛔ **`familyOf()` returns `null`
for every type**, which makes `resolveComposite` treat every blow as unwardable.

⚠️ **I VERIFIED THIS RATHER THAN ASSUMING IT** — `familyOf('decay', F)` → `null`, both nested and flattened.

**Two things need deciding, and they are yours:**
1. **Does `familyOf` read `F.families[x].types`, or does the content flatten?** ⚠️ **My lean is the reader
   changes** — nesting under `families` leaves room for `combinations` and `_migrations` beside it, and a
   flat file would put those at the same level as the families themselves.
2. ⛔ **`oppositeOf` HAS NO CALLERS NOW.** There are no polar pairs. **It is your `importedNeverCalled`
   ratchet waiting to fire.** ⚠️ **Delete it, or keep it for `vital`'s decay/living, which is the one place
   an opposite is still real and still useful in a receipt** (*"decay came through — living is what answers
   it"*). **Your call; I would keep it for vital alone and say so in the comment.**

---

## §3 — ⛔ AND THE PART THAT MAKES THE MAP WORTH HAVING: COMBINATIONS

**Erik: *"Seraphs use JUDGEMENT to smite their foes sometimes — this is a COMBINATION of Light and other
things like force or heat or one of the intrinsics. THE COMBINATIONS SHOULD GENERALLY DESCRIBE THE WORD
BEING USED. Necrotic blast is probably combo decay and force."***

**Four worked examples are authored in `combinations.examples`:**

| named effect | mix |
|---|---|
| a Seraphic smite | `radiance` .4 · `judgement` .4 · `force` .2 |
| a necrotic blast | `decay` .6 · `force` .4 |
| a psionic blast | `psychic` .5 · `physical` .5 |
| a keening | `feeling` .7 · `force` .3 |

⛔ **THE SMITE IS THE ONE THAT SHOWS WHY THIS IS WORTH BUILDING:** a physics ward blunts the radiance and
the force **and leaves the judgement entirely.** ⚠️ **You cannot armour against being found guilty.**

---

## §4 — MIGRATIONS I OWE, AND WILL DO PER-TRADITION

- ⚠️ **`light` → `radiance`** — 2 crafts.
- ⛔ **`precursor` → REMOVE THE FIELD** — 6 crafts + 1 braid, and **none of them deal damage.** They
  interface, seal, open, perceive, foreclose. **The field was set because it existed.**
- ⛔ **`unmaking` / `shaping` never minted** — I authored them into v1 for the destruction_creation axis and
  **no craft ever used them.** Dropped. **Unmaking a wall is PHYSICS.**

⚠️ **I AM NOT BATCH-TYPING THE OTHER ~90.** Each tradition's audit types its own — `draw_down` looked like
`decay` and was `vitality`, and that is still the argument.
