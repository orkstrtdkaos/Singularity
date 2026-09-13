# HANDOFF SNG-548 — The antipode is castable. Five readers still say otherwise, and you flagged one of them yourself.

**Aevi (PO) → CCode · 2026-09-12 · Erik's ruling, measured at HEAD `a6a18a1`**

---

## §1 — THE RULING

**Erik, 2026-09-12: *"It's both learnable and castable."*** The `LEARNABLE, NOT CASTABLE` stub
(CCODE-339, 2026-08-30) is retired. Content updated in `traditions.json`; the engine is already correct.

## §2 — ⛑ MEASURED BEFORE I WROTE A WORD, AND IT IS THE GOOD NEWS

⛔ **`castable: false` HAS ZERO PRODUCERS ACROSS THE WHOLE CATALOGUE** — your own measurement,
`wheelgeom.js:179`, 2026-09-05. And a live call, ashwarden reaching rootkin:

```
castable: true · allowed: true · penalty: 2 · band: "antipode" · lean: 1 · ceiling: tier 2
reason: "the far pole of your own axis — to tier 2 at your present balance"
```

⚠️ **THE ENGINE HAD ALREADY GROWN PAST THE STUB.** `antipodeCeiling` against
`skill_capacity.antipodeCeilingByLean` is exactly Erik's ruling, built and live: **learnable, castable,
capped by lean.** ⛑ **Nothing needs building. Only the prose was still describing a rule nobody was
enforcing** — which is why this is a statements job and not a behaviour job.

## §3 — ⛔ THE FIVE READERS STILL SPEAKING THE OLD LAW

**And the first one is yours, flagged by you, on 2026-09-01:**

> `progression.js:466` — `acquirable` *"refuses your antipode with 'closed-opposite holds; **the braid is
> the only road**'… CCODE-339 made the antipode learnable, not castable, and updated `domainAccess` only.
> Flagged, not changed."*
>
> ⛔ **"A RULING THAT UPDATES ONE READER LEAVES THE OTHERS SPEAKING THE OLD LAW. I changed `domainAccess`
> and never asked who else enforced the same rule."**

⚠️ **That note is eleven days old and it has now been true through TWO rulings.** You were right then and
the ask is the same ask, with the new ruling behind it:

| # | reader | what it still says |
|---|---|---|
| 1 | `engine/progression.js` `acquirable` | refuses the antipode: *"the braid is the only road"* — **the braid is no longer the only road** |
| 2 | `engine/traditions.js:268` | comment: *"LEARNABLE, NOT CASTABLE"* |
| 3 | `engine/wheelgeom.js:179` | carries the retired R16 paragraph |
| 4 | `tests/how_it_works.mjs:3742` §32 | titled **"THE ANTIPODE IS LEARNABLE AND NOT CASTABLE"** |
| 5 | `tests/smoke.mjs` | same phrasing |
| 6 | `docs/HOW_IT_WORKS.md` rows 73 / 413 / 442 | ⚠️ **history — leave them, add a row beneath** |

⛔ **§32 IS THE ONE THAT MATTERS AND IT IS THE SAME SHAPE AS §185.** A gate whose title asserts the old
rule will fail when the rule changes, or — worse — **pass, because it is testing the behaviour Erik just
retired.** ⚠️ Your own §185 lesson, nine days apart: **a gate that pins the rule instead of the reader
holds the rule in place.**

**⬜ Erik's call, not mine, and it is the one substantive question in here:** your 09-01 note says
`acquirable` is *"probably still right in substance — learning a craft and JOINING A PEOPLE are different
commitments."* ⚠️ **That distinction may well survive the new ruling** — castable is not the same as
acquirable-as-a-domain. **But it must now be a decision, and the reason string must stop citing a rule
that no longer exists.**

## §4 — ⛑ WHY IT CAME UP, AND IT IS NOT A DOCS CHORE

Erik and I were working the endgame. I read `foreclosed: ["rootkin", "somatic"]` from Silas's live save,
concluded he had shut two peoples out by name, and built a character argument on it. **Erik: *"He doesn't
have those two peoples foreclosed any more. That ruling about domain access was evolved."***

⛔ **A STALE FIELD IN A LIVE SAVE MADE ME WRONG ABOUT A PLAYER'S CHARACTER, OUT LOUD, TO THE PLAYER.**
Same shape as the spear: a record that outlived its ruling, and a reader that believed it.

**So a second ask, smaller and sharper:** ⛔ **is `foreclosed` still read by anything?** If nothing reads
it, it is an orphan on every save and should go. **If something does, it is applying a rule Erik retired
twice** — and Silas's antipode is `rootkin`, which is precisely what that field lists.

---

## §5 — WHAT I CHANGED, AND WHAT I DELIBERATELY DID NOT

✅ `traditions.json` — `opposedToPrimaryOrSecondary` rewritten to the lean-ceiling rule; `_stubStatus`
marked RESOLVED with its four open questions answered; supersession history kept, **because the direction
of travel is the setting's own thesis: CLOSED → learnable-not-castable → learnable-and-castable-to-an-
earned-ceiling. A model that forecloses by identity, replaced in three steps by one that prices by
relationship.**

⛔ **I did not touch `engine/`, `tests/`, or `HOW_IT_WORKS.md`.** Yours, and the ledger rows are history.

**Suite 28 green / 3 red, unchanged by this.**

— Aevi, PO
