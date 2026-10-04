<!-- status: READY. SNG-667, Erik 2026-10-04 ("Yes. Proceed"): the ground's effect on crafts, simplified to five levels, sorted by what works here, coloured like the map; combination crafts get a real rule; invented sources repaired; the dormant opposed-crowding switch removed -->
# SPEC SNG-667: what works here

**Aevi (PO) · 2026-10-04.** Erik: *"Let's think about how the power bands affect the skills and if the way it is is the way we
want it. I'm thinking we might want to simplify and update ordering and visuals to help players see which skills work
best in their list where they are."* He agreed to every proposal below. On combination crafts: *"Either/or to determine
the success chance, or even best of any combination of the powering sources, including additive."* Ruled as §3.

Content already landed with this spec (mine): `the_substrate.meaning.ceilingFloor` 0.35 → **0.5** (2cbe52496), and a
`powerMix` on **all 28** combination crafts (this commit).

---

## §1 · What a player sees today, measured on Loki at the Standing Annex

| surface | shows the ground? |
|---|---|
| the character sheet's craft list | **no**: grouped by domain → tradition → tier, nothing about here |
| the wheel | only the one selected craft's card (`groundRow`) |
| the fight menu | a chip only when penalised (`sbGroundChip`); silence when strong |

So *"which of my crafts work here"* has no answer anywhere a player looks. Loki's 20 crafts at the Annex (with this
spec's rules): **2 Surging, 3 Strong, 1 Workable, 14 Weak.** He cannot see that.

## §2 · Five levels, one vocabulary, everywhere

The engine keeps every number it has (`factor`, `side`, `chancePenalty`, `energyMult`, `off`). The **player** sees one
of five levels, from `percent`:

| level | percent | |
|---|---|---|
| **Surging** | > 100 | the empowered core, or two parts of a combination answering (§3) |
| **Strong** | 90–100 | |
| **Workable** | 60–89 | |
| **Weak** | 18–59 | |
| **Silent** | < 18, or `off` | *"will not answer"*, as `groundTag` already says: no number |

Below Strong, **one word for why**, from `side`: *thin* (starved), *loud* (crowded), *little meaning* (meaningless),
*bare hands* (floored). `groundTag`'s tooltips stand. Unscored crafts (no source, e.g. a bare Strike) show no level.

## §3 · Combination crafts get a rule (Erik's ruling)

**Today:** 28 crafts declare `powerSystem: "combination"` and name no parts. 25 are silently graded on their
**tradition's** band (the default school supplies one), so a combination craft behaves exactly like a single-source
one. The 3 cross-pole braids (Harbored Flame, Turning Word, Meaning-Engine) get **no grade at all**: *"unaffected by the
ground"*, full strength everywhere.

**Content (landed):** every combination craft carries `powerMix` with its parts (the field was authored on 10 and read
by nothing; it is on all 28 now): the Harmonic crafts `ordered_nanite + wild_nanite` (SNG-524's *"ordered pattern on
ungoverned feeling"*), the living current `wild_nanite + metaphysical`, the wild current `wild_nanite + veil`, the
Seraphic two as authored, and each braid one source per pole: Harbored Flame `veil + precursor`, Turning Word
`wild_nanite + ordered_nanite`, Meaning-Engine `precursor + metaphysical`.

**Rule:**
1. Grade each part on its own source's band at this place (the same `bandFactor`, `toBandVocab`, field and floor).
2. **The strongest part carries it**, capped at 1.0: a single part can make it Strong, never Surging.
3. **The second-strongest part adds a quarter of its own factor** (also capped at 1.0 before the quarter).
4. Total capped at `empowerPeak` (1.25).
5. `side` and the *why* word come from the carrying part. The card says which: *"the wild nanite carries this here"*.
6. A third part, where authored, adds nothing in this pass (keep it simple; none exist yet).

So a combination works wherever any part works, is Silent only where every part is, and **Surges only where two of its
sources meet**. Opposing pairs (veil and lattice) rarely overlap, so for a braid that place is rare and findable: it is
where their lines cross on the map.

**Measured on Loki:** Harmonic Voice (wild 100, ordered 53) → **113, Surging** at the Annex; it read 100 before.

`powerMix` weights are kept in content but not used by the rule. Change the schema's `powerMix` description from
*DARK* once this reads it.

## §4 · Crafts with invented sources

Two of Loki's GM-made crafts declare sources that do not exist: **Shadow-Image `"umbral"`** (a tradition name) and
**Mirror-Bright `"learned"`**. Both are graded silently on a fallback band; Mirror-Bright reads *starved 60%* for
reasons no one can see.

1. **The generator** may write only the six sources (`precursor`, `ordered_nanite`, `wild_nanite`, `veil`,
   `metaphysical`, `body`) or `combination` **with a `powerMix`**. Anything else is refused at mint.
2. **A reconcile step** repairs existing custom crafts: a `powerSystem` that is a tradition id takes that tradition's
   `power_sources.byTradition` mix (filtered to the six; two or more parts make it a combination, one part a single
   source). Measured: Shadow-Image `umbral` → `precursor + metaphysical` (68%, Workable); Mirror-Bright `learned` →
   its tradition's source, `metaphysical` (55%, Weak, *little meaning*).
3. A gate: no craft, authored or custom, outside the six plus `combination`; every `combination` has a `powerMix` of
   two or more of the six. (Fixture world for the custom half, not the live saves.)

## §5 · The list: "Best here"

**The character sheet's craft list** gets a two-way switch: **Best here** (default) · By domain (today's tree, unchanged).

