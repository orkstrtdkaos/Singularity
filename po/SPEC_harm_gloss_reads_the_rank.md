# SPEC — the GM's HARM line reads the ABILITY when it should read the RANK

**Aevi → CCode · 2026-08-24 · found by `po/craft_lint.mjs` check 1, 28 crafts**

⛔ **ONE LINE IN `engine/progression.js`. I have not touched it — your file.**

---

## §1 — THE DEFECT

**`progression.js:726`, inside the per-craft GM block:**

```js
lines.push(`### ${ab.name} — rank ${owned.level} "${rank.name}"…`
  + `\nCAN: ${rank.grants}\nCANNOT (at this rank): ${rank.cannot}`
  + (ab.notFor ? `\nNOT FOR: ${ab.notFor}` : "")
  + (ab.harmRung ? `\nHARM: ${harmRungGloss(ab.harmRung)}` : ""));   // ⛔ ab, not rank
```

⚠️ **EVERY OTHER LINE IN THAT BLOCK IS RANK-SPECIFIC — `CAN`, `CANNOT (at this rank)`, the rank name, the
discounted energy. ⛔ ONLY `HARM` REACHES PAST THE RANK TO THE ABILITY.**

**So a character at r3 of `case_closed` is shown:**

```
CAN: …walk one person to the conclusion that the consistent act is a final one
HARM: this craft HARMS NOTHING — it works through peace, making, or reading;
      NEVER invent a wound from it
```

⛔ **THE ENGINE INSTRUCTS THE GM NOT TO NARRATE A DEATH FROM A CRAFT WHOSE RANK TEXT IS A DEATH.**

---

## §2 — HOW WIDE

**`po/craft_lint.mjs --check 1`: 28 crafts declare LESS harm at ability level than one of their ranks
delivers.**

| pattern | n | ⚠️ |
|---|---|---|
| `incapacitating` declared, ranks reach `lethal` | 20 | across 20 different traditions |
| ⛔ **`none` declared, ranks reach `damaging`** | 6 | ⛔ **`none` glosses as "HARMS NOTHING"** |
| ⛔ **`none` declared, ranks reach `lethal`** | 1 | ⛔ **`case_closed`** |
| `damaging` declared, ranks reach higher | 3 | |

⚠️ **20 OF 28 ARE THE SAME PATTERN IN 20 TRADITIONS. THAT IS A CONVENTION, NOT 20 MISTAKES** — authors have
been treating the ability rung as the craft's TYPICAL harm and the rank rung as the specific. **Reasonable,
and the reader does not honour it.**

---

## §3 — THE FIX, AND WHY IT IS THE READER NOT THE CONTENT

⛔ **`974 of 1047 ranks (93%) DECLARE THEIR OWN `harmRung`.** The data to be correct is already authored.

```js
+ ((rank?.harmRung || ab.harmRung) ? `\nHARM: ${harmRungGloss(rank?.harmRung || ab.harmRung)}` : "")
```

**Rank first, ability as fallback for the 7% that do not declare one.**

⚠️ **MY FIRST INSTINCT WAS TO REWRITE THE 28 CRAFTS TO max-of-ranks. That is the wrong lever:**
- ⛔ it would **overstate harm for every character below the top rank** — an r1 `case_closed` holder would
  be told the craft can kill, which is as wrong as the current bug in the other direction;
- it discards a convention 20 traditions independently arrived at;
- **it is 28 content edits against 1 reader edit, and the reader edit is correct for all 1,047 ranks.**

---

## §4 — ACCEPTANCE

1. A character at r3 of `case_closed` is shown the **`lethal`** gloss; at r1, **`none`**. ⛔ **Both correct
   for what they can actually do.**
2. A craft whose rank omits `harmRung` still shows the ability's — **no regression for the 73 ranks.**
3. ⚠️ **A gate that the HARM line and the CAN line come from the same rank.** **That is the invariant, and
   it is the one nothing currently asserts.**

---

## §5 — WHAT IS STILL A CONTENT QUESTION AFTERWARDS

⛔ **`case_closed` declaring `none` at ability level remains odd even once the gloss is right** — a craft
whose capstone walks someone to a final act is not a `none` craft in any register. ⚠️ **But that is Erik's
call about that craft, not a lint finding, and it is no longer URGENT once the GM is told the truth at the
rank they hold.**

**And after this lands, lint check 1 should re-run: I expect it to stay at 28 and to stop mattering** —
⚠️ **which is worth knowing, because a finding that stops mattering without changing is exactly the kind
this tool should be able to say out loud.**
