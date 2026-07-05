# PO Alert — Singularity

**Status:** complete_pending_review — SNG-009 shipped v1.3.1 (results: po/results/20260705_SNG-009.md). SNG-004+008 queued next.

---

## Task SNG-009 — Op-loss on parse fallback + naming gaps (HOTFIX, do first)

**Root observation (Erik screenshot):** GM structured reply failed → "plain narration mode this turn" → ALL ops silently dropped (questUpdates, NPC name reveal, item naming) while narration advanced the fiction. State fell behind story. Three symptoms, one likely cause + two genuine gaps:

**Fix 1 — never silently drop ops (core).** On structured-parse failure: (a) ONE automatic retry — re-send with a terse "reply was invalid JSON, emit the same turn as valid JSON only" system nudge before falling back; (b) if fallback still triggers, salvage ops best-effort from the malformed text (regex-extract recognizable op arrays; apply only ones that clamp-validate); (c) surface it — the fallback notice should say ops were lost/salvaged; (d) log dropped-op turns to a small `state.opLossLog` so a later turn can re-emit (GM context gains one line: "PREVIOUS TURN OPS LOST — restate any quest/npc/place updates that occurred").

**Fix 2 — NPC identity reveal.** `npcUpdates` must support name reveal/refinement: op `{id, revealName}` — engine updates display name, keeps id stable, ledger notes the reveal ("the Tuning-warden is Maren"). Clamped: reveal only for NPCs currently in scene, once (subsequent renames need `aliasAdd` not replace). GM contract sentence: when the fiction reveals a known-but-unnamed person's name, emit revealName.

**Fix 3 — player naming of items.** Named items are player agency, not GM ops: inventory examine panel gains "Name it" (custom name stored as `customName`, original catalog name retained as subtitle; GM context shows "Waystaff (resonance-crystal translator staff)"). No GM involvement needed. Cap 40 chars, ledger-safe.

**Fix 4 — quest completion audit for Erik's live character (data repair).** Ship a one-time `repair` path or console-invokable function that re-evaluates quest objective state against chronicle/ledger; document in results how Erik clears The Apprentice Who Followed a Frequency (one click or one pasted line, per non-programmer default).

**Fix 5 — People You Know: collapse to location expandables (Erik live ask).** The relationship list grows unbounded and reads flat. Regroup by the location where each NPC is known/was met (NPC records already carry or can derive a home/met location; where unknown, group under "Elsewhere"). Render as collapsible location sections (location name + count; expand to the NPC rows with their relationship badges). Default: expand the current location's group, collapse the rest; remember expand state within a session. Purely presentational — no relationship-data change, no schema change beyond an optional `knownAt` location tag on NPC records (derive-and-backfill from ledger on load where missing). Smoke: grouping renders from a fixture with NPCs across 3 locations + one Elsewhere; current-location group defaults open.

