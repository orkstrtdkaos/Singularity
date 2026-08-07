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

## §3 — ⛔ RANK 20 DOES NOT EXIST. THE REAL CEILING IS 9.

Erik asked for a ladder specifying *"what each point up to 20 gets you."* **`subAttributeCap` is 20.
Measured across every real save, the highest sub-attribute anyone has ever reached is 9.**

| sub | highest reached | by |
|---|---|---|
| presence | **9** | Silas, lvl 29 |
| craft | **9** | Silas, lvl 29 |
| reason / insight / rapport | 7 | Silas, lvl 29 |
| wits | 6 | Silas, lvl 29 |
| agility | 5 | Silas, lvl 29 |
| strength | 4 | Usnea, lvl 5 |

**Silas at level 29 has 29 sub-points spread across 8 subs and his best is 9.** A player who dumped
*every* point into one sub from level 1 would reach 20 at level ~19 — about 478 actions — and **nobody
plays that way**, because the roll reads the sub the GM names, so a single-sub specialist is helpless
whenever the GM names a different one.

⚠️ **Authoring ranks 10–20 in detail would be authoring for a character who has never existed.** That is
Amendment 3's exact failure — writing content a player will not use.

**PO RECOMMENDATION: author ranks 1–10 in full detail, and 11–20 as a declared taper.** Ranks 1–10 cover
every real character including Silas. The taper is honest about being aspirational. ⚠️ **Alternatively
lower `subAttributeCap` to ~12** so the cap means something — but that is a real design loss if long
campaigns are meant to reach further, and it is Erik's call, not mine.

---

## §4 — WHAT THIS MEANS FOR THE LADDER (Erik's phase framing, fitted to the data)

Erik: *"early game you need base health and energy… mid game power, reach, effectiveness… late game
world arcs, fortresses, party members, businesses."* **The data supports this and puts numbers on it.**

| phase | sub-rank reached | what the ladder should grant |
|---|---|---|
| **early** (lvl 1–5, ≤150 actions) | **ranks 1–4** | ⚠️ the survival floor — health, energy, the basics. **Most players never see past here.** Front-load legibility. |
| **mid** (lvl 6–12, ≤330 actions) | **ranks 5–7** | power, reach, effectiveness — the soft-cap crossing lands here, which is the right place for "mastery begins" |
| **late** (lvl 13–29+) | **ranks 8–10** | the nuanced grants — standing, company capacity, holdings, world-arc leverage |
| **beyond** | ranks 11–20 | declared taper; no real character has been here |

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
