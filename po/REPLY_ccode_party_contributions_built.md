# REPLY — SPEC_party_contributions BUILT (shape B), and round 2 on the support spec

**CCode · 2026-09-10.** ⬜ Against `SPEC_party_contributions.md` and `SPEC_what_a_support_character_does.md`.
> Erik, relayed: *"the answer to CCode's question is yes, but build SPEC_party_contributions first."*

⛑ **Built: shape B — a folded ally does the thing their family is FOR, once a fight each, and it is named.**
⚠️ **But it could not be built honestly on the code as it stood.** Measuring the hook points turned up three
defects in the live fight path, and two of them would have made shape B a lie.

---

## §1 — ⛔ THREE DEFECTS UNDER THE SPEC, MEASURED THROUGH `skillBattleRound` BEFORE ANYTHING WAS TOUCHED

| | measured | fixed? |
|---|---|---|
| ⛔ **H1 — a blow aimed at an ALLY came off the PLAYER** | A foe set to hit the healer aimed **26 of 26** blows at Coil — **463 damage, and all of it came off the player**. The engine's event said *"LANDS on you — 15 taken"* while the receipt in `app.js` said *"It lands on Coil, not you."* ⚠️ `encounters.js` applied damage in two branches, `opponent` or you, with no case for `damage.onId`. The whole CCODE-250 targeting chose who to hit and the damage ignored the choice | ✅ **yes** |
| ⛔ **H3 — a knockout lasted ONE round** | The fold downed Ember; her own entry stayed `{"id":"ember"}` and **the next round's roster had her standing**. `downEntity` wrote onto the per-round wrapper `alliesOf` rebuilds every call — and in play `character.companions` is **bare ids**, so there was nowhere durable to write it | ✅ **yes, for the fight** |
| ⚠️ **H2 — lasting harm reaches no one** | `sustained_regard` inflicted decay 4 on the player; after `applyRoundToCharacter` **the character was unchanged**. `inflicted` is computed every round, passed through `encounters.js:499`, and written onto nobody. The `craftmechanics` comment already says it: *"a reader with no writer."* Crafts now inflict (CCODE-214/296); the writer was never built | ⬜ **reported, not built** — its tick is a mechanic nobody has ruled |

⛑ **Why H1 had to come first:** shape B's warder "takes the blow meant for you" by reassigning it, which is
exactly the path H1 broke. Built on the old code, the receipt would have said *"Sprig takes the blow meant for
you"* beside *"LANDS on you — 13 taken."*

---

## §2 — ✅ WHAT SHAPE B DOES NOW

| family | the act, once a fight each | how it lands |
|---|---|---|
| ⚑ **PROTECT** | a folded warder **takes one blow aimed at you** | a reassignment, not a reduction: the warder takes **exactly** the blow that got through your mitigation, so it cannot stack into immunity (your §5 Q1). Never over a declared guard that already caught it |
| ⚑ **KNOW** | a folded reader **hands you the read** | rides the existing setup bonus — *"you read them first"* — on an action round where you have no read of your own. **`melee.foldedReadBonus: 4`, Erik's dial**; 0 turns it off |
| ⚑ **RESTORE** | a folded mender **stops one imposition before it takes hold** | ⚠️ **not** "lasting harm becomes temporary" as shape B reads — lasting harm is `inflicted`, and H2 means it reaches no one. An imposition *does* reach you, and `refused` is the field that already stops it |

⛑ **Every act is named in the round's events.** Copied from a live run with real companions, not written
by hand:

```
Hush reads their next move — you have their measure.
Sprig takes the blow meant for you.
Foe's a hard strike LANDS on Sprig — 13 taken (7/20 left).
Sprig goes down.
Coil mends it before it takes hold — incapacitated never lands.
```

The round also carries `foldActs` for any surface that wants them. ⛔ **No silent +3.**

**And the repairs underneath:**
- ⛔ **H1:** a blow aimed at an ally lands on the ally — *"Foe's a hard strike LANDS on Wren — 22 taken
  (18/40 left)"* — adds to their harm for the fight, and **at their health they go down**. A lethal kill
  aimed at an ally stops the ally, not you.
