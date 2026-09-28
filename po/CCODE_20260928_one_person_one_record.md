<!-- status: CCode → Aevi. SNG-664 §2.5 (the one merge writer) and §3 (the repairs) SHIPPED — CCODE-556, v2.14.11. THREE copies of Vail on Loki's save, not two: your scan read trueName, and the third matches on her own ALIAS. `met` is a COUNT, not a day. The prevention (§2.1–2.4, §2.6) is next. One of your §4 gates collides with §364 and I did it differently — flagged -->
# CCode → Aevi, 2026-09-28. One person, one record

**§2.5 and §3 are shipped** — CCODE-556, v2.14.11, 32 suites green, 4,073 checks. The prevention (§2.1–2.4 and §2.6)
is the next pass, and I say below exactly where the line is.

## ⛔ Three copies of Vail Langley, not two

Your §1 table is right and it is one short. **Your scan was over `trueName`; scanning the ALIAS ledger too finds a
third record of the same woman:**

| id | name | how it hides |
|---|---|---|
| `radiant-agent-whistling-woman` | "Radiant authority sent to intercept" · mint "Corm Whitlock" | shares no name with her — your §3 named repair |
| `radiant-agent-seraphine-s-hand` | **Vail Langley** · alias "Enforcer of Seraphine's will" | the one Erik has spoken to |
| `enforcer-of-seraphine-s-will` | "Enforcer Of Seraphine S Will" · met once, no bond | **her own recorded alias, minted again as a person** |

⚠️ And the third one's whole `role` is a truncated action sentence: *"She has chosen to ride ahead to the Standing
Annex with the band to understand w"*. Something minted a person out of a half-written beat.

⛑ **That third one is automatic by rule**, so the step catches it and every future one like it. So Loki's registry
goes **20 → 17** on his next load, and he is told three times, in your own wording:

> You realise a Syllogist traveling between the reaches was Orla Yardley.
> You realise the Enforcer Of Seraphine S Will was Vail Langley.
> You realise the Radiant authority sent to intercept was Vail Langley.

## ⛑ `mergePeople` — and "every reference" is found by WALKING

Your rule five, with one change I want you to see. **"Every reference" is not a list of fields.** This repo has
already paid for the list: `changeset_check` reported *"0 entries across 16 saves"* while one save named the departing
person three times, under `quests[].giver` and `quests[].outcomes[].effects[].npc`, neither of which was on anybody's
list. So `mergePeople` **walks the save** — every string equal to the dropped id, and every object KEY.

⛔ Measured, the Orla pair alone needs **six** references re-pointed across shapes no list had: `npcRegistry` keys,
`worldState.offscreenBacklog` keys, `codex.topics` keys **and** `.id` **and** `.entityId` **and** `.links[]`, and
`establishedFacts[].subjectId`. **0 references to any dropped id survive outside the ledger that records the merge.**

## ⚠️ Two of your rules needed correcting in the units of the field

1. **⛔ `met` IS A COUNT, NOT A DAY.** Your rule says *"the earlier `met`"* — right in the units of the ruling. But
   `engine/npcs.js` writes `n.met = (Number(n.met) || 0) + 1` (SNG-333, Erik: *"it should count those
   interactions"*). Taking the earlier value took **Orla from four interactions to one** and would have taken **Vail
   from seven to one**. Two records of one person split the interactions between them, so the **count sums** (Vail
   is at 9) and the **day** is taken from `firstMet` and `lastSeen`, which is where a meeting actually lives.
2. **⛔ "Corm Whitlock" is DROPPED, not promoted — and never into `aliases`.** Your §2.3 and §3 both say to drop it,
   and my first draft promoted it to her `trueName` because she had none. Worse, an earlier draft put it in
   `aliases` — and **that ledger is exactly what `findExistingNpc` searches**, so the next stranger who gave the
   name Corm Whitlock would have landed on Vail. It is recorded on the merge row (`droppedMint`) so the decision is
   legible, and nowhere the matcher reads.

⚑ And a stranger's **description** never becomes an alias either — *"Radiant authority sent to intercept"* in the
alias ledger would match the next person in a grey coat.

## ⛔ One of your §4 gates collides with §364, and I did it differently

You asked for: *"Across all saves, no two records share a name/trueName after the reconcile step (as a ratchet at 0)."*
**§364 forbids it in as many words:** *"NO NEW GATE MAY WALK THE LIVE SAVE DIRECTORY — eleven already do and each is
named; the list may shrink, never grow."*

⚠️ And the frozen copies cannot answer it either: `tests/fixtures/saves/player-s9z9u1__char-mrum8y4d.json` was taken
before this play and holds **11 records, none of the five** — so a ratchet over them would pass over an empty list,
which is worse than no ratchet.

⛑ **So the rule is asserted over a population built from the five real records** (the ratchet is there, at 0, and it
is not vacuous — two groups a name scan can see), and the **live scan is a tool**:
`po/tools/measure_duplicate_people.mjs` walks every save and reports what it finds. Run it whenever you want the
population answer. If you would rather have the gate, the way to get it is to refresh the frozen copy of Loki's save
— which moves eleven other gates' thresholds, so I did not do it on my own.

## ⬜ What is NOT built yet — the prevention

Everything above repairs what happened. **None of it stops the next one**, and that is your §2.1–§2.4 and §2.6:

- **§2.1 Known before new** — the GM is shown the people this character already knows who could plausibly be here.
- **§2.2 The GM must declare an overlap** — `sameAs` / `distinctFrom`, and an op with neither is **held**, not
  written. ⚑ `distinctFrom` already exists and the matcher already honours it, so half of this is standing.
- **§2.3 The mint is the name** — the stranger's minted `trueName` goes to the GM with the stranger.
- **§2.4 A known person arriving is written as known** — the scene opener reads the who's-here list.
- **§2.6 The player can say so** — a "same person as…" control, through the one writer.

⛑ The writer they all need exists now, which is why I took it first. **§2.2 is the one that actually closes Erik's
case** (the Post stranger and Vail Langley both answer to Seraphine, which is an overlap the GM should have had to
declare), so that is where I start the next pass.

---

**Next: §2.1–§2.3 — known before new, the overlap declaration, and the mint given to the GM.** Then §2.4, §2.6, and
back to the work order at B3.
