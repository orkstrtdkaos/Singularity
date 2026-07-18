# BATCH-11 — close dispositions, and the next arc

| | |
|---|---|
| **Author** | Aevi (PO) · 2026-07-18 |
| **CCode build** | `20260718_BATCH-11_build.md` — six ships, v1.8.105→108 |
| **PO verification** | At HEAD `a55aac1`, by direct read + full suite run. **Not from the build report.** |
| **Purpose** | Close what can close, name what cannot and why, and hand CCode one ordered arc instead of three tickets. |

---

## §1 · Verification method

Per §21, a ship does not close because it shipped; it closes when the **original symptom** is verified gone. Every claim below was checked at origin. Where the symptom can only be reproduced in a browser, the item is **held**, not closed — a code read is not a reproduction.

Suite at HEAD: **green, including `tests/wiring_audit.mjs`.**

---

## §2 · CLOSED GREEN — three

### 146a · Law 7 violation, shared scenes — **CLOSED**
`party.js:15` imports `pushMergedFile`; scene writes and the open-index both route through it (`:170`, `:202`); `pushOwnedFile` survives only in the header comment explaining the old fault. The symptom was **reproduced live** — a two-client concurrent-beat test against the real repo, both beats surviving — and the reproduction is **persistent** at `scripts/verify_scene_merge.mjs`, so it is re-runnable rather than a one-time observation.

*Noted: CCode was right to contest my sequencing. This was losing data on every push while I was arguing for architecture-first.*

### §23 / Law 16 · The Wiring Contract — **CLOSED**
`engine/gm_registry.js` with **44 declared rows**; **all four** call sites assemble through `assembleGMContext` (`app.js:2601, 3513, 4662, 5332`) — including site C at 4615, the one my spec missed. `tests/wiring_audit.mjs` is in `npm test` and gates parity **both directions**. SYSTEM_SPEC Law 16 is ratified at line 38 in the positive framing; §23 is at 452; header re-certified **52 modules / 285 abilities**.

**The gate red-gated CCode's own SNG-145 ship for an undercounted module header — the exact drift class it was built to catch, caught within the hour, on its first day.** That is the close condition met by demonstration rather than by assertion.

### 147a/d · `challengeProfile` retired — **CLOSED**
280 records cleaned; **2 residual references remain in `content/`**, consistent with the stay-retired gate. Ratchet baseline pinned decrease-only (140/89/105). Suite green.

---

## §3 · HELD FOR ERIK'S BROWSER LEG — four

Code verified at HEAD. **Not closed** — the symptom lives in play.

| Item | What Erik does | Closes when |
|---|---|---|
| **146f** · personalArc | Open the quest log, click **"Take it on"** on the personal arc | It starts as a structured quest instead of failing silently |
| **146b/c** · scene lifecycle | Join a shared scene, leave last | Index entry appears on push and clears on last-leave; old scenes stop crowding the join path |
| **SNG-145** · intent gates | Cast a `lethal` ability at a living NPC; then cross a region boundary | Kill/incapacitate gate appears **pre-dice**; departure gate states the time cost; **moving inside a location raises nothing** |
| **SNG-148** · waygates | Use the map **◈** control from a non-hub location | Named gate when both keys are held; Crossing hub otherwise — never a failure state |

**SNG-148 carries a caveat Erik should hear before he legs it:** only **two** gates are seeded (Crossing hub + Axis Gate). The routing is correct and the network is not yet a network. **That is my authoring lane, not a build defect** — §5.

---

## §4 · The next CCode arc — read as one thing, in this order

Three specs shipped ROUND 1 while BATCH-11 was building. **They interlock; taking them as independent tickets will produce rework.**

### Order, and why it is forced

**1 · SNG-152 — prose integrity.** *First, and it is a hard prerequisite, not a preference.*
Truncation is not only losing display text — it is **corrupting identifiers**. `places.js:26` caps a sub-place name at 40 chars and the **slug is derived from the truncated name**, so `cooperage-rear-service-passage-cut-lan` can never match its own twin. **Truncation is manufacturing duplicate places.** Any de-duplication or re-parenting work done before this lands is operating on unreliable identity.
*The primitive already exists:* `smartClamp` (`namematch.js:8`, SNG-076) with the correct doctrine in its own docstring. It was applied to 4 files of 23. 190 caps measured; 52 destructive; 12 carry an ellipsis; **0 cut on a word boundary** outside `smartClamp` itself.

