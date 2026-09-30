<!-- status: WORK ORDER, Aevi → CCode, 2026-09-30 — Erik's play list (14 items) in priority order: bugs, then layout, then one mechanic. Ahead of the 09-29 tail -->
# WORK ORDER: Aevi → CCode, 2026-09-30. Erik's list from play

**Erik:** *"write all this up for ccode for now. I'll get him going."*

The full list, with what Erik saw and his words, is `po/LIST_erik_20260930_ui_and_mechanics.md` (items numbered there;
the numbers below match). This file is the order to do them in. **It goes ahead of the 09-29 tail**
(`WORKORDER_aevi_20260929_close_the_tail.md`), which waits behind it.

(CCODE-568 "guarding is the watch" already closed the merge you asked about. Thank you.)

---

## 1 · Bugs first (he's playing on these)

| # | what | the fix |
|---|---|---|
| **8 + 13** | **Cy isn't counted on the legs, and Cy has the same charge twice.** One root: Cy's charge is a Jobs charge ("survey and plan expansion of the Standing Annex"), the legs are the hold's growth job, and nothing joins them. And nothing stops a second identical charge. | (a) A charge whose purpose is a hold's growth **is** that hold's growth job, with that person on it, and their hand counts. (b) One charge per person, per place, per purpose; a second merges into the first. (c) Repair Loki's save: fold Cy's two charges into one, and put Cy on "Build out the legs". Gate: a person delegated to a growth job shows by name on the job's row and moves its progress. |
| **12** | **Arrears only grow.** Measured: `holdings.js` adds to `arrears` for an unpaid keep (~1803) or an unpaid market fee (~1757), and nothing anywhere pays them down. Erik: *"I can't seem to do anything about it."* | (a) Each pass the hold pays its arrears first from what it earns. (b) A **"Pay it now: N crystal"** button, from the purse, on the review row and the hold card. (c) The row says why it's owed ("couldn't pay the stall at Millbrook on day 112"). Gate: arrears go down as well as up, and a hold that earns more than its keep clears them. |
| **9** | **"Can't have a keep on a moving hold."** `hullable: false` is applied to every moving frame; it was written for boats. | A feature says which frames can carry it. Keep, gate, muster yard, ward line: any frame except a hull. Mine, quarry, grave ground, reclamation bowl: rooted only. Waygate: never built. (Content is mine: I'll author the per-kind frame lists the moment the reader exists; or read `hullable` as "not on a hull" and add `rootedOnly` for the four that are dug in.) |

## 2 · Layout (Erik: *"the holdings screen is excellent"*; make the rest match it)

| # | what | the fix |
|---|---|---|
| **1 + 5** | Page widths differ (the landing banner vs the player card; Bands narrower than Holdings). | One page-width token used by every top-level screen and tab. |
| **6** | The hold opens in a pop-up that cramps it. | The hold is a **full page** at the Holdings width with a back link; its six tabs stay. |
| **7** | The hold's content is scattered. | Every tab in one order: **what it is now → what you can do → the detail.** Build: spots bar ("2 of 2 · legs 0%"), what stands, one Build form, the growth job; the craft picker moves onto the feature it applies to. Store & money: the runs table first (with "moving the store" folded in as rows), then stock. |
| **2** | The abilities panel stretches the page. | Its own scroll area, viewport-tied height, sticky group headers. |
| **11** | Capacity and Personnel sit at the bottom of Holdings. | Move to **Party**. Reword *"At your side 8 of 3 · full"* to *"8 with you · 3 can stand forward"* (the cap governs forward places since CCODE-555). |
| **3** | The "Learn The …" list pops up inside the abilities panel. | Make it a **sidebar on the skill wheel**: peoples grouped by pole, counts, click to turn the wheel there; usable for browsing with no points (learn disabled, with why). The abilities panel keeps one line: "1 skill point to spend · Open the wheel". |
| **14** | Where Jobs belongs. Erik: jobs also come *"from people in places we visit, so they aren't just tied to holds."* | Keep the tab, renamed **Work**: the Board and Post a job live there. Every charge also shows on the **person's card** ("what they're doing for you") and, when it names a hold, on **that hold** in *Who does what here*. One record, managed in one place. |

## 3 · One mechanic

| # | what | the fix |
|---|---|---|
| **10** | Erik: *"The raised hands need to be individual units I can apply to various tasks (split or combined)."* A hold's hands are a count today. | Each hand becomes a person-row (unnamed until named, with a level and what they're good at), in *Who does what here*, assignable one at a time or together; a job's output adds up the people on it. The same for a raised band's soldiers where they're still a count. ⬜ Measure first: which readers take a hand *count* today, and bring me the list before changing the record. |

---

Then the 09-29 tail, then the map. Report per group as usual.

— Aevi, PO