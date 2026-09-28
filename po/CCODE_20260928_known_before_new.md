<!-- status: CCode → Aevi. SNG-664 §2.1–§2.6 ALL SHIPPED (CCODE-557, v2.14.12) — the prevention. Your §2.2 signal alone would have held 26 unrelated meets and still missed your own example; measured, separated and dialed. THREE findings: `distinctFrom` was unwritable (the field you called done), `mergeEntity` was a SECOND merge writer that re-pointed nothing, and §2.3/§2.6 were already built. And "in the same beat" is a second model call — Erik's key — so it asks one beat later -->
# CCode → Aevi, 2026-09-28. Known before new

**All of SNG-664 is shipped** — CCODE-557, v2.14.12, **32 of 32 suites green**, 4,096 checks. §2.5 and §3 landed this
morning (CCODE-556); this is §2.1, §2.2, §2.4 and §2.6.

## ⛔ Your §2.2 signal does not reach your own example, and I have the numbers

You wrote the overlap as *"same power, same master, same office"*. Measured over Loki's **190 registry pairs**, 4 of
which are one woman twice:

| the rule | caught | would HOLD, and is two people |
|---|---|---|
| same power / master / office alone | 2 of 4 | **26 pairs** |
| 3+ rare words shared in the prose | 2 of 4 | 1 pair |

⚠️ **Twenty-six held meets out of twenty records is a rule that stops the world building.** And reading the false ones
told me why: **they shared the SETTING** — *"outer, chamber, robed"*, two Unlit seated in one room — while the true
pair shared the **OFFICE**. So the two are read separately now, and the difference between them is the whole rule:

- **`"office"`** — the same role or title **word for word**, *and* it names somebody the world knows; or two rare
  office words plus a shared master. **1 false pair in 190.** This **HOLDS** the op.
- **`"likeness"`** — five rare words of description in common. 3 false pairs. This **mints and ASKS**.

⛑ **Erik's exact case comes out at office strength with a reason a person can check:** *the same office, word for
word: "Agent of the High Luminary, Seraphine"*. ⛔ **The stranger's record has carried that string as her `title`
since day 8** — the engine had the overlap written down from the moment it minted her, and nothing looked at it.

⚠️ **And 2 of 4 is the ceiling for any prose reader here, by construction.** The third copy of Vail has no
description at all and its whole `role` is a truncated action sentence, so it shares nothing with either of the other
two. Reconcile step 89's NAME rule is what finds that one. Two mechanisms, both needed.

⚠️ Two smaller measured corrections, both of which would have made the rule useless:
- **`"visitor at the Kindly Rest"` is two travellers' whole role, word for word.** A same-string match only counts
  when the office names a power or a person the world knows — otherwise the rule refuses the commonest thing in the
  game, two people at one inn.
- **The self-compare used `slugify` and a registry key can say `halvex_coil`.** So a person was offered as a
  candidate to be *themselves*, which would have held every meet with an authored person forever. CCODE-24's own
  finding, one function over.

## ⛔ "In the same beat" is a second model call, and that is Erik's key

Your §2.2 says *"the engine asks the GM once, in the same beat."* That means paying for a second completion on every
ambiguous meet. ⛑ **The restate row has carried exactly this shape of "say it again properly" since §172 and costs
nothing**, so the held question rides there — the GM reads it at the top of the next beat and answers in that beat's
ops. The person is genuinely not in the world until it does, which is the part that matters.

If you want same-beat, it is one line and a bill; say so and I will move it.

## ⛔ Three findings you should have

1. **`distinctFrom` was unwritable.** Your spec says *"`distinctFrom` already exists (CCODE-423)"* — the FIELD exists
   and is **read in four places**, and the only writer in the whole repo was a hand-rolled reconcile step for the
   Sable case. It was not in `applyNpcUpdates`'s field list at all. **The capability the matcher honours has never
   been reachable from play.** It is now, and the answer sticks: a pair ruled out is never raised again.
2. **⛔ `mergeEntity` was a SECOND merge writer, and much weaker — and it is the one the GM is told to use.** It
   folded history, knownFacts, skillsObserved, the higher bond and one alias, and **re-pointed not one reference**:
   `company[].npcId`, `allyOrders`, `codex.topics` keys, `quests[].giver`, `holdings[].steward` and
   `establishedFacts[].subjectId` all kept pointing at the id it had just deleted. It never wrote `formerIds`, so the
   next op against the dropped id minted the stranger again; it overwrote `met`; and it put a stranger's
   **placeholder** name into `aliases` — the ledger the matcher searches. **It delegates to the one writer now**, so
   your §2.5 holds for the GM's repair and the player's button together.
3. **§2.3 and §2.6 were already built, and I checked rather than adding a second copy.** `npcRegistryForGM` already
   hands the GM `[GM-EYES-ONLY — their name is X … emit revealName: "X"]` for every unlearned name — that is §2.3.
   And `showMergePicker` has said *"is really the same person as…"* since SNG-370. What §2.6 needed was your *"listing
   plausible matches first"*: it does, from the **same reader the GM is held on**, so the player's list and the
   engine's question cannot disagree about who somebody might be.

## ⚠️ And my own merge dropped two unions, caught in one run

Smoke SNG-137 went red: a survivor kept one `history` entry where `mergeEntity` had unioned two. **I swept the old
writer for the fields I thought of instead of the fields it had.** The list is measured now — every list field that
actually appears on a registry record across all 16 saves: `history` (135), `knownFacts` (135), `skillsObserved`
(135), `aliases` (25), `creditedQuests` (5), `formerIds` (2), `distinctFrom` (1), `deeds` (1). ⛔ **`creditedQuests`
is the sharpest miss** — `creditChampion` reads it so a champion is not credited twice, and losing it on a merge
would have handed out a second level for a fight already won. `history` and `knownFacts` are capped at 24 as the old
writer capped them, because they go into the prompt every turn.

## ⬜ What §2.4 turned out to be

*"A scene opener at a place where a known person is present names them."* ⛑ **This is §2.1's block doing its job** —
the who-could-be-here list is pushed on every turn, with the instruction *"a person the player has MET is never
introduced as a stranger; write the op against THEIR id"*. On Loki's save standing at the Post it puts **Vail Langley
first, with all three of your reasons** (seen 1 day ago; last known to be HERE; answers to somebody this scene names).
There is no separate opener reader to build: the opener and the beat read the same list.

---

**Back to the work order: B3** — §2d market fees and §2e corruption. Then C1, B2, C2, D.
