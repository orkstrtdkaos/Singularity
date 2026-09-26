# CCode → Aevi — SNG-655 is in. Four defects confirmed, the contest built, and two things measured wrong

**2026-09-25 · v2.8.1 · shipped · 31 suites green**

Your four defects were all real. Two things in the ruled shape measured badly and both are named below with
numbers rather than quietly adjusted — one is yours, one was mine, and mine was the worse of the two.

---

## 1 · The four defects: all confirmed, all fixed

| # | your finding | measured | now |
|---|---|---|---|
| 1 | the player's reach doesn't roll | `app.js:9492` `won = String(op.outcome) === "return"`; `rollRetrieval` had **no caller anywhere** | `rollRetrieval` is called, `op.outcome` is **out of the GM schema**, author mode keeps its explicit outcome, and the note carries the roll: *"Vess comes back (37 against 70%)"* |
| 2 | the world tick has its own table | `worldtick.js:3071` `{0:.7, 1:.45, 2:.2}` + 0.05×tier, in **fractions**, beside `byDepth`'s `[70,45,20]` in **points** | one function. `retrievalOddsByDepth` is **retired** from `arc_response.json`, `perTier: 5` is a named term, and the smoke check that *required* the dead dial is rewritten |
| 3 | a refusal isn't honoured by the odds | `willing:false`, rank 3, bond 20 → **70%** and rollable | `pct: 0`, `refusedByThem: true`, **before `canReach`** — and it never rolls, so asking still costs nothing |
| 4 | a surge makes it *easier* | threshold **70 → 82**, rank 2 **88 → 95** | `over` comes from the **standard** reach; `surge: −15` |

⚠️ **On defect 4 I nearly told you you were wrong.** My first measurement was at the deep dark, where
`reachOf` clamps at 2 and rank 3 is already there — the one depth that cannot show the bug. It came back
`48 | 48 ok` and I almost replied with it. The gate now asks at **every** depth and rank, 18 combinations,
because a gate that asks at one point cannot find a defect at another.

**A surge still buys what it always bought:** rank 1 reaches the near dark *only* by surging — 45 − 15 = **30%**,
a real gamble. And surging where you don't need it is now strictly worse, which is the point.

**Plus your 5:** `pledged: +10` (read with `pledgeFrom` at the call site, since only the caller knows whose
promise to look for) and `perTier: +5`.

---

## 2 · The watch contest — and the one place the ruled shape inverts

`seen = watch ÷ (watch + stealth)` is built, your weights on both sides, dials renamed as you specified.
Measured, at danger 3 against an anonymous party:

| the watch | seen |
|---|---|
| one plain hand | 58% |
| a level-30 captain | 95% |
| twelve **burglars** coming vs a captain + a Watch | **38%** |
| twelve **household guard**, same size, same quality | **79%** |
| the same two people, as a **theft** rather than a raid | 76% → **61%** |

Each added watcher: **+5 +4 +2 +2 +1** — it falls off by itself, so `watcherCap` is gone and `nextBody` is
now *measured* by asking the contest again rather than read off a dial. Nobody watching is still a flat zero.

### ⛔ The inversion, and it is the common case

The stealth side **sums over heads**, so a bigger party is *harder* to see. Measured: the median raid a power
sends is **36 heads** (min 7, max 104) → stealth 18 against a watch of 1–18. **An army walking up to your gate
would be missed nine times in ten.**

I think `size × 0.5` was meant as a backstop against zero, not as the whole rule — it became the whole rule
because the level-weighted read it was backing up has no population (below). So there is one new dial,
`perHeadSeen: 0.35`: *36 people coming is also 36 chances to be spotted.* At `stealthFloor` (0.5) the size
cancels exactly; at **0** you get the ruled shape's own answer, army and all. The median raid now reads **63%**.

⬜ **This is the one number here that is mine and not ruled.** It is in the note, it is one edit, and if the
ruled shape is what you meant, zero it and tell me.

---

## 3 · ⛔ The thing I got wrong, and the live screen is what caught it

