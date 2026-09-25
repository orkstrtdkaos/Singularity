# CCode → Aevi — five landed, and four things waiting on you

**2026-09-25 · v2.6.5 → v2.7.2 · 31 suites green on every push**

Working your order, with SNG-653 moved up as agreed.

| # | what | state |
|---|---|---|
| — | **R50** — R47 narrowed per function | ✅ v2.6.5 |
| 1a | **SNG-652 §8a** — a crafted feature remembers its craft and its season | ✅ v2.6.6 |
| 1b | **SNG-653** — the pledge, and the screen that reads it | ✅ v2.7.0 |
| 2 | **§1 words + SNG-650 §7 words** | ✅ v2.7.1 |
| 3 | **§9 catalog on screen** | ✅ v2.7.2 |
| — | *(found in passing)* the tear-down button | ✅ v2.7.0 |

---

## ⬜ FOUR THINGS THAT ARE YOURS

### 1 · The feature catalogue is staged, and the reader is waiting for it

`po/staged_content/SNG-652_feature_catalog.json` carries `category`, `what` and `flavor` for all 44 kinds and
the `categories` map. **The live `economy.json` carries none of them — measured, 0 of 44.**

The screen is built and **gated both ways**: it groups by category and shows your `what`/`flavor` lines the
moment the content lands, and shows one plain list until then. §76d proves *both* halves, so it cannot quietly
pass by the field staying absent. Nothing else blocks §9. **Apply when you're ready.**

### 2 · Four of §1's seven rows describe the mockup, not the screen

**Defence** (tab), **How it holds**, **Powers on this ground** and **"An approach"** appear **nowhere in
app.js**. They are labels on surfaces §8 has yet to build. I did not rename them — renaming nothing is worse
than leaving it. They land with their own sections.

The three that existed are done: *per pass* has your ⓘ (your sentence, verbatim, transcribed into the
`entries[]` shape the loader indexes), *rooms* → **feature spots**, and *Raise them* → **Form them**.

### 3 · Build is free, refresh is paid

When a feature is built with a craft, the build charges **no energy** — its authored price is goods and labour,
and adding an energy cost would be a new rule rather than a repair. But a seasonal feature's **renewal** costs
what renewing that craft costs, through the improvement path's own formula.

⬜ Build free / refresh paid is defensible and it may not be what you want. It is a dial, not a defect.

### 4 · SPEC §142's zone-1 row, and the fight's win condition

Both from batch 3 and both still open on your side: §142 lists the player's own hp/energy in zone 1, which
Erik struck in play; and I have flagged, but not touched, whether the other frame kinds have the same "it" for
a person that `fight` had.

---

## What I found along the way that you did not ask for

- **`_yieldOverride_20260906`** was sitting in the Build dropdown, between "deck space" and the crafts. An
  authoring note offered as a thing to build. `featureKinds` skips `_`-prefixed keys now, at the one door.
- **"The Preview Post reads as if it has wall."** The offer printed the raw kind id where your catalogue has
  "a wall".
- **The tear-down button did nothing on anything under construction** — and would have silently deleted every
  build in progress when tearing down a finished one. Two lists, one index.
- ⚠️ **A yield's amount is not the kind's to state.** `yields` is a goods id and the number comes from the
  hold's condition. I wrote it as the kind's, measured it, and corrected it — so the catalogue's numbers are
  read from `yieldsFor`, the same function the pass pays out of. Your note asked for exactly this and it is
  the half I nearly got wrong.

## Next, unless you redirect

§6 store, trade and the comparison table — then §7/§8 numbers, §8a's layer resolution (after real features
carry crafts, which they now can), §2–3 hands, §4 budgets, §5 recruiting, §5a camping, records.

— CCode
