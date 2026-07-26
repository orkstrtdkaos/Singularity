# SPEC — SNG-242: Model-routing audit — push more tasks to Haiku where quality allows
## Aevi (PO) · 2026-07-25 · Erik-prompted ("perhaps use Haiku more?")

## §1 — The good news: the routing ARCHITECTURE already exists
Erik's instinct is right, and better-supported than expected: `engine/claude.js` already has a **`MODEL_MAP`** —
a task→model router, single source of truth, every call site passes a `task` id. Haiku is ALREADY in use for 2
tasks. So this is NOT "build model-routing" — it's "audit the existing split and move more tasks to Haiku where
quality allows." Current map (verified at origin):
- **Sonnet (claude-sonnet-4-6):** gm-narrate, gm-meta, bio-gen, world-tick, generate, codex-adjudicate,
  chronicle, _default.
- **Haiku (claude-haiku-4-5):** intent-parse, chronicle-compress.
Per-task token BUDGETS also exist (gm-narrate 8000 is the giant; most others 900-1500).

## §2 — The principle: route by JOB, not by default
A task belongs on the flagship if its OUTPUT QUALITY is player-visible-prose or high-stakes-judgment. It belongs
on Haiku if it's bounded/structured/classification, OR high-volume where a small quality delta is worth the
cost/latency win. The default should NOT be "everything Sonnet unless proven otherwise" — it should be the right
model per job. Three buckets:

### KEEP ON SONNET (the crown jewels — do NOT downgrade)
- **gm-narrate** — the prose the player READS; already strained under load (SNG-237/239). Flagship, always. Its
  8000-token budget is the whole game's voice. Untouchable.
- **codex-adjudicate** — identity judgment ("worth Sonnet, one batched call" — the code already says so). Keep.
- **generate** — authoring new NPCs/locations/quests that must be GOOD + consistent (born-whole, SNG-234
  depends on it). Keep — a Haiku-authored NPC would be the thin, generic content we just fought to eliminate.

### MOVE TO HAIKU (strong candidates — Erik's instinct, made specific)
- **world-tick** → HAIKU. Verified: worldtick.js returns "a countable OUTCOME, not just prose" — "the world
  TURNS, it does not narrate." It's STRUCTURED state-movement the player NEVER reads as prose, and it's
  HIGH-VOLUME (every tick, often several per session). Bounded + structured + frequent = the textbook Haiku win,
  on BOTH cost and latency. Best single move.
- **bio-gen** → HAIKU (likely). A character bio is bounded, templated, one-shot at creation. Low stakes if
  marginally less flowery; not hot-path prose. Try it; A/B the quality.
- **chronicle** → HAIKU (worth testing). The story-so-far is ONE grounded paragraph from given facts
  (invent-nothing) — a constrained task. Note the ODDITY: `chronicle-compress` is ALREADY Haiku while
  `chronicle` is Sonnet; that inconsistency suggests chronicle was never deliberately kept on Sonnet. Test
  Haiku for it — and this decides the SNG-241 session-synopsis routing (which reuses the chronicle voice → it
  should ride whatever chronicle lands on; a synopsis is a bounded from-facts paragraph = Haiku-appropriate).

### INVESTIGATE (nuanced — could split)
- **gm-meta** (via gmAsk: "explain the stakes," quest/gambit meta-queries) — MIXED. Some is player-facing
  EXPLANATION (Erik's screenshot "[to the GM] explain the stakes" — wants quality, lean Sonnet); some is
  internal classification (Haiku-safe). CANDIDATE TO SPLIT: a `gm-meta-explain` (player-facing, Sonnet) vs
  `gm-meta-classify` (internal, Haiku). Only split if the internal-classification volume justifies it; measure
  first.

## §3 — Why this matters (the honest case, both sides)
FOR: the game makes MANY calls per turn (intent-parse + narrate + often generate/world-tick/codex sub-calls).
Every non-narrate call on Sonnet is paying flagship price for a job a cheaper model does ~as well. For a FAMILY
running many sessions (Courtney, the kids, cousins), cost compounds; and Haiku's LATENCY win makes the bounded
sub-calls (world-tick, intent-parse) feel snappier, which improves the play feel. world-tick alone, being
high-volume + non-prose, is a clear win.
AGAINST (the discipline): model-switching is a SEAM (SNG-232 irony — two models can disagree). A Haiku task that
feeds a Sonnet task (intent-parse → narrate) must hand off CLEAN structured data, or the cheaper parse poisons
the expensive narration. And a quality floor matters: a task moved to Haiku must be A/B'd against real play, not
assumed. Never move gm-narrate. The move is SURGICAL, per-task, measured — not "Haiku everywhere."

## §4 — How to do it safely (the method)
- **One task at a time, measured.** Move world-tick first (lowest risk, highest volume). Capture before/after
  via the See-the-Machine panel (it already logs model + token budget per call) — compare output quality on
  real turns.
- **A quality gate per move.** For a moved task, sample N real outputs at Haiku vs Sonnet; Erik (or a rating
  pass) judges "as good?" If yes, keep; if no, revert that one task. The MODEL_MAP makes revert a one-line change.
- **Watch the hand-off seams.** Where a Haiku task feeds a Sonnet task, verify the structured hand-off is clean
  (add to the seam ledger if a model-boundary field is load-bearing — SNG-232).

## OWNERSHIP
- CCode: the MODEL_MAP changes (world-tick→haiku first; then bio-gen, chronicle after A/B); the split of gm-meta
  if measurement justifies; wire the See-the-Machine before/after capture for the quality gate. One-line-per-task
  in claude.js — low-risk, reversible.
- Aevi: the per-task QUALITY judgment — I can review Haiku-vs-Sonnet samples for chronicle/synopsis/world-tick
  and call "as good?" (content/voice, my lane). And decide the SNG-241 synopsis routing (rides chronicle).
- Erik: the cost/quality PRIORITY — how much quality delta is acceptable for the cost/latency win (his call);
  and whether the family-scale cost is a real driver (it likely is).

## GUARDS
- **Never gm-narrate on Haiku** — the player-read prose is the product; it's already strained (SNG-237/239).
  Non-negotiable.
- **Measure, don't assume** — every move A/B'd against real output; the MODEL_MAP makes revert trivial, so
  there's no reason to move blind.
- **Hand-off seams are real** — a cheap task feeding an expensive one must hand clean data (SNG-232). A
  model-boundary is a seam.
- **Quality floor per task** — moving to Haiku is allowed only where output stays "as good" for the job; a
  thin-content regression (the thing we fought in SNG-233/234/238) is not an acceptable cost saving.
- **generate stays Sonnet** — Haiku-authored content is exactly the generic thinness the born-whole work killed.

## OPEN QUESTIONS
1. (Erik) Is family-scale COST a real driver (many sessions across Courtney/kids/cousins), or is this mostly a
   LATENCY/feel improvement? Changes how aggressive to be.
2. (CCode) What's the current per-session call mix (how many world-tick/intent/generate calls per session)? The
   See-the-Machine log has it — quantifies the win.
3. (Aevi) chronicle→Haiku: I'll review samples. The chronicle/chronicle-compress inconsistency suggests it was
   never deliberate — likely a free win.
4. (Erik/CCode) gm-meta split — worth the added task-id complexity, or leave whole on Sonnet? Depends on the
   internal-classification volume.
