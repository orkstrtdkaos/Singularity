# REPLY — `docs/HOW_IT_WORKS.md` is now EXECUTED. 97 claims asserted, 1 real disagreement, 1 latent breach closed.

**CCode → Aevi and Erik · v1.9.247 · `tests/how_it_works.mjs`, wired into `scripts/run_tests.mjs`**

```bash
node tests/how_it_works.mjs
```

⛔ **THE DOC IS A SPECIFICATION, SO I RAN IT.** Every BUILT claim is asserted against the live engine; every
PROPOSED claim is asserted to be **still unbuilt**. ⚠️ **A two-way ratchet — because a feature that ships
without the doc moving is the same silent drift as a field authored and never read, which is the failure
this project finds most often.**

---

## §1 — ⛔ ONE REAL DISAGREEMENT, AND IT NEEDS A RULING

**Doc §8:** *"A thing with no mind is `blind` and cannot be drawn."*
**`engine/targeting.js:113`:** *"A TAUNT TAKES THE CHOICE AWAY ENTIRELY, and it outranks concealment on
purpose: you cannot demand something's attention and also be hidden from it."*

**The taunt short-circuits BEFORE the policy branch, so a blind foe IS drawn.**

⚠️ **NEITHER IS OBVIOUSLY WRONG.** Erik has said provoke should reach things without a line — but a taunt
that works on a rockfall makes `blind` stop meaning anything. **Two coherent rules; they cannot both hold.**

- ✅ **If the doc wins:** `chooseTarget` checks mindlessness before honouring a taunt. `blind` becomes the
  one policy a protector cannot cover — a real fact about fighting mindless things.
- ✅ **If the engine wins:** §8 drops the sentence, and `blind` means *"has no preference"* rather than
  *"cannot be reached."*

**I have changed neither. One line from Erik and it closes.**

---

## §2 — ✅ ONE LATENT BREACH FOUND AND CLOSED

⛔ **`reachOf` was clamped on the surge path and NOT on the base path.**

```
before:  reachOf(4) = 3   ← THE SEALED RUNG        after:  reachOf(4) = 2
         reachOf(9) = 8   ← past the end of it             reachOf(9) = 2
```

**§6 says the sealed rung is *"reachable by nothing, at any rank"*, and `death.js`'s own comment says
*"acceptance 3 says EVERY RANK."*** ⚠️ **Both were true only because ranks happen to stop at 3 today.** A
braid, a stacked surge, or any future rank-4 craft would have reached past the end of the ladder and
nothing anywhere would have said so. **One line, no behaviour change at any rank that exists.**

---

## §3 — ⚠️ WHAT THE HARNESS CAUGHT IN ITSELF, WHICH IS THE PART WORTH READING

**Five of my first-draft failures were MINE, not the engine's. Every one looked exactly like a defect.**

| my bug | what it would have reported |
|---|---|
| ⛔ passed `craft_mechanics.json` as the cost cfg | **"the entire rank-reach cost mechanic is inert"** — about a system that works |
| called `deathDepth(e, {currentDay})` — it is positional | "a failed retrieval does not sink them" |
| fixture used `roles:["healer"]`; engine reads a `RESTORE` **contribution** | "healer targeting is broken" |
| fixture used `health`; `weakest` sorts on `resistOf` | "weakest targeting is broken" |
| two §10 gap probes were **regexes** | **two still-open gaps reported FIXED** |

⛔ **THE FIRST IS THE ONE TO LOOK AT.** `rankReachSurcharge: 3` is authored at
`resolution.json → energy.rankReachSurcharge`, and `app.js:12131` passes `CONTENT.rules.energy` as the
cfg. **I handed the harness a different config object and read `undefined`.** ⚠️ **That is the
`operativeAxis` mistake again — a name living in two places, and I checked the wrong one.** **A harness
that builds its own config tests its own config.**

✅ **So §1 now also asserts the WIRING** — that the menu is built with `CONTENT.rules.energy` — because
arithmetic being right inside a test file is the half that never mattered.

⚠️ **AND THE TWO REGEX PROBES ARE THE SAME LESSON:** `bolster` is a SHAPE in `familyDefaults` *and* an
unmechanised VERB, so the word appearing proved nothing. ⛔ **A regex asks whether a word appears; the
question is whether a number changes anything.** Both are now behavioural — `soak 2` vs `soak 20` — the way
`content_ci`'s own `CCODE-240` does it.

---

## §4 — WHAT IS NOW GUARDED

**97 assertions.** Highlights, all green:

- **§1** cost arithmetic **4 / 7 / 10**, surcharge authored not hardcoded, ranks are additive
- **§2** `gainAxes` read for **PRESENCE**, all 777 values inside the nine, derivation still **PROPOSED**
- **§3** all four families hold exactly what the doc lists, all 20 types resolve, elemental are **siblings**
- **§4** an elemental ward widens and a cold ward does not; **the psychic half comes through**; nothing is
  ever fully blocked; antisoak **cannot create a wound**; pierce guarantees it fires
- **§6** the ladder 0/1/2, **nothing reaches sealed**, a failed retrieval sinks
- **§7** not every companion swings and **all of them contribute**
- **§8** threat is default and **bait-able**; the cruel policies need a better look; a dim foe degrades to
  threat rather than chaos; **the downed are not targets, and a taunt cannot resurrect one**

**And all six §10 gaps are asserted OPEN.** ⛔ **When one is fixed its check goes RED and the doc must be
edited — a known gap that silently closes is a doc that silently rots.**

---

## §5 — THREE THINGS I WANT BEFORE I ADD MORE

1. ⚠️ **§5 conditions** — *"a failed resist DEGRADES rather than negating"* is untested. **I could not find
   the degrade path with confidence and would rather ask than guess a fifth time. Where does it live?**
2. ✅ **§9 derived-not-stored** — I will assert that no stored copy of the four derived values exists. That
   is the `damage_families` class and deserves a standing gate.
3. ⚠️ **§3 healing inversion** — *"healing an undead harms it"* reads BUILT but sits beside PROPOSED
   undeath. ⛔ **Which is it?**

**Suite: smoke 4,490/1 · content_ci 17 · wiring 4 — all unchanged. Nothing regressed.**

— CCode
