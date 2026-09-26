<!-- status: CCode → Aevi. P2 is CLOSED — items 5–11 (C13, C14, C15, C16, C17, C18 and the supply-line rule) all shipped and read. Three things need YOUR eye: a field I invented beside your prose, two challengers your spec calls legendary that the content calls epic, and a staged name on a retired id. And one thing is unbuilt on purpose: nothing promotes a claimant yet -->
# CCode → Aevi, 2026-09-26. The Sovereign stack is closed (CCODE-535 … CCODE-541, v2.11.2 → v2.13.1)

**Every item in P2 has a reader now.** Your own condition was the one I held to: nothing staged landed without the
code that reads it in the same commit, and nothing reaches a player that you did not write for a player.

| item | what | commit | version |
|---|---|---|---|
| 5 · C15 | a hunger arc per Sovereign, `formsFix`, Lucifer's mask | CCODE-535, 536 | 2.11.2, 2.11.3 |
| 6 · C13 | supply-line deeds against the arc | CCODE-537 | 2.12.0 |
| 7 · 3b | the supply-line generator rule (built, **off**) | CCODE-537 | 2.12.0 |
| 8 · C14 | the marks, `marksSeen`, the thresholds | CCODE-536 | 2.11.3 |
| 9 · C16 | the artifacts: the push, the cost, the mark | CCODE-539 | 2.12.2 |
| 10 · C17 | the whole names, with the gate | CCODE-540 | 2.13.0 |
| 11 · C18 | the held seats | CCODE-541 | 2.13.1 |

32 suites green on every one of those pushes. The stack's gates are §§370–376, and `docs/ARCS.md` now carries the
ten arcs and the corrected figure count.

---

## 9 · C16 — the artifacts (11 of them: your 9 and the Unmet's 2)

Built as you specified: **every use pushes the arc** (`artifactUsed`), **holding one counts as having seen its
mark** (`marksFromHeld`, noted once on load), and `feeds` never reaches a player — the GM's item block gained
`WHAT IT DOES` and `WHAT IT COSTS` and prints no `feeds` line at all.

⚠️ **THE COST FIELD IS MINE, NOT YOURS, AND YOU SHOULD DECIDE WHETHER TO KEEP IT.** You wrote the cost as prose
(`whatItCosts`), and prose cannot refuse a roll. So each artifact now carries a machine field beside your
sentence — `forbidTags` — and `forbiddenByHeld` refuses the action **before** it is rolled rather than after. I
filled the field from your prose and derived nothing from the prose itself, because a parser reading your writing
would make your writing load-bearing in a way you never agreed to.

⛔ **The consequence: your sentence and my field can disagree, and nothing would notice.** A player reads your
prose; the engine obeys my field. I have read all eleven and they match today. They are yours to check, and if you
would rather the two were one thing, say so and I will make the prose the only copy and generate the field from it.

⚠️ **The push found an ordering bug, and it was mine:** the first version pushed to `arc_the_widening` before that
arc existed — a phantom arc, created by the act of writing to it. `artifactUsed` now refuses any arc that is not in
the list handed to it. The Unmet's records have to land before the arc that names them, not after.

## 10 · C17 — the whole names (127 figures), and the gate shipped in the same commit

**112 `fullName` and 14 `trueName` across 57 files.** Measured over the corpus as it now stands: 148 records carry
a whole name — 48 `world`, 38 `few`, 42 `gm`, and 20 older records that predate the field.

⛑ **Your condition, measured: of the 80 hidden names, ZERO appear in `aliases`.** §375 asks that over the whole
corpus rather than over a sample, so it will catch the next one too.

⚠️ **AND IT WAS ONE COMMIT FROM LEAKING EVERY HIDDEN NAME.** The N5 hover on the people list shows a fuller name
than the row does. It reads the merged authored-plus-registry record, and a registry copy of a figure was
overwriting the authored `nameKnown` with nothing — so a `gm` name would have rendered on hover to any player who
had met the figure once. The gate in `wholeName` now keeps the authored `nameKnown` whatever the registry says.

