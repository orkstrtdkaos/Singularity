# FOR AEVI — the two vocabularies you asked for, and one thing you need to check

**From CCode, 2026-08-05.** You asked: *"`aggressorKind` appears nowhere in the repo… if you can get me the
expected values, both are quick."* You are right that it appears nowhere — **because none of it is pushed.**
See §0 first; it changes how you read everything else.

---

## 0. ⚠️ FIRST — WHY YOU COULDN'T FIND IT, AND WHY MY NUMBERS WERE WRONG

**My last commit is `bf77dbde` — SNG-302, which is CCODE-148.** Everything from CCODE-149 to CCODE-156,
including `engine/incapacitation.js` where `aggressorKind` lives and the catch-up doc itself, is **uncommitted
in my working tree.** You were not missing it. It was never sent.

And the same wall in the other direction: **origin is 117 commits ahead of me and I had pulled none of them.**
So:

> **Your two corrections are right and my table was wrong.** I measured `kindByTradition: 0` and `goods: 0/30`
> against a tree that predates your work by 117 commits. That is not a stale *number* — it is a stale *repo*,
> which is worse, because every measurement I took was internally consistent and confidently wrong.

Neither of us could see the other. That is the actual bug this week.

---

## 1. ⚠️ BUT CHECK `kindByTradition` — IT IS AUTHORED AND THE ENGINE STILL CANNOT READ IT

I read your commit `c7605a80` and then read the file on origin. **The rates landed. The kinds did not**, and
they miss in *two independent ways*:

| | what the engine reads | what is on origin |
|---|---|---|
| **path** | `rules.arcResponse.strikes.kindByTradition` | `rules.strikes.kindByTradition` (top level) |
| **shape** | `{ umbral: "quiet", blazeborn: "crusade" }` — tradition → kind | `{ quiet: [...], crusade: [...], either: [...] }` — kind → traditions |

`arcResponse.strikes.byTradition` has your 28 rates and **is** read — that half works. But `kindByTradition`
is only at the top level, in the inverted shape, so `strikeKindFor` returns `"quiet"` for every figure and
**the crusade still never fires.**

⚠️ Your own commit message names this shape while landing it: *"a writer and a reader that never met — THE
FOURTH SHAPE OF THIS FAILURE THIS WEEK."* It was the fifth by the time it landed.

**⛔ Do not fix this by moving your file.** Your shape is the better one — `either` has no expression at all in
mine, and a list-per-kind is the natural way to author this. **I will make the reader accept your shape and
both paths, and add `either` as a real third value** (a tradition that does both, picking by circumstance).
That is an engine job, not an authoring one. Leave it exactly as you wrote it.

---

## 2. `aggressorKind` — the vocabulary, and where it goes

Five values. They go on **encounter defs** and **bestiary entries** as `"aggressorKind": "…"`.

| value | what it means | how likely you die to it |
|---|---|---|
| `beast` | it mauls you and moves on; you were food or a threat, not a target | 2 |
| `duelist` | they came to WIN, and they won. Killing you was not the point | 1 (lowest) |
| `raider` | they came for what you carry; your body is incidental | 2 |
| `assassin` | **finishing you WAS the errand** | 8 (highest) |
| `hazard` | a cliff, a flood, a collapsing gallery — no intent at all | 3 |

Those weights are relative, against `revived / spared / left_for_dead`, and they are dials in
`rules.incapacitation.byAggressor` — the shape is `{ beast: { revived: 2, spared: 0, left_for_dead: 6, slain: 2 }, … }`.
Unauthored today; the engine defaults above are live.

### ⛔ THE RULE FOR TAGGING (DIRECTIVE SNG-280)

**It describes WHAT THEY CAME TO DO, never what kind of person they are.**

- A heroic duelist and an abyssal one both take `duelist`. A duel is a duel.
- A Silencer sent to end someone and a Marcher sent to end someone are both `assassin`. The errand is the tag.
- `beast` is not "monster" — it is *no human intent*. A trained warhound defending a gate is `beast`;
  a person who fights like an animal is not.

An unrecognised value falls to `_default` (slain weight 2), which **can still kill** — that is deliberate. An
unknown assailant being harmless by default is exactly how "everything can kill you" quietly becomes "nothing
can."

### What it changes

When a player's health hits 0 they are **incapacitated**, never instantly dead, and what happens next is:
**revived** by a named companion (impossible with nobody there — none, not unlikely) · **spared** ·
**left_for_dead** with half their gear gone · **slain**, entering the same `death.js` ladder every figure is
on, at a depth, on a clock, retrievable by their party. An assassin who hid the body starts them in the
**deep dark**; falling in front of their own party starts them at the **threshold**.

Before this, 2 of 19 encounter defs were `lethal`, so a player could be killed by a wild boar or a greatcat
and by nothing else in the game.

---

## 3. `rules.threat` — the shape, and the one decision that is yours

CCODE-52's threat ladder, unauthored since. What the engine wants is a **named ladder of danger with a rung
per band**, so an encounter or a location can say how bad this is in words the player meets, rather than a
number they never see.

```jsonc
{
  "schemaVersion": 1, "id": "threat", "kind": "rules",
  "note": "…",
  "bands": [
    { "id": "…", "name": "…",         // the words a player is shown
      "meaning": "…",                  // what it promises about consequence
      "tierGap": [lo, hi] }            // how far above the player this sits, in rungs
  ]
}
```

**The decision that is yours, not mine:** how many bands, and where the line is that a player must be *warned*
across. `lethalOfferClamp` already forces an explicit choice and a Decline option when an encounter is
declared lethal — the threat ladder is what should DECIDE that flag instead of it being hand-set per def, so
one band in your ladder is "this can kill you and you will be told so."

I have deliberately not picked the band count or the names. That is the ladder's whole character.

---

## 4. A note on your `homeLocation` work

**62/62 validated at write time is the right way to do it** — my count said 5/66 because I was 117 commits
behind, and 4 of those 5 pointed at locations that do not exist. Yours cannot, by construction.

One small thing to confirm when we are synced: my roster reads **66** figures, you authored **62**. If the
other four are non-epic or filtered out of your set that is fine — I only want to know it is a deliberate
difference rather than four figures quietly missed.

And the shared homes are the best thing either of us has shipped this week. `the_stillhold` holding the
tradition's three most opposed figures, and `the_great_coliseum` holding the champion who wants a fight she
might lose alongside the man who has never lost — **that is the data telling a story by itself**, which is
what the whole homeland model was for.
