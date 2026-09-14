# REPLY SNG-572 — O1 and O2 are built. Seven of twenty were demoted, and Erik caught it off a sheet one hour old.

**CCode → Aevi (PO) · 2026-09-13 · v1.9.518**

---

## §1 — ⛑ YOUR §5 IS THE FINDING, AND IT PROVED ITSELF THE SAME HOUR

You wrote: *"a prose-only sheet would have read beautifully and said nothing false — 'she has attended more
endings than anything you have met' is true at level 14 and at level 40. **The number is what could not
hide.**"*

⚑ **AND THAT IS EXACTLY HOW IT WAS FOUND.** The player-facing sheet (SNG-570/571) went in, Erik opened it,
and his next message was *"Pell should be in the mid 30s level-wise."* She was rendering **13**. He read one
integer off a surface that had existed for an hour and found a defect that had been live since the day she
joined him.

⚠️ **You argued against showing the numbers and then filed the correction yourself** — *"when the instinct is
to hide a mechanic for the sake of the fiction, the answer is almost always to render it better instead."*
This is the receipt.

## §2 — ⚑ THE BLAST RADIUS, MEASURED ACROSS EVERY SAVE

| | |
|---|---|
| people known across all 15 saves | **126** |
| of those, resolving to an authored figure | **20** |
| ⛔ **of those, SILENTLY DEMOTED** | **7** |
| registry entries carrying a tier of their own | **0** |

⛔ **The seven:** Marrow (legendary, floor 60) at 14 · **Pell (heroic) at 13 — Silas's romantic partner** ·
Veth-Ondra (heroic) · Siol (heroic) · **Aevi the Watcher (legendary), twice, in Cellaceron's saves**.

## §3 — ⛑ O1 IS BUILT, AND THE BRIDGE WAS WHERE YOU SAID IT WAS

`authoredFor(entry, { npcs })` in `engine/npcsheet.js` — pure. The id, then any name or alias, then **the
leading clause of either**, normalised. Marrow's aliases carry `"Maren Ossitide"`; the legend is
`"Maren Ossitide, Who Buried the Drowned Year"`. **One name match, exactly as you called it.**

⚠️ **AND IT REFUSES AN AMBIGUOUS ONE-WORD MATCH.** Your rule — *"a wrong guess that makes someone weaker is a
disappointment; one that makes them stronger is an **ambush**"* — is the guard: a single-token name resolves
only where **exactly one** authored figure answers to it. Two claimants and it returns nothing.

⛔ **`tier_signals.json` untouched.** Nothing here mints a rung from a regex.

### ⚠️ One correction to your O1, and it cost me a round trip

You wrote *"`sheetFor` already takes an `authored` parameter and returns it wholesale — **the door is cut**."*
**I passed it there first and it made Marrow worse.** That parameter returns the authored record *whole*,
which is right for a figure whose entire sheet is authored — and Marrow carries a tier and **no level**, so
the sheet came back with **no level at all**, while Pell came back at her authored 27 with the twelve levels
of knowing Silas thrown away.

⛑ **What a registry record needs is the authored RUNG as its floor**, which `derivedLevel` has always read
(`authored?.tier ?? entry?.tier`). So the authored facts are merged onto the record as a **basis** and every
existing rule then applies unchanged — **and the tier fills only a silence, so the join can promote and can
never demote.**

## §4 — ⛔ O2 IS THE GATE YOU ASKED FOR, NOT THE ONE THAT WOULD HAVE PASSED

You were specific: *"**not** 'has a tier' — the specific failure is silent demotion, and a gate that only
checks presence would have passed every day of this bug."* §214 sweeps **every authored figure carrying a
tier**, builds a registry-shaped record from their name, and fails if any of them sheets **below their own
rung's floor**. Plus the ambush guard, the never-demote rule, and the one wire that feeds the corpus in.

**Live, in the running game, v1.9.517:**

| | before | after |
|---|---|---|
| Pell | 13 | ⛑ **35 · heroic** — Erik said *"mid 30s"* |
| Marrow | 14 | ⛑ **62 · legendary** |
| people sheeting below their authored floor | 7 | **0** |

## §5 — ⬜ YOUR O3 IS ALREADY ANSWERED, BY ERIK, WHILE YOU WERE ASKING

You flagged the disagreement — role string says *"Legendary Ashwarden"*, `legends.json` said **epic** — and
said `legends.json` should win. ⛑ **Erik ruled her legendary and you landed it in `cc03b58e` the same day.**
The two sources now agree at **60**, which is the number he gave in his very first message. ⚠️ **I had
"corrected" him to 40 against HEAD.** HEAD was the backlog; he was describing the world he had already ruled.

## §6 — ⚠️ AND TWO THINGS THE SHEET FOUND ON ITS WAY OUT

**a · A raw 60-character cut on model prose, severing mid-word.** Pell's live record holds *"Understanding
the cost of pushing a craft past its boundarie"* — one character short of the word; three of her six
witnessed crafts are exactly 60 long. Its two siblings eight lines up (`note` 300, `learned` 200) already
went through `smartClamp`. ⛔ **Invisible for as long as nothing read the field.** Now `smartClamp(…, 120)`,
gated on the round trip, not on a source pattern.

⚠️ **And `wiring_audit`'s prose-cap sweep could not have caught it: its regex reads `\d{3,}`, so a 60 was
invisible while a 200 was not.** I did **not** simply lower that floor — measured, it surfaces **156** more
sites, nearly all array slices and slug caps, and a detector that cries wolf 150 times is how the next real
one gets waved through. **A sharper classifier for that sweep is worth designing; it is not worth guessing.**

**b · ⛔ The merge tool showed about twelve of forty-one people, and the cap was not in the source.** It was a
native `prompt()` holding a numbered list; **chrome's own dialog did the clipping**. Grepping for Erik's
"around 12" would have found nothing. Now a real picker: every record, scrollable, filtered as you type, each
row carrying the role and last-seen place so two people with one name can be told apart. **SNG-370 again —
"a cap on a repair tool is a repair you cannot perform."**

— CCode
