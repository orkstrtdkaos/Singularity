# CONTENT REQUEST — the lives figures have when they are not arguing about the valley
## CCode → Aevi · 2026-08-04 · SNG-275

Erik: *"the Arcs don't necessarily consume all the attention for the NPCs. They probably spend a fair amount
of time just living their lives or pursuing their own interests. Each might need more hobbies, interests,
their own relationships or family to attend to."*

**The mechanism is live.** A share of every figure's attention (`personalShare`, 0.4) is now held back before
the arcs are served, and a crisis can borrow it at a recorded cost — a figure who has not been home in a
season is a fact the world can say out loud.

**What is missing is the content, and it is measured rather than assumed.** A probe world-year:

```
  figures who kept their own time  : 47
  ...of those, with a life AUTHORED:  0
  figures who gave it to a crisis  : 20
```

## ⛔ WHY THE ENGINE DID NOT JUST FILL THIS IN

I could have derived a hobby from each figure's `wants` line and had 66 lives by lunchtime. I did not,
because **that is authorship**: an invented brother becomes canon the moment a narrator says his name out
loud, and no one ever decided he existed. It is the same rule as the minted figures — the engine mints the
slot and hands you an epithet; the name is yours. `personalPursuitOf()` returns **null** for an unauthored
figure and the attention is still withheld, so the mechanic works today and the silence stays honest.

## THE FIELDS

Any of these on a figure record; all optional, all additive.

```jsonc
{
  "id": "neth_the_stayed",
  "personalVerbs": [                 // ← the highest value per word you will write
    "walks the long orchard row before dawn",
    "sits with her sister's children while their mother works"
  ],
  "interests": ["the old songs, badly sung"],
  "kin": [                           // strings, or { line } objects
    { "line": "tends her sister's grave in the low yard" }
  ]
}
```

**`personalVerbs` is the one that matters.** It reads exactly like `offscreenVerbs`, which you have already
written three of for every figure — the difference is that all 198 of those are VOCATION. *"attends an ending
unsent-for"* is Neth being an ashwarden. None of them are Neth being a person. That contrast is the whole
request.

## THREE THINGS WORTH KNOWING BEFORE YOU WRITE

1. **These surface as `murmur`-tier news**, so they read as things overheard rather than events. Three per
   pass, so a handful of good lines per figure goes a long way — this is not a 66×10 authoring job.
2. **They are what a player can walk into.** A figure at an arc is a confrontation; a figure in the orchard
   at dawn is a scene. The strike/guard/retrieval work made NPCs targets and quest-givers; this is the thing
   that makes them worth protecting.
3. **⚠️ 20 of 67 in crisis may be too many.** `crisisPull` (1.5) is the dial: lower means more figures
   neglecting their own lives. If a third of the valley is always too busy to go home, the cost stops
   reading as a cost. Your call and Erik's — it is a REPORT, and it now sits in
   `content/packs/core/rules/arc_response.json` where you can turn it.

## AND THE DIALS ARE REACHABLE NOW

Related, and overdue: **`rules.arcResponse` did not exist.** The engine had read it for weeks, so all 21
world-simulation dials ran on hardcoded fallbacks and neither of you could turn one without editing engine
source — while I kept saying *"that's the dial, the number is Erik's call."* A reader with no writer. It is
authored now at exactly the old fallbacks (so nothing moved), fully commented, in
`content/packs/core/rules/arc_response.json`. `casualtyRate`, `attentionByTier`, `strikeRate`, `mintRate`,
`retrievalRate` and the promotion ladder are all yours.
