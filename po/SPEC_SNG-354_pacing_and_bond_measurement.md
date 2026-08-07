# SNG-354 — Measured from the saves: the bond arc ends at level 5, and rank 20 does not exist

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"simulate the growth rates to see their
shapes right now then tweak"* / *"use Silas Weir and other saves to get real data"*
**Status:** MEASUREMENT COMPLETE — no dial turned. Design proposals in §4, Erik's call.
**Method:** all 14 character saves under `characters/` pulled at HEAD, plus `rules.companions.bondGrowth`
and `growBond()`. Reproducible: every number below comes from the saves, not a model.

---

## §1 — PACING: what a campaign actually looks like

| character | level | actions | actions/level |
|---|---|---|---|
| **Silas Weir** | **29** | **915** | 31.6 |
| Cellaceron | 11 | 246 | 22.4 |
| Loki | 6 | 136 | 22.7 |
| Usnea Beard | 5 | 151 | 30.2 |
| Splarf | 2 | 58 | 29.0 |
| Saehara Makashi | 2 | 66 | 33.0 |
| Aelyn Kantoro | 2 | 64 | 32.0 |

**MEAN: 25.2 actions per level.** Remarkably consistent — the spread is 22–33 across every real save.

Silas is the only deep campaign: **level 29, 915 actions, 22 sessions, 29 deeds, 10 quests, 3 schools
entered, 3 allies in company.** That is the shape of a full arc, and it gives the phase boundaries:

| phase | levels | actions | who lives here |
|---|---|---|---|
| **early** | 1–5 | 0–150 | **6 of 11 real characters** |
| **mid** | 6–12 | 150–330 | Loki, Cellaceron |
| **late** | 13–29+ | 330–900+ | Silas alone |

⚠️ **Most characters never leave early game.** Whatever the ladder does at ranks 1–5 is what most players
will ever experience of it.

---

## §2 — ⛔ THE BOND ARC IS OVER BY LEVEL 5, AND THEN FLAT FOR THE REST OF THE GAME

Erik: *"it seems to grow pretty quickly."* **Measured, it is worse than that.**

`bondGrowth`: `deed 0.5 · assist 0.25 · encounter 1.5`, scale capped at 10, `grantAt: 6`.

**Simulated on encounters alone:**

| encounters | bond | |
|---|---|---|
| 4 | 6.0 | ⛔ **`bondGrants` unlocks** |
| 7 | 10.0 | ⛔ **MAXED — the entire arc, in seven encounters** |

**Observed in the saves:**

| character | level | actions | bond | % of scale |
|---|---|---|---|---|
| Silas Weir | 29 | 915 | 10 | **100% — maxed** |
| Cellaceron | 11 | 246 | 10 | **100% — maxed** |
| **Usnea Beard** | **5** | **151** | **10** | ⛔ **100% at LEVEL 5** |
| Splarf | 2 | 58 | 6.5 | **65% at level 2** |
| Loki | 6 | 136 | 1.25 | 12% |
| Brynjar | 1 | 25 | 1 | 10% |

⛔ **Three of eight bonded characters sit pegged at the ceiling, one of them since level 5.** Usnea hit
maximum bond in 151 actions and then had nothing left to earn. Silas has been at 10 for roughly **760
actions** — 83% of his entire campaign spent at a completed relationship.

⚠️ **And Splarf reached 65% of the scale in 58 actions at level 2.** Erik felt this correctly from inside
the game.

**THE STRUCTURAL PROBLEM, not the tuning one:** `helper_text` promises *"at depth, they teach you something
no tradition will."* Depth arrives at **four encounters**. The bond is not a long arc with a distant
reward — it is a short ramp that completes during early game and is then decorative for the other 80–90%
of play. **A relationship that cannot deepen is scenery.**

⚠️ **NPC relationships were flagged by Erik as having the same shape. NOT MEASURED HERE** — `relationships`
is populated on only one save (Cellaceron, 8 entries). Needs its own pass; do not assume it matches.

---

## §3 — ⛔⛔ CORRECTED 2026-08-07 — I CALLED SILAS THE CEILING. ERIK: *"he's mid tier."*