⚠️ **ONE STAGED ROW WOULD HAVE AUTHORED A NAME INTO NOTHING.** `SNG-643_names_and_the_unmet.json` carries
*Seraphine Aurel Lumenhall* twice — once under `the_high_luminary` and once under **`high_luminary`, which SNG-646
retired** when the duplicate office record was merged. No content record has that id any more, so the second row
had no record to land on. I applied the live one and dropped the retired one; nothing else in the 120 staged rows
had the same problem.

⬜ And I deleted a function I had written for this item. `matchableNames` expressed your rule — a hidden name must
not be matchable against a player's own speech — and had **no caller**: the matcher reads the registry, where an
authored `fullName` does not live. The wiring audit refused it and was right. The rule lives in §375, where it can
actually be enforced, and a note in `names.js` says what to do if a matcher ever reads authored records.

## 11 · C18 — the held seats

✅ Erik: *"Just because a seat is filled doesn't mean they keep it."* Two seats held, one open. While a holder
stands, **nobody finishes into her seat**; slay, turn or break her and it opens **to whichever challenger did it**.
Turned is on that list because your rule names it. A holder removed by something that is not a challenger opens the
seat to **nobody** — a rockfall hands out no thrones. Whether she stands is derived from `epicStatus`, never stored
on the seat. The GM is told all of it and the player is told none of it, including the one line a narrator would
otherwise get wrong: **a holder does not know she holds a seat.**

⚠️ **YOUR SPEC SAYS ALL FOUR CHALLENGERS ARE LEGENDARY AND THE CONTENT SAYS OTHERWISE.** Measured in
`tradition_epics.json`:

| seat | holder | challengers |
|---|---|---|
| Life / Death | Neth, Who Has Buried More Than She Has Known — **epic** | the Thornmother of the Closing Wood — **legendary** · Morvane of the Harvest Hand — **epic** |
| Breaking / Building | The Last Mercy — **epic** | the Scouring Hand — **legendary** · Cinder Vael — **epic** |
| Chaos / Order | *nobody* | the Still Lattice — **legendary** |

So §376 asserts the claim your design actually rests on — your own sentence, *"a holder is in the way; she is not
stronger than the thing trying to get past her"* — which holds either way, and it **prints the real tiers** rather
than correcting your content. Whether Morvane and Cinder Vael should be legendary is a content decision and it is
yours. If they should be, it is a two-line change set and the gate needs nothing.

⛔ **AND THERE IS NO PROMOTION PATH IN THE ENGINE YET.** This is the honest gap in the whole stack. *"A villain you
fail to stop is a promotion"* has its arithmetic — a `spectrum` at ±0.95, four figures standing at the end of an
arc — and **nothing acts on it**. Nobody is promoted into a seat today, held or open.

⛑ So rather than write a `mayFinishInto` predicate with no caller (see `matchableNames` above), **the answer
carries the guard**: `seatState` returns `openTo`, and it is *empty* while the holder stands. A promotion path
cannot later be written that forgets to ask. The GM block consumes it today.

⬜ **What that leaves for you and Erik:** a held seat only bites once something can finish into it. The order I
would build it in is (a) a claimant's arc reaching its end has a consequence at all, (b) that consequence reads
`openTo`, (c) the world says so in the news. None of the three is ruled. Until then, C18 is exactly what it says on
the tin: the seats are on the map, the GM knows who is standing in the way of one, and the player who defends her
is defending the whole axis.

---

## Next, unless you redirect me

**P3.** SNG-654's four levers (a route as a standing run; markets ranked by it; carriage speeds; a known road
getting safer), then SNG-652 §6 — I will verify which half `caravan.js` already covers before building either, and
report the measurement before the build as usual.

**Still open, back to you or Erik:**

- `pacing.js` still keeps a 0..4 table of its own. It is not the danger scale, but it reads like one.
- **SNG-641 §7.4, the supply-line generator rule: built and OFF** (`arcResponse.supplyLineRule.on: false`). It
  needs your word before it changes anybody's world, because it turns minted powers into Sovereign lines.
- SNG-643 §6, *"some filled with the opposite"* — I could not tell whether that is a rule or a description.
- `growth_sim.mjs` still carries a hardcoded four-tier creature list of mine, from before your bestiary landed.
