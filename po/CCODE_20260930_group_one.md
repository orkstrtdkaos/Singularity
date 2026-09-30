# CCode → Aevi — the work order, group 1: all three built · v2.15.9

*2026-09-30. Your `WORKORDER_aevi_20260930_eriks_list.md`, group 1 — the bugs Erik is playing on. Items 8+13, 12 and 9
are built, driven on his save, and gated (§396, §397). 32/32 suites green, 4,227 checks.*

---

## Item 12 — "I can't seem to do anything about it"

**Your reading was exact, and I measured it before building anything.** Three places added to `arrears` — the stall fee
when the keeper sells, the stall fee when he sells in person, the unpaid keep — and **not one place anywhere took any
away**, in the engine, the app or reconcile. No door, automatic or manual. A number that could only grow, on a hold that
was thriving. Loki's Standing Annex owed 4.

All three of your parts are in:

**(a) The hold pays it down out of what it earned.** ⛔ *Where this sits in the tick is the rule, not an implementation
detail* — the runs draw taught me that one the hard way three weeks ago. It goes **after** the keep, so your gate reads
literally: a hold that earns more than its keep clears what it owes. Before the keep it is a treadmill — clear the debt,
fail the keep, owe it again, every pass forever. And it pays **only out of this pass's takings**, never out of the
player's purse behind their back; the button does that, deliberately, and the tick does not.

**(b) "Pay it now: N crystal"**, on the review row and on the hold card, in the hold's own money. Partial payment is
allowed and is the ordinary case — a hold owing 400 with 38 spare gets 38 closer rather than refusing. An empty purse
refuses and leaves the debt exactly where it was.

**(c) It says why.** `oweIt(holding, amount, why, day)` is now the **only** writer, and it takes the reason as an
argument so it can never be omitted. Your example sentence is what it produces: *"couldn't pay the stall to the Pale
Concord at Millbrook on day 112 (4)"*. The same reason on the same day is one line that grows, not four copies of one
sentence. And a hold carrying arrears from **before** the reasons existed — which is every one in the saves today — reads
as *"4 owed, from before the reasons were written down"* rather than going blank.

Driven on his save, swept across the tipping point by putting watch hands on the hold until the keep passes the takings:

```
  watch  tookIn  keep  stall  surplus  paidDown  stillOwes
  0      44      6     0      38       6         0
  6      44      24    0      20       6         0
  10     44      36    0      8        6         0
  14     44      48    0      -4       0         6      ← below the line, pays nothing
```

⚠️ **A note on how I nearly measured this wrong.** My first sweep varied the *store* — nothing stored, a little, a full
shed — and all three rows took in 44 all the same, because a hold **yields and then sells in one pass**. Three copies of
the easy case dressed as a range. Emptying the shed does not get you below the line; raising the keep does.

---

## Item 9 — a keep on a moving hold

**Measured:** `canBuildOn` asked `carriageOf(holding)` — *does it move at all* — and then refused on a field named
`hullable`. Nine kinds declare `hullable: false`, and **all nine were refused on all five frames**. A walking fortress is
exactly the fantasy, and the engine was saying no to it with a boat's rule.

Your sentence is now the reader, over the whole matrix:

| | rooted | hull | legs | lift | grown | borne |
|---|---|---|---|---|---|---|
| keep · gate · muster yard · ward line | yes | **no** | yes | yes | yes | yes |
| mine · quarry · grave ground · reclamation bowl | yes | no | no | no | no | no |

The refusal now names the frame and the reason — *"a keep cannot be built on hull — it cannot be carried in a hull"* —
instead of *"something that moves"*. The other 35 feature kinds are carried by anything, exactly as before.

**Your content wins the moment you author it.** A kind's own `frames: ["legs", "grown"]` or `rootedOnly: true` is read
**first**; the table above lives in the reader only until then, and switching to content is a content change with no
engine change. That ordering is deliberate — the four doors run authored → registered → loaded → **read**, and a reader
that arrives after the content is a field nobody uses.

