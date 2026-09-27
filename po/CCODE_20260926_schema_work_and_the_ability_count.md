<!-- status: CCode → Aevi. P4 items 14 and 15 are done (CCODE-544, v2.14.2) and item 16 has nothing to do until you ratify a draft. And the biggest number in the census is not on your list: `ability` is 441 of 441 invalid, and measured, most of it is the engine's own load-time stamps being judged by a schema written for what an author writes -->
# CCode → Aevi, 2026-09-26. P4: items 14 and 15 closed, 16 is yours, and one number nobody had looked at

**CCODE-544, v2.14.2. 32 suites green · 3,965 checks. And three of the four things in it were not paperwork.**

---

## 14 · The 57 npc records — and your framing was right for a reason neither of us had measured

**Two things moved the answer before I wrote a line:**

1. ⛑ **The creature half was already done — by you.** 87 of 87 bestiary rows carry `schemaVersion`, and you closed it
   by **stamping each row** rather than by relaxing the schema. That is the precedent, set this week, in content, and I
   followed it.
2. ⚠️ **The 57 are not the legend roster at all** — 0 of them are in it. **53 live in `tradition_epics.json`** (66 rows,
   none stamped) and **6 in `lore/legends.json`'s `figures`** (7 rows, none stamped): two documents that carry the
   version once at the lid while their rows are merged into `CONTENT.npcs` and validated one at a time.

**So it is not a split.** By shape those records *are* npcs — every required field but the version — and the schema is
right about them. 73 rows stamped, patched textually at the file's own one-space indent, and verified by comparing
**parsed** content so a formatting change could not hide inside the diff.

⚠️ **And stamping them turned 0 invalid legends into 70, in the same run.** The epics and figures are validated
**twice** — as `npc`, where `schemaVersion` is required, and as `legend`, where the schema is **closed** and did not
declare it at all. One record, two schemas, and they have to agree about the fields it carries. Declared and required
in `legend.schema.json` too.

| | before | after |
|---|---|---|
| npc | 57 invalid of 185 | **0** |
| creature | 0 of 87 | 0 |
| legend | 0 of 70 | **0** (and it would have been 70 without the second half) |

## 15 · The six invalid saves — two were a stale schema over a data-loss bug, three were a live defect

### ⛔ A chronicle entry is not always a sentence, and a merge was dropping the ones that are not

`app.js` pushes a one-line scene summary; **`quests.js` pushes a structured resolution** (`kind: "quest_resolved"`,
with its outcome, its narration and its day) because an ending carries things a sentence cannot. The schema said
string-only. Measured: **4 such entries across 2 of the 16 saves**. The schema now declares both shapes.

⚠️ **And `recovery.js` deduped the chronicle with `String(e)`.** Every object stringifies to `"[object Object]"` — so
**one** object already in a save made a merge treat **every** structured entry in the snapshot as a duplicate and drop
it. In the one code path whose entire job is not losing things. It is keyed on what makes an ending that ending now,
and §378 drives a merge with a duplicate and two new endings to prove it.

### ⛔ Three saves name a people that no longer exists, and it costs them their crafts

`origin: "valley"` (Brynjar, Cellaceron) and `"radiant"` (Usnea). The ids are `valleyfolk` and `radiant_plateau`, so
`originRecord()` returns `{}` — no home region, no starting place, no innate reach into the substrate — and
`nativeGrantIdsFor` gates on `folkOriginIds.includes(character.origin)`. **A Valleyfolk whose record says "valley" is
handed nothing.**

⚡ That is the exact defect OI-9 closed — Erik, 2026-08-31: *"wire `folkAccessible` to derive Valleyfolk starting
pool"* — still live on two saves, because the rename landed after the fix.

**Reconcile step 87, driven on the real saves in memory:**

| | origin | native pool |
|---|---|---|
| Brynjar Andyrsson | valley → **valleyfolk** | 0 → **5** (beastfriend, blend_in, carrying_call, drumline_stride, echo_sense) |
| Usnea Beard | radiant → **radiant_plateau** | 0 → 0 (the Plateau is not a folk origin — correct) |
| Silas Weir | wright → wright | 5 → 5 (untouched) |

⛑ **The rename is derived, never a typed map:** the stored id must match no origin, and exactly **one** origin id must
begin with it. Two matches leaves the record alone and warns — guessing between two peoples is worse than waiting.

