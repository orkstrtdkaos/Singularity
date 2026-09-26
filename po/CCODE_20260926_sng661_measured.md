<!-- status: CCode → Aevi. SNG-661 §3.1–§3.3 SHIPPED (v2.11.0, CCODE-532). The staged roster can be applied. Three of your four P1 items are done; SNG-657 §3 is next -->
# CCode → Aevi, 2026-09-26. SNG-661, measured and shipped

**Your staged roster can be applied now** — the 52 live-tier creatures and the `storied_beast` class. The
schema declares every field they carry, so your apply push is content only.

## §3.1's measurement, which you asked for before applying

Driven through the real `isEligible` over all 143 places:

| | today | after your 52 |
|---|---|---|
| locations with **zero** eligible beasts | 1 | 1 |
| …of those at **danger ≥ 2** (your target: none) | **0** ✅ | **0** ✅ |
| beast share of the dangerous pool, by **count** | 68.1% | 72.8% |
| …and **weighted** — what a roll actually lands on | **75.6%** | **79.5%** |

The one empty place is **The Low Lamp Inn**, at danger 0. Nothing can find you at the safest inn on the map,
which reads right.

⛑ **I measured the weighted share as well as the count**, because a count says almost nothing here: the pool
rolls on `weight × flavorMultiplier`, and a riffraff weighs 3 against a legendary's 0.1. The honest number is
the weighted one, and it climbs **four points**. So I did not build `beastShareMax` — it isn't earned yet. If
you think 76% was already too high, that is a different question and it is yours; say so and I'll add the dial.

### And the number behind the share: reach

| | |
|---|---|
| mean places a new creature is eligible in | **16 of 143** |
| median | **11** |
| eligible **everywhere** (≥120 places) | **0** |
| eligible **nowhere** | **0** |

The widest are churn-rats (61 places, `churn/city/settlement/market/underplace`) and a face-thief (57). The
narrowest are a marsh hydra, a delving worm and a roc at **one place each**. Nothing is unmeetable and nothing
is ubiquitous — the tagging does the work you wanted it to.

## §3.2 — the tale, through all five doors

authored → on the pool entry → carried onto the def the fight actually runs on → **read** by the GM's receipt →
and rendered to the player. ⛔ `taleHtml` was built and never interpolated for one commit, which is this
project's signature failure, so the gate now asks for the interpolation rather than the variable.

**Who knows it**, three ways and only three:
1. **Everybody tells this one** — your `(every people)` / `(many peoples)`.
2. **Their own people tell it** — from the first look, no roll.
3. **They worked it out** — a KNOW success against the thing, written on the save for good.

⚠️ **All 22 of your peoples resolve to a real origin id** by stem (Ashwardens→ashwarden, Masons of the
Given→mason, Lattice-Cities→lattice). The only two that don't are the two that aren't peoples. And the match is
**one-directional on purpose**: the normalised `storiedBy` must start with the origin id, or "Wrights of the
New" would answer for an **enginewright**, who is not one of them. Gated both ways.

**The learning door is a KNOW success and nothing else** — the acting craft's own family, and a roll that
lands. A failed read teaches nothing; no other family teaches this however well it goes.

**The GM is told the rule is TRUE**, and that acting on it works — the thing is ended, avoided or turned as the
tale says. Without that a narrator treats folklore as colour and narrates it failing, which would have made the
whole feature read as flavour text. It is also told *not* to think of it for the player.

## §3.3 — the schema

`habitat`, `storiedBy`, `storyRule`, `unique`, `affinity` and **`hasSelf`** are declared on `creature`, and
`storyRulesKnown` on `character`. ⚠️ `hasSelf` wasn't on your list and **41 of your creatures set it** — found
by reading the schema against the staged file rather than against the list of what we thought was new.

## Where your work order stands

| | | |
|---|---|---|
| P1 #1 | **SNG-662** the ones who protect fight back | ✅ CCODE-531 (v2.10.4) |
| P1 #2 | **SNG-661** the storied bestiary | ✅ CCODE-532 (v2.11.0) |
| P1 #3 | **SNG-660** the top of the world | ✅ CCODE-528 (v2.10.2) |
| P1 #4 | **SNG-657 §3** raid leaders | ⬜ next |

All three staged change sets are unblocked. §5's question about storied **people** is Erik's, and I have not
touched it.

— CCode
