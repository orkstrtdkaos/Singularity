# Handoff → CCode · 2026-07-18 (Aevi, PO)

Everything below is verified at origin, not from a report. Suite green at HEAD.

---

## 1. A near-miss you should know about — and a guard I now run

**I silently reverted eight of your ships.** My LIBRARY_INDEX commit PUT a stale local `app.js`
with a freshly-fetched sha, wiping the `app.js` changes from SNG-153/154/156/157/158/159/160/161.
166 lines. No conflict fired.

It is the **exact fault you diagnosed in 146a** — the sha read *after* the content was computed —
committed by me hours after I closed your fix green. Root cause: `git pull` printed "Aborting" on
uncommitted work and I read past it, twice.

Restored from `4f4f5b0` with the traditions row re-applied; suite went 8 FAIL → 0.

**The discipline SHA-aware PUT does not give you:** it protects against a stale *sha*, never stale
*content*. I now snapshot pre-edit hashes and, before every write, fetch the remote and refuse if it
does not match what I actually edited from. Recommend the same on any file we both touch —
`app.js`, `SYSTEM_SPEC.md`, the manifests.

---

## 2. Two instruments were reporting numbers that meant nothing

**`abilitiesCombatClaimedNotTaught` could never pass.** `tests/wiring_audit.mjs` read `a.ranks`;
ability records carry `tree`. So `teachesCombat` was **always false** and the metric counted every
ability that *claims* combat (106), not those failing to teach it. The only way to move it was to
strip combat claims off abilities.

Fixed to `a.tree`: **105 → 42**. Also added the canon HARM vocabulary the regex was missing —
`function_vocabulary.json` defines `hinder` as *"WEAKEN, drain, impair, or slow"* and the detector
recognised none of those four words, so the gate contradicted the canon it enforces.

**Baseline is now 37** after this session's content work. Decrease-only as before.

I built a second detector (`po/function_integrity_v3.mjs`, canon-derived cues) and **its first cut
was also wrong** — my stopword list contained `harm`, `living`, `thing`, `directly`, i.e. the whole
definition of `strike`, leaving the verb's own name as its only cue. Corrected in-file with the
reason in the header. Treat it as a **candidate-finder, never a verdict**: it flags `unmake_seal`
as untaught while that ability's prose says *"meeting them kills."*

---

## 3. The §23 freshness gate under-protects

It checks **engine modules and abilities only**. This session I added 3 locations, a region, and a
rules file, and the header line drifted **silently** — 92→95 locations, 24→25 regions, 18→29 rules
files. No test complained.

Re-certified by hand. **Suggested:** extend the gate to the other counts on that line, or stop
asserting counts the gate does not cover. Half-gated freshness is worse than none, because it reads
as certified.

---

## 4. Ready for you to build

| Item | State |
|---|---|
| **SNG-149 Coliseum** | **Design canon shipped** — `content/packs/core/rules/coliseum_grid.json`, manifest-registered. 36 cells (28 cross-family + 8 same), the complete `FUNCTION_FAMILIES` space per A2, so it is finite and authored, not generated. Axis draw, pick rule, and resolution sequence are all specified as data. **Still blocked on 146e** (two players in one contest). |
| **SNG-148 waygates** | **Caveat lifted.** 2 gates → **25**, one per region, tiers 1/2/3. Verified against real character shapes: starting character aims at 2/24, invested *or* travelled 17/24, both 24/24. The browser leg is now meaningful. |
| **SNG-151 Palelands** | **Closed.** 3 locations in sibling-Reach shape (`cairnhold` with a tier-3 gate, `the_quiet_ground`, `the_long_grey`); `the_hollowing` seam connects both ways; manifest updated. |

---

## 5. Still open from your last two ships

- **Places version of the ⇊ merge** (for `back-corner-booth`) — yours, unstarted.
- **Kind-correction for mis-typed topics** ("Edge District Contacts") — yours, unstarted.
- **SNG-155 is CLOSED GREEN.** Erik's verdict: *"the default voice is good."* **Cloud tier 2 is
  cancelled, not deferred** — so your ROUND 2 questions 1, 5 and 6 are moot. No provider choice, no
  third credential, no new secret surface on a client-side app that has leaked one before. You were
  right to refuse the speculative answer; it never needed answering.

---

## 6. Small findings, not urgent

- **Pre-existing map collision:** `ent_deepwood` and `the_lampless_market` both sit at `(40, 300)`.
  Not mine — predates this session. Relevant to SNG-154's positioning work.
- `SYSTEM_SPEC.md` still carries a stale **"38 engine modules"** string somewhere outside the header
  line, left from the 38/137 era.

---

## 7. What Erik holds

146f · 146b/c · SNG-145 intent gates · SNG-148 waygates (now worth legging) · whether Silas's
personal arc **offers and starts** (closes 146d) · the Library's new *The Traditions* page (30
profiles, new render path, unverified in browser).
