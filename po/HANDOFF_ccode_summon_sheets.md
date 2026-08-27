# HANDOFF — summon sheets, and Erik wants this built on your NPC-sheet work

**Aevi → CCode · 2026-08-24**

**Erik: *"let's let CCode help with the summon stats. He worked on some NPC character sheets — this would
be a LITE VERSION of that I think."*** ⛔ **He is right and it changes my spec: `po/SPEC_summoned_sheets.md`
asked for `synthSheet` from a threat band. YOUR `npcsheet.sheetFor` IS THE BETTER PARENT.**

---

## §1 — WHY YOURS, NOT `synthSheet`

**`synthSheet` builds a FOE from a threat band — health, soak, layers. ⚠️ That is an opponent, and a
summoned thing is not always an opponent: `raised_hand` sets a CREW THAT HAULS.**

**`sheetFor` already does the right shape:**

```js
const level = derivedLevel(entry, { day, cfg });
const base  = Math.max(1, Math.round(level / 2) + 1);
const attributes = { physical: base, mental: base, social: base, practical: base };
leans.forEach((attr, i) => { attributes[attr] = base + Math.max(1, Math.round(bonus / (i + 1))); });
```

⛔ **A SUMMON IS THAT WITH THE LEVEL COMING FROM SOMEWHERE ELSE.** ⚠️ **Erik's rule — *"base it off the
level of the caster"* — replaces `derivedLevel(entry)` with `casterLevel + tierGap` and the rest of the
function is already correct.** **And `leansOf` is exactly how a raised hand ends up physical and a driven
shade ends up physical-and-mental.**

**⛔ THE LITE PART, EXPLICITLY:** no `craftsOf`, no `growthFor`, no `kitFor`, no `isPermanent`. **A summoned
thing has no growth arc, no inventory and no reputation.** ⚠️ **`sheetFor` + `battleSkillsFor` and stop.**

---

## §2 — THE FOUR FIELDS A CRAFT DECLARES

| field | | example |
|---|---|---|
| `tierGap` | strength relative to the CASTER | `raised_hand` −3 · `driven_shade` −1/0/**+1** |
| `count` | how many | crew vs ⛔ **always one** |
| `contributions` | ⛔ **what it can DO** — your own `contributionsOf` vocabulary | `MARTIAL` (grab/slam/bite) vs `MARTIAL, KNOW, PROTECT` |
| `duration` | before it comes apart | already authored on most |

⛔ **`contributions` AND `canStrike` ALREADY EXIST AND ALREADY WORK** — I authored them on nine companions
this session. **A raised hand hauls and cannot swing; a driven shade set to hunt does.** ⚠️ **Same fields,
opposite answers, no new vocabulary.**

---

## §3 — WHAT I OWE YOU

**I author the summon blocks. ⛔ DEATH'S TWO WITH THIS TICKET; THE OTHER 17 AS EACH TRADITION'S AUDIT
REACHES IT** — I am not authoring 19 blocks for traditions I have not read.

⚠️ **AND ONE I WANT YOUR READ ON: `driven_shade`'s `tierGap` RISES with rank (−1 → 0 → +1), because the
craft's flavour is that it wears down to purpose and gets HARDER TO STOP.** ⛔ **An L5 warden's shade at
+1 is `hard` against an L5 party — a real threat, on purpose.** **If that is too much for a thing a player
made, say so; the number is yours to push on and I would rather hear it now than after it is authored.**

---

## §4 — THE THING I GOT WRONG IN THE SPEC, FOR THE RECORD

**I wrote *"no bestiary entries — a summoned thing is derived, not authored"* and cited the stored-copy
failure.** ⚠️ **That part stands.** ⛔ **But I reached for `synthSheet` because I was thinking about the
FIGHT, and `raised_hand` — the craft that prompted the whole thing — DOES NOT FIGHT.** **Erik saw the NPC
shape immediately and I had walked past it.**
