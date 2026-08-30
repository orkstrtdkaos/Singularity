# REPLY — the hero cap is LEVEL-BLIND, and here is what is actually open for me

**CCode → Erik and Aevi · 2026-08-30 · v1.9.269**

---

## §1 — ✅ AEVI'S §4.4, ANSWERED: **`heroSwingCap` DOES NOT HOLD AT L100**

**She asked:** *"`heroSwingCap: 0.15` — CHECK IT AGAINST A MYTHICAL BEFORE ASSUMING IT HOLDS. Your note says
do not raise it; that was measured against a level-20 ceiling."* ⚠️ **She was right to ask.**

**400 against 400, even quality:**

| who is in it | outcome | tide | their personal risk |
|---|---|---|---|
| nobody | grinding | −0.03 | 0.53 |
| a level-20 hero | gaining | **0.12** | 0.38 |
| ⛔ **a MYTHICAL** | ⛔ **gaining — IDENTICAL** | ⛔ **0.12** | 0.38 |
| a Mythical if the cap were 0.4 | **breakthrough** | **0.37** | 0.13 |

⛔ **THE CAP IS LEVEL-BLIND.** `heroSwing` is clamped before the hero's power is ever consulted, so a
level-20 hero and a level-95 Mythical bend a battle by exactly the same amount. ⚠️ **At the top of the
ladder, being a Mythical buys NOTHING at legion scale.**

✅ **MY "DO NOT RAISE IT" WAS MEASURED IN A WORLD WHERE NOBODY EXCEEDED 20**, and Erik removed that ceiling
the same week. **The note is stale, and Aevi found it by asking the right question rather than accepting it.**

⚠️ **AND ONE THING I CHECKED AND IT IS FINE:** `personalRisk = max(floor, 0.5 − tide)` looked backwards —
a hero who bends the battle more is SAFER. ✅ **It is correct**: a winning side is a safer place to stand,
and Erik's `legionFloorRisk` of 0.12 means never *safe*. **Checked before reporting it.**

⬜ **WHAT THIS NEEDS IS A RULING, NOT A FIX.** The 15% cap is the best design decision in `melee.js` and I
would not simply raise it. ⛔ **The question is whether a Mythical is a bigger hero or a DIFFERENT KIND of
thing** — and my design doc's answer was the second: at legion scale you stop being a swing and start being
a presence that chooses a theatre. **That is Erik's call and it belongs in the spec he says is coming.**

---

## §2 — WHAT IS ACTUALLY OPEN FOR ME, MEASURED

| | what | state |
|---|---|---|
| 1 | ⛔ **the group model is not wired into play** | `groupCapability` computes coverage · depth · sole · cohesion and **nothing in the game reads it.** It is the biggest thing I have built that does nothing |
| 2 | ⛔ **the aggregate is permanently predatory** (CCODE-308) | measured, simulated, ruling still open — it plays every enemy as if hunting your healer |
| 3 | ⛔ **the casualty pool is out of range above level 2** (CCODE-304) | needs the ordering ruling first |
| 4 | ⚠️ **`heroSwingCap` at L100** | §1 above |
| 5 | **P4 — the lash-out attack shape** | backlog, unblocked, *"genuinely new geometry"* |
| 6 | **P5 — divergent raise/retrieve curves** | backlog, unblocked |
| 7 | ⚠️ **`testOnlyExports` 17 vs a baseline of 7** | my own debt — ten exports crossed the line |

### ⛔ MY RECOMMENDATION: **№1, AND IT IS NOT CLOSE**

**`who_falls_first` — Aevi's craft — asks for exactly what `groupCapability.sole` already computes.**
`break_the_line` asks for `cohesion`. ⚠️ **Two authored crafts are waiting on a model that exists and is
dark**, and the roster line Aevi wanted — *"RESTORE: only Sprig"* — is the same field.

✅ **It is also the only item on the list that needs no ruling from anyone.**

---

## §3 — ⚠️ AND A NOTE FOR THE SPEC ERIK SAYS IS COMING

**Erik: *"we intend to absorb some into fewer traditions… once we've finished the skills audit we'll move
into speccing the update — I expect it to be very impactful."***

⚠️ **THREE THINGS I HAVE BUILT READ THE RING, AND ALL THREE SURVIVE A CONSOLIDATION** — I tested an
8-tradition ring and antipodal still resolves, because the band comes from the ring's own `size`.

⛔ **BUT THE CONTENT DOES NOT SURVIVE UNEXAMINED.** The three authored braids — `meaning_engine`,
`harbored_flame`, `the_turning_word` — are antipodal **today**. ⚠️ **After absorption they may not be**, and
each of them carries a bound about *"the two poles fighting"* that would then be describing a joining that
is no longer opposed. ✅ **A cheap gate can catch that on the day: every authored braid whose prose claims
tension must still measure as `far` or `antipodal`.** ⬜ **Say the word and it exists before the spec lands,
so the consolidation reports its own casualties instead of us finding them later.**

— CCode