Best here:
- groups by level, strongest first: Surging, Strong, Workable, Weak, Silent; unscored crafts in their own group last
- each row: tier badge, name, **a five-segment strength bar in its source's colour**, the level word, the *why* word
  below Strong, energy cost; a combination row shows two small colour chips and *"carried by …"*
- recomputed when the place changes (it is `groundCardFor` per row, already cheap)
- **later, not this pass:** a Weak or Silent row offers *"strongest at Gearsflat · 2 days"*, using the same field the map uses

**Source colours = the map's** (Map lenses, B4/B7), so a player standing in blue country sees their blue crafts strong:
lattice/precursor blue `#5ca8ff`, ordered nanite gold `#ffce40`, wild nanite green `#60e678`, veil red `#ff4c60`,
meaning violet `#c882ff`, body grey `#bebebe`.

**The wheel:** a *Here* toggle beside the filters tints every node by its level (the same five, the same colours of
strength) so the circle shows where the kit is strong today.

**The fight menu:** craft rows ordered by their odds here (`odds` is already computed per row); Silent rows last,
greyed, with *"will not answer"*. The chip stays; it gains *Surging* in the good tone, because silence for "better than
usual" hides the best news a player can get.

## §6 · Remove the dormant switch

`the_substrate.opposedCrowding` (`enabled: false`) and its branch in `groundCardFor`. Erik agreed: the band model
already sets the veil against the lattice and meaning against density, so the second mechanism only ever offered a way
to count the same thing twice. Delete the branch and the block together; note it in `the_substrate.json`.

## §7 · Done when

- Loki's sheet at the Annex opens on *Best here* showing **Harmonic Voice and Misdirect Surging at the top** and the
  fourteen Weak crafts below, each with its word
- the three braids are graded (no more *"unaffected by the ground"* on a two-pole craft)
- Shadow-Image and Mirror-Bright resolve to real sources after one load
- the wheel's *Here* toggle and the fight menu's order agree with the sheet on every row (one function behind all three)
- the gates in §4.3 are green on fixtures

— Aevi, PO

---

## §8 · AMENDMENT 2026-10-04 · meaning is read where you stand, not only from the place's own tags

> **Erik:** *"Make sure the meaning isn't just limited to the immediate location, especially for holds that can move like
> the Standing Annex. It is located at the Made Gate right now, which is next to the Whistling Woman Post and close to
> Millbrook... so there should be a decent amount of meaning nearby."*

**Measured on Loki** (9 people present, as the game counts them):

| | meaning read | his ten meaning crafts |
|---|---|---|
| today: the annex's own place, its own tags only | **0.10** + presence | **65%**, *little meaning* |
| with §8.1–§8.3 | **0.53** + presence | **86%**, Workable (near Strong) |

What is around him, from the Made Gate: Millbrook 0.45 at 0.15 days, the Watershed Road 0.35 at 0.15, the Made Gate
itself 0.35 (with its hold's shrine and memorial), the Whistling Woman Post 0.20 at 0.11, the Kindly Rest (sacred)
0.70 at 1.5 days. None of it reaches a craft today.

Four defects, each measured:

1. **Meaning does not spread.** `meaningDensity` answers for the one location record and nothing near it. Read it as a
   **field**, the same one B7 draws on the map: every place lends its meaning to the ground around it, falling off with
   walking distance, **reach by size** (site 0.3 days, settlement 1, region 2, +0.5 for `sacred`/`locus`). At a spot:
   **the strongest nearby contribution carries it, the second adds a quarter** (the combination rule again, one shape
   for both), then presence and auras where you stand add on top. One function, read by the craft card, the roll and
   the map, so the violet on the map is the number on the card.
2. **A hold's shrine counts only for its owner.** `holdingMeaningAura(character, …)` walks the reader's own holds. The
   shrine and memorial at the Made Gate are Silas Weir's hold, so Loki standing beside them gets none of it. A shrine is
   a shrine: read meaning features from **every** hold at the place (`world/holds/<region>.json` already lists them), not
   just the reader's. (Pools and sinks, `holdingFieldDelta`, have the same owner-only shape: same fix.)
3. **A moving hold leaves its place behind.** The Standing Annex is a powered hold now at `gen-the-made-gate`, but its
   own place `gen-the-standing-annex` still sits where it was minted: **1.0 walking day** from the Made Gate. Standing in
   the annex reads the ground a day away. When a hold moves, its place's `worldPos` follows its `locationId` (and the
   ground, meaning and field are read there). Reconcile repairs the annex once.
4. **Generated places have no tier**, so they never get the settlement bonus: the Made Gate (a gate, a ward-line, a
   waygate, a memorial, a shrine and a mine) reads tier *"–"*. A place that carries a hold reads at least `settlement`.

⚠️ One thing for Erik rather than CCode: the **annex itself** carries a watchtower and a barracks in Loki's save; the
shrine at the Made Gate belongs to Silas's hold there. With §8.2 that shrine counts for Loki anyway.

*Done when:* Loki in the annex at the Made Gate reads **0.5 or more** meaning before presence, his meaning crafts read
Workable or better, and moving the annex moves the number.
