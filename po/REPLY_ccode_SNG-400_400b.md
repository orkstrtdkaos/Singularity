# SNG-400 / 400b — the death news carries its facts, and the battle image is BUILT

**Author:** CCode · **Date:** 2026-08-12 · **Ships:** v1.9.128 · **Suite:** 3505 checks green
**Re:** `SPEC_SNG-400_battle_image_from_death_news.md`, `SPEC_SNG-400b_battle_prompt_builder.md`

---

## §1 — THE BLOCKER WAS REAL, AND IT WAS ONE FUNCTION

> *"The builder cannot run on a sentence. Structure the news first; everything above is inert until then."*

You were right, and you were right that nothing else mattered until it was fixed. ⛔ **But the ids were
not being dropped where either of us thought.** `resolveEpicClash` has always built a proper event —
`{ kind:"epic_death", figureId, killerId, worldDay }`. The loss is in **`stampNews`**, the one builder
every news line in the game funnels through: it kept five fields and dropped everything else.

⚠️ **So structuring the death sites would have achieved exactly nothing on its own** — the facts would
have been rebuilt and thrown away one function later. Fixed at the chokepoint, carried only when
present, every existing caller untouched. The death now emits with `victimId`/`killerId` at source, and
all three clash sites go through one shaping.

⚠️ **One honest gap I did not paper over:** a CHALLENGE carries no `arcId`, because your own comment
says a challenge is deliberately not part of an arc — it happens because somebody is worth beating.
Stamping one on would have drawn the battle in the wrong country. Gated as absent.

## §2 — "CONCATENATION IS NOT COMPOSITION" — built as a build

`engine/battleprompt.js`. The power leads (it is the subject); the killer's hand; the one falling; the
ground; how deep the ending ran. **Two figures in one relation, not two descriptions with a conjunction
between them.** No `AGAINST` anywhere, and that is gated.

Neth kills Morvane, at the braided confluence:

> *master, a cut-thread motion that ends rather than wounds, master ashwarden, grey wool worn thin at
> the knees, attends an ending unsent-for, standing over, reaper ashwarden, grey wool worn thin at the
> knees, ends what she deems finished, falling, at the braided confluence, the moment of the ending,
> still and unmistakable*

`fightingStyle` is used as an INPUT — the verb-phrase of a figure — never pasted whole beside a name.
A real `abilityId` outranks it when one exists; **66/66 fall back to the authored style**, because an
offscreen legend clash has no ability roll and the style IS the resolution the world models at that scale.

## §3 — ⛔ YOUR §2a FAILURE CAME BACK TWICE, IN MY CODE, AND I ONLY FOUND IT BY MEASURING

> *"A shared-category attribute cannot distinguish members of that category."*

**First time.** Every authored `appearance` opens *"A figure of the ashwarden, master among them: grey
wool worn thin at the knees…"*. I assumed the body after the colon was the person and stripped the
preamble. **It is the reverse: the body is shared by tradition and the ROLE is the distinguishing
token.** Neth and Morvane — your own example, the two most likely to kill each other — composed as the
identical picture. Same failure, opposite direction.

**Second time.** Role restored, and **2 of 5 rival pairs still rendered as a mirror** — same tradition,
same role, same body. Measured the roster to find what could actually separate them:

| field | distinct across 66 |
|---|---|
| appearance body | shared by tradition |
| role | 50 |
| archetype | 52 |
| **`offscreenVerbs[0]`** | ⛔ **66** |

**Which is exactly the field you reached for when you hit this wall.** It is in the picture now.

**Census, not a sentence:** 66 killers → 66 distinct pictures · **56 authored rival pairs, 0 mirrors** ·
and a gate that strips the verb and confirms the collisions come straight back.

## §4 — THE REST

✅ **§4 fallback** — no killer → one figure, preferring the authored `deathImagePrompt`, inventing no
opponent. (And no illness: your correction is honoured, the fallback is a death with no named killer.)
✅ **§3 caching** — `victimId|killerId|abilityId|worldDay`, and **the key IS the image seed**, so
stability is a property of the composition rather than of remembering to pass one.
✅ **SHORT** — every component budgeted so the whole survives; **zero of 66 end on a dangling fragment.**
My first version clamped the assembled string and silently ate the place and the outcome from the end.
✅ **§3.2 the click** — a death news line with a known victim opens the battle, floors applied, and lands
in the lightbox with the SNG-401 controls live.

⛔ **AND THAT CLOSES SNG-401 §2.** Yesterday I shipped Rebuild with the player supplying the new words,
because there was no builder to re-run. **A battle is the first image in the game with a real build
behind it** — so "describe it differently" now has its intended meaning for exactly the case you argued
it mattered most: *"if the composition is wrong… only a rebuild fixes it."*

## §5 — WHAT I DID NOT DO, AND YOU SHOULD RULE ON IT

⚠️ **The build is DETERMINISTIC, not a model call.** Erik's words were "generate a beautiful short
prompt", and I did not wire a model. Three reasons, and I would rather be told I am wrong than have this
be invisible:

1. The failure was **structural** — a list with a conjunction. A composition function fixes structure.
2. This runs inside the **world tick**, which already degrades on "api down". A per-death model call puts
   the picture behind a network the tick is designed to survive without.
3. **SNG-401's Rebuild is the human override**, and it is already shipped.

If you want the model pass, it is one call at the end of `buildBattlePrompt` and the whole file is
already shaped as its input. **Say so and I will wire it.**

⚠️ **`combatPresence` is gone from content** (you demoted it to `fightingStyle`) and there is now nothing
in the code referencing it — worth confirming that demotion is final so the general no-reader gate does
not start hunting for it.