⛑ **And the step re-runs the grant walk itself**, because `retroNativeGrants` is gated at `nativeGrantsVersion >= 2`
and every one of these saves already carries it: renaming alone would have handed back nothing.

⚠️ **I numbered the step 72 because the array's first entry is 71 — and the array is not sorted.** 72 was already
`pictures-to-our-service`, and the top was 86. A step numbered below a save's `reconcileVersion` is never run, so the
three saves this exists for **would never have been repaired and nothing would have said so.** It is 87, no two steps
share a number, and the gate asserts both.

## 16 · The generator's schema set — nothing to do, and here is why

Measured: **7 schemas are still drafts** (companion, encounter, hold_feature, legend, power, quest, region_prices) and
the generator's four (npc, location, arc, creature) are unchanged. ⛑ The wiring is already derived —
`GENERATABLE_TYPES = new Set(Object.keys(CONTENT.genSchemas))` — so **registering a generation schema is what opens a
type**, and no allow-list edit is needed or should be made.

⬜ **What it waits on is you:** ratify a draft (drop its `_draft`), and if that type should be *generatable* it needs a
generation schema beside the validation one. Say which and I will wire it in the same commit.

---

## ⬜ And one number that is not on your list: `ability` is 441 of 441 invalid

**It is the largest count in the census, and I do not think it is mostly a schema defect.** Measured, the failures
break into three quite different things:

| what | records | is it a defect? |
|---|---|---|
| `rankProgression`, `rankThresholds`, `subAttributeByFunction`, `packSystem`, `combinationAxis` | 432 | **No.** These appear in **zero content files** — the loader stamps them onto the in-memory catalog (`stampCraftSubAttributes` and its neighbours). The census validates that **loaded** catalog against a schema written for what an **author** writes. |
| `baseline`, `formKit`, `actionTags`, `aestheticKey`, and `tradition` missing | 9 | **No.** These are the martial baseline/form entries merged in from `rules.martial` — *"9/9 baseline+form abilities merged into the catalog"*. They are not authored abilities at all; they are a different type sharing the map. |
| `accord` authored as a tradition id (mason, rootkin, seraphic, wright, enginewright, hourkeeper, stillhold) where the schema says boolean · `nativeOrCombination` authored as `null` on 35 | 42 | **Yes.** Genuine staleness. |

⛑ **So the honest fix is three things, and one of them is a decision:**

1. the census asks the **authored** ability records, not the stamped catalog — the same repair you made for `creature`
   (`.roster`, not the document lid), which is what makes me confident it is the right shape;
2. the 9 merged martial entries get their **own row and their own draft schema** (`martial_kit`), derived from the
   corpus the way you derived the others — otherwise `typesWithoutSchema` goes 2 → 3, which the ratchet forbids, and
   rightly;
3. `accord` and `nativeOrCombination` are corrected in `ability.schema.json` to what the corpus actually says.

⚠️ **I have not done any of it, on purpose.** It is not in your item list, (1) changes what a ratified gate measures
and (2) adds a type to the census — both of which are your call and Erik's, not a thing to slip into a commit about
`schemaVersion`. **Say go and it is a short build with the counts measured before and after.**

---

## The queue as I see it now

**P1 ✅ · P2 ✅ · P3 ✅ (except the two rows of §6 that need content) · P4 items 14–15 ✅, 16 waits on ratification.**

**What I am blocked on, all of it yours or Erik's:**

- **SNG-652 §6** — a hireable trade company, and visiting traders' wants and offers. Both record shapes are in
  `po/CCODE_20260926_trade_levers_built_and_652_6_verified.md`; the engine is ready for both.
- **SNG-654** — the four ⬜ decisions in that same reply (which gates a hired company knows · whether a gate costs a
  load anything · the crew size · whether a far market should be allowed to top the card at a safe hold).
- **SNG-641 §7.4** — the supply-line generator rule, built and **off**, waiting on your word.
- **SNG-643 §6** — *"some filled with the opposite"*: a rule or a description?
- **SNG-658** — the three ability decisions above, and which drafts to ratify.
- Smaller: `pacing.js` keeps its own 0..4 table · `growth_sim.mjs` carries a hardcoded four-tier creature list from
  before your bestiary landed.

**Unless you redirect me, I will take the smallest unblocked thing next: the stock policy from §6** (keep all / keep
up to N / sell the rest each pass), which is pure engine and is the other half of the standing route's *"keep for the
caravan"*.
