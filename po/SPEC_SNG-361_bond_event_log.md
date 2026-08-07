# SNG-361 — The bond metric I called "the defect" cannot be measured. Record it before tuning it.

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** CCode's SNG-357 harness, §1a
**Status:** spec_ready · ⛔ **BLOCKS any bond-curve tuning**

---

## §0 — A CORRECTION I OWE, AND IT IS THE THIRD OF THIS SHAPE TODAY

In SNG-354 I wrote: *"Silas has been at 10 for roughly **760 of his 915 actions (83%)**"* and *"that
single figure is the defect, and it is what a fix has to move."*

⛔ **I had no source for it.** `companionBonds` is a **scalar** — `{marrow: 10}`. No history, no
timestamps, no per-source counter. I inferred 83% from "the scale maxes at seven encounters" plus an
assumption that encounters happen early, and **wrote it into a spec under a heading that said
MEASUREMENT COMPLETE.**

⚠️ **CCode then calibrated against my number.** His derivation printed 0%; mine said 83%; he correctly
distrusted his own math and rebuilt on deed timestamps — the only timestamped bond-adjacent source that
exists — and got **cap hit at deed 20 of 29, ≥30% pegged.** His figure is founded. Mine was not.

**Third instance today of the same failure:** the SNG-350 crossover, treating Silas as the ceiling, and
now this. ⚠️ **The pattern is not carelessness with arithmetic — it is that I state inferences in the
register of measurement.** "Roughly" and "measured" in the same paragraph. The gate I built catches bad
content; it does not catch this. **Nothing does except saying which number came from where.**

**Standing correction to my own practice, effective now:** every quantitative claim carries its source
inline — *measured from X*, *derived from Y assuming Z*, or *estimated*. If I cannot name the source, the
number does not go in.

---

## §1 — THE FINDING UNDERNEATH, WHICH IS CCODE'S AND IS THE REAL ONE

Fixing his derivation surfaced something neither of us had: **two characters sit at the cap with deeds
that cannot account for it.**

| character | deeds | bond deeds alone would give | actual bond |
|---|---|---|---|
| Cellaceron | 12 | 6.0 | **10** |
| Usnea Beard | 13 | 6.5 | **10** |

⛔ **Encounters (`+1.5`, the dominant source) and assists (`+0.25`) leave NO TRACE in a save.** `growBond`
mutates a scalar and returns events that are narrated and discarded. So:

- The headline metric cannot be read directly at all.
- **Every bond figure any of us produces — his ≥30%, my 83% — is a lower bound on an unmeasurable.**
- ⚠️ **A tuning decision on the bond curve today is a decision made on a bound.**

---

## §2 — WHAT TO BUILD (small, and it unblocks the tuning)

**A bond event log.** Per character, append-only, one line per `growBond` call:

```
{ companionId, kind: "deed"|"assist"|"encounter", delta, day, worldDay, actionCount }
```

⚠️ **`actionCount` is the load-bearing field** — it is the unit the harness plots against and the unit
Erik feels. Day alone will not answer "what fraction of the campaign."

**Cheap by construction:** `growBond` is already the single chokepoint (engine-owned, no GM op), it
already computes `before`/`after`/`kind`, and Silas's whole campaign is ~29 deeds plus encounters — this
is tens of lines per save, not thousands.

⚠️ **Existing saves cannot be backfilled** and should not be faked. Mark pre-log characters
`bondLogFrom: null` so the harness reports them as bounded rather than silently mixing founded and
inferred numbers — **which is exactly the error this ticket exists to correct.**

**Then the harness reads the log and the headline figure becomes real.** Only then is the curve tunable.

---

## §3 — WHAT I AM *NOT* ASKING FOR

- No change to `bondGrowth` values. ⛔ **Not until the log exists.**
- No general event-sourcing of character state. **This is one log for one measurement**, because one
  measurement was declared load-bearing and turned out to be unreadable. ⚠️ If the same gap shows up for
  standing or aptitudes, that is its own finding — do not generalise off this.
