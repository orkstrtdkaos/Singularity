# SNG-230 — The Encounter Frame: ALL PHASES built (Phases 1–4)

**CCode · 2026-07-24 · v1.8.243 → v1.8.256 · every specced phase shipped · suite + wiring-audit + content CI green throughout · live-verified.** *complete_pending_review — the engine is done; §7b/§7c await Aevi content (additive, no-ops until authored).*

Erik: "Make encounters OBVIOUS. Once you hit one you FLEE it, DEFEAT it, or FAIL it." Delivered — legible, sized, chaining, and intelligent (finisher collapse/morph, ward-denial, kit-trivialization), while staying a **legibility layer over GM-narrated freeform play** (Erik's constraint held at every phase).

---

## ⚠ FIRST: spec corrections (verified vs. code — please fold into the spec)
1. **No `buildStagedDef`** — the real staged builder is `synthesizeChallengeDef` (random_encounters.js:219).
2. **No FINISH family, no WARD family** — families are HARM/RESTORE/PROTECT/KNOW/SHAPE/INFLUENCE/MOVE/SUSTAIN. HARM is the finisher; "ward" is a PROTECT verb.
3. Outcome vocab is the `endEncounter` xpMap (app.js), not line 2023; omitted `opponent_yielded/player_overcome/stalemate`.
4. Counts: narrative 52 / opposed 4 / challenge 4 / duel 2 (62).

## The phases

- **Phase 1 / 1b** — `engine/encounterFrame.js` `frameModel(def,state,entry)`: kind-themed descriptor (icon+title, WIN CONDITION, meter, the THREE EXITS). Rendered as a **legibility header**, **sized by tier** (Erik's OQ1): regional/epic or danger≥3 → a dominant TAKEOVER card (buttons inside); riffraff/notable → a compact BANNER. Every frame carries a **freeform cue** so it never reads as buttons-only.
- **Phase 2 §6a — chaining** — `frameTransition` (fight+flee→chase, chase+fail→fight) surfaced legibly; **behavior**: fleeing a fight builds a real GM-narrated CHASE (`chaseFromFight`, carrying `_chainedFrom`); win → escaped, caught → back into the original fight. The chase is an ordinary encounter, so the GM + freefield drive it.
- **Phase 3 §6b/§7a — collapse/morph** — a decisive finisher ENDS a collapsible foe in one beat (`collapseMode` family-driven; `collapseFloor` tier-scaled — riffraff drops on `success`, notable needs a crit, epic/regional never; `collapseResult` graded). Wired on the non-skill-battle path AND (Erik's call) the **skill-battle** meter via `swingDegree` (a decisive momentum swing ends it; the ordinary meter is untouched — §89). A **botched** finisher MORPHS: the receipt tells the GM to narrate it hardening ("FINISHER WHIFFED … it is NOT over"). §89-safe (narrative, no meter re-tune).
- **Phase 4 §7b/§7c — the frame READS the situation** — `wardAgainst`/`wardBroken`: a ward FORBIDS a mechanic outright (a Death-Ward makes the instant-end *inapplicable*, not merely resisted; broken only by a demolishing crit). `trivializes`: the right KIT voids a challenge's premise (a fly-craft → trivial bypass; a resistDC → an opposed roll). Both wired into the collapse/challenge paths + the receipt; **additive — no-ops until Aevi authors the content**.

## AEVI — the content contract (author in parallel; the engine reads it the moment it lands)
- **Wards** on a creature/encounter def: `wards: [{ denies: ["finish"|"escape"|"sway"|"instant_end"], breakDC: <margin>, name: "the Death-Ward" }]`.
- **Trivialize** on a challenge def: `premise: "a sheer climb"`, `trivializedBy: ["MOVE"]`, optional `resistDC: <n>` (set it to make a hard challenge force an opposed roll; omit for a simple one that a fly-craft walks around).
- **Per-kind framing copy** (`FRAME_KINDS` titles/verbs/meter labels) + **PUZZLE/STANDOFF exemplar encounters** against the `frameModel` shape.

## Deferred (not blockers — Erik's balance call)
- The **HEAVY morph**: a whiffed finisher mechanically SPAWNING a harder fight (soft→fight) / a skill-battle meter penalty. Kept out to respect §89; the narrative morph is the faithful safe version.
- **Narrative-promotion**: framing the 27 PERILOUS narrative encounters (`shouldFrame`/PERILOUS) — needs those rows to mint an activeEncounter.

## Verified
~40 SNG-230 smoke checks across the phases; every phase live-verified in-browser (frame descriptors, size routing, chaining defs, the collapse decision matrix, the skill-battle finisher matrix, the ward/trivialize decisions, and all receipt narrations). Suite + wiring-audit (testOnlyExports held at 7 — every export play-wired) + content CI green throughout; SYSTEM_SPEC engine modules 66→67; no mojibake.

*— CCode. From a raw, undecomposed spec to a shipped, phased, tested feature. The bounded thing is obvious, sized to its stakes, it chains, and it reads the situation — and through all of it the GM and the freefield stayed the real interaction.*
