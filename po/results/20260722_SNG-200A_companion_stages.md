# SNG-200A — a companion reaches its authored top stage, and the codex knows it

**CCode · 2026-07-22 · v1.8.188 (`47a0e529`) · suite green.** The unblock + the codex half of SNG-200; the arc/generation feature (§2/§3) is 200B, deferred with reasons.

---

## §1 — the ladder (Q1 answered: derive, no re-authoring)

`stage2At` has **no consumer outside companions.js** (verified), so generalizing is safe. Stage now derives from the companion's own `stages[]` against thresholds that span the bond scale: the **final authored stage reaches the top** (`maxBond` 10), **stage 2 stays at the authored `stage2At`** (8) so no save's computed stage regresses, middle stages spread linearly. A 3-stage companion → thresholds `[8, 10]`; a 2-stage one → `[8]` (unchanged).

Crucially, **stage is live-derived from bond, never stored** — so Huginn at bond 10 becomes stage 3 ("The One Who Stays") the instant this ships, no regrind. `growBond` emits a `stage:N` event for every authored stage crossed (legacy `stage2` kept as an alias so no reader breaks), and the app gives each reached stage its own beat with the stage's prose. The previously-inert top 20% of the scale now unlocks the final stage. Answering your ⚠️ range defect directly.

## §4 — the codex (Q4 answered: one shared primitive)

Companions were in **neither** the npc nor generated codex path — the third instance of the two-paths-one-complete shape you flagged (SNG-185, SNG-199, this). My answer to "one shared primitive or three local fixes": **one primitive, already built.** SNG-199 made `applyCodexUpdates`-called-at-the-write-site the shared mirror; `companionCodexUpdate` just produces the payload and calls it — on recruit, on each stage change, and (existing saves) via reconcile v16. So the companion joins the codex the way meeting a person and reaching a place now do.

**§5 guard held:** the codex node carries only player-facing stage prose, **never the GM-eyes-only `hooks`** field (Marrow's "may be an Ashwarden proper" stays GM-only — it still feeds `companionsForGM`, correctly). Asserted in tests, both on the node and the recovery note.

## Recovery

Reconcile **v16** gives every current companion its codex node and names, once, any companion now sitting at a stage the old cap hid — so **"What's next for Huginn?" answers itself on next load: The One Who Stays.** Idempotent (codex dedupes; note fires once via the version gate).

## Verified

16 new tests: thresholds (n=2 and n=3), live stage derivation including no-regression at bond 8, per-stage events + the legacy alias, the codex payload + the hook never leaking, the v16 recovery + idempotency. Full suite green. **Boots clean on a fresh port at v1.8.188** — the reused-preview-tab strand I hit was a known stale-module cache (the served `companions.js` has the new exports, confirmed; the app's bare `import` got a cached copy), not a code issue; verified on port 8106.

## Deferred to SNG-200B (own pass, flagging not dropping)

- **The evolved form as a mechanically distinct thing** (§2) — reaching the end-stage should change what the companion DOES, not just its prose. Marrow's shape (watches → tells → stayed) is a *revelation* arc, not an ascension — the system must express that as well as Aevi's power-growth (your ⛔).
- **Witnessed-deed memory** (§2, Q2) — a companion referring to what it saw. (Q2 for me: I have not yet traced whether there's a path to the deeds at narration time; that's 200B's first check.)
- **Companion generation** (§3) — a generatable type with `bondGrants` validated like an authored ability (no inflation lane, same discipline as SNG-197 §4).

*— CCode. The last two bond points now buy something, and the deepest stage was there all along. Erik's leg: load Huginn — he should arrive at "The One Who Stays," with the recovery note, and gain his codex piece. Only-Aevi-closes.*
