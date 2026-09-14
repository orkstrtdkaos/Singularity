# HANDOFF — CCode → Aevi · SNG-586 · the threat ladder is on the old scale

**One content row, and it has been telling every player that every foe is deadly.**

---

## ⛔ What is wrong

`content/packs/core/rules/skill_battle_system.json` → `engine.appraisal.threatBands`:

```json
[{ "at": 80, "label": "deadly" }, { "at": 60, "label": "dangerous" },
 { "at": 40, "label": "serious" }, { "at": 20, "label": "modest" }, { "at": 0, "label": "slight" }]
```

These are **absolute threat numbers**, written before Erik's CCODE-52 ruling made the rung *relative*:
*"Your level sets the mean about which the encounters revolve"* — the rung is **threat ÷ your power**.

`engine/threat.js`'s `threatBand()` reads **`atRatio`**. Not one rung has one. `?? 0` made the first rung
match every ratio, and `find` returned the **hardest** one.

⚑ **Measured on Erik's own save.** Loki, power **104**, facing a threat-**30** Churn-Revel: **"deadly"** — a
foe he outclasses better than three to one. And because the rungs carry no `key` either, the band's counsel
could never outrank the craft-vs-prowess line, so the panel read **"deadly"** and **"An even contest"** in two
adjacent rows.

⚠️ **The failure direction is the worst one available.** Falling to the hardest rung tells every player to run
from everything, and a panel that cries deadly at a rat is a panel you stop reading — worse than no panel.

## ⛑ What I did, and what I deliberately did not

`threatBand` no longer obeys a ladder it cannot read: a ladder where **no** rung states an `atRatio` is a
different schema, so the engine uses `DEFAULT_BANDS` and says so on the result (`ladderIgnored`). Gated at
§236 against the **real authored content**, not a fixture of my own.

⛔ **I did not map your labels onto ratios.** deadly/dangerous/serious/modest/slight is better prose than my
placeholders, and where each one sits on a ratio is a *design* decision — yours, not a guess of mine.

## ⬜ What the shape needs, when you want it back

Each rung wants three fields, ordered hardest-first (first match wins):

```json
{ "key": "flee", "atRatio": 2.50, "label": "deadly",
  "counsel": "Do not fight this. Run, hide, or find another road." }
```

- **`atRatio`** — threat ÷ the character's power, at or above which this rung applies. My placeholders sit at
  `2.50 / 1.75 / 1.25 / 0.80 / 0.45 / 0.00` (six rungs; yours are five, which is fine — the ladder is yours).
- **`key`** — a slug. It picks the chip's colour (`.appraise-<key>` in style.css) and decides whether the
  band's counsel outranks the craft compare. ⚠️ **The label must not be used as the key**: `appraise-beneath
  notice` is a class name with a space in it, which is two classes and neither exists. That was a real bug in
  this same commit.
- **`counsel`** — the sentence that has to stop someone walking into a death, and (since SNG-586) also the one
  that says *"not a fight"* at the bottom of the ladder. The band speaks at both extremes now; the
  craft-vs-prowess compare keeps the middle, where the fight is genuinely in doubt.

⛑ The moment a rung carries `atRatio`, your ladder is in force again and the defaults step aside — the gate
asserts both directions, so a real ratio ladder is still obeyed.

## ⬜ And one more, smaller

`isRelevantThreat` retires a foe below `relevanceFloorRatio` (0.35) from the **random pool**. A GM-invented
duel does not pass that floor — Erik's Churn-Revel is ratio 0.29 and was offered anyway. I have **not**
blocked it: the GM may stage a deliberately-trivial encounter that matters for other reasons, and the
appraisal now says *"beneath notice — not a fight"* right above the button, which is the information he was
missing. **If you want the floor to apply to invented duels too, that is a ruling and I will wire it.**

— CCode
