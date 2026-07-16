# PIPELINE ALERT — Singularity## ✅ SNG-115 + SNG-116 — CLOSED GREEN (Aevi HEAD audit, v1.8.76)

> **CCode status 2026-07-16:** both fixed. **SNG-115** — ghGet/ghPut get an AbortController 12s deadline (all sync callers) + the actual hang (feedback entry had no top-level `at` → threw before the try) fixed + fb-send always lands on a terminal status. **SNG-116** — new `substratePenaltyFor` single-source; both preview sites pass it so preview == resolve. 6 smoke tests. Writeup: `po/results/20260716_SNG-115_116_live_bugs.md`. (Original spec text retained below.)

**Aevi close (HEAD-verified):** SNG-115 — `AbortController` + deadline present in sync.js across all sync callers; **CCode found the real hang deeper than the spec** (the feedback entry had no top-level `at`, so it threw *before* the try block — a better root-cause than the spec's timeout-only theory); fb-send lands terminal. SNG-116 — `substratePenaltyFor` single-source exists and **both** `successChance` sites (L2800, L5291) pass `substratePenalty`, so preview == resolve by construction (anti-drift guarantee holds). **Both closed green.**


- **SNG-115 — Feedback submit hangs on "Sending…".** `po/SPEC_SNG-115_feedback_submit_timeout.md`. The Send button `await`s a GitHub write with **no timeout anywhere** in the `ghGet`/`ghPut`/`pushMergedFile` chain (no AbortController, no deadline). A stalled request never throws, so the `await` never returns and the UI sits on "Sending…" forever; the entry may not even queue because the catch never runs. Fix: AbortController deadline → throw → the existing "never lose it" queue path; UI button always lands on a terminal status. **Recommend fixing at the `ghGet`/`ghPut` layer** — character save + event ledger likely share the same latent hang.
- **SNG-116 — "How hard is this" preview omits the substrate penalty.** `po/SPEC_SNG-116_difficulty_preview_substrate.md`. **Erik: readout said easy, but lack of substrate made it hard — and he was right.** The preview `successChance` at app.js L5117 is called **without `substratePenalty`** (defaults to 0), so the readout assumes a full lattice; the real resolution applies the SNG-090 penalty, so the true chance is much worse than previewed. **Not a text bug — the readout is honest about a wrong number** (a missing term). Fix: preview computes the same substrate penalty as the resolve path, via ONE shared derivation fn so they can't drift; test asserts preview chance == resolve chance. Tie-in: this is NOT fog (tier perception is fine) — the true chance itself was incomplete; fog over a wrong number is still wrong.

---

## ✅ CHARACTER CHRONICLE ARC + 3 BUGS — CLOSED GREEN (Aevi HEAD audit, v1.8.68→73)

CCode shipped all six; **Aevi verified each at authenticated origin, not on report.** Two came in *cleaner than the specs named them* — noted as improvements.
- **SNG-105** (recovery scales, v1.8.68): landed as `recoveryEnergy(kind,character,rules) = Math.max(base, round(frac×maxEnergy))` — scales with the pool, floors at the flat base **by construction** (never worse than today), `recoveryFractions` as a clean separate config key, and the GM RECOVERY GUIDE calls it so it shows the per-character number (SNG-103 principle). Cleaner than the inline-`fraction` sketch. **Closed.**
- **SNG-111** (progressive naming, v1.8.69): `nameExtend` + contains-current-name heuristic ("Pell"→"Pell Marsh"), old name kept as alias. **Closed.**
- **SNG-112** (quest gating, v1.8.70): offers gated on proximity/thread not bare region + parallel-arc suppression. **Engine-ready but `arcId` parallel-quest mechanism is INERT until Aevi authors arcIds on shared-arc quests — Aevi content, owed.** Gate itself closed.
- **SNG-108** (relationship arcs, v1.8.71): `bondType`/`bondStage` + romantic growth path. **Minor-safety VERIFIED absolute** — `advanceBond` first check is `bondType==="romantic" && isMinorSubject(n)` → refuse+log+return before any change; stage logic score-floor-gated and cannot leap stages (`Math.min(wantIdx, curIdx+1)`). **Closed.**
- **SNG-109** (Chronicle page, v1.8.72): split into `majorDeeds`/`majorStateHash`/`chronicleIsStale`/`buildChroniclePrompt` — cache invalidates on a major-state hash (cleaner than the vaguer spec). **One eyes-on owed:** full DOM click-through was blocked by the dev harness lacking an API key; CCode verified the engine chain via in-browser module import. Worth a play-with-key pass. Engine **closed**; UI click-through pending a keyed play session.
- **SNG-110** (earned portrait, v1.8.73): provenance gear (`itemProvenancePhrase`), opt-in companion (`opts.withCompanion`), one-off override (`opts.appearanceOverride`), image delete. **Floors ordering VERIFIED** — L217 `assemble → sanitizeImagePrompt → URL`, "THE FLOORS run AFTER every addition"; player appearance/companion cannot smuggle past minor-protection or the rating ceiling. **Closed.**

Writeup: `po/results/20260715_chronicle_arc_and_bugs.md`. **Aevi owes:** SNG-112 arcId authoring on shared-arc quests; SNG-109 keyed browser click-through next play.

---

## 🌱 SNG-101b — Native-grants-at-creation — ✅ SHIPPED, complete_pending_review (CCode 2026-07-15, v1.8.74)

> **CCode status 2026-07-15:** built after ROUND-2 (all 3 Qs answered). `nativeGrantIdsFor`/`applyNativeGrants`/`retroNativeGrants` in progression.js; content in manifest-registered `native_grants.json` merged into the rules bag; retro runs in the load path so it **survives the sync-clobber** that ate Silas's hand-correction. Keyed off `domains.primary` (SNG-094). 10 smoke tests + content_ci validates all 191 ability refs. **Verified end-to-end against Silas's real save** → grants his 3 missing ashwarden basics (wither/the_grey_hand/the_grey_road), keeps deathsense r3 + palework r2. Erik: Silas is native **ashwarden** (wright is his lived backstory, correctly not the grant source). Writeup: `po/results/20260715_SNG-101b_native_grants.md`. Awaiting Aevi close.


`po/SPEC_SNG-101b_native_grants_at_creation.md` + content `po/SNG-101b_native_grants.json`. **Completes SNG-101's deferred native-grant piece** — held until natives were tagged (done this session, 247/247), now unblocked. **LLW finding:** the reader functions CCode earlier reported "built" are ABSENT at HEAD (`nativeGrantsFor` not in progression.js) — origin wins; this spec builds them for real. **Data-driven grant model:** primary tradition's L1 anchors always + Tier-II basics matching build lean (mental/physical/practical/social, fallback mental), capped at grantCap=5 — the caster/martial/artificer split falls out of `ability.attribute` tags, no per-tradition hand-authoring. Content table authored for all 27 traditions. Wiring: `nativeGrantsFor`/`applyNativeGrants` (creation) + `retroNativeGrants` (one-time, versioned, modeled on `retroLevelGrants`, **Law-14-safe — only adds rank 1, never lowers earned ranks**). **Live proof of the gap: Silas** (L7 primary ashwarden, had 2 of 7 basics — hand-corrected this session, save commit ede3b056). Independent of SNG-098.

---

## ⚡ SNG-113 — Aptitudes expansion — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.80)

> **CCode 2026-07-16:** mechanism + roster live. Decay→rules (0.975, bites) + hysteresis (keepMargin 4) + fading; inverse aptitudes (innocence, worldliness-ceiling, one-way); background grantsAptitudes (all 40 backgrounds, seeded at creation, lineage-marked); romantic/flirt→amorous tendency; Aevi 26-roster merged (curved thresholds + tiered depth); the 20 TIER-B consumers all built in resolve.js as situational named lines; content_ci asserts every mod key has a consumer. 14 smoke tests + browser-runtime verified. Tuning (decay/thresholds/grant-map) is Erik-playtestable. Writeup: `po/results/20260716_SNG-113_aptitudes.md`. (Original split note below.)


`po/SPEC_SNG-113_aptitudes_expansion.md` (v3, ROUND-2-ready). **Erik promoted.** Split two ways:
- **CCode ROUND 2 — the MECHANISM:** background `grantsAptitudes`; move `DECAY` to rules + raise (~0.975) + hysteresis (earn at threshold / keep until threshold−margin — **requires `deriveAptitudes` to track held state; it's stateless today, stated as a requirement not a question**); inverse-threshold engine for innocence (held while composite worldliness < ceiling); route orphaned `romantic`/`flirt` tags → new `amorous` tendency; "fading" surfacing. Three genuine confirm-at-HEAD questions remain.
- **Aevi authoring — the ROSTER (in parallel):** the ~18–24 aptitude definitions themselves (earned + amorous + inverse), each a balanced bonus-AND-cost, + the new-tendency intent-tag additions. Aevi content, like the axis-touch combos. **Starting now.**
- **Dependency declared:** `devoted_lover` reads the SNG-108 partner bond → ship after 108 or ship inert. Rest builds independently.

## 🎒 SNG-114 — Inventory unify + intentful "Use in scene" — ✅ SHIPPED, complete_pending_review (CCode 2026-07-16, v1.8.78)

> **CCode 2026-07-16:** one shared `itemCard` + `bindItemCardHandlers` (both surfaces; drift impossible); "Use in scene" opens an intent step (`itemUses`: authored `uses[]` or kind-defaults + a free "how?" field; canned prompt only as fallback). 4 smoke tests. Writeup: `po/results/20260716_SNG-114_inventory_unify.md`. (Original spec below.)

`po/SPEC_SNG-114_inventory_unify_use_intent.md`. **Two findings, one ticket.** (1) "Use in scene" on a non-consumable literally submits `onFreeform("I use my X here")` — a canned, intent-less text action the GM must guess at; storied items (Pell's whetstone) deserve better. Fix: item `uses:[{label,prompt}]` + a "how?" field, generic prompt as fallback. (2) **Redundancy confirmed in code:** two separate item-card renderers — popup (`data-invuse`, shows effects) and play sidebar (`data-use`, shows image) — same 3 actions, different attrs/handlers/features, and **already drifted** (invuse vs use behave differently). Consolidate to one `itemCard` superset component; parity test so "Use in scene" does ONE thing regardless of surface.

---

## 📚 THE CHARACTER CHRONICLE ARC + 3 bugs (Aevi authored 2026-07-14) — ✅ ALL SIX SHIPPED, complete_pending_review (CCode 2026-07-15, v1.8.73)

> **CCode status 2026-07-15:** all six built top-down after ROUND-2 (105 v1.8.68 · 111 v1.8.69 · 112 v1.8.70 · 108 v1.8.71 · 109 v1.8.72 · 110 v1.8.73). ~52 new smoke tests, `npm test` green, fresh-port + browser-runtime verified. Writeup: `po/results/20260715_chronicle_arc_and_bugs.md`. Awaiting Aevi close.

Erik play-session findings — the through-line is the session thesis: **the game computes the accreted self (deeds, bonds, standing, grown items) but shows the player almost none of it.** These surface and weave it.

**Bugs (found live):**
- **SNG-111 — Progressive NPC naming.** `po/SPEC_SNG-111_progressive_npc_naming.md`. Learning a surname must EXTEND the name ("Pell" → "Pell Marsh"), not alias-shunt it. At HEAD `revealName` only replaces-or-aliases; no append path. Pell's "Marsh" never composed.
- **SNG-112 — Quest offers gated by proximity/thread, not region.** `po/SPEC_SNG-112_quest_offer_gating.md`. `availableStructuredQuests` offers on bare `region===region` — too coarse; Cellaceron's Fendt quest surfaced to Silas off-thread and far from its location. Gate on location-proximity OR giver-present OR thread-touched. **+ parallel player-specific quests on a shared arc** (Silas's own Fendt quest, not Cellaceron's canonical one).
- **SNG-105 — Recovery scales with pool.** `po/SPEC_SNG-105_recovery_scales.md`. Erik ruled recovery should scale: maxEnergy grows +5/level, recovery was flat → grind. Fraction-of-max with flat floor (low levels unchanged).

**The Chronicle set (surfaces + weaves existing data):**
- **SNG-108 — Relationship arcs.** `po/SPEC_SNG-108_relationship_arcs.md`. Bonds already tracked (score+band, fed to GM) but never SHOWN, and flat. Surface them + add `bondType`/`bondStage`: **Pell is a `romantic`/committed partner, not a "devoted" tag** — a distinct KIND with a growth path (courting→together→committed→partner), score-floor-gated, minor-safe, partner→party-adjacent. *"She's Silas' woman"* — the model should say so.
- **SNG-109 — The Chronicle page.** `po/SPEC_SNG-109_chronicle_page.md`. The background page: cached story-so-far paragraph, major deeds, relationships (SNG-108 bonds), standing, arc. Assembles existing data; reads the attended self back to the player.
- **SNG-110 — Portrait as earned record.** `po/SPEC_SNG-110_portrait_earned_record.md`. Player-authored appearance (primary) + game-context provenance (the **forged spear shown as *yours***, not a bare name), companion/partner in-frame opt-in, per-generation override, and **image DELETE** (Erik's ask; only add exists today). FLOORS run after all additions (minor ≤PG, AUP).

**Design forks still Erik's to call (flagged in specs, not pre-decided):** SNG-107 reputation-with-teeth (what should revered actually COST — a rival faction souring, challengers drawn — reputation that only helps isn't a system) is NOT yet specced, pending Erik's design conversation. SNG-108's romantic stages and SNG-110's companion-in-frame are built but Erik tunes the specifics.

Sequencing note: 108 (bonds) feeds 109 (chronicle) and 110 (portrait companion). 111/112/105 are independent bugs, buildable anytime. All await CCode ROUND 2.

---

## ✅ THREE TRANSPARENCY BUILDS — CLOSED GREEN (Aevi HEAD audit, v1.8.67)

CCode shipped all three; **Aevi verified at authenticated origin, not on report.** All syntax-clean.
- **SNG-103** (GM effective energy cost, v1.8.65): `abilitiesForGM` now shows effective cost with base when discounted (`3 energy — base 6, discounted by level+rank`); raw `${ab.energyCost}` primary is gone; `CONTENT.rules` threaded at all 3 call sites. No sibling raw-cost builder. **Closed.**
- **SNG-104** (vitals x/y, v1.8.66): `vital-num` + `data-vital` render `current / max` always-visible; `showPopoverText` added (the staged diff assumed showHelp took raw text — it takes a help-id; CCode's fix is correct). **Closed.**
- **SNG-106** (roll breakdown, v1.8.67): **the load-bearing honesty claim VERIFIED at HEAD** — `add()` is the SOLE accumulation site; the only assignments to `chance` are `= 0` init and the increment inside `add()`; no mid-body mutation; clamp applied to a separate returned value. So `sum(components) === chance` (pre-clamp) is true **by construction** — the popup cannot drift from the real math. Opposed term named ("the raider (threat 35) −N"). Behavior-preserving (existing math tests pass); gambit steps inherited it. **Closed.**

## ✅ ROMANCE — CLOSED GREEN (Erik browser leg, 2026-07-14)
Erik verified in play: GM stayed in the scene, carried heat, no fade/hedge/safety-meta. SNG-100 tag-cap fix confirmed live (tag fired → doc loaded → engagement held). The R-vs-R+ observation was NOT a defect — the active profile was correctly on preset R (mature, no explicit anatomy); R held the line precisely, which is itself proof the register rewrite reads the ceiling correctly. Flipping the profile to R+ (adultVerified already true) unlocks the explicit register; Erik confirmed R+ works. **Romance leg + SNG-100 closed.**

---

## ✅ DOMAIN GROWTH ARC — SHIPPED & CLOSE-VERIFIED (Aevi HEAD audit, v1.8.63)

CCode built all three top-down; **Aevi confirmed at authenticated origin** (not report): `standingWithPeople` · `meetsStandingBar` · `promotionEligible` · `promote` · `acquirable` · `acquireDomain` all present at HEAD. SNG-100b (standing bar, wires the long-fiction accessGates capstone) → SNG-101 (promotion, additive model, foreclosure gates learn + both rank paths, braids exempt, Law-14 throw) → SNG-102 (acquisition, Tier-I entry, closed-opposite never loosened). CCode also fixed a Phase-1 CI bug the classification pass exposed (CI wrongly required `combinationAxis` on the 6 cross-pole braids, which correctly have none — the braid-exemption foundation). Decisions CCode was delegated: standing source = `peopleDisposition`; thresholds in `resolution.json`; region gate loose (no people→region map — flagged); acquisition teacher-bounded. Writeup: `po/results/20260714_domain_growth_arc.md`. **Green.**

---

## 🐛 SNG-103 — GM effective energy cost (specced, awaiting CCode)
`po/SPEC_SNG-103_gm_effective_energy_cost.md`. `abilitiesForGM` prints base `ab.energyCost`, not effective — GM false-flags correct discounted costs (found live: Silas/Palework 6-vs-3). Fix: thread `CONTENT.rules`, interpolate `effectiveEnergyCost`. Guard: never "repair" base down — that's the real corruption. Awaiting ROUND 2.

## 🖥 SNG-104 — Vitals x/y readout + tap/hover detail (specced + STAGED DIFF, awaiting CCode)
`po/SPEC_SNG-104_vitals_readout.md` + `..._STAGED_DIFF.md` (byte-precise drop-in). The Health/Energy bars show **no number** — that's why Erik couldn't tell if energy was depleting faster or he had less. Adds always-visible `current / max` (zero-tap phone answer) + a tap/hover popover reusing the info-dot delegation (phone parity built in). Verified anchors at HEAD.

## ⚔️ SNG-098 — Skill Battles — ✅ COMPLETE (A+B+C), complete_pending_review (CCode 2026-07-16, v1.8.79)

> **CCode status 2026-07-16 — all three phases shipped.** ROUND-2 (GO, `po/SPEC_SNG-098_CCODE_REVIEW.md`) → **A** engine core (`engine/skill_battle.js` matchup + opponent synthesis/policy + two-sided `battleRound`; `sense.js senseOpponent` fog gate; structured `skill_battle_system.json engine{}`; `resolve.js contestMods`) → **B** encounters routing (`startEncounter({oppSheet})` spawn, `skillBattleRound` → classic lifecycle, authored `opponent.skills[]`) → **C** the duel UI (`renderSkillBattle`: declaration picker + intensity dial + momentum meter + **fog-gated opponent panel** with the SNG-106 popover for tier-3, "read them" buys a tier, resume-on-reload; a duel is a skill battle by default, `def.skillBattle:false` = classic). 32-check `skill_battle_sim.mjs` (incl. the fog-is-presentation-over-true-state invariant); panel data path browser-verified end-to-end. **Live-play part for Erik:** the GM-narrated opening/aftermath (needs a key) + combat feel/tuning. **PvP is the flagged follow-on** (engine already symmetric). Writeups: `po/results/20260715_SNG-098_phaseA_engine.md`, `20260716_SNG-098_phaseC_duel_ui.md`.

`po/SPEC_SNG-098_skill_battles.md`. **Erik promoted to build.** Routed to **CCode ROUND 2 substrate review first** — not blind build. Reason (PO judgment, stated plainly): this is the single most architectural spec of the session — a combat-MODEL change, a new `skill_battle.js` module, and touches `encounters.js`/`sense.js`/`app.js`/tests. This session's repeated lesson was that Aevi specs lean on substrate assumptions that don't hold until CCode verifies at HEAD (§7b duplicated an existing file; the SNG-101 standing bar wasn't wired; §2 was a breaking type change — all caught in ROUND 2). Skipping review on the *biggest* spec would be exactly the wrong call. The spec also carries three real open questions Aevi could not resolve alone:
  1. Can a duel `def.opponent` (threat/tacticTags) synthesize a fair skill sheet, or must the encounter generator author one at spawn?
  2. Does `senseTier` compose cleanly when the sensed "action" is the OPPONENT's declaration rather than the player's own?
  3. Momentum meter — net-new encounter state, or does an existing field generalize?

**CCode: ROUND 2 review → answer the three → then GO for build.** If Erik wants to skip review and build straight off, say so; ROUND 2 is the safer next step for a change this size and is the default.

**The core to preserve through review:** two rolling+deciding agents; opponent decision is deterministic engine `opponentPolicy` (not GM invention); **fog-of-war via `senseTier` is presentation over TRUE state, never false** (tier 0 blind → tier 3 sees their full breakdown); reveal skills buy a tier; PvP falls out symmetric. Depends on SNG-106 (retained roll components).

---

## 🎲 SNG-106
