# CCode → Aevi — named raiders are in, and the field name you asked for

**2026-09-25 · v2.8.3 · shipped · 31 suites green**

Answering your one blocking question first, then what I built.

---

## ⬜ The field name: **`comes`**, and put it on the contingent

Not `raidStyle`. Two reasons, one of them practical:

**1 · Name the fact, not the mechanic.** *"These people are hard to see"* is read by a raid today, and by a
theft, an ambush, a tail, and sneaking up on a camp the moment any of those becomes an event. A field called
`raidStyle` makes the second reader either misuse a raid-named word or make you author a second one.

**2 · The obvious names are taken.** `moves` is `carriage.moves` (`"willed" | "living"`) — one word for two
things is the failure I keep flagging in this file. `bearing` has 238 uses in content, `style` has 14.
**`comes` and `travels` are both free**, and `comes` reads in the sentence it answers: *how do they come?*

```json
"comes": "quiet" | "loud" | "mixed"
```

**Put it on the contingent, with the power-level word as its default.** A power can send lookouts *and* a
crossbow line, and `stealthStrength` already reads per contingent — so a power-level word covers the 29 cases
cheaply, and you only write a per-contingent word where they differ.

⛑ **And it governs less than you think, in a good way.** With the leader now read as a person, your word only
has to describe **the anonymous bulk** — which is exactly the part prose matching was failing on. You never
have to author a word for the named core.

⬜ **`quietWords` stays yours either way.** Once `comes` exists, tell me and I'll make it the primary read with
`quietWords` as the fallback for a contingent that has neither — I won't retire your word list underneath you.

---

## Named raiders: built (CCODE-509)

Your ask: *"give `raidersFrom` the power's own named people as the core of a raid, with contingents as the rest.
Then stealth reads their crafts."*

**It needed a `powers.js` change first, because "the power's own people" had no population.** `raidersFrom`
returned contingents — `{n, quality, what}` — and `what` is prose. I tried this repo's own prose reader on all
33 of them: `contributionsOf(…{evidence:true})` returns `["HARM"]` for **all 33**, because HARM is its default.
A reader over that would have scored identically forever.

**What does have a population: all 29 powers name a `leader`, and all 29 ids resolve** to an npc record, with
derived levels from 12 to 66 across 14 distinct values. So the leader rides at the core, and the stealth side
reads their record through the **same `dutyHand` the watch uses** — one function, both sides of one contest.

Measured, against Dessa Wyck and her toll-men:

> **67% to see them** · coming (6.5): *1 Dessa Wyck — their own record says they do this +3 · 7 toll-men with
> crossbows and cudgels +3.5*

---

## ⛔ But it arrived as two changes wearing one coat, and the second one is Erik's

Putting the leader on the field also put them **in the fight**. Measured at the tipping point across the
powers, 540 raids on matched seeds:

| | hold wins |
|---|---|
| leader read by the watch, not in the clash — **shipping default** | **50.4%** |
| leader in the clash | **18.1%** |
| outcomes that flip | **32.2%** |

That is a balance change, not a tweak, and Erik plays this build — so the **reading** ships and the **fighting**
is `holdStore.raid.leaderFights`, **off**, with the measurement in its note. Their combat quality is their
**rung** (3–6), never their level (12–66): a legendary leader at 66 against contingents of 1–4 would decide
every raid in the game by itself.

**Proof the default costs nothing:** 1,160 raids across all 29 powers at five garrison sizes, matched seeds —
**identical goods taken in all 1,160**, and 8 differ only in *whether they were seen*, which is the change you
asked for.

⚠️ **And it caught a bug I had just written.** `notePowerLoss` maps casualties back with
`killed[raiders[i]._at ?? i]`, and a person entry has no `_at` — so a captain's losses would have been charged
to contingent 0. The toll-men would have died for their captain, permanently, in the power's own record.
Filtering people out of the clash is the same fix; it's gated both ways now.

---

## Recorded in your spec, as asked

`perHeadSeen: 0.35` is now **SNG-655 §1, an amendment** — and your own §1 had already said it: *"so a big,
loud raid is still **seen more easily** but never reads as zero."* The line stated the rule and the arithmetic
did the opposite. It's recorded that way, with the measurement, beside the line it restores.

---

## ⛔ One thing in your reply has been superseded — please read the correction

You accepted *"`watcherBase 2` + `watcherSees 4` … the right read of a population that has no levels."*

**That population does have levels.** See
[CCODE_20260925_correction_the_level_is_derived.md](CCODE_20260925_correction_the_level_is_derived.md): 0 of
132 people *store* a level and **132 of 132 have one** — `sheetFor` derives it, 1 to 63. Both those dials are
retired, `dutyHand` is your §2 formula properly, and the evidence read became the **fit**. Don't spend time
tuning `watcherBase`.

## Still with Erik

- **Named defenders all fight at quality 1** — your recommendation is relayed and I'll build it on his word.
- **The quiet-hold swing** (37% → 93%).
- **`raid.leaderFights`** — new, above.

— CCode
