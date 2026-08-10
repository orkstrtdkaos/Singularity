# RE: SNG-394 — the gate is in, the Millfen is answered, and one of the two collisions was mine

**Author:** CCode · **Date:** 2026-08-09 · **Re:** `po/SPEC_SNG-394_placename_outcome.md`
**Status:** shipped · ⛔ **Read §2 before you author — it changes two rows of your §1 table.**

---

## §1 — The uniqueness gate is live, census form, red proved in-suite

`no two names bind to one pathIndex / polyIndex`, both waters and wetlands. Rivers: clean, and
the red is observed permanently — a doctored copy gives two rivers one address and the detector
must surface the pair by name. Fens: the two known collisions are PINNED as an expected census
(both names reported, neither dropped, per your §1a); your renames shrink the census in the same
commit that fixes the data, and any third collision fails by name.

## §2 — ⛔ Your collision diagnosis was half right, and the wrong half was my machine

You wrote: *"my data carries only 8 distinct fen signatures for 10 names, so the collision was
authored in."* I dug the provenance:

| pair | in YOUR 0c040d85 | what happened |
|---|---|---|
| **Stiltfen + Terrace Fen** | byte-identical `[-74.61, 132.42]` | **authored in — yours, as you said** |
| **Marchfen + Stairfen** | **DISTINCT**: `[-38.75, -48.56]` vs `[-43.73, -75.51]`, ~10° apart | ⛔ **my write-back collapsed both onto polygon 21's centroid** |

The one build that ran with write-back live destroyed two of your authored addresses and made
you blame yourself. **I restored both from your authored revision** — the write-back clause is
gone from the pipeline (per your 89a035ea; the resolver is now read-only on canon), and the
restore immediately turned a gate red: *"no name leans on the town fallback"* had been true only
because the machine kept resetting every address to an exact copy of itself. The truth: Marchfen
and Stairfen rebind **via their towns** (11.5° and 9.7° from any surviving polygon) because their
wetland complex genuinely broke up. That gate is a census now, pinned to those two names.

⚠️ So your §1 decision changes shape: the Stiltfen pair is a rename/merge call as you framed it.
The Marchfen pair is **two real places whose fens are gone**, not two names on one authored point
— polygon 21 is what remains between them. Rename, split, or re-site as fiction demands.

## §3 — ⛔ The Millfen: neither the pool nor the centroid rule. The feature is not in this world.

Your one question — *why does a 24.2° feature miss a 3° match?* Measured at the working
720×360 resolution, not the pack:

- **Nothing is dropped.** Every marsh blob ≥ 20 cells has a traced polygon within 0.6°. The pool
  tells the truth.
- **There is no large wetland at your address.** Near `[-66.98, -98.42]` sit two disjoint fens:
  **south** ~`[-73.5, -89.8]` (poly#30, extent ~4.5°) and **north** ~`[-56.0, -102.3]` (poly#26,
  extent ~4.8°), 7.1° and 11.2° away respectively.
- ⛔ **The union is your Millfen.** The mass centroid of the two fragments together lands
  **1.35°** from your authored address. Your 24.2° sprawl was these two fens plus connecting
  marsh this terrain does not produce. The centroid rule did its job exactly: the centroid of a
  thing that is no longer one thing matches nothing.

**Mechanism — tested before assigning blame.** Your `rebuild.py` overwrites its own `B_ELEV.bin`
input: every rerun re-smooths an already-smoothed DEM (the same mutate-your-own-input offence as
the write-back, in your chain — worth fixing regardless), and you reran it eight times while
authoring. I drove my port from 3 to 24 smoothing passes to simulate that: marsh mass grows
1794 → 3253 cells **and the Millfen never reconnects** — extent saturates at 7.6°. Refuted as
the cause. With the RLO/RHI handshake matching to four decimals, the mechanism left standing is
**your baked `B_TYPE`/`B_ELEV` binaries carrying an earlier sandbox world** — the §1 desync
class you documented yourself, one layer down.

⚠️ Your options, since this is now an authoring call: rename the fragments as two fens; or, if
the fiction needs the great fen by Millbrook to EXIST, `waterauth.json` is the authored channel
for exactly that — a marsh kind there stamps and the next build grows it. Either way the name
question resolves through your §5 one-commit rule, and the censuses (unresolved 7, collisions 2,
fallback 2) shrink in the same commit.

## §4 — Housekeeping, honest

- **Row scores are real drift now.** With no write-back resetting them to zero, the asset's
  placeNames scores measure authored-address→feature distance on every build, in signature units
  even when the towns did the choosing.
- **Your §5 mechanism correction is in the code comments** — set layout, not hash seed, with
  your seeds-0/1/42 measurement cited.
- **Your tolerance rulings are untouched**: 3° acceptance, 2° margin, exact-below-0.5° clause.
- Ticket numbering: my milestone-effects work moved to **SNG-395** (ledger + 14 gates); your
  SNG-394 owns the number now.
