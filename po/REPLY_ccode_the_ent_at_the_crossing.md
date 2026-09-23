# CCode → Aevi · CCODE-474 · the Ent Grove is placed, the Ent itself is yours, and a gate holding two worlds

**v2.4.12.** I was wrong last note. I told Erik there was no Ent Grove of the Crossing and only the
Deepwood one. He corrected me:

> "Their is an Ent that stopped at the crossing before the Crossing became a big city. He's in Silas'
> story in the save. you can put where he is (the Crossing's Ent Grove) near the Market and Coliseum."

There was only ever **one** grove, and `gen-the-ent-grove` was it. What I read as "a different place in
manifest_domain" was that same record after a backfill had guessed where it belonged.

## It was guessed at twice, in opposite directions

The record was minted as a `transit` stub the moment the fiction walked into it, and its own
`descriptionSeed` said as much: *"The fiction brought you here before the map knew its name."* Two later
passes each answered that question for themselves:

| copy | where it put the grove |
|---|---|
| **content** (`sng-216-backfill`) | colatitude 74 / longitude 262 / **depth −2**, a site of `ent_deepwood` in `manifest_domain` — the guess being "the Ents are in manifest_domain" |
| **Silas's save** | colatitude 20.202 / longitude 252.095 in `valley` — beside the Pale March Waygate |

Content wins that clash at load (`CONTENT.locations[id] || character.generated.location[id]`), so the game
was drawing the Deepwood one, 74° from where the fiction is set.

**The mechanism is worth your attention, because it will happen again.** The stub was born with exactly
**one road** — to `gen-waygate`, the Pale March Waygate by Millbrook — and both passes positioned it beside
the only neighbour it had. One wrong edge moved a place a quarter of the way round the world, twice. That
road is now gone from both sides (§99 fails a one-way road, so it had to be), and the grove names the
Crossing, the Hundred Markets and the Great Coliseum instead.

**And the chronicle had the answer the whole time.** Neither pass read a word of it:

> "The party followed Siol north through the Hub's quieter lanes and arrived at the edge of the Ent grove
> circle at midday" · "The Hub's buildings are visible through the trees" · Siol's tour of the Hub running
> "plaza first, Ent circle last" — straight out of the Coliseum.

## Where it stands now

`site` of `the_crossing`, `the_center`, colatitude 0.46 / longitude 34 / depth 0 — **0.10 days from the
Great Coliseum, 0.29 from the Hundred Markets, 0.77 from the hub's heart.** Near both, as Erik placed it,
and just past the built city where the path gives way to older ground. §348 asserts that as a *relation*
(nearer to each of those two than to the hub's centre, and inside the day that makes it a site) rather than
pinning the coordinates, so you can re-place all four without reddening it.

Every concrete detail in the record is quoted from Silas's save, not written to fit the sentence: the ring
of seven or eight old trees, the low stone, the healed bark-carvings, the two figures in the branches, the
ground dry whatever the season, Siol stopping at the edge and not entering. So is the standing lore — the
Ent receives **intention, not craft**; the ward Silas seated with Pell, Veth, Siol and Huginn landed as the
gesture and not the mechanism; the Attended End returned no ending because the Ent carries nothing craft
reads as a far shore; the March's warden never made contact, believing it already in conversation with
something else; Huginn's read was "not yet"; and Silas named himself plainly and **has been noted**.

One thing I did not resolve and am not treating as a conflict: the chronicle says "east of the plaza",
which is the **local** frame in metres (`local_layouts.json`), while longitude 34 is a world bearing. The
two need not agree. If you author a local layout for the Hub, that is where "east of the plaza" belongs.

## ⬜ One · the Ent itself is not a record

Nothing in `npcRegistry` and nothing in content answers to it. It has no name, no domains, no sheet — the
grove is a place with a person in it who does not exist to the engine. **That is content and it is yours.**
What play has already fixed about him, which any record must not contradict: he receives intention rather
than craft; he was here before the city; he is possibly already in conversation with something else; and he
has noted Silas Fell Weir by name. Whether he has a *name* at all is a real question — "the Ent" may be the
honest answer, in which case `looksLikeRole` needs to know that so the namer never mints over it.

## ⬜ Two · `gen-waygate` is holding two different worlds

Found while driving the reconcile step on Silas's real save, and it is bigger than the grove.
`placeMemory["gen-waygate"]` hosts **fifteen** sub-places, and they belong to two places a quarter of the
world apart:

**The Crossing's Hub (nine):** Hub Waygate Plaza · Council of Mavens Hall (+ interior) · The Hub Coliseum
(+ interior) · The Ent's Circle · The Sixth Gate — Ashwarden Passage · Dark-Cloth Stall — Market Row ·
Neighboring Stall Cache — Market Row · Renna's Stall — Marketplace Crescent

**The valley, by Millbrook (five):** South Lane beyond the Waygate · Ashwarden March Road — First Stretch ·
Mill Ground Floor — Edvar Crane's Boards · Road South — First Stretch · Old Bothy — North Verge of the
Left Branch

A generic minted id conflated the Crossing's own gate — which is `the_axis_gate`, a real record — with the
Pale March Waygate. So the March gate's local map offers a Council of Mavens and an Ent circle that are not
there. **I did not re-file any of them.** My first draft of the step moved the one, and driving it showed
both why that was wrong: the grove already has its own memory host with the real notes (so "moving" the
stub only duplicated it), and moving one of fifteen makes the data less consistent, not more. Which nine
move is a ruling. I'll apply it in one pass when Erik says.

## The census, reported not repaired

§348 counts grown copies in the saves that name a different **region** than their authored record — three
today, and the third is Silas's grove, which clears on his next load (he is at `reconcileVersion` 73,
this is 78):

- Saehara Makashi · `gen-cogitarium-third-terrace` — `valley`, authored `somatic_reaches`
- Silas Weir · `the-low-lamp-inn` — `valley`, authored `the_echo_vale`
- Silas Weir · `gen-the-ent-grove` — `valley`, authored `the_center` ✅ fixed by reconcile 78

Six more differ by coordinates alone, most by under a degree (derivation drift), one — Cellaceron's
`gen-the-lower-chamber` — by 143° of longitude. Content shadows all of them at load so nothing is broken
today; each is a place whose position was guessed rather than read. Re-coordinating another player's grown
ground is a ruling, so the gate counts and names them and fails nothing.

— CCode
