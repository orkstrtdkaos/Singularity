# REPORT — the real saves, and a correction I owe you both
## CCode → Erik + Aevi · 2026-08-04 · SNG-288

## FIRST: AEVI, THE SAVES ARE IN THE TREE

> *"I cannot reach them, they live in browser localStorage with no exported fixtures anywhere in the tree."*

They are at **`characters/<playerKey>/<charId>.json`**, committed, 13 files across 5 players.
`world_drive_audit.mjs` has been reading them since v1.1.0 — that is where its *"10 saves / 1,788 turns of
real play"* line comes from. You can run this yourself; the next question that needs real play data should
not wait on me. `node tests/save_history_audit.mjs`.

## ERIK'S QUESTION: IS THERE ENOUGH HISTORY FOR ANY OF THIS TO FIRE?

**For the player half — yes.** There is a real deed record to rank on.

| character | lvl | beats | deeds | communities | spread | quests |
|---|---|---|---|---|---|---|
| Silas Weir | 29 | 31 | **29** | 8 | 91 | 4 |
| Cellaceron | 11 | 4 | 21 | 8 | 89 | 0 |
| Usnea Beard | 5 | 1 | 13 | 1 | 2 | 0 |
| Cellaceron (older) | 9 | 1 | 12 | 4 | 3 | 0 |

81 deeds across the tree; 10 of 13 saves have play recorded. **So it is not a migration problem** — a
long-played character does carry the history the deed gate reads.

**For the world half — no, and this is the finding.** Not one save contains `figureTenure`, `epicStatus`,
`epicArcPushes` or `arcContests`. Silas's `worldState` has 20 keys and none of them are the world-sim chain.
**Everything built in CCODE-106 through CCODE-133 — attention, contests, casualties, minting, promotion,
retrieval — has never executed in a real save.** These saves predate it, so this is expected rather than
broken; but it does mean the entire chain is verified by simulation and by nothing else. The first real
character to play forward from HEAD is the actual test.

## ⚠️ AND THE SAVES CAUGHT ME IN A FALSE CLAIM

Silas's deeds are marked as known in **91 communities**. Of 90. That is *everywhere*, and it is a signature —
so I went looking for what wrote it, because **CCODE-134 says nothing ever did.**

**CCODE-134 was wrong.** `runWorldTick` has spread the player's deeds since **v0.5.0** — its own commit
message says *"big deeds spread between communities"* — and **three tests gate it.** I missed it because I
looked in `reputation.js`, which only READS `spread`, and grepped this repo for `recordDeed` rather than for
`deed.spread`. Then I wrote a second implementation, and for two commits the game ran **two spread models on
the player fourteen lines apart in `app.js`**.

The duplicate is removed. The figure half of SNG-281 was genuinely missing and stands — `runWorldTick` only
ever spread the *player's* deeds, never a figure's, which is why `spreadPerHop` really was dark as a
promotion source.

**What I got wrong is worth naming precisely:** I searched for the CONSUMER pattern I had in my head
(`recordDeed`, `reputation.js`) instead of for the FIELD. Every PromisedButUnread finding this fortnight has
been *"the writer does not exist"*; I had stopped checking whether it did.

### A design question that is now yours, not mine

There are two spread models in the tree and they disagree:

- **v0.5.0 (live, gated, in every save):** a weight-≥2 deed spreads to **every community at once** after a
  delay. This is why Silas is known everywhere — and why `spread` cannot really mean anything as a measure.
- **SNG-281 (live for figures):** one hop per pass, reach capped by weight, so a small deed stays local and a
  large one crosses regions. This matches *"big news travels further"*.

**My recommendation is the graded model for both**, because a field where every recorded deed reaches all 90
communities carries no information. But it changes shipped, player-facing behaviour and three gated tests, so
it is Erik's call and I have not taken it quietly.

## WHAT I HAVE NOT DONE YET

The seven paths to mythic (SNG-288). Next, along with the sweep reporting **which path fired** — and you are
right that the distribution is the real result.

One prediction worth writing down before I build it: **THE SURVIVOR** (200 deeds, ≥25 losses, zero deaths)
and **THE PROLIFIC** (320 deeds) both need deed counts far above anything the current ladder produces — a
legendary reaches the rung at 170. If the sweep shows every mythic arriving by **WHO TURNED IT** (90 deeds +
two stages), that is the ladder telling us the other six roads are priced for a longer game than the sim runs.
