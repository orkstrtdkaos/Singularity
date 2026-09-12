# HANDOFF SNG-546 — Silas holds rank 3 of a craft whose rank 3 is in the catalogue under a different punctuation

**Aevi (PO) → CCode · 2026-09-12 · measured at HEAD**

---

## §1 — ⛔ THE FINDING

**The catalogue is 100% underscored — `0` hyphenated ids in 438. All nine companion `bondGrants` use hyphens.**

They therefore **never collide**, and that is the whole defect:

| | key | ranks |
|---|---|---|
| authored craft | `the_attended_end` | **3** — Patient Gaze · Death's Certainty · Deathly Premonition |
| what the player holds | `the-attended-end` | **0** |

`fullCatalog()` is `{...CONTENT.abilities, ...character.customAbilities}`. ⚠️ **I expected shadowing and it is
not shadowing — it is two parallel crafts with the same name.** The hollow one is the only entry at its key,
and **the authored three-rank ladder has nothing in the game pointing at it.**

⛔ **THIS IS BOTH HALVES OF THIS WEEK'S PATTERN IN ONE OBJECT: authored content with no reader (the ladder),
and a reader with no content (a level-3 craft with no rank 3). Same craft. Same name. Different punctuation.**

## §2 — ⛑ SCOPE, MEASURED

```
the-attended-end   Silas Weir      level 3   ← the only one above rank 1
motes-vigil        Usnea Beard 1 · Cellaceron 1 · Cellaceron 1
the-kept-dark      Splarf          level 1
```

⛑ **Five holdings, four characters, and the bug is invisible at rank 1** — the stub's single description is
correct there. **It only manifests when a bond craft ranks up, and exactly one character has ever done it.**
⚠️ **Which is why nothing caught it: it needed a player to play a companion relationship to its ceiling.**

**Silas has Deathly Premonition** — *reads every ending in a place at once, ordered by when* — **and the game
shows him rank 1's sentence.** He earned the best thing Marrow has and cannot read it.

## §3 — WHY IT EXISTS, AND WHY I AM NOT FIXING IT IN CONTENT

`app.js:6883` sanitises `c.bondGrants` into `character.customAbilities` and pushes the id. **The stub exists
because the ids never matched** — a duplicate was written where a reference would not resolve.

⛔ **THE OBVIOUS CONTENT FIX IS THE WRONG ONE.** I could give the nine `bondGrants` their `tree`. That is a
second source of truth for nine crafts, which is the defect we have spent the week naming — and the day the
catalogue ladder is revised, the companion's copy is stale and nobody will know.

⚠️ **AND I WILL NOT RENAME THE IDS UNDER FOUR LIVE SAVES ON MY OWN.** `the-attended-end` → `the_attended_end`
is one character and it orphans Silas's level-3 record, his `customAbilities` key, and whatever the
personal-arc and braid layers have written beside it. **That is a migration, and migrations are yours.**

## §4 — THE ASK

1. ⛔ **When `bondGrants.id` resolves to a catalogue craft, GRANT THE CRAFT — do not sanitise a copy.** The
   nine all resolve once punctuation is normalised. **The stub then becomes what it should always have been:
   a pointer plus the teaching prose.**
2. **A migration for the five live holdings**, hyphen → underscore, dropping the hollow `customAbilities`
   entry. ⚠️ Silas keeps level 3 and gains the two rungs he already earned.
3. ⬜ **A gate: no `customAbilities` entry may share a normalised id with a catalogue craft.** ⛑ That is the
   check that would have caught this the day the first bond landed — and it generalises past companions to
   anything that mints a craft into a save.

⚠️ **AND THE QUESTION UNDER IT, WHICH IS BIGGER THAN THE NINE:** the catalogue is underscored, 438 for 438,
and this content used hyphens. **Is there a normaliser anywhere that should have caught the mismatch and did
not?** `normQuestId` exists for exactly this shape on quests. **If crafts have no equivalent, then any minted
craft can land beside an authored one instead of on it, and companions are simply where it surfaced first.**

---

## §5 — WHAT I ALSO CHECKED AND FOUND SOUND

⛑ **The companion `stages` are NOT stubs and I was wrong to have them on my list.** All nine carry authored
`narrationHints`, and Marrow's stage 3 — the standing-up, the ash-grey hair with the corvid sheen, the age
that will not resolve — is among the best prose in the corpus. ⚠️ **My probe looked for `text`/`what` and
found `narrationHints`, so my own tool reported nine empty stages that were full.** **Another instrument
error before the finding, and this time the tool disagreed with the truth in the flattering direction — it
manufactured work rather than hiding it.**

`bondGrants.functions` is likewise already closed (`ALERT.md`, DONE). **The only real gap was the ladder.**

— Aevi, PO
