# RE: SNG-404 — the engine is in, and tuning the dial found the model needs one change

**Author:** CCode · **Date:** 2026-08-10 · **Re:** `po/SPEC_SNG-404_local_detailing_engine.md`
**Status:** `engine/localdetail.mjs` shipped, 7 gates green · **§2 needs your ruling — see §1 below**

---

## §1 — ⛔ You asked me to tune the relief threshold. It cannot be tuned, because relief is not what selects the gradient.

Your §2: *"Provisional cut at 0.05, and I want it TUNED against the eight rather than taken from me — I
have eight samples, not a distribution."* So I measured all eight and checked which layouts actually
placed a site on the measured uphill bearing:

| settlement | relief | uphill used? | your own words |
|---|---|---|---|
| greywater_stilts | 0.012 | **no** | *"uphill is NOISE on flat ground"* |
| echo_river_crossing | 0.022 | **yes** | *"The Granite Shoulders — on the measured uphill"* |
| millbrook | 0.041 | **yes** | *"'climb the lower slopes' — on the MEASURED uphill bearing"* |
| the_service_ways | 0.048 | no | (underground — depth, not radius) |
| greyhearth | **0.236** | **yes** | *"UPHILL, on the measured bearing — drainage"* |
| the_figure_works | **0.268** | **no** | *"no usable gradient at all — the TRADITION carried it"* |
| kindlerow | 0.645 | yes | relief dominates |
| the_cogitarium | 1.043 | yes | — |

⛔ **greyhearth used the slope at 0.236 and the Figure Works refused it at 0.268.** The *unused* case has
the higher relief, so **no cut on relief reproduces your own column.** And your provisional 0.05 would
have disqualified millbrook and echo — two towns you placed on the measured uphill yourself.

### What the corpus actually shows

**The gradient is chosen by what the SITE is, not by which gradient is strongest.** A burying ground goes
uphill because it needs *drainage*. A dock goes riverward because it needs *water*. A gate sits on a road
because a road is what it opens onto. The Figure Works ignored a perfectly good slope because a working
hall, a proving yard and a containment ring need no slope — their tradition lays them on a figure.

So relief keeps a narrower job than §2 gives it: **whether uphill exists as an answer at all.** On that
narrow question the corpus offers exactly **one** negative — greywater at 0.012 — against a lowest
positive of 0.022. ⚠️ **I've set the cut at 0.018 and I am reporting it, not ratifying it:** it rests on a
single negative example, and the number is yours and Erik's. The gate asserts only the *shape* — that
whatever the cut is, the flat town stays out and every town you placed on a slope stays in — so retuning
it cannot break a gate, and 0.05 reds it honestly.

⚠️ **One scale note:** my reliefs are not numerically yours (you read 0.002 and 0.541 at the two extremes;
I read 0.012 and 0.645). Same ordering, different normalisation — so **the cut has to be quoted on the
engine's scale**, which is why I'm giving you 0.018 rather than a translation of 0.05.

## §2 — The handshake is exact where it counts

All eight **river distances** reproduce yours to 0.02°. All eight **uphill bearings** match — modulo 360,
because you write 0–360 and the module writes −180…180 (your 210 is my −150). Comparing numerals rather
than directions would have failed on notation alone, so the gate compares directions.

✅ **And the corpus validated the generalisation without my asserting it:** given only *"a figure has three
points"* and no ground signal at all, the tradition branch reaches **0 / 120 / 240** — the exact bearings
you authored for the Figure Works by hand.

## §3 — What shipped

`engine/localdetail.mjs`: the three gradients measured the way you measured them; `usableGradients` deciding
what this ground can answer; `placeSite` keyed on a small need vocabulary drawn from your 38 placements
(`centre · water · height · road · apart · depth`); and your §4 enforced — **every placement carries a
`why` naming its source, and a placement nothing licenses returns null rather than a bearing.**

⛔ **The Kindlerow case is gated explicitly:** on ground with no river and no slope, asking for water
returns *nothing*. Your forge dug a cistern rather than pretend to a river, and a generator that answered
"water" there would have put a dock in a town whose fiction is that it has none.

⚠️ **`depth` is its own branch, not a radius with a note** — the Service Ways go to level −4 and `level`
survives the metres→world conversion, so the Cogitarium's two rooms stop landing on top of each other.

## §4 — ⚠️ What I did NOT build, deliberately

**Your §2 step 2 — the place's own prose.** You wrote: *"A BUILDER STEP, NOT A REGEX — the water-word
audit stands as the warning: a regex over prose finds words, not facts."* So the module places what it is
*given* and does not read prose. The site list needs to arrive from a builder call that returns each site
with its `need`; then the placement is deterministic and gateable, which is the split that keeps the
geometry testable without an API key.

**Say the word and I'll build that builder step** — it's the last piece before §6's "generate the next
tranche and I review them."

## §5 — Your data gap, confirmed independently

`echo_river_crossing`'s nearest traced river measures **3.83°** from here too. You placed the bridge on the
fiction and flagged it; I've done nothing to bend the measurement toward it. It stays a `waterauth`
question, not a layout question.


---

## §6 — ⚠️ You got there independently while I was measuring, and your evidence is better than mine

`db13ac4d` — *"the relief threshold could not be tuned from bearings because noise-uphill coincides with
real bearings"* — is the same conclusion by a different route, and the `basis` field you shipped with it is
straightforwardly better data than my inference from bearings. **So the gates read your field now, and the
engine's vocabulary is yours**: all ten bases, not the six words I had invented. Two of yours had no branch
at all — `anti-uphill` (a thing placed by the slope it *avoids*; Millbrook's fields) and `between` (the
Singers' Hall, on the walk). Both are built, and a gate now fails if you coin a basis the engine cannot
place, rather than letting those sites be silently dropped.

⛔ **And switching to your ground truth turned one of my own gates red, correctly.** I had hand-listed the
flat town as `["greywater_stilts"]` — the single case that fitted — which encodes a conclusion instead of
testing one. Read from `basis`, the **Service Ways (0.048)** and the **Figure Works (0.268)** also place
nothing uphill, both well above any cut that admits echo at 0.022. They decline for reasons that are not an
absent slope: one is a tunnel network measured in depth, the other lays out on its tradition's figure.

**So the cut is necessary, not sufficient**, and that is all the gate claims now: it must never block a
placement you made, greywater stays below it, and — asserted explicitly — *a usable slope does not imply a
slope placement.* If that last one ever goes green by emptiness, the single-dial model is back and that
gate is where it will show.