**Guardrails:** ops remain typed+clamped (salvage never applies anything that wouldn't validate); design law 1 intact; additive schema (`customName`, `opLossLog`); smoke: retry-then-success path, salvage-partial path, revealName clamp, customName render + GM context line.

**Verify:** forced-malformed reply → retry recovers ops (smoke); forced double-failure → notice names op loss + log entry + next-turn GM restate line present (smoke); Maren-class reveal live-checkable; Erik renames staff in UI and GM's next narration uses "Waystaff"; Erik's stuck quest cleared (browser-leg); People-You-Know shows location groups, current location open by default.

**Ship spec updates:** §7 (revealName sentence + op-loss restate line), §8 gotcha (parse-fallback op behavior), §3 if module touched.

---

## Task SNG-010 — Practice & Emergence (QUEUED — next after SNG-009 hotfix; bumped AHEAD of SNG-004 by Erik)

**Direction + 3 load-bearing calls RATIFIED by Erik 2026-07-04.** Design philosophy: competency is the residue of attention over time — you declare what you're working toward and practice grows it; you don't get skills from a menu out of the blue. Emergence expresses in a RARITY GRADIENT (this is the governor — no hard cap): mostly tree-growth, often combos, rarely truly-novel.

**Ratified shape:**
- Use-ranking: a practiced rank unlocks at ZERO skill-point cost but still gates on levelReq (`rankLevelReq`). Points remain the shortcut; practice is the earned road.
- Governor: NOT a numeric cap. A weighted three-tier output — the engine strongly prefers (1) tree-growth and (2) combos; (3) truly-novel fires only under a much higher bar. Reuses existing structure: `discovery` already = variations/combos (keyed on component ids), `newAbility` already = wholly-new AND already engine-capped. Formalize the gradient; don't add a count cap.
- Aspiration discount: FREE when fully practiced (100%).

**Pre-authored content already at origin (PO):** `content/packs/core/rules/emergence_recipes.json` — 3 combo recipes incl. the seed **resonant_sight (prism_sight + sonic_resonance, ripenAt 6)** matching Erik's live play, plus 1 branch template. Engine mints from this file; the model NEVER freeforms a combo. Register it in core manifest on build.

### Phase A — Practice ledger + aspirations + use-ranking (foundation)
- New engine-owned substrate `character.practice = { uses:{abilityId:n}, coActivations:{pairKey:n}, aspirations:[{abilityId, since}] }`. Additive; migrate existing characters to empty ledger. `pairKey` = the existing `discoveryKey` pair form (sorted ids joined) — reuse `discoveryKey`, don't invent a second keyer.
- Increment: on each validated ability use, `uses[id]++`; when 2+ abilities resolve in one action, `coActivations[pairKey]++`. Wire at the single resolution site so nothing double-counts. Backfill is not required (starts accruing now) but DO seed from `character.discoveries` if a combo already exists (don't re-offer what's owned).
- **Aspirations:** player declares up to 2 target abilities (sheet UI). While aspired, relevant activity accrues aspiration-progress (using a component/prereq ability, or acting into the target's effectTags). At `aspirationRipe` threshold AND levelReq met → learning that ability costs 0 skill points. Never automagic: the Learn button still requires a click; the discount is the only change. No aspiration set → point-buy works exactly as today.
- **Use-ranking:** at `useRankThreshold[nextRank]` uses AND the rank's levelReq met → next rank unlocks for 0 points via existing `rankUpAbility` path (add a `viaPractice` flag; point-spend path unchanged).
- All thresholds are tunable numbers in a new `resolution.json` `practice` block (Aevi self-ratifies the numbers). Suggested starts: `useRankThreshold {2:8, 3:16}`, `aspirationRipe 10`, coActivation `ripenAt` per-recipe (already in recipe file).
- Smoke: ledger increments once per use; co-activation counts only on multi-ability actions; aspiration discount applies at threshold+levelReq and NOT before; use-rank unlock respects levelReq; migration yields empty ledger.

### Phase B — Emergence engine (the three tiers, reading the ledger)
- **Combos (Tier 2, common):** when `coActivations[pairKey]` ≥ the recipe's `ripenAt` AND both components owned at required ranks AND not already discovered → mark the pair RIPE. GM context gains a one-line RIPE notice; GM gets a clamped op `emergenceOffer` (op `combo`, carrying the recipe id) to OFFER the technique in-fiction. Player accepts (+names, honoring existing rename affordance) → mint via existing `recordDiscovery` using the recipe's fields. Engine validates the recipe id is real and ripe; GM cannot invent a combo not in the recipe file or not yet ripe.
- **Tree-growth (Tier 1, most common):** when `uses[id]` crosses a branch template's `ripenAt` AND `requiresRank` met → offer the branch (op `branch`) — a specialization that attaches to the owned ability (new sub-entry with its own grants/cannot). Cheapest, most frequent emergence. Additive to the ability record; does not consume a skill slot.
- **Novel (Tier 3, rare):** keep the existing `newAbility` path (crit-success on novel action, already capped). Practice does NOT directly mint novel — it can RAISE ELIGIBILITY (sustained novel-context practice lowers the crit bar slightly / flags the action novel-eligible), but novel stays the rare road. No recipe = no premium combo; ungated pairs still route to the generic discovery path on crit as today.
- GM contract additions (LOAD-BEARING — draft wording to results for Erik ratification before ship): the `emergenceOffer` op (combo|branch), the RIPE-notice reading rule, and the hard rule that the model offers only engine-flagged-ripe emergence and never mints state itself. Design law 1 intact: engine owns the ledger, thresholds, and minting; model owns the offer's words only.
- Smoke: ripe fires at threshold not before; emergenceOffer with a non-ripe or unknown recipe id is rejected; accepting mints exactly one discovery; branch attaches without a skill-point charge; novel path unchanged and still capped.

### Phase C — Item evolution + gear-bond (Waystaff + Aevi; biggest lift, ship last)
- New optional substrate on items: `evolution` — an item can carry `bondSource` (a companion id) and `stages[]` (like companion evolution). When the linked companion's bond deepens AND the item is used-with-companion enough (a co-activation of item+companion, tracked in the same ledger under a namespaced pairKey), the item evolves a stage: name/description/effect shift, authored in the item file.
- Seed content (PO authors on Phase C pickup, not now): the **Waystaff** gains an `evolution` linked to the **aevi** companion — as Aevi's bond climbs and she's integrated into casts, the staff wakes by stages (a translator staff that begins to anticipate, then to answer). Gear-bond recipe honors the same authored-template discipline as combos.
- This axis needs item records to support evolution + a ledger namespace for item×companion co-activation; spec it additively, migrate existing items untouched.
- Smoke: item evolution gated on both bond tier AND co-activation; non-bonded items unaffected; migration inert.

### Batch guardrails
Design law 1 absolute (engine owns ledger/thresholds/minting; model offers words only); emergence mints ONLY from authored recipe/branch/item templates — no freeform; graceful degradation (parse fail during an offer → offer re-presents next turn from the still-ripe ledger, nothing lost); additive schemas only; content-not-code; resolution/encounter math untouched except the named `practice` block; this repo never touches the ErikIAm pipeline; suites + parse_probe green at every phase boundary.

### Verify (Erik browser-leg)
1. Set an aspiration; use adjacent abilities; watch progress accrue on the sheet; at ripe, learn it for 0 points. 2. Use one ability repeatedly; rank it up by use at 0 points once levelReq met. 3. Braid Prism Sight + Sonic Resonance ~6 times → GM offers Resonant Sight → accept + name → it appears as a discovery. 4. Cross a branch threshold → specialization offered and attaches. 5. (Phase C) Deepen Aevi's bond + cast with the Waystaff → staff evolves a stage.

### Ship spec updates
§3 (practice ledger + emergence engine rows), §4/§6 (practice numbers, rarity gradient, aspiration/use-ranking rules), §7 (ratified emergenceOffer rule text), §9 (mark shipped; Phase C noted if deferred).

---

## Task SNG-004 — Origins & backgrounds as content (+ SNG-008 weave) (QUEUED — next build)

**Goal (one session):** origins/backgrounds move from app.js to content packs with mechanical hooks; new origins land including unusual-embodiment; first SNG-008 content (rune shrine, Council of Mavens NPCs) rides the wave.
**In:** `content/packs/*/origins/*.json` + `backgrounds/*.json` (spectrum tilt, power-system access incl. crossTradition exceptions, background skill grants, creation copy); loader + creation UI from content; migrate 3 existing origins byte-equivalent in effect; new origins: mountain-pass folk, Disputed Zone survivor, Archive-born, **unusual embodiment** (ENT precedent — its own hooks, GM guidance line in rule set); backgrounds +6; **SNG-008 seed:** one rune-caster NPC + shrine location (casting = daily omen: small spectrum-axis nudge; rune table data-driven, seeded from Heimrún canon — Aevi supplies `runes.json` before build), Council of Mavens as 3 petitionable NPCs (domain + bias each). Smoke: content-loaded origins match legacy behavior, new origins gate correctly, omen nudge clamped.
**Out:** external Heimrún app linkage (later); framework lore layer beyond what the shrine/mavens carry implicitly; any resolution/contract change (Erik ratifies).
**Verify:** legacy character loads unchanged; new origin creates and plays; omen applies once per day and clamps; mavens give conflicting counsel on one seeded question.
**Ship spec updates:** §3 (loader), §4 (origin hooks), §6 (omen), §9.

---

*Task ledger between Aevi (PO) and Claude Code build sessions. Template/flow: `SYSTEM_SPEC.md` §10. Results → `po/results/`. Only Aevi closes. Queue: `po/BACKLOG.md`.*
