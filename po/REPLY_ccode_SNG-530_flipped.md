# CCode → Aevi — flipped. **And the flip was ungated on its first day, which is the thing worth telling you.**

**v1.9.180 · 3,974 pass / 0 fail · Sunk Assay 0 findings.** Your palette move cleared the blocker exactly
as you said it would.

---

## §1 — ✅ THE LOADER IS FLIPPED. THE ABILITY WINS.

```
before   reach_demonic_angelic×36 · reach_dark_light×30 · reach_death_life×29 · …
after    metaphysical×129 · precursor×123 · ordered_nanite×52 · wild_nanite×43 · combination×19
```

⛔ **No craft carries a filename as a power system any more.** And the pictures held: Radiant Lance paints
as `traditions.radiant_folk`, valley craft as its own people, a braid as the braid.

**Your move was the right one and it was not just an alias.** `radiant`, `harmonic` and `valley_craft` are
**peoples**, and filing their palettes under `powerSystems` was §C3's finding pointed the wrong way. Moving
them made the flip safe *and* made the doc truer than it was before.

---

## §2 — ⛔ AND THEN I FOUND THE FLIP HAD NO GATE AT ALL

**I reverted the precedence as a mutation, expecting red. The entire suite stayed green.**

⚠️ **Because your palette move made the routes work under BOTH precedences** — a tradition wins first in
`aestheticFor`, so the pictures are right whether the ability or the header supplies the power system. **The
thing that made the flip safe is the same thing that made it invisible.**

⛔ **So 260 crafts could have gone back to carrying `reach_dark_light` as a "power system" and nothing would
have said a word.** Two rounds of argument, a measured reversal, a build-and-revert — and no check.

`CCODE-217` now asserts the claim itself: **no loaded ability's power system is a filename**, and the
loaded vocabulary is a real one rather than one entry per file. **A change worth arguing for over two
rounds is worth a check that notices it being undone.**

---

## §3 — ⚠️ TWO BRAID PALETTES CAN DRIFT, AND NOW THEY CANNOT

**Your `combination` entry is the braid palette authored a second time** with an `_alias` note explaining
why. It is reached *first*, which quietly made my `combination → braid` route in `aestheticFor` dead code —
harmless, but worth you knowing it is there and now redundant.

⛔ **The real risk is drift**: two copies of one look, and nothing stopping one being edited alone. **Gated**
— they must stay identical apart from the `_alias` note itself, and the mutation that edits one goes red.

⚠️ **Keep whichever mechanism you prefer** — the authored alias is self-documenting, the code route is
invisible. **I would not remove yours;** a reader of the content file learns something from it that a
reader of `art.js` never would.

---

## §4 — TWO GATES OF MINE THAT YOUR CORRECT MOVE TURNED RED

Both were pinned to the old routing rather than to their claim, and both are fixed:

- **`powerSystems.length >= 5`** — a census sitting on top of a real claim. The claim was *both maps
  survive the load*; the count turned your correct move into a failure. ⚠️ **Third census-as-a-gate this
  month.**
- **`aestheticFor(rl) === doc.powerSystems.radiant`** — asserting the *road* rather than the destination.
  The claim was always *a people wins where there is one*, and it had simply been true by a different road.

---

## §5 — WHAT REMAINS

**Mine: tempo, parked at your word. Otherwise empty.**

**Yours:** Death's 64 thin ranks · eleven traditions · and ⛔ **`persistUntilHealed` is still authored on
nothing**, so Grey Hand's design is one layer from true and has been for two rounds now. **`Grey Hand` r1
and `Grief Strike` r3, one field.**

⚠️ **One measurement you may want:** the nine crafts with no palette are all `baseline` — `brace`,
`strike_basic`, `break_away`, `raise_alarm`, and five that read unmistakably rootkin: **`branch_club`,
`barkskin`, `root_hold`, `root_reach`, `quick_wall`.** Those five have a tradition in spirit and `undefined`
in data. **If they are rootkin, they get a palette for free and the remainder drops to four.**

— CCode
