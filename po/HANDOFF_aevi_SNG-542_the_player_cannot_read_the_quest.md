# HANDOFF SNG-542 — The empty quest stages: the fix is shipped and the player's own panel does not call it

**Aevi (PO) → CCode · 2026-09-12 · measured at `4c601ff`, Silas's live save**

---

## §1 — ⛔ THE FINDING, IN ONE LINE

⛑ **`hydrateQuest` already repairs all three broken quests. `app.js` does not import it.**
**The GM can read the quest text. The player cannot.**

## §2 — WHAT ERIK SEES

Three active quests render with blank stages — **The Stag That Won't Die**, **The Mercy That Won't Ask**,
**The Wyrm of Endings**. In the Quest Log all three read **`resolve`** where the others read a real objective.

⛔ **`app.js:12283` — `s?.objective || "resolve"`.** The word on Erik's screen is the fallback string. **He
was looking straight at the tell and so was I, for a week, in a log I have read a dozen times.**

## §3 — ⛑ THE MEASUREMENT

**In the save:** `"stages": [{}, {}, {}]` — literally empty objects. **Everything else on the record is
complete**: premise, stakes, axis, traditions, giver, tier, and fully authored outcomes with narration and
effects.

**In the content:** ✅ **all three are perfect.** `content/packs/valley/quests.json` carries `id`, `title`,
`objective`, `condition`, `imagePrompt` on every stage, and ⛑ **zero of the 17 authored quests have an empty
stage.** The authoring was never the problem.

**The discriminator I chased first, and it was a red herring worth recording:** the three survivors author a
`change` field on their stages and the three casualties do not. ⚠️ **That correlation is real and it is not
the cause** — `structuredQuestRecord` picks `id`/`objective`/`condition` explicitly, so a missing `change`
could never produce `{}`. **I nearly filed the correlation as the mechanism, which is the third time this
week.** The real answer is that the record was written from a def whose stages were already blank.

**And it does not matter, because the read path already fixes it:**

```
the-light-that-will-not-dim    raw 4,4,4 -> hydrated objective lengths 34,41,43
the-stag-that-wont-die         raw 0,0,0 -> hydrated objective lengths 168,157,136
the-mercy-that-wont-ask        raw 0,0,0,0 -> hydrated objective lengths 148,134,142
the-wyrm-of-endings            raw 0,0,0,0 -> hydrated objective lengths 160,149,150,134
```

⛑ **`hydrateQuest` fills every one from the def, matches by id then index, and correctly drops the trailing
empty fourth stage on `the-mercy-that-wont-ask`** — which its own comment names by hand. **You wrote the
cure and it works on the exact records Erik is looking at.**

## §4 — ⛔ WHY IT IS NOT REACHING HIM

`engine/quests.js:244`, in its own words: **"PURE. Every quest on a character, read through the def. The one
call a consumer should make."**

⛔ **`questsFor` IS NOT IN `app.js`'s IMPORT LIST.** Line 18 imports eleven things from that module and
neither `questsFor` nor `hydrateQuest` is among them. **`questsForGM` hydrates when handed defs — so the GM
prompt gets the words.** The player's surfaces read `character.quests` raw: the quest detail panel, the codex
block at `11663`, the log at `12283`, the card at `14843`, `activeQuests` at `2241`, `8463`.

⚠️ **THIS IS THE WEEK'S CLASS IN ITS PUREST FORM, AND IT IS WORSE THAN THE OTHERS.** The nine rules files
were authored with no reader. The sixteen exports were built with no caller. **Here the reader exists, is
correct, is documented as the only call a consumer should make — and the consumer the content was written
FOR is the one that does not make it.** ⛔ **The GM knows what the quest says. The player is told `resolve`.**

## §5 — THE ASK

1. ⛔ **The player's quest surfaces read through `questsFor`.** Not each of the six patched — **one reader,
   the way CCODE-186 put `keepableRegen` at the one place eleven lightbox surfaces pass through.** That is
   the shape that worked; this is the same shape.
2. ⚠️ **A gate: no player-facing quest surface may read `character.quests` directly.** ⛑ The `questsForGM`
   half has been right for weeks *because something gated it.* The player half had nothing.
3. ⬜ **Optional and lower value: the three blank records could be repaired in place.** ⛔ **I would not
   bother.** `hydrateQuest` is the better answer — a content fix reaching a started quest is the whole point
   of it, and repairing records teaches nobody anything.

⚠️ **AND ONE THING TO CHECK THAT I COULD NOT:** whether the blank `def.stages` those records were written
from came from the GM emitting a structured quest with arity but no prose. **If so the write path has the
same hole as the read path**, and `hydrateQuest` is currently hiding it — which is fine until content is
retired under a live save, at which point *"the snapshot IS the answer"* and the answer is `{}`.

---

## §6 — ERIK'S RULING THAT COVERS THIS

> *"a quest generated, or an encounter needs to have a complete structured arc built at time of creation…
> how it's accomplished and revealed is the play."* — Erik, 2026-08-03

⛑ **The authored content honours that ruling completely.** Premise, stakes, stages, conditions, outcomes,
narration and effects, all present at creation. ⛔ **The ruling was obeyed by the author and lost by the
reader** — the arc was whole, and the revealing showed a blank.

— Aevi, PO
