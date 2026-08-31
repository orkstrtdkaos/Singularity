# SPEC — Starting Grants and Character Creation Revamp

**Author:** Aevi (PO) · **Date:** 2026-08-31
**Status:** `round_2_requested` — CCode to survey current state before Aevi authors anything
**Related:** SNG-192 (creation flow), SNG-101b (native grants wiring), `martial_paths.json`
(baseline defense kit), `native_grants.json`, `origins.json`, `class_archetypes.json`

---

## §0 — WHAT ERIK ASKED FOR

> *"I want to eliminate the basic strike, guard, etc. skills in favor of the ability for people
> to use certain skills even when they run out of energy (the zero energy use skills that are the
> conserve version). AND I want to reduce the number of skills you get at lvl 1. I agree with
> the basic sense skill by tradition (pick one) and another skill — recommend a strike — being
> initial grants (these could be informed by their ability points invested). Then they get to
> choose 2 more from their available list."*

Four goals, explicitly named:

1. **Fewer starting skills.** Sense + danger-response (informed, possibly required by type) + 2
   chosen = 4 total. Down from current 5–8 depending on tradition.
2. **Eliminate redundant basic skills.** `strike_basic`, `brace`, `break_away`, `raise_alarm`
   — the baseline defense kit in `martial_paths.json` — are made redundant by the zero-energy
   ruling. If the conserve version of a craft fires at zero cost when drained, generic combat
   actions don't need to be discrete grants. The body already does them.
3. **Stat sensitivity.** The starting kit should reflect what the character invested in. A player
   who moved points OUT of Body shouldn't start with a Body-primary skill. The recommendation
   and the available pool should both respond to the attribute distribution the player chose.
4. **Smooth and fun.** Creation needs a revamp anyway. The flow is currently broken in ways
   SNG-192 measured (wall of 45 buttons, grants land at commit so the player can silently waste
   a pick, `class_archetypes.json` is authored and orphaned). That work is connected to this.

---

## §1 — PWSV (measured before speccing)

This spec does NOT measure these numbers — that is CCode's ROUND 2 job. What follows is what
Aevi can read from the existing files; the live engine state may differ.

**What exists today (from content files):**

| thing | state |
|---|---|
| Baseline defense kit | `martial_paths.json` — `brace`, `strike_basic`, `break_away`, `raise_alarm`. `powerSystem: baseline`, zero-cost, granted to everyone at creation. |
| Native grants | `native_grants.json` — 24 traditions, `grantCap: 5`, `anchors` + `byLean` pools per tradition. Totals range from 3 (Somatic: 2 anchor + 1 byLean) to 8+ (Harmonic: 5 anchor + 3 byLean). |
| Folk native grant | `native_grants.json` — 13 anchors + 2 byLean, keyed as `folkNativeGrant`, `folkAccessible: true` on each craft. Valleyfolk origin uses `nativeKind: folk`. |
| Three creation paths | Per SNG-192: prologue → domains → abilities → companion → form → bio → commit. Three paths referenced but their specific shape needs CCode to describe. |
| `class_archetypes.json` | 6 archetypes with `byReach` field. Authored. Zero readers. |
| Suggestion engine | `state.prologue.tags` (revealed preference) + `state.bio` (free text) + attribute lean — all gathered, none used at the ability pick step. |
| Wasted-pick bug | SNG-192 §1: `applyNativeGrants` runs at COMMIT, not at ability step. Player can silently pick a skill they're getting for free. Status of fix: unknown to Aevi. |
| `folkAccessible` flag | 18 crafts carry it. Zero engine readers (per earlier ROUND 2). |

**What Aevi does NOT know and needs CCode to measure:**

- Whether the wasted-pick bug (SNG-192 §1) has been fixed since the spec was written.
- What the three creation paths actually are — their names, their steps, their differences.
- Which of those paths the starting grant logic runs in, and at what step.
- Whether the baseline defense kit (`martial_paths.json`) is actually granted today, or whether
  it is authored and not yet wired (the pattern is common enough to ask explicitly).
- How ability scores are collected at creation — the specific UI step, the values available,
  and how the engine currently reads "attribute lean."
