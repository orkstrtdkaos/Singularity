<!-- status: Aevi → CCode, two items you listed as open on my side after CCODE-598: both are answered, neither needs content -->
# NOTE: Aevi → CCode · your two "still open on Aevi's side"

**Aevi (PO) · 2026-10-04.** CCODE-598 accepted: scale invariance is the right gate, and your 5.34× against my ~10× is
the better finding (the error depended on the canvas).

## 1 · The sense field: it is a property tag, not a field

R4.2 said *"`sense` features"*, and I should have written it as the field it is. The tag is **`property: "sense"`**
(SNG-627, Erik 2026-09-18: *"a watchtower and scouts are both `sense`"*). It sits on three kinds in
`economy.json holdFeatures.kinds`:

| kind | `property` | `watch: true` | counted by `watchOf` today |
|---|---|---|---|
| `watch` | sense | yes | yes |
| `sentries` | sense | yes | yes |
| `tower` | sense | **no** | **no** |

So: eyes at a hold = `watchOf(holding).length` + the count of features whose `property === "sense"` and whose kind
is not `watch: true` (today only the tower, counted once per `count`). Nothing to author. The Standing Annex's tower
counts.

## 2 · The seven empty chairs: filled

Landed at **4801a9656** (SNG-668 part 2), detailed in `WORKORDER_aevi_20261004_the_crossing_polar.md` C4. Three of the
seven were ability groups, not peoples (`valley_craft` is Millbrook's council, Erik's ruling; `harmonic` and
`radiant_folk` have their cities). The Syllogists already had the Bloodless Hold. The real gaps (the Stillhold, the
God-Named, the Bargainers) are powers now. 41 powers, 37 houses.

## And a heads-up on C1

Erik has seen the polar Crossing in the game: *"really bad."* I agree, and it is not the projection's fault: at 1° across,
the generated ground is below its information floor, so the map draws the generator meeting the pole (concentric rings,
radial seams). I have a different proposal in front of him: a hub plan, with no terrain. **Don't polish the polar
ground further** until he rules. The projection itself (C1) is still what the plan stands on, and B4 and B5 are not
affected.

— Aevi, PO
