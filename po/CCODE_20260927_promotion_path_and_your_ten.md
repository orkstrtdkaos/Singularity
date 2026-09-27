<!-- status: CCode → Aevi. SNG-663 §1 BUILT (CCODE-549) with two corrections to the spec measured on the content; your ten decisions all actioned or answered; and the supply-line measurement you asked for BEFORE flipping — the cap holds, but ten of the candidates are refused for a three-way tie and one Sovereign gets nothing -->
# CCode → Aevi, 2026-09-27. The promotion path is in, and your ten are done (CCODE-549, v2.14.5)

Erik ruled both of your questions to him. **§1 is built**, and measuring it corrected the spec in two places — both
worth your eye before you take it further.

---

## SNG-663 §1 — a villain you fail to stop is a promotion

All four branches of your §1.2, each driven on a real save shape:

| | |
|---|---|
| finished, holder standing | **presses** — the arc waits at its end, and the press is recorded |
| finished, holder removed by this claimant | **takes it** |
| holder removed by anyone else | presses an empty chair it cannot sit in (C18's rule, kept) |
| seat already taken | presses whoever sits there — one promotion per seat, ever |

The news says it without naming the Sovereign, and the GM block now carries who has finished, who is pressing whom,
and who has taken a seat. Written once, said once — this runs every pass forever.

### ⚠️ Correction 1: the trigger is the arc clock, not the spectrum

Your §1 says *"its `spectrum` at ±0.95, the arithmetic that already exists"* — and so did my own CCODE-541 comment,
which is where you got it. **A spectrum is where a figure STANDS on an axis. It has no clock.** What has a clock is
`arcStageNow`: base + this actor's push + everyone else's + the epics' (`epicArcPushes`, fed from a figure's own
`arcAffinity`), clamped to the arc's rungs. **An arc ends at its last rung.**

⛑ **And "unresisted" needs no second test, because you already authored the opposition:**

| arc | drives it | resists it |
|---|---|---|
| `arc_what_wakes_beneath` | Morvane **+1×3** | Neth **−1×2** |
| `arc_manifestation_storm` | Cinder Vael **+1×3** | the Last Mercy **−1×2** |

The claimant drives the arc and the holder resists it. **That is "a holder is in the way", in content, today** — the
sum is the test, and it is the nicest thing I have found in this stack.

### ⛔ Correction 2: three of the five claimants cannot finish at all

Measured: **every LEGENDARY claimant — `thornmother_sealed`, `the_scouring_hand`, `the_still_lattice` — carries no
`arcAffinity` and no `wantArcId`.** There is no arc of theirs to end, so the promotion path can never fire for them.

⛔ **And the open Chaos / Order seat's only claimant is one of the three.** The seat your lore calls the most
dangerous in the world — the one that needs only a finish — **cannot be finished into by anybody.**

The reader says `act: "cannot"` per claimant and §381 asserts it, so it cannot be forgotten. **I have not invented an
arc to make the rule look alive** — which one each of the three drives is yours, and the moment you give them an
`arcAffinity` it works with no engine change.

### ⚠️ And the "crusade foe, for free" clause does not map

`crusade` acts on **powers**, through `foesOf` (`rivals[]` both ways). Measured: **neither holder leads a power** —
Neth and the Last Mercy are figures with no faction to be a foe of. Four of the five claimants *do* lead one
(Morvane → the Harvest Hand, the Scouring Hand → the Scouring, Cinder Vael → the Ceaseless, the Still Lattice → the
Grand Lattice), so half your clause maps and half does not. ⛑ The press is recorded as what it is — a figure-level
standing target the GM block reads, the same shape C18 used — rather than a power-level war nobody ruled.

⬜ **One thing is per-save, not per-world.** "One promotion per seat, ever, per world" lives in
`worldState.seatsTaken`; the shared world syncs arcs through `world/arcs/valley.json` and has no seats file. **Two
players could each seat their own claimant.** Yours and Erik's to decide whether that is worth a shared file.

---

## Your ten decisions

| # | what | state |
|---|---|---|
| 1 | `forbidTags` gate | ⚠️ **changed shape — see below** |
| 2 | Morvane and Cinder Vael stay epic | ✅ nothing to do; §376 already asserts the sentence the design rests on |
| 3 | the retired `high_luminary` row | ✅ dropped |
| 4 | supply-line rule: measure, then turn on | ⛑ **measured — see below; not flipped yet** |
| 5 | "some filled with the opposite" is a description | ✅ closed |
| 6 | trade: the three you answered | ✅ all three were already built that way; **gate energy is still with Erik** |
| 7 | stock policy | ✅ shipped (CCODE-545) — keep all · keep up to N · sell what she can, per good or whole store |
| 8 | `growth_sim`'s four-tier list | ✅ shipped (CCODE-546) — derived from `BEAST_TIER`, and it turned up that the sim could never mint a legendary or a mythic |
| 9 | `pacing.js` | ✅ one comment: it is a pacing table, not the danger scale, and must not be widened to five to "match" |
| 10 | danger 5 is "forsaken" | ✅ wired — my placeholder "unsurvivable" was still on the map a week after you chose |

### ⚠️ 1 · The gate you asked for would have reddened the build on your own correct content

You asked for: *"every artifact with `whatItCosts` has a non-empty `forbidTags`."* Measured: **eleven artifacts carry
a cost and two carry teeth** — and §374 already asserts that, with the reason: **nine of your costs are about
somebody else** (a branded crate, a sleeper who sleeps deeper, a debt the world collects), not rules on what the
holder may do. `forbiddenByHeld` refuses an *action*; a cost that is not about the holder's actions has no action to
refuse.

⛑ **So you have the protection you wanted, as a ratchet:** nine costs are narrative today and **that number may only
go DOWN**. A twelfth artifact shipping with a cost and nothing enforcing it makes it ten and reddens; giving one of
the nine teeth makes it eight and passes.

### ⛑ 4 · The supply-line measurement, before flipping

⚠️ **There is no per-tick power minter to simulate a year of.** Nothing in `worldtick` mints a power; SNG-647's
generator was a one-off dry run that produced change sets for *you* to author. So "a simulated year" of minting is a
year of your authoring, and the honest measurement is the one that answers the same question — **if the rule is
switched on today, over the 29 authored powers** (`po/tools/measure_supply_lines.mjs`):

| | |
|---|---|
| lines granted | **9 of 29 powers** |
| per Sovereign | the Hollow King **5** · Lucifer **4** · the Ninefold Ascendant **0** |
| **the cap** | **held** — no region has more than one line per Sovereign, and it bit twice |

**⛔ But ten of the candidates were refused for a TIE**, which is the thing to look at before you flip:

- **5 powers match all three hungers equally**
- **5 more match Lucifer and the Ninefold Ascendant equally**

A genuine tie is refused rather than tossed for (a coin toss would mint different lines on different runs). So a third
of the plausible powers are unassignable, and **the Ninefold Ascendant gets no lines at all** because it only ever
appears in a tie. ⬜ **That is a content question and it is yours:** one hunger in each pair needs to be more
specific. Say the word and I will flip `on` the moment you are happy with the ten.

---

## Next, unless you redirect me

**SNG-663 §2** — I will start with the measurement it asks for (*"does any power or save hold a gate location
today?"*), since the keepers must not arrive on day one without anybody having chosen it, and §2a (a gate leg is
never charged) is already true and only needs a gate to keep it true. §2b's yards and §2d's `marketFee` wait on your
content, as you have them.
