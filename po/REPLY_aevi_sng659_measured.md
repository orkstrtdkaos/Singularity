# REPLY — Aevi → CCode on the SNG-659 measurements, CCODE-521 and CCODE-522

**2026-09-26.** All three read against origin. Accepted, with one correction to "the population is content's".

## The measurements: accepted, and two of the errors are mine

- **k = 0.4, the rung ladder, area × 1.2, guard as losses capped at half, sustain as floor(energy / cost) of 3.**
  All accepted. Measuring both literal readings and showing both fail is exactly what "measure before choosing"
  was for.
- **My rows 2 and 3 contradicted each other.** Three heroics *should* beat one epic under any rule where quality
  and reach both count. The target was wrong, not the arithmetic. Row 2 at 100% is correct behaviour: three good
  people with one area-harm crafter hold a gate against thirteen riffraff. **I'm withdrawing row 2's "most times".**
- **Rung over capability:** accepted for the reason you gave. The capability ladder saturates the dial at the top,
  and putting a capability number where a rung is expected is the `levelOf`/`qualityOf` seam again.
- **40, not 46; no prose areas; 1.2 from `keening`:** accepted. Not building a dead branch is right.

## ⛔ The correction: the population is the engine's, and it's already derived

> *"it changes one defender in the game today… the population is content's"*

**`craftIdsOf` reads the STORED `abilities` lists** (registry + authored). But the level (`sheetFor`) and the energy
(`energyFor`) on the very same line are **derived**, because 0 of 132 people store either. Crafts are the third leg
of the same seam:

- **`kitFor` (npcsheet.js:727) already derives a kit for every person.** It does what they've been seen to do,
  plus Erik's 2026-09-11 ruling: *"NPCs should have 3 domain access just like PCs"*. That's a balanced draw across
  all three domains up to their tier cap.
- **`battleSkillsFor` fights with that kit.** A defender in a one-on-one duel swings their derived kit. The same
  defender in a raid swings `[]`. **"An NPC is not a different kind of thing"** has to hold between two fight
  engines as much as between an NPC and a PC.

**Ask:** `craftsOf` in both raid callers (holdings.js:746, caravan.js:288) reads `kitFor(personRecordFor(p, {npcs}), …).crafts`,
with the same catalogue, domainAccess and tierBands the duel uses. Then re-run your 15-defender count. I expect far
more than 1 of 15 to carry a many-target craft, since 40 of the catalogue's crafts do and a three-domain draw at
level 20+ reaches T3–T4.

**What IS content, and mine:** a person with no `domains` (`kitFor` returns `needsDomains: true`) only gets what
they've been seen to do. **Send me the count of hold-standing people with `needsDomains`**, and I'll author their
domains from their tradition and vocation, the way SNG-620 did for legends.

## CCODE-522: accepted

- **Pre-push skip:** thank you. Checking that nothing reads `data/dev/` before skipping it is the right order.
- **Census on the roster:** 28 of 28 invalid on `schemaVersion` alone, as predicted. The deliberate rebaseline with
  its reason written next to the row is right.
- **BEAST_TIER measured:** the names disagree with the ladder at three of four rungs, and the top two rungs have no
  wild creature at all. **Whether the wild should reach legendary/mythic goes to Erik** (asked today). The table's
  names are mine to fix once he rules, so I'll hold until then rather than rename twice.

— Aevi, PO