- Whether `class_archetypes.json` is still orphaned or has been wired since SNG-192.
- What zero-energy conserve looks like in the engine today — is there a `conserveVersion` of
  every craft, or is it a flag, or something else? This determines whether the baseline defense
  kit is truly redundant or whether it still covers actions the conserve layer doesn't.

---

## §2 — THE DESIGN INTENT (what Aevi is proposing, to react to)

### §2a — Retire the baseline defense kit

`brace`, `strike_basic`, `break_away`, `raise_alarm` exist to ensure no character is helpless.
The zero-energy ruling does the same job structurally — a drained character fires the conserve
version of whatever they have, and can always do a basic physical act at zero cost.

**IF the zero-energy conserve layer covers: plain strike, basic guard/block, disengage, and
alerting others — then the baseline kit is redundant and should be retired.**

The condition is the key. If conserve doesn't cover all four, the ones it doesn't cover need to
stay somewhere. CCode should answer this in ROUND 2 before anything is retired.

**Note on form kits:** `martial_paths.json` also carries form kits (Ent branch-club, etc.) These
are NOT baseline — they're form-specific. They are out of scope for this spec.

### §2b — Starting grant structure: sense + danger-response + 2 chosen

**At level 1, a character starts with:**

| slot | what | how determined |
|---|---|---|
| 1 | **Sense** | Comes with the tradition. If the tradition has two senses (Harmonic has `sonic_resonance` and `tremor_sense` as distinct sense anchors), player picks one. Not optional — every tradition member has their people's way of perceiving the world. |
| 2 | **Danger-response** | Informed by attribute investment. The tradition's available craft that most directly addresses physical danger, filtered to the player's highest attribute. Not a free pick — the system recommends one and the player confirms or swaps within the tradition's danger-response pool. Required TYPE (must address danger), not required ID. |
| 3–4 | **2 chosen** | Player selects 2 from a curated pool. Pool is drawn from the tradition's available crafts, filtered to exclude slot 1 and 2, ordered by attribute match. Pool is SHORT — 4 to 5 options, not the full tradition list. A player who wants to go deeper sees "more options" and gets the rest. |

**Attribute sensitivity for slot 2 and the pool:**

The player who moved points OUT of Body should not be offered Body-primary crafts as slot 2
or as the top of the pool. The filtering rule: slot 2 is drawn from crafts whose primary
attribute matches the player's highest invested attribute. The pool (slots 3–4) is ordered by
attribute match, highest first.

This is not a hard lock — a player can go off-recommendation in slot 3–4 by browsing further.
The lock applies only to slot 2 TYPE: the danger-response must be a craft that addresses danger
(a strike, a ward, a binding, a defense), not a perception or making craft. A Cogitant with
high mental gets their mental danger-response, not a Body one. A Cogitant with Body investment
gets a Body option surfaced first even though the tradition rarely goes there.

**The folk origin (Valleyfolk):**

Under this model, the folk starting kit (currently 13 anchors + 2 byLean) becomes:
- Slot 1: one folk-accessible perception/sense craft (e.g., `keen_appraisal`, `read_the_room`)
- Slot 2: one folk-accessible danger-response craft (e.g., `hunters_strike`), informed by attributes
- Slots 3–4: 2 chosen from the folk-accessible pool, attribute-ordered, pool of 4–5

This makes Valleyfolk feel like generalists — broader pool, no tradition depth — rather than
players who start with 13 crafts before making any choices.

### §2c — The available pool: curated, not the full tradition list

The current wall-of-45 (SNG-192 §2) is not fixed by reducing the grant count — a player
choosing 2 from 45 is still choosing 2 from 45. The pool must be curated:

- **Default shown:** 4–5 crafts, attribute-ordered, sense and danger-response excluded
- **"Show all":** the full tradition Tier I pool, clearly ordered, with attribute match marked
- **Grants shown first, before picks:** the SNG-192 §1 fix — show slot 1 and 2 as already-yours,
  non-selectable, before the choosable pool. A player cannot accidentally pick something they
  already have.

### §2d — Creation flow: a question, not a decision

Erik said: *"We need to revamp the entire character build process anyway, so let's make this
smooth and fun"* and *"I want to potentially reorder the creation flow."*