**MY ORIGINAL §3 CLAIMED "RANK 20 DOES NOT EXIST" AND RECOMMENDED TAPERING RANKS 11–20. THAT WAS WRONG,
and the error is worth naming precisely because it is a repeatable one:**

> **I conflated the deepest save I could measure with the ceiling of the game.** Silas is the furthest
> anyone has *played*, so I treated level 29 / sub-9 as the top of the curve. Erik: he holds two warden
> stations, a smithy, a pregnant wife, and four company allies — **that is a character in the MIDDLE of
> his arc.** The empirical maximum is not the design maximum, and nothing in the data could have told me
> which one I was looking at. Only the person playing knows.

**Same shape as the SNG-350 crossover error earlier today: I described the shape my recommendation
needed instead of the shape the evidence supported.** Twice in one session, both caught by Erik.

### §3a — Re-derived with level 29 as MID

| phase | levels | actions @25.2/lvl | sub-ranks reached | evidence |
|---|---|---|---|---|
| **early** | 1–8 | ≤200 | **1–4** | 6 of 11 real characters |
| **mid** | 9–35 | ≤880 | **5–10** | **Silas, lvl 29, subs 4–9** |
| **late** | 36–70+ | 900–1,800+ | **11–18** | not yet played |
| **deep** | 70+ | 1,800+ | 19–20 | the cap, reachable in a long campaign |

**Sub-9 at level 29 is therefore a MID-GAME reading, not a ceiling.** A character continuing to level 60
banks 60 sub-points; concentrated across the three or four subs a specialist actually uses, **ranks 15–20
are genuinely reachable.**

⛔ **REVERSED RECOMMENDATION: author all twenty ranks in real detail.** The taper I proposed would have
hollowed out exactly the phase Erik is describing as the interesting one — fortresses, businesses, world
arcs. **Ranks 11–20 are not aspirational padding; they are the late game, and they are where the nuance
Erik asked for has to live.**

⚠️ **What survives from the original §3, and still matters:** nobody single-stats — Silas spread 29 points
across all 8 subs — because the roll reads whichever sub the GM names, so a specialist is helpless the
moment a different one is called. **The ladder must reward spread as well as depth**, or it fights how the
resolution system actually works. That observation was measured and holds regardless of where the ceiling is.

## §4 — WHAT THIS MEANS FOR THE LADDER (Erik's phase framing, fitted to the data)

Erik: *"early game you need base health and energy… mid game power, reach, effectiveness… late game
world arcs, fortresses, party members, businesses."* **The data supports this and puts numbers on it.**

| phase | sub-rank reached | what the ladder should grant |
|---|---|---|
| **early** (lvl 1–8, ≤200 actions) | **ranks 1–4** | ⚠️ the survival floor — health, energy, the basics. **Most players never see past here.** Front-load legibility. |
| **mid** (lvl 9–35) | **ranks 5–10** | power, reach, effectiveness. **Silas lives here.** The soft-cap crossing belongs at rank 5–7, not 4. |
| **late** (lvl 36–70+) | **ranks 11–18** | ⚠️ the nuanced tier — standing, company capacity, holdings, world-arc leverage. **BLOCKED: see SNG-355 §2 — three of those four have no state model to attach to.** |
| **deep** (70+) | ranks 19–20 | the cap, reached only in a very long campaign |

⛔ **THE SOFT CAP LANDS IN THE WRONG PLACE.** `attributeSoftCap: 4` — so mastery's diminishing return
begins at the **top of early game**, exactly where Erik says a player still needs base competence.
Retiring it into the ladder (Erik approved) lets the curve bend at **rank 5–7**, mid-game, where "you have
the basics, now you specialise" is the true statement.

**Nothing tuned. Simulation harness for the bond curve and the ladder is the next build, per Erik:
sim first, tweak after.**

---

## §5 — OUT OF SCOPE

- Any bond-rate change — measured, not tuned.
- NPC relationship growth — flagged, unmeasured, needs its own pass.
- `subAttributeCap` — named as a decision, not proposed.
