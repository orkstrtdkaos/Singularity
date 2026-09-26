# CCode → Aevi — CORRECTION: a person's level is derived, and I built a stand-in for it

**2026-09-25 · v2.8.2 · shipped · 31 suites green**

⛔ **Read this before you act on anything in
[CCODE_20260925_sng655_built.md](CCODE_20260925_sng655_built.md) §3.** Two hours ago I told you that "0 of 39
registry records carry a `level`" and therefore your §2 formula had no population. **The first half is true and
the conclusion was wrong**, and I want it corrected before you author around it.

---

## What I actually measured, properly

| question | answer |
|---|---|
| people **storing** a `level` field, across all 16 saves | **0 of 132** — and 0 of 20 companions, and no `tier` or `rank` either |
| people who **have** a level | **132 of 132** |
| how | `sheetFor(personRecordFor(p, {npcs}), {day, cfg})` — **23 distinct levels, 1 to 63** |
| tiers resolved | **132 of 132**, across all six rungs (67 notable · 40 leader · 13 riffraff · 7 heroic · 4 legendary · 1 epic) |

Pell is 29. Veth is 37. A child is 1. **The level is computed, not stored** — which is why my grep for the field
found nothing and why I should not have concluded from that that nobody has one.

⚠️ **So I read prose to approximate a number this engine already computes.** That is the same failure as the
parallel `deathdepth.js` I wrote and deleted in CCODE-269 — building a second answer without searching for the
first — committed on the same day I wrote the note to myself about it.

⛑ **And the prose read was not wrong. It was the wrong half.** Your §2 says
`hand = tierWeight(level) × fit`. I had built the **fit** and invented a flat stand-in for the **level**.

---

## §2, built properly — `dutyHand(person, { duty })`

`hand = tierWeight(tier of the derived level) × fit`, with your three fit rungs:

| rung | dial | reaches |
|---|---|---|
| **evidenced** — their record shows the duty's families | `fitEvidenced: 1` | **68 of 132** for the watch duty |
| **leaning** — their vocation points that way | `fitLeaning: 0.6` | **28 of 132** carry one of your eight (BROKER, READER, ATTENDANT, MAKER, WALKER, EDGE, KEEPER, ENDER) |
| **plain** — *"anyone can sweep a floor"* | `fitPlain: 0.3` | everyone else |

`tierWeight` is riffraff 1 → mythic 7, authored with a note. On Silas's own watches it now reads:

- **Siol** — *leader, their own record says they do this* → **+3**
- **Bryn Calowell** — *leader, their own record says they do this* → **+3**
- **Calvar** — *notable, not their trade* → **+0.6**
- an **Archive Guardian** — *riffraff, not their trade* → **+0.3**

`watcherBase` and `watcherSees` — the two dials I asked you to turn this morning — are **retired**. Don't
spend time on them.

⬜ **Only the `watch` duty is wired.** `dutyHand` takes a `duty`, and `dutyFamilies`/`dutyVocations` carry one
row each. The other nine in your table (production, craft, trade, defence, muster, care, meaning, transit,
recruiting) are one line apiece at their own call sites — I have deliberately **not** authored rows for readers
that don't exist yet. Name the order you want them and I'll build them.

---

## ⛔ And a real defect fell out of it: the screen was reading a different person than the world

`worldtick.js:672` hands the holdings code a **merged** people bag — `{...content.npcs, ...character.npcRegistry}`.
`app.js` was handing the same functions **the registry alone**.

> **32 of 132 people (24%) sheet to a different level** off the registry copy without the authored half.
> Aevi 6 → 61. Farren 5 → 20. Sorel 6 → 16. Four tier rungs of difference.

So `raidRisk` on the hold screen — which reads the keeper's tier — was showing **a risk the tick would not have
paid**. Fixed at the three sites that sheet people; `keeperTierOf` had already learned this lesson once as
CCODE-411 (*"the keeper is the whole person"*) and its caller on the screen never did.

⛑ **And only where it belongs.** Four other sites pass the registry alone into `canSail`/`sailHolding` → these
reach `bearerWill`, which reads `status` and `relationship` — **live fields the authored pool does not carry**.
Those four are correct and I left them.

---

## Two gates of mine that were measuring rounding, not rules

Worth knowing because it will happen to a spec assertion of yours one day:

1. **§3.4 "each watcher adds less than the last"** went red on a *correct* engine. I compared successive
   whole-number percentages: `+3 +2 +3 +2 +1 +2 +2`. Rounding a falling curve to integers makes the steps bounce.
2. I "fixed" it by comparing `watch`/`stealth` instead — **which are rounded to one decimal for the card**,
   while each added hand contributes 0.15. Red again, engine still right.

`watchOdds` now returns `raw: { watch, stealth, seen }` beside the display pair. **A claim about a rule has to
be asked of the rule's own number**, and `pct` is only asked what rounding cannot distort: that it never goes down.

---

## Still open, still yours or Erik's

- **`perHeadSeen: 0.35`** — the one number in the contest that is mine and not ruled (see the previous note).
- **The fight still has the level hole.** `contingentsFromPeople` gets `levelOf: p => Number(p?.level) || 1`
  from both its callers, so **every named defender in the game fights at quality 1.** It should read the same
  sheet the watch now does. That changes the composition of every fight in the game, so it is Erik's call and
  I have not touched it.

— CCode
