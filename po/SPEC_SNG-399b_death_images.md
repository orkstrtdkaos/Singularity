# SNG-399b — Deaths have no picture, and the reason is on both sides

**Author:** Aevi (PO) · **Date:** 2026-08-09 · **Erik:** *"some characters are dying… I thought that was
supposed to trigger a battle scene image?"*
**Content fixed:** `4a296b6b` · **Wiring: yours.**

---

## §1 — ⛔ `deathImagePrompt` HAS ZERO CONSUMERS

**66 of 66 epic figures carry a `deathImagePrompt`. `grep deathImagePrompt app.js` returns NOTHING.**

The death machinery is otherwise complete — `plan.slain`, `enterDeathState`, `playerDeathState`,
`deathDepth` on the absolute world day, the whole of SNG-209's retrievable-death state. ⚠️ **It reaches
for a state and never for an image.**

**Same shape as SNG-399 §1 an hour ago:** an authored field, a working image pipeline, and nothing joining
them. ⛔ **That is three in one day — SNG-367 (NPC path), SNG-399 (whois path), this one (death path). The
portrait machinery keeps being built one path at a time and the authored prompts keep being left behind.**

⚠️ **Worth a general gate rather than a third point fix: assert that every authored `*ImagePrompt` field
in content has at least one reader.** It would have gone red three times today.

---

## §2 — ⛔ AND MY CONTENT WAS NOT READY. I FIXED IT BEFORE ASKING YOU TO WIRE IT.

Measured before touching anything:

| | living `imagePrompt` | `deathImagePrompt` |
|---|---|---|
| distinct whole prompts | 66 / 66 | 66 / 66 |
| **distinct last-100 chars** | **66** | ⛔ **1** |

**Every death was the same sentence with a role slotted in** — *"…fallen on the contested front, the
ground marked by what ended them, their people gathering at a distance. Grey weather, quiet…"* ⛔ **Wiring
it would have shipped 66 identical death scenes.**

**And 60 of 66 opened `"A an ashwarden death-attendant…"`** — a template prepending an article to a string
that already had one. ⚠️ **Zero of the living prompts had that fault. I authored the lives and templated
the deaths**, and it took Erik asking why deaths had no picture for anyone to look.

### §2a — What they are now (`4a296b6b`)

Each death is built from **the figure's tradition** — where such a person falls, what the ground does, who
arrives — and from **their own authored `deathRoad`**:

- *Ashwarden:* **"the grave-ground they tended, the last cairn unfinished beside them. Ash on the wind,
  their own people arriving with nothing to do."**
- *Enginewright:* **"the machine still running above them, indifferent, on schedule."**
- *Churnfolk:* **"the fen taking them back without ceremony."**

⛔ **And the deathRoad DEPTH is now visible in the picture**, because that is the fact SNG-209 turns on:
depth 0 → *"could have been called back, and was not"*; depth 3 → *"No road back."*

**Result: distinct tails 1 → 50. `"A an"` occurrences 60 → 0.**

⚠️ **`deathRoad` is a dict on 41 figures, a string on 4, and absent on 21.** The four prose ones use their
own stated road instead of a depth band. **Flagging the shape variance — it is not a bug, but anything
consuming `deathRoad` must handle all three.**

---

## §3 — WHAT I NEED

1. **Wire `deathImagePrompt`** on the death beat — same generate-once-and-cache path as `ensureQuestArt`.
   ⚠️ **The prompt is a STRING I wrote, not a URL** (the `ensureQuestArt` comment already says this for
   quests; the same applies here).
2. ⛔ **Prefer the authored prompt over any generated description**, and seed on the stable figure id so a
   death does not re-roll into a different scene.
3. **The general gate from §1** — every authored `*ImagePrompt` in content has a reader.

⚠️ **A player death and a figure death are different beats.** These 66 are world figures; whether a
*player* death draws its own scene is a separate question and I have not authored prompts for it. **Say if
you want that and I will.**
