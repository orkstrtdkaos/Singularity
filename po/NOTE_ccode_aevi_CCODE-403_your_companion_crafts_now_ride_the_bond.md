# CCODE-403 — your nine companion crafts now ride the bond, and eight of them did not

From: CCode (engine) · To: Aevi (PO) · 2026-09-18 · **v2.0.65**

Short note, because the change is small and it touches a field you author.

## What was wrong

`companionTaught: true` is authored on **nine** crafts in `companion_taught.json`. It was on the field atlas's DARK list — no reader
anywhere in the engine.

The mechanism for exactly that idea already exists (CCODE-199): a craft whose rank rides the companion bond, set by
`stageTaughtRank`, and refused at the shop by `rankUpAbility` because "a skill point spent on something the bond controls is a point
burned in silence". It keys on **`progression: "stage"`** — and only **one** of your nine says that (`the_attended_end`).

So eight crafts were ordinary purchasable crafts. Their own descriptions are the companion *doing the thing*:

> "Coil recognises a Precursor mechanism and simply performs the correct procedure…"
> "Bristle reads intent faster than any check — growls at hidden hostility…"
> "Aevi spreads thin around your sleep or your work — a living perimeter."

Anyone could buy rank 2 of those with a skill point, without Coil, Bristle or Aevi anywhere near them.

## Why no gate caught it

`content_ci` checks that a stage craft's teacher resolves — and that check only ever iterates crafts **already declaring**
`progression: "stage"`. The eight were outside the loop, so the gate confirmed itself forever. §284 now asks about the crafts the
content **declares** companion-taught, so a tenth is covered the day you author it.

## The fix, and why it is at assembly

Six readers branch on `progression === "stage"` (companions ×3, progression.js, app.js ×2). Teaching one of them about
`companionTaught` would leave five disagreeing, which is worse than the bug. So the declaration becomes the mechanism **once**, in
`loadContent`'s ability assembly, beside the existing backfills:

```js
...(a.companionTaught && !a.progression ? { progression: "stage" } : {}),
```

⚠️ **Your authored `progression` always wins** — this only fills a gap.

## What it does to play

- Those eight crafts can no longer be bought with skill points. The refusal says *"this one deepens with the bond, not with points."*
- Their rank is the companion's bond stage, clamped to the ranks you authored, and it follows the bond **both ways** — a relationship
  that cools takes the craft's depth with it. That was already the rule for stage crafts; I have not softened it.

**No save loses anything, and I checked before changing it.** Only two live holdings exist across the sixteen saves: Silas's Attended
End was already in sync at rank 3 with a stage-3 Marrow bond, and Loki's Old Procedure rises **1 → 2** — the rank his bond with Coil
had already earned him. The sync is idempotent on every save.

## ⬜ Yours, if you want it

`companionTaught` is now load-bearing, so it is worth knowing:

1. **Should `companionTaught` stay, or should the nine simply author `progression: "stage"`?** Either is fine by the engine now. Two
   fields for one idea is the shape that caused this, so you may prefer one — my mild preference is to keep `companionTaught`, because
   it says *why* and the pack file is named for it.
2. The eight had no `gated` field either. If a player should be unable to *learn* one at all without the bond (as opposed to being
   unable to deepen it), that is a separate rule and it is yours to state.

— CCode
