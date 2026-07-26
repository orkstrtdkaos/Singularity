# SPEC — SNG-240: Reduce GM prompt load (the root under the offer/clarity failures)
## Aevi (PO) · 2026-07-25 · promoted from SNG-237 Fix D / SNG-238 (number collision resolved)

> This was referenced as "Fix D" in SNG-237 and mis-numbered under SNG-238; it's its own ticket now: SNG-240.

## §1 — The root the auditor exposed
The Playthrough Auditor (SNG-236) and the quest-clarity finding (SNG-239) share ONE root: the GM prompt is
SATURATED — `GM_SYSTEM` ≈ 12,337 tokens, 19 numbered rules, 28 sections, **114 MUST/NEVER/ALWAYS directives**.
Under that load an LLM keeps the hard MUSTs and drops the soft conditionals, which is why:
- the SOFT encounter-offer (rule 18 "when the fiction invites it") got dropped → Silas's zero encounters (SNG-237);
- the quiet "report quest progress" lost to the vivid "be mysterious" → opaque quests (SNG-239).
Every fix so far HARDENS a dropped directive (Fix A's hard offer, SNG-239's MUST-STATE reveal). But **every hard
MUST added to beat the saturation DEEPENS the saturation.** Hardening is a stopgap; the durable fix is to
REDUCE the load so the good rules don't compete.

## §2 — The fix: TIER the prompt (load-bearing-every-beat vs situational)
Not every section belongs in every turn's context. Audit the 28 sections + 114 MUSTs into:
- **ALWAYS (load-bearing every beat):** scene state, the character, the active resolution, the current quest
  stage + its reveal, the active offer/encounter, momentum. These stay.
- **SITUATIONAL (include ONLY when their trigger is live):** precursor drift (only under drift), waygate detail
  (only near a waygate), promotion/acquisition offers (only when standing earns), mastery (only when RIPE),
  emergence (only when RIPE), gambit rules (only mid-gambit), delegation (only when delegating). Many are
  ALREADY conditional in code — the work is auditing the ALWAYS-included set and moving rarely-relevant blocks
  BEHIND their triggers.
The measure of success: the every-beat prompt drops meaningfully in tokens/MUST-count, so the encounter-offer,
quest-clarity, and other "quiet good" rules aren't competing with blocks that don't apply this turn.

## §3 — Why this is the meta-fix under the meta-fixes
SNG-236 proved the ENGINE is fine and the GM is the bottleneck. SNG-237/239 are hardening individual dropped
rules. SNG-240 addresses WHY they drop: too much at once. Do this and the future pattern changes — a new soft
rule can SURVIVE without being escalated to a MUST, because there's room. It's the load-relief that makes the
prompt maintainable instead of an arms race of MUSTs.

## OWNERSHIP
- Aevi: lead the load audit — which sections are situational is a design/voice read (I know what each block is
  FOR and when it's live). I'll produce the ALWAYS-vs-SITUATIONAL classification of the 28 sections + a
  proposed trigger for each situational one.
- CCode: measure the current every-beat token/MUST budget; implement the tiering (move situational blocks
  behind their triggers in buildTurnContext); gate a token BUDGET so the prompt can't silently re-bloat.
- Erik: confirm the direction (a leaner prompt trades some always-on nuance for reliability — a real call).

## GUARDS
- **Situational ≠ deleted** — a moved block still fires when its trigger is live; it's just not in the context
  when irrelevant. No capability is lost, only noise.
- **Measure before/after** — the point is a real token/MUST drop; a tiering that doesn't reduce the every-beat
  load is theater.
- **Don't strip the load-bearing** — scene/character/resolution/active-quest/active-offer/momentum stay ALWAYS.
  The cut is the rarely-live blocks, never the spine.
- **A budget, ratcheted** — once trimmed, gate the every-beat token count so a future PR that re-bloats the
  prompt fails, the way wiring_audit gates wiring. Otherwise it creeps back.

## OPEN QUESTIONS
1. (Aevi) produce the ALWAYS-vs-SITUATIONAL classification — my next deliverable on this ticket.
2. (CCode) what's the current every-beat token count with a typical world-state, and what's a realistic budget
   target after tiering?
3. (Erik) acceptable trade — a leaner prompt is more reliable but slightly less always-context-aware; confirm
   reliability is the priority (the auditor says it is).
