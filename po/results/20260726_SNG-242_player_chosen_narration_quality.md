# SNG-242 §5 — player-chosen narration quality (the Setting + the toggle + the retell)

**CCode · 2026-07-26 · v1.8.283 (`bea9ab2b`) · npm test exit 0 (2497 PASS).** Erik: *"the player could select when they want a better description (Sonnet)"* + *"make it a setting I can use as well."* Built the §5 headline (the player quality-lever) with the persistent setting he asked for.

## The architecture was already there (§1)
`claude.js MODEL_MAP` is a task→model router; every call passes a `task`. So this is a routing addition, not a new system. Added two tasks: **`gm-narrate-rich`** (flagship, 12k budget) and **`gm-retell`** (4k). Standard `gm-narrate` is unchanged (still Sonnet — I did NOT drop it to Haiku, because §5b makes that contingent on Aevi judging a Haiku-default quality floor; the task-per-tier split means standard can drop to Haiku later by a one-line MODEL_MAP change, with all the surfaces already working).

## What I built
- **The tier mechanic** (`gm.js gmTurn(ctx, {tier})`): `"rich"` routes to `gm-narrate-rich` and appends a *"tell THIS beat fuller/more vivid, same outcome/ops/scene"* directive to the **uncached** user message (so the prompt cache is undisturbed). Same JSON shape, richer prose.
- **`reNarrateRich`** (`gm.js`): the **state-safe** *"tell it again, richer."* Re-renders **prose only** from a committed beat — same events, adds nothing, **never re-rolls or re-fires ops** (the SNG-232 seam discipline: it reads the committed result, never re-executes the turn).
- **runGM tier selection**: the beat's tier = the one-shot **✦ Rich** toggle if armed, else the player's **Settings default** (`profile.narrationTier`). The toggle is consumed each turn.

## The three surfaces (§5a — all built)
1. **The Setting** (Erik's ask): *Settings → "Narration richness: Standard / Rich"* (`profile.narrationTier`, persisted). **Verified live: renders.**
2. **The per-turn ✦ Rich toggle** by the input — arm one beat for the beautiful telling. **Verified live: renders + arms on click.** (Hidden when the default is already Rich.)
3. **The post-turn "✦ Tell it again, richer" button** on any real turn — the state-safe retell of that beat. (Needs an API key to exercise.)

## Honest notes / owed
- **Standard stays Sonnet for now.** §5b's "invert the default to Haiku-cheap" is gated on Aevi judging the Haiku narration good enough; until then, "rich" = a *fuller Sonnet telling* (bigger budget + the directive), which is a real upgrade and lets Erik try it today. When Aevi clears the Haiku floor, standard→Haiku is one line and the whole cost-inversion lands with these surfaces unchanged.
- **AEVI owes:** the Haiku-default quality-floor judgment (§5e).
- **ERIK owes:** whether to **meter** the rich tells (N/session, a spent resource) or leave them **open** — currently open/unmetered. And the per-task moves in §1-4 (world-tick→Haiku, etc.) are still good follow-ups, measured via See-the-Machine (which now shows model + budget per call — SNG-238 dev-tools work).

## Addendum — the "Fast (Haiku)" tier (v1.8.284 `66773db8`)

Erik asked "how do I set it to use more Haiku?" — and the honest answer was that he *couldn't*: Standard and Rich were both Sonnet. So the setting is now **three-way**: **Fast → `gm-narrate-fast` → Haiku** (cheaper + snappier), Standard → Sonnet, Rich → Sonnet-fuller. This is §5b's inversion made **opt-in** (Erik chooses it; the family default stays Standard until Aevi clears the Haiku floor — the guard is respected because Haiku isn't forced as the default, only offered). The ✦ Rich toggle + the retell still spend **up** to the flagship, so a Fast default yields the intended cheap-by-default + beautiful-where-it-matters economics. Verified live: the setting renders all three, Fast is selectable + persists. Erik is now the A/B judge for the Haiku telling by playing on Fast.

## Addendum — world-tick Haiku A/B + in-play switch (v1.8.285 `9a6f733f`)

Erik: "try Haiku on the world beat ticks + set up an A/B compare." The world-tick is §1-4's clearest Haiku candidate (structured state-movement the player never reads as prose, high-volume). Built both the switch and the measurement:
- **`callClaude` opts.model override** (wins over the task map); `MODELS = {sonnet, haiku}` exported.
- **`worldtick.js`:** `aiGeneratedEvolution` + `advanceGeneratedOffscreen` thread a `model`; new export **`worldTickABCompare`** builds the current offscreen batch ONCE and runs the evolve once per model on that *identical* input — read-only (no `wantOutcome` applied, `worldState` untouched; a comparison, not a real tick).
- **See-the-Machine → "Model & cost" block:** a **World-tick model** toggle (Sonnet ⇄ Haiku, per-browser, reversible) that the live tick honors (`maybeTick` passes `worldTickModel()`); and a **"⚖ Run world-tick: Sonnet vs Haiku (same input)"** button showing both models' developments side by side + latency, per-call tokens in the capture cards.
- **Verified:** the A/B builds a real 4-figure batch off Silas's save (Vash/Siol/Tane/Cassiel) with 0 calls at `models:[]`; on a fresh port the block renders + the toggle flips + persists. npm test exit 0.

*— CCode. The player holds the quality dial now — cheap by default, beautiful where it matters, chosen by the one who knows the beat mattered. World-tick is now switchable + measurable. status: complete_pending_review.*