**2 · SNG-154 stage 2 — required `parentId`.** *Fixes what Erik reported; stop there before building maps.*
There is **no `parentId` anywhere in the codebase.** The Low Lamp Inn's map position is a **hash of its id** — promoted from sub-place to location by a `moveTo`, promotion dropped the parent, and `autoMapPositions` fell through to its hash-grid last resort. Requiring `parentId` and preserving it through promotion retires both reported bugs. Relative positioning, the three viewports, and routes all come **after**, and each is separately verifiable.

**3 · SNG-153 — codex auto-consolidation.** *Cheap half first.*
Auto-merge already exists (`codex.js:167`); the medium band simply has no adjudicator. But **the queue is mostly generator noise** — the scorer counts shared links as identity evidence, so «Pell»(`entityId=pell`) ↔ «Calvar»(`entityId=calvar`) is asked despite being structurally provable as distinct. **Gate 1 (structural NO) retires three of the six on screen with zero model calls.** Build that before the adjudicator, or the model will spend tokens proving Pell is not Calvar.
**Hard prerequisite inside this one:** *is `absorb` fully reversible today?* Auto-merge is only safe because it is undoable. **If `absorb` is lossy, that is a blocking fix and auto-merge must not ship before it.**
*Live bug found in passing:* `compatible()` treats `lore` as a universal wildcard and **is shared with the auto-merge tier** — a lore topic can be silently absorbed into a person on a name hit today.

### Why 153 shares machinery with 154
SNG-154's migration needs duplicate collapse (`upper-meadow` vs `upper-meadow-north-of-millbrook-`). That is the **same judgement call** as the codex merges, one tier over. **Build the adjudicator once in 153 and reuse it in 154's reconcile step.** This is the main reason to sequence rather than parallelize.

### Also unblocked, lower priority
**146e** (phase-2 joint participation) is design-only in spec and now unblocked — 146a made the scene writer safe enough to put two players in one contest. It gates **SNG-149** (Coliseum), which gates nothing but wants **SNG-150** (Council) to mean something.

---

## §5 · Aevi's lane — what I owe, and what is blocked on me

| Owed | Blocks | Note |
|---|---|---|
| **Waygate per-region authoring pass** | SNG-148 *feeling* like a network | 2 gates seeded of ~25 regions. Routing is built and correct; the world is empty. **Mine.** |
| **147b** · `harmRung` backfill, 140 of 285 | **SNG-145's harm gate on half the corpus** | The gate cannot fire for an ability that declares no rung. Ratchet counts each batch down. |
| **147c** · function-teaching rewrites, **40** | — | Corrected from the inflated 71. Only **5** are HARM-family; the real debt is `restore`(10), `empower`(7), `foresee`(7) — the verbs **SNG-092 created or split**, re-tagged onto abilities whose grant text was never rewritten. Dated migration debt, one cause. |
| **Per-rank migration**, 278 of 285 | the audit's precision | The pilot (`reach_death_life.json`) established the pattern: per-rank `functions` + `harmRung` + `gains: broaden\|deepen`. |
| **SNG-149 / 150 design** | — | Coliseum axes re-grounded on `FUNCTION_FAMILIES` per A2; Council shape ruled by PM. |
| **SNG-151** · `the_palelands` | — | A declared region with **zero locations** — the death-pole Reach, home of the tradition rewritten this session. Unscoped pending PM ruling. |

---

## §6 · The through-line, for the record

Seven capabilities this session were found **built, correct, and used at exactly one site**: `skill_battle`, `pushMergedFile`, `gmAdviceFull`, `stateOps`, `smartClamp`, `mergeCodexTopics`, and the reconcile-step digest note. Not one was missing. Every one was a connection that was never made.

That is what §23 is for, and it is the reason 152/153/154 are all *"generalize the thing already there"* rather than *"build the thing."* **The estimate for all three should be read accordingly — they are smaller than they look.**

---

*— Aevi (PO). Three closed on verification at HEAD, four held for the browser leg. CCode: the arc is 152 → 154 stage 2 → 153, and the reason it is an arc is that 153's adjudicator is 154's migration tool.*
