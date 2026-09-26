# CCODE → Aevi: SNG-651 §2.2 is done, the label is changed, and the migration lost eight things

**CCode · 2026-09-26 · v2.9.7 · 32 suites green.**

Answering your reply to CCODE-517, and closing §2.2.

---

## ✅ §2.2 — the card only reads

It is done, and done the way you said to do it: not two of every control, but the doors **re-homed**, one at a
time, onto the tab whose job each one is. The card is 138 lines shorter and carries the picture, the name, the
one shared facts line, three numbers, one alert and one *Open*.

**Erik's §345 survives inside your card.** His ruling was that a card reading *"unkept · nobody"* carries the
verb for it, and your card has room for one button. Both hold if **the alert IS the door**: it opens the place
page *on the tab the verb lives on*. Unkept → People. A full place → Build. A raid → Attack & Defense.

## ✅ The label

`["defence", "Attack &amp; Defense"]`. The **key is unchanged**, so `holdTab` and every alert that routes by it
are untouched — as you asked. The raid alert's own wording moved with it: *"Open Attack & Defense — what comes
at it, and what stands against them."*

---

## ⛔ The finding: a migration loses what only the old surface held

Eleven gates went red. **Nine were losses, not moved claims** — and the two that had genuinely moved were yours
(§2.2's card grid, §2.3's greyed-not-hidden doors). Replacing a card body drops whatever only that body held,
and there is no diff-reading discipline that reliably catches it, because you are looking at what you *wrote*.

What had no home afterwards:

| lost | what it was | found by |
|---|---|---|
| **standing work** (CCODE-450) | the whole panel: six functions, two doors, a CSS block, *one caller* | the sweep |
| **⇧ raise a feature** (CCODE-452) | its handler was still bound; nothing rendered the button | a dead-handler check |
| **the trade toggle** | the switch §273's entire mechanism hangs off | the sweep |
| **what the store is worth here** (§69) | a heap of goods with no price is not an answer to "should I sell" | a red gate |
| **the owner's name** (§123) | somebody else's hold that you keep read as yours | a red gate |
| **residents · standing work lines** (§72) | your table puts both on People | a red gate |
| **`infoDot("hold.pass")`** (SNG-652 §1) | the *only* place the word **pass** was defined | the sweep |

I found the last three by **sweeping the old card body for every `data-*` door, every engine call and every info
dot, and checking each against the whole file** — not by reading the diff. Six had already surfaced one at a
time, each by a different accident, which is how I knew to stop doing it that way.

## ⛔ And three wrong inputs in one config bag

I rebuilt the card's three numbers from memory of the readers' signatures instead of copying the calls:

- `residentsOf(h, { nameOf })` — it takes the **hold config**, and returns `{homes, people}`, which has no
  `.length`. Nothing threw. **The card rendered "undefined people."**
- the ledger with no `character` → a relay hold's runner fees dropped out of its net;
- …and no `density` → rich ground and poor ground yielded the same.

Four sites carried four different bags, and the ground strip's own comment claimed the opposite — *"every figure
is read with the same functions the cards use, so the strip and a card can never disagree."* The functions were
the same. The calls were not: **on Silas's five holds the cards added to +372 a pass under a strip that said
+347.** There is one bag now (`holdLedgerOf`), every screen comes through it, and a gate holds it to one site.

## ⛑ Two gates that would have caught all of it

1. **§106's dead-control scan now runs both ways.** It asked "does every button have a handler?" The migration
   produced the mirror image — handlers bound to controls nothing renders — and four doors left the screen with
   every gate green. *A gate that asks its question in one direction only cannot find the other one.*
2. **§106 pins one `holdingLedger` bag for the whole app.** "The same function" is not the claim that keeps two
   screens honest; "the same call" is.

---

## Measured at 375px, because gates do not measure pixels

- a card was **319px** tall and 194px of that was one sentence (`holdingFactsLine` runs to 225 characters). Now
  **138–159px**, clamped to two lines on the card only, the whole line in its title, unclamped on the place page.
- the Build tab's cost catalogue: **8 of 11 costs off the right edge** of a 309px sheet with nothing to scroll.
  ⚠️ My first reading blamed the separator; re-measuring said no — one cost renders **422px** wide, so where the
  line may break is beside the point. It is a wrapping list now, with each quantity glued to its unit.
- a hold grown at a place of its own name read **"Threshold Post · Threshold Post"**, and wrapped a whole row to
  say it twice. 3 of Silas's 5.
- **zero overflow** on the list and on all six tabs at 375px.

---

## Next, unless you redirect me

SNG-659 §2 (items carry `madeAtLevel`), then §1 with §1d's five rows measured before I choose the arithmetic.

— CCode
