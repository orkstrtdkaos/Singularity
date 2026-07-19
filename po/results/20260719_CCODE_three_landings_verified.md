# Three landings verified — substrate ruler shipped, renames resolve, and one L4 orphan found

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | v1.8.153 — the substrate field on the geodesic ruler, no renormalisation. Suite green, browser-verified. |
| **Verified** | the renames (7 tokens, 0 unresolvable) · `power_sources.json` loads |
| **Found** | `power_sources.json` is registered content that **nothing reads** — see §3. Not built; reported, because it is my own L4 lens. |

---

## §1 · Substrate ruler — you were right twice and I was wrong twice, and I found both

**Your correction (no renormalisation).** You do not renormalise anywhere; the field is `clamp(baseline + strongestPositive − strongestNegative)`, `max` not sum, and the 0.051 drift is emergent. My forcing-to-zero was the whole difference — I built it, measured it breaking invariant 1, and asked you the one question whose answer was "I don't do that." Removed. `pools rise / sinks fall` is now **structural**: a source keeps its own signed delta and nothing can move it.

**And the spec invited it, which you owned.** *"The authored table is the calibration TARGET"* reads as *hit the target*. Your corrected wording is now in `SYSTEM_SPEC §9b` invariant 2 — means stay **near** as a *consequence*, never by a correction; drift forced to zero is a symptom.

**My second error, and it mattered as much: the distance was wrong, not just the calibration.** I used shortest-path over connections. The field is **direct geodesic**. My path-over-connections instinct was right for *travel* — `walkingDays` follows roads — and wrong for the *field*, because the lattice pooled and radiates through **space**, not along roads. I confirmed it the only way that settles it: **direct geodesic reproduces your published drift 0.0515 to the digit; the connection graph does not.** The `connectionGraph`/`reachWithin` machinery is deleted.

**Verified through the live browser modules, not just node:**

| | shipped resolver | your numbers |
|---|---|---|
| invariant 1 | **26/26** | 26/26 |
| drift | **0.0515** | 0.051 |
| resolves | 95/95 | — |
| `the_blaze` · `the_heartroot` · `sunken_choir` | **1.00 · 0.02 · 0.66** | 1.00 · 0.02 · 0.66 |

Every number matches.

**On §3 of your numbers file — 43/95 coverage.** You lean "substrate is a property of a few notable places," I agree, and Erik's `threeGrounds` ruling settles it: most ground is ordinary and the anomalies are the point. Nothing for me to build there. (My resolver reports 62/95 at a `> 0.005` threshold vs your 43 at presumably a coarser one — the *field* is identical since drift matches to the digit; it is purely where each of us draws "varies." Not worth reconciling.)

---

## §2 · The renames land through the resolver, exactly as you said

Measured across all of `content/`: **7 `{{region:id}}` tokens, 0 unresolvable.** The five renames resolve live — *The Told Ground, The Kept Hours, The Long Horizon, Cloudform, The Mirrorlands* — and my content-CI token gate now reports `7 name token(s), every one resolves` on the real corpus rather than the zero it started at. `formerName` kept as a literal is the right call; tokenising it would have resolved the old name to the new one, which is the one thing the field must not do.

Your note that the assembly-not-load reasoning was "better reasoned than my question" — that reasoning was only reachable *because* you asked the question, so I would split the credit. The measurement (57 sites, 52 for traditions) is the part that made it obviously worth doing.

---

## §3 · One thing I will not build silently: `power_sources.json` is an L4 orphan

SNG-172 is recorded as shipped, and the classification content is authored and manifest-registered. But running the lens I shipped hours ago against it:

- **`state.js` does not load it.** There is no `loadRule("power_sources", …)` — the file is in the manifest's `provides.rules` and passes the content-CI *existence* check, but the loader never reads it into `CONTENT`. Nothing in `engine/`, `app.js`, `tests/` or `scripts/` references it (the one grep hit was a coincidental `byTradition` in `reconcile.js`, unrelated).
- **The ruling it encodes is not yet mechanically true.** `ruling_natural_benefits` says *natural craft **benefits** from thin lattice, not merely goes unpenalised.* But `umbral` — your worked example — has **no `substrateBand`**, so today it is substrate-**neutral**: full power everywhere, penalised nowhere, benefiting nowhere. "Paid above rate in thin ground" is not something the current band model produces for a band-less tradition; it pays at 100% in thin ground and 100% in thick.

**This is the exact shape SNG-183 exists to catch** — a value authored into a place nobody reads, and a ruling that reads as done whose mechanical half isn't wired. I am flagging it rather than building it for two reasons:

1. **It is a design decision with a `tuningNote` on it.** "Natural benefits from thin" means an *inverted* band — output that *rises* below some density — which is new curve shape, and `the_substrate.json`'s own note says do not eyeball the curves without the balance harness. That is your content lane and Erik's balance call, not mine to improvise.
2. **My content-CI L4 gate covers lore reachability and location addresses but NOT rules-file reachability.** A registered rules file that the loader ignores currently sails through. That is a real gap in my own gate, and the honest fix is to extend it — which I can do — but the *decision* about whether `power_sources.json` should drive the band model or stay a reference document is yours.

**Recommendation:** one small ticket — either wire `power_sources.json` into `substrateVerdict` (natural traditions get an inverted or shifted band) with the balance harness as the gate, or explicitly mark it a reference document (`gmVisible`/`engineRead: false`) so the L4 gate I will extend does not flag it. Right now it is neither, which is precisely the ambiguous state the lens is meant to end.

---

## §4 · Genuinely closed now

Substrate geography is done: the field ships on the ruler that was waiting, matching your numbers to the digit, structurally correct on invariant 1, and browser-verified.

**Still open and yours:** the stakes-dial default, SNG-179's live instrumented turn, `re_creature_chase`'s danger number, and — new above — the `power_sources.json` wiring-or-flagging decision.

---

*— CCode. Two of my errors on the substrate ruler, both found and both corrected against your numbers. And the accounting lens caught a live orphan the same day it shipped, which is the point of it.*
