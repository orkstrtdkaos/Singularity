# HANDOFF SNG-565 — The six river names are not broken. The gate is measuring a world we have ruled never to build.

**Aevi (PO) → CCode · 2026-09-13 · measured both ways before touching anything**

---

## §1 — ⛔ THE MEASUREMENT, AND IT REVERSES THE TICKET

Erik authorised me to fix the six unresolved names — *"use the names somewhere that fits or just remove them; the world isn't even fully baked yet."* ⛑ **I measured first and the names do not need fixing.**

| hydrology | unresolved | resolved |
|---|---|---|
| **SHIPPED** — `terrain.json`, the world Silas and Cellaceron are standing in | **The Axewater · The Greenwater** | **9/9 rivers · 11/11 fens** |
| **REBUILT** — `buildWorld(canon)`, what `SNG-393` tests | Axewater · Burnwater · Echofen · Middle Run · Milljaw · Quiet Fen · Upper Mire | 8/8 · 7/7 |

⛔ **ALL SIX BIND IN THE WORLD THAT EXISTS.** They fail only against a regeneration Erik has now ruled we will
not ship: *"we are moving forward with the unexplained diff — not intending to regenerate the world again any
time soon."*

⚠️ **AND THE SHIPPED `KNOWN` CENSUS IS ALREADY CORRECT** — `terrain.placeNames.unresolved` reads exactly
`[The Greenwater, The Axewater]`, which is the true casualty list for the live world.

## §2 — ⛔ WHAT I WOULD HAVE DONE, AND WHY I DID NOT

**I was one command from resiting or retiring six names.** Had I done it, they would now bind to the rebuilt
hydrology and **break in the shipped one** — six working river names destroyed in the live world to satisfy a
gate about a world nobody will ever load.

⚠️ **AN AUTHORISATION IS NOT A MEASUREMENT.** Erik told me to fix them and he was right to, on the evidence he
had; the evidence was a red gate that does not mean what it appears to mean.

## §3 — ⛑ SO IT IS ONE FAILURE, AMPLIFIED FOUR TIMES AND THEN SIX

`tests/content_ci.mjs:653` — `const built = GW.buildWorld(canon)` — and every `SNG-393`/`394` assertion
resolves against `built.hydrology`.

⛔ **`terrain.json` WAS BUILT 2026-08-10 AND ITS INPUTS HAVE MOVED SINCE.** That drift is real, it is `SNG-391`'s
job, and `SNG-391` reports it correctly and loudly:

```
⛔ DRIFT: regenerated world differs from disk (875972 vs 874277 bytes)
```

⚠️ **THAT IS THE WHOLE FINDING, AND IT IS ALREADY BASELINED RED ON PURPOSE** — `suite_baseline.json` says so
in Erik's terms: *"a rebuild moves the map under a live save. That is Erik's call and Aevi's, not a thing to
do while he is playing."*

**But `SNG-393`/`394` then re-report the same drift as four more failures dressed as content defects**, and
`verification_ledger` reads those four as six requirements claiming a red verification. ⛑ **One true fact,
counted eleven times, and it reads as a broken corpus.**

## §4 — THE ASK

**O1 · ⛔ `SNG-393`/`394` RESOLVE AGAINST THE SHIPPED HYDROLOGY, NOT A REBUILD.** The question that gate asks
is *"do the names bind to the world?"* and **the world is the asset we ship.** ⚠️ A name binding to a
hypothetical rebuild is not a fact about anything a player can reach.

**O2 · ⛑ Keep the rebuild check — as `SNG-391`, where it already lives and already works.** *Do not delete the
regeneration*: the day someone rebuilds, these names genuinely will need resiting, and `SNG-391` is the gate
that will say so. ⛔ **THE TWO QUESTIONS ARE DIFFERENT AND SHOULD NOT SHARE AN ANSWER: "does the world drift
from its inputs" and "do the names fit the world" are one gate each, and today the second is answering the
first.**

**O3 · ⬜ Optional, and Erik's if you want it.** A name that binds today and would NOT bind after a rebuild is
worth reporting — as a forecast, not a failure. **That is the drift census he ratified**, applied to names:
fail on an unexplained diff, report an expected one.

**O4 · The ledger prints its verdict on line 131 of 137.** ⚠️ Neither Erik nor I could read what
`verification_ledger` was failing on until I redirected it to a file — it emits the entire §4c block to
stdout and the `LEDGER: n PROBLEM(S)` line lands underneath all of it. ⛑ **A one-line summary FIRST would
have saved this whole investigation**, and it is the cheapest thing in this document.

---

## §5 — ⛑ WHAT I DID NOT TOUCH

**Nothing.** No name resited, no name retired, `placenames.json` unchanged, `terrain.json` unchanged.

⛔ **THE CORRECT OUTPUT OF THIS TICKET WAS A MEASUREMENT AND A REFUSAL**, and I want that on the record
because I have spent three days putting correlates where causes go. **This time the instrument disagreed with
the instruction and the instrument was right.**

— Aevi, PO
