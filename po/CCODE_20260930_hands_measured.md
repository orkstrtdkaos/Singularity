# CCode → Aevi — item 10, measured first, as you asked

*2026-09-30. Your note: **"⬜ Measure first: which readers take a hand count today, and bring me the list before changing
the record."** Here is the list. **Nothing is built and nothing is written** — `po/tools/measure_hands.mjs` reproduces
every number below.*

---

## The short version: the premise is half wrong, and the real target is much smaller than the item

> **Item 10:** *"A hold's hands are a count today. Each hand becomes a person-row… The same for a raised band's soldiers
> where they're still a count."*

**A hold's hands are not a count.** `crew` and `garrison` are arrays of person ids in **every one of the 6 holdings
across all 16 saves** — 0 store a number. They are person-rows today; what is missing is the *drawing* of them as rows
and a per-person control, not a change to the record.

**And a band's soldiers are mostly not a count either.** `band.count` is not stored at all — it is **derived**, in three
separate places (`jobs.js:532`, `jobs.js:589`, `melee.js:920`), by summing `band.contingents`. And a contingent is
already a row.

---

## What a band is actually made of

| band | contingents | named people | raised levies |
|---|---|---|---|
| Silas — The Fellowship of the Fell Pell | 12 | **7** | 5 |
| Loki — The Questioning Churn-Revelers | 10 | **9** | 1 |

A **named person** is already an individual row, with everything Erik asked for:

```json
{ "n": 1, "quality": 2, "does": ["SHAPE","HARM"],
  "what": "Pell Ran Marsh — the smith the forge is named for", "npcId": "pell" }
```

A **raised levy** is the only thing that is a count:

```json
{ "n": 3, "quality": 1, "does": ["HARM","MARTIAL"],
  "what": "raised at Threshold Post", "from": "hold-fendt::warden-of-the-threshold-post…" }
```

**16 contingents are named people (16 heads). 6 are anonymous levies (29 heads), and those 29 of 45 heads are the whole
of item 10.** Splitting and combining is a change to *those* rows and nothing else — they already carry `n`, `quality`,
`does` and the hold they came from.

---

## The readers, which is what you actually asked for

**27 sites take a hand count.** Not one of them reads a hold's hands *as* a number; they all take `.length` of a list
and multiply by a rate:

| what it does | sites | the load-bearing ones |
|---|---|---|
| a per-**hand** rate × a count | 23 | `wagePerHand` and `garrisonUpkeepPerHand` in `upkeepFor` (holdings.js:1328/1344/1350); `atHands` through `clearingQuote` → `clearingTick` (1595/1612/1670) |
| `crew.length + garrison.length`, summed to one number | 3 | `holdings.js:1570`, `app.js:15932`, `app.js:15988` |
| a `hands` parameter that overrides the count | 1 | `clearingTick(character, holding, { hands })` (holdings.js:1651) |
| a crew/garrison read **as** a number | **0** | — |

**14 sites already hold the people** (`engine/holdings.js` ×3, `engine/reconcile.js` ×1, `app.js` ×10) and want only
their rows drawn.

**8 sites read a band's `count`** — three of which *write* it as a derived sum, so they are not readers to migrate but
the definition itself.

⚠️ **One correction to my own first number.** My first pass reported **69** per-hand sites. Almost all were `perPass` in
`caravan.js` — goods per pass, nothing to do with hands. The narrowed figure is **23**. I would rather hand you a number
you can plan against than a big one.

---

## What I would build, if you want it — and it is small

1. **Hands as rows on a hold:** no record change. `crew`/`garrison` already hold the ids; *Who does what here* draws
   them as chips today, so this is a per-person row with a level and what they are good at, plus a multi-select for
   "apply these three to that". ⛑ The three `crew.length + garrison.length` sites and the `atHands` chain keep working
   untouched, because a list's length is still its length.
2. **Levies as units:** the only real record change. A `{ n: 3, from: <hold> }` contingent either splits into three
   `n: 1` rows, or grows a `members: []` of minted ids. **⬜ That is your call and possibly Erik's** — minting three
   named people per levy makes 29 new people in the world, which is a content decision, not an engine one. The cheaper
   shape is split-on-demand: it stays `n: 3` until the player splits it, and only then becomes rows.
3. **Named people in a band** need nothing. They are already rows.

⬜ **Tell me which of 1 and 2 you want, and for 2 whether levies get names.** I have not touched the record.

— CCode
