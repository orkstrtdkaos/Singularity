# REPLY — three rulings recorded, the domains spread, and a stocktake of what reached the game

**From:** CCode · **2026-09-11** · **v1.9.453** · **To:** Erik, Aevi
**Answers:** Erik's *"pin the crowding question"*, *"keep the eight stats on"*, *"spread the domains"*, and
*"what's the full work list?"* · **the list itself:** `po/STOCKTAKE_20260911.md`

---

## 1 · ✅ The three rulings, recorded where they are read

| ruling | where it now lives |
|---|---|
| *"Put a pin in the crowding question. Document it as a dial or option."* | `po/BACKLOG.md` — the built dial (`the_substrate.opposedCrowding`, off), its pairs, its curve and the measured table, so unpinning it needs no re-measurement. Gate `§167` |
| *"Keep the eight stats on."* | `docs/BALANCE.md`, beside the dial (`resolution.craftSubAttributes.enabled: true`), with the undiagnosed tilt named. Gate `§166` |
| *"You need to spread the domains, not just take the next two."* | `scripts/damage_sweep.mjs` — §2 below |

## 2 · ✅ The domains, spread

Two harness picks were narrowing every fight:

| | was | now |
|---|---|---|
| a player's two **other** domains | the next two alphabetically — Angelic reached **17 of its 20** harm crafts through Body and Breaking | a third and two thirds around the circle |
| the synth peer foe's domain | keyed to its **level**, which made Angelic the foe at three of the four measured levels | opposite the player's own domain, the level only shifting it |

Measured with the spread on both trees, so the only difference between the columns is the eight stats (the baseline is
`57767dad`, the commit before them):

| fair fight, all 14 domains | before the eight stats | now |
|---|---|---|
| **peer** — the player wins | 38% | **34%** |
| peer — the player goes down | 62% | 66% |
| peer — mean rounds · break as a share of wins | 4.1 · 12% | 4.4 · 9% |
| **+10 levels** | 58% | **54%** |
| **the roster**, a player of their level | 71% | **76%** |
| the 16 tier-breakers | 72% | 82% |
| the spread across the player's domain (roster) | 42–92 | 44–92 |

⛔ **And it retracts what I sent you an hour ago.** I reported that the eight stats tilt fair fights 8–10 points toward the
player, cause unknown. That tilt was the narrow pick: the foe was Angelic three times in four. Measured with the spread on
both trees, the eight stats move a peer fight **-4** points and the roster **+5** — they cost the player against a bought-kit specialist of the
opposite domain and pay against people. ⚠️ Every peer number I gave earlier today was measured against the narrow pick; the
roster numbers never used it and stand. The two one-sided rules I found on the way were real and are fixed.

## 3 · ⛑ Has it reached the game?

Erik: *"I'm not sure how much of this has reached the game."* One row per ruling built these last days — the content dial's
live value, the engine function, the app.js call sites that play it, and the gate — run by `scratchpad/reach.mjs`:

✅ **All of it.** Every ruling has an engine implementation, at least one call site in `app.js`, and a gate: the ground on
every roll (9 sites), the ground tag, the death save on an authored `killCost`, the sense floor and the decisive bonus, the
foe's read and its bonus action, the easing break, the empowered core, a person on a player's body, an authored body, the
wells, the clean craft prose (12 sites), the eight stats, and a foe's sheet keeping its sub-attributes.

⚠️ **What is not in the game is content, and it is Aevi's:** the gear on 83 of 90 records, the six bodies at L25, the ranged
crafts' `subAttribute`, and the markup still in 386 rank lines. The full table is in the stocktake, §1.

## 4 · ⬜ The work list

`po/STOCKTAKE_20260911.md` §3 — eight for me, six for Aevi, six rulings for Erik, each with what it is and why it is open.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | Erik | bodies are spiky (19 in one attribute, 3 in the rest at L30) — the character you want? |
| 2 | Erik | fights and levels: the numbers in §2 and the stocktake §2 — anything you want moved? |
| 3 | Erik | your "2." reached me empty |
| 4 | Aevi | the four ranged physical crafts want `subAttribute: "agility"`; the six at L25 want bodies — ⚠️ **not** because they always win (my one-domain error; a peer beats each 50–61%) |
