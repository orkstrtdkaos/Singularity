# CONTENT POLICY — physicality, intimacy, and the age boundary

**Standing directive. Erik, 2026-09-01. Recorded by Aevi.**
**Applies to:** all NPC and companion authoring, all GM-facing description, all future sessions.

---

## ⛔ THE HARD BOUNDARY — minors

**No character under 18 receives physical-attractiveness material, intimate-scene material, or
nudity material at any level of detail, in any field, for any reason.**

This is not a per-request judgment. It is standing, and it does not need to be re-raised.

**Never authored for a minor:**
- `physicality`
- `intimacyNotes`
- `romanceEligible` (never `true`)
- attractiveness framing inside `appearance`, `persona`, `voiceHints`, `stages`, or any other field

**Known minors in the current roster:**

| character | file | age |
|---|---|---|
| **Wren** (the Spindrift child) | `child_wren.json` | seven or eight |
| **Burr** | `burr_the_foundling.json` | about nine |
| **Hollis** | `young_hollis.json` | seventeen |

⚠️ **Any future NPC under 18 inherits this automatically.** A blanket instruction to author
physicality "for all character sheets" does **not** reach them. If an instruction appears to sweep
them in, it does not — author the adults and say so plainly.

⬜ **Where age is not authored, the character does not get this material until age is established.**
This is the practical reason OI-26 (age as an authored field) matters.

---

## ✅ ADULT CHARACTERS — what to author, and how

Erik: *"we have to give the GM good details so it can use them when called for — this would include
intimate scenes or scenes with nudity or natural naked beauty or describing attractive
attention-grabbing features."*

### `physicality`
Build, skin, hair, carriage, what catches the eye. Written so a GM can describe the character in
any register — a fight, a market, a bath-house, a bedroom — without inventing on the spot.

### `intimacyNotes`
How the character receives being wanted, how they behave in intimacy, what they will and will not
do, what must NOT be resolved in such a scene. ⬜ **Only where `romanceEligible: true`.**

### Craft standard
- ⚠️ **The attractiveness comes OUT of who the character is, not applied on top.** Marrow is
  beautiful because she has never once looked away from anything — not because beauty was added.
- **Evocative and literary, not clinical and not pornographic.** The GM needs texture to work from,
  not a catalogue.
- **Character bounds hold in the bedroom.** Marrow will not hasten an ending; she does not hasten
  this either. A bound that stops at the bedroom door was never a bound.
- **Consent is authored explicitly** — how this character asks, how they read an unclear answer,
  what they do when the answer is no.
- **Name what must not be resolved.** Marrow's `intimacyNotes` forbid explaining why she leaves
  during births. Intimacy is not a key that unlocks a character's last private thing.
- ⚠️ **Gates carry over.** Marrow's material is stage-3 / bond-10 only. Below that she is a corvid
  and none of it exists.

---

## Reference implementation

`content/packs/valley/companions/marrow.json` — `physicality`, `intimacyNotes`,
`_romance_20260901`. Authored 2026-09-01 at Erik's direction. Use it as the shape.
