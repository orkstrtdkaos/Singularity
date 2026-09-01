# RULING — Unlock levels, the level bands, and what they imply

**Ruled by:** Erik · **Date:** 2026-09-01 · **Recorded by:** Aevi
**Responds to:** `po/PROPOSAL_ccode_unlock_levels.md` §5 · closes C7.1

---

## R12 — Unlock shape ✅ RULED: Option 2

**Tier sets the band; `energyCost` places the craft inside it.** Both fields already exist on all
414 crafts — zero authoring, and the corpus arrives as a curve rather than a staircase.

Option 1 rejected (cliff-shaped: 148 crafts at L1, then nothing until L21).
Option 3 deferred, not rejected — earned unlock fits the game's grain but is the most engine work
and can strand a player who dislikes their own tier-3 crafts. Revisit if Option 2's curve
disappoints in play.

⛔ **Prerequisite still stands:** `tier` and `levelReq` are the same field. Add an optional `tier`
and have the readers ask `ability.tier ?? ability.levelReq`. Defaults to today's behaviour on all
414. Nothing below works until this lands.

---

## R13 — Top level ✅ RULED: L60

**The whole corpus is open by L60.** Not L100.

⚠️ Aevi initially recommended L100 and **reversed** after Erik supplied the play-tested band
structure below. L60 is not a compromise — it is the point where acquisition should stop being
the progression and depth should take over.

---

## R14 — The level bands (Erik, from play) ✅ RECORDED

Silas is at L30 and just entering Band and outpost leadership. That is the observed arc, not a
projection:

| band | what it is | what progression means |
|---|---|---|
| **1–10** | personal capability | acquisition — the character themselves |
| **10–30** | ⚠️ **party building** | acquisition continues; the unit forms |
| **30–60** | Band, outpost, army, strongholds | acquisition tapers; **scope widens outward** |
| **60–85** | Epic → Legendary | corpus fully open; the choice is what you deepen |
| **85–100** | **Mythic** | ⚠️ **depth only** |

**Arriving in "the big game" at L60 (if the player desires it) is the intended shape.**

---

## R15 — L1 craft visibility ✅ RULED: all tier-1 crafts

**Setting: `energyCost <= 6`, which surfaces all 101 tier-1 crafts.** Every domain gets at least 3.

⛔ **Aevi's earlier "~8 per domain / ≈112 global" recommendation was wrong** and is retracted. The
measurement: **only 101 of 414 crafts are tier-1 at all**, and they are unevenly spread. Eight per
domain exceeds what five domains contain.

| domain | tier-1 crafts | |
|---|---|---|
| Dark · Death · Light · Span | 10 | |
| Order | 9 | |
| Breaking · Building | 8 | |
| Body | 7 | |
| Mind · Chaos | 6 | |
| Angelic · Demonic | 5 | ⚠️ thin |
| Spirit | 4 | ⚠️ thin |
| **Life** | **3** | ⛔ **cannot support R3** |

⛔ **CONTENT GAP, not a dial problem.** R3 requires a level-1 character to make a forced sense pick,
receive a danger-response, and choose 2 more from a curated pool of 4–5. **Life has three tier-1
crafts in existence.** The crafts are not there to show.

➡️ **New authoring item (OI-19):** thin domains need more tier-1 crafts — Life (3), Spirit (4),
Angelic (5), Demonic (5). Belongs in the tradition narrative/thickening pass, and it now **blocks
the creation revamp from being playable** for those four domains.

---

## §What R14 implies — three consequences worth acting on

### 1. ⛔ The holdings model just moved from "someday" to "next"

L30–60 is Band, outpost, army, strongholds. **That is the holdings model (SNG-358)** — currently
blocking `presence` and `rapport` milestones at ranks 14–20. **Silas is at L30.** The blocked thing
is the thing Erik is about to play into.

➡️ Holdings should be prioritised ahead of anything scoped to the 60+ bands.

### 2. ⚠️ The Mythic band's progression is GM-granted, and there is no rhythm for it

L85–100 is depth only. But the deepest **purchasable** rank is 2 — rank 3 is GM-only, "not
accumulated" (`gm.js` §19B).

So Mythic progression is *entirely* GM-granted rank-3 mastery. That may be exactly right — mythic
status earned in fiction rather than bought — but **no rank-3 granting rhythm is authored.** A GM
reaching that band has no guidance on cadence, trigger, or ceremony.

➡️ Open design item. Not blocking, but it should exist before anyone plays L85+.

**Depth-band arithmetic (sanity check):** at 2–4 pts/level, L60→100 yields ~80–160 points.
Training a full 101-craft shelf to rank 2 costs ~300. A Mythic character deepens **a third to a
half** of what they know — a real choice, not a completion checklist. ✅ The band has enough in it.

### 3. ⚠️ Party-building (10–30) ties directly to the NPC/PC tier work

Erik: *"this ties into the npc/pc tiers and big battle work we've been doing too."* The
party-building band is where NPC sheets stop being flavour and start being mechanically load-
bearing — companions with real crafts, in real fights.

➡️ Reinforces the NPC-sheet dependency already logged in BACKLOG: it is blocked on the character
build overhaul, and it is needed by L10–30 play.

---

## ⚠️ What this ruling does NOT fix

Unlock levels change **when** you may buy something. They do not make anything **worth saving for**
— the dearest craft still costs 5 points. ⬜ If the splurge matters, it wants the distance-priced
idea from C7.5 alongside this. **Separate call, still open.**

---

## For CCode

| # | action |
|---|---|
| 1 | ⛔ **Prerequisite:** add optional `tier`; readers ask `ability.tier ?? ability.levelReq` |
| 2 | Implement Option 2 — tier band + `energyCost` placement within band |
| 3 | Top level **60** |
| 4 | L1 setting **`energyCost <= 6`** (all 101 tier-1 crafts; min 3/domain) |
| 5 | ⬜ Report the arrival curve per band under R14's boundaries (1–10, 10–30, 30–60) so Erik can see the shape against the play arc rather than against arbitrary decades |