⚠️ **One thing I declined to do.** `family` happens to partition your three groups *exactly* — martial is the four that
ride, material and meaning are the four that are dug in, craft is the waygate. Deriving the rule from it would have been
authoring by coincidence: the next martial feature you write would silently inherit a placement nobody chose. So the rule
is your sentence, held explicitly, waiting for your fields.

**Waygate: I did not touch it, because it was already right.** `build: null` → `featureCost` reports
`buildable: false` → `addFeature` refuses with the authored sentence, on the ground and on all five frames. Asking the
*frame* rule about a thing that is never built anywhere is a frame answer to a question nobody asks of it.

### ⛔ And gating that turned up a real one, older than your item

I gated the two doors **against each other** — whatever `canBuildOn` refuses, `addFeature` must not build — and it went
red on **24 of 264** (kind × frame) pairs. **`addFeature` never asked the frame rule at all.** The refusal lived at two
`app.js` call sites; anything else — a quest reward, a reconcile step, a future surface — could build a mine on a
longship, and could today. This predates item 9; item 9's gate is what exposed it.

The rule is in the engine now, which is Erik's standing ruling (*play logic in the engine; app.js and the tests call the
same functions*). ⬜ **One question for you:** I applied it to `via: "built"` only. An **inherited or granted** feature
arrives narratively, and `featureRuling` already models a grounded thing aboard a moving hold — it sits in the `grounded`
list and earns nothing under way — so a story that hands you a mine on a barge is a state the engine has, not a
contradiction. Should a narrative grant be refused too, or is that yours and Erik's to keep open?

---

## Items 8 + 13 — Cy's charge, twice, and not on the legs

Built and driven on his save, as reported earlier today. `holdPurposeOf` matches a charge against the player's **own**
holds, longest name first, so it is a lookup over a closed set of one to six rather than a guess at English. A charge
about a hold keys on `person :: hold :: purpose`, so two *wordings* of one job are one record. `clearingTick` counts
whoever is charged with that hold's growth beside its crew and its watch, deduped by id — Cy appeared twice in two
records and would have counted as two hands. Reconcile **step 93** repairs the pair already in the save:

```
before: 2 charge(s), version 91
  A charge to grow one of your holds IS that hold's growth job now — 1 doubled charge folded into one
  (cy at the_standing_annex); 2 charges now count toward the work The Standing Annex is doing.
after : 1 charge(s), version 93 — cy::the_standing_annex::growth
the legs, one pass: 25%
```

---

## ⛑ And two of my own tools lied to me today

Worth your knowing, because both are the class of thing that makes a report untrustworthy rather than wrong:

1. **My arrears driver invented the field it tested for.** It read and wrote `character.currencies`, which no save has —
   the purse is `character.purse` — so it printed *"purse 0"* beside a payment that succeeded, and its empty-purse case
   ran on a **full** purse and "failed" the engine for doing the right thing.
2. **My frame driver's §7 was vacuous.** Its fixture spread the frame object last, which overwrote the hold's `id` with
   the frame name, so `addFeature` found no holding, refused all 264 pairs, and reported **zero** disagreements. The gate
   in `how_it_works` found the 24. A fixture that builds nothing agrees with every rule, so that section now counts what
   it actually built (234 of 264) and fails if that is zero.

And one of my own gates went red on the line inside the door it required: *"no site adds to `arrears` by hand"* is false
the moment `oweIt` exists, because `oweIt`'s body **is** that line. One writer is a count, never a negation.

---

## What is next

Group 2 (layout: items 1+5, 6, 7, 2, 11, 3, 14), then group 3 (item 10 — hands as person-rows), which I will **measure
first**: which readers take a hand *count* today, and you get that list before the record changes.

⬜ **Still with you or Erik**, unchanged from this morning: the road-hazard escort-wipe inversion and the peoples half of
gate stigma (Erik), which power verb takes a gate (you), whether Patrolling should merge like Guarding did, and C2's
`trading_post`-vs-`draws` call.

— CCode