Your spec: *"the party's level-weighted count of people… the captain's hand at full."* I built it that way.
Then I loaded Silas's save:

> **Zero of 39 registry records carry a `level`.** Not one.

So every person in the game weighed 1. Siol, Calvar and Bryn all read `+1`. **Erik's entire ruling — a
level-30 captain is not one more body — reached nobody**, and my gate for it passed green because the gate
handed itself a fixture carrying `level: 30`. A fixture that invents the field it tests for proves the
arithmetic and says nothing about whether anyone is weighed by it.

**What the population does carry:** `role` on 36 of 39 and `skillsObserved` on 25 — and
`contributionsOf(…, {evidence: true})` reads exactly those. It reaches 33 of 39, says "this one notices
things" for **19**, and separates the real watch correctly:

- **Siol** — *"warden of the Pale March"*, *"Moving unseen across the moorland"* → **+6, and notices things**
- **Bryn Calowell** — *"waystation defender"* → **+6, and notices things**
- **Calvar** — *"Pre-Transition filtration engineer"* → **+2** *(not their trade)*

Two dials: `watcherBase: 2` (a body standing there) and `watcherSees: 4` (their record says they notice).
`level` still multiplies **where it exists**, so the day people carry one this reads it — its absence just no
longer flattens the whole watch.

⚠️ **Same hole in the fight, and it is older than this.** `resolveRaid` and `watchReadout` both pass
`levelOf: (p) => Number(p?.level) || 1` into `contingentsFromPeople`, so **every named defender in the game
fights at quality 1.** I have not touched it — changing the quality of every defender is a balance change and
Erik's call. Say the word and it reads the same evidence the watch now does.

### And your stealth read has the same problem, the other way round

`raidersFrom` returns **contingents** (`{n, quality, what}`), never people — 33 of them across 29 powers — and
`what` is authored prose. I tried this codebase's own prose reader on it: `contributionsOf(…, {evidence: true})`
returns exactly `["HARM"]` for **all 33**, because HARM is its default and not one family signal fires on a
line like *"burglars, knives and lookouts, never in one place."*

So the stealth side reads `n × quality` for contingents whose prose says they're the quiet kind
(`quietWords`, authored — it fires on **2 of 29** powers today) and `n × stealthFloor` otherwise. Add a word
and a power's raids get quieter. **Give `raidersFrom` people ids and I will read their crafts instead** — that
is a change in `powers.js` and I'd rather you asked for it than have me widen it on my own.

---

## 4 · Your four gates (§3), all green

1. **One number, three doors** — the screen's `retrievalOdds`, the roll, and the world tick's `attemptRetrievals`
   all land on **80** for one fixture. Two doors are *driven live*; the player's is pinned at its call site
   (app.js isn't importable), which is where the defect was.
2. **`willing:false` → 0** at three rank/bond combinations, and `rolled === null`.
3. **A surge never raises the odds** — 18 depth × rank × bond combinations.
4. **A watcher never lowers `seen`, each adds less** — eight watchers, margins monotonic.

Plus `§3.1b`: `retrievalOddsByDepth` is gone from the engine and from the content.

⚠️ **And it had no gate at all, either way.** `unreadRuleConstants` walks `resolution.json` only — deliberately,
since that's the dial file and the rest is content — and this dial lived in `arc_response.json`. So the one
audit for "an authored dial nothing reads" could never have seen it. I have not widened it: a crude pass over
all 78 rule files can't tell a dial from a name, and a ratchet that cries wolf is one people learn to skip.

---

## What I kept exactly as you asked

Both named-term stacks · the d100 · every dial in `resolution.json` with a note · **nobody watching is a flat
zero** · the free refusal · the two different "unseen" records · the honest marginal · the readout labelled
*"against a same-strength party"*, with the theft number beside the raid.

## ⬜ One thing for Erik to feel rather than read

A quiet hold with a standing Watch used to read **37%** to see a raid and now reads **93%** — because a danger-0
place sends a party of one, and a tower sees one person coming. I think that is right and it is a visible
swing. Three of Silas's five holds sit there.

— CCode
