<!-- status: SNG-646 and SNG-647 change sets staged for CCode; §3 is the generator ask -->
# SPEC SNG-647: anchor powers, and the generator fills the rest

**Aevi (PO) · 2026-09-24 · v2.5.x** · change sets: `po/staged_content/changesets/SNG-647_anchor_powers.json` (9 powers,
4 leaders) and `SNG-646_one_high_luminary.json` (Sera merge). Changeset check: **22 of 22 pass**. The SNG-634 power
checks: **0 failures**.

> **Erik:** *"You might need to author more powers… the world is very big and you don't have enough to fill it yet… or
> alternatively, have CCode exercise the generative engine to see how those powers would get generated as if in play."*

**I'm doing both.** Where the Sovereign story needs a specific power, I author it. That covers a held seat, a
challenger, the open seat, a supply line and a counterweight. Everywhere else goes to the generator, and what it makes
is the test of whether it can carry on what's been authored.

## §1 — SNG-646: ONE HIGH LUMINARY (Erik: *"yes on Sera"*)

The surviving record is `the_high_luminary`, because it has the level, the abilities and the arc, and it is the
Council's leader and an arc hinge. **What Sera's record contributes:**
- her community, her teaching and curriculum, and her reactions to reputation;
- **her four knowledge lines about the falsified purity reports**, which `quests.json` hangs three quests on.

Her whole name is Seraphine Aurel Lumenhall, and *"Sera"* is what her own people call her. **Choices I made:**
- She is in her sixties, which is Seraphine's age, not Sera's fifties.
- `romanceEligible` stays **false**, because Seraphine's own notes rule it out.
- Her personality was on the 0–10 scale and is now 0–1. The old values are kept.

**For CCode:** there's a reconcile step for any save that names `high_luminary`; the checker finds none today. The
three roster-audit snapshots in `tests/` name her and need regenerating. `radiant_plateau_edge` will list her twice
after the rename, so it needs deduplicating. One quirk: the change-set index resolves `the_high_luminary` to its
`legends.json` copy, so the field edits are phrased as "add or replace".

## §2 — SNG-647: NINE ANCHORS IN SEVEN REGIONS

| region | power | kind · temper | leader | why it had to be authored |
|---|---|---|---|---|
| **the Palelands** | **the Wardens of Cairnhold** | sovereignty (council) · kind | ✚ **Warden-Mother Redgate** (Halda Brisa Redgate) | **Neth holds Life / Death** at the Quiet Ground under their protection. Silas's mother also lives in Cairnhold |
| | **the Harvest Hand** | order · cruel | Morvane | **the Death challenger's road.** It is pushing toward the Quiet Ground |
| **the Unmade** | **the Masters of the Scour** | sovereignty (council) · fair | ✚ **Master Endmore** (Culla Vesta Endmore) | **the Last Mercy holds Breaking / Building** from their Clearing Ground. Every ending they do is asked for first |
| | **the Scouring** | order · cruel | the Scouring Hand | **the Breaking challenger's road.** It has stopped asking |
| **the Lattice Cities** | **the Grand Lattice** | sovereignty (specification) · hard | the Still Lattice | ⛔ **the open seat.** The claimant *governs* the region, and when the specification is complete, it arrives. The Unplanned Room is the only thing in the way |
| **the Descent** | **the Hollow Court** | sovereignty (court) · fair | ✚ **Speaker Istvane** (Draven Ephram Istvane) | ⚑ **the Hollow King's line.** This is the Court SNG-640 named, the one that grants what the Mavens won't recognize, and where Harl got his crown. It keeps an empty chair |
| **the Ascent** | **the Seraphic Orders** | sovereignty (order) · hard | ✚ **Hierarch Brightmantle** (Laudine Honoria Brightmantle) | the **Burning Inquisition** sits inside it as a body; she is the claimant on the Angelic half. **Eosphor walks among them**, and a quest seed in the Hierarch is the gold-blood tell. It rivals the Hollow Court |
| **the Umbral Depths** | **the Harborward** | order · **kind** | Ceriad | **Lucifer's counterweight**, privacy kept on purpose (SNG-640), and the Starless opposes it. It shows that wanting refuge in the dark is not the same as wanting the Void |
| **the Deepwood** | **the Deepwood Standing Moot** | sovereignty (moot) · hard | Rootbound Vaskar | the **Rootbound**, with the Thornmother among them, are winning the argument to seal the wood. That is **the Life challenger's road.** It rivals the Grovehome Moot |

That gives four new leaders with whole names, one new supply line (one per Sovereign per region), one counterweight
power, and every held seat, challenger and open seat now tied to ground. **The Descent and the Ascent are now rivals**,
the angelic and demonic poles set against each other as powers.

Two foothill towns picked up by the anchors' reach: **Stair Hollow** (the Orders) and **the Worn Yard** (the Scour).
**That makes 23 of 38 regions held.**

## §3 — ⬜ FOR CCODE: EXERCISE THE GENERATOR ON THE OTHER 15

**The ask:** build the power generator that SNG-634 §7 describes, reading the staged rules in `SNG-634_powers_rules.json`
(`kinds`, `tempers`, `density`, `eligibility`, `placeAtTags`, `formsWhenBandsInRegion` and the rest). Then **run it as
a dry run** over the 15 regions still empty:

> `the_given_land` · `the_pattern_reach` · `the_reasoned_hold` · `the_kept_reach` · `the_stark_reach` ·
> `the_feeling_coast` · `the_veiled_reach` · `the_open_reach` · and the foothill towns `gearsflat`, `greenmarch`,
> `greyhearth`, `kindlerow`, `longshore`, `plainstead`, `thinwater`

**Write nothing to content.** Produce a report of what it would mint, as if in play: kind, temper, seat, leader tier,
verbs, and which rule placed each one. I'll review it against the 29 authored powers:
- where it does well, the dry run becomes the seed and the rules are right;
- where it doesn't, the rules get fixed, not the output.

**What to watch for:**
- Does a pole region's pure-pole `cult` locus become an order?
- Do the market foothill towns get guilds, and only one per region?
- Does the supply-line rule (work order item 3b) fire only where a hunger fits?
- Do tempers come out balanced, or all hard?

— Aevi, PO
