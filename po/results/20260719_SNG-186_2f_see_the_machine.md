# SNG-186 §2f — see the machine, and your §5 questions answered by building it

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | v1.8.157. Full suite green by exit code; the 🔬 Machine screen verified live in the browser. |
| **Scope** | §2f only — the highest-value lever, built first per your §4 order. §2c/§2a/§2b are the next increments, not in this ship. |
| **Built** | `engine/devcapture.js` (new) · observer seam in `engine/claude.js` · `SALVAGEABLE_OPS` exported from `engine/gm.js` · `renderMachine()` + `opsFiredIn()` + nav button + boot wiring + feedback dev-mark in `app.js` · panel CSS · 9 smoke tests |

---

## §1 · What it is

The by-hand SNG-179 diagnosis — read the assembled prompt, read the raw model output, see what parsed and what the engine did with it — made a **standing button** instead of a devtools dig. The 🔬 Machine screen (dev-only) shows, for the last two-dozen model calls this session:

- the **assembled prompt** (system tiers + user turn),
- the **raw model response**,
- the **parsed result**,
- **which ops fired** this turn, and
- **firing counts per op-class**, cumulative — *including every op that has never fired.*

---

## §2 · Your §5 questions, answered from the build

**§5.1 — is there a clean seam where dev levers call the real paths, or do some reach past them?** For §2f there is exactly one, and it is the cleanest possible. **Every model call routes through `callClaude`.** I added a single optional observer there (`setCallObserver`) — the transport stays dev-agnostic, knows nothing about the workbench, and `app.js` registers the capture **only under `isDevMode()` at boot.** So §2f reads the real exchange the real turn produced; it does not reconstruct or parallel anything. No lever here had to reach past a path.

**§5.2 — is the assembled prompt recoverable at runtime, or does capturing cost extra per turn?** It was **not** retained (the prompt and raw were locals in `gmTurn`). It is now, at that one seam — and because every sub-call routes through `callClaude`, the capture gets the GM turn **and** intent-parse **and** narrate **and** generate for free, which is more than the question hoped for. The cost is a ring buffer of 24 entries, in memory, dev-only. In a player view the observer is `null` and **nothing is captured or held** (§3.4 — verified: `armed` starts false, and the disarmed `recordCall` is a no-op returning null, asserted by test).

**§5.3 / §2c — (not built this ship, but confirmed while here)** `startEncounter(def)` takes a full def and `sanitizeNewEncounter` already clamps a supplied one, so §2c is the real runner with an override object — no parallel entry point. That's the next lever.

**§5.4 — one screen or a panel per engine?** One screen with sections, per your lean. §2f is the first section; §2c/§2a/§2b/§2e will be sections on the same 🔬 screen.

---

## §3 · The load-bearing decisions

**§3.4 — nothing reachable in play.** The observer is `null` unless `isDevMode()` armed it at boot. `engine/devcapture.js` holds nothing until `armDevCapture(true)`. I verified the inert path with a test (disarmed → `recordCall` returns null, ring stays empty) as well as by reading: a player reload on the live URL never arms it.

**No third copy of the op list.** The firing-counts panel needs the full op vocabulary to show a **zero** for the ops that never fired — and a zero is the whole point (three ops read zero for sixteen levels; SNG-183 §3c). Rather than duplicate the list, I made `salvageOps`' key array the **exported `SALVAGEABLE_OPS`** — now the ONE source the salvager, the wiring audit (GUARD 2), and this panel all read. Two consumers were parsing `const keys = [...]` by source regex; both updated to the const name, so the rename can't silently drift them (a smoke test and the audit both re-verified).

**The real ledger, reused.** "Ops fired this turn" comes from the parsed turn; "cumulative applied/rejected" from `character._opLedger` — the same ledger `logOpOutcome` already maintains (SNG-179 §4.4). So **fired**, **emitted-then-rejected**, and **never-fired** read as three distinct states, which is exactly the distinction the SNG-179 diagnosis turned on — now visible without a play session.

**§3.2 — dev provenance in feedback.** A feedback report now carries `ctx.devMode` and a `_devActions` ledger. §2f itself is read-only so it appends nothing, but the plumbing is in place for §2c/§2d/§2e (mutating levers), and *dev mode being on at all* is now declared on every report — a bug filed from a dev session can no longer hide it.

---

## §4 · Verified

- **Suite:** green by exit code (`SUITE EXIT=0`), 9 new §2f smoke tests among them — inert-when-disarmed, capture fields, newest-first, `annotateLatest` binds to the newest gm-narrate (not the intent-parse before it), the 24-entry ring cap, and the shared `SALVAGEABLE_OPS` vocabulary carrying the three zero-ops.
- **Browser (localhost, `?dev=1`):** the 🔬 Machine screen renders; the **NEVER FIRED (32)** panel lists all 32 ops at 0 — `discovery`, `markTeacher`, `markDefiningMoment` among them — with no console errors. This alone is the SNG-183 §3c view Aevi described, standing.
- **The one path not exercised here:** an actual API capture (prompt → raw → parsed for a real turn) needs an API key and a played turn. It is Erik's browser-leg — and it **doubles as the SNG-179 verification** he already has queued: play a turn with dev mode on, open 🔬 Machine, and the Veth teach-me exchange is right there — prompt, raw `npcUpdates`, whether `bondType:"mentor"` fired, and whether `markTeacher` derived. The instrument and the thing it was built to diagnose arrive together.

---

## §5 · Remaining in SNG-186

Per your §4 order, next increments: **§2c** stage-an-encounter (the `tuningNote` balance harness as a tool — seam confirmed clean above), **§2a** go-anywhere, **§2b** the know-nothing reset (retrieval bugs are invisible from omniscience). Each is a section on this same screen, each through the real path.

*— CCode. One seam, inert in play, and the zero made visible without a play session to find it.*
