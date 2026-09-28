<!-- status: SNG-645 — batch 1 applied; batch 2 (the eight home cities) written and HELD on §359; batch 3 (foothill reach) next -->
# SPEC SNG-645: powers in the home regions

**Aevi (PO) · 2026-09-24 · v2.5.x** · change set: `po/staged_content/changesets/SNG-645_powers_in_the_home_regions.json`
(9 powers, 3 new leaders; the changeset check passes 14 of 14, and every SNG-634 power check passes)

> **CCode (CCODE-483):** *"8 of 38 regions have a power that holds them… Four of the sixteen saves therefore hear of
> nothing in their own country."*

**These are the six regions characters on this device come from.** A new character now hears of powers at home. The
four sovereignties are legion-scale, so their names travel and are heard of from anywhere: the Glass Assembly, the
Moot, the Court and the Schedule.

| region | power | kind · temper | leader | Sovereign tie (GM) |
|---|---|---|---|---|
| **Radiant Wastes** | **The Unshadowed**, the zealots inside the Blaze | order · cruel | Valen Sunwrack | ⚑ **Lucifer's line** (being seen) |
| | **The Glass Assembly** of Glasshome, which holds the border against the Blaze with lenses | sovereignty (council) · fair | Solvace | — |
| **Somatic Reaches** | **The High Temple of the Body** | order · fair | Master Taro | — |
| **(the Cogitarium)** | **The Custody of the Vacated**, which keeps the bodies Cogitants leave behind and sells the unpaid ones | order · hard | ✚ **Custodian Vantrel** (Anthel Mnes Vantrel) | ⚑ **the Unbodied's line** (vessels). Her buyer is the Undercount's Dusklow fence (SNG-640) |
| **The Quickwood** | **The Grovehome Moot**, which has never decided anything in a hurry | sovereignty (moot) · kind | the One Who Called the First Moot | Thornmother (a challenger for the Life seat) opposes it from the Heartroot |
| **The Making** | **The Ceaseless**, builders who cannot stop | order · hard | Cinder Vael | Cinder is a challenger for the Building seat, so her order is her road there |
| | **The Court of the Unfinished Plan**: the best plan each season governs | sovereignty (contest) · fair | ✚ **Planmaster Wyncote** (Tavin Esme Wyncote) | — |
| **The Gearlands** | **The Schedule of Pressureholt**, a written specification for everything | sovereignty (specification) · hard | ✚ **Chief Kettering** (Vasser Hester Kettering) | — |
| **The Numinous Reach** | **The Long Choir**, which sings people gently out of their bodies | order · **kind** | the Choirmaster Who Would Not Return | ⚑ **the Unbodied's line**. **A kind power feeding a Sovereign**: the lore's *"individually reasonable, cumulatively impossible"* |

**Balance.** The tempers split one cruel, three hard, three fair and two kind. There are three supply lines, all
placed by the ruled rule (SNG-641 §6): one per Sovereign per region, and only where the power fits the hunger. Each
region has a rival pair where it has two powers: the Unshadowed against the Glass Assembly, the Temple against the
Custody, and the Ceaseless against the Court.

**Who else lives at the Cogitarium.** Three people are already there, and each has an angle on the Custody:
- **Archivist Lom** knows the Long Hall's record.
- **The Cogitant Ninefold** is its most likely next customer.
- **Sesh of the Quiet Blow** is from the hard school, and the only one likely to break a custodian's arm.

None of them is edited. They are hooks for the GM.

**What's left:** 24 regions with no power. I'll do them next, in batches, heaviest-travelled first.

— Aevi, PO

---

## Batch 2 · 2026-09-28 · the eight home cities (written; held on one test)

Measured on origin: **19 of 38 regions had no power**, 8 of them the peoples' own home regions. These eight are
staged at `po/staged_content/SNG-645_batch2_home_cities.json`, ready to append to `powers.json` as-is (every field
already has a reader; census `invalid:power` stays 0; content CI green).

⬜ **CCode: held on `how_it_works` §359.** The power generator's dry-run test takes its fixtures from the **live**
empty regions (`empty = REGIONS.filter(r => !held.has(r))`). Filling the eight home regions leaves only the 11
one-place foothill towns, which don't carry the tags the checks need, so 5 checks go red on correct content. Please
run §359 on a copy of the content with powers stripped (or a fixture region set), so the generator is tested
regardless of how much of the map is authored. Then I apply. Leaders are existing figures; no new people.

| region | power | kind · temper | leader | against |
|---|---|---|---|---|
| the Kept Reach | **the Keepers of the Slow Hour** | sovereignty (council) · fair | the Clockmother | the Hour-Hoarder |
| the Open Reach | **the Wayhouse Compact** | sovereignty (moot) · kind · roads safer | the Farwalker | the Gate That Gapes |
| the Given Land | **the Bedrock Assize** | sovereignty (court) · hard | the Cornerstone | — |
| the Pattern Reach | **the Hand of the Open Figure** | order · fair | the Open Figure | (the Untethered, its pure pole) |
| the Reasoned Hold | **the Bloodless Hold** | order · **cruel** · lifts danger | the Final Argument | Quillon Vey's unrefuted proof |
| the Stark Reach | **the Keepers of the Told Ground** | order · kind · roads safer | the Archive That Walks | (the Flensing) |
| the Feeling Coast | **the Halls of Wellspring** | sovereignty (council) · kind | the Weeping Archive | the Raw Chord |
| the Veiled Reach | **the Court of the Turned Coat** | sovereignty (court) · hard | Illeth, Queen of the Turned Coat | (the Last Mask) |

**Balance:** one cruel, two hard, two fair, three kind. **No `feud`** on any of them, so none starts a one-sided war
(SNG-662's lesson). **No supply lines:** none matches a hunger, so the supply-line measurement is unchanged (10 lines).
**Seraphine the Unbending Witness is deliberately not a leader** while Erik's Sera/Seraphine question is open.

**What's left:** the 11 foothill towns (one place each, danger 1). A foothill town doesn't need a power of its own;
I'll give each one a reach from the nearest power instead, in batch 3.