- ⛔ **H3:** knockouts — the fold's and H1's — live on the **fight's own state**. A downed ally is out of the
  party, out of the fold and untargetable for the rest of that fight.

---

## §3 — ⚠️ WHAT IT DOES TO BALANCE, AND IT IS ERIK'S TO SEE

**12 fights each, a level-10 hero, a threat-60 foe on its DEFAULT policy, real companions:**

| party | foe blows at you | taken by a warder | damage the party absorbed | reads | allies downed |
|---|---|---|---|---|---|
| solo | 37 | — | 0 of 624 | — | — |
| two (Quill, Sprig) | 15 | **9** | **184 of 462 — 40%** | 0 | 6 |
| four (+ Hush, Coil) | 7 | **16** | **346 of 434 — 80%** | 24 | 11 |

⛔ **CORRECTING MY OWN FIRST READING OF THIS TABLE:** I labelled that damage *"used to come off you"*. It didn't.
**Every one of those ally-side blows is a PROTECT catch.** Under the default "threat" policy the foe aimed at an
ally directly **zero** times, because you outscore every companion on threat. ⛑ **So H1 changes nothing in
default play**; it matters when a foe's policy picks an ally ("healer" — 26 of 26) or a companion out-threatens
you.

⚠️ **Shape B is the real change, and it is large:** one catch **per warder** per fight is roughly one blow in
three or four in a short fight — and the four-companion party carries two warders (Sprig, Hush). Allies at **level × 2 health** go down fast when they take it. ⬜ **If Erik finds that too strong,
the dials are the per-fight count and the read bonus — not the design.**

---

## §4 — ⬜ ROUND 2 ON `SPEC_what_a_support_character_does`

| Q | ⚑ |
|---|---|
| **1 · does a support act cost the round?** | ⛑ **For a folded ally it is free**, and that is shape B as ruled: the fold acts beside you, not instead of you. **For a PRESENT ally choosing an act (your §3), I agree it should cost the round** — that's the layer on top, not built yet |
| **2 · can a support act be the losing side's act?** | ⛑ **Yes, and shape B already does it:** PROTECT and RESTORE fire *because* the foe won the exchange. Mending while losing is exactly when they trigger |
| **3 · does the opponent AI get this too?** | ⛔ **Not yet, and it's the bigger prize, as you say.** Nothing here touches `opponentPolicy`. It is still press / protect with no third mood — Aevi the Watcher strikes 12 of 12 when behind. ⬜ **That is the next build** |
| **4 · a support ally alone?** | ⛑ Rule 4 covers it — and a lone support ally now at least *counts*: they are targetable, take their own blows, and go down |

⛑ **Your §4 picker and §5's `closed[]` route both stand as written.** `vocation` still has no reader — it
becomes the tiebreak when the present-ally layer and the opponent's third mood are built.

---

## §5 — ⬜ WHAT IS STILL OPEN

| # | whose | |
|---|---|---|
| 1 | ⛔ **Erik** | **does a knockout outlast the fight?** Today it lasts the fight and no longer — the engine has nowhere durable to put it (companions are bare ids), and I didn't invent one |
| 2 | ⛔ **Erik** | **the balance in §3** — one catch per warder per fight took 40% (one warder) to 80% (two) of the damage aimed at a party. Keep, or turn the dials? |
| 3 | ⬜ **Erik** | **H2** — should ongoing harm TICK (drain health each round until healed)? Until it's ruled, `inflicted` has no writer and RESTORE can't convert it |
| 4 | ⬜ Aevi | ⚠️ **R25a slots 5–6 had already shipped** (`REPLY_ccode_r25_r27_built` §2: presence 10 → 5th, 14 → 6th) — before this spec was answered, against its own "do not ship until". ⛑ The milestone landed into a party that was not yet worth joining; **now a fifth member brings something** |
| 5 | ⬜ CCode, next | the opponent's third mood and the present-ally act (support spec §3–§4), with `vocation` as the tiebreak |

✅ **Gates:** 18 in `how_it_works` §150, each driven through `skillBattleRound` with seeded rounds and
single-family companions, so no act can pass for another. Non-vacuity beside every one.
