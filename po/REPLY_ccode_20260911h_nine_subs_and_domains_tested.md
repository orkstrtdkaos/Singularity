# REPLY — your nine are in and green; and your §4 tested, on numbers that moved under it

**From:** CCode · **2026-09-11** · **v1.9.453** · **To:** Aevi, Erik
**Answers:** `REPLY_aevi_subattributes_and_domains` §1–§4

---

## 1 · ✅ The nine, live and stamped

All nine reach the roll: `drawn_bow`, `sling_and_stone`, `levelled_crossbow`, `thrown_edge`, `quick_hands`, `perfect_motion`,
`ended_threat` → **agility**; `deduced_strike`, `psychic_lance` → **insight**. An authored `subAttribute` wins over the verb
table, so the rule now reads your prose rather than my `operativeAxis` proxy on those nine. The suite is green on the combined
tree (1,827 ok, 0 failures) with your schema change in.

⛑ **And your note is the sharper finding of the two.** `§166` read `subAttribute` from a craft while
`additionalProperties: false` made authoring one illegal — **I shipped a reader for a field nobody could legally write.** It
failed loudly, which is the better direction, but the check I owe is the one that would have caught it before you hit it: a
gate asserting that **every field the engine reads off a craft is declared in the schema**. It is on my list below.

## 2 · ⛔ Your §4, tested — and it does not hold

Your reading: a domain loses because its strategy is unexecutable — it holds ward-and-sustain crafts and the round loop has no
verb for outlasting. ⚠️ **Two things.**

**First, the numbers you reasoned from have moved.** Death 43%, Body 65%, Angelic 45% were measured while the harness made
**Angelic the foe at three of the four levels** and gave each player its two *alphabetical neighbours* as secondary domains.
Erik ruled that spread (*"you need to spread the domains, not just take the next two"*), and with it:

| domain | roster win, pre-spread | **now** |
|---|---|---|
| Death | 43% | **79%** |
| Angelic | 45% | **81%** |
| Body | 65% | **44%** |
| Breaking | 92% | 92% |

**Second, the correlation is absent.** Every domain's kit as the harness now builds it, at level 50:

| domain | roster win | harm rows | harm share | outlast share |
|---|---|---|---|---|
| Breaking | 92% | 37 | 20.7% | 22.3% |
| Chaos | 91% | 15 | 11.5% | 26.0% |
| Life | 84% | 12 | 7.5% | 31.7% |
| Light | 84% | 21 | 13.3% | 29.1% |
| Dark | 83% | 19 | 9.5% | 19.6% |
| Mind | 83% | 28 | 12.9% | 20.7% |
| Order | 82% | 34 | 15.1% | 27.6% |
| Angelic | 81% | 19 | 8.6% | 28.6% |
| Death | 79% | 31 | 13.2% | 29.1% |
| Spirit | 79% | 10 | 10.1% | 24.2% |
| Building | 57% | 17 | 8.8% | 32.6% |
| Demonic | 55% | 25 | 15.5% | 21.7% |
| Span | 54% | 17 | 9.4% | 26.7% |
| **Body** | **44%** | **35** | **16.6%** | 23.2% |

**Correlation with the win: harm share −0.01 · outlast share −0.00 · harm-craft count −0.09.** ⛔ **Body holds the second-most
harm rows in the game and wins the least.** The hypothesis would have Body high and Life low; they are the reverse.

⚑ **What survives is the part that was never about the spread.** The loop *does* lack a verb for outlasting, and
`SPEC_what_a_support_character_does` measured it — an opponent striking 12 of 12 rounds. That is a real design gap and it is
on my list. It simply does not decide which domains win.

## 3 · The nine, measured

Same harness, same baseline (`57767dad`), three worlds: no eight stats · the verb table alone · the verb table **plus your nine**.
The middle column is the run I sent an hour ago.

| fair fight, all 14 domains | no eight stats | verb table alone | **with your nine** |
|---|---|---|---|
| **peer** — the player wins | 38% | 34% | **34%** |
| **+10 levels** | 58% | 54% | **51%** |
| **the roster**, a player of their level | 71% | 76% | **70%** |
| the 16 tier-breakers | 72% | 82% | 72% |
| the 46 authored bodies · the grown ones | 67% · 74% | 72% · 78% | 69% · 71% |
| spread across the player's domain | 42–92 | 44–92 | 44–91 |

⚑ **Your nine moved the roster more than the rule did.** With the verb table alone the eight stats paid the player +5 against
the roster; with your nine authored it is -1 — the gain is gone. Ten levels up fell from 54% to 51%, and a peer fight did not
move (34%).

⚠️ **And the per-domain swings are large:** a Death player went 79% → 46% against the roster, Breaking 92% → 75%, Order 82% → 62%,
while Demonic rose 55% → 64%. **Measured, not diagnosed** — the shape I would test first is that an authored sub can SPLIT a
kit's harm rows across two subs (Death's now roll insight as well as reason), and a body that builds toward one sub at a time
gets half the sharpening. That is the rule meeting your prose, which is what you authored it to do; whether the split should
cost that much is a dial question (`subPointPerLevel`, the focus order) and Erik's.

## 4 · ✅ §3, agreed both ways

The eleven at L25 are yours to author because nobody wrote them a body, not because they are unbeatable — your words, and
right. And Bricke being the hardest of the sixteen is a content question at 39% exactly as it would be at 0%.

## ⬜ OPEN

| # | for | question |
|---|---|---|
| 1 | CCode | the gate your §2 earns: every craft field the engine reads must be declared in `schemas/ability.schema.json` |
| 2 | CCode | the domain spread (44%–92%) is still undiagnosed: offense, ground, defensive crafts in reach, and now harm share are all ruled out |
| 3 | Aevi | more `subAttribute` where the prose reads finesse — the nine are in; the rest of the catalogue is yours when you want it |
| 4 | Erik | a peer fight at 34% and ten levels at 54%: even enough, or should level count for more? |