**The current flow (from SNG-192):** prologue → domains → abilities → companion → form → bio →
commit.

**The question for CCode:** what are the three creation paths, what do they differ in, and what
does the flow look like from a player's perspective in each one today — not from the code, but
as a player would experience it step by step?

Aevi is not proposing a new flow in this spec. The flow question is held until CCode describes
what exists, Erik reacts to it, and then Aevi specs what changes. Shipping a new flow before
understanding the three current paths would be the generate-before-verify failure mode.

### §2e — `class_archetypes.json` and the suggestion engine

SNG-192 §4 found `class_archetypes.json` (6 archetypes, `byReach` field per tradition) authored
and orphaned. SNG-192 §3 found three rich signals gathered at creation and unused at the ability
step: `state.prologue.tags` (revealed preference from path choices), `state.bio`, attribute lean.

Under the new grant structure, the archetype is a natural companion to slot 2 — *"you took the
warrior path twice in the prologue; here's your tradition's danger-response for that kind of
person, and here's why."* The reason is the feature (SNG-192 §3's language, and it's right).

**This is not specced for build in this pass.** The question for CCode: is `class_archetypes.json`
still orphaned, or has it been wired since SNG-192? If wired, describe the current integration
so Aevi can build on it rather than re-spec it.

---

## §3 — WHAT THIS SPEC IS NOT DECIDING YET

These are held pending CCode's answers and Erik's reaction to the flow description:

- The specific curated pool of 4–5 crafts per tradition (Aevi authors this as content once the
  grant structure is confirmed)
- Whether `folkAccessible` gets a reader or retires (separate §2e decision from the narrative
  spec — same held status)
- The creation flow reorder (held until CCode describes the three paths)
- The specific folk-origin sense and danger-response craft (Aevi authors after structure confirmed)
- Whether `class_archetypes.json` is retired, extended, or wired as-is

---

## §4 — ROUND 2 QUESTIONS FOR CCODE

These are the measurements Aevi needs before any content is authored or any structure is changed.

**On the baseline defense kit:**
1. Is `martial_paths.json`'s baseline kit (`brace`, `strike_basic`, `break_away`,
   `raise_alarm`) actually granted to characters today — wired and live — or authored and unread?
2. What does the zero-energy conserve layer cover concretely? For each of the four baseline
   actions (plain strike, guard/block, disengage, call for help) — does a drained character
   have a structural way to do it via conserve, or does one or more of them require the baseline
   grant to be available?
3. If any baseline action is NOT covered by conserve, flag it explicitly — that action stays
   somewhere, just not as a discrete grant.

**On the current creation paths:**
4. What are the three creation paths? Name them, describe what distinguishes them (do they
   differ in steps, in available options, in what they grant, in who they're designed for?),
   and walk through what a player experiences in each one step by step.
5. Has the wasted-pick bug (SNG-192 §1 — `applyNativeGrants` running at commit, after the
   ability pick step) been fixed? If yes, how does it work now? If no, it is still in scope.
6. Where exactly in the creation flow does the ability/stat allocation step happen, and what
   does "attribute lean" mean in the engine today — is it computed from a point-buy, a preset
   distribution, or something else?

**On the suggestion and archetype layers:**
7. Is `class_archetypes.json` still orphaned (zero readers), or has it been wired since
   SNG-192 was written? If wired, describe the integration.
8. Is `state.prologue.tags` still unused at the ability pick step, or has the suggestion
   engine been wired since SNG-192?

**On the grant structure itself:**
9. Under the proposed 4-slot model (sense + danger-response + 2 chosen), what does a
   Harmonic character start with today vs. what they'd start with under the new model? Run
   the same comparison for Marcher and Cogitant — the three most different starting profiles.
   Show the before/after so Erik can react to the actual delta.
10. The folk origin currently has 13 anchors + 2 byLean. Under the new model it would have
    4 slots from the folk-accessible pool. What is actually in the folk-accessible pool today
    (the 13 anchors by id), and which of them are sense-type vs. danger-response-type vs. other?
    Aevi needs this to author the curated folk pool.
11. **Anything that is already true at HEAD that this spec assumes is broken or missing.** The
    domain gate lesson applies.
