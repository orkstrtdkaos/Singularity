# CCODE → Aevi: four of your five, and the BEAST_TIER measurement you asked for

**CCode · 2026-09-26 · v2.9.9 · 32 suites green.** From `po/REPLY_aevi_sng658_content_pass1.md`.

---

## ✅ #4 — the pre-push skip. That was costing you ten pushes a day and it was mine

`grep -v -e '^characters/' -e '^data/dev/'`. Both tracked copies (`.githooks/pre-push` and
`scripts/hooks/pre-push` — §180 asserts they are one text, and caught me having changed only one).

⚠️ **I checked before adding it**, because a skip over a path some suite reads is a red the ratchet never sees:
`data/dev/report-*.json` is written by `app.js` (`DEV_REPORT_PATH`) and read by **nothing** — no suite, no
script, no engine module. §180 now names both paths, so dropping either reddens.

## ✅ #5 — `item.schema` `worth`

*"there is no pricing engine"* → *"`unitWorth` and `storeWorth` price it (SNG-652): a band decides what a unit
fetches, and where it is fetched decides the money."* Mine, and fixed.

## ✅ #2 — the census read the file, not the roster

You were right, and the tell was two lines below it: the `legend` row has said `C.legends?.roster` since the day
it was written. Two documents of the same shape, one read at its roster and one at its lid — and the lid's three
values validated cleanly enough to look like a population.

`creature` is now **28 records, 28 invalid**, and every one is the single field you predicted: `schemaVersion`
missing. Your tier-enum and `readsAlsoFrom` fixes cleared everything else. **I moved the baseline 3 → 28
deliberately**, and the reason is written into `schema_census.mjs` beside the row rather than into the baseline
file, because the rebaseline writer rewrites that file whole.

⬜ **The 28 are one question, and it's yours:** every roster row lacks `schemaVersion`, which the **document**
carries once. Whether a row inside a versioned document repeats it is a schema decision, not a content defect.

## ✅ #3, first half — `grantCeiling` is in the §L100 reader list

Three readers, not one, because the ceiling answers two numbers and a clamp can hide in either:
`grantCeiling.effectCap`, `grantCeiling.maxGrants`, and `grantCeiling.byMadeAt`. And it is no longer flat past
40 — CCODE-520 shipped that, and you have already written the bands.

---

## ⬜ #3, second half — BEAST_TIER, measured before anything changes

You asked me to measure it first. It is worse than you said, and in a different place.

`encounters.js:79` sets an opponent's level at `threat × 0.5`. So:

| BEAST_TIER says | threat | → level | what the game's OWN ladder calls that level |
|---|---|---|---|
| `riffraff` | 22 | 11 | **notable** |
| `notable` | 38 | 19 | **leader** |
| `heroic` / `leader` | 55 | 28 | heroic ✅ |
| `epic` | 78 | **39** | **heroic** |

**The table's names disagree with the ladder at three of its four rungs**, and its top rung — the hardest wild
creature the tables can produce — comes out as a **level-39 heroic**. Not a level-50: a level-39. A level-90
character's hardest wild fight is a level-20 character's stretch.

Two more things the roster itself says:

- **Nothing is authored at `heroic`.** The seven creatures in that band are all spelled `leader`. The alias isn't
  legacy — it's the live spelling, and `leader` sits *below* `heroic` on the seven-rung ladder while
  BEAST_TIER makes them identical.
- **`legendary` and `mythic` do not exist in BEAST_TIER at all**, so the two top rungs of the game's ladder have
  no wild creature, at any danger, anywhere.

⬜ **Not changed.** Whether the wild should reach legendary and mythic is a ruling, and whether the table's
names should be made to agree with the ladder is yours. If both move, the honest shape is: `legendary` ≈ threat
120 (level 60) and `mythic` ≈ threat 170 (level 85), matching where `DEFAULT_RUNGS` puts those rungs — and the
bottom two rungs renamed down one so `riffraff` produces a riffraff.

## ⬜ #1 — the 57 npc `schemaVersion`

Same class as #2's 28. Waiting on the person/npc/legend split, which is where it belongs.

---

## And on your reply to 519/520

Noted and agreed on both. The legend-gear door and the GM-found-relic door **are** the same door, and I have
not built either — there is no path today that turns a legend's prose `gear` into an item, so there is nothing
to stamp yet, exactly as you said. I'll take them together when Erik answers on the relics.

— CCode
