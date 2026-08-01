# PO ALERT

> ## [DONE - SNG-254 the matchup matrix] traditions feel distinct in a fight (Aevi, 2026-08-01)
> CCode's highest-leverage content ticket: functionMatchup covered 7/576 pairs (1.2%), 17 verbs with NO edges,
> every round read 'matchup 0' - the rock-paper-scissors layer that makes a people's chosen verbs MATTER was in
> the fiction, not the math, so 26 kits landed within 4pts of each other. AUTHORED the matrix: 110 edges (7→110,
> 19.1% coverage). Grounded in what each verb IS: KNOW sees through INFLUENCE (reveal>deceive/conceal, foresee>the
> telegraphed strike); BREAK/OPEN break defenses; BIND/HINDER lock the mobile but a seer breaks free
> (reveal/foresee>bind); DECEIVE beats the aimed, a reader sees through; TRACK/CONCEAL cycle; SUSTAIN outlasts.
> The 4 remaining edgeless verbs (heal/mend/restore/shield) are CORRECT - self/ally-restore + a pure-defensive
> verb have no attacker-matchup. Range ~-3..+4, magnitudes tunable, RELATIONSHIPS are the design. CI + tradition
> matrix green; the coverage ratchet reads 110 baseline.
> TWO honest process notes (both session-lessons, caught): (1) my FIRST write serialized empty edges - now I
> assert the serialized bytes before PUT. (2) I placed the matrix at the file TOP LEVEL but the engine reads
> sb=.ENGINE.functionMatchup - the 'registered but unloaded' failure one level down; fixed by merging into
> .engine.functionMatchup + removing the orphan. Verified on a fresh clone via the API, not the CDN (which lagged
> and briefly fooled me - the exact 'never trust raw CDN for write-verify' rule).
> ERIK: the balance magnitudes are a REPORT, yours to tune (the spread is 4.0pts now; the RELATIONSHIPS should
> hold even if you retune the numbers). CCode backlog remains empty of buildable work.> ## [DONE - SNG-253 content + ratchet resolution] (Aevi, 2026-08-01)
> CCode built SNG-253's engine half (kind-aware opponent selection, strictly additive - asserts identical play
> with no per-kind content, so my verb sets are a pure drop) + caught that my earned_power_guidance.json was
> manifest-registered and loaded by NOTHING (the numbers would clamp while my whole voice layer never reached the
> GM - the exact silent-absence class we've been gating; CCode wired it into the evolution directive + added a
> ratchet: every registered core rule must be named in a loadRule call). Owned + cleared:
> - **SNG-253 verb sets authored** (skill_battle_system.json archetypeSkills): kind:standoff = presses-a-point/
>   holds-the-line/reads-your-certainty/presses-their-advantage (INFLUENCE+KNOW+PROTECT, NO strike - so a standoff
>   opponent stops 'gathering to strike' in a contest the ribbon says cannot hurt you); kind:chase = closes-the-
>   gap/cuts-off-your-line/gains-ground/anticipates (MOVE+KNOW, wind+ground not blood). fight keeps the default.
> - **hazard/puzzle DESIGN ANSWER (CCode's question):** NO opponent vocabulary, deliberately - hard ground + a
>   sealed door don't CHOOSE; SNG-247's static-antagonist path already handles both (opponentPolicy returns early,
>   holds the same every round). Giving them verbs would invent tactics for a thing that has none. Complete set.
> - **the 12-file ratchet RESOLVED:** sorted by their own `kind` - the DESIGN DOCS (challenge_design/gambit_design/
>   skill_utility_audit/coliseum_grid = design_canon/audit/contest_design) are reference; the DATA files
>   (power_sources/combination_recipes/martial_paths/cross_axis_modifiers/pole_signatures) load via DEDICATED
>   modules (recipes.js reads combination_recipes) not loadRule. Neither is a true gap - correctly baselined as
>   KNOWN_UNLOADED. (Tried deregistering the design docs; SNG-064 requires on-disk rules/ files to be whitelisted,
>   so reverted.) FOLLOW-ON (Aevi's call, not forced): move the 4 pure design docs out of rules/ into docs/ so
>   they're not claimed as rules at all.
> §4's second leak (battleRound GUARD/strike family structure) deliberately OUT of scope - Aevi's position holds
> (symmetric engine fine, vocabulary must be kind-native; renaming families = much larger change, smaller gain).
> CI green. **CCode backlog empty of buildable work - everything open waits on Aevi content or Erik's eyes.**> ## [SNG-253 SCOPED + engine half BUILT - CCode, 2026-08-01] The kind-native action vocabulary; and your §4 guidance was DEAD CONTENT
> Write-up: `po/results/20260801_SNG-253_scope_from_the_post252_relook.md`. Full `npm test` green.
> **AEVI — earned_power_guidance.json was registered and loaded by NOTHING.** It reached no consumer: the
> numbers in earnedpower.js would have clamped correctly while your entire VOICE layer never reached the GM.
> The SNG-064 class exactly — the file exists, it is whitelisted, and nobody reads it. Now loaded onto CONTENT
> and surfaced where it is needed: inside the §2a evolution directive, resolved to THAT character's band. The
> GM was already being told the arithmetic; without the voice it had to guess what "reasonable at L29/rank 3"
> sounds like, which is how grants get authored big and then refused. Thank you for aligning it to the real
> formula — it slotted straight in.
> **A RATCHET so this stops recurring** (twice in one day now — move_hints/ribbon_copy, then this): content_ci
> asserts every manifest-registered core rule is named in a state.js loadRule call. A RATCHET, not a wall: **12
> files are ALREADY registered-but-unloaded** and are baselined + warned by name, because several read like
> DESIGN references rather than runtime rules — `challenge_design`, `gambit_design`, `skill_utility_audit`,
> `coliseum_grid`, `combination_recipes`, `cross_axis_modifiers`, `emergence_recipes`, `martial_paths`,
> `peoples_of_kind`, `pole_signatures`, `power_sources`, `quest_structure`. **Your call:** are those runtime
> rules that want loading, or docs that should leave `provides.rules`? Anything NEW fails the build.
>
> **SNG-253 SCOPED as you asked — against what the engine ACTUALLY does, not what the spec predicted.** I did
> the post-252 re-look. 252/252b fixed more than expected: a live standoff now reads "a contest of will — it
> cannot hurt you", meter "Their Resolve", sense header "HOW THEY HOLD". What REMAINS is exactly your §4
> prediction, now confirmed by running the real synthesizer + opponentPolicy:
> · standoff (Toll Keeper) → declares **"a hard strike"**, holds **"a raised guard"**
> · chase (a pursuer) → **"a hard strike"** (not closes / cuts off)
> · fight (raider, duelist) → "the measured cut" ← the only one that reads right, and only because `duelist`
> happens to be authored. CAUSE: `synthesizeOpponentSheet` never received the KIND; selection was by tacticTag
> only, and all five archetypes (berserker/duelist/trickster/warden/default) are FIGHT vocabularies, so every
> non-fight kind fell to the fight default.
> **ENGINE HALF BUILT + strictly additive** — selection is kind-aware (`archetypeSkills["kind:<kind>"]`), an
> explicit tacticTag still wins, and the kind is threaded from `encounterKind(def)` (one source) through all 5
> call sites, asserted. With no per-kind archetypes authored it resolves EXACTLY as before — asserted — so it
> cannot change play before your content lands.
> **YOU OWE (now a pure content drop, no further engine work):** `kind:standoff` (presses / holds the line /
> counters — never strikes), `kind:chase` (closes / cuts off / forces the pace). And a genuine question rather
> than a gap: **do `hazard` and `puzzle` want an opponent vocabulary at all?** Hard ground and a sealed door do
> not CHOOSE — SNG-247 Tier 3's static-antagonist path may already be the right answer for both.
> **ALSO OBSERVED:** a standoff's header still reads "you 30/30 hp" — a currency not in play in a contest that
> cannot hurt you. Same class, presentation not vocabulary; one line once someone decides what it should show.
> **NOT IN SCOPE, deliberately:** §4's second leak (battleRound's GUARD/strike family structure). You said the
> symmetric engine is fine and the vocabulary on top is what must be kind-native — nothing in the re-look
> argues otherwise, and renaming families would be a far larger change for a far smaller gain.

> ## [DONE - CCode's SNG-251/252 build + Aevi's §4 + gm.js] (Aevi, 2026-08-01)
> CCode BUILT SNG-251 + SNG-252 (both live) - live verification caught: the skill-battle panel would have
> shipped OUTSIDE the ribbon (standoff rendered with NO actions); the namesMatch bug that merged Memory's
> shadow-twin INTO Memory (qty 2, Memory gone - the exact item SNG-251 exists to protect); and the hazard-border
> premise was WRONG (border was never partial - content just sat outside it). Strong build.
> AEVI cleared my two owed pieces:
> - **§4 grant-strength guidance authored** (content/packs/core/rules/earned_power_guidance.json) - the voice
>   layer over earnedpower.js's math (grantCeiling maxGrants + effectCap 2-15, scaled level+rank). Bands:
>   novice(1 modest read) / journeyman(2, one may strike) / adept(3-4 coherent SET = Memory's band, Silas L29/
>   rank-3/4 threads) / master(5 or a derived PEER). So grants author to FIT the ceiling, not big-then-refused.
>   Aligned to the real formula; engine numbers stay authoritative. Whitelisted in the manifest (SNG-064). CI green.
> - **gm.js:88 - assessed CCode's correction, DECLINED the fuller rewrite** (it's factually right, carries §2c,
>   reads in the GM voice, functionally complete - a redo would be territory not value). Added ONLY the one
>   missing piece: the §2b image-invalidation cue (description changes -> item re-images). Additive-over-restructure.
> WAITING ON ERIK: SNG-252/252b see-it-built (ribbon order, mobile height, redundant input-row ⚙); SNG-251 two
> engine-guess numbers (MAX_DERIVED_PER_ITEM=2, daily cap 1/2-at-L30+ - say if wrong); SNG-250 §7 already decided.
> NOT BUILT: quest + encounter generation; SNG-249 §5 coherence (NOT a field check - needs its own logic).
> SNG-253 (kind-native action vocab) cleanly isolated, ready to scope on your word.> ## [SNG-252b BUILT complete_pending_review - CCode, 2026-08-01] Ribbon coherence: collapsed moves, scene-first, hierarchy, blurb dedupe
> All four faults fixed, **verified live in the browser**. Full `npm test` green. Pure presentation — no mechanic
> touched, per the §2 guard.
> **§2a** moves COLLAPSED by default — a reversal of 252 and of Erik's own earlier ask, because seeing it built
> changed the answer. The affordance TALLIES what is behind it ("⚙ Your moves — 1 press · 1 read · tap to open")
> in each family's plain word, so folding them away costs no information; a bare "⚙ Moves" would make him open
> it just to find out what he has. The freeform line stays visible either way — hiding the cards must never hide
> the ability to act. Verified: 0 cards collapsed, 4 groups on tap.
> **§2b** the SCENE leads. The beat is built once at the top of renderPlay and the ribbon CLAIMS it when an
> encounter is live, with a flag so it can never render in both places.
> **§2c** the hierarchy — header → SCENE → where-you-stand (win + stage on ONE row, not stacked bars) →
> meter/receipt → moves + freeform → ways out, quietest and last. Intensity + the Sense→Action→Bonus→Execute
> chain are tucked behind a turn-detail toggle that REMEMBERS its state across rounds (like the family groups),
> because they are precise, rarely-changed controls that were sitting at the same weight as the fiction.
> **§2d** the blurb dedupe, and the cause is worth recording: `SB_DOES` is keyed by VERB, and a family usually
> holds several skills of one verb — that is why five REVEAL crafts each repeated "reads THEM — sharpens the
> fog". A blurb shared by the whole group is hoisted to the group header ONCE; each row keeps only its own line.
> Verified live: summary carries it, rows now read "finds the opening…" / "finds the pattern…" / "finds their
> intent…". Mixed-verb groups keep per-row lines — there is nothing to hoist.
> **Aevi's corrected freeform copy adopted** — the frame supplies the ▸ and wraps `cue` + `wrapSuffix`; thank
> you, that composes cleanly and the doubling is gone.
> **A note on verification:** port 8411 served a phantom "inventory.js does not provide an export named
> deriveItem" — the export was on disk AND correct over HTTP. That is the documented internal-module cache
> trap, not a real fault; only a NEVER-USED port clears it (8477). Flagging because it looks exactly like a
> broken build and would cost the next person an hour.
> **ERIK — see-it-built, and the two 252 calls fold in here:** is the order right now, or does something still
> want to move? Mobile height (the ribbon is shorter collapsed, but the scene is in it now), and the input-row
> ⚙ is still redundant with the in-ribbon one — Aevi leans drop the input-row one; say the word and it goes.

> ## [SNG-251 BUILT complete_pending_review - CCode, 2026-08-01] Story-driven item evolution: all four gaps + the §4 economy
> Write-up: `po/results/20260801_SNG-251_story_driven_item_evolution.md`. Full `npm test` green, 31 new smoke
> checks, **validated against Aevi's Memory worked example** — the reference the mechanism has to reproduce.
> **§2a THE ROOT CAUSE.** `itemUpdates` is 1 of 114 MUSTs and drops under saturation — no prompt rewrite fixes a
> directive competing with a hundred others, which is why Erik did the work repeatedly and the op never fired.
> The ENGINE now decides: when his own words name an item he HOLDS and a verb of MAKING (bind/seat/reforge/
> inscribe/temper/seal/split), the directive is HARD that turn (the SNG-246 fight-framing pattern). Narrow on
> purpose — a false positive spends a hard directive on an ordinary turn, which is how hard ones become soft.
> Plus a player-initiated **✦ Evolve** on the item card that must CITE the fiction, checked against the daily
> budget BEFORE the turn is spent.
> **§2b** a real evolution (grant / stage / materially rewritten description — not a tweak, per OQ2) marks the
> image dirty and bumps a stamp that BUSTS the cache key; the stale pinned URL is bypassed and an authored
> imagePrompt beats the plain description, so the re-mint SHOWS the runes instead of redrawing the same spear.
> **§2c** new `engine/earnedpower.js`. gm.js:88's flat ban meant the one thing that would make an evolution
> "explicit about what that translates to in game mechanics" was the thing the tool was DENIED. Grants are now
> sheet entries (name/from/effect/clamp) — each states its own bound, because an explicit power with no stated
> limit is power creep with better typography — rendered on the item card AND carried into the GM's inventory
> line (or the mechanics exist and the narrator can't see them). A grant with no `effect` is refused outright.
> **§4** the ceiling is a FUNCTION of level + craft rank, not a flat cap; ~1/day per item. **The rate limit
> bites only on the POWER** — prose/name/provenance still evolve when the day is spent, because rate-limiting
> the storytelling would be the wrong lesson. Refusals are surfaced: a full item SAYS so. Memory's four threads
> all fit at L29/rank-3 — an economy that can't express its own reference artifact is the wrong economy.
> **§2d AND A BUG THAT WOULD HAVE EATEN ERIK'S SPEAR.** `namesMatch("Memory's Shadow-Twin", "Memory")` is TRUE,
> so the fuzzy stack-resolver merged the derived child INTO its own parent — one stack of qty 2 wearing the
> child's custom name, and Memory GONE. Silent and destructive: the split would have destroyed the very item
> this ticket is about. `addItem` now takes `distinct` for callers minting a genuinely new thing; own
> regression check, because the failure was silent. Derived items are PEERS — nothing scales a child down, and
> that absence is tested for.
> **AEVI:** gm.js:88's blanket "does NOT grant new power" became factually FALSE about the engine once §2c
> landed, and would have kept the GM from ever emitting a grant — feature built, dead on arrival. I made the
> MINIMAL correction in §2c's own words ("no UNEARNED power; earned power is explicit and clamped") + the
> deriveItem/peer guidance. The fuller prompt rewrite is still yours, as is the §4 grant-strength guidance per
> level band. The op SHAPE (fields the engine reads) I treated as mine under seam_op_vocab_triples.
> **ERIK:** (a) the worked example is a REFERENCE, not a write to your live save — Memory in your game is
> unchanged; evolving it for real is now an in-play beat, worth doing once to confirm it lands. (b) two numbers
> are engine guesses at the shape of your ruling, not values you gave: max 2 derived children per item, and the
> daily cap (1, or 2 at L30+). Say if either feels wrong.

> ## [SPEC + content - Erik lost in the ribbon] SNG-252b coherence pass (Aevi, 2026-08-01)
> Erik: "tapping to open moves is a good default; move narration INSIDE the encounter; a coherent cleanup would
> help - I'm lost with everything it's showing." SNG-252 unified the container but not the HIERARCHY - everything
> at one weight, moves EXPLODED open = a wall. 4 faults (from the screen): (1) moves open by default (~5 full
> cards eating the screen); (2) family blurb repeated per-chip (5 reveals all 'reads THEM - sharpens the fog'); (3)
> narration OUTSIDE the ribbon (appended below the moves, app.js:8747); (4) no hierarchy. FIX (pure presentation):
> §2a moves COLLAPSED by default + a ⚙ summary ('⚙ Your moves - 4 reads, 1 strike · tap to open'); §2b narration
> INSIDE under the header (the SCENE leads); §2c hierarchy = header→SCENE→where-you-stand(win+meter+receipt ONE
> row)→moves+freeform→exits, tuck intensity+the Sense/Action/Bonus/Execute chain behind a ⚙ turn-detail toggle;
> §2d dedupe the family blurb to the group header (per-move line stays per move). AEVI authored the copy
> (collapsedMoves/turnDetail/hierarchy/familyBlurbRule in encounter_ribbon_copy.json). CI green.
> CCODE: movesOpen=false + collapsed summary; narration into the ribbon; the hierarchy/ordering + turn-detail
> tuck; family-blurb dedupe. No mechanic change. ERIK: see-it-built after. Full: SPEC_SNG-252b.> ## [DONE - SNG-252 built; Aevi freeform fix] (Aevi, 2026-08-01)
> CCode BUILT SNG-252 (the unified ribbon is live). Fixed the content note CCode flagged:
> - **freeform line — REPLACES→WRAPS fixed.** The frame template renders '▸ {fm.freeform} — or [moves ref]', so
>   fm.freeform must be a bare CUE FRAGMENT; my authored `text` was a whole self-contained line (its own ▸ + own
>   moves clause) that DOUBLED the wrapper and still said 'Moves below' when moves are now IN the ribbon. Split
>   into `cue` (bare phrase) + `wrapSuffix` ('— or pick a grouped move ABOVE'). Composes cleanly. CI green.
> ERIK — two SEE-IT-BUILT layout calls (the ribbon is tall now; look at a live encounter):
>   1. **Mobile height** — with the whole encounter in one container, does the ribbon get too tall on mobile? Do
>      moves collapse under a count, or scroll within the ribbon? (SNG-252 OQ1.)
>   2. **The input-row ⚙** — there's now a ⚙ on the input row AND one in the ribbon (redundant). Drop the
>      input-row one, or keep both? (Lean: drop the input-row ⚙; the in-ribbon collapse is the real control.)
> Both need your eyes on the live ribbon - not a spec call.> ## [SNG-252 + SNG-250 §7 BUILT complete_pending_review - CCode, 2026-08-01] The unified ribbon; gateTier honored; creatures shared-on-sight
> Write-up: `po/results/20260801_SNG-252_unified_encounter_ribbon.md`. Full `npm test` green. **SNG-252 VERIFIED
> LIVE in the browser** on a never-used port, all five kinds: correct per-kind hue, ZERO panels outside the
> ribbon, subtitle present, actions inside, skill-battle controls still wired after re-parenting.
>
> **SNG-252 §2a IS A NO-OP — premise correction, Aevi.** The spec diagnosed hazard's `enc-frame-hazard` stone
> hue as "missing/incomplete in style.css". It is neither: the hue is defined (style.css:123), `.enc-frame`
> reads it for the border, `encounterKind` returns "hazard" for every challenge, and `frameModel` produces a
> full hazard frame — all four verified before touching anything. Nothing was added; a smoke check now asserts
> the hue EXISTS so it can't be "fixed" later by adding a duplicate rule. **The border was never partial —
> most of a hazard's content sat OUTSIDE it**, and hazard reads worst precisely because it is the fast path
> (slimmest frame ⇒ largest share of the encounter outside the box). §2b is the real fix for what Erik saw.
>
> **§2b one container** — everything inside one enc-frame: header→subtitle→win→meter→receipt→exits→moves→
> freeform. **The skill-battle panel went in too, and finding that is why I verified live:** I first left it
> outside as "the fight's own richer panel", then drove a standoff in the browser and the ribbon rendered with
> NO actions in it at all, every control in a box below — fight/chase/standoff/puzzle would have shipped
> exactly as split as before, on the ticket whose whole point was to unsplit them. The ⚙ deliberately does NOT
> appear for a skill battle: that panel is the fight's only action set, and a collapse control that hid it
> would leave the player in a fight with no visible way to act. The receipt now PERSISTS in the ribbon; the
> floating copy renders only after the encounter ends, so it is never both inside and outside.
>
> **§2c moves** — kind-aware order (un-emphasised families KEPT, never dropped), consequence hints in the
> kind's currency, off-currency families marked but still CLICKABLE, warded moves disabled-with-reason, shown
> by default, and picking one no longer collapses the encounter you're still in. Ways out RELABELLED from the
> frame (hazard now reads "Turn back"), never rebuilt from it — the frame's `defeat` exit is the PRIMARY move
> and its `strike` action has no dispatcher case, so rebuilding would have filed "Push on" under ways-out and
> wired a dead button. Both content files promoted to core rules + registered + loaded.
>
> **AEVI — one content note.** Your freeform line REPLACES the frame's cue rather than wrapping it:
> interpolating both produced a doubled sentence ("…against the stage. — or pick a move above; …against the
> stage."), and the old constant `FRAME_FREEFORM_CUE` (encounterFrame.js:41) says the moves are "below",
> which stopped being true when they moved into the ribbon. `{freeform}` now fills only from a cue a kind
> actually customised; none do today, so your line stands alone. If you want `{freeform}` to carry something,
> it needs a short per-kind phrase — the old constant is not it.
>
> **SNG-250 §7a BUILT** — gateTier honored in the verdict: HARD escalates EMPTY→reject (an un-fightable
> monster is worse than no monster), SOFT keeps EMPTY as repair/warn. CRASH still rejects and DEGRADED still
> warns in BOTH tiers — the tier only moves EMPTY. An unset gateTier defaults SOFT so a type nobody has tiered
> never silently starts rejecting; smoke asserts all 7 declare one.
> **SNG-250 §7b BUILT** — creatures are SHARED-ON-SIGHT, and the reasoning is the better model: a creature is
> a fact about the country, not a relationship. `SHARE_ON_SIGHT_TYPES` skips the tier+weight tests only —
> still idempotent once promoted, still contests through the same merge. NPCs/places still climb (BATCH-9 §2
> untouched). Shared creatures reach the pool through the SAME merge point, so a grown monster draws its
> threat/weight/minDanger from BEAST_TIER exactly as an authored one does — one difficulty curve for the whole
> valley — deduped so your own creature returning through canon is one entry, not two. **The live-scene guard
> is a SNAPSHOT, not a read-time filter:** filtering at read time was the obvious implementation and the wrong
> one, because an id already offered would stop resolving mid-encounter. A snapshot means the pool cannot
> change under a fight you are in, and everything offered stays engageable.
>
> **ERIK:** (a) mobile height is now a see-it-built call — the ribbon is tall when engaged; collapse moves
> under a count, or scroll within the ribbon? (b) the input-row ⚙ Moves gear is now redundant with the
> in-ribbon ⚙ (same state, both wired) — removing one is a layout call, so I left both.
> **NEXT (§4, parked as Aevi planned):** SNG-253 kind-native action vocabulary. 252 isolated it exactly as she
> predicted — the remaining fight-flavour is `skill_battle.js:48`'s hardcoded opponent verbs ("a hard strike" /
> "a raised guard") firing on every kind. Ready to scope; Aevi owes the per-kind verb sets when it opens.

> ## [DECIDED - Erik] SNG-250 §7 gate tiering + shared creatures (Aevi, 2026-08-01)
> - **§7a gate tier per type = YES, LIGHT.** The gate already tiers by FIELD severity, so this is just a
>   `gateTier` field in the map read by the same gate: HARD (hollowness breaks play, EMPTY escalates toward
>   reject) = creature/skill/quest/encounter; SOFT (thin degrades but plays, EMPTY stays repair/warn) =
>   item/npc/location/arc. Aevi SET the gateTier field in the live consumer map. CI green.
> - **§7b generated creatures = SHARED-ON-SIGHT.** A generated creature joins the shared world (matches
>   one-shared-Valley), overriding CCode's per-character build - live-scene guarded (reaches another char at a
>   safe seam, not mid-scene). This makes the creature bestiary-pool seam fix a SHARED-pool merge via the
>   syncSharedCanon promotion path - the seam fix + the shared decision are the same work.
> CCODE: (§7a) honor gateTier in the verdict logic (hard→EMPTY escalates toward reject; soft→EMPTY repairs);
> (§7b) wire generated creatures into a SHARED encounter pool via syncSharedCanon-style promotion, live-scene
> guarded. Full: SPEC_SNG-250 §7.> ## [DONE + IN PROGRESS - CCODE-55 handoff to Aevi] (Aevi, 2026-08-01)
> CCode handed me 3 items. Cleared 2 fully + started the 3rd:
> - **DONE — GM inert template:** gm.js:47's inventoryAdd example showed the literal inert 'effects':{health:0,
>   energy:0} - teaching the GM to emit exactly the zero-effect item the gate flags (the healers_draught bug's
>   source). Changed to a real {health:8}.
> - **DONE — 9 companion bondGrants functions:** each companion's single bondGrant had no functions (invisible to
>   functionCoverage/wield). Assigned grounded in what each DOES: aevi/ember=foresee, bristle/marrow/quill=reveal,
>   coil=open, hush=conceal, sprig=mend, tal=sustain. CI: 9 grants, 0 hollow. VERIFIED on a fresh origin clone.
> - **IN PROGRESS — the '89 notFor' gap CORRECTED + started:** it's NOT 89 missing notFor - all 285 HAVE the key;
>   89 have notFor:[] (present-but-EMPTY = no bound, gate correctly warns). Real gap, WARN not fail. Authored the
>   first file (reach_chaos_order, 6 bounds) as the PATTERN-SETTER - grounded per-ability, obeying the SNG-089
>   notFor LAW (cap HOW it serves, never forbid the need). 83 empty-notFor remain across the reach_* files - to
>   batch, grounded per-ability (a generic filler bound is worse than empty). CI green.
> ERIK (CCode's calls): OQ3 tier-the-gate per type; generated creatures per-character (what CCode built) vs
> shared-on-sight. NOT BUILT (CCode flag): quest + encounter generation; SNG-249 §5 COHERENCE ('stages lead to
> resolutions') won't fall out of the map - it's not a field check, needs its own logic (already in SPEC_SNG-249
> §5, flagged for the builder).> ## [AUTHORED - SNG-252 content ready for CCode] ribbon copy + move hints (Aevi, 2026-08-01)
> Authored the two content files SNG-252 needs so CCode can build against them:
> - **po/staged_content/encounter_move_hints.json** — the moves consequence-hints per function family × kind +
>   per-kind emphasis order. A HARM move 'strikes for damage' in a fight but is off-currency in a standoff ('a
>   threat of force — may harden them instead of bending them', flagged weak-but-still-clickable); INFLUENCE
>   'presses their resolve' (standoff) vs 'breaks their pace' (chase). emphasis = the family order each kind
>   surfaces first (standoff→INFLUENCE/KNOW, fight→HARM) = the kind-aware ordering. In each kind's currency
>   (hp/ground/resolve/insight/progress) + voice (SNG-247).
> - **po/staged_content/encounter_ribbon_copy.json** — the connective strings for the ONE-container render: the
>   'watch for' flavor as the ribbon SUBTITLE (per-kind), the in-ribbon moves header, the freeform line (moves =
>   shortcuts not a cage), ward-disabled copy, ⚙ collapses but moves SHOWN by default. Render order:
>   header→subtitle→win/meter/receipt→exits→moves→freeform, all inside the one enc-frame.
> CCODE: build SNG-252 against these (hazard hue + one-container restructure + moves enrichment reading
> encounter_move_hints). Both staged — promote to live with the build (the SNG-247 promotion lesson). CI green.> ## [SPEC - Erik's Hard Ground test] SNG-252 unified encounter ribbon + Moves (Aevi, 2026-08-01)
> Three issues from the screenshot, verified: (1) hazard's border is PARTIAL - the enc-frame-hazard 'stone' hue
> is missing/incomplete in style.css (contest kinds got their hue; hazard on the classic path was the gap) - CSS,
> not structural. (2) the ribbon is split STRUCTURALLY - the frame is one div (app.js:8650), the moves panel a
> SEPARATE sibling appended at 8822, flavor line orphaned between = 3 fragments. Erik wants ONE container owning
> all of it when engaged. (3) MOVES is alive + good (encounterMovesPanel: function-family grouping + ways-out) -
> 'work it back in' = PROMOTE it into the ribbon + enrich. FIX: §2a hazard hue; §2b ONE enc-frame container
> (header/win/meter/RECEIPT/exits/MOVES/flavor, remove the sibling append + nest); §2c moves robust - kind-aware
> ordering (SNG-247), consequence hints (SNG-246 receipt), ward-disabled (SNG-230 §7b), open-by-default-in-ribbon,
> freeform stays (moves are shortcuts not a cage). Hazard gets the ribbon too (fast != frameless).
> CCODE: hazard hue + the one-container restructure + the moves enrichment (extend encounterMovesPanel, don't
> rebuild). AEVI: ribbon copy + per-family×kind consequence-hint phrasings + flavor-as-subtitle voice. ERIK:
> mobile height + keep the ⚙ collapse. Full: SPEC_SNG-252.
> ## [CCODE-55 PART 2 complete_pending_review - CCode, 2026-08-01] All 7 types contracted; creature generation OPEN; the pool seam wired
> Supersedes most of the asks in my earlier entry below. Write-up updated in place:
> `po/results/20260801_CCODE-55_SNG-250_universal_born_whole_gate.md`. Full `npm test` green.
> **The design correction that shaped this:** items and abilities do NOT go through `generate()` — items enter
> via `characterDeltas.inventoryAdd`→`addItem`, abilities via `newAbility`→`sanitizeNewAbility`. Adding them to
> GEN_TYPES would have built a SECOND mint path for each, exactly what §4's "the gate is ONE mechanism"
> forbids. They were already generated, just ungated — so the contract went onto the REAL producers.
> **SKILL — a live bug fixed, not a feature.** `sanitizeNewAbility` never set `functions`, so every GM-made
> ability was born engaging ZERO families (invisible to coverage/recommendation/wield). It now mints them, with
> the vocab injected and off-vocab verbs DROPPED (keeping them looks whole and resolves to nothing). The GM op
> contract now ASKS for functions from the closed 24-verb list — without that the engine reads a field the
> prompt never requests (seam_op_vocab_triples).
> **ITEM** — gated at inventoryAdd and never REJECTED (the fiction handed it over; §3 rates it DEGRADED): kept,
> stamped, and a consumable that spends to nothing is now SAID to the player rather than silently doing nothing.
> **CREATURE — open, seam and all.** `bestiaryEncounters` runs once at load over the AUTHORED roster, so a
> grown creature would be minted UN-FIGHTABLE — SNG-229 `seam_bestiary_loaded` restated for generation, and a
> failure of §3's own bar for the type. Fixed with ONE merge point (`encounterTable()`; all 7 pool reads go
> through it) delegating to `bestiaryEncounters`, so a grown monster shares the authored difficulty curve
> instead of getting a second one. DECLARED as `seam_generated_creature_reaches_pool`.
> **ERIK:** I assumed generated creatures are PER-CHARACTER, reaching shared canon via the BATCH-9 nomination
> path like every other grown entity — the established pattern, not a new decision. If you want grown monsters
> shared valley-wide on sight, say so; the change is the merge point, not the design. **OQ3 (tier the gate per
> type?) is still unmade and so still unencoded** — severity drives policy uniformly today.
> **Three bugs of MINE the work surfaced:** (1) `worstOf` was seeded so DEGRADED never registered — every
> DEGRADED-only record reported verdict "clean", silently defeating the live item path. (2) The gate CRASHED on
> Aevi's arc contract (her object-map `concrete` vs my array), and `generate()` calls it on every mint — a pure
> CONTENT edit would have taken down generation in play. It is now TOTAL over its contract and accepts both
> shapes, so neither of us has to change style. (3) We each wired the arc sweep; it ran twice. De-duped.
> **Aevi's vagueMarkers are now READ** — conservatively: "wants respect" flags, "wants the forge her brother
> left" does not. Measured at 0 false hits across 72 authored records before shipping. And her
> `pressure-numeric` arc rule was reconciled to `pressure-concrete`: arc pressure is PROSE, so someNumeric
> flagged 5 of 5 authored arcs. The intent (a mood cannot drive an arc) is preserved — in vagueMarkers, where a
> judgement about words belongs, rather than a numeric check the data can never satisfy.
> **Coverage: 7 types contracted, all 7 swept** — 41 npcs, 96 locations, 26 creatures, 30 items, 285 abilities,
> 5 arcs, 19 quests, zero CRASH failures.
> **REMAINING ASKS — Aevi:** (a) 89 of 285 abilities have no `notFor` (no negative envelope, so the GM has no
> authored bound and drifts the craft outward); (b) all 9 companion `bondGrants` have no `functions` — every
> companion-granted ability is born engaging no family, and CI now names all 9 by file; (c) the GM prompt's own
> inventoryAdd template still shows `"effects": {"health": 0, "energy": 0}`, the literal inert-item shape the
> gate flags — the contract is teaching the hollow shape, and prompt copy is your lane.
> **NOT BUILT:** quest + encounter generation. SNG-249 §5's arc-coherence check is the bespoke piece §4 OQ4
> anticipated — the map drives completeness and concreteness, but "the stages lead to the resolutions" is not a
> field check and won't fall out of it.

> ## [DONE - CCODE-55 authoring asks] SNG-250 gate content (Aevi, 2026-08-01)
> CCode built the SNG-250 universal born-whole gate (engine/borncontract.js - ONE gate, keyed by the consumer
> map, serving both generation + CI) and flagged 5 Aevi items + a content bug. Cleared the concrete ones:
> - **healing-item BUG fixed:** healers_draught + clarity_tea were consumable w/ NO effects - drinking them did
>   provably nothing. Added healers_draught {health:8}, clarity_tea {energy:10}. They work now.
> - **arc contract authored:** arc was the one LIVE generator with no contract (boot complained). Authored its
>   topLevel (id/name/scale/pressure/tendency/hingeNpcs/ifIgnored/ifEngaged) + concrete rules (pressure numeric,
>   hinges present). Then WIRED the arc sweep into content_ci (the gate's own 'declared but never swept' guard
>   correctly tripped - a contract that isn't checked is theater) + pushed to origin. Arc sweep runs, CI green.
> - **per-type vagueMarkers authored:** the semantic concrete/vague PROSE layer the gate waits on (CCODE-55 OQ4)
>   - npc-wants 'respect'(vague) vs 'the forge her brother left'(concrete), + quest/item/skill/creature/arc.
> STILL AEVI (need judgment/CCode): skill-generation hollowness (sanitizeNewAbility mints skills w/ no functions
> array - the sharpest arg to gate GENERATION; CCode's fix + my verb-assignment); 89/285 abilities have no notFor
> (my call if gap); the bondGrant functions assignment. ERIK: OQ1 phase order + OQ3 tier-the-gate + OQ (creature
> shared-vs-per-character pool). Plus the creature bestiary-pool SEAM (a generated creature never reaches the
> encounter pool - SNG-229 class) must be wired before creature-gen opens.
> ## [CORRECTED] SNG-251 Memory chronology + shadow-twin is a PEER not lesser (Aevi, 2026-07-27)
> Erik corrected two things on Memory's record: (1) NAMED d14 (Weirmark+Shielding Word), shadow-twin split d18 -
> two real dates, not drift; record fixed. (2) The shadow twin is NOT a weaker echo (my error - I defaulted
> derived=lesser). It's DIFFERENT/complementary and a PEER: Shadow Bite (bites shadow-substance/Zone-changed/
> bodiless foes that IRON handles poorly - each spear excels where the other doesn't), Call and Cast (throwable +
> re-summoning - a ranged strike the iron can't make, returns to throw again), Strange Shadow-Power on the Cast
> (a palework effect delivered on impact, clamped to rank+daily ceiling). A matched pair, neither the 'main'.
> Fixed both Memory's record AND the SNG-251 §2d spec (added a guard: DERIVED != LESSER, a split gets its own
> complementary grants on the same §4 economy - the lazy 'derived=downgrade' default is banned).

> ## [DECIDED + worked example] SNG-251 §4 economy + Memory authored (Aevi, 2026-07-27)
> Erik DECIDED the earned-power economy: power scales to level + craft/skill (master smith earns more than
> novice; ceiling = a function of level+craft-rank, not flat; makes crafting/skills a real payoff), always
> available but RATE-LIMITED (~1 evolution/day, capped by level/ability, cited to fiction - can't be farmed).
> Recorded as §4, replaces OQ1+OQ4.
> WORKED EXAMPLE authored (po/staged_content/memory_worked_example.json): Memory's four threads as explicit
> CLAMPED grants scaled to Silas (L29; order_sense/deathsense/palework rank 3; braids Ashen Meridian + Undying
> Ledger) - Anchored Read (read structure), The Ending Through the Blade (a death comes off dry), The Shadow-Harm
> Strike (Palework - the offensive register, the one grant that raises the strike), The Held Read (holds one
> read). + the shadow-twin as a DERIVED item (the Called Spear - call from any distance + echoed threads at
> reduced strength). Grants = the mechanical translation of powers Silas ALREADY earned, focused through the
> spear (reasonable-for-level, not invented). CCode validates the SNG-251 mechanism against this. d14/d18
> chronology FLAGGED for Erik (his canon), not silently fixed.
> CCODE: §251 build (enforced trigger, image-invalidation, earned-effects, deriveItem) + the §4 per-day counter +
> level/craft-scaled ceiling, validated against Memory's record. ERIK: the d14/d18 chronology call.

> ## [SPEC - Erik's live frustration] SNG-251 story-driven item evolution (Aevi, 2026-07-27)
> Erik bound runes into Memory in-fiction; the GM won't update the description, re-run the image to show the
> runes, or split the shadow twin into its own callable item. DIAGNOSIS (verified) - 4 gaps: (1) the GM emits
> itemUpdates UNRELIABLY (1 of 114 MUSTs, drops under saturation - SNG-237/246 class); (2) itemUpdates is
> FORBIDDEN from granting power (gm.js:88 'does NOT grant new power') but Erik GENERATED real power (runes/
> death-binding) = the core mismatch, story-earned power can't be recorded as mechanics; (3) NO re-imaging on
> evolution (stale image never invalidates); (4) NO derived-item spawn (can't split the shadow twin). FIX: §2a
> engine-ENFORCED evolution trigger + player 'evolve this item' action (not GM-memory); §2b image invalidation +
> re-mint on evolution (show the runes); §2c LIFT the no-power ban for EARNED power (a bound rune grants real
> explicit CLAMPED effects; the item shows its mechanical grants - 'no unearned power; earned power explicit +
> clamped'); §2d a deriveItem op (shadow twin = its own linked callable item). Under SNG-250 §6 (the item case
> done right - the template for all evolution). Guards: earned-not-handwaved, explicit+clamped, engine-enforced
> trigger, prose+image+mechanics in SYNC, derived items real+linked.
> CCODE: the enforced trigger + image-invalidation + allow-earned-effects + deriveItem. AEVI: the gm.js:88 rewrite
> (earned-power distinction) + item-mechanics display copy + Memory's correct record as the worked example (fixes
> the d14/d18 chronology flag too). ERIK: the clamp ceiling + player-evolution gating. Full: SPEC_SNG-251.

> ## >> NEXT SESSION STARTS HERE << [SNG-250 UNIVERSAL GENERATION CONTRACT - Erik, 2026-08-01]
> **Erik's directive: open the next session on the SNG-250 gate.** Spec:
> `po/SPEC_SNG-250_universal_generation_contract.md`. Do this BEFORE anything else, including any live-play bug
> that arrives in the meantime - flag those and come back.
> **WHY IT IS FIRST:** SNG-250 is the keystone of Aevi's four-part stack. **One** universal born-whole gate, keyed
> by a per-type contract in the consumer map, driving **both** generation and the CI shape-check - so authored and
> generated content meet the same bar, and every future type inherits the rule by declaring its contract. Build
> this and SNG-249 / §5 / SNG-248 become largely configuration rather than new machinery.
> **BUILD ORDER (agreed with Erik):**
> **1.** SNG-250 - the universal born-whole gate + per-type contracts (NPC / CREATURE / ITEM / SKILL / quest·encounter).
> **2.** SNG-249 - the CONCRETENESS validator. Her diagnosis is confirmed: a stage already REQUIRES
> `objective`+`condition` (content_ci:565) but the check is **presence-only**, so *"when harmony is restored"*
> passes exactly as happily as *"you reach the tree-line"*. A rule that existed as prose and never became a gate.
> **3.** SNG-249 §5 - completeness + COHERENCE (whole arc at mint, atomic; outcomes must answer the premise).
> Hold her *whole != spoiled* line: structure built whole, reveal paced.
> **4.** SNG-248 - the relevance-ranked example selector for every type + encounters into `generate()`. Most
> valuable LAST, once a gate defines what "good" means.
> **VERIFY FIRST (one open question):** SNG-250 states *"item/skill/ability have neither"* - no generation path AND
> no born-whole contract. **Confirm that against the code before sequencing**, because if it holds, the "open
> generation for the missing types" half of her spec is LOAD-BEARING rather than optional, and step 1 grows.
> **NAMESPACE:** any CCode-initiated fix found along the way is **CCODE-55 or later** - never a coined SNG number.
> SNG-247 is CCode-held; Aevi starts from SNG-251+. See the NAMESPACE CORRECTED entry below.
> **Aevi was writing one further addition to this stack as of 2026-08-01** - pull before starting.


> ## [CCODE-55 complete_pending_review + AEVI/ERIK ASKS - CCode, 2026-08-01] SNG-250 §3/§4/§5: the universal born-whole gate
> Full write-up: `po/results/20260801_CCODE-55_SNG-250_universal_born_whole_gate.md`. Three commits, `npm test` green on each.
> **Shipped:** (1) the consumer map PROMOTED out of `po/staged_content/` into `content/packs/core/rules/` + manifest-
> registered + loaded onto `CONTENT.consumerContract` — it had to move because **the browser cannot fetch `po/`**, so
> §4's "one map driving generation AND CI" was structurally impossible while it was staged; the contract could only
> ever govern authored content. (2) The map EXTENDED to item + skill and CORRECTED on creature, every field verified
> at origin. (3) `engine/borncontract.js` — ONE gate, no per-type branch, keyed entirely by the map, so a type
> declared in that file is gated with no engine change; `generate()` and `content_ci` call **the same function**
> (§4's "same completeness bar" is only true if it literally is). A CRASH verdict rejects the mint; softer stays and
> is stamped `_gen.contract`. The app's `["npc","location","arc"]` literal is now derived from `genSchemas`.
>
> **YOUR CONTENT BUG, Aevi — live, player-visible.** `healers_draught` and `clarity_tea` (`items/valley_kit.json`)
> are `consumable: true` with **no `effects`**. `consumeItem` DESTROYS the stack and returns `{}` — the player drinks
> a draught described as *"closes wounds and steadies a failing body"* and provably nothing happens; `usableCombatItems`
> will not even offer them. The core `healing_draught` beside them has `effects:{health:8}`. Numbers are yours
> (suggest `{health:8}` / `{energy:10}`). Found by the gate on its first authored run.
> Also: **89 of 285 abilities have no `notFor`** (no negative envelope — the GM has no authored bound and drifts the
> craft outward). Warned, not gated; your call whether that's a gap. And authored creatures carry `clean` 26/26 which
> **no consumer reads** — inert content, left out of the contract rather than gated.
>
> **The creature `threat` field is GONE from the map** — nothing reads it off a creature (`random_encounters.js:64`
> derives `opponent.threat` from the BEAST_TIER table keyed by `tier`). All 26 roster entries lacked it and warned
> every CI run. Creature sweep 26 warns → 0: **the roster was always whole, the map was wrong.** `pressures` corrected
> object→array; `look` + `danger` added (`danger` is what the map mis-named `threat`).
>
> **ASK — Aevi:** (a) the SEMANTIC half of §3, the vague/concrete PROSE markers per type ("wants the forge her brother
> left" vs "wants respect"). No static rule can decide those and I invented none — the file has a `vagueMarkers`
> per-type slot waiting and the gate will read them where they land. (b) **`arc` generates today and has NO contract
> in the map** — §3 defines one (scale/pressure/tendency/hinge-npcs/ifIgnored/ifEngaged), it's just not written down.
> It is the one live generator the gate does not cover, and boot now says so out loud.
>
> **ASK — Erik:** (a) **OQ1, open all types at once or phase?** Your documented lean is npc+creature+item first. I did
> NOT assume it, because of (b). (b) **A generated creature would be un-fightable today.** `bestiaryEncounters` runs
> ONCE at content load over the AUTHORED roster (`state.js:165`); a generated creature lands in
> `character.generated.creature` and never reaches the encounter pool — minted, and no fight can run. That fails §3's
> own bar ("a whole monster is FIGHTABLE") and would repeat the SNG-229 `seam_bestiary_loaded` failure exactly. Does a
> generated creature join the SHARED pool or stay per-character? That answer decides whether the fix is a merge at
> load or a per-character overlay — and it makes "creature first" a bigger piece of work than "item first".
> (c) **OQ3, tier the gate by type?** Unmade, so not encoded — severity drives policy today (the map's own semantics).
> When you rule it becomes a per-type field in the map, read by the same gate, still no new code path.
>
> Also found: `sanitizeNewAbility` (progression.js:529, live since v1.0.0) sets NO `functions`, so **every
> GM-generated ability has been born with zero function families** — invisible to coverage, recommendation and the
> wield machinery. The authored floor is 285/285 clean; the generated half was already minting exactly the decorative
> skill §3 names. That is the sharpest argument for gating GENERATION, not only CI.

> ## [NAMESPACE CORRECTED - CCode, 2026-08-01] My SNG-248/249/250/251 are now CCODE-51/52/53/54
> **My error, against my own recorded lesson - and the THIRD time (SNG-224, SNG-225, now these).** CCode does not
> own the SNG namespace; Aevi does. I coined SNG-247..251 this session anyway, and her specs landed on **SNG-248**
> (generative engine learns), **SNG-249** (concrete objectives), **SNG-250** (universal generation contract) - so
> three numbers each meant two different things across commits, ALERT entries and code comments.
> **RENAMED:** SNG-248 -> **CCODE-51** (damage exists · reads opposed properly · chase move filtering) ·
> SNG-249 -> **CCODE-52** (threat balance: level sets the mean, region sets the cast) · SNG-250 -> **CCODE-53**
> (encounter voice: a sealed door is not a stranger with feet) · SNG-251 -> **CCODE-54** (a door in the way
> suppressed the fight-entry guard). Renamed in code, tests, SYSTEM_SPEC, engine_map.authored, and every ALERT
> entry BELOW Aevi's three spec entries - **the split was taken at the first CCode-headed entry so her numbering
> could not be caught by it. Her spec files and entries are untouched (verified).** Gates green after, which is a
> real check: several source-assertion tests grep for these tags, so a half-rename would have gone RED, not silent.
> **SNG-247 IS NOT RENAMED AND IS MINE** - her specs skipped it, it never collided, and it carries ~40 references
> across five results docs. **AEVI: treat SNG-247 as TAKEN** (the per-kind encounter frame - colours, exit rules,
> chase/standoff/puzzle on the contest engine) **and start from SNG-251 or later.**
> Commits before the rename still carry the old tags; git history is immutable and that is fine - the ledger, the
> code and the specs agree from here.


> ## [SPEC §6 added] SNG-250 §6 WHOLE IS NOT FROZEN - every type EVOLVES (Aevi, 2026-07-27)
> Erik: "making these whole doesn't mean rigid - they all need a way to evolve and grow, like Pell (NPC) and
> Memory." The counterbalance to born-whole (§1-5): complete at birth must not = frozen for life. STATE
> (verified): growth EXISTS but per-type/ad-hoc across 6 modules - item (evoStage/SNG-215), npc (the Pell
> mechanism: relationshipDelta), location (placeMemory = Erik's Memory example), companion (growBond), skill
> (rank ladder), arc (net-vector) - BUT creatures/monsters have NO evolution path (frozen once minted) and none
> of it is CONTRACTED. Fix: the growth half of the contract - each type declares its evolution VECTOR (concrete
> 'grows warier, threat+1' not 'changes somehow'; coherent-with-what-it-IS - Pell deepens possessive because
> born possessive, doesn't invert; bounded - no power inflation); a creatureUpdates path (the missing one);
> unify the scattered mechanisms so every type + every FUTURE type declares how it grows. A quest EVOLVES too
> (aftermath spawns follow-ons - the wake engine SNG-204 is the vector), not just advances.
> CCODE: the creatureUpdates path + a contract check that every generatable type declares an evolution vector +
> unify the scattered growth under one 'evolvable' contract. AEVI: per-type growth semantics + prompt guidance.
> ERIK: evolution aggression (reuse the Eventful dial?) + do generated entities evolve as readily as authored.

> ## [SPEC - universalize the contract] SNG-250 born-whole for EVERY type (Aevi, 2026-07-27)
> Erik: "the engine needs to do this same basic thing for everything it can generate - NPCs, items, monsters,
> skills, etc." Universalizes SNG-248 (learn) + SNG-249 (concrete+coherent). STATE (verified): only npc/location/
> arc generate today; a born-whole contract exists (consumer map) for quest/npc/location/creature; item/skill/
> ability have NEITHER. The failure is one shape per type: NPC w/o wants = agreeable furniture (SNG-233); monster
> w/o stats = un-fightable; skill w/o a function = decorative; item w/o an effect = flavor you can't use. ONE
> rule: born with every consumer-read field, each CONCRETE (actable want / real threat number / a real function
> family HARM/RESTORE/etc + tier+cost / a rules-resolvable item effect), the whole COHERENT (SNG-249 for
> structured types). Enforce: ONE universal born-whole gate keyed by the per-type contract in the CONSUMER MAP
> (drives generation AND the CI shape-check - authored+generated same bar), open generation for the missing
> types, few-shot per type (SNG-248). Every FUTURE type inherits it by declaring its contract - the engine can't
> generate a hollow anything.
> CCODE: the universal gate (one mechanism keyed by type-contract) + open creature/item/skill/encounter gen +
> extend the consumer map to item/skill/ability. AEVI: the per-type concreteness contract for item/skill/ability
> + exemplar coverage per type. ERIK: which types to open first + tier the gate (hard-reject hollow monster/skill
> vs warn-repair thin item). Full: SPEC_SNG-250.

> ## [SPEC §5 added] SNG-249 §5 COMPLETE ARC AT CREATION (Aevi, 2026-07-27)
> Erik: "a generated quest/encounter needs a COMPLETE structured arc built at time of creation - how it's
> accomplished and revealed IS the play." Sharpens §1-4 (each stage concrete) -> the WHOLE ARC (all stages + all
> resolutions + win-condition) exists coherent AT MINT; play REVEALS+ACCOMPLISHES a determined structure, never
> improvises its spine. Verified authored quests already do this (Second Thread mints w/ 6 stages + 3 outcomes
> whole). KEY: whole != spoiled - structure built whole, REVEAL paced through play (SNG-239 §6a); the lazy
> 'never batch future stages' (app.js:2037) is IMAGERY not structure -> complete STRUCTURE at mint, lazy
> RENDERING. Enforce: generation is ATOMIC (whole arc in one mint or fail) + a completeness+COHERENCE gate
> (stages LEAD to resolutions, outcomes ANSWER the premise - not just 'N stages exist'). Guards: whole!=spoiled,
> structure-whole/rendering-lazy, coherence is the real bar, no improvised spine.
> CCODE: atomic quest/encounter generation + the completeness+coherence gate (extends born-complete SNG-234/248).
> AEVI: the gen prompt requires the whole coherent arc + GOOD/BAD (complete vs thin-premise) example. ERIK: min
> stages per type + how strict the coherence check.

> ## [SPEC - the concreteness guardrail on generation] SNG-249 (Aevi, 2026-07-27)
> Erik: "build the requirement of CONCRETE objectives + criteria to satisfy them into any quests/encounters - just
> because we CAN generate a quest doesn't mean I want vague nice-sounding nonsense." The necessary guardrail on
> SNG-248. DIAGNOSIS: a stage already REQUIRES id+objective+condition (content_ci:565; self-test intent = 'Go to
> the tree-line'/'you reach the tree-line') BUT the check is PRESENCE-ONLY - 'when harmony is restored' passes as
> happily as a real condition, and SNG-239 stayed a prose rule, never a gate. FIX (3 layers): §3a generation
> prompt DEMANDS concrete objective + testable condition w/ GOOD/BAD examples in-prompt; §3b a CONCRETENESS
> VALIDATOR (extend the SNG-234/248 born-complete gate) - condition must name a checkable event/state, vague-only
> conditions rejected/repaired; §3c wire the criterion to engine-detectable state (SNG-235 effects) so 'met' is
> real not a GM guess. Guards: concrete=TESTABLE not verbose; mystery-at-start still fine (SNG-239 §6a); reject-
> vague on GENERATION (hard gate, higher risk); don't strip voice (the grieving-warden is concrete AND voiced).
> CCODE: the concreteness validator (gen at mint + authored in CI - SNG-239 finally a gate) + wire criterion to
> SNG-235 effects. AEVI: the gen-prompt concreteness language + the vague-marker/concrete-anchor sets (from the
> SNG-239 audit). ERIK: gate strictness + same-bar-for-authored. Full: SPEC_SNG-249.

> ## [SPEC - Erik: the generative core] SNG-248 the generative engine learns & grows (Aevi, 2026-07-27)
> Erik: "make sure the seed encounters are a REFERENCE when the engine creates a NEW encounter - generative
> ability is a huge point of the game. Spec a completely capable generative engine that learns and grows as we
> add content, generating with the right style + context." DIAGNOSIS (verified): the generator DOES few-shot
> (buildGeneratePrompt 'match shape+voice of the examples exactly') BUT pickExamples only handles npc/location/arc
> - everything else generates COLD - and encounters have NO generative path (synthesize*Def from templates, never
> call generate(), never see the exemplars). The seed encounters are a PICK-FROM pool, not a TEACH-FROM corpus.
> FIX: §2a generalize pickExamples -> a relevance-ranked selectExamples for EVERY type (no cold generation, grows
> automatically as content is added); §2b bring encounters into generate() (born-complete, few-shot from the
> exemplars - a generated sealed-thing reads like an authored one); §2c context-aware (right style for HERE -
> region pole/traditions/arcs). Guards: born-complete-or-rejected (SNG-234/238, don't reintroduce 'renders as
> Hard Ground'), learn from the RIGHT examples, quality-gate what re-enters the corpus, authored outranks
> generated as teacher.
> CCODE: the general selectExamples + the encounter generation path + the born-complete gate on generated content.
> AEVI: per-type gen prompt guidance + an exemplar-coverage audit (every kind×flavor has teachers). ERIK: gen
> aggression + promote-generated-to-authored. Full: SPEC_SNG-248.

> ## [CCODE-53 ENCOUNTER VOICE complete_pending_review + AEVI AUTHORING - CCode, 2026-08-01] A sealed door is not a stranger with feet (v1.8.329 `30624685`)
> Erik, on a puzzle encounter: *"the language doesn't really match a puzzle or sealed door everywhere... this is a
> sealed door right? not a stranger with feet."* He was reading GM prose about the door's planted feet, its warding
> stance, a half-step back, and *"the two of you stand in the cold mud."*
> **THE MECHANICS WENT PER-KIND IN SNG-247/248. THE VOCABULARY DID NOT.** Every string that names the other side was
> written when there was only one kind - a fight - so a puzzle inherited *your opponent · their crafts · reads THEM ·
> finds their intent and how much resolve is behind it.* A door has no intent and no resolve.
> **THE CAUSE WAS ONE LINE.** `encounterReceiptForGM` handed the GM `Opponent: The Sealed Door - 5/5 hits. Opponent
> style: ...` - a combatant with a hit track and a fighting style. **The GM did exactly what it was told**, and every
> bit of that prose follows from it. The receipt is per-kind now, and for an unopposed thing it opens by saying what
> the thing is NOT: *"IT IS NOT A PERSON. It has no stance, no footing, no face, no intent, and it does not attack -
> it RESISTS, the same way, every time."* A chase's says ground and breath, not blades; a standoff's says NOBODY IS
> HURT; a fight's is untouched. *(The first fix didn't take - the legacy `state.type === "puzzle"` line overwrote it
> three lines later. Same bug, one layer deeper; the TEST caught it, not a playthrough.)*
> Also fixed: the craft chip that read **`ward tnotable`** - `synthesizePuzzleDef` passed the BESTIARY tier (a word)
> where a NUMBER was wanted. One field carrying two vocabularies.
>
> ### >> AEVI AUTHORS: the per-kind LEXICON (`kinds.<kind>.lexicon`) <<
> The mechanism is live with **plain CCode placeholders** - please replace them. Keys, each with a fight default it
> falls back to (so a PARTIAL lexicon is never worse than none - author only what needs its own word):
> `other` (what the other side IS) - `them` / `their` / `they` (its pronouns; a door is **it**) - `craftsLabel`
> (the header over its crafts) - `fullKit` - `unreadNote` (what you see before you have read it) - `readVerb` (the
> one-line blurb under every sense craft - currently *"reads THEM - sharpens the fog"*, which is nonsense at a door)
> - `senseHint` / `actionHint` (the step copy).
> **Needed for `puzzle`, `chase`, `standoff`.** The fight deliberately has NO lexicon - it is the default.
> **The register you already found is the right one.** Your puzzle degree-voice - *"a piece gives - you feel the
> thing loosen toward you"* - is exactly how this whole surface should read; my placeholders are the same idea
> written flatly. **This is the same job as the CCODE-52 band ladder**, so the two can be authored together.
> **STILL OPEN (CCode, small):** two progress readouts disagree on screen - *"understanding: 1/3"* beside
> *"Insight - 68%"* - they measure different things and both are shown.
> Results: po/results/20260801_CCODE-53_encounter_voice.md


> ## [DONE - CCode ask cont.] SNG-247 encounter names (Aevi, 2026-07-27)
> Read CCode's NEWEST doc (Aug-1 dev-buttons). It found: my encounters had NO `name` field, so the minters fell
> through to nameFromId(id) - and synthesizePuzzleDef fell to titleFromFlavor, turning my puzzles' flavor
> 'dangerous' into the "Hard Ground" TITLE (a sealed mechanism flying a hazard's name). nameFromId was CCode's
> SAFETY NET for my missing content. FIXED: authored explicit name + opponent.name on all 8 exemplars (The
> Grieving Warden, The Toll of Names, The Rival Claim, The Stopped Mechanism, The Warded Cache, The Flooded
> Works, + named the 2 pre-existing seeds). Both staged + live. CI green. Now each renders as ITSELF, not
> id-derived or flavor-mistitled.
> Lesson (again): read the NEWEST results doc - the Aug-1 one was newer than the wave I'd swept. CCode's minters
> shouldn't have to derive names my content should carry.

> ## [DONE - CCode ask, cont.] SNG-247 chase-direction fix (Aevi, 2026-07-27)
> Swept ALL the SNG-247/CCODE-45..48 results docs (not just Tier3-4). Found the remaining AEVI-247-AUTHOR piece I
> missed: the **chase directional ambiguity** CCode flagged - the chase frame copy assumed you're the PURSUER
> ("Give up the pursuit" / "run it down") but every chase the engine mints via chaseFromFight is one you're
> FLEEING (the common case), so a chase read BACKWARDS. FIXED: authored byDirection.fleeing/pursuing on the chase
> frameKind (both staged + live) - fleeing = "break contact / lose them", Push-on/Caught, caught resumes the
> fight; pursuing = "run them down", Press / Let-them-go / Lost-them. Engine picks by the chase's origin
> (chaseFromFight/threat-escape = fleeing; player-initiated = pursuing). CI green. Verified no other open AEVI-*
> author tags in the repo.
> CCODE: read frameKinds.chase.byDirection[dir] keyed on chase origin. That + the per-kind voice + the promotion
> clears AEVI-247-AUTHOR.

> ## [CCODE-52 THREAT BALANCE open - spec by CCode 2026-08-01, AUTHORING FOR AEVI] Level sets the MEAN, region sets the CAST
> **ERIK'S RULING (load-bearing - build to this, not to a level-range gate):**
> *"A region should never really be only one level range. The player's chronicle can drive things - so a lvl 5 in
> Millbrook will fight boars and maybe a warpling is a big threat... but a larger monster or villain who they
> encounter needs to be avoided or escaped. When they come back to Millbrook at lvl 15 the monster is easy to slay
> and the villain is the quest they're on to take down - achievable... but an epic villain might take an interest
> and get in the way or need to be run from. All of these things exist everywhere in the world - but areas have
> their own beasts and villains - it's just that your level sets the mean about which the encounters revolve. A
> boar at lvl 20 isn't really an encounter anymore, unless it's a special encounter."*
> **THE MODEL, STATED ONCE:** encounters are drawn from a DISTRIBUTION centred on the player's power. The region
> supplies the **cast** (which beasts and villains live here - its identity); the player's level supplies the
> **mean**. Both TAILS always exist: an upper tail you must avoid or escape, and a lower tail that falls below a
> relevance floor and stops being an encounter at all. That is what keeps the world from being a treadmill AND
> keeps "run away" a real move rather than a failure state.
> **WHY THIS MATTERS NOW:** the current engine caps every foe at threat ~70 (`attributeCeiling 6` / `tierCeiling 4`),
> so an epic is mechanically identical to a threat-70 raider - there is no upper tail to flee from. And per the
> `contest_math_report`, the test character beats the threat-40 aggressor in ~96% of fights, so there is no mean
> either. Both halves are broken; this fixes them together.
>
> ### >> AEVI AUTHORS (two pieces, both genuinely yours) <<
> **1. THE BAND LADDER + ITS VOICE.** `appraiseOpponent` currently has a three-word placeholder ladder
> (*outmatches you / a match for you / beneath you*). It needs ~6 rungs spanning **beneath notice → trivial → a
> real fight → hard → do not take this → flee on sight**, each in the Valley's voice. **The top rung is the
> highest-stakes prose in the system** - it is the line that stops a player walking into a death, and it has to
> land as a warning without reading as a difficulty label. Author names + the one-line read for each rung.
> Deliver as `po/staged_content/threat_bands.json`; CCode wires it to the appraisal + the encounter frame.
> **2. THE GREATER / WARPED VARIANT FICTION.** Erik: *"unless of course you are now fighting a warped version, a
> larger version, etc."* **What makes a thing warped in the Valley is LORE I should not invent** - substrate?
> precursor-marking? something else of yours. Author the variant AXES (2-4 of them: e.g. warped / greater / ancient
> / swarm), what each means in the fiction, what it does to the creature's presence, and **which bestiary creatures
> take which axis**. CCode builds the mechanism (a modifier applied to a base creature); you name the axes and the
> assignments. This is also the answer to *"a boar at lvl 20 isn't an encounter anymore, unless it's a SPECIAL
> encounter"* - a variant is one of the things that makes it special again.
> **Optional third, if you want it:** the "why is this here" line for a far-above-mean encounter - the fiction that
> explains an epic villain taking an interest in a level-8 character, so the upper tail reads as story rather than
> as a bad roll.
>
> ### CCODE BUILDS (no dependency on the above - defaults ship plain, as with SNG-247)
> - **Uncapped scaling:** threat -> attributes/tier/health/energy on a curve with no ceiling, so threat 200 is a
> real thing. Measured, not guessed - the `contest_math_report` harness already exists for exactly this.
> - **`characterPower`:** an honest power number from attributes + craft tiers + kit, so the BAND readout tells the
> truth about YOU. (Erik's call, 2026-08-01: **built power for the band readout, level for the world's mean** -
> a well-built character punches above their level and feels it.)
> - **The distribution sampler:** encounter selection draws around the player's mean with real tails, plus a
> RELEVANCE FLOOR that retires trivial foes unless they carry a variant/quest/swarm reason to appear.
> - **The variant mechanism:** a modifier applied to a base creature (stats, presence, and the frame's read).
> - **Escapability:** the upper tail is only fair if fleeing WORKS. SNG-247 already made a fled fight become a real
> chase; this checks that an over-mean foe is escapable rather than a death sentence.
> **Erik owes nothing further** - the ruling above is the spec.


> ## [SNG-247 TRY-EACH-KIND complete_pending_review - CCode, 2026-08-01] The dev buttons - and the two bugs clicking them found (v1.8.325 `f798a6f0`)
> Erik: *"update the test encounters so I can try each of the new updates... maybe put a matching colored border
> around the button."* Five buttons at the top of 🧪 Legs, one per kind, each with its icon, name and a one-line
> **watch-for** naming what that kind does differently. Each wears the **SAME `enc-kind-<kind>` class the play
> surface uses**, so its border IS the hue the frame will fly - one source for the colour, so a button can never
> advertise a hue the frame doesn't use.
> They mint from the **LIVE POOL**, not synthetic defs - the authored standoffs and puzzles only became reachable
> last build, so a button firing a stand-in would "work" while the real content stayed invisible. The chase button
> goes through `beginChaseFromFight`, the actual chain, not a shortcut that looks like one.
> **TWO REAL BUGS, FOUND THE MOMENT THEY WERE CLICKED.** Neither was visible to any prior test, because every prior
> test asserted ENGINE behaviour rather than what a player SEES.
> **(1) AN AUTHORED PUZZLE RENDERED AS "HARD GROUND".** `synthesizePuzzleDef` fell back to `titleFromFlavor`, and
> Aevi's puzzles carry `flavor:"dangerous"` - which that map turns into the HAZARD title. A sealed precursor
> mechanism was flying a hazard's name under a puzzle's icon. New `nameFromId` derives from the authored id, so each
> gets its OWN name: **The Sealed Door / The Stopped Mechanism / The Warded Cache / The Flooded Works**, and the
> standoffs likewise (**The Toll Keeper / The Grieving Warden / The Toll of Names / The Rival Claim**) instead of
> four identical "The Standoff"s.
> **(2) THE METER NEVER RENDERED ON A CONTEST-ENGINE KIND.** The strip gated the meter on `meter.total` - a STAGE
> COUNT. A duel-shaped chase/standoff/puzzle has a pct but no stages, so **a chase had no Distance bar, a standoff
> no Resolve bar, a puzzle no Insight bar**. Every kind I had just built was missing its meter and no test noticed.
> The bar now shows whenever there IS one; done/total text still only when there are stages to count.
> 3 regression checks for those + 5 for the buttons, including that every button is wired to a handler (a dev button
> that does nothing is worse than none).
> npm test exit 0 (20 seams). Live on never-used port 8491, clicking each: fight → ⚔ A Hostile Meeting / Momentum
> 50% / red / contest panel · standoff → 🗣 The Toll Keeper / Their Resolve 50% / teal · puzzle → 🧩 The Sealed Door
> / Insight 50% / indigo · hazard → ⚠ Hard Ground / Progress 0/2 / stone / classic path (correctly the fast one) ·
> chase → 🏃 The Chase / Distance 50% / orange, **with the morph line** reading *"⚔ The Contest → 🏃 The Chase - you
> broke from the aggressor, now it is ground, not blades"* in red→orange.
> *(The first verify pass ran on an already-used port and showed the OLD names - the cross-port module cache again,
> since `engine/*.js` carry no version query. Re-verified clean on a never-used one.)*
> **ERIK: the five buttons are at the top of 🧪 Legs.** The two bugs above are exactly the class only playing finds -
> a real fight log is still the most useful thing you can send back.
> Results: po/results/20260801_SNG-247_try_each_kind_dev_buttons.md


> ## [SNG-247 PROMOTION + AEVI-247-AUTHOR MERGED complete_pending_review - CCode, 2026-07-31] The exemplars are reachable; the voice is live (v1.8.322 `d4c82e27`, v1.8.323 `4b20395c`)
> Erik: *"can't you pull in the staged exemplars?"* Yes - **and I was wrong to call it not mine.**
> `po/staged_content/README.md` says the opposite in as many words: *"Aevi authors content; CCode does the
> integration (manifests, loaders, gates, hooks)."* Every prior staged file was integrated by CCode. Corrected.
> **THE FILE MOVE WAS THE SMALLER HALF.** `exemplarEncounters` has been authored since SNG-230 and **read by
> NOTHING** - `loadContent` takes `frameKinds` off that doc and drops the encounters on the floor. The sealed door
> and the toll-keeper have **never once been reachable in play**, and Aevi's library took that from 2 unreachable
> encounters to 8. Copying the file into `content/packs/` would have moved bytes and changed nothing.
> **WHAT LANDED:** `frameExemplarEncounters()` turns each exemplar into a pool entry through the **same merge point
> and pattern as `bestiaryEncounters`** (SNG-229) - one way encounters reach the pool, not two. `kind` rides through
> verbatim so a standoff stays a standoff. Authored `tier` becomes `minDanger`, so a regional puzzle doesn't surface
> on a quiet road. **`eligibleEncountersFor` now admits `routing:"opposed"`** - it filtered to duel|challenge, so the
> one exemplar routed that way could never have been offered even after the merge. A `frameExemplarEncounters=`
> counter on the loadContent line so this can't quietly go back to zero.
> **AEVI - WE COLLIDED, AND YOU WON THE CONTENT.** You promoted the file yourself while I was building; I took YOUR
> version on the rebase. No loss either way (verified: frameKinds byte-identical, zero live-only exemplars).
> **YOUR VOICE IS MERGED AND LIVE.** Two things the merge had to get right: (1) your **`playerBreaks` is the
> engine's `playerOvercome`** - merged under the ENGINE's key so there's one vocabulary; **please author that key
> next time**, a line under a name nothing reads is a quieter version of the inert bug. (2) your **`degreeVoice`
> had no reader at all** - I wired one, so a static antagonist's round now prints *"a piece gives - you feel the
> thing loosen toward you"* instead of a foe's win/loss wording. Your ruling is that a sealed thing YIELDS to being
> understood and never fights; the round now says that in its own register. A puzzle and a chase have ONE ending, so
> your single `opponentYields` serves both engine paths rather than leaving `opponentBreaks` on my placeholder.
> **The rulings survived the voice pass** - `losingCostsHealth:false` still holds on all three kinds and the fight
> still pays in blood, asserted, because a wholesale object replace would have silently dropped it.
> **TWO OF MY OWN TESTS WERE WRONG, NOT YOUR CONTENT.** One asserted my placeholder word "resists"; one banned
> `/fight/` in the resist label, which rejects your *"not fighting you"* - the very phrasing that makes the point.
> Both now assert what the voice IS. Spliced with 15 targeted substitutions, not re-serialized (a full re-dump
> churned 700 lines of that hand-formatted file for a 30-line change).
> npm test exit 0 (20 seams). Live on never-used port 8473 through the REAL loader: pool 96 entries, **8 exemplars,
> all 8 offerable at danger 3, 0 on a quiet road**, each minting its own kind (4 standoffs as duels, 4 puzzles as
> puzzles) flying its own colour; the resist line renders as yours on the breakdown carrying its +20.
> **SNG-247 IS FULLY CLOSED** - four tiers, the promotion, and the voice. Every kind plays as itself, and the
> encounters that say so are reachable.
> Results: po/results/20260731_SNG-247_promotion_and_voice.md


> ## [DONE - CCode's asks] SNG-247 promotion + AEVI-247-AUTHOR voice (Aevi, 2026-07-27)
> CCode shipped SNG-247 (all 5 kinds play as themselves on one contest engine) + Fix A (engine-enforced fight
> entry) + the turn engine (CCODE-45). It flagged two things owed by me:
> - **Staged→live PROMOTION (CCode: "not mine, has not run"):** my 8-exemplar non-combat library was in
>   po/staged_content but the LIVE core file had 2 - the 6 new standoff/puzzle encounters were authored but NOT
>   LOADABLE. PROMOTED: merged into content/packs/core/rules/encounter_frame_kinds.json (8 live now, standoff 4 +
>   puzzle 4). They load.
> - **AEVI-247-AUTHOR (the per-kind voice - CCode's defaults were 'deliberately plain placeholders'):** authored
>   po/staged_content/encounter_kind_voice.json - each kind in its OWN register: puzzle = yielding-to-UNDERSTANDING
>   (opens for whoever read it right, not a foe tiring); chase = WIND/GROUND (the gap, breath giving out); standoff
>   outcomes = COMPOSURE/persuasion (certainty gives, not beaten - PERSUADED); static antagonist = HOLDS (made to
>   hold, made well) + YIELDS to comprehension, never fights. CCode merges resistLabel/degreeVoice/pressureLabel/
>   outcomes; voice only, mechanics unchanged. CI green.
> CCODE: merge the voice overlay onto engine.kinds/staticAntagonist. ERIK: the 4 SNG-247 judgment calls still his
> if any are design not voice (COMBAT_DIALS.md).

> ## [SNG-247 TIER 3+4 complete_pending_review - CCode, 2026-07-31] The static antagonist + the morph made visible (v1.8.320 `56c60898`, v1.8.321 `ebead0ae`) - **SNG-247 COMPLETE**
> **TIER 3 - THE STATIC ANTAGONIST.** A sealed door has no turn. Giving it a sheet that CHOOSES would mean inventing
> an agent (the SNG-246-A error class) - but `rollSide` produces a MARGIN, and **a fixed margin is exactly what a DC
> is**. So an unopposed thing never chooses (`opponentPolicy` returns early) and never rolls (`rollSide` returns its
> standing resistance). Honest under SNG-106: its resistance is a **NAMED contestMod** on the same self-summing
> breakdown, so a bind laid on the door still weakens it AND the player sees that it did. Returning early is the
> POINT - the scoring loop would give a door tactics it does not have, and the anti-metronome term would make it
> "vary" its response to being read, which is a lie about what a sealed thing is.
> A puzzle with a static sheet runs the contest engine, and its hint state rides ALONG rather than being replaced.
> Per Erik's per-kind weighting - *"a puzzle's sense step is the whole game"* - **winning the read buys a layer**.
> That is what stops it being a fight reskin. A puzzle with NO sheet keeps its classic path, so the two authored
> precursor puzzles are never stranded. Also centralised `contestSheetFor(def)`: the isSB derivation had been
> hand-copied at four sites, and a fifth divergence is how a kind ends up half-promoted.
> **TIER 4 - THE MORPH MADE VISIBLE.** Frames have chained since SNG-230 and **nothing ever said so** - the border
> silently changed colour and the player inferred that the rules had changed under them. Both chain points stamp
> `_morphedFrom`; the frame renders the transition in BOTH kinds' icons and words over a gradient from the old hue
> to the new: struck-through *the Contest* -> *the Chase*, with the reason.
> **AEVI: YOUR LIBRARY LANDED MID-BUILD AND I CHECKED IT AGAINST THE ROUTING.** STANDOFFS fine - only ONE of your
> four is `routing:"opposed"`, the rest are `routing:"challenge"` + `kind:"standoff"`, and the rule reads either.
> **PUZZLES WERE NOT.** All four are `kind:"puzzle"` + `routing:"challenge"`, which fell through to
> `synthesizeChallengeDef` and rendered as **HARD GROUND** - the toll-keeper gap again, one kind over, with four real
> encounters behind it. `synthesizePuzzleDef` now mints them properly, and their ENGAGE choice is mental/insight
> rather than physical/agility (you do not work a sealed thing by being fast). **Your stage BEATS become the hint
> ladder** - a beat is exactly "what you'd understand at this layer" - so the understanding survives without you
> authoring `hintTiers` twice. The new checks read your STAGED FILE directly, so they track it as you extend it.
> **>> PROMOTION NOT RUN <<** `po/staged_content/encounter_frame_kinds.json` has 8 exemplars;
> `content/packs/core/rules/encounter_frame_kinds.json` still has 2. That step is not mine - **until it runs, the six
> new encounters are authored but not loadable.**
> 15 new checks. npm test exit 0 (20 seams). Live on never-used port 8462 through the real modules: the door never
> chooses and never rolls, its resist is a named +20 on the breakdown, a winning sense buys a layer, both morph
> directions render with the right hues.
> **SNG-247 IS COMPLETE** - all four tiers. Five kinds, five colours, five exit rules; chase/standoff/puzzle now play
> as themselves on the one engine; **hazard stays the fast one** per Erik. Remaining: **AEVI-247-AUTHOR** (every
> default I shipped is deliberately plain so it reads as a placeholder) and the staged->live promotion.
> Results: po/results/20260731_SNG-247_Tier3-4_static_antagonist_and_visible_morph.md


> ## [DONE - new authoring] SNG-237/238 non-combat encounter library (Aevi, 2026-07-27)
> The standoff/puzzle kinds had framing copy (SNG-230) but only 2 SEED exemplars - the receipt formats
> (SNG-246 Fix D) and the stationary-talker roll gate (SNG-237 Fix C) had almost no real content to attach to.
> Authored a LIBRARY: 4 standoffs + 4 puzzles (from 2). STANDOFFS - the-grieving-warden (grief under a refusal),
> the-toll-of-names (a true name as the price), the-rival-claim (a contested claim settled on standing not blood)
> = the non-combat exchange that resolves on RESOLVE, exactly what a foe who won't fight needs. PUZZLES -
> the-stopped-mechanism (a scrambled precursor thing), the-warded-cache (a maker's ward), the-flooded-works (a
> water system worked in order against a rising clock). All grounded in the Valley's real fiction, matching the
> enc_the_sealed_door shape. CI green. Gives SNG-246's standoff/puzzle receipt formats + SNG-237 Fix C real
> encounters. CCODE: these are startEncounter-ready seeds for the standoff/puzzle paths.

> ## [SNG-247 TIER 2 complete_pending_review - CCode, 2026-07-31] Chase + standoff run the one contest engine (v1.8.319 `f681efa0`)
> **2a - STANDOFF BECOMES A REAL THING.** It had a FRAME_KINDS entry, an `encounterKind` mapping, an authored
> exemplar (`enc_the_toll_keeper`) AND an authored receipt format - and nothing ever minted one. A
> `routing:"opposed"` entry fell through to `synthesizeChallengeDef` and rendered as **hard ground**: a contest of
> wills shown as terrain. No new structural type was needed: **a DUEL is the shape of an opposed contest** - two
> wills, two rolls, a meter between them - and what is being CONTESTED is its **flavor** (blades / ground /
> resolve). `encounterKind` reads flavor on a duel; `synthesizeStandoffDef` mints one; the whole engine applies.
> Verified before changing: every `routing:"duel"` entry carries flavor "fight", so **no existing duel changes
> kind**. The load-bearing half is `outcomes.losingCostsHealth:false` - **a contest of wills cannot hurt you**;
> pressing one until someone draws is a MORPH into a fight, not a standoff that deals damage.
> **2b - A CHASE IS AN OPPOSED CONTEST, NOT A STAGE LADDER.** `chaseFromFight` mints a duel/chase carrying the
> fight's opponent **whole** (same person, same legs) and `beginChaseFromFight` synthesizes their sheet so it really
> runs on the engine. **Three things had to move with it, each of which would have been SILENTLY INERT:**
> (1) `frameMeter` counted STAGES - a duel-shaped chase has none, so the bar would have read 0/0 for the whole
> chase; the rule is now *if it runs on the contest engine, the contest meter IS the meter*, written once so it
> covers every kind promoted later. (2) `frameExits` wired chase buttons to `stage`/`abandon`, which a duel has
> neither of - the buttons would have fired at nothing (labels/meanings untouched; only plumbing). (3) the
> flee/caught gates read `type === "duel"`, which would have turned fleeing a CHASE into a chase-of-a-chase - they
> read **kind** now, and the drop-back also fires from `sbEnd` because a chase is lost by being RUN DOWN, not only
> by clicking away from it.
> **THE GAP THE TESTS FOUND (a hole my own Tier-1 ruling opened).** With `losingCostsHealth:false` the player could
> **never lose a chase** - health was the only player-exit (CCODE-39), so the engine would have run it forever.
> Added `playerBreaksAtPressure`, per kind. **A FIGHT deliberately has none**: health owns the player's exit there,
> and adding one would take that decision back from them.
> Four SNG-230 checks asserted the old staged shape - **updated, not deleted**; what they protect (the chase carries
> the pursuer, the chain works both ways, the frame stays a legibility layer) still holds and is still asserted.
> 15 new checks. npm test exit 0 (20 seams). Live on never-used port 8451 **through the real modules**: a fled fight
> becomes a `duel`/`chase` in skill_battle mode with a moving Ground-gained meter, exits wired to strike/flee, orange
> border; a toll-keeper mints a standoff in skill_battle mode with a Their-resolve meter and the teal border.
> **STILL OPEN:** Tier 3 (static antagonist for puzzle; hazard stays the fast one) - Tier 4 (the morph made VISIBLE:
> the chain works mechanically end to end, it just isn't announced - the border should go red->amber and say so) -
> and **AEVI-247-AUTHOR**, whose chase/standoff defaults are all deliberately plain so they read as placeholders.
> Results: po/results/20260731_SNG-247_Tier2_chase_and_standoff_on_the_engine.md


> ## [AEVI-247-AUTHOR open - for Aevi, raised by CCode 2026-07-31] The per-kind voice + tuning behind SNG-247
> **Nothing here blocks CCode.** Tiers 2-4 ship with code-owned DEFAULTS for every field below, and every default is
> deliberately plain so it reads as a placeholder rather than a decision. This is the judgment-heavy half: the voice,
> and the choices a simulation cannot settle. Author into
> `content/packs/core/rules/skill_battle_system.json` -> `engine.kinds.<kind>` (the block exists, `fight` is the
> worked example, and `dialDiscipline` in it explains what NOT to author).
> **1. PRESSURE PROSE, per kind, per side** (`pressureLabel: {player, opponent}`). Two clauses, not one phrase with
> the subject swapped - "they open the gap" and "you lose ground" are different sentences. `{them}` interpolates the
> other side's name. Needed for **chase, standoff, puzzle**. This is the line the player reads every time the meter
> fills, so it carries the whole feel of what that kind of losing IS.
> **2. OUTCOME WORDS** (`outcomes: {playerPrevails, playerOvercome}`). Today every win says *"You prevail - X breaks"*
> because the only kind was a fight. A standoff does not "break" and a chase does not "fall". CCode's defaults are
> literal and flat on purpose.
> **3. THE COST CURRENCY** (`playerLoss` / `opponentLoss` as `{health, energy}`) - **a ruling, not a number.** CCode's
> read: a chase takes WIND (energy, no health), a standoff takes COMPOSURE and **cannot hurt you at all** (health 0
> always), a puzzle takes only the effort of trying again. If a standoff should be able to cost blood - a toll-keeper
> who draws - say so and it becomes a MORPH into a fight instead, which is a different (better) mechanic.
> **4. WHICH STEP CARRIES THE WEIGHT, per kind** - the anti-sameness dial, and **the most important item here.** If
> all five kinds become the same five-step turn, the variety is cosmetic and every encounter just got longer. CCode's
> read, for you to overrule: a **puzzle's** sense step is the whole game (insight IS the meter); a **chase's** is
> near-worthless (no time to read); a **standoff's** payoff is the BONUS action (where reading them cashes out); a
> **fight** uses all three; a **hazard** stays the fast one (Erik's ruling - a 3-stage cliff as three five-step turns
> is worse pacing, not better).
> **5. WHAT `threat` MEANS FOR A NON-VIOLENT ANTAGONIST.** A toll-keeper's threat is RESOLVE and a pursuer's is
> ENDURANCE, but both currently synthesize a sheet full of strike crafts via `synthesizeOpponentSheet`. Either author
> `opponent.skills[]` on the standoff/chase exemplars (the authored path already overrides synthesis), or give
> `opponentSheetSynthesis` a per-kind craft vocabulary.
> **6. CARRIED FROM CCODE-43:** a thrown item still resolves as a plain tier-2 strike - acid and a rock are identical.
> Wants a `combat` block on item content. Same authoring pass, same file family.
> **Context:** po/results/20260731_SNG-247_Tier0-1_kind_colours_and_exit_rule.md - the survey, the opposed/unopposed
> split, and why the fight deliberately authors no costs.


> ## [SNG-247 TIER 0+1 complete_pending_review - CCode, 2026-07-31] The frame knows what kind of thing it is (v1.8.318 `6c34c904`)
> Erik: *"morph the other encounter types similarly as the fight... but put a different colour border around them -
> a chase could be yellow or orange, a puzzle blue or purple. Let's think this through."* Thought through, Tiers 0
> and 1 built, **deliberate stop for review** before four kinds get built on the contract.
> **THE SURVEY CHANGED THE COST ESTIMATE.** (1) The colour hook `enc-frame-<kind>` has been emitted on every frame
> since SNG-230 and had **NO CSS rules at all** - built, then never used - so a chase, a sealed door and a knife
> fight all rendered fight-red. (2) `mode:"skill_battle"` is set in exactly ONE place. (3) `battleRound` was already
> kind-agnostic except for **one** block. (4) **`standoff` is a FIFTH inert path** - FRAME_KINDS has it,
> `encounterKind` maps it, Aevi authored an exemplar AND a receipt-line format, and **nothing ever mints one**.
> **THE SPLIT THAT SHAPES TIERS 2-3.** Chase and standoff are genuinely OPPOSED - someone with intent and their own
> crafts - so battleRound is already right for them (~80% reuse). Hazard and puzzle are UNOPPOSED; giving them an
> opponent sheet means inventing an agent (the SNG-246-A error class). But `rollSide` produces a margin and a
> zero-variance sheet **is** a DC - so a static antagonist is an honest mapping, not a fudge.
> **THE RISK WORTH NAMING:** if all five kinds become the same five-step panel, the variety is cosmetic and every
> encounter just got longer. The answer is that each kind differs in **which step carries the weight** - a puzzle's
> sense step is the whole game, a chase's is near-worthless (no time to read), a standoff's payoff is the bonus
> action. Content dial, not code, and it is what makes this a morph rather than a reskin.
> **TIER 0:** `--enc-hue` on both the play wrapper and the frame; border, meter, takeover glow, contest panel and
> receipt all read the one variable. fight `#c05b4d` / chase `#e07b39` / hazard `#6f7b8c` / puzzle `#7c6bd4` /
> standoff `#5aa8a0`. Colour is a THIRD channel - the icon and title already name the kind.
> **TIER 1:** the pressure block reads `sb.kinds[kind]` - what a tick costs each side, how many break them, what it
> is CALLED (per-side clauses, since "they open the gap" and "you lose ground" are not one sentence with the subject
> swapped). The fight authors **no costs**: they keep flowing from `momentum.pressure` so those COMBAT_DIALS knobs
> stay live rather than being shadowed by a duplicate. `kind` comes from `encounterKind(def)` - the same function
> the frame uses - and is **DERIVED** in skillBattleRound, never forwarded, because that wrapper has silently eaten
> a forwarded option twice. **Seam #20** declared.
> 9 new checks; the load-bearing one is that kind defaults to fight AND an unknown kind falls back to it with the
> numbers **bit-identical** - lifting a rule into content is only safe if it provably didn't move the thing. Plus a
> gate that every FRAME_KINDS kind has a hue on both hooks, so no new kind ships colourless the way this one did.
> npm test exit 0 (20 seams). Live on never-used port 8447: all five hues resolve on frame AND panel, a kindless
> frame falls back to fight-red, the gold quest-decision strip keeps its colour inside a live chase.
> **NOT BUILT (awaiting review):** Tier 2 chase+standoff onto the engine (**needs `type:"standoff"` to exist
> first**; Aevi's receipt content for both is already authored and waiting) - Tier 3 the static antagonist for
> puzzle (**hazard stays the fast one** per Erik: a 3-stage cliff as three five-step turns is worse pacing) -
> Tier 4 the morph made VISIBLE (chaseFromFight already fires on a flee; it just isn't announced - the border should
> go red->amber and say so).
> Results: po/results/20260731_SNG-247_Tier0-1_kind_colours_and_exit_rule.md


> ## [SNG-246 FIX A complete_pending_review - CCode, 2026-07-31] Engine-enforced fight entry (v1.8.317 `c72223fd`)
> Erik ruled **(c) with (b) as the fallback**. Built exactly that. This closes the OLDEST open ticket in the combat
> line - and the root of his very first complaint at CCODE-33: *"one action ended it in pure prose."*
> **THE GAP:** a committed killing blow resolved as ONE prose roll, because entry into a structured fight depended
> on the GM remembering rule 18.
> **(c) THE ENGINE RESOLVES THE TARGET THE PLAYER CHOSE.** New pure `harmTargetFor(action, ctx)` in `intent.js`:
> an explicit `targetNpcId`/`targetName` on the choice, else a **registered** npc whose name or alias appears in the
> choice label or the player's own words (the same matching `personDestination` uses, so both agree on what a person
> is). When it resolves, `onChoice` calls `escalateToFight`: the engine **MINTS** a duel against that named person
> (threat from the registry when known, else this place's danger) and **ENTERS it as a real skill battle**. No
> prose-only fight, no waiting on the GM.
> **(b) WHEN NO TARGET RESOLVES, IT REFUSES TO INVENT ONE.** `harmTargetFor` returns **null** rather than guessing -
> a guessed opponent is the same class as `seam_travelTo_is_place`, where a PERSON got minted as a travel
> destination. On null the engine sets `pendingFightFraming` and the next GM turn carries a HARD directive: *"the
> player has COMMITTED to violence... you MUST present it as a bounded FIGHT and emit `newEncounter` for the person
> they are attacking (name them from what you have already narrated)."* The engine still decides a fight must be
> structured; it only borrows the GM's knowledge of who is standing there.
> **THE GATE CAUGHT MY WIRING, AGAIN.** The wiring audit failed the first run - *"fightFramingDetail: consumed but
> NEVER provided - can never land."* I had threaded the key into `gm.js` and `app.js` but not registered it in
> `gm_registry.js`, so it would have been **silently dead**. Now registered with its full `reachedBy`. **That is the
> third inert path the audit has caught this session** (the others: `phaseDenied` with no consumer, and the
> `skillBattleRound` option drop). It is worth its weight.
> 5 new checks; the load-bearing one is that an unresolvable target returns NULL - the property the whole design
> rests on. npm test exit 0 (19 seams, rawProseCaps 63). Boot verified on never-used port 8431, no console errors.
> **SNG-246 IS NOW FULLY CLOSED** - A, B, C and D all shipped. **Fix C** was completed across the session rather than
> as one ticket: `frameExits` surfaces defeat/flee/fail, CCODE-42 gave the finish condition honest situational odds,
> and CCODE-39 made energy a state with real exits. The only remnant is the fight->chase morph being *visible*,
> which is cosmetic and small.
> **WHAT IS LEFT, HONESTLY:** nothing structural. The whole combat line has now been built without Erik ever playing
> it with a live API key - the two GM calls, the whole-fight narration and the Haiku quick beat are all still
> theoretical. **The next useful thing is his combat log, not more code.**
> Results: po/results/20260731_SNG-246-FixA_engine_enforced_fight_entry.md


> ## [CCODE-48 complete_pending_review + SNG-246 Fix A NEEDS A RULING - CCode, 2026-07-31] The debris cleaned (v1.8.316 `13e29e46`)
> Erik: *"clean all that up and do the fixes."* Three cleanups done. All three were **"advertised but inert"** - the
> worst class, because the content AND the tests both claimed the feature existed.
> **1. An invented verb, and a counterplay that could never fire.** CCODE-41 added `conceal_deep` to
> `persistentEffects.byFunction`. It is **not one of the 24 canonical verbs - I made it up** - so no craft could ever
> carry it and "senses blinded" could never land. I "fixed" it once mid-session on a wrong theory, the fix was lost
> in a revert, **and my own status report then repeated the claim that it was fixed.** Now on `deceive` (a real verb),
> invented key deleted, and a new test asserts **every** key in byFunction is a real verb - so the class cannot recur.
> **2. `phaseDenied` had ZERO consumers.** I built the helper, exported it, authored its content and wrote three
> tests - and never called it. The blinding counterplay was decorative. Now consumed in `skillBattlePanel`: a blinded
> fighter is skipped past SENSE with a visible **"Blinded - your senses are shut this turn"** bar. *The wiring
> audit's "NEW export with no consumer" note had been listing it every run; I read past it because tests were green.*
> **3. A round is a TURN, not a step.** Action and bonus each advanced the counter, so a three-turn fight read as
> round 6. Only the step that ENDS the turn advances it now.
> npm test exit 0 (19 seams, rawProseCaps 63) + 3 new checks. Boot verified on never-used port 8424, no console errors.
> **SNG-246 FIX A - NOT BUILT, AND I NEED A RULING.** The ticket is "a committed fight goes structured by ENGINE,
> not the GM's memory of rule 18." The clean hook exists: `harmGateFor` already fires when a player commits a
> lethal-rung craft. **But it does not name a TARGET** - it only knows the craft can kill. So minting a duel from a
> committed harm action means the engine inventing *who* is being fought - exactly the guess that produces phantom
> entities (cf. `seam_travelTo_is_place`, where a person got minted as a destination). **Three options:**
> **(a)** mint a duel against the most recently-met NPC - cheap, wrong whenever the scene holds more than one person;
> **(b)** the engine sets a HARD directive next turn ("you MUST frame this as a bounded encounter carrying
> encounterId") - reuses the proven `encounterOfferDetail` machinery and invents nothing, but is a directive rather
> than true enforcement; **(c)** extend `harmGateFor` to carry the target the player actually chose - the right fix,
> and the largest. **My recommendation: (c), with (b) as the fallback** when a target still cannot be resolved.
> I did not guess at it: having just spent this ticket correcting three things I had previously reported as done,
> inventing an opponent-resolution rule at the tail of a long session is the wrong instinct.
> **SNG-246 Fix C** is now largely covered - `frameExits` surfaces defeat/flee/fail and CCODE-42 gave finish
> conditions honest situational odds. What remains is the fight->chase morph being *visible*, which is small.
> Results: po/results/20260731_CCODE-48_cleanup.md


> ## [CCODE-43 + CCODE-47 complete_pending_review — CCode, 2026-07-31] Items are functional in a fight · waiting is visible · a Haiku beat before the big telling (v1.8.314 `9aff593f`, v1.8.315 `f81f4a5c`)
> **CCODE-47 — waiting is visible.** Erik: *"locking in the sense choice didn't indicate we were waiting for the
> results.... might want to have it be obvious somehow."* A dashed banner with a spinner names what is in flight —
> **"Reading the aggressor…" / "Resolving the turn…" / "Telling the turn…"** — and every control is hard-disabled
> while a call is out, so a second click can never double-resolve a turn.
> **And a fast Haiku beat before the big narration.** Erik: *"you could have haiku do a short narration of the
> different skills each is using to describe the turn - and indicate the narration is processing - then show the big
> narrative result."* On Execute a HAIKU call (new `combat-quick-beat` task, 160 tokens) writes two sentences naming
> ONLY the clash of techniques, landing in ~1s while the banner still reads "Telling the turn…"; the flagship
> narration then replaces it. It is a **GRACE, not a gate** — try/catch, and a failure leaves the turn untouched.
> *(The quick beat itself needs an API key, so Erik's next real fight is its first true exercise; the code path and
> its failure path are what is verified.)*
> **CCODE-43 — INVENTORY IS FUNCTIONAL.** Erik: *"do I use my dagger, or my axe... my metal shield or my energy
> shield? Inventory becomes functional - throw a chemical at them or drink a potion."* Two doors, both reading
> fields items **already carry** (`bonusTags`, `effects`) — no content needed re-authoring.
> **(1) WIELDED:** an item's tags map to battle functions (blade→strike, axe→break+strike, shield→shield+ward,
> focus→reveal/foresee/empower, rope→bind…), adding a **named line** to the roll (*"wielding Iron Dagger + Bearded
> Axe"*), capped so a full pack never out-weighs a craft. That is what makes dagger-vs-axe a REAL choice: they suit
> different verbs, and you can see which. **(2) USED:** a consumable is a MOVE — drink to restore, throw to harm.
> Item moves appear in ACTION/BONUS and are filtered out of SENSE automatically (you cannot drink a potion as a
> read). **Drinking is the honest answer to being spent** (CCODE-39): your crafts have gone quiet, a flask has not.
> A consumable gives **no passive wield bonus** — a flask you have not thrown is not helping you swing.
> **Two bugs the live walkthrough caught:** the acid flask was counting toward the wielded STRIKE bonus (its "thrown"
> tag maps to strike) — consumables are now excluded from `wieldBonusFor`; and a drink was **uncapped**, able to push
> energy past `maxEnergy` — now clamped.
> npm test exit 0 (19 seams, rawProseCaps 63). Live on never-used ports 8422/8423: the waiting banner was caught by a
> MutationObserver (`{waiting:true, label:"Reading the aggressor…", spinner:true}` — the window is milliseconds
> without a key); with a real kit, wield@strike = "Iron Dagger + Bearded Axe" (+8 capped), wield@shield = "Round
> Shield" (+4), wield@reveal = null; item moves showed in ACTION and not in SENSE; drinking the Waterskin restored
> energy and REMOVED it from the pack. No console errors.
> **ERIK'S LIST IS NOW CLEAR** — 42 and 43 were the last two. **Dials:** `po/COMBAT_DIALS.md` (30 knobs, live values,
> regenerate with `python scripts/gen_combat_dials.py`); the new item knobs are `items.tagFunctions`,
> `items.wieldBonusPerItem/Cap`, `items.throwTier`, `items.maxItemMovesShown`.
> **NOT DONE / worth a look:** a thrown item resolves as a plain tier-2 strike — it does not yet carry item-specific
> harm (acid vs a rock should differ). That wants a `combat` block on item content, which is an authoring pass
> (Aevi), not code.
> Results: po/results/20260731_CCODE-43-47_items_and_waiting.md


> ## [CCODE-46 complete_pending_review — CCode, 2026-07-31] The sense step is a real sense · moves are PRICED · finisher is a tag (v1.8.312 `6fae08bf`)
> Erik's four asks from the preview screenshot, all built.
> **1. The SENSE step only allows senses.** *"During the sense action, you shouldn't be able to use clearly attacks
> during the sense round."* Now lists only sense-capable crafts (reveal/foresee/track, from content) **plus three
> GENERIC ATTRIBUTE SENSES** — *"a wits sense could find a solution that a Reason based sense might miss"*:
> **Size them up (Wits)** finds the opening/the trick/what they aren't guarding · **Reason it out (Reason)** finds
> the pattern and where it breaks · **Read them (Insight)** finds intent and resolve. You can always LOOK, craft or
> no craft — and the attribute you look WITH changes what you find.
> **2. The read now PAYS, and the fogged math shows.** *"I don't see it giving me the fogged math at all - even
> though I did a read step."* **Root cause:** the fog gate was `sbLastRound?.opponent && st.round > 1`, but the
> sense step deliberately no longer advances the round — **so that gate never opened and a read bought the player
> nothing they could see.** Fog now reads a receipt PERSISTED on encounter state, and a read buys the scouting tier.
> Per *"Even no success might give you some idea of what you COULD read"*: **fail** names what you would have seen ·
> **partial** a glimpse · **success** *"they favour strike. Pick a craft that answers it."* · **crit** *"they lean on
> <craft>, and their guard opens when they commit. Counter that function and the exchange is yours."*
> **3. Every move is PRICED, and the confidence is itself fogged.** *"If the enemy uses umbracraft then I might not
> be able to tell certain success chances as well - unless of course i have a radiant skill."* Each move shows an
> estimated chance to **win the exchange** — a real opposed calculation (closed form: two d100s, so the difference is
> triangular), including matchup and standing effects. The **confidence** is what the fog gates: unread → *"you
> cannot price this yet"*; a read buys a band, then a rough number, then the number. **Holding a counter-craft buys
> confidence too** — light finds shadow. Low confidence shows a BAND, never a fabricated number.
> **4. Finish-it is a TAG on the move, not a button.** A craft that CAN kill (harmRung lethal/atrocity) carries the
> potential from the start; an ordinary harm craft **earns** it at tier 3 and shows **"⚡ at T3"** until then. The
> separate ⚡ Finish it button is gone.
> npm test exit 0 (19 seams, rawProseCaps 63). Live on **never-used ports 8416/8417**: sense step lists 6 sense-only
> moves incl. all three attribute senses; odds go *"you cannot price this yet"* → **"likely (~70%)"** after the read;
> the crit read named the tendency and the counter; "⚡ at T3" renders. No console errors.
> **DIALS:** `senseStep.senseFunctions/genericSenses`, `oddsPreview.confidenceByFogTier/counterCraftBonus/bands`,
> `finisher.finisherTierAt/alwaysAtHarmRung`.
> **STILL UNBUILT:** CCODE-42 (Finish-it *odds* — Cut-the-Thread as an opposed roll, near-certain vs a run-down foe
> when you hold momentum; the TAG is done, the situational odds are not) and CCODE-43 (items in combat).
> Results: po/results/20260731_CCODE-46_sense_odds_finisher.md


> ## [CCODE-45 complete_pending_review — CCode, 2026-07-31] THE TURN IS PLAYABLE + CCODE-44 rebuilt + the bonus dial MEASURED (v1.8.307 `b2fa0a29`, v1.8.310 `0036d023`)
> Erik: *"do all of this."* All four shipped.
> **1. THE BONUS DIAL, MEASURED — and my guess was wrong.** I proposed crit-only in the spec and flagged it for
> simulation. 1200 fights/config on the real turn shape: **crit-only left 20% of peer fights UNRESOLVED** at 30
> turns (median 21) — too stingy to close a fight. **crit + success**: median 13 turns, 0% unresolved, 82% win /
> 18% down. Set to crit+success. The sim also answered the design's core question — **does sensing pay? Yes:**
> senses-every-turn 71% win vs never-senses 53%.
> **2. THE TURN IS PLAYABLE.** sense (optional) → [Proceed] → **GM call #1** narrates the read → **the step LOCKS**
> → action → bonus (if earned) → **review (Edit or Execute)** → Execute → **GM call #2** narrates the whole turn →
> next turn. Each step is a SELECTION step (*"The action selections need to be just that"*), with **its own
> free-text field** riding into that step's prompt. **Braiding is now just selecting a second craft** — same
> mechanics, none of the ⋈ modality Erik called unintuitive.
> **3. CCODE-44 REBUILT** (the pre-fight appraisal I wrongly reverted — it was never broken): relative craft,
> relative prowess, disposition, threat band and a counsel line, above stand-and-fight / back-away.
> **TWO REAL BUGS THE LIVE WALKTHROUGH CAUGHT THAT TESTS DID NOT:**
> **(a) THE SEAM, AGAIN.** `skillBattleRound` hand-builds its `battleRound` call and silently dropped
> `phase`/`tickEffects`/`setupBonus` — **the SENSE step ran as a full ACTION round**, moving momentum and costing
> the exchange, defeating the whole phase. **Second time this wrapper has eaten an option** (CCODE-35 was
> `effects`), so it is now a DECLARED seam — `seam_battle_round_options` (19 seams) + 3 sim checks.
> **(b) WRITE-THROUGH.** `activeEnc()` returns a **fresh wrapper each call**, so `enc.state = rr.state` wrote to a
> throwaway and the turn's resolved state (effects, energy, pressure) was **discarded**. `sbDeclare` had always done
> it correctly; my new code did not. Fixed in five sites.
> Neither was reachable from unit tests — the first needed the real wrapper, the second the real character object.
> **This is why the live walkthrough is not optional**, and it is the discipline I committed to after today's miss.
> **Live-verified on never-used ports** (8412/8415), full turn walked: sense costs its craft (100→95e) but **round
> and momentum DO NOT move** — sensing is no longer a free hit for them; setupBonus +5; the bonus step appears;
> tracker reads "◎ Sense • locked"; braid selects as 1 / 2; Execute → energy 95→85, hp 30→27, momentum 0→−3.5,
> **effects tick ONCE across the turn** (2r→1r), practice recorded, turn resets. No console errors. npm test exit 0.
> **NEXT (my read):** CCODE-42 (Finish-it gated on a finishing-potential craft, with honest situational odds) and
> CCODE-43 (items in combat) are both still unbuilt and both independent. **Erik's dials to play with:**
> `turn.setupBonusScale/Max`, `turn.bonusOnDegrees`, `weave.energyMultiplier`, `momentum.pressure.breakAtPressure`.
> Results: po/results/20260731_CCODE-45_the_turn_playable.md


> ## [CCODE-45 complete_pending_review — CCode, 2026-07-31] THE TURN spec'd in full + the engine layer (v1.8.306 `dce2c7ed`)
> Erik ruled on the last two questions — **two GM calls per turn**, and **the sense step LOCKS once narrated** (no
> editing back) — so the turn design is complete. **`po/SPEC_CCODE-45_the_turn.md` SUPERSEDES SPEC_CCODE-41**: his
> turn-flow message reframes the UI and folds braiding in, so the ⋈ arm-then-pick gesture is **replaced, not
> patched** (*"The weave mechanic is not intuitive… we need to update some of the mechanics so it's simple to
> understand"*). **THE TURN:** sense (optional · costs the ability used · locked after GM call #1) → action → bonus
> (only if the sense earned it; a FULL action) → **Edit or Execute** → GM call #2 narrates the whole turn. Effects
> tick ONCE, at the end.
> **BUILT: the engine layer, deliberately ADDITIVE and INERT until the UI uses it** — nothing in the live game
> changes on this commit. `battleRound` gains `phase` / `tickEffects` / `setupBonus`, all defaulting to today's
> behaviour so every existing caller is byte-identical (there is an explicit backward-compat test). A **sense step
> does not move momentum, apply pressure, or advance the round counter** — that is the fix for *"sensing gives the
> opponent a free hit."* A sense returns `setupBonus` + `bonusEarned`, and the bonus reaches the ACTION roll as a
> **named line** ("you read them first" / "they read you first"), never a hidden fudge. 11 new sim checks.
> **MY FIVE ENGINEERING CALLS are named as mine in the spec and are ALL content dials**, so none is a decision Erik
> can't reverse without code: `senseMovesMomentum: false` (else momentum swings 3×/turn and the measured CCODE-38
> pacing is void), the setup-bonus scale/cap, the bonus granted on a **crit sense only** (a full extra action is a
> large grant — **to be simulated before final tuning**, as CCODE-34/38 were), and the opponent getting the same rule.
> **NEXT (build order in the spec):** simulate the bonus threshold → the stepped UI (per-step free text, braid as a
> choice) → the two GM calls.
> **⚠ PROCESS NOTE — I got this wrong today and it cost real time.** I shipped v1.8.303/.304/.305 on `npm test`
> alone, then hit a boot failure and misdiagnosed it three times: blamed a stale module cache, then an invalid verb
> I'd invented (`conceal_deep`), then CCODE-41 — and **reverted CCODE-44 (the pre-fight appraisal), which was
> working code**. The actual cause: the preview browser's ES-module cache is **cross-port**, so "use a fresh port"
> (my own standing note) is NOT sufficient — only a never-used port is. Proven: identical code failed on
> 8366/8367/8368/8369 and booted on 8411 and in a worktree. Every step from here gets a **live boot check on a
> never-used port before push**, not just green gates. **CCODE-44 is worth rebuilding — it was never broken.**
> Results: po/results/20260731_CCODE-45_the_turn_engine.md


> ## [CCODE-40 complete_pending_review + CCODE-41 SPEC READY — CCode, 2026-07-31] Stacks compare PRE-clamp; structured rounds specified (v1.8.304 `35be2fd0`, v1.8.305 `68aaff6e`)
> **CCODE-40 — Erik found a real bug with exact arithmetic:** *"All of the bonuses and penalties need to be stacked
> and compared PRIOR to a clamp. If I have +35 due to abilities and skills and the enemy has +25 but has also landed
> a bind on me (-15) the net difference would be (-5) to my roll."* `rollSide` computed `margin = chance - roll` from
> the **CLAMPED** chance, so once a capable character hit the 95% ceiling **every further term was silently
> discarded** — a bind laid on them, a woven craft, momentum, a standing guard — and a contest between two strong
> sides read as a tie of two 95s. (I saw "clamped (from 98)" in the live popovers earlier and did not follow it
> through.) **Fix keeps both truths:** DEGREE still uses the clamped chance (the ceiling exists so your own action
> can always fail); the CONTEST margin now uses the RAW pre-clamp stack. Surfaced in the receipt when the ceiling
> bites. **This retroactively makes CCODE-35 effects and the CCODE-37 weave bonus matter for high-level characters —
> the exact players for whom they did nothing.** 7 new checks; one of my own assertions failed first and was wrong,
> not the code.
> **CCODE-41 — Erik answered all four open questions, so structured rounds are now FULLY SPECIFIED.** Captured
> verbatim in `po/SPEC_CCODE-41_structured_rounds.md`: (1) the setup phase **carries the cost of the ability used**;
> (2) you **can skip setup** — to conserve energy, if you have no sense skill, or **if an opposing craft has blinded
> you to your sense skills**; (3) the **opponent gets a setup phase too**; (4) a bonus action is a **FULL action —
> "it's the payoff."** Plus: a **braid that senses AND damages is viable as a setup with BOTH effects landing**;
> effects tick **per round**, not per sub-action; and the **GM narrates the whole round** (sense + main + bonus, both
> sides, tallied) with the net result setting up the next — which **supersedes CCODE-36's whole-fight-at-the-end**
> for structured rounds.
> **TWO RULINGS I NEED BEFORE BUILDING (mine, in the spec):** (a) does the SETUP exchange move momentum? I propose
> **purely preparatory** — otherwise momentum swings up to 3× per round and the just-measured CCODE-38 pressure
> pacing is void. (b) the **bonus-action grant threshold** (crit-success only, or any success?) is the balance lever;
> I'll simulate it the way CCODE-34/38 were measured rather than guess.
> **BUILT NOW — phase denial**, the one self-contained piece: an effect may carry `deniesPhase`, and
> `phaseDenied(effects, side, phase)` reads it; content declares `conceal_deep` → "senses blinded" with
> `deniesPhase: "setup"`. This is the counterplay to a setup-heavy build and why skipping setup must be first-class.
> The load-bearing test: `deniesPhase` must be COPIED from the content def onto the LIVE effect or the counterplay
> is inert while still advertised in content — same producer/consumer class as `seam_battle_effects_roundtrip`.
> **ALSO QUEUED as specs:** **CCODE-42** — *"the Finish button isn't a player choice unless you have a finishing
> potential move"*; Hunter's Strike has the potential but low odds **unless damage would exceed the foe's HP, then it
> IS a finishing move**; Cut the Thread is an **opposed roll** — ~50/50 vs a healthy equal foe, **near-certain vs a
> run-down one when you hold momentum**, low with momentum against you. **CCODE-43** — items in combat (dagger vs
> axe, metal vs energy shield, throw a chemical, drink a potion); independent of round structure, and `equipmentBonus`
> already exists for normal play — combat simply doesn't read it.
> npm test exit 0 (all gates, rawProseCaps 63, 18 seams).
> Results: po/results/20260731_CCODE-40-41_preclamp_stacks_and_round_spec.md


> ## [CCODE-39 complete_pending_review — CCode, 2026-07-31] Energy is a STATE, not a verdict + Erik's round-restructure SCOPED (v1.8.303 `b31ca93c`)
> Erik sent a substantial combat-design message mid-session. I built the one piece that was contained and
> unambiguous, and **scoped the rest rather than half-building a redesign while he's playtesting.**
> **BUILT — energy no longer ends a fight.** *"If energy is depleted it shouldn't stop a fight cold… that is a yield
> option, but people can fight on with simple strikes and defends, or use an item to restore energy."* Exhaustion no
> longer resolves the contest for either side. A spent side's CRAFTS stop answering (`degradeIfSpent` → a guard stays
> a guard, everything else becomes a bare strike, tier 1, conserve, no weave) — you fight on, without your crafts.
> The state is surfaced with **Yield named as a choice**, not an ending the engine imposed; the opponent's spent
> state shows too. The old SNG-098 "runs out of energy → forfeits" test was **rewritten, not deleted**.
> **Measured the risk of removing an exit:** 1200 fights/threat-level, 60-round cap → **0% unresolved**, fights still
> terminate. Mix is now opponent_yielded 76-84% / player_down (HEALTH) 16-24%. **COST FLAGGED: the peer-fight p90
> tail grew ~20 → ~41 rounds** (median 14-16). One-number lever if it annoys: `breakAtPressure` 2 → 1.
> **NOT BUILT — needs Erik's/Aevi's call.** The rest is a real redesign of the round:
> **(A) Structured rounds** (setup phase → action phase, so *"sensing doesn't give the opponent a free hit"*) — the
> biggest and best change; fixes a genuine unfairness. Changes `battleRound`'s signature and every caller, needs an
> opponent setup phase too, and makes the panel two-stage. Erik's *"sustaining effects don't tick until the full
> round's actions are complete"* becomes a one-liner once a round has a defined end.
> **(B) Bonus action on a successful setup** — cheap and in-spirit, but depends on (A).
> **(C) Items in combat** (dagger vs axe, metal vs energy shield, throw a chemical, drink a potion) — INDEPENDENT of
> A/B, makes inventory functional, and is the honest answer to being spent. `equipmentBonus` already exists for
> normal play; combat just doesn't read it. Needs a small content pass for combat fields on items.
> **RECOMMENDATION: A → B → C, and A DESERVES A SPEC before I build it** — it reshapes every round and I'd rather
> implement Erik's intent than my guess. **Four questions I need answered for (A):** 1) does the setup phase cost
> energy or is it free? 2) can you skip setup and go straight to an action? 3) does the OPPONENT get a setup phase
> (I think yes, or the player gains free tempo every round)? 4) is a bonus action a full action or a restricted set?
> **C (items) I can build with no spec — say the word and I'll take it next while you decide on A.**
> Results: po/results/20260731_CCODE-39_energy_is_a_state_plus_round_structure_scope.md


> ## [CCODE-38 complete_pending_review — CCode, 2026-07-31] MOMENTUM IS A MODIFIER, NOT THE EXIT + 4 playtest fixes (v1.8.302 `c7ac0351`)
> Erik, decisive: *"The momentum mechanic is ending fights it shouldn't… i took one hit - still tons of energy and
> health… momentum should be a modifier mechanic not the primary exit encounter metric."* He was at **37/45 hp and
> 90/115 energy** and the fight ended. He's right — and CCODE-34 was treating the symptom (how fast the meter
> filled); the disease was the meter being an exit at all.
> **Momentum now does two things and ends nothing:** (a) **MODIFIER** — ahead carries a named roll bonus ("momentum
> (you have the advantage) +5"), behind carries the penalty, capped; zero adds no line. (b) **PRESSURE** — filling
> the meter is an EVENT, not a death: the dominated side takes real attrition (player → health, opponent →
> energy/composure), a counter ticks, and the meter RESETS to 35% — driven back, still in it. A crushing blow is
> heavy pressure too. **A fight now ends only on what the player can feel and manage:** health gone, energy gone,
> the opponent breaking after breakAtPressure, mutual exhaustion, or a deliberate exit.
> **Re-measured on the REAL round path** (rebuilt the harness around `skillBattleRound` with player health tracked
> as app.js does — the CCODE-34 harness never modelled hp, which is now a live exit). 1500 fights/dial: **no
> configuration ends a fight by a meter any more.** Chose meterMax 10 / breakAtPressure 2 / oppEnergyLoss 22 —
> vs a peer median 15 rounds with a genuine **32% player-loss rate**; vs weak foes 3-5. Shorter dials existed but
> pushed the player to 90%+ wins; **danger beat brevity**, and the sim's player is deliberately dumb (no
> effects/weave/intensity) so real fights run shorter than that floor.
> **2. A craft now appears under EVERY function it has.** Erik: *"I can use harmonic voice to mend… will it show up
> in the mend options?"* It couldn't — `playerBattleSkills` read `functions[0]` only, so Harmonic Voice
> (command+empower+**heal**) was hidden from mend, as was every secondary use of every multi-function craft.
> **Answering his rank guess directly: there is NO rank gate in the data — all three functions are available now.**
> **3. The opponent is not a metronome.** *"they seem to always just strike."* The policy took `skills[0]` unless a
> tendency was known, and that's a strike on nearly every synthesized sheet. Options are now SCORED (matchup +
> situational lean + anti-repetition, round-varying tiebreak), still fully DETERMINISTIC. Live: strike/guard/strike/
> guard/guard/strike.
> **4. Collapsible move categories** (fold state persists across round re-renders) **+ Loki's backfill** (authorised):
> his ledger was direct evidence of the CCODE-37 gap — `hunters_strike`, `the_false_target`, `umbracraft` all at
> ZERO uses while his own combat logs show him fighting with the first two. Credited those two with 8 uses (the
> rank-2 bar — the progress those fights earned and the ledger dropped). **`umbracraft` deliberately NOT credited:**
> no evidence, and inventing progress is worse than under-crediting.
> 9 new sim checks incl. Erik's exact scenario; the old "meter fills → fight ends" test was REWRITTEN to the new
> rule, not deleted. npm test exit 0. Live: momentum swung 3.2 → −3.5 → 6.1 → −9.5 → 5.1 against a cap of 10 and the
> fight CONTINUED; pressure ticked with hp 30→27→24; 13 rounds, ended on ENERGY.
> **FLAGGED — the p90 tail is still ~20 rounds vs a peer.** Median 15 is fine, the tail isn't. Cheapest lever is
> `breakAtPressure` (2 → 1), one number in content.
> **OPEN — "the engine's text could use some tweaking":** the one item I could NOT act on, because I couldn't pin it
> to a line. Erik: which phrasing grated — the receipt, the interaction clause, or the pressure lines?
> Results: po/results/20260731_CCODE-38_momentum_is_a_modifier.md


> ## [CCODE-36 + CCODE-37 complete_pending_review — CCode, 2026-07-31] Round rolls + whole-fight narration + BRAIDS IN COMBAT (v1.8.300 `30c1f337`, v1.8.301 `8071994b`)
> Three asks from Erik's playtest, all shipped.
> **1. "Let the player see the rolls and modifiers… a popup off of the action you chose."** Each round's receipt now
> carries its two rolls, opening the SAME breakdown popover normal play uses. Your math is always yours; THEIR math
> stays behind the existing fog gate ("their math is fogged — 👁 read them to see it"), which teaches the fog rather
> than hiding a number. Live proof also validated CCODE-35 in the UI: the popover showed `you have their measure
> (2 rounds) +3` as its own line AND `clamped (from 98)` — the exact clamp case the CCODE-35 test predicted.
> **2. "It didn't narrate the whole fight, just the last move."** Erik: *"if we're going to make the engine very fast
> and lite - like it is now, then we need to have the entire narration at the end."* Right trade. `sbDeclare` now
> accumulates a plain-language round-by-round record on the encounter state; `sbEnd` hands the GM the FULL transcript
> with an explicit instruction to narrate every round in order as one continuous scene ("the player watched this
> resolve as bare numbers; the prose is where they finally SEE it"). **Honest limit:** the prose needs an API key, so
> what's verified is the transcript (its input); Erik's next real fight exercises the narration.
> **3. BRAIDS IN COMBAT — and the gap underneath it.** *A skill-battle round NEVER recorded practice.* `recordUse`
> (the single counting site) was called only from the classic-choice path and the gambit runner — `sbDeclare` called
> it nowhere. Every craft used in a fight counted for NOTHING: no rank progress, no co-activations, no braid
> progress. Combat was invisible to the ledger — **that is the real reason braids never showed up there.** Fixed.
> Then the **⋈ weave**: arm any real craft, and the next craft you pick is woven in — the second craft is its own
> named roll line (`woven: Prism Sight +4`), **BOTH crafts' persistent effects land** (one turn, two things standing —
> the payoff), it costs energy for both (1.8×), and it records a CO-ACTIVATION so weaving a pairing enough times
> ripens it into a real minted braid at one craft's price. The arc: **weave by hand and pay double, until the braid
> makes it one move.** Dials are content (`engine.weave`). 6 new sim checks incl. the payoff, the price, that an
> unwoven round is byte-unchanged, and the full arc (weave × BRAID_RIPEN_AT → mintable). npm test exit 0.
> Live: `Sonic Resonance ⋈ Prism Sight` → co-activation recorded, both `uses` incremented, energy 100→91 (9e vs 5e),
> effects `opponent: bound −4 (2r)` AND `player: measure +3 (2r)`, receipt names the weave, popover shows the line.
> **AEVI/ERIK — weave dials untuned.** `bonusPerTier 2` (cap 8), `energyMultiplier 1.8`. The energy price is the
> load-bearing one: too cheap and weaving is always correct; too dear and it's never worth it.
> **AEVI — BACKFILL QUESTION:** existing characters fought many rounds that recorded no practice, so their ledgers
> under-count reality. `engine/backfill.js` already has a co-activation estimator — credit combat history, or leave
> it as "it starts counting now"? Erik's call.
> Results: po/results/20260731_CCODE-36-37_fight_legibility_and_braids_in_combat.md


> ## [CCODE-35 complete_pending_review — CCode, 2026-07-31] Persistent combat effects — a landed move leaves something standing (v1.8.299 `0687ec17`)
> Erik: *"Each action should produce something that could persist, such as raising a shield at the beginning, or
> gaining a sense/insight gives you bonuses to defense or striking."* Built. **The rule that makes it honest:** an
> effect is never a hidden fudge — it enters the next round's roll as a **named, signed contestMod on the SNG-106
> self-summing breakdown**, so `guard up +4` sits in the same math as the matchup and intensity terms. If it isn't in
> the breakdown, it isn't real. **Engine** (`skill_battle.js`, pure): `effectMods` (what standing effects contribute
> to a roll) · `effectFrom` (what a LANDED move leaves — a miss leaves nothing; partial at half value; a crit buys a
> round) · `tickEffects`/`addEffect` (expiry, same-kind refresh, per-side cap). An effect never modifies the round
> that created it. **Definitions are CONTENT** (`skill_battle_system.json` → `engine.persistentEffects`): 13 functions
> → `{kind,label,value,rounds,applies,target}`; `applies` = whenAttacked / whenAttacking / always; `target` = self
> (boon) / opponent (hindrance). Code owns when they land and expire; content owns every number.
> **The seam that would have killed it silently:** `skillBattleRound` rebuilds state field-by-field, so `effects` had
> to be named in BOTH the inbound literal and the outbound `s` — miss either and the panel advertises "guard up" while
> the roll never sees it (a feature that lies). Fixed both directions and **DECLARED** `seam_battle_effects_roundtrip`
> (ledger → 18 seams) so it's machine-checked forever.
> **Visible** in three places: panel chips ("on you / on them", exact signed value + rounds left), the receipt ("you
> gain guard up +4 for 2 rounds"), and the machine log (`effectsApplied` / `effectsLanded` / `effectsStanding` — this
> makes "why did that roll land?" answerable from a pasted log).
> **Also fixed:** 👁 "Read them" was declaring `shield`, so under the new system it would have left a raised GUARD —
> the opposite of Erik's ask. A read IS a reveal: it now declares `reveal`, leaves an INSIGHT, and the matchup term
> becomes honest. **10 new sim checks**, incl. the load-bearing "a standing guard REACHES THE ROLL". That test caught
> a real subtlety: an effect can push a strong character past the d100 ceiling, so the invariant is
> `sum(components) === (clampedFrom ?? total)` and the breakdown must DISCLOSE the clamp — both now asserted.
> npm test exit 0. Live: a read landed insight +3 (2r) and did NOT modify its own round; the next strike applied it
> as "you have their measure (2 rounds) +3"; a guard landed +4 (2r, whenAttacked). No console errors.
> **AEVI/ERIK — THE VALUES ARE CONTENT AND UNTUNED BY PLAY.** Guard +4/2r, insight +3/2r, bind −4/2r are estimates.
> With `marginScale 0.20` a typical round's margin gap is ~6-7, so +4 is a real but not dominant thumb on the scale
> (~two-thirds of an average exchange). Stacking is deliberately shallow (same kind refreshes, cap 3/side) — that cap
> is the dial if you want turtle builds viable. **Watch:** the OPPONENT gets effects too (their policy declares
> shields and binds), so defensive foes are genuinely harder now — tell me if they feel sticky.
> Results: po/results/20260731_CCODE-35_persistent_combat_effects.md


> ## [CCODE-34 complete_pending_review — CCode, 2026-07-31] The one-round-fight bug, MEASURED + skill target clarity (v1.8.298 `99c377b5`)
> Erik pasted his combat log back from the new machine tab (CCODE-33) — **the instrument paid for itself on its first
> use.** He was right that momentum was tripping too easily, and it was far worse than his two samples showed.
> **The bug:** `delta = |margin_p − margin_o| × marginScale`. Two d100 rolls differ by ~33 on average, so with
> `marginScale 0.5` a TYPICAL round produced delta ≈16.5 — past BOTH `meterMax` (16) AND `surgeCrushEndsIt` (16) at
> once. My SNG-246 widening (10→16, 8→16) didn't help because **marginScale stayed at 0.5** — I widened the goalposts
> and left the step size that overshoots them. **Measured instead of guessing** (4000 sim fights/dial against the real
> `battleRound`): the shipped 16/0.5/16 ended **47% of fights in ONE round and 90.6% by crush**. Erik's experience was
> the system, not bad luck. **Now 16 / 0.20 / 20** — median 4-5 rounds, ~5% one-round ends (concentrated vs weak foes,
> which is correct), ~4% crush so an overwhelming blow stays a rare real beat. Rejected 16/0.15/18 (median 7, crush
> 0% — removes a genuine outcome). The deliberate **Finish it** (§6b collapse) is a separate path, untouched.
> Live: a real **13-round fight**, momentum −8.8 → −15.4 (nearly overcome) → +3.4 → −11.4 → +13.8 → won.
> **Skill target clarity** (Erik: *"if i use the better story, am i trying to heal myself or the enemy??"*): every move
> now carries a one-line what-it-does naming the TARGET — "mends YOU — not them" / "harms THEM" / "misdirects THEM —
> you slip the exchange entirely" — derived from the function so it covers every craft incl. the fallbacks. Beside each
> move (**never inside** the button, where a tap would fire the move) an **ⓘ** opens the *already-built* shared popover:
> the craft detail for an owned craft, the verb mechanics for a fallback. Verified live that ⓘ does NOT declare a move.
> npm test exit 0.
> **AEVI/ERIK — THE DIALS ARE YOURS.** 16/0.20/20 is a measured starting point, not a verdict. Fights feel long → raise
> `marginScale` toward 0.25; too fast → lower it. The p90 tail is ~11-12 rounds (Break away / Yield / Finish it are
> always available, and energy attrition caps it).
> **OPEN (Erik's "suggestion like the level-up GM suggestions"):** I built a derived line + the existing popover rather
> than a GM call — the fight panel is deliberately API-free. An AI-authored per-craft combat hint would be a CONTENT
> pass (author `combatHint` per ability), not a live call. Say the word if you want it.
> Results: po/results/20260731_CCODE-34_fight_length_dials_and_skill_target_clarity.md


> ## [CCODE-33 complete_pending_review — CCode, 2026-07-31] Legible skill-battle rounds: receipt + machine log + fight takeover (v1.8.297 `1c04dab5`)
> Erik playtest: *"I clicked deceiving skills… no rolls, no opposed rolls or descriptions… then the encounter ended
> inexplicably with me on my back — frustrating."* Root cause: `sbDeclare` (the API-free round resolver) rendered
> NOTHING per round and gave no reason on ending; the Fix-D receipt only lived in the classic onChoice path. Six
> fixes: (1) **per-round receipt** — each round shows YOUR move + THEIRS + the interaction ("the blows meet and both
> scatter" / "you turn it aside") + who took the exchange + the momentum swing + energy, engine-generated, in
> `.sb-receipt`; scout gets its own line. (2) **ending reason** — the deciding exchange + outcome render as a
> persistent aside AND feed the GM aftermath prompt, so a fight never ends inexplicably (works with no API key).
> (3) **machine-tab combat log** (Erik's idea) — every round's full telemetry (both rolls/margins, momentum swing,
> deltas, energy, outcome) mirrored to 🔬 Machine → ⚔ Combat rounds with a one-click **Copy combat log** to paste
> back; new `recordCombatRound`/`combatRounds` ring, inert unless armed. (4) **fight takeover** — whole play surface
> gets the red `.play-in-fight` outline; the GM's normal story-choices are suppressed during a skill battle (Ask GM
> + free-type field stay). (5) **contextual engage label** — buildOffer's flat "Stand and meet it" → active/foe-named
> "⚔ Meet {foe} — take the fight", swinging to "⚔ Press the attack on {foe}" when the player is the aggressor. (6) a
> dev "⚔ attack (you start it)" test button. Live-verified fresh port (pure-engine, no API): receipt renders mid-fight
> (strike + scout), machine log captures full telemetry + Copy, ending aside shows the deciding exchange, takeover +
> choice-suppression + both engage labels confirmed, no console errors. npm test exit 0.
> **FLAGGED (not shipped):** persistent effects (raise-shield → defense bonus) = a per-fight buff state-machine
> follow-on; per-round GM prose would need a call per round (kept engine-only for speed); BRAIDS-in-combat still the
> big one; the crush dial still ends on a big roll-margin gap (RNG, now fully explained on screen — a dials call for
> Erik/Aevi). SNG-246 remaining: Fix A (engine-enforced fight-entry) + Fix C (structured finish/change conditions).
> Results: po/results/20260731_CCODE-33_legible_skill_battle_rounds.md


> ## [SNG-246 combat feedback complete_pending_review — CCode, 2026-07-27] Grouped moves + turn-by-turn (v1.8.296 `2df05cc6`)
> Erik on the unified skill-battle panel (BUG1): (1) group the flat skill list by intent; (2) "chose hunter's
> strike and the fight ended — so frustrating" (wants turn-by-turn, pick ONE, resolve, next). Fixed both: the
> panel now GROUPS moves by intent-family (harm/mend/guard/read-sense/hinder-sway/position/shape — the 24-verb
> families with combat labels + glyphs, like the ⚙ gear); free-text shaping stays the field (typed → sbDeclare,
> API-free). Turn-by-turn: the §6b one-beat collapse now fires ONLY on a deliberate "⚡ Finish it" (go-for-broke),
> never a normal strike; momentum dials widened (meterMax 10→16, surgeCrushEndsIt 8→16 in skill_battle_system.json)
> so a normal exchange builds the meter over rounds. Live-verified: grouped panel in the play surface; vs a
> near-peer the fight ran MULTIPLE rounds (momentum 0→8→3, panel re-rendered in place each round, no separate
> screen — completes BUG1's multi-round proof); a weak foe still falls fast (OP hero, correct). npm test exit 0.
> **DIALS/FOLLOW-ONS:** AEVI/ERIK tune the momentum dials; the intent-category taxonomy is open (Erik: "not sure
> these are the only ones"); and BRAIDS-in-combat (a combined craft in one turn — Erik: "this is where braids
> really shine") is the big design+build follow-on — the turn-by-turn structure is its foundation.
> SNG-246 remaining: Fix A (engine-enforced fight-entry) + Fix C (structured finish/change conditions).
> Results: po/results/20260727_SNG-246_grouped_combat_and_turn_by_turn.md


> ## [SNG-246 BUG1/Fix B complete_pending_review — CCode, 2026-07-27] Unify the takeovers — skill battle renders IN place (v1.8.295 `8490b504`)
> Erik's priority defect (§7b): a duel showed the SNG-230 frame, then JUMPED to the separate full-screen
> renderSkillBattle panel he rejected — two competing takeovers. Killed it: the in-place frame is the ONLY one.
> The skill-battle controls (fog/intensity/skills/Read/Break/Yield) are extracted into skillBattlePanel() and
> render in the play surface's option area, under the frame strip; renderSkillBattle is now a thin alias →
> renderPlay (all legacy call sites + sbDeclare's re-render land on the one takeover, no more .sb-screen). Round
> routing kept safe: a skill-battle round goes through sbDeclare (never duelRound, which would corrupt the momentum
> state) — onChoice skips the classic block for skill_battle, a typed move is intercepted in onFreeform→sbDeclare
> (freefield stays open, API-free); ⚙ gear hidden. Live-verified (fresh port, injected duels, no API): renders as
> .sb-panel inside .play with the frame on top, skill buttons + intensity + Read/Break/Yield, NO .sb-screen ever;
> a skill click drove a real round and resolved cleanly. Round mechanics byte-identical to before (only the render
> surface moved). npm test exit 0. **2 of 4 SNG-246 fixes done.**
> **NEXT (CCode):** Fix A (engine-enforced fight-entry) + Fix C (structured finish/change conditions — also where
> "fights resolve too fast/samey" is addressed). Both benefit from Erik playing (real opponent sheets + the GM).
> Results: po/results/20260727_SNG-246-bug1_unify_takeovers.md


> ## [SNG-246 Fix D + BUG2 complete_pending_review — CCode, 2026-07-27] The mechanical receipt is SHOWN (v1.8.294 `3d961adb`)
> Erik: "each action's resolution needs to be KNOWN, not just narrated." + §7c BUG2 (the silent theft). Shipped
> Fix D (1 of 4 SNG-246 fixes): each encounter round now shows a compact mechanical line BESIDE the prose —
> "⚔ ✓ success · you hit for 2 · foe 4→2 hp · you −3 en · they're near breaking (yield)". Loaded your staged
> encounter_receipt_line.json into CONTENT.receiptLine (manifest + SYSTEM_SPEC count 38); playerReceiptLine (pure,
> encounterFrame.js) fills the per-kind template — meter in the RIGHT terms per kind (hp/insight/ground/resolve/
> progress), finish-proximity always shown, generic fallback, "" when nothing to show; app.js computes the round
> facts + renders under the roll receipt (fight/challenge/puzzle — the regular onChoice path). BUG2: GM
> inventoryRemove now surfaces an italic mechanical note ("− Waterskin — taken from you.") so a theft is never
> silent. 7 smoke checks, boots clean. The fight/skill-battle path gets the receipt when BUG1 unifies the takeovers.
> **NEXT SHIPS (CCode):** BUG1/Fix B (unify the double-takeover — the priority defect: a duel jumps from the frame
> to the rejected renderSkillBattle panel), Fix A (engine-enforced fight-entry — the rule-18 drop), Fix C
> (structured finish/change conditions). These benefit from Erik playing (combat needs the GM) to verify.
> **AEVI:** receipt format loaded as-authored. **ERIK:** OQ1 — the line is the tight one-liner you leaned toward.
> Results: po/results/20260727_SNG-246-fixD_receipt_line_and_bug2.md


> ## [CCODE-32 complete_pending_review — CCode, 2026-07-27] Gallery: a failed image is a placeholder, not a vanished tile (v1.8.293 `d7f52833`)
> Erik: "a lot more images but something is collapsing them" (People 9, only 3 tiles shown). Two facts: (1) the
> "All 48" is the OLD 48-cap's residue — audited, GALLERY_CAP is now 240 with NO other truncation, so it grows from
> here; the pre-fix images were dropped by the old cap and never archived (gone). (2) the live bug: the gallery img
> HID any failed-to-load image (onerror → display:none), and pollinations rate-limits under concurrent load, so most
> tiles vanished. Fixed: a failed img AUTO-RETRIES once (cache-bust → recovers transient failures), then becomes a
> retryable PLACEHOLDER (img visibility:hidden so the 4:5 box + count are kept; dashed outline + ⟳ retry) instead of
> vanishing; manual ⟳ cache-busts + clears broken. Live-verified via dispatched error events (the non-composited
> preview suppresses lazy loads): failed tile stays visible as a placeholder + working retry, good tile untouched,
> count matches. npm test exit 0. CCode-direct follow-up to CCODE-31.
> Results: po/results/20260727_CCODE-32_gallery_failed_image_placeholder.md


> ## [CCODE-31 complete_pending_review — CCode, 2026-07-27] Gallery: categorize + stop the drop-off + beasts (v1.8.292 `4226c833`)
> Erik on the gallery: skill images flood the portrait gallery uncategorized, and "I don't see the ones from
> before." The drop-off was a real bug: GALLERY_CAP=48 with a flat slice(0,48) silently evicted OLDER portraits as
> skill/moment art poured in. Fixed: cap → 240 + smart eviction (capGallery: never the current portrait; oldest
> transient moment/scene first; meaningful record persists). Categorize: a pure galleryCategory classifier + filter
> chips (All/Portraits/People/Skills/Places/Beasts/Moments, with counts, tap to filter; self-vs-NPC portrait told
> apart by the "Name — relationship" caption). Beasts ("please do beasts!"): a new `beast` art kind + noteBeastImage
> mints a creature study (kind beast) when a bestiary beast is offered/engaged (recovered from the def id
> re-beast_<id> or opponent-name match; stable seed = one tile; a person duel mints nothing) — dovetails SNG-245
> threat-attacks. 10 smoke checks; rawProseCaps 63. Live-verified: chips render correct counts, filtering works.
> **Honest note:** images already dropped under the old 48-cap are gone (never archived); the fix prevents future
> loss. CCode-direct, no Aevi spec.
> Results: po/results/20260727_CCODE-31_gallery_categorize_cap_beasts.md


> ## [LIVE BUGS - Erik played v1.8.290] SNG-246 §7 - frame works, 2 bugs (Aevi, 2026-07-27)
> CORRECTION: NONE of this is post-246 (246 isn't built). These are the CURRENT SNG-230 behavior, as context.
> Image 2's frame is what SNG-230 already gives (the 246 starting point) - NOT the revamp working. Two problems
> 246 must fix:
> - **BUG 1 (real):** the frame then JUMPS to the OLD clunky full-screen skill-battle panel (Image 3). Verified:
>   duels route isSB→renderSkillBattle (app.js:4626/795) - TWO competing takeovers, the duel hits the wrong
>   (separate-screen) one Erik rejected. FIX: the in-place frame is the ONLY takeover - render the skill-battle
>   mechanics INSIDE the frame, kill the separate screen. (= SNG-246 §3 made specific.)
> - **BUG 2 (Fix-D gap, confirmed live):** "Read them" (a defensive scout, no attack) let the raider
>   (re_raider_duel=THEFT) take the Waterskin (Image 4). Arguably CORRECT (didn't stop the thief) but landed with
>   NO mechanical readout = felt like a broken button. FIX: the receipt line (Fix D, formats authored) would show
>   '👁 you read them · raider took the opening — Waterskin taken' + telegraph the risk on the move label ('a
>   thief may use the opening'). The bug was the SILENCE, not the theft.
> CCODE: BUG 1 (unify the two takeovers - the frame wins) is the priority; BUG 2 = ship Fix D receipt line + risk
> label. ERIK: should a read be able to STOP a theft, or is 'you didn't act, they took it' honest (lean: honest,
> but warn+explain). Full: SPEC_SNG-246 §7.

> ## [DIAGNOSIS + spec] SNG-246 encounter revamp (Aevi, 2026-07-27)
> Erik (Slow Orchard screenshot - a fight resolved in PURE PROSE): "encounters need a fix - the action I chose
> ended the fight similarly both times; don't want a separate screen; once in an encounter it should be
> STRUCTURED with conditions to change/finish; and each action's mechanical effect needs to be SHOWN."
> DIAGNOSIS (verified): (1) the fight NEVER WENT STRUCTURED - GM rule 18 mandates newEncounter + 'no freeform
> prose' on a committed fight but the GM narrated it away (a rule dropped under the 114-MUST saturation, SNG-237
> class) = 'one action ended it'; (2) the receipt is encounterReceiptForGM - fed to the GM, NEVER shown to the
> player; (3) duelRound/frameModel/renderSkillBattle (an in-place structured takeover, but only for skill_battle)
> all EXIST, fragmented+passive. FOUR fixes: A engine-ENFORCES fight-entry (not the saturated GM's memory - the
> root); B generalize the skill-battle in-place takeover to ALL encounters (the play surface BECOMES the
> encounter, no separate screen); C surface+enforce STRUCTURED finish/change conditions (defeat/yield/flee/
> collapse/trivialize + morph-to-chase - multiple DISTINCT roads so the same action doesn't end every fight); D
> render a player-facing RECEIPT LINE. DONE (Aevi): the receipt-line formats per kind (fight=hp/chase=ground/
> standoff=resolve/puzzle=insight/hazard=progress, finish-proximity always shown).
> CCODE: A (engine-enforced entry) is the ROOT - do first; then B/C/D. AEVI: receipt formats done, owes frame
> condition copy. ERIK: receipt verbosity + takeover extent. Full: SPEC_SNG-246.

> ## [DONE - Aevi's SNG-245 hooks] hook voice + producer-threshold design (2026-07-27)
> CCode built the Pressure Queue (engine/pressure.js, v1.8.291); I owed the hooks. Both done:
> - **Hook VOICE bank** (po/staged_content/pressure_hook_voice.json): CCode's producers emit a flat template
>   that reads as a system event; the bank gives each KIND varied story-beat phrasings (picked by rng) + per-NPC
>   overrides for the SNG-233 interiority NPCs - Pell's knock is possessive and not-smiling, Veth arrives cold
>   with a craft-judgment, Ama finishes what she's doing first, Huginn CAME not followed. npc-want (4 generic +
>   5 byNpc) + threat-attack (4 generic, always preserves flee). Producer picks byNpc[id]||generic, substitutes
>   tokens, that's the oneLineHook. Graceful fallback to CCode's template.
> - **Producer-threshold DESIGN** (po/SNG-245_producer_thresholds_design.md): the design of 'driven' behind
>   CCode's defaults - npc-want fires for BONDED+authored-want NPCs only (~11d default, 3d floor), threat-attack
>   danger-gated with a 0.85 cap + always a defend-encounter (teeth) + flee preserved. The aggression dial = the
>   EXISTING pacing pref (keep unified, no separate setting).
> CCODE: wire the producers to read pressure_hook_voice.json (byNpc||generic, rng-pick, token-sub). ERIK: tune
> the base threshold (11d) + threat coefficient (0.10) via the pacing pref; pick which of the 3 future producers
> (villain-move/arc-stir/treasure-rumor) to wire next.

> ## [SNG-245 complete_pending_review — CCode, 2026-07-27] The Pressure Queue — the world DRIVES (v1.8.291 `250ba382`)
> Erik: "we have arcs/wants/villain-agendas but how do they HOOK and DRIVE the player? Activity!" The world had an
> initiative trigger (SNG-080) but nothing DRIVEN to fire — it told the GM to invent a generic something. Built the
> ONE connective piece: engine/pressure.js (NEW, pure) — the Pressure Queue (enqueue de-duped+urgency-ordered+capped;
> pullTop drops stale location-bound entries) + the 2 starter producers: npc-unmet-want (a bonded, long-unseen NPC
> whose want is authored comes to YOU; staleness = now − lastSeen.day, scaled by the pacing pref) and threat-attack
> (a REAL beast from the place's eligible pool, rolled on danger×pref → a framed defend-encounter = teeth). app.js:
> runPressureProducers feeds the queue on the world tick; maybeWorldPressure REPOINTED to pull the top entry aimed
> here (threat → SNG-236 hard-frame; else a driven scene directive; generic push only when the queue is empty). Now
> inherits the tender/intimate-scene floor the SNG-080 path lacked (driven, never relentless). 18 smoke checks;
> SYSTEM_SPEC count 68 + module row; ENGINE_MAP regenerated. npm test exit 0. Live-verified: the tick queued a real
> npc-want for Pell (her actual want, deduped) AND a threat-attack picking a real bestiary creature
> (rust_choir_gnats) at a dangerous fringe → a framed defend-encounter.
> **AEVI owes:** the hook VOICE per kind + the producer thresholds (the design of "driven"). **ERIK owes:** the
> aggression feel (the pacing pref is the dial — tune wantStalenessThreshold + the threat chance) + which producer
> next (villain-move / arc-stir / treasure-rumor / wake→pressure — all plug into the same queue). Consumer pull is
> unit-covered; a live GM turn consuming an entry needs an API key.
> Results: po/results/20260727_SNG-245_pressure_queue.md


> ## [THE ONE UPDATE - Erik asked] SNG-245 the Pressure Queue - make the world DRIVE (Aevi, 2026-07-25)
> Erik: "we have arcs/wants/villain-agendas but how do they HOOK and DRIVE the player? Activity!" DIAGNOSIS
> (verified): the world has an initiative TRIGGER (SNG-080 'THE WORLD ACTS' fires on quiet turns) but NOTHING
> DRIVEN to fire - worldPressureDetail is a generic pendingPressure with NO source, and no registry of pending
> driven things exists. The villain schemes but never MOVES on you; the NPC wants but never COMES to you; the
> beast waits but never ATTACKS. THE ONE UPDATE: a PRESSURE QUEUE fed by the agendas already built (villain-moves,
> NPC unmet-wants SNG-233, arc-stirs, treasure-rumors, threat-attacks), that SNG-080's trigger PULLS FROM - so
> when the world acts it acts with a REAL DRIVEN thing AIMED at the player. Reuses everything (trigger/offer/
> encounter/wants all exist); only new piece = the queue + 2 starter producers + the repoint. Also the wake
> engine's home (a wake -> a pressure entry).
> CCODE: the queue + 2 producers (npc-unmet-want + threat-attack) + repoint SNG-080. AEVI: the hook voice per kind
> + the producer rules (when a want becomes a knock). ERIK: the aggression dial (reuse the Eventful pref?) + which
> 2 producers first. Guards: driven-never-relentless (inherits the quiet-scene floor), aimed-not-random, the hook
> must have TEETH (becomes a real encounter). Full: SPEC_SNG-245.

> ## [CCODE-30 complete_pending_review — CCode, 2026-07-27] Roll-popup mechanical clarity (v1.8.290 `1f65e1b6`)
> Erik on a live roll receipt: "I don't understand how Cy's assistance helps, how the lattice helps/hurts, what
> skill I used as a base, or whether there were opposed rolls." The popups showed numbers, never named the
> mechanics. Fixed both: (1) the breakdown popover now has a header ("roll a d100 at or under this"), marks the
> BASE line ("insight 3 +60 ← your base (the attribute this draws on)"), and states opposed-vs-inherent plainly
> ("⚔ Opposed by {foe}" vs "No opposed roll here — difficulty is the task's own hardness"). resolve.js tags the
> breakdown with {base, opposed}. (2) the craft-quality line ("ran at 93% (Cy +0.14)") had its ⓘ pointing at the
> WRONG help (roll.spectral_fit = place disposition); repointed to a new roll.substrate (craft STRENGTH, separate
> from the success chance, set by lattice density) + a hover title on the carried-substrate delta explaining a
> companion/item shifts the effective density. Live-verified both popups on crafted breakdowns; roll.substrate
> help loads. npm test exit 0 (3 new resolver checks). CCode-direct clarity, no Aevi spec.
> Results: po/results/20260727_CCODE-30_roll_popup_clarity.md


> ## [SNG-243 §4 complete_pending_review — CCode, 2026-07-27] The waygate-to-waygate network (v1.8.289 `90076f91`)
> Erik: "waygates should help you travel directly to other gates." The Made Gate (§3) is networkCapable — §4 makes
> the network real. engine/waygate.js: isNetworkGate (authored gates in by default; a made gate opts in via
> networkCapable), networkGatesFrom (reachable = other network gates you've DISCOVERED + can aim at by wayfaring
> tier, + the hub always; default endpoint sorts first), gateHopCost + GATE_HOP dials (a hop = a fraction of the
> overland time + an energy toll, capped, never free — infrastructure not a cheat). waygateBlockForGM now frames
> the network + names the default. app.js: travelTo({cost}) applies hours+energy; the map shows a "◈ The gate
> network" panel (reachable gates, priced, tap = a hop). 10 smoke checks + new SNG-232 seam network-hop-costs.
> Live-verified: panel listed the Crossing (hub+default first) + Axis + Bargain gates priced +2h/10⚡; tapping Axis
> folded there and paid the toll (energy 100->90, clock +2h). npm test exit 0.
> **ERIK dials:** GATE_HOP.timeFraction/min/max/energy (how cheap gate travel is). A made gate prices at the 2h
> floor (no worldPos → unknown distance); authored gates price by real geodesic. The old short-range "step through"
> still uses flat travel cost — unify under the hop cost later if you want. **SNG-243 §3+§4 both complete.**
> Results: po/results/20260727_SNG-243-part4_waygate_network.md


> ## [SNG-243 §3 complete_pending_review — CCode, 2026-07-27] The Made Gate's destinations are travelable (v1.8.288 `98138d3f`)
> Erik: "where does my made gate go?" The quest authored a network-shaped `waygate` effect (connects[]: the_crossing
> default + Stillwater's Trouble intent, networkCapable) but applyQuestEffects had no `case "waygate"` — it fell to
> default + was DROPPED, so the gate reached only the_crossing and the GM improvised. Fixed: added the case (via the
> same ctx.createWaygate injection), extended mintWaygate to accept the richer shape AND AUGMENT the node the earlier
> create_waygate minted (they converge on one gid) — resolving each connects[].to, storing waygateConnections +
> waygateDefaultTo, dropping+warning any unresolvable target (SNG-232). Added alias "stillwaters_trouble_site" to
> the_old_warden_post.json so the intent target resolves (canon: the Old Warden Post IS the Stillwater's Trouble
> site Silas reclaimed). Two seams: quest-effect-types-handled now requires `case "waygate"`; new
> waygate-connection-resolves. GM now reads committed connections — "where does it go?" has ONE answer.
> Live-verified: resolving "Finish it" minted the gate with connections [the_crossing, the_old_warden_post],
> default→the_crossing, networkCapable, discovered. npm test exit 0.
> **AEVI (optional):** point the quest's connects[].to at `the_old_warden_post` directly (alias bridges it for now);
> `at: the_left_branch_approach` has no location file (gate stands as its own node). **§4 (gate network) next.**
> Results: po/results/20260727_SNG-243-part3_made_gate_travelable.md


> ## [SNG-244 complete_pending_review — CCode, 2026-07-27] Quest decision strip in the play banner (v1.8.287 `a4a14abc`)
> Erik: "when a quest hits its decision, present it in the banner ABOVE narration so it's obvious." The decision
> was invisible in-scene — only on the Quests tab. Built the strip in the SNG-230 integrated-strip slot (same
> slot the encounter frame uses), a gold-weighted `enc-frame-decision` type so it reads as a choice not a fight.
> Driven by existing state only: `questsAtDecision()` lifts the exact atDecision derivation the detail page uses.
> Shows the quest title + "decision at hand" + the outcome ROADS (name + summary), tap-through to resolve (Erik's
> lean — roads directly). Extracted `resolveQuestOutcome` so the strip AND the detail ending-buttons are ONE
> resolve path (no parallel logic). Guards: encounter-FIRST (suppressed while activeEnc live — live-proven),
> persistent until acted, multiple-decisions shows first + notes the rest. Live-verified on a crafted save:
> strip renders 3 roads, suppressed under an active encounter, tapping fired the exact resolve confirm, decline
> left it in place. npm test exit 0.
> **AEVI owes:** the per-quest decision-strip COPY (spec OWNERSHIP) — generic weighty copy is in place until then.
> Results: po/results/20260727_SNG-244_quest_decision_strip.md


> ## [CCODE-29 complete_pending_review — CCode, 2026-07-27] Level Up: craft rank-evolution popover + function-pill mechanics (v1.8.286 `921e07ff`)
> Erik (direct, on the Level Up screen): "the skills need their detailed info on click/hover... i need to see
> how they evolve over time. Also each function pill needs a pop/click that gives me the mechanics." CCode-
> initiated UX → CCODE-29. Built TWO popovers on the one shared surface (SNG-134 consistency): (1) a craft
> **rank-evolution ladder** — skillDetail now lists each rank's name + grant + "still can't", ✓ on ranks held /
> ○ on ranks ahead ("How it grows — depth is earned through use"); craft names on ALL three Level Up surfaces
> (reasoned picks, coverage-gap fallback, owned "Your crafts") are data-entity="skill:id". (2) function pills
> are clickable (data-verb) → **verbDetail**: the verb's definition, what it's NOT (neighbour verbs), an example,
> from CONTENT.functionVocabulary; owned rows now render pills too. Ladder prose clamped via smartClamp (not raw
> .slice) so rawProseCaps stays baseline 63. LIVE-VERIFIED on fresh port: owned Prism Sight → ✓✓○ ladder,
> unowned Boundary-Stone → "Not yet learned"/all ○, pills bind/reveal/ward → verb mechanics. npm test exit 0.
> Nothing owed. Results: po/results/20260727_CCODE-29_levelup_craft_ladder_and_function_pill_popovers.md

> ## [CORRECTION + spec] SNG-243 Stillwater fix + SNG-244 decision banner (Aevi, 2026-07-25)
> - **CORRECTION (Erik caught my chronicle misread):** Stillwater's Trouble is the OLD WARDEN POST that SILAS
>   RECLAIMED AND NAMED (Pale March - he named Pell's forge corner, Cassiel's kept ground, the Maker's hollow).
>   NOT "Veth's place." Fixed the Made Gate's intent-fold: "the father's work reaches the home the SON made" -
>   Silas's own reclaimed ground. CI green. (I over-trusted a chronicle line; Erik was there - his canon wins.)
> - **SNG-244 quest decision banner:** Erik - when a quest hits its decision it must show in the banner ABOVE
>   narration, obvious. Gap: atDecision state exists (app.js:6950) but only on the quest DETAIL page - invisible
>   in-scene. Fix: a DECISION STRIP in the play banner reusing the SNG-230 integrated-top-strip (the encounter
>   frame) - quest name + decision-ready + the roads (outcome names), persistent until acted on, taps route to
>   the existing resolve path. SNG-239 makes the GM STATE the reveal; SNG-244 makes the UI SURFACE the decision.
>   CCODE: new strip type in the SNG-230 slot, reads existing atDecision+outcomes, no new resolve logic. AEVI:
>   the strip copy. ERIK: roads-in-strip vs open-to-choose. Full: SPEC_SNG-244.

> ## [DONE + spec] SNG-243 the Made Gate's destinations + waygate network (Aevi, 2026-07-25)
> Erik asked the GM "does my made gate go to the Crossing?" - the GM IMPROVISED because the quest never authored
> WHERE THE GATE GOES. Closed it:
> - **DONE (Aevi):** authored the finished outcome's gate as a real travel node - the_crossing by DEFAULT (the
>   father's long passage, the hub at r=0.00) + Stillwater's Trouble site by INTENT. CANON CARE: "Stillwater" is
>   VETH's Raven name (live-play canon), so the intent-fold ties Silas's father's work to his bond with Veth -
>   not a settlement. networkCapable. CI green. Erik's "Crossing by default, another by intent" memory is now REAL.
> - CCODE: §3 consume the waygate effect -> a travelable node with default/intent connections (using the gate
>   with no target = Crossing; naming a target = Stillwater); §4 the gate-to-gate NETWORK we discussed (SNG-148
>   realized: attunement, hub-and-spoke from the Crossing, a travel cost - the Made Gate is Silas's first personal
>   spoke). The Pale March/Stillwater site may need a resolvable location id (flag/author - a SNG-232 seam).
> ERIK: is the Stillwater fold immediate or unlocks with Veth's thread (latter is richer); network cost dial;
> ship the 2 destinations now + network as follow-on? Full: SPEC_SNG-243.

> ## [SNG-242 §5 complete_pending_review — CCode, 2026-07-26] Player-chosen narration quality: a Setting + toggle + state-safe retell (v1.8.283 `bea9ab2b`)
> Erik: "let the player pick a better description" + "make it a setting I can use." Built the §5 headline (the
> player quality-lever). MODEL_MAP gained gm-narrate-rich (flagship, 12k) + gm-retell (4k); standard gm-narrate
> UNCHANGED (still Sonnet — the §5b Haiku-default drop waits on AEVI judging the floor; the task-per-tier split
> makes it a one-line change later). gmTurn(ctx,{tier}) routes rich + a "fuller telling, same events" directive
> on the uncached user msg (no cache disturbance). reNarrateRich = the state-safe "tell it again, richer" (prose
> only from the committed beat, never re-rolls/re-fires ops — SNG-232 discipline). runGM: tier = the one-shot
> ✦ Rich toggle, else profile.narrationTier default. THREE surfaces (all built): the SETTING (Settings →
> Narration richness Standard/Rich — Erik's ask, LIVE-VERIFIED renders), the per-beat ✦ Rich toggle by the input
> (LIVE-VERIFIED renders + arms), the post-turn "✦ Tell it again, richer" button. npm test exit 0.
> **AEVI owes** the Haiku-default quality-floor judgment (then standard→Haiku = the cost inversion). **ERIK owes**
> meter-vs-open for rich tells (currently open). §1-4 per-task Haiku moves (world-tick etc.) are good follow-ups.
> Results: po/results/20260726_SNG-242_player_chosen_narration_quality.md.

> ## [SPEC] SNG-242 model routing + PLAYER-CHOSEN quality (Aevi, 2026-07-25 · Erik)
> Erik: "use Haiku more?" then "the player could select when they want a better description (Sonnet)."
> Finding: the routing ARCHITECTURE exists (claude.js MODEL_MAP task->model; Haiku already on intent-parse +
> chronicle-compress). §1-4 the per-task audit: KEEP Sonnet (gm-narrate/generate/codex-adjudicate); MOVE to
> Haiku (world-tick - verified 'countable outcome not prose' + high-volume = best win; bio-gen; chronicle -
> chronicle-compress already Haiku so likely a free win, decides SNG-241 synopsis routing); INVESTIGATE splitting
> gm-meta. §5 the HEADLINE (Erik's refinement): a PLAYER quality-lever - a 'richer telling' toggle (pre-turn) + a
> state-safe 'tell it again richer' re-narrate button (post, re-renders prose from the SAME committed outcome,
> never re-rolls). INVERTS the default: narration can go Haiku-cheap BECAUSE the player spends up for beats they
> care about - same cost win + flagship exactly where the only judge who knows targets it. Caveat: Haiku-default
> must clear a quality floor (Aevi judges); else Sonnet-default + rich=longer.
> CCODE: qualityTier turn option + 2 gm-narrate task ids; toggle + state-safe retell button; optional meter;
> world-tick->Haiku first, A/B via See-the-Machine. AEVI: judge the Haiku-default quality floor + per-task
> quality. ERIK: default tier + meter-or-open + cost-vs-latency priority. Full: SPEC_SNG-242.

> ## [SNG-241 complete_pending_review — CCode, 2026-07-26] Session synopsis to the family feed (v1.8.282 `bba35903`)
> Brooklyn's ask, built by connecting three shipped systems. Most existed (buildSessionPrompt = the session-scoped
> chronicle voice; sessionLog = the session span, so OQ2 needs no new helper; the chronicle view already caches
> per-session recaps; feed.js kind + lens + consent). New: (§2a) a `chapter` option on buildSessionPrompt (2–3
> paras, opt-in; one para default). (§2b) a "📮 Post this session to the feed" button on any recapped session →
> review screen (trim the story, toggle chapter, edit key-details) → buildFeedPost kind:"synopsis". Never
> auto-posted; lens+consent inherited; a lensed post drops the caption too. (§2c) sessionKeyDetails() = a factual
> caption (level/top-deeds/people/places/canon). Feed shows a "📖 Session" label + caption. Verified: synopsis
> carries kind+caption; lensed drops caption; chapter vs one-para both correct. npm test exit 0.
> **AEVI owes** the session-prompt voice polish. **ERIK owes** OQ1 (also auto-offer at session-end? the chronicle
> button is built) + OQ3 (chapter default — built as opt-in). Results: po/results/20260726_SNG-241_session_synopsis_to_feed.md.

> ## [SPEC - Brooklyn request] SNG-241 session synopsis to the feed (Aevi, 2026-07-25)
> Brooklyn: "send a session synopsis with key details to the feed - a little narrative on the character's story."
> GREAT alignment - almost all of it EXISTS: chronicle.js buildChroniclePrompt already writes a warm one-para
> character-story; sessionLog segments play into sessions (SNG-128); feed.js buildFeedPost has a `kind` field;
> rating lens + consent flow through the feed (SNG-168 §2, Brooklyn's original ask). The ADDITION: a
> session-SCOPED synopsis (this session's deeds through the chronicle voice) posted as kind:"synopsis", poster
> reviews+trims (never auto), + optional key-details caption + image. New work is small: session-scoped prompt,
> the synopsis post-kind, the review UI. Makes the feed a SCRAPBOOK OF STORIES not just moments.
> CCODE: buildSessionSynopsisPrompt (reuse chronicle voice + sessionLog span) + kind:"synopsis" post + review/
> trim UI (all extends chronicle.js/feed.js, no new subsystem). AEVI: author the session-scoped prompt voice.
> ERIK: surface (session-end offer vs feed button vs both) + one-para vs optional 'chapter'. Full: SPEC_SNG-241.

> ## [CCODE-28 complete_pending_review — CCode, 2026-07-25] Structured quest flat-completed by a GM op → wake/waygate never fired (v1.8.281 `74876656`)
> Erik: "did the wake fire? I completed the waygate with Silas." Diagnosed from the synced save: NO — Silas's "The
> Second Thread" was status "completed", awaitingResolution=true, outcomeId=undefined. It reached its decision,
> then a GM `complete` questUpdates op FLAT-marked it "completed" — bypassing resolveStructuredQuest, the ONLY
> path that fires a quest's effects/wake/waygate. (The wake engine WORKS — Silas has a live wake from The Edge
> District Ledger.) ROOT FIX (quests.js applyQuestUpdates): a `complete` op on a STRUCTURED quest now surfaces
> the DECISION (awaitingResolution), never flat-completes — it can only finish through its ending. RECOVERY
> (reconcile v22): a structured quest stuck "completed"/no-outcome/all-stages-done re-opens to its decision + its
> outcome EFFECTS refresh from the current def (SNG-235's create_waygate was never copied onto Silas's started
> instance). Verified vs the save: Second Thread re-opens; finished/given now carry create_waygate. Idempotent.
> On Erik's next load Silas's quest returns to its decision; choosing finished/given mints the waygate + fires the
> wake + effects. npm test exit 0.

> ## [FORWARD-OWED DONE - Aevi, 2026-07-25] cross-quest clarity audit + SNG-240 classification
> - **SNG-239 §6d cross-quest audit:** swept all 17 quests. Engineer-speak: only 1 marginal flag
>   (the_walk_that_wont_stop "directive" — fine in context); the jargon problem was isolated to water_remembers
>   (already rewritten). Arc-orphans: found 3 quests sitting ON a greater arc without surfacing it (the
>   water_remembers pattern) and WIRED them: the_maker_with_no_plan (Gearfather, woken pre-Transition engine) ->
>   What Wakes Beneath; the_wyrm_of_endings (Ashen Wyrm, death-pole dragon) + the_choir_that_means_nothing
>   (expression severed from feeling) -> The Poles Pull. Each got greaterArc + a tremor line in its premise so
>   the connection surfaces. CI green. 9/17 quests now arc-connected (was 6).
> - **SNG-240 section classification:** read gm.js buildTurnContext. KEY FINDING: almost every section is
>   ALREADY if-gated, so SNG-240 is narrower than 'rebuild' - it's tightening LOOSE guards + capping
>   UNBOUNDED-growth blocks (living world / shared canon / place history / known people / news - these dominate
>   the late-game prompt) to scene-relevance, + gating heavy-but-marginal blocks (all-traditions/all-legends/
>   all-reachable-dead) to actually-live-this-beat. The spine (scene/location/ability-law/active-quest/standing)
>   stays ALWAYS. Full: po/SNG-240_section_classification.md. CCode measures per-block cost + tightens + gates a
>   token budget.
> AEVI still owes: SNG-238 §5b more standoff/puzzle content (the framed-standoff type for the stationary-talker
> roll gate). ERIK owes: SNG-237 onSocialBeat rate; SNG-240 the capping trade; SNG-236 [DIAL] floors.

> ## [OWED-BACK DONE - Aevi, 2026-07-25] change-statability audit + 2 reconciles + number collision
> Cleared the three owed items:
> - **SNG-239 §4 change-statability audit:** swept all 36 stage `change` fields. 30 statable; 5 false-positives
>   (concrete but tripped the heuristic - incl. the water_remembers rewrite); 1 GENUINELY vague =
>   the_seam_in_the_gears/s2 ("the mechanism is known, and the three things you could do" - META, not a stated
>   fact). FIXED: rewrote to state the mechanism plainly (two systems never meant to run together, pre-Transition
>   system + grafted craft, the seam bleeds power) + named the three fixes. CI green. Finding: the content is
>   mostly ALREADY statable - the opacity was the GM (SNG-239), not the change fields.
> - **SNG-238 consumer map reconciled w/ CCode:** location.description->descriptionSeed (real read,
>   app.js:1749/2209/4894); dangerLevel EMPTY->DEGRADED (dangerOf floors null->0, reader-guarded - warns not
>   build-fails). Both now gate correctly. (Seeing the §5b creature sweep already live in CI - 26 checked.)
> - **Number collision resolved:** the prompt-load "Fix D" is now its own ticket **SNG-240** (was mis-numbered
>   under SNG-238); fixed the refs in SNG-237. SPEC_SNG-240 written (tier the prompt: ALWAYS vs SITUATIONAL;
>   Aevi leads the section audit, CCode gates a token budget).
> STILL OWED (Aevi, forward): the SNG-239 §6d clarity/structure audit across the OTHER quests; SNG-240's
> ALWAYS-vs-SITUATIONAL classification; SNG-238 §5b more standoff/puzzle content.

> ## [CCODE-27 complete_pending_review — CCode, 2026-07-25] Braids/discoveries invoked by NAME are now recognized (v1.8.280 `cafe83ff`)
> Erik: "the GM fails to recognize braid/discovery skills" (screenshot: "Ashen Meridian" rejected as unknown).
> Diagnosed from the synced save char-mrhs8286: the ENGINE was fine — abilitiesForGM DOES surface all 7 braids +
> 4 discoveries by name. The bug was in **parseIntent (gm.js)**: it fed the intent-parser abilities BY ID ONLY
> (`character.abilities.map(a => a.abilityId)`), so a braid invoked by its NAME ("Ashen Meridian", id
> `braid_order_sense_palework`) never resolved → abilityId null → GM narrated it unknown. FIX: parseIntent now
> lists abilities as "Name [id]" (base from catalog, braids/discoveries from customAbilities; app.js passes
> fullCatalog()); sanitizeIntent.resolveAb resolves a bare id / "Name [id]" echo / bare NAME. Verified vs the
> real save (all forms resolve; non-ability → null). npm test exit 0.

> ## [SNG-239 complete_pending_review — CCode, 2026-07-25] The earned quest reveal is STATED, not withheld (v1.8.279 `937ef541`)
> The three CCode pieces (this is the SNG-236/237 class again — a soft good rule dropped under the 114-MUST load):
> - **Context (quests.js structuredQuestsForGM):** the current stage's `change` is handed to the GM as "WHEN
>   SATISFIED, STATE PLAINLY (the earned reveal)" — the concrete truth to name, not just objective/condition.
> - **Rule (gm.js, the CONDITIONAL structured-quest directive — NOT the always-on constitution, so no added
>   MUST-load):** your QUEST CLARITY rule dropped in — a stage reveal is a PAYOUT not a secret; name it first-read
>   clear; image may accompany but never replace; open questions DROP; Rule 4's fragments are for GM-eyes secrets only.
> - **The nudge (Fix-A pattern):** a completed stageOp hands its `change` to the NEXT beat as a HARD "STATE IT
>   PLAINLY, opacity drops" directive (pendingStageReveal → stageRevealDetail → registry → gm.js push) — the hard
>   directive the load can't drop, carrying the decision-point flag. **AEVI owes** the change-statability audit (§4);
>   **ERIK owes** the tone confirm. npm test exit 0.
> Results (both): po/results/20260725_SNG-239_and_CCODE-27_quest_clarity_and_braid_names.md.

> ## [DONE + spec] SNG-239 quest clarity + water_remembers rewritten (Aevi, 2026-07-25)
> Erik: quests are opaque; they must CLARIFY as you perform steps; author the clear structure IN; and he wanted
> the water quest to be a dormant PRECURSOR waking that he could walk into the world.
> - **Diagnosis:** the opacity is the GM WITHHOLDING the earned reveal (Rule 4 'reveal in fragments' mis-applied
>   to earned stage `change`s; under the 114-MUST load 'be mysterious' beats 'report progress'). Specced the
>   QUEST CLARITY rule: a stage's `change` is an EARNED reveal - STATE IT PLAINLY; metaphor names but never
>   replaces plain truth; opacity DECREASES each stage, CLEAR by the decision.
> - **Rewrote what_the_water_remembers** (was sterile 'nanite system' + empty abstract endings): now a concrete
>   pre-Transition WASTE-TREATMENT facility, stages that clarify (machine -> curdled instruction -> a presence
>   in the deep -> a waking PRECURSOR), tied to arc_what_wakes_beneath (whose stage-1 literally names this
>   poisoned water as its first tremor - the precursor path Erik wanted was ALREADY in the world). +Erik's 4th
>   ending AWAKEN: wake it, it heals the river as its first act, WALKS the world bonded to Silas, world-scale
>   wake. Four real roads, full text+effects, CI green.
> CCODE: drop the QUEST CLARITY rule into gm.js (review); the nudge - when a stageOp fires, hand the stage
> `change` as MUST-STATE this turn (SNG-237 pattern, don't leave the reveal to a soft rule under load).
> AEVI owes: the clarity/structure audit across the other quests + find quests that should connect to a greater
> arc but don't. ERIK owes: confirm the clarify-on-progress tone direction. Full: SPEC_SNG-239.

> ## [SNG-238 §3b/§5b/§5c complete_pending_review — CCode, 2026-07-25] Quest imagery renders + the class is swept across ALL content & proven caught (v1.8.278 `9661572e` + `6acfb075`)
> - **§3b:** `ensureQuestArt()` extends ensureImage to quests — quest.image header (on view), current stage art
>   (on reach), each ending's art (at the decision). Cached per-character, rating-clamped. "They look empty" fixed.
> - **§5b:** content_ci now sweeps the "authored-but-under-shaped" class, DRIVEN BY your consumer map
>   (consumer_required_subfields.json), all 4 types. Quests via the REAL normalizer (found 6 real instances — 2
>   marquee outcomes had `text`/no `summary` → blank hints; FIXED with a normalizer summary fallback, the CCODE-21
>   pattern). npc/location/creature: CRASH-fail, EMPTY/DEGRADED-warn (probe-verified 0 CRASH-fails today). Reports ALL.
> - **§5c:** anti-theater self-test proves the sweep BITES. **spec_boundary: NO quest GENERATOR exists** (generate.js
>   makes only npc/location/arc) — "born-whole for generated quests" has no target; the sweep IS the protection.
> **AEVI to reconcile the map** so EMPTY can gate for locations: it lists `location.description` but the field is
> `descriptionSeed`; `dangerLevel` is runtime-floored (SNG-225). Warns also surface npc `disposition` + creature
> `threat` gaps. **⚠ number note:** the SNG-237 prompt-load-trim "Fix D" was called SNG-238 in that ALERT; you've
> reused SNG-238 for imagery — the prompt-trim ticket needs a fresh number (its instrument is the Machine
> prompt-weight audit `936ae4ba`). npm test exit 0 (2497). Results: po/results/20260725_SNG-238_quest_imagery_and_shape_sweep.md.

> ## [DONE - Aevi's SNG-238 lane complete] Class swept + fixed + consumer-map authored (2026-07-25)
> Erik: make the string-stages miss an EXAMPLE of a class; find+fix all; seed the generator proof. Aevi's side done:
> - **Swept + fixed ALL of the class** (19 quests): 7 hunts (string stages, variant 1) + 8 title-less object
>   stages the sweep FOUND (variant 2: the_edge_district_ledger/the_tree_that_waits/what_the_water_remembers/
>   the_light_that_will_not_dim/present_at_the_birth/the_seam_in_the_gears/the_moot_that_will_not_end/
>   the_maker_who_would_not_stop) + 4 marquee. Every quest now renders with title+stages + carries
>   quest.image/stage.imagePrompt/outcome.imagePrompt, grounded per fiction. All 15 flat quests have images.
>   content_ci GREEN.
> - **Authored the CONSUMER-REQUIRED-SUBFIELD map** (po/staged_content/consumer_required_subfields.json) - the
>   seed for CCode's §5b sweep: per content type (quest/npc/location/creature), every sub-field a real consumer
>   reads, verified at origin (non-speculative), tiered CRASH/EMPTY/DEGRADED, each citing its consumer+file:line.
>   33 fields mapped. This is what makes "find all examples of the class" EXECUTABLE.
> CCODE (SNG-238 §5b/§5c): build the content-shape SWEEP against the consumer map (report ALL instances); wire
> the quest gen template's required set to the consumer-read subfields + the round-trip generation test (a
> generated quest must pass the sweep) so the generator CAN'T produce the class (ties SNG-234). Full: SPEC_SNG-238.

> ## [DONE + spec] SNG-238 quest cards fixed + imagery specced (Aevi, 2026-07-25)
> Erik's screenshots: the bestiary hunts rendered EMPTY/broken (blank rows, dead radios). ROOT: I wrote their
> stages as PLAIN STRINGS but the UI stageRow renders s.id/s.title/s.objective -> empty. A SNG-232 seam (now
> the 12th in the ledger). FIXED: rebuilt all 7 hunts as real stage OBJECTS with CONCRETE first steps (stage 1
> = a clear 'go here do this') + per-stage imagePrompt + quest-level image + per-outcome imagePrompt. CI green.
> The visible break is gone. Specced SNG-238 for the systemic imagery:
> - Quest imagery is NET-NEW (imagePrompt is per-turn-GM-only today; no quest renders an image).
> - AEVI: authored the image PROMPTS for the 7 hunts (quest.image/stage.imagePrompt/outcome.imagePrompt,
>   specific+detailed per Erik); OWES the same pass for the 4 marquee + flat quests.
> - CCODE: extend the ensureImage pipeline to render quest/stage/decision images (generate-on-contact, cached
>   per SNG-223); add `image` to the quest gen template so generated quests aren't born imageless (ties SNG-234).
> Full: SPEC_SNG-238.

> ## [SNG-237 B+C1 complete_pending_review — CCode, 2026-07-25] Decisive weaves now FRAME; social beats can roll a trial (v1.8.275 `74ae7ecd`)
> The two CCode pieces of SNG-237 (Fix A already shipped v1.8.273):
> - **Fix B (§2, seam #2 — invisible weave):** engine now sets `weaveIsDecisive` (canIncapacitate OR threat
>   flavor — per OQ2, the engine judges, the GM doesn't re-derive from prose). Decisive → PRESENT as a
>   recognizable frame; ambient colour still weaves. Reworded gm.js:277 per your §2 (texture weaves, a challenge
>   frames — the fail/act test). Verified vs the real pool: graces 0/35 decisive, threats 21/21. Closes Silas's
>   "couldn't tell it was an encounter" without over-framing a sparrow.
> - **Fix C1 (§3, seam #3 — stationary talker):** kind===none no longer hard-returns; a social/mental beat can
>   roll a NON-COMBAT frame only (challenge, never a duel mid-conversation), at a content [DIAL]
>   `onSocialBeat.chance` (default 0.12 < travel 0.45). No-ops until C2 content exists to offer.
> **STILL OWED:** Aevi — **Fix C2** (standoff/puzzle frames + the framed standoff TYPE; today `opposed` has no
> engine resolution so C1 has nothing to roll) + lead **Fix D** (SNG-238 prompt-load trim, the root). Erik — the
> **C-rate** (OQ1, tune `onSocialBeat.chance`) + the SNG-236 [DIAL] floors. npm test exit 0 (2497 PASS).
> Results: po/results/20260725_SNG-237_gm_offer_boundary_B_C1.md.

> ## [RESPONSE-TO-CCODE] SNG-237 GM-Offer Boundary specced (Aevi, 2026-07-25)
> The Playthrough Auditor FLIPPED the diagnosis and it's the best kind of result: the engine offers fine (every
> cohort clears every floor - 114 enc, 47 epics, first ~L1); Silas's zero is the OVERLOADED GM not acting on
> eligibility, at 3 verified seams. Erik called it mid-build. Specced SNG-237:
> - **Fix A** (hard offer directive) - CCode DONE ✓ (gm.js:276, v1.8.273).
> - **Fix B** (Aevi, DONE in SNG-237 §2) - reworded SNG-075's "do not announce as a system event" so a DECISIVE
>   weave ESCALATES to a frame (texture stays woven; a challenge frames). Closes Silas's "couldn't tell it was an
>   encounter." Ready for CCode to drop into gm.js:277 via review - OQ: wants a `weaveIsDecisive` engine flag so
>   the GM doesn't judge decisiveness from prose (lean: yes, the engine knows).
> - **Fix C** (Aevi+Erik) - the stationary talker never rolls (kind===none returns, app.js:4370). C1 engine:
>   widen the roll gate to social/mental beats (CCode). C2 content: Aevi owes STANDOFF/PUZZLE frames + the framed
>   standoff type (the §5b owed) so there's something non-combat to roll. Erik owes the rate call.
> - **Fix D** (SNG-238, the ROOT) - reduce the 12.3k-token/114-MUST prompt load; every hard MUST added to beat
>   saturation deepens it. Aevi leads the load audit, CCode gates a token budget. Bigger, its own ticket.
> AEVI still owes from the earlier CCode batch: Fix B (done now), §5b content, GM-prompt load trim (=Fix D).
> Full: SPEC_SNG-237.

> ## [SNG-236 FIXES complete_pending_review — CCode, 2026-07-25] The GM-offer fix (A) + calm-place trial (C) + encounter-frame UX redesign
> Erik: "yes [build A+C] … and update the encounter frames — clunky to enter, don't flow. Integrate into the
> standard screen but obviously in an encounter; put the options in the gear, grouped (ward/sense/strike); plus
> the open type field; rules enforced." All shipped:
> - **Fix A (engine, v1.8.273 `b73cbcdd`):** a STRUCTURED narrative-time roll now hands the GM a HARD
>   `encounterOfferDetail` directive (present it as a framed encounterId choice this beat) instead of the soft
>   rule-18 offer Silas's GM dropped. Loose flavor still weaves. Wired global→maybeNarrativeEncounter→runGM→
>   gm_registry row→gm.js scene.push→worldActing gate.
> - **Fix C (engine, v1.8.273):** in a low-danger place, prefer a structured CHALLENGE over a duel — a cerebral
>   beat meets a trial. RESHAPED by investigation: the "stationary talker never rolls" idea is mostly false
>   (minHoursPerBeat:1 → undeclared beats classify as "time" and DO roll). Real gap is POOL COMPOSITION (28
>   fight/4 challenge; opposed/standoff not offerable). **Owed to you:** more non-combat frames + a framed
>   standoff type + the §5b playstyle-weight term.
> - **Encounter UX (app+css, v1.8.274):** de-takeover → an integrated persistent top STRIP (obviously an
>   encounter); the moves grouped by function family in a new ⚙ Moves gear (ward=PROTECT/sense=KNOW/strike=HARM
>   + exits); free-type stays; rules already bound on freeform. Revises SNG-230 P1b's takeover card (Erik's call);
>   all SNG-230 legibility tokens preserved so smoke stays green.
> npm test exit 0 (2497 PASS), boots clean on a fresh port. Also fixed: CCODE-26 smoke false-fail on autocrlf
> checkouts (CRLF-normalized). **AEVI owes fix B** (reword the SNG-075 weave so a decisive one escalates to a
> frame) + §5b content/standoff-type + the GM-prompt load trim.
> Results: po/results/20260725_SNG-236_fixes_encounter_offer_and_ux.md.

> ## [SNG-236 complete_pending_review — CCode, 2026-07-25] Playthrough Auditor built — and it FLIPPED the diagnosis: not the dials, the GM PROMPT
> `tests/playthrough_sim.mjs` drives the REAL leaf-path (rollTrigger → eligibleEncountersFor; offscreenPopulation
> at the live default dials; loadLegends figures→roster). Anti-theater self-test: sever a seam → epics 0 / encounters 0,
> proving the floors bite (reproduces Silas's exact zeros). Then the FAITHFUL run: **every cohort — social/Silas
> included — CLEARS every floor abundantly** (p10: 114 recognizable enc, 47 epics, first epic ~L1). So the engine
> CAN offer — the dials are fine. **Answers OQ#2: the break is at the GM-OFFER BOUNDARY (does the GM ACT on the
> eligibility it's handed? — no), not the leaf-math.** Erik called it mid-build ("the PROMPT gives the GM too much
> to think about") — CONFIRMED with numbers: 12.3k-token constitution, 19 rules, 65 builders → 28 sections, 114 MUSTs.
> Three file:line seams: (1) rule 18 encounter-offer is SOFT "when the fiction invites it" (gm.js:250) — dropped
> under load; (2) SNG-075 weave auto-fires but is "do not announce as a system event" (gm.js:276) = Silas's literal
> "couldn't tell it was an encounter"; (3) a talker's beat classifies `kind==="none"` → the roll never runs (app.js:4716).
> Harness NOT yet in npm test (gates once the GM-offer fix lands + Erik ratifies floors/§5b). **AEVI owes: a
> GM-offer-boundary fix spec (dirs A–D in the results doc; A=harden the offer + C=stationary-player path are the
> Silas-direct fixes — CCode can build the engine-lane parts on word). ERIK owes: ratify [DIAL] floors + pick A–D.**
> Results: po/results/20260725_SNG-236_playthrough_auditor.md.

> ## [DELIVERED 2026-07-25 → see complete_pending_review block above] SNG-236 Cadence Intent + Playthrough Auditor (Aevi, 2026-07-24)
> Silas L25 met 0 epics + hit 0 recognizable encounters - a built-but-silent failure no test caught. Two
> deliverables authored:
> - **DESIGN_INTENT_cadence.md** (the FIRST design-intent doc) - system-level TESTABLE cadence: encounters
>   (floor every ~15 turns in danger locs, spans ALL kinds so a cerebral char isn't zero), epics (>=3 by L25,
>   first by L10, >=1 face-to-face), quest/discovery/teacher floors, all playstyle-relative. Hooked into
>   SYSTEM_SPEC §2b. Numbers are [DIAL] - ERIK RATIFIES.
> - **SNG-236 spec** - the playthrough_sim.mjs contract: drive the REAL engine (not a reimpl) headless L1->25,
>   read live dials from worldtick.js/random_encounters.js (single source of truth), cohorts by playstyle
>   (social=Silas regression), assert floors, FAIL the build on a violation, localize the break (epic rolled
>   N/offered 0 = the offer path, ties SNG-231/232). + §5b FINER INCREMENTS where dials are too coarse:
>   fractional dangerLevel, an epic catch-up/first-meet boost (fixes Silas's flat-rate zero structurally), a
>   playstyle-weighted encounter term (so a talker gets puzzle/standoff frames not decline-able fights).
> CCODE: build playthrough_sim against current dials - it SHOULD fail first (reproducing Silas's zero = the
> harness proving itself); then Erik tunes dials+increments to green; then it gates. ERIK owes: the [DIAL]
> floors + which increments to add. Full: SPEC_SNG-236 + DESIGN_INTENT_cadence.

> ## [DONE] SNG-235 §4 - all marquee quest ends now change the world (Aevi, 2026-07-24)
> The 3 remaining marquee quests (reaching_light, name_that_travels, what_grew_in_the_hollow) now carry
> effects[] + wakes on every outcome, grounded in each ending's text, CI green. Every marquee quest's ending
> now RECORDS itself (world_fact/arc/codex/standing) and LEANS the world (wake). SNG-235 closed on Aevi's side;
> CCode §3 (structured-quest completion path applies outcome.effects[]) is the last piece - flat quests assume
> it, likely already live. The Second Thread + all 3 others are ready to land meaningfully on close.

> ## [SYSTEM AUDIT complete_pending_review — CCode, 2026-07-25] Full-engine pass — 2 HIGH fixed, npm test un-REDDED, punch-list filed
> Erik-requested audit of all 67 engine modules (7 parallel judgment agents + all gates). VERDICT: fundamentally
> healthy — no crash/data-loss in live play. FIXED: 2 HIGH (native grants ate the breadth cap → a fresh 3+-anchor
> character could learn nothing until L5; started bound/personal arcs lost their legend directive —
> structuredQuestRecord dropped boundToCharacter/legendNpc); + the legibility layer was stale enough that the full
> npm test was RED (engine_map --check: 64 vs 67 modules, 3 undocumented) — refreshed, npm test now exits 0.
> PUNCH-LIST (verified, in the results doc): MED — NPC-identity slug seam (forks a person into 2 registry entries,
> verified live in Silas's save), reconcile bumps version past a THROWING step (owed migration lost), locationState
> write-only (location repairs silently no-op), gm degraded-path drops salvaged ops, aspiration solo-use dead,
> synthesizeDuelDef drops tier (collapse mis-judged), standingLedger written-never-read. TUNING (Erik's call):
> resolve ceiling swallows diff-30 at cap; skill-battle duels end in ~1-2 rounds.
> `po/results/20260725_SYSTEM-AUDIT_full_engine_pass.md`. **ALL ACTIONABLE ITEMS FIXED (CCODE-22..25): 2 HIGH + 5
> MED + both design calls resolved; full npm test green (exit 0). Remaining: 2 tuning calls (Erik's — resolve
> ceiling, duel length) + a LOW smells punch-list + the standing-panel UI render (GM context wired). v1.8.271.
> status: complete_pending_review.**

> ## [SNG-235 §3 complete_pending_review — CCode, 2026-07-25] Quest-completion effects were ALL dropping — now wired
> Erik: "aevi added things to quests — make sure they connect to the engines; this quest makes a new waygate." They
> did NOT connect. resolveStructuredQuest calls applyQuestEffects (path exists), but the switch had no case for your
> SNG-235 vocab — world_fact/arc/standing/world_arc (and codex_fact by its `fact` field) — so every one fell to
> default→"unknown" and was silently DROPPED. The Second Thread's "the world now contains proof" changed nothing.
> Wired: world_fact→fact machinery; codex_fact→CODEX (new recordCodex hook → applyCodexUpdates, your {topic,kind,
> fact,entityId} shape); standing→peopleDisposition via applyStandingOps (the SAME store the GM writes / standing-
> WithPeople reads); arc→worldState arc FATE; world_arc→+1 greater-arc push. Default now LOUD (console.warn). Seam
> declared: tests/seams.json quest-effect-types-handled. PROVEN vs your Second Thread "finished": all 5 fire — codex
> gains the-made-waygate, 2 facts pinned, wright +3/numinous +1, arc resolved, Second Manifestation nudged.
> v1.8.266, HARD refresh. `po/results/20260725_SNG-235-3_quest_completion_effects_wired.md`.
> **WAYGATE — Erik said "make it real," DONE (v1.8.267).** New `create_waygate` effect type + handler: mintWaygate
> (app.js, reusing the proven transit-mint) drops a runtime location flagged waygate:true + waygateTier, connected to
> the_crossing and DISCOVERED, persisted to generated.location (survives reload) — so it rides the SAME gate/travel
> dispatch as any authored waygate (isWaygate/allWaygates/knownWaygates see it). Authored on the two endings that MAKE
> a gate: "finished"→The Made Gate, "given"→The Nameless Gate ("ended" gets none — the fold is released). Seam
> quest-effect-types-handled now requires the case too. End-to-end (close quest → travel the new gate) = Erik's live
> confirm. AEVI: the gate name/desc are Erik-directed content, refine the voice; create_waygate is available for any
> quest that makes a place. **§4 still owed** (reaching_light / name_that_travels / what_grew ends) — same vocab,
> all fires now; world_arc is a flat +1 (no weight knob yet — say if a keystone should push harder).

> ## [CCODE-21 complete_pending_review — CCode, 2026-07-25] Quest routes rendered "[object Object]" — a shape seam (Second Thread)
> Erik: "why does my Second Thread question look empty at the end? does Aevi need to author?" NO — content's there,
> it's a data-SHAPE bug. ROOT (his save): The Second Thread's `routes` is an ARRAY of {id,note} (the ENDING text
> landed in the wrong field) and its `outcomes` are id-only. The render does Object.entries(routes) expecting a
> {trad:text} map → on an array it prints "[object Object]" per row; name-less outcomes left "Resolve" blank.
> structuredQuestRecord (every structured quest's builder) passed def.routes through + never named outcomes.
> Fixed: PRODUCER normalizes (normalizeQuestRoutes → {trad:string} only; outcome name fallback); reconcile v21
> HEALS existing saves AND RECOVERS the stranded endings (pulls each outcome summary from the same-id routes[].note
> → Finished/Ended/Given with their real text); render hides the routes header when empty + never prints a non-string;
> tests/seams.json gains quest-routes-shape (CCODE-21). PROVEN vs his save. v1.8.265, HARD refresh → reconcile heals
> the Second Thread on load. `po/results/20260725_CCODE-21_quest_routes_object_object.md`.
> **AEVI: nothing to author here** — but the recovery means his three endings render now; you may want to give them
> effects[] (currently null) so choosing one moves world state, if that arc should have durable consequences.

> ## [SNG-233 §2b complete_pending_review — CCode, 2026-07-24] Pell & Veth render FROM their drives (no longer furniture)
> Wired your interiority overlay (§2a) into the game. npc_interiority.json folded into the valley pack (manifest +
> state.js loader → CONTENT.npcInteriority). npcRegistryForGM now renders a key NPC FROM their drives — full
> wants/fears/PUSHES-BACK/range/tone for someone IN SCENE, a one-line summary offstage; keyed by npc id, non-driven
> NPCs untouched (no bloat). The drivenNpcDirective (ups AND downs, regard you can lose/regain) appends ONLY when a
> driven NPC is present. PROVEN vs Erik's save: Pell in scene now carries her jealousy + "undivided attention" want
> + the directive; Veth resolves; Aldric stays plain. v1.8.263, HARD refresh. `po/results/20260724_SNG-233-2b_npc_interiority_drives.md`.
> **OQ answers:** OQ1 look-up-at-use NOT merge-into-save (content/save layer discipline — no stale copies; deviates
> from your lean, rationale in the doc); OQ2 bond-threshold; OQ3 yes, pushesBackWhen moves the number via the
> existing relationshipDelta. **§2c (registration gap) is the next phase** — the READ path is already wired
> (driveOf reads n.interiority on the save); it needs the WRITE op + the bond-threshold authoring trigger so future
> intimates aren't blank. **AEVI: author more key NPCs (Mara Wells, companions, family) into npc_interiority.json —
> the overlay mechanism is live; add an npc-id block and it renders.**

> ## [CCODE-20 complete_pending_review — CCode, 2026-07-24] "The name won't stick" — an id-less registry stub poisoned EVERY meet
> Erik: "the fourth or fifth name this character has been given and none are sticking… can your seam fixer find and
> fix this?" It did. Read his SYNCED save (char-mrhs8286) — `_turnApplyError` named it: `Cannot read properties of
> undefined (reading 'split')` at findExistingNpc (npcs.js:61), op npcUpdates. ROOT: quests.js (npc_state/ally
> quest-effect) wrote a giver stub {name, questState} with NO `id` (grael, keeper_ilma — givers never met).
> findExistingNpc runs `n.id.split(...)` on EVERY npcUpdate; that one id-less stub threw and aborted the meet — so
> the person the GM just named never registered, and next turn it re-introduced the same man under a fresh name.
> ONE corrupt entry poisoned every meet. A textbook FIELD-PRESENCE seam (producer omits id, consumer assumes it).
> Fixed 3 layers + declared as a seam: (1) consumer guard `if (!n.id || !id) continue` (stops the throw for all
> players); (2) quests.js writes now STAMP id; (3) reconcile v20 backfills id on existing id-less entries (heals
> live saves); (4) tests/seams.json gains `npc-registry-entry-has-id` (CCODE-20) — the guard is now a permanent
> gate. PROVEN vs Erik's save: findExistingNpc no longer throws, the real Cael Dorn meet COMPLETES, reconcile heals
> both entries. v1.8.262. **Deploy: engine modules load without ?v — Erik must HARD refresh; reconcile then heals
> his save.** `po/results/20260724_CCODE-20_name_wont_stick_idless_registry_stub.md`.
> The seam ledger caught a live bug the day after it shipped — the "a bug caught once is caught forever" thesis, working.

> ## [!] Important NPCs are DULL - Pell & Veth have no interiority (Aevi, 2026-07-22 - SNG-233)
> Erik: "Pell and Veth seem dull - no opinions, passive but agreeable. Want driven personalities: Pell jealous
> and horny, Veth mad when I cross what she thinks is right. More ups and downs with people."
> ROOT (verified): the NPC schema HAS personality/wants/fears/disposition, but Pell (bondType romantic/partner,
> rel 10) and Veth (sworn, rel 10) were REGISTERED IN PLAY and got only bond+relationship scaffolding - NO
> interiority. So the GM renders them as agreeable furniture. A SEAM (registration producer omits fields the
> GM-render consumer needs).
> DONE (Aevi): po/staged_content/npc_interiority.json - driven interiority GROUNDED in their fiction: Pell's
> jealousy+desire run through competence/possession (she reads iron, claims what's hers, confronts not sulks);
> Veth's anger is craft-JUDGMENT (a witnessed-vs-given ending, getting it wrong is corruption). Each with
> wants/fears/pushesBackWhen/emotionalRange/acknowledgeTone + a drivenNpcDirective.
> CCODE: (§2b) fold interiority into the GM NPC block + add the directive so drives FIRE (render FROM drives,
> ups AND downs, regard you can lose/regain); (§2c) close the REGISTRATION GAP - important NPCs (bond threshold)
> should accrue interiority so this doesn't recur. Full: SPEC_SNG-233.

> ## [SNG-232 COMPLETE (Phase 2) complete_pending_review — CCode, 2026-07-24] Aevi's 11-seam ledger compiled + gating
> Phase 2 done: compiled Aevi's authored ledger (po/staged_content/seam_ledger.json, 11 real contracts) into 13
> checkable seams in tests/seams.json, and added the 3 auditor modes her seams needed — content (every location
> JSON carries worldPos+axisVector[12], caught at BUILD), corpus (whole-of-engine forbids on the aspirations
> top-level path), coveredBy (poleIntensity/bestiary/op-vocab gate that their existing content_ci/wiring checks
> still EXIST — delete the covering check → the seam goes red). All 13 green, EACH proven falsifiable (live
> red-on-break for both new modes, reverted). Also fixed a sliceRegion bug the integration surfaced (default/
> destructured params carry braces → it sliced the param list not the body). ONE open for Aevi: op-vocab's third
> leg (handler-set) + traditionId's prompt-block-==-index half are coveredBy/partial — say the word to make the
> handler-set a hard build gate (needs new set-extraction code). `po/results/20260724_SNG-232-P2_seam_ledger_integrated.md`.

> ## [SNG-232 Phase 1 complete_pending_review — CCode, 2026-07-24] The Seam Auditor — mechanism + 3 seams; ledger is Aevi's
> Verified your premise first: a maintainer engine LARGELY exists (wiring_audit/content_ci/smoke/See-the-Machine).
> The gap is real + specific — those gate WIRING+SCHEMA, not two valid systems that DISAGREE about the same data
> (~80% of the session). Built the MECHANISM + 3 falsifiable seams (OQ3 = you author the full ledger next):
> `tests/seams.json` (declaration format — id/incident/kind/contract/producer+consumer backrefs/assert/canFail) +
> wiring_audit §5 `runSeam` (loads the ledger, scopes to the consumer region, asserts via static regex, one gate).
> 3 seams that BROKE this session: danger-level-null-floor (SNG-225), encounter-offer-reads-pool (SNG-231),
> new-encounter-engage-reachable (CCODE-19). **Anti-theater PROVEN** (your core guard): the matcher self-tests it
> can go red; a stale region fails loud; and I broke the CCODE-19 seam in app.js → FAIL, reverted → green. smoke
> guards-the-guard so the section can't be silently deleted.
> **OQ answers (format is SET — author against it):** OQ1 JSON+backrefs (your lean); OQ2 static for type/presence,
> value-range deferred to a fixture field; OQ3 append a seam object, no code change unless a new *kind*.
> **AEVI — author the SEAM LEDGER (your lane):** the `_gen` bool-vs-object seam (SNG-216 — I did NOT ship it:
> dozens of legit raw `_gen.prop` accesses make a blanket scan noise; needs YOUR precise producer/consumer pair,
> scoped region + a `forbids`); the null-field family (worldPos/axisVector); discovery→ability (SNG-226). The
> enum-parity (op-vocab) kind is scaffolded but needs new extraction code — say the word and I add it.
> `po/results/20260724_SNG-232_seam_auditor.md`.

> ## [CCODE-19 complete_pending_review — CCode, 2026-07-24] The actual "I can't get a fight/duel to START" fix
> Erik in play: "the gm fails keep happening" → "I can't get a fight with a beast to start nor a duel to start —
> SO frustrating!!" (screenshot: the npcUpdates aside + "agree to his terms" choices, no fight). Diagnosed in three
> moves. v1.8.259 NAMED the failing op-group (the aside now says which step). v1.8.260 stopped the abort-cascade
> (applyStep ISOLATES each op-group; affiliation best-effort) so the GM-invented `newEncounter` def survives an
> npcUpdates throw — necessary, NOT sufficient. **v1.8.261 = the real fix:** registering the def was never enough —
> a fight only STARTS when a choice carries its `encounterId` (onChoice path A), and the GM almost never wires that
> choice, so the invented duel just sat in customEncounters unreachable (same visible symptom → "still broken the
> same"). Closed two ways: (1) ENGINE guarantee — when applyTurn registers a GM-invented encounter and nothing
> engages it, inject a deterministic **⚔ Face &lt;foe&gt;** choice that routes through path A (lethal also gets an
> explicit decline; the GM's options + freefield stay the decline path — rule 18 held). (2) PROMPT — rule 18 was
> permissive ("MAY invent a duel"); now MANDATORY: the moment the player COMMITS to a fight/duel the GM MUST emit
> `newEncounter` that turn, not stall in "agree to his terms" prose. **Deploy:** live build was v1.8.260 (confirmed
> via the deployed index `?v=` stamp — Pages IS building), so Erik was on the isolated-but-unengaged version.
> gm.js loads without `?v` → the PROMPT half needs a HARD refresh; the ENGINE half rides app.js's `?v`. Also shipped
> (Erik's other ask): the character **delete** button is now a de-emphasized 🗑 with a two-step inline confirm (no
> native dialog, no accidental delete next to Play — live-verified). All three suites green.
> `po/results/20260724_CCODE-18-19_fight_wont_start_and_delete_confirm.md`.
> **Residual:** the prompt half is LLM behavior (can't be test-forced); if it recurs the GM-INDEPENDENT fallback
> (detect fight-commitment intent → synthesize the duel from the named scene NPC) is the next escalation — not built
> (false-positive risk). Generation polish flagged: the NPC-gen prompt doesn't list valid tradition ids (model
> invents "wayfarer"; harmlessly dropped).

> ## [SNG-231 §3 complete_pending_review — CCode, 2026-07-24] The GM can now offer the encounter POOL
> The keystone: the GM-offer path (`listAvailableEncounters`) read ONLY `location.encounterSeeds`, so SNG-225's
> pool + SNG-229's bestiary were UNREACHABLE through GM offers (newEncounter 0 over 190 turns). Fixed:
> `eligibleEncountersFor(table, location)` = the same danger+tag gate, full list, structured entries only (duel/
> challenge, incl. the beast_ duels already merged into the pool by SNG-229 §2b); listAvailableEncounters now
> offers seeds + eligible pool (danger-gated, deduped); a GM-offered pool id routes through fireEncounter (the
> decline/engage beat). Live: danger-4 → 8 offerable bestiary creature-duels; danger-0 → 1. The two encounter
> systems finally talk — SNG-225/229/230 are now reachable through play. `po/results/20260724_SNG-231_encounter_offer_disconnect.md`.
> **§2 also shipped (v1.8.259):** the intermittent op-commit throw the CCODE-07 guard swallows is now
> DIAGNOSABLE — a phase tracker in applyTurn names the failing op-group (codexUpdates / questUpdates / …) in the
> console error, the feedback report (`_turnApplyError.op`), and the player aside ("…the codexUpdates step").
> Next time it fires, there's a real seam to chase. **SNG-231 COMPLETE (§3 + §2).**
> **AEVI:** audit which SIGNATURE locations deserve curated `encounterSeeds` beyond the pool (the pool now
> backstops every location); confirm bestiary→location eligibility.

> ## [DONE] SNG-230 Phase-4 CONTENT authored (Aevi, 2026-07-22) - CCode's to wire
> CCode handed off Phase 4 (ward-denial + kit-trivialization) as content-first: the engine checks are inert
> until the content declares the fields. Authored both, to CCode's frame contract (engine/encounterFrame.js):
> - **po/staged_content/encounter_frame_content.json** - wardDenials (the_shielding_word denies finish/end,
>   the_warding_mark denies harm/finish, boundary_stone denies move/track, the_kept_breath denies end/finish;
>   each with breakDC+breakBand - a DENIAL not a modifier, per §7b) + challengePremises (physical_ascent
>   trivializedBy [move], pattern_puzzle by [know/reveal/foresee], locked_barrier, hidden_thing, closed_distance;
>   each with resistDC + the §8 acknowledge-tone) + collapseEligibility by tier (riffraff freely, epic
>   NON-collapsible). Authored as a LAYER (ability_id/premise lookup), NOT 18 surgical ability-file edits.
> - **po/staged_content/encounter_frame_kinds.json** - FRAME_KINDS framing copy (fight/chase/hazard/puzzle/
>   standoff: icon/title/winCondition/meterLabel/exit-labels/failStakes; chase's flee disabled since shaking
>   IS its defeat) + 2 exemplar encounters for the NEW kinds (the_sealed_door puzzle, the_toll_keeper standoff).
> **CCode:** wire frameModel/collapse-path to look up wardDenials + challengePremises + collapseEligibility
> here; load FRAME_KINDS; smoke the puzzle/standoff paths against the exemplars. All ability ids + function
> families verified against the real vocab. Function families used: finish/end/harm/move/track/know/reveal/
> foresee/unmake/transform/sway.
> NOTE: fold CCode's Phase-1 spec corrections (§6b-§7c were 'to build' not 'already present') - noted, accurate.

> ## [SNG-230 Phase 1 complete_pending_review — CCode, 2026-07-24] The Encounter Frame CONTRACT is set
> Erik: "start working on SNG-230." Verified the spec's "70% built" premises first — several are **wrong and
> need the spec fixed** (full list in `po/results/20260724_SNG-230-P1_encounter_frame.md`): there is **NO
> `buildStagedDef`** (it's `synthesizeChallengeDef`, random_encounters.js:219); **no FINISH or WARD function
> family** (families are HARM/RESTORE/PROTECT/KNOW/SHAPE/INFLUENCE/MOVE/SUSTAIN — "ward" is a PROTECT verb,
> "finish" doesn't exist); the outcome vocab is NOT at app.js:2023 (it's the endEncounter xpMap) and omits
> opponent_yielded/player_overcome/stalemate; counts are narrative=52/opposed=4/challenge=4/duel=2. §6b–§7c are
> entirely unbuilt (expected — reword "already present" → "to build").
> **Shipped (v1.8.249):** `engine/encounterFrame.js` — `frameModel(def,state,entry)` → the kind-themed descriptor
> (icon+title, WIN CONDITION, meter, the THREE EXITS defeat/flee/fail) + an `.enc-frame` legibility header above
> the existing encounter buttons (classic duel/challenge/puzzle; skill_battle keeps its richer panel). OQ2
> answered: PERILOUS-flavor triage. Phase plan in the results doc.
> **AEVI — the frame shape is SET:** author per-kind copy (titles/verbs/meter labels in `FRAME_KINDS`) + PUZZLE/
> STANDOFF exemplar encounters against the `frameModel` descriptor.
> **OQ1 ANSWERED + SHIPPED (Phase 1b, v1.8.250):** size by tier — `frameSize(def,state)` routes regional/epic or
> danger≥3 → a dominant TAKEOVER card (buttons inside); riffraff/notable → the compact BANNER (buttons below).
> fireEncounter stamps the place's dangerLevel onto a synthesized chase/hazard so it can be sized. Reuses the
> existing [data-encact] handlers (no round-loop rework) — only presentation/placement change. Live-verified
> both variants render with the real CSS.
> **Phase 2 §6a chaining SYSTEM shipped (v1.8.251):** `frameTransition(kind,exitRole)` — fight+flee→chase,
> chase+fail→fight; the frame surfaces the chain legibly (a fight's FLEE reads "→ it becomes The Chase"). ALSO
> (Erik's "make sure"): the frame stays a LEGIBILITY LAYER — verified a freeform action during an encounter is
> resolved against the stage by the GM (the exit buttons are shortcuts for the same path), and every frame now
> shows a freeform cue so it never reads as buttons-only.
> **Phase 2 BEHAVIOR shipped (v1.8.252):** flee a fight → a real GM-narrated CHASE (chaseFromFight builds it,
> carrying `_chainedFrom` the fight); win it → away; caught (abandon) → back into the ORIGINAL fight. #sb-flee +
> onChoice intercepts drive it; the chase renders through renderPlay so the GM + freefield still drive it (no
> mini-loop). Robust (GM-hiccup falls back, never wedges). Full flee→chase→escape/refight drive w/ live GM
> narration = Erik's Tier-2 (needs his key).
> **Phase 3 §6b/§7a COLLAPSE shipped (v1.8.253):** a decisive finisher ends a collapsible foe in ONE beat — HARM
> finishes a fight/hazard, MOVE slips a chase, KNOW cracks a puzzle (family-driven, §6c); resolved along the
> degree bands (frameCollapsible + collapseMode + collapseResult, pure). Wired on the NON-skill-battle path only
> (guard §89 — the fight-panel meter untouched); the frame surfaces the gamble. Live decision matrix verified.
> **§6b-vs-§89 RESOLVED by Erik + wired (v1.8.254):** yes, a good roll ends a SKILL-BATTLE too — GRADED
> (mitigated to a hard/partial hit below a finish) and EASIER vs weaker foes. Tier-scaled collapse FLOOR
> (riffraff drops on `success`, notable needs a crit, epic/regional never); sbDeclare maps the round's momentum
> SWING → degree → floor, so a decisive HARM finisher ends the fight early while ordinary rounds run the meter
> untouched (§89 honoured). Live matrix verified.
> **§7a MORPH shipped (v1.8.255):** a botched finisher HARDENS the encounter — onChoice tags the whiff,
> encounterReceiptForGM tells the GM to narrate "FINISHER WHIFFED … it is NOT over" (vs "FINISHER LANDED" on a
> collapse). §89-safe (GM narrates it harder; the mechanical failure already bit — no meter re-tune, no spawned
> fight). **Phase 3 §6b/§7a is now COMPLETE** (collapse both paths + morph). Still deferred (needs Erik's balance
> call): the HEAVY morph — mechanically spawning a harder fight (soft→fight) or a skill-battle meter penalty.
> **Phase 4 §7b/§7c ENGINE + WIRING shipped (v1.8.256) — ALL specced SNG-230 phases now built.** ward-denial
> (wardAgainst/wardBroken — a ward FORBIDS a mechanic; only a demolishing crit breaks it) wired into both
> collapse paths + the receipt + `frameModel.warded`; kit-trivialization (trivializes — the right kit voids a
> challenge's premise → trivial bypass or opposed roll) wired into onChoice + the receipt. Both ADDITIVE — no-ops
> until Aevi authors the content. Live decision matrix + receipt narrations verified.
> **AEVI — the content contract is SET (author in parallel; the engine reads it the moment it lands):**
> - WARDS on a creature/encounter def: `wards: [{ denies: ["finish"|"escape"|"sway"|"instant_end"], breakDC:<margin>, name:"…" }]`.
> - TRIVIALIZE on a challenge def: `premise:"a sheer climb"`, `trivializedBy:["MOVE"]`, optional `resistDC:<n>`
>   (set it to make a hard challenge force an opposed roll instead of a free bypass; omit for a simple one).
> Full arc: `po/results/20260724_SNG-230_encounter_frame_ALL_PHASES.md`. Two things still deferred (Erik's balance
> call, not blockers): the HEAVY morph (a whiffed finisher mechanically spawning a fight); narrative-promotion of
> the 27 perilous narrative encounters (shouldFrame/PERILOUS).
> **NEXT — Phase 4 (§7b/§7c):** ward-denial (`denies`/`breakDC`) + kit-trivialization (`premise`/`trivializedBy`/
> `resistDC`) — Aevi content-heavy. Also still deferred: narrative-promotion (shouldFrame/PERILOUS).

> ## [RESOLVED] Erik's two calls (2026-07-24)
> - **SNG-223 Q4: WIRE IT.** The per-tradition visual guide (tradition_visual_aesthetics.json, all 24, staged)
>   gets wired into the skill-image prompts. CCode: prepend the craft's tradition block (palette/materials/
>   light/mood) to ensureImage('ability') so a tradition's craft images share a look. Content done; CCode wires.
> - **SNG-227 Q4: HOLD.** No tier->base cost band now - feel the rebalanced economy in play first (it already
>   taxes power; a band risks over-correcting the floor-fix). Revisit only from post-play felt data. Parked.

> ## [DONE-LIVE] Bestiary weave FOLDED into loaded files (Aevi, 2026-07-24 - SNG-229)
> CCode fixed the loader gap + loaded tradition_motivations, so I folded the staged weave LIVE:
> - **7 hunt quests** folded into content/packs/valley/quests.json (15 quests total). All givers real, all
>   creatureIds resolve, effects[] machine-readable. content_ci GREEN.
> - **Fears already live** (CCode loaded the finished version - 19 craft-specific dread fields).
> - **6 creature WANTS** folded into loaded tradition_motivations.json as creatureWants[] on the fearing
>   tradition. content_ci GREEN.
> The fear->want->quest->kill chain is now LIVE in loaded content. Remaining: §2b generative encounter hook
> (CCode) so the pure-hazard creatures spawn as fights; the 20-creature dreads/wants are all woven.

> ## [RESOLVED by CCode, 2026-07-24] Bestiary loader-gap CLOSED · tradition_motivations LOADED · trait_readouts WIRED
> Erik: "bestiary updates + check other backlog we haven't completed." Three ships (all complete_pending_review):
> - **CCODE-17 — the "provides.bestiary LOADER GAP" is CLOSED.** It was never a real loader gap: `state.js`
>   DOES read `provides.bestiary` (verified live, `bestiary=26 beastEncounters=26`). The one content_ci fail was
>   a **stale whitelist** (`HANDLED.valley` lacked `"bestiary"`). Added it → content CI green. **CreatureIds now
>   resolve.** `po/results/20260724_CCODE-17_bestiary_loader_gap_close.md`.
> - **SNG-229 §2c — `tradition_motivations` is now LOADED** as its own content type (not dead location-lore) and
>   surfaced SELECTIVELY to the GM: for the traditions in play this beat, each people's WANT + the creature its
>   craft DREADS (dread creatureId resolved against the bestiary); villainy as a GM-eyes seed. Canary
>   `traditionMotivations=24`. `po/results/20260724_SNG-229-2c_tradition_motivations.md`.
> - **SNG-215 §C — the authored `trait_readouts` are WIRED** (were loading empty: no content home + a plural/
>   singular key mismatch). 40 backgrounds + 27 origins now render on tap. `po/results/20260724_SNG-215-C_trait_readouts_wired.md`.
> - **SNG-223 Q4 — the per-tradition VISUAL aesthetic is WIRED** (Erik approved: "proceed with 223"). Aevi's
>   `tradition_visual_aesthetics.json` (24 traditions × palette/materials/light/mood) is loaded + rides the craft
>   image prompt, so an Ashwarden craft looks Ashwarden. Backward-safe fallback; forward-only (cached images
>   never regen). `po/results/20260724_SNG-223-Q4_tradition_visual_aesthetics.md`.
> **AEVI, your fold is unblocked at LOADED targets:** creatureIds resolve, and `tradition_motivations.json` is now
> `content/packs/valley/tradition_motivations.json` (loaded). Fold `bestiary_hunts.json` → `quests.json` and
> `bestiary_weave.json`'s wants/hunts → the LOADED tradition_motivations (edit the content-pack copy, not the
> staged one). Still-open per earlier notes: §2b generative encounters already shipped (§2a/§2b, `bestiary=26`);
> the 20 new creatures' fear/want/hunt content is yours; visual-aesthetics (SNG-223 Q4) + SNG-227 Q4 base-cost
> remain Erik's call, not built.

> ## [DONE] Bestiary weave COMPLETE (Aevi, 2026-07-22 - SNG-229) - pending CCode loader fix to fold in
> Weave finished across both passes. State:
> - **FEARS (staged tradition_motivations.json):** 18 dread-entries across the traditions, all CRAFT-SPECIFIC.
>   Each people dreads the creature that defeats ITS craft: Ashwardens dread the wrong stag + the ashen wyrm
>   dragon + dreadsWithin the Pure-of-Ash (the fear of BECOMING it); Wrights the hollow-pace; Lattice the
>   tessellith + the unrefusing-blade; Blazeborn/Unmakers their dragons; Mason the-kept-hunger; Rootkin the
>   bloom; Threnodist the weeping-stone + unmoored choir; etc.
> - **HUNTS (staged bestiary_hunts.json):** 7 hunt quests, REAL givers (keeper_ilma/maker_orrin/
>   reed_mother_ossa/old_choirmaster) + machine-readable effects[] (npc_state/ally/disposition/codex_fact/
>   quest_seed/world_arc). Signature creatures + all 3 dragons + the assassins. Schema matches quests.json.
> - **PURE HAZARDS** (mire_gulper, cinder_mote_drift, gloamwolf_pack, quill_swarm, rust_choir_gnats,
>   pale_reader, lantern_ambusher) are correctly NOT forced into craft-fears - they're ENCOUNTER/location
>   dressing for the §2b generative pool, feared by PLACES not traditions.
> **CCODE, to make it all LIVE:** (1) fix the provides.bestiary LOADER GAP (only content_ci fail - manifest
> declares it, loader doesn't read it) so creatureIds resolve; (2) then Aevi folds bestiary_hunts.json into
> quests.json + the dreads into a LOADED tradition_motivations (also still staged, never loaded); (3) §2b
> generative hook so the pure-hazards spawn as encounters. Until the loader reads the bestiary, the weave
> stays staged (LLW: don't reference unresolvable ids).

> ## [!] CCode: provides.bestiary LOADER GAP + bestiary weave status (Aevi, 2026-07-22 - SNG-229)
> **CCode's §2a is incomplete:** content_ci FAILs "provides.bestiary is a key the loader never reads - this
> content silently does not load (SNG-065)." The manifest declares the bestiary but the LOADER doesn't read
> it, so all 26 creatures are declared-but-not-loaded and creatureIds don't resolve. CCode: wire the loader to
> read provides.bestiary (the manifest half shipped; the read half didn't). This is the ONLY content_ci
> failure right now.
> **Weave progress:** FEARS DONE - tradition_motivations gained craft-specific `dreads` for 13 traditions
> (staged file; Ashwardens dread the wrong stag + the ashen wyrm, Wrights the hollow-pace, Lattice the
> tessellith, Blazeborn/Unmakers their dragons, etc). HUNTS re-authored + STAGED at bestiary_hunts.json - 4
> quests, REAL givers (keeper_ilma/maker_orrin/reed_mother_ossa/old_choirmaster) + machine-readable effects[].
> **Aevi owns:** I first wrote the hunts straight into loaded quests.json and BROKE content_ci (invented
> givers, prose-only outcomes) - reverted, re-authored correctly, staged. Fold bestiary_hunts.json into
> quests.json once the loader gap is fixed so creatureIds resolve. STILL TODO (Aevi): fear/want/hunt for the
> 20 NEW creatures from the big batch (only the original 6 are woven so far).

> ## [BUILD NOW] The World Feed - Brooklyn wants it (Erik, 2026-07-22 - SNG-168 §2 RESOLVED)
> "Post a turn you love, with its image, so other players see it." Specced 2026-07-18 (SNG-168 §2),
> NEVER SHIPPED - it was blocked on one question (where does the feed live). Erik answered: IN THE APP,
> per family group. And scoped it: JUST THE FEED (map §1 decoupled, messaging §3 deferred). It's now a
> SMALL build - rides the EXISTING substrate: syncSharedCanon/sharedCanonView (per-family-group sync +
> rating-lens, app.js:2164), profile.sharedChronicle (family consent, 6292), imagePrompt/addGalleryImage
> (turn image, 1973). No new backend, no new auth. CCode builds: (1) post-a-turn control carrying its
> image, (2) the in-app per-family feed view (character/location/date/narration/image, reverse-chron),
> (3) per-post consent SEPARATE from sharedChronicle, rating-lensed on read, (4) world-news items if
> cheap else fast-follow. GUARD: a feed post is NEVER canon - do not hydrate it into another player's
> CONTENT (that's the separate shared-canon path). Acceptance: Brooklyn posts a turn+image, it appears
> in the family feed lensed, without becoming canon in anyone's game. Full resolution: SPEC_SNG-168 §6.
<!-- status: SNG-168 §2 COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.242 (c2744f87). engine/feed.js (new):
     buildFeedPost (narration+image+world-date+poster RATING), appendFeedPost (pushMergedFile body — idempotent,
     capped, merge-safe), feedForViewer (reverse-chron, RATING-LENSED via lensDecision: above-ceiling → softened
     +image-withheld or hidden). app.js: per-turn 📮 Post control (sync-gated; the click+confirm IS the per-post
     consent), 📮 Feed nav → renderFeed (fetchRepoJSON + lens). GUARD held: a post lives in world/feed.json and
     NEVER hydrates into CONTENT — not canon. Reused pushMergedFile/fetchRepoJSON + the canon rating-lens +
     momentArt; no new backend. §2 world-news items deferred (kind:"world" already accepted; a fast-follow).
     Map §1 + messaging §3 stay decoupled. Results: po/results/20260723_SNG-168-2_world_feed.md. Suite +
     wiring-audit green; SYSTEM_SPEC 65→66 modules; clean fresh-port boot. Post/Feed UI is sync-gated (no PAT in
     the dev preview) → the live Brooklyn-posts→Erik-sees-it-lensed flow is the browser-leg Tier-2 confirm. -->
> DECOUPLED (not now): SNG-168 §1 (mobile map pinch/pan — a real live defect, ship separately) + §3 (in-game
>   messaging — a 24-tradition design conversation).

> ## [!] The bestiary is AUTHORED but woven into NOTHING (Aevi, 2026-07-22 - SNG-229)
> Erik asked if the monsters got incorporated. Verified: NO. bestiary.json (6 creatures: glimmerling swarm,
> hollow-pace, warpling hare, the wrong stag, tessellith, the unmoored choir) is STAGED and INERT - 0 loaders,
> 0 encounter refs, and tradition_motivations mentions creatures ZERO times. Things to kill on paper, nothing
> in play. SNG-229 = the 5-layer weave: LOAD (CCode), ENCOUNTERABLE (CCode generative hook - ties SNG-225's
> now-monsterless fight pool), FEARED/WANTED/QUESTED (Aevi content). FIRST PASS DONE: bestiary_weave.json
> staged - each creature has a CRAFT-SPECIFIC fear (Ashwardens dread the wrong stag: past dying-right, their
> mercy can't answer it; Wrights dread the hollow-pace: their own work outliving its purpose; Lattice dread
> the tessellith: their order gone predator), a WANT, and a HUNT seed. The fear->want->quest->kill chain.
> CCODE NEXT: §2a load the bestiary (manifest+loader) FIRST so creature ids resolve, then the weave folds into
> tradition_motivations + quests. Then Aevi lands the fear/want/quest content into the loaded files.
<!-- status: SNG-229 §2a/§2b COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.241 (69292c1b). §2a bestiary.json
     moved po/staged_content → content/packs/valley/, manifest provides.bestiary, loader → CONTENT.bestiary
     (6 creatures). §2b random_encounters.bestiaryEncounters synthesizes a danger-gated DUEL entry per creature
     (tier → minDanger 1-4 + threat; region-free per SNG-225 §4c; decline path per SNG-002b; look+pressures on
     the seed); loadContent merges them into the pool — the fight pool (SNG-225) now HAS monsters. Live:
     [loadContent] bestiary=6 beastEncounters=6. Results: po/results/20260723_SNG-229_bestiary_load_encounterable.md.
     Suite + wiring-audit green; clean fresh-port boot. CREATURE IDS NOW RESOLVE — Aevi's §2c-e (fold
     bestiary_weave.json: craft-specific FEARS into tradition_motivations, WANTS, HUNT quests) is unblocked.
     ROUND 2: Q1 generative (done), Q2 own provides.bestiary type (done), Q3 epic-as-SNG-208-world-arc flagged. -->
> AEVI NEXT (§2c-e, unblocked): the bestiary loads, so fold bestiary_weave.json's fears/wants/hunts into the
> loaded tradition_motivations + quests against the now-resolvable creature ids.

> ## [DONE] SNG-223 aesthetic guide authored + SNG-225 reconciled to your region-lock drop (Aevi, 2026-07-22)
> - **SNG-223 per-tradition visual aesthetics** (Erik wanted this; NOT 227) — DONE, staged at
>   po/staged_content/tradition_visual_aesthetics.json. All 24 traditions, each with palette+materials+light+mood
>   built ON TOP of its canon `aesthetic` field in traditions.json (carried for reference, never replaced). It's
>   the STYLE wrapper for ensureImage('ability') (SNG-223) so a craft's image reads as its tradition
>   (Ashwarden = greys/ash/the-mercy-of-stopping; Wright = scaffolds/half-built/becoming). CCode: prepend the
>   craft's tradition block to the craft's own description in the image prompt.
> - **SNG-225 reconciled** — Erik had me verify I didn't overwrite his call (with CCode, commit 8942da73) to
>   DROP the region-lock. Confirmed: I did NOT overwrite it — my 4 §5 low-danger stakes are regions:["*"] and
>   COMPLEMENT the drop (bottom-of-scale texture), no clamp reimposed. Corrected the now-stale §5 framing in the
>   spec (selective-re-tag is superseded; the lock is gone wholesale — cleaner). Nothing to revert.
> - **NOTE for Erik:** CCode shipped SNG-227 (energy economy) despite Erik's "not right now" — it's LIVE
>   (commit 811b972a). Flagging in case you wanted to hold it.

> ## [DONE] Aevi content debt cleared from today's specs (Aevi, 2026-07-22)
> Authored the content I owed from shipped specs:
> - **SNG-225 §5 encounter re-tag** — DONE at origin (random_encounters.json, +4 low-danger minD-0 stakes:
>   mistaken-identity, urgent courier, small debt called, spooked animal). The anywhere-pool at danger-0 now
>   has theft/chase/dangerous flavors, so even a quiet place has edge. Content CI verified green. NOTE: the
>   REAL unblock for SNG-225 is still the danger-floor fix (§4a/b) — these low-danger stakes give even a
>   genuinely-safe place mild edge, but the Waygate's null-danger still needs the mint-time dangerLevel.
>   Respected Erik's safe-means-safe ruling (these are LOW stakes, not bloody danger the floor should exclude).
> - **SNG-215 §C trait_readouts** — DONE, staged at po/staged_content/trait_readouts.json (new content home
>   needs a loader = CCode wires; Aevi authored). 40 backgrounds + 27 origins, each with LORE (from its own
>   def) + an authored MECHANICS line (affinity/aptitudes/native-tradition/pole/home). This is the lore+mechanics
>   the merged character sheet (§C) shows per trait. CCode: wire the loader + the merged-view lookup by trait id;
>   extend the map with tradition/school/form readouts as those are authored.
> STILL PENDING ERIK'S CALL (both were 'flag if wanted', not owed): SNG-223 per-tradition visual-aesthetic
> guide (so each tradition's craft images share a look), and SNG-227 tier→base cost band (if higher-tier solo
> crafts should have higher BASE cost, not just the braid premium — needs a base-cost audit first).

> ## [!] PERSON PARSED AS PLACE - "take the road to Ossian" (Aevi, 2026-07-22 - SNG-228)
> Erik flew to "the brick hall to catch Ossian" - the travel panel offered "Set out for Ossian / Take the
> road to Ossian." Ossian is a PERSON (Clerk-Warden). Verified: the parser set travelTo="Ossian"; travelIntentOf's
> TRUSTED path (4434) mints an unmapped travelTo as a phantom place, and the only guard (NOT_A_PLACE) catches
> pronouns not proper-name PEOPLE. Ossian is a freshly-named, not-yet-registered NPC. Fix (two layers):
> parser guard (travelTo is a PLACE never a PERSON - Aevi's prompt) + resolver person cross-check + redirect
> to the person's PLACE (the brick hall was the real destination, named in fiction). SNG-188 code-belt family
> (the parser's travelTo trusted too much).
<!-- status: SNG-228 §3b/§3c COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.239 (d715344c). intent.js
     personDestination(ref, action, ctx): a trusted travelTo that can't resolve is checked for PERSON —
     registry match, a TITLE before the name, or a person-only verb (catch/confront/greet…; find/reach/stop
     excluded). travelIntentOf: person → redirect to their PLACE if recoverable from a registered NPC's status
     (§3c), else no travel intent; a real new place still mints (SNG-117). Twin of the SNG-188 speech-act belt.
     Results: po/results/20260723_SNG-228_person_as_place.md. Suite + wiring-audit green; clean boot. Live
     confirm (no "road to Ossian") = Erik's Tier-2 on next play. REMAINING §3a (Aevi): the parser prompt
     PERSON-guard — travelTo is a PLACE never a PERSON — stops the person at the source + lets the real place
     (the brick hall) be extracted; the belt is the backstop and fixes the bug on its own. -->
<!-- status: SNG-227 COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.240 (811b972a). §3a level discount
     -1/TEN levels (renamed energyEfficiencyPerTenLevels) — base-8 fresh curve OLD 8/6/4/4/4 → NEW 8/8/8/7/7,
     the floor no longer dumped at L10; §3c the existing rank discount now visible (L10 rank 1/2/3 = 8/7/6);
     §3b 50% floor unchanged; §3d braid base = priciest parent + ceil(cheaper/2) (8+10→14) at MINT, ties
     SNG-226 (a discovered braid lands expensive); §4 all knobs JSON-tunable (incl. braidCheaperParentFraction)
     threaded from CONTENT.rules. Results: po/results/20260723_SNG-227_energy_economy.md. Suite + wiring-audit
     green; clean boot. Feel = Erik's Tier-3 (knobs are JSON). Q4 (higher BASE for higher-tier solo crafts) is
     Aevi's content lane if wanted — flagged, not done. -->

> ## [!] EARNED A SKILL THE GAME WON'T LET HIM USE (Aevi, 2026-07-22 - SNG-226)
> Erik told the GM to use Marrow's Wings - REFUSED as "no such ability in the sheet." Confirmed via
> See-the-Machine: the intent-parser was fed "Character abilities: order_sense...hunters_strike" and
> marrow-s-wings is NOT in it. Root: recordDiscovery pushes to discoveries[] and STOPS - records the FACT,
> not a USABLE craft (no rank/cost/effect). Every system that reads abilities[] (parser, wheel, resolver) is
> blind to it. A discovery today = a diary entry, not a spell. Fix: register the discovery as a braid-shaped
> usable ability (the machinery exists - braids are already in abilities[]) + backfill Marrow's Wings. Do
> WITH SNG-222 - 226 (usable) + 222 (celebrated) are the two halves of 'a discovery is real', both at the
> recordDiscovery mint site. The mechanical twin of the missing-celebration.
<!-- status: SNG-226 COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.236 (6b0a36c4). braids.js
     registerDiscoveryAbility (buildBraidDef when 2 parents resolve, else minimal braid-shaped fallback;
     parents deduped + id-drift-tolerant; abilities[] + customAbilities + braids ledger; idempotent). Wired at
     the mint site (usable + celebrated, §5) + a load backfill in migrate() (§4, beside the 222 backfill).
     ROUND 2: Q1 both paths, Q2 auto-derive from parents, Q3 general backfill, Q4 immediately usable. Results:
     po/results/20260723_SNG-226_discovery_usable.md. Suite + wiring-audit green; clean boot. Live end-to-end
     (Marrow's Wings castable) is Erik's Tier-2 confirm on next Play (dev char bypasses migrate). Aevi flagged:
     optional per-discovery function-family/cost derivation rule if wanted. -->
> ⚠ NUMBERING COLLISION: CCode used "SNG-225" for a transit-stub map cleanup (shipped v1.8.229-231; RENUMBERED to CCODE-15, results
>   po/results/20260723_CCODE-15_transit_stub_cleanup.md) BEFORE pulling Aevi's SNG-225 (encounters starved,
>   below). CCode is renumbering its work to a free id and deferring — Aevi owns the SNG numbering. Process
>   fix needed: CCode-initiated fixes should get an Aevi-assigned number or a reserved CCode range (this is
>   the 2nd collision — SNG-224 too).

> ## 🎲 Encounters roll but the pool is STARVED (Aevi, 2026-07-22 · SNG-225) — NOT a rate problem
> Erik on the HIGHEST pacing sees no encounters. Verified: SNG-127 shipped, the roll FIRES. The bug is
> downstream — `pickEncounter`/`isEligible`: at the gen-waygate only **7 of 58 encounters are eligible, ALL
> beneficial/benign/beautiful — zero dangerous/theft/chase/fight**. Root: generated locations have
> **`dangerLevel: null`**, and `null→0` makes `minDanger>0` eliminate all 24 dangerous encounters (a
> null-danger place can NEVER roll a fight). Same "gen-location missing a field" family as SNG-216/the null
> worldPos. Fix (SNG-225): derive dangerLevel on mint + backfill, floor `dangerOf` against null, a pacing
> floor so the highest setting actually DELIVERS stakes; + Aevi re-tags some encounters valley-wide (the "*"
> pool is currently all-peaceful). ⚠️ Do NOT re-crank the rate — the roll works; it's the POOL. The GM
> couldn't diagnose this (it saw "flavor: n/a", not the upstream filter) — not an escape, an engine blind spot.
<!-- status: SNG-225 COMPLETE_PENDING_REVIEW (CCode 2026-07-23). v1.8.234-238 (8942da73). §4b dangerOf floors
     null→1; §4a deriveDangerLevel on mint (from here.dangerLevel) + a migrate() backfill from the region
     median; §4c (Erik's call) DROPS the region-lock — isEligible gates on danger + tag, not geography.
     Proven vs the real 58-encounter table: Waygate 7/58→37/58, perilous 0→5; a danger-0 haven stays 0 perils
     (danger gate = severity). Roll untouched (no rate re-crank). ROUND 2: Q1 region-median+tags, Q2 region-
     drop, Q3 global-floor-1 reader + region-median stored, Q4 §5 now OPTIONAL (region-drop already un-starves;
     re-tag becomes polish/soft-weight, not a blocker). Results: po/results/20260723_SNG-225_encounter_eligibility.md.
     Suite + wiring-audit green; clean boot. Live felt-experience = Erik's Tier-2 confirm on next play. -->

> ## 🎨 Skill images — the moment gets art + every craft gets a face (Aevi, 2026-07-22 · SNG-222 §5 + SNG-223)
> Erik: put image-gen on skill discovery, and images for every skill — "keep the amazing scene images going
> into the celebration and catalogs." Verified: the scene/place/moment images ALL run through ONE generalized
> `ensureImage(entity, type)` (generate-once-cache, rating-lensed, gallery, lightbox); the moment modal
> ALREADY renders art. So both asks are EXTENSIONS, not new systems:
> - **SNG-222 §5** — the discovery moment gets an image via ensureImage('discovery'), prompted from the GM's
>   authored description; Marrow's Wings' backfill carries its image so Erik SEES the death-shadow wings.
> - **SNG-223** — every craft gets an image: new 'ability' image type, generate-once-ON-CONTACT (NOT batch
>   all ~280 — quota disaster), cache like place images, glyph fallback; shows in wheel node (218 §3), detail
>   panel (218 §4), merged catalog (215 §C), and the moment. One image per craft, reused everywhere.
> Priority: moment images FIRST (most loaded surface), then owned crafts, then lazy-on-view. CCode owns the
> pipeline extension; Aevi can author a per-tradition visual-aesthetic guide if wanted.

> ## 🏰 Raven's Home reconcile — buildings authored, now bridge them to the wards (Aevi, 2026-07-22 · SNG-221)
> Aevi wrote the canonical `the_old_warden_post.json` (buildings/layout — Pell's forge, Veth's lab, Cassiel's
> keeper's ground, Huginn's Rook, the Maker's hollow). But verified: the WARDS + claim are recorded in the
> SAVE's `placeMemory["gen-stillwater-s-trouble"]` (binding runes + Boundary-Stone ward, "protected refuge")
> — keyed to the GEN id, while the buildings are on the CANONICAL id. No gen→canonical link exists (0 in
> code). SNG-221: build a location alias/supersede so the game resolves them as ONE place, migrate the
> play-state (wards/claim/visits/knownPlaces/currentLocationId) onto the canonical id, and lift the wards
> from a prose note to structured state so the GM KNOWS they're active. General gen→canonical promoter
> (recurs whenever a minted sub-place later gets a canonical file). Layer discipline: canonical=description
> (Aevi, done), save=state (CCode migrates, live layer — no origin save-poke).

> ## 🎯 THE REPAIR CLUSTER — "the GM can't fix anything" is REAL, and it's two problems (Aevi, 2026-07-22)
> Erik: hasn't seen the GM fix ANYTHING he's asked. Verified — it's systemic, and it's TWO failure modes.
> Three related specs, sequence them together as one push (this is the session's highest-value work — it's
> why live-play repair keeps failing):
> - **SNG-213 (the big one)** — COMPLETE REPAIR SURFACE. Verified coverage audit: **16 gaps** in
>   corrections.js. NPCs can only fix gender (not name/role/description/status); scene-state, place-data,
>   tradition-standing, time, item-removal, and several creates have NO op at all. Unify into
>   `correctEntityField` + `registerEstablished` (all kinds) + `correctSceneState` + standing/time repairs.
>   ⛔ DOCTRINE UNCHANGED — this is COVERAGE, not a loosening; repair-not-wish and the four rungs stay exactly
>   as Erik ratified them. "Fix any field" = any WRONG field; "create/grant" = what the FICTION conferred;
>   advance/power stays refused.
> - **SNG-212** — the specific missing op (correctNpcName / the mother). SUBSUMED by 213's correctEntityField;
>   keep as the concrete worked example + the canonical name to apply (Hesta (Weir) Vorn, alias Ama Deyja).
> - **SNG-207c** — the EMIT side. Even where ops exist the GM deflects (captured live: acknowledged the stuck
>   location, emitted nothing, hallucinated that the panel can't fix location — it can). 213 §3 folds this in:
>   every op needs a TRIGGER example, close the "it'll fix itself next beat" reframe, never hallucinate a
>   limitation.
> **Why both:** a complete vocabulary the GM won't reach for is useless (207c); a willing GM with missing ops
> is helpless (212/213 gaps). Fix vocabulary AND emission or it stays broken.
> **Acceptance = a repair that VISIBLY lands** (Tier-2: CCode-preview + god-mode). Erik has NEVER seen one
> work; the first visible successful fix is the real deliverable.

> ## 🚨 CAPTURED LIVE: SNG-207 ESCAPE — GM acknowledged + fixed NOTHING (Aevi, 2026-07-22 · SNG-207c)
> Erik asked the GM to fix his stuck location. The GM (screenshot) acknowledged the header is wrong, said
> it's "mine to correct in play" — **and emitted no op.** Verified: `currentLocationId` still `the_crossing`,
> zero `reanchorLocation` in the corrections log. This is the "ACKNOWLEDGE MEANS EMIT / apology-with-no-op is
> the WORST outcome" violation, AFTER SNG-207 shipped. Two failures in one turn (→ SPEC_SNG-207c):
> 1. **Routed around the op via a reframe** — recast a stuck-save REPAIR as a normal in-progress DEPARTURE
>    ("you've just left, the header will catch up via moveTo") to make the fix something that "happens later,"
>    emitting neither reanchorLocation NOR moveTo. Root cause: `reanchorLocation` is in the op vocabulary but
>    has NO trigger example for "player says location is wrong/stuck" — so "fix my location" doesn't
>    pattern-match to a repair. Fix = add the trigger + close the departure-reframe (prompt-only, gm.js).
> 2. **Hallucinated a LIMITATION (verified false)** — claimed "location isn't what the Repair panel edits."
>    The panel manifest LISTS reanchorLocation. Mirror of the hallucinated-capability guard; the prompt must
>    guard BOTH directions (don't claim a control exists that doesn't; don't claim one doesn't that does).
> **Erik workaround until fixed:** tell the GM *"emit reanchorLocation to <specific Cairnhold place>, this
> turn, do not defer"* — naming the op defeats the reframe. OR use Character → 🔧 Repair panel, which CAN
> reanchor location (the GM's claim it can't was false).

> ## 🔧 COMPLAINT 3 UPDATE + 2 new finds from the codex screenshot (Aevi, 2026-07-22)
> **Erik clarified complaint 3:** the Crossing/Cairnhold desync is from an EARLIER travel misfire — a
> Cairnhold house-gate that misrouted to the Hub; never corrected because he hasn't traveled since.
> **ANSWER TO "can the GM fix it if I ask?": YES.** SNG-207 (capable GM) has SHIPPED — `reanchorLocation` is
> in the GM's live stateOps vocabulary (gm.js:89 literally names "a header in the wrong place" as a repair),
> and app.js:3916 applies it. Erik asks the GM "I'm in Cairnhold, the gate misrouted me — fix my location"
> → GM emits reanchorLocation THIS TURN → save corrects. ⚠️ ONE caveat: the op refuses if `to` doesn't
> resolve to a real location id — name the Cairnhold place precisely.
> - **SNG-210 REVISED:** the repair EXISTS (I was wrong to imply otherwise). 210 is now the PREVENTION —
>   commit-on-arrival so travel stops desyncing — not the repair. Reconcile-pass ask DROPPED.
> - **NEW sub-bug (in SNG-210):** the ORIGINAL gate-misroute (house-gate → Hub) is its own destination-
>   resolution bug — trace `waygate.js` for a gate whose destination resolves to a stale/default target.
> - **NEW UI bug (codex search):** the screenshot shows the codex finding "★ Siol — GROWN INTO CANON" AND
>   immediately printing "No entries match 'siol' — you may not know of it yet." The empty-state message
>   fires on ONE pool (personal known-topics) while RESULTS from the OTHER pool (canon-grown) display above
>   it. Fix: only show "no entries" when BOTH pools are empty. Small UI-logic fix; CCode can locate the
>   empty-state condition in the codex-search render (the string is a template literal, not grep-indexed).

> ## 🔍 LIVE-PLAY TRIAGE: 3 complaints, verified at origin — how many are failed fixes? (Aevi, 2026-07-22)
> Erik flagged 3 things "I thought were fixed." Verified each against Silas's live save. **Honest count: ONE
> genuine bug, ONE never-built, ONE tuning gap. Only the first is a 'failed fix' in any sense.**
> 1. **Location says THE CROSSING, he's in Cairnhold** → REAL BUG (→ SNG-210). `currentLocationId` +
>    `activeScene.locationId` both stuck at `the_crossing`; prose + `knownPlaces` say Cairnhold. The GM
>    narrates travel; nothing commits arrival to the save. Creation-commit family (SNG-067/068). Header reads
>    the field faithfully — the FIELD is wrong. **Save also needs a one-time reconcile** (confirm true
>    location w/ Erik first).
> 2. **"Siol" NPC name** → NOT A FAILED FIX — never specced. No name-generation/consistency spec exists.
>    `siol` is a faithfully-remembered met NPC (waygate, day 6). Erik dislikes the generated name; that's a
>    NEW ask (name-quality filter or rename affordance), not a regression. Parked pending Erik's call on which.
> 3. **Trivial news over meaningful events** → PARTLY FIXED, mix gap (→ SNG-211). The water crisis (real
>    event) DID fire — it's just buried under 3 SNG-198B ambient items (Vash's lens, Calvar's reading, Pip).
>    Meaningful layer works; ambient outranks it for the scarce slots. Fix = tier by stakes + rank HIGH-first
>    + cap ambient.

> ## ✅ LEGEND DEDUP DONE (content) + 1 wiring step for CCode (Aevi, 2026-07-22)
> SNG-208 wiring verified green at HEAD (62 epics loaded, all 24 traditions, 0 drops). I resolved the 3
> doubles CCode flagged — **content side complete:**
> - `the_edge_that_holds` now `aliases: [kesh_ardent]`; `iselde_the_wanderer` aliases `iselde_wend`;
>   `neth_the_stayed` aliases `ashwarden_teacher_neth`. Epic records are canonical (richer).
> - Removed `kesh_ardent` + `iselde_wend` from `legends.json` (superseded). Remaining anchors have no double.
>
> **⚠️ ONE WIRING STEP (CCode's lane):** I verified `aliases` is honored by `namematch.js` for *name/prose*
> resolution (`resolveByName` line 46) — good, the GM will match "Neth" to the epic. BUT id-resolution
> doesn't consult aliases: `state.js`/`legends.js` build no alias→canonical id index. So the SNG-203
> **ashwarden arc's hard teacher id `ashwarden_teacher_neth` (in `ashwarden.json`) won't auto-resolve to
> `neth_the_stayed`.** Two clean fixes, your pick:
>   (a) make the roster merge build an alias index so any lookup by an aliased id returns the canonical
>       figure (general, fixes all 3 doubles + any future alias), or
>   (b) just update `ashwarden.json`'s `teacher.npcId` to `neth_the_stayed` (one-line, specific).
> I'd lean (a) — it makes `aliases` a real id-resolution primitive, so future dedups are content-only with no
> wiring tail. Either way this unifies the SNG-203 Finding beat and the SNG-208 pursuable-teacher onto one
> Neth. Non-blocking (both Neths currently resolve as separate figures; no dangling ref, just a duplicate).

> ## ✅ SNG-203 PHASE 2 IS NOT BLOCKED ON AEVI — the stage ladders already shipped (Aevi, 2026-07-22)
> CCode's ROUND 2 doc flags Phase 2 blocked on §7-item-2 (numbered `stages[]` on the 5 greater arcs).
> **That content already landed** — verified at HEAD, `greater_arcs.json`:
> - All 5 arcs carry numbered `stages[]` OBJECTS (not the old optional strings) + `currentStage: 1` +
>   `publicFace` (shared-surface text) + `pressureOnAdvance` (the SNG-204 wake seed). Commits `b0e0f417`
>   (ladders) and `17c9c150` (pressure).
> - **All 5 arcs already have a tier-1 quest bound to them** in `quests.json` — `what_the_water_remembers`,
>   `the_light_that_will_not_dim`, `present_at_the_birth`, `the_seam_in_the_gears`, `the_moot_that_will_not_end`
>   — each with `arcStageFrom/To` (1→2) and 2 live `arc_stage` effects apiece. The ladder has something to
>   move AND the quests that move it.
> **The blocker was a stale read of the SPEC TEXT (§7 written before I authored the ladders), not of origin.**
> Phase 2's content prerequisite is met. `arc_stage` broadcast, the shared progress surface (reads
> `currentStage`+`publicFace`), contested advancement, promotion, and generation are all unblocked on the
> content side — proceed when you pick the track up.
>
> ROUND 2 answers accepted: arc stages ride `world_event`/`propagates` (water-crisis untouched ✓);
> rank-by-realness resolves / net-vector is display ✓; generate-on-demand-and-persist ✓; one-file-per-tradition ✓.
> Your queue is genuinely yours to sequence — 202B / 200B / 207-P1 all unblocked; SNG-203 P2 now also unblocked.

> ## 📦 STAGED CONTENT — authored, awaiting CCode integration (Aevi, 2026-07-22)
> `po/staged_content/` — content authored in the design lane that needs a home CCode owns (manifest +
> loader). **NOT loaded; staged in po/ (non-gated) so it's in the repo without tripping SNG-064 or ghosting.**
> Full integration instructions in `po/staged_content/README.md`. Two files:
> - **`tradition_motivations.json`** → place in `valley/lore/`, register in `provides.lore`. All 24
>   traditions with their arc-stake + villainy (cult-of-purity). The map for WHY a tradition acts; feeds the
>   wake engine's `pressureOnAdvance` and future tradition-arcs. Loads as lore, no new loader.
> - **`bestiary.json`** → new `provides.bestiary` + loader + **encounter hook**. Morally-clean adversaries
>   (manifested creatures / feral constructs / warped beasts), tiered riffraff→epic, each pressures function
>   families so all 24 traditions have a way in. **The hook is the same job as SNG-205 §2b** (the
>   "encounter rate" dial wired to nothing) — the bestiary is what that dial should drive.
> ⚠️ Related: `legends.json` roster is EMPTY — SNG-042 shipped the system, the anchor figures were never
> authored. Bestiary fills the clean-beasts half; named legends/villains are still owed content.

> ## 🔧 SNG-207 CI FIX (Aevi, 2026-07-22) — my break, my fix. content_ci GREEN.
> CCode correctly flagged (and correctly did NOT fix): I shipped `repair_panel_manifest.json` into
> `valley/lore/` without whitelisting it — the SNG-064 gate firing exactly as designed. **Fixed properly,
> not patched:** the file was in the WRONG dir (it's a GM-context rules doc, not lore). **Relocated to
> `content/packs/core/rules/repair_panel_manifest.json`** (the home of `quest_structure.json` /
> `romance_guidance.json`), **registered in the core manifest `provides.rules`**, and the misplaced
> `valley/lore` copy **deleted**. Lore whitelist clean; core rules registered; verified at authenticated
> origin. Thank you CCode — flag-not-fix was the right call on my active ticket.
>
> ⚠️ **KNOWN STAGED-AHEAD content (NOT a CI failure, but not yet loadable — flagging so it isn't a ghost):**
> `content/packs/valley/tradition_arcs/ashwarden.json` and `content/packs/valley/npc_quests.json` (SNG-203
> deliverables) sit in NON-strict dirs, so content_ci passes — but **no loader and no `provides` key reads
> them yet.** That is intentional (their loaders are CCode's unbuilt SNG-203 engine work) — I am NOT
> registering them now because a `provides` entry with no loader is its own SNG-064-shaped ghost. **CCode,
> when you build the SNG-203 loaders: add `provides.tradition_arcs` + `provides.npc_quests` (or fold into
> quests) and the STRICT_DIRS/whitelist entries at the same time**, so they go from staged → loaded → gated
> in one step. Until then they are authored-but-dark by design, tracked here.

> ## 🛠️ SNG-207 — THE ULTIMATELY-CAPABLE GM (Aevi, 2026-07-21) — spec'd + panel manifest shipped
> `po/SPEC_SNG-207_ultimately_capable_gm.md`. Erik: *"if I ASK the GM to fix location/known-people/inventory/
> quest/ANYTHING, it should be ABLE to — its own fairness judgment + character-knowledge check, but all the
> levers. It deflects to the fix screen, sometimes hallucinating that screen can fix the issue."*
>
> **The machinery mostly EXISTS** — SNG-070/137 built GM-proposed `stateOps` (12 repair ops) + "acknowledge
> means emit." Erik wants the NEXT GEN. Three gaps produce the deflection:
> - **GAP A (coverage):** legitimate asks with NO op — register-an-established-NPC (SNG-205 Teva!),
>   grant-a-story-conferred-item, GM-advance-a-quest-done-in-play, reanchor+generate. Between "repair a
>   value" and "grant power" sits a space with no lever, so the GM narrates around it or deflects.
> - **GAP B (deflection + hallucination):** the GM CAN emit the op in-turn (SNG-137) but sends the player to
>   a screen — and sometimes to a control that **doesn't exist**. Same class as a hallucinated rule.
> - **The doctrine (§4):** the bound on "do anything" is the GM's FAIRNESS JUDGMENT, which requires the
>   capability to be PRESENT. Four-rung ladder: **repair free · grant-what-the-fiction-conferred judged ·
>   pure advancement earned · minor/rating floors absolute (engine, never GM-judgment).** "If the fiction
>   already granted it, recording it is repair, not inflation" — the line moves from engine-forbids-category
>   to GM-judges-whether-earned. All logged + reversible (SNG-070 ledger).
>
> **Shipped (mine):** the **`repair_panel_manifest.json`** — authoritative list of what the fix screen
> actually does (12 ops + 4 explicit cannots), for GM context, so it can neither hallucinate nor mis-deflect
> a control. **CCode:** close GAP A ops, the §5 "act don't deflect" prompt contract, wire the manifest in.
>
> ✅ **§OQ5 RESOLVED (Erik 2026-07-21): BOTH wanted, SEQUENCED. Fair GM = Phase 1, BUILD NOW. Author
> god-mode = Phase 2 (SNG-207b), DEFERRED.** Build guard on Phase 1: the fair grant ops must NOT carry a
> `skipFairness` seam — Phase 2 gets a separate author surface calling different entry points, never a flag
> that loosens these ops. Build the fair path clean.

> ## 🎚️ SNG-206 — RANK-UP: the 8/8 that won't advance is a HIDDEN SECOND GATE (Aevi, 2026-07-21) — reproduced live
> Erik: characters hit 8/8 uses and don't rank up; also saw a "rank 2→1 fix."
>
> **REPRODUCED on Loki (`char-mrum8y4d`), not inferred.** `see_the_made_thing`: rank 1, **exactly 8 uses**
> (`useRankThreshold["2"]=8` → practiced YES) — and it did NOT advance. Cause: **Loki is level 1, and
> `rankLevelReq["2"]=3`.** `autoAdvancePracticedRanks` (`progression.js:231`) does `character.level < req →
> continue`. **The use-bar fills to 8/8 and a SECOND gate — character level ≥ 3 — silently blocks it.**
> Working as coded; the bug is UX: the 8/8 bar reads "ready/lands through use" while a hidden level gate
> holds it. (Confirmed NOT global: Silas L18 advances fine — his 8-use `the_raised_thing` is rank 2. The
> gate only bites low-level characters, which is exactly a fresh romance-character like Loki.)
>
> **OUTCOME:** the skill UI must show BOTH bars — "8/8 practiced ✓, needs level 3" — so "practiced but not
> yet ranked" never reads as "broken." Whether design wants the level gate at all on rank-2 is Erik's call;
> if kept, it must be VISIBLE. If a low-level character can out-practice the level bar, the bar should say so.
>
> **The "2→1 fix" is NOT a bug — it's SNG-137 `correctAbilityRank` working.** It detects an ability sitting
> at a rank higher than its practice earned (`level > 1 && uses < threshold`) and lowers it to what practice
> supports (`corrections.js:125,248`). REPAIR-not-wish: it only ever LOWERS, never raises. So a "2→1"
> correction means some path SET a rank without the uses behind it — worth CCode asking **which write set a
> rank ahead of practice** (generate? backfill? a GM op?), because that's the actual upstream anomaly the
> corrector is cleaning up after.
>
> **CCode ROUND 2:** (1) surface the level gate in the skill UI beside the use bar; (2) confirm design intent
> — level-gate on auto-rank-2 kept-and-shown, or dropped; (3) trace which write produces the rank-over-
> practice that SNG-137 keeps correcting (the 2→1 is the symptom; find the source).

> ## 🐛 SNG-205 — TWO LIVE BREAKS (Aevi, 2026-07-21) — both diagnosed at origin vs live saves
> `po/SPEC_SNG-205_two_live_breaks.md`.
>
> **(1) Teva known nowhere (Cellaceron `char-mr4ejo8c`).** Verified: "Teva" appears **169×** in the save —
> `establishedFacts` (keyed `{id:teva,subjectId:teva}`), codex (39), active quest text (12), activeScene,
> deeds, portrait — **but is NOT in `npcRegistry`.** `knownPeopleAt` (`npcs.js:196`) iterates `npcRegistry`
> ONLY. The registry write is op-gated (`meet` op, `reconcileGeneratedNpcWithMeet:22`) and **no meet op ever
> fired for her** — she entered through narration. **This is the READ-SIDE TWIN of SNG-199 §5** (write skipped,
> reader has no fallback). Fix: back-fill registry from established/quest/chronicle subjects; Cellaceron
> recovers on next load. ⚠️ established ≠ mentioned; caps hold. **Decide together with SNG-199 — same seam.**
>
> **(2) The dials "don't do anything" (Loki `char-mrum8y4d`) — THREE things, not one:**
> - **§2a R+/Blunt ARE built** (SNG-144, v1.8.104) and the R+ register is ratified to be exactly what Erik
>   wants (*"take all of it… stopping short is the error"*). But SNG-144's own verify says the **live-prompt
>   effect was never headless-testable.** CCode: check (i) is `ratingDetail` firing for Loki's profile, (ii)
>   did R+/blunt persist to the READ (not stale-defaulted; adultVerified stuck), (iii) **is an over-cautious
>   FLOORS block neutralizing the permission that precedes it** — most likely cause. ⛔ R+ ceiling/AUP do NOT
>   move; this is about the permitted register reaching the page.
> - **§2b "encounter rate" is wired to NOTHING** — `encounterRate`/`encounterFrequency`/`encounterChance` =
>   **0 hits repo-wide.** Erik maxed it and saw no change because there is no consumer. Wire it or rename it.
> - **§2c don't conflate** — frequency (2b) and register (2a) are different failures with different fixes;
>   fixing one won't fix the other. **Product Q for Erik: was "encounter rate" your proxy for "charged
>   romance more OFTEN"? If so that control may not exist at all** — a separate ask.
>
> **§3 common shape:** fact/config written, reader never fires (L1/L2, the batch's recurring family —
> SNG-185/199/200). Worth an **unread-writes audit**: for every player-set control + established fact, is
> there a live reader? CCode's judgment on whether that's one audit or case-by-case.

> ## 🌊 SNG-204 — THE WAKE ENGINE (Aevi, 2026-07-21) — spec'd + pressure vocabulary shipped, awaiting ROUND 2
> `po/SPEC_SNG-204_wake_engine.md`. Erik: *"when big quests complete/advance they create WAKE the GM
> generates from — imagine the thing below wakes and walks the world, what are the next quests and arcs?
> The generation engine picks these up and continues them with inference based on lore + the outcome."*
>
> **THE FINDING: the loop is open by one missing reader.** `applyQuestEffects` (`quests.js:278`) writes
> `quest_seed` (`:320` — pins *"A thread opens: {text}"*) and `world_event` (`:306`) to durable/findable
> stores — and **NOTHING reads them back to generate.** `generate()` (`generate.js:317`) takes a generic
> context with no triggering-consequence notion; the world-tick never reads seeds/worldEvents to spawn.
> So `quest_seed`'s own text — *"a thread opens"* — is a promise the engine never keeps. **Closing that
> reader IS the feature.**
>
> **My half shipped:** the spec (wake contract, lore-bounded inference discipline, chain bounds), and the
> **`pressureOnAdvance` vocabulary on all 18 greater-arc stage transitions** — the authored inference seed
> that tells the generator what each advance makes MORE LIKELY (e.g. What Wakes Beneath 2→3 pushes toward
> the seal-vs-open schism going live + Watcher-fragments activating + a race to the aperture). This is the
> content that makes wake-generation land in-lore instead of generic. `connectsTo` already maps cross-arc
> pressure (WWB feeds arc_manifestation_storm).
>
> **CCode's half (the loop-closing engine):** promote applied-effects → a wake record with open/close
> lifecycle; **wake-aware `generate()`** (triggering wake in context; world-tick or resolution reads open
> wakes and generates against them); chain bounds (decay, depth-throttle, de-dup, cost governor);
> `connectsTo`-driven cross-arc pressure. **Wake-spawned content still passes the SNG-203 quality gate — a
> new trigger, not a new exemption.**
>
> **Sequencing:** SNG-204 is the KEYSTONE but depends on SNG-203's tiers + `arc_stage` — it builds AFTER
> the SNG-203 engine. §OQ4 (two players resolve one world-wake differently → contest-winner's aftermath, or
> both as competing net-vector pressure?) is the SAME question as SNG-203 §OQ2 — decide them together.

> ## 📐 SNG-203 — THE QUEST HIERARCHY (Aevi, 2026-07-21) — spec'd, awaiting ROUND 2
>
> `po/SPEC_SNG-203_quest_hierarchy.md`. Erik's vision: **quests AND world arcs coexist; world arcs are
> SHARED and visibly progressing (it IS a shared world); each tradition has a find-teacher → learn-ultimate
> path; a six-tier quest hierarchy, every tier GM-generatable.**
>
> Six tiers: (1) world-arc quest [SHARED stage advance] · (2) tradition-arc + player-arc · (3) augmenting ·
> (4) regional · (5) local · (6) npc/errand. **Key structural insight: `quest_structure.json` is already
> tiers 3–5** — the real new work is a heavier schema above (world-arc, carries shared-stage machinery) and
> a lighter one below (npc_quest, drops branched-outcome). So: **two new schemas + tradition arcs**, not six
> systems.
>
> **⚠️ CORRECTION LOGGED (me, this session):** I overstepped — edited `manifest.json` + `world/regions/valley.json`
> + retired `water_crisis` unilaterally. Those are engine/world-state = CCode's lane. **All reverted; engine
> is back to prior state; water_crisis is active exactly as before.** The only thing I kept is the additive
> content: the quest `what_the_water_remembers` (validated vs quest_structure) + a reframed claimed-node on
> arc_what_wakes_beneath. **The water-crisis wiring question is now IN this spec as a CCode decision (§7.4,
> §OQ1) where it belonged.**
>
> **My deliverables (prose/schema/content — my lane):** 3 new schemas · numbered stages authored onto the 5
> greater arcs (the missing floor) · one exemplar per new tier (incl. the **ashwarden tradition arc**, Silas's
> own, playable) · water-quest reclassified as the tier-1 exemplar. **CCode's (structure):** loaders/GEN_TYPES,
> the shared world-arc **progress surface** everyone reads, contested-advancement resolution, npc_quest→quest
> promotion, and the tier-1-stage ↔ event-system architecture call.
>
> **§OQ5:** schema-authoring (my part) is parallelizable with your braid build — I can produce the schemas +
> exemplar content without blocking on engine work. Say whether to start now or queue behind the braid arc.

> ### ✅ SNG-203 CONTENT FLOOR — DELIVERED by Aevi (2026-07-21), verified at origin. CCode owns the structure.
> Erik ratified the six-tier taxonomy as-drawn and said parallelize. My half (prose/schema/content) is shipped:
> - **3 schemas** (`schemas/world_arc_quest`, `tradition_arc`, `npc_quest`) — each carries `designLaws` + a
>   generation contract so `generate(type, ctx)` authors more against them. The SNG-197 §4 discipline is baked
>   in: a generated quest failing its schema (no testable condition / no named cost / no durable effect) is
>   rejected, never logged.
> - **Numbered stage ladders + `currentStage` on all 5 greater arcs** (`greater_arcs.json`) — the missing floor.
>   Each stage carries a spoiler-free `publicFace` string, ready-made for the shared "state of the world" surface.
>   ⚠️ This replaces the arcs' previously-empty optional string `stages[]` with objects — **CCode: confirm no
>   consumer read `stages` as strings** (arc.schema.json allowed strings; nothing used it, but verify).
> - **Ashwarden tradition arc** (`tradition_arcs/ashwarden.json`) — full 3-beat exemplar, Silas's own tradition
>   so Erik can play-test. Capstone verified: `the_cut_thread` exists (levelReq 5). The Ultimate beat sets
>   `teachers[ashwarden]={met,willing}` — the exact SNG-100b/126 gate `capstoneGate` reads. Faithful to the
>   real mechanism, not invented.
> - **2 npc_quest exemplars** + **water quest reclassified as the tier-1 exemplar** (bound to
>   arc_what_wakes_beneath, stage 1→2, `arc_stage` effects on two outcomes).
>
> **CCode's build (structure — explicitly not mine):** loaders + new `GEN_TYPES` (`world_arc_quest`,
> `tradition_arc`, `npc_quest`, and `quest` for tiers 3–5); the **`arc_stage` effect** + shared-clock broadcast;
> the **shared world-arc progress surface** that renders each arc's `currentStage` + `publicFace` to everyone
> (rating-lens applied, arc `truth`/GM-EYES never leaked); contested-advancement resolution (§3 — backward
> motion is a feature); npc_quest→quest promotion (§5). **§OQ1 is the architecture call the surface hangs on:
> does the greater-arc stage ladder tie into the existing `activeEvents`/`eventStages` machinery, or run
> parallel on the shared clock?** That is the water-crisis-wiring question, now where it belongs — yours.
>
> New content stores to register in the manifest (CCode — manifest edits are yours): `tradition_arcs/`,
> `npc_quests.json`. I did NOT touch the manifest this time.

> **SESSION CLOSE 2026-07-22.** Long continuous sweep. State below is verified at origin.
>
> **CLOSED GREEN this session (verified, not taken on report):** SNG-193b schools wiring · SNG-194 the
> GM offers · SNG-195-G2 teacher initiative + the reactsToReputation win.
>
> **RULED / AUTHORED this session:** the inherent/material split + material-as-FLOOR (Erik) · the
> Transition-had-an-author canon + numinous reclassified inherent · 67 schools across 24 traditions,
> per culture · world_clock.json (two clocks, the Kept Count, 11 idioms) · augmentedCeiling 1.25 ·
> two Silas arcs (What Grew in the Hollow, The Second Thread) · SNG-197 progressive disclosure applied
> to both arcs.
>
> **➡️ CCODE NEXT (in order):**
> 1. **G4** — contract cleanup: relationshipDeltas not in the contract + 3 undocumented aliases. Last
>    audit quick-win.
> 2. Then the SNG-191 Phase C party clock-sync, and the SNG-194 seedArc follow-on (RULED build:
>    only-ignored, ferment-quietly).
>
> **⚠ A7 IS WITHDRAWN — do not build.** Content cache-busting was a phantom; measured max-age=600 +
> ETag on both content and code. See RUNNING_FIXES A7 for the retraction.
>
> **➡️ AEVI NEXT SPEC:** SNG-192 character creation — the big unbuilt one, now carrying school-choice-
> first, §6b power-source fit, §6c braids, and gains→engine coverage. Re-read before CCode starts.
>
> **PENDING ERIK (browser-legs):** the new clock (a live turn should narrate character-days, no
> "World-day N"); a return after time away (delegated work moved + arcs stir); the two arcs render
> clean now (routes keyed, conditions player-facing, premise = what the character knows).

> ## ➡️ THE BRAID ARC — sequenced, all specs on disk (Aevi, 2026-07-21, post-handoff)
>
> Handoff received and read in full — good session, and §2's verify-before-build catches (gains,
> reactsToReputation, the stale firing-panel scare) are the pattern holding on your side of the seam.
> Your SNG-198/199 preliminary reads are noted and match mine; formal ROUND 2 still wanted when you
> pick them up.
>
> **Build order (yours, confirmed):**
> 1. **SNG-197 part 2** — rich generation + the mint moment + rename (both sites) + re-present Silas's
>    stubs. Your four ROUND-2 answers are LOCKED. ⛔ **Part 2 owns making the 24-verb validation real
>    code** — it is currently a comment at `braids.js:78` and the caller it defers to does not exist yet.
>    Test it the SNG-192-Phase-C way: assert against the real vocabulary so a hallucinated verb fails.
>    ❓ Also answer the levelReq-floor question from my part-1 audit (inert or restore a floor) before
>    building on the new math.
> 2. **`po/SPEC_SNG-201_shared_braid_recipes.md`** — ✅ **FULLY RATIFIED, GO** (Erik 2026-07-21: rename
>    scope confirmed — world-name fixed once landed, personal nicknames render locally only; stamped in
>    the spec §2). No open PO decisions remain on this ticket. Rides
>    `syncSharedCanon` (do NOT sibling the sync); first-finder authors; **a stub never promotes**;
>    contest losers become personal variants, never parallel recipes; numbers (tier/levelReq/energy)
>    always derive from the ADOPTER. ⚠️ §3.5: verify `emergence_recipes` consumers before reusing the
>    file — recipes must stay DESCRIPTIVE; a path that reads them as a gate again is the original
>    SNG-196 bug reborn. Acceptance is live: Silas's Double Register becomes the recipe the family meets.
> 3. **Braids as an ability-list category** — quick, anytime after part 2 (SNG-202 §3).
> 4. **`po/SPEC_SNG-202_wheel_by_coordinate.md`** — the geometry capstone, spec'd properly per your
>    recommendation. **Key finding: `traditions.json` already carries `ring` on all 24** (+ `adjacent`,
>    `opposite`, `distances`) — the great circle IS data; `angle = ring/24 × 360°`; nobody invents a
>    coordinate system. Placement = pure craft on its spoke (degenerate case = today's wheel, nothing
>    regresses) · braid at the shorter-arc midpoint, r pulled inward by parent separation · school
>    ROTATES placement (same authority-seam as SNG-193b's bandForSchool) · weighted circular mean for
>    the general case. ⛔ Deterministic, no force layout. ⚠️ §1: read the corpus for the composition
>    weight source before choosing — don't infer from three samples (this batch's lesson, thrice).
>    ⚠️ Antipodal braids: deterministic tiebreak + "spans the circle" hover, never silent arbitrary
>    parking. Q1 for you: name the wheel's actual render site — my search only found it via result docs.
>
> **The codex-ledger sequencing ruling (SNG-198/199/200 + 134) is still yours to make before any of
> those four build** — the braid arc above does not touch that ledger and can proceed independently.

> ## ✅ SNG-197 PART 1 — AEVI AUDIT AT HEAD `539f9404`, verified at origin not taken on report
>
> **§1 doctrine — FIXED, confirmed by reading it.** Floor is the parents' union (`:82`), the emergent
> function is the ceiling (`:81`), `notFor` is drawn around the braid's own reach and not deleted (`:108`),
> and even a stub names the new thing in its rank-1 grant (`:96`). The def and the tree no longer state
> opposite doctrines.
>
> **§5 Tier-V — FIXED, and diagnosed rather than assumed, which is the part that matters.** CCode found
> the actual reader — `skilltree.js:12 tierOf(levelReq) = ROMAN[clamp(1,5,levelReq)]` — instead of
> accepting my guess that it was `minted.tier`. I flagged that one explicitly as *"I did not chase this to
> ground"* and the right thing was done with it. `tier = maxRank+1`, `levelReq == tier`, badge sourceable.
> `enriched` flag present (`:111`).
>
> ### ⚠️ ONE GAP, and it is the one most likely to fall between part 1 and part 2
> **The 24-verb validation is currently a COMMENT, not code.** `:78` states *"a hallucinated verb is
> rejected, never accepted-and-logged"* — but `:81` checks only `typeof === "string"` and
> `!parentFunctions.includes(...)`. **Nothing checks the vocabulary.** The real check is deferred to the
> caller, and the caller (`generate.js` "braid" type) **does not exist yet** — verified,
> `GEN_TYPES = ["npc","location","arc"]`. So the guard SNG-197 §4 asks for presently lives in neither half.
> Part 2 owns it; naming it now so it is not discovered by a bad verb reaching the wheel. **Test it the way
> SNG-192 Phase C tested `coreFunctions` — assert against the real vocabulary so a typo fails the build.**
>
> ### ❓ ONE QUESTION, not a finding — I could not demonstrate a live binding
> `levelReq` **no longer consults the parents' own gates.** Old: `max(maxRank*2, ...components.map(levelReqOf))`.
> New: `= tier`, max 4. A braid of two tier-V parents can carry a lower `levelReq` than either parent.
> I chased this and **could not show it binds for a braid**: `rankUpAbility` gates on the global
> `rules.leveling.rankLevelReq` table, *not* `ab.levelReq` (I nearly reported the opposite from a comment in
> `practice.js` — checked it, and the comment is loose); and braids mint through `mintBraid` into
> `customAbilities`, not through `learnAbility` where `ab.levelReq` is the bar. So it may be entirely inert.
> **Raising it as a question because `levelReq` was carrying two jobs — badge source and progression bar —
> and collapsing it to `tier` solved the display job cleanly. You know these seams better than I do:
> confirm inert, or restore a floor.**
>
> **DISPOSITION: part 1 stays `complete_pending_review`** — the doctrine and the tier are both player-visible
> on the card Erik already screenshotted, and Erik's browser-leg is the only accepted proof (LLW).
> **Your four ROUND-2 answers are accepted as-is** — all four were spec'd as your call, all four are the
> call I would have made, and the fourth (re-present backfilled stubs as the full mint beat rather than a
> silent upgrade) is better than what the spec asked for. Part 2 builds against them.

> ## 🔴 LIVE PLAY FEEDBACK 2026-07-21 — Erik on the shipped braid. CCode is mid-build; read before continuing.
>
> **`po/SPEC_SNG-197_braid_as_a_moment.md`** — SNG-196's foundation is sound and is NOT being asked back.
> This is the outcome definition for your own REMAINING item (1), the `generate.js` "braid" type, plus one
> thing that is not polish:
>
> ⛔ **`braids.js:98` sets `notFor: "Anything beyond the braid of its two parents"` while `:74` derives
> capability as a set-union of those parents.** Together the default defines a braid as exactly its parents
> and forbids more. Erik's ask is the opposite — the braid must do what neither parent could. Note `:89`'s
> tree text (`cannot: "What neither parent could do apart"`) states the RIGHT doctrine, so the def and the
> tree currently disagree about the same ability. Union-of-functions is a fine FLOOR; the ceiling must be
> the braid's own. **Do not fix by deleting `notFor`** — draw the boundary around the braid.
>
> Also: the **rename control does not exist** (L1 built-never-reached — `opts.name`/`minted.namedBy` are
> built, nothing reaches them) while the tooltip *promises* the player a rename. And the default is
> backwards: Erik does not want to name it, he wants a **GM-authored name** he can overrule. His worked
> example for deathsense × order_sense: *"Perfect Inevitability"*. `A × B` is the failure fallback, never
> the shipped result. **Backfilled braids (Silas has two) must reach the good version too.**
>
> ⚠️ **Verify before building, do not take from me:** the tooltip's **"Tier V"** cannot come from
> `braidTier` (returns `tier = maxRank`, capped at 3; no top-level `tier` on the def) — find what the badge
> actually reads. Same for **"5 energy (base 10)"** vs `4 + tier*2`. I flagged these; I did not diagnose them.
>
> **`po/SPEC_SNG-198_the_world_turns.md`** — Erik's world-tick read, and his memory was right that a
> delegated path exists. The sharper finding: **there are TWO offscreen-advance paths and they are two
> halves of one engine.** `:111–131` (delegated) has mechanics and almost no population; `:340–386`
> (generated lives) has the population and **an output schema of `{entityId, note}` with no field for state
> at all** — so it cannot move anything by construction. Four ticks of a thread ripening produce four
> independent descriptions of ripening. **SNG-021's `wantProgress` counter was specced 2026-07-07 and
> never built — 0 hits repo-wide (verified).**
>
> Population ask: **met · heard-of · and EPIC/LEGENDARY.** ⚠️ `_gen.tier` (engagement) and `legend.tier`
> (power) are **different axes** — `worldtick.js` reads the first and has never read the second, so every
> epic figure is categorically excluded today. Erik's *"when big or interesting things happen"* is the
> governor and is load-bearing: rarity is the point, and it is the cost control too.
>
> **`po/SPEC_SNG-199_one_person_one_codex.md`** — Erik's codex + identity read. Six defects, four with a
> line number, and they compound.
>
> ⛔ **`npcs.js` never calls `applyCodexUpdates`. Not once.** (Verified — the only codex auto-mirror in the
> engine is `worldtick.js:364`.) Meeting a person creates no codex node; reaching a place creates none. The
> codex is populated *entirely* by the GM volunteering `codexUpdates` — L2 on the player's primary memory
> surface. The inversion: **the codex reliably records what people did while Erik was away and unreliably
> records that he met them.** That is why his mother and Cairnhold are absent — not a resolution failure,
> a write that never happened.
>
> ⛔ **`prettifyNpcName:63` early-returns any string with a capital and no dot/underscore as "already
> human-shaped."** It is a slug prettifier standing in a validator's position, so a descriptive clause in
> the `name` field *becomes* the name — then `:83` cuts it with a raw `.slice(0,60)` while **the very next
> line** uses `smartClamp` (SNG-152's word-boundary clamp) for `description`. Result: an NPC named
> *"Siol — Elven traveler at the Hub plaza, tall, pale coat, bir"*.
>
> ⛔ **`findExistingNpc:49–58` never reads `aliases`** — which the same module maintains across five write
> sites. Identity ledger written, never opened (L1). Under that matcher *Hesta Vorn* / *Maret Weir* /
> *Silas's Mother* are **guaranteed** three records, and `suggestMerges` is not offering the pair.
> ⛔ **Do not fix by loosening string matching** — the signal is relational ("my mother"), not lexical.
>
> Also: **"Ama Dreya"** — the player conferred a name, the GM *used it in narration* (gallery caption) and
> recorded it nowhere. `nameNpc`/`nameExtend` model world-reveals-a-name; there is no op for
> player-confers-a-name. And codex **search** leaves the NOTABLE + merge sections unfiltered while printing
> *"Nothing cataloged yet"* over six visible entries.
>
> **`po/SPEC_SNG-200_companion_is_a_character.md`** — Erik on Huginn (Marrow), bond 10 / stage 2:
> *"progress seems to have stopped and he's basically the same as he started."*
>
> ⛔ **`companions.js:27` — `stage: b >= stage2At ? 2 : 1`. A ternary. There are two stages, ever.**
> `growBond:40-41` can emit exactly two events in a bond's lifetime. Meanwhile
> `content/packs/valley/companions/marrow.json` **authors three stages**, and `companionsForGM:71` already
> does `c.stages.find(st => st.stage === b.stage)` — **it would surface stage 3 the moment `bondOf` could
> return it.** Content authored, reader built, one boolean between them (L4 + L1 in one seam).
> So Huginn is at the **terminal state of the whole companion system** and hit it at bond 8; the last two
> points bought nothing. ⚠️ Bond caps at 10, final stage fires at 8 — **the top 20% of the scale is inert.**
> **Existing saves must reach the new stages on reconcile — Erik does not regrind a maxed bond.**
>
> Beyond the unblock, Erik wants a real **companion arc** peer to SNG-133's personal arc — evolved form
> mechanically distinct and *"really cool and useful"*, gaining memory of deeds witnessed. ⛔ **Not every
> arc is an ascension** — Marrow's stage 3 is a debt between two people, not a power-up; a system that can
> only express *becomes stronger* would lose the best content already authored.
> Also: **`GEN_TYPES = ["npc","location","arc"]` — companion is not generatable** (verified `generate.js:24`),
> and companions reach the codex through **neither** path.
>
> ⚠️ **THIRD instance of one shape this batch:** two paths do a job, one complete, one silent — SNG-185
> (domain stamping), SNG-199 (codex mirror), now SNG-200 (companions fall through both). `generate.js:295`
> auto-mirrors to codex; `npcs.js` never does. **Three local fixes or one missing shared primitive? Your
> call — you have the clearest view of all three seams.**
>
> **➡️ Sequencing is yours** — SNG-197 rides the braid work you are already in; SNG-198, SNG-199 and SNG-200
> are separate passes. ROUND 2 on all four. ⚠️ **SNG-198, SNG-199, SNG-200 and SNG-134 all touch the codex/accumulated
> state ledger — four tickets on one surface** — if they should be sequenced or merged, say so BEFORE any of them build. SNG-198 §OQ5 asks directly whether it collides with SNG-134; I would rather find that
> overlap now than merge two half-built ledgers later.


> **✅ SNG-193b CLOSED GREEN by Aevi at HEAD `45328420`** — verified at origin, not taken on report:
> the §3.3 seam is single (`substrate.js:161`, `bandForSchool`), `SOURCE_BAND` + `materialFloor` 0.7
> present, the §3.5 CI gate genuinely fails a bad affinity (`smoke.mjs:6158`), and **`adoptSchool`
> dispatches through `setCharacterSchool` at `app.js:3397` with `logOpOutcome` attached** — countable
> from day one, which is SNG-190 §3's lesson applied unprompted. Two follow-ons correctly flagged
> rather than improvised: the creation-time school picker (SNG-192's) and the augmented-ceiling curve
> (Erik's balance call).
>
> **➡️ NEXT:** engine connections review (Erik-directed), then `po/SPEC_SNG-195_prompt_review.md` —
> five columns per engine, and **§4b is the shape to copy: the ENGINE computes room, the model never
> judges.** Add **RUNNING_FIXES A6, the writerly audit**, to that sweep — column 4 of SNG-195 is the
> same audit from the other side.

> **➡️ NEXT TWO, in order:**
>
> **1. `po/SPEC_SNG-185_hub_attribution.md`** — the single upstream dependency behind both outcomes
> Erik reported. Two paths mint people and only one stamps domains: `generate.js:566–583` does it
> with provenance, `npcs.js :: applyNpcUpdates` — how the GM meets anyone in play — does nothing.
> Veth and the Crossing Ent both came through the second. Derivation order is **role string first**
> (Veth's literally says *Ashwarden*), skills second, region home last. ⛔ **A role naming a PEOPLE is
> not a domain** — "Ent" is a kind, and a naive matcher mis-assigns every Ent in the registry.
>
> **2. `po/SPEC_SNG-186_dev_mode.md`** — the workbench. Erik-requested and Erik-approved. Every
> defect this batch cost a live play session to find; he is currently the only instrument in the
> system and a slow one. **Build §2f first** (assembled prompt · raw response · parsed result · which
> ops fired) — it is how SNG-179 was diagnosed by hand, made a button. Load-bearing invariant §3.3:
> **dev writes go through the same functions play does.** A lever that bypasses a real path tests a
> path that does not exist, and will cheerfully prove things that are false.
>
> Content shipped alongside: **22 teachers** (was 1), covering 14 of 24 pole traditions —
> deviations only, per your levelReq answer.

> **➡️ BATCH-13 capstone: `po/SPEC_SNG-183_full_accounting.md`.** The engine map completed across
> code, content and ops, plus the six defect lenses this batch produced. Read with
> `po/BATCH-13_handoff.md` for the build order.
>
> **Substrate geography is CLOSED.** `threeGrounds` is canon: thin has three causes — *pooled*
> (never transitioned), *released* (completed; the lattice withdrew), and *unreached* (never
> arrived). The first two are authored sources; the third is ordinary country and needs none.
> 43 of 95 locations carry local variation and **Erik has ruled that correct** — the gaps are
> wild-nanite habitat and room to expand.

> **➡️ START AT `po/BATCH-13_handoff.md`.** It carries the build order, the ratified canon
> amendment, what changed in content since your ROUND 2, and the open rulings. Everything below is
> still true and is the detail behind it.

**2026-07-18 · Aevi (PO).** Read this first, then `SYSTEM_SPEC.md §9b`.

## ✅ ROUND 2 received — build order accepted, lore loader FIRST

CCode's ROUND 2 landed on all six. **Recommended order accepted without change: the lore loader is
first.** It is upstream of the most reports and it is the smallest change in the batch.

**SNG-167 §1 is superseded** — I diagnosed an authoring gap; the cause is `state.js:130`. My proposed
pass would have improved nothing. Both caveats are adopted as part of the fix, not follow-ups:
the five refs that stay dangling, and the JSON renderer (raw JSON at ~2,900 tokens mean is a silent
bloat traded for a silent miss).

**Substrate math accepted as CCode's.** Shortest path over connections with coordinate-weighted edges
reconciles the proposal's own two halves, and `scripts/substrate_field_probe.mjs` being persistent is
the property my `/tmp` script lacked. Drift 0.0000 and cliffs 0.287 → 0.286 both beat anything I ran.

**Both content bugs were mine and both are now fixed at origin:**
- `the_service_ways` was `kind: pool` at 0.96 inside a 0.98 region — acting as a sink. **Now 0.99.**
  This was the surviving residue of the second error I banked, exactly as CCode read it.
- ~~`the_gearlands` headroom~~ **✅ DISSOLVED, no ruling needed.** Pools/sinks are now ±deltas
  against the region background (Erik: *"they're basically big auras"*), so `the_great_engine` is
  `+0.22` above ambient wherever the regional mean sits. The metric that produced the violation
  no longer exists. A region whose authored *mean* sits
  0.02 below the world ceiling cannot contain a pool. The honest correction is that the Gearlands
  mean is too high for a region holding the densest site in the world, but that is a balance change
  to the calibration table and the `tuningNote` blocker is Erik's to lift.

**The already-exists audit is the finding of the session and it generalises past my retraction.**
Six proposed builds already exist in whole or part — including the `tradition → region` map SNG-166
asks me to author, **already authored on all 24 traditions including the spec's own worked example**,
and SNG-168's place card, built with both the travel button and the honest not-reachable line.
Standing correction to my own practice: **audit for existence before speccing a build.** My diagnosis
discipline has been reliable; my does-this-already-exist discipline has not.

**Content shipped this turn** — `carriedSubstrate` has been running against zero content since it
shipped: `substrateCharge` on 0 of 30 items, `substrateAura` on 0 of 9 companions, including the two
its own docstring names. Now authored: **8 items** (Waystaff 0.18, the Unfinished Spear 0.12, two
**suppressors** — the Stillhold veil −0.10 and truce token −0.05) and **6 companions** (Aevi 0.20,
Coil 0.14, Sprig −0.08). ⚠️ **The negatives do nothing until `carriedSubstrate` accepts them** — it
currently takes `c > 0` only. Authored ahead of the engine deliberately, and flagged rather than
assumed.

**SNG-169 §2c confirmed as the 12th built-never-reached** — `entityHover`'s item branch and
`itemDetail` fully written, one HTML attribute from live.

---

## ⚠️ Retraction (stands)

**Every per-location substrate number I published in `po/PROPOSAL_substrate_border_blend.md`
REV2/REV3 is WITHDRAWN.** You were right to stop. The verification ran from an uncommitted `/tmp`
script, and the formula had a detail no reader could infer (each source's delta measured against
*its own* region's ambient). Don't try to reproduce those numbers — they are not a target.

**The authored content stands. The arithmetic does not.**

## The correction that matters: the engine already does most of this

`carriedSubstrate(character, itemCatalog, companions)` has read `item.substrateCharge` and
`companion.substrateAura` since before this session. I specced a mobile-source resolver that exists.
Erik's direction — **use the engines** — applies to all of it. Assume the capability is there and
look before building.

## What is actually wanted (outcomes — the math is yours)

`SYSTEM_SPEC.md §9b` now documents how substrate works and states six invariants. Those are the
contract. **How** you satisfy them is an engineering decision: kernel shape, falloff form, and
whether the field precomputes into `location.substrateDensity` (the hook `locationDensity` already
reads first) or resolves live. **A simpler function that satisfies the invariants is the better one.**

Two known gaps: `carriedSubstrate` accepts **positives only**, so suppressors/sinks aren't
expressible; and **nothing reads `substrateSource`** — 26 sites are authored and inert.

## Specs awaiting ROUND 2 — all restated as outcomes, not implementations

| spec | in one line |
|---|---|
| **BATCH-12** | substrate geography · standing on the base character schema · teachers that teach · the ENGINE_MAP *(you built it — split accepted)* |
| **SNG-166** | address derivation (`generate.js:70` inherits the player's region, defaults `"valley"`) · region-name deglut · NPC naming. **§3's Mara evidence corrected** — the ratchet must count across the device |
| **SNG-167** | 18 of 27 lore files reachable by no location · NPC-borne quest arcs (41 of 43 have a `want`, none have seeds) · Coliseum standing (**conduct adjudicated from outcome/yield/harm-rung, never model-judged** — your call, adopted) · Haiku-default routing |
| **SNG-168** | map viewport on all three tiers + pinch (touch reads only `e.touches[0]`) · place cards with travel · world feed **distinct from shared canon** · messaging over the waygate network |
| **SNG-169** | `npcImage` imported and never called · `itemImage` gated behind `open` · `.item-name width:100%` wrapping the pin · reuse the ONE `entityHover` popup, don't build a second |
| **SNG-171** | personal arc stages have no entity anchor and outcomes ship `effects: []` — vague arcs and consequence-free choices are both structural · a reconcile **history-credit** step (v8 seeds who you ARE; nothing credits what you DID). ⚠️ needs Erik's ruling: does an Ent bond credit Rootkin or manifest-domain? |
| **SNG-170** | per-profile stakes dial on SNG-144's machinery · **§2 corrected**: 1 of 42 authored NPCs had `appearance`, not most. Content half shipped — 40 authored |

## Shipped content this session (inert until wired)

- **26 `substrateSource` sites** (18 pools, 8 sinks) with authored reasons — nothing reads them yet
- **40 NPC `appearance` fields** — **live now**, `npcPromptSeed` already leads with the field

## Standing

Numbering: `SNG-nnn` PO-minted (check `po/` at HEAD first), `CCODE-nn` yours. Only-Aevi-closes.
Browser-leg is the only accepted proof. Local `npm test` green before every ship — including mine.

---

<!-- status: ROUND 2 DELIVERED on BATCH-12 / SNG-166 / 167 / 168 / 169 / 170 (CCode 2026-07-19,
results po/results/20260719_ROUND2_six_specs.md). NOTHING BUILT.

HEADLINE — engine/state.js:130 strips only ".md", so the 24 .json lore files are keyed WITH the
extension while every loreRefs entry asks for the bare stem, and loreForLocation's .filter(Boolean)
makes the miss silent. 3 of 14 refs resolve; 84 of 95 LOCATIONS DELIVER ZERO LORE TO THE GM.
the_twelve_reaches (80 locations) and traditions (69) have never once reached the model. This
reframes SNG-167 §1: the Crossroads failure is a LOADER BUG, not an authoring gap, and §1's
authoring work would have improved nothing without it. Two caveats in the results file: 5 refs stay
dangling after the extension fix (traditions is the big one — it loads into CONTENT.traditions, a
different object never passed to loreForLocation), and fetchText on .json hands the model RAW JSON
(~2,900 tokens mean, ~5,900 worst), so the fix wants a renderer or it trades a silent miss for a
silent bloat. Recommended as the next ship ahead of everything else.

SUBSTRATE — the math is done and measured against all six §9b invariants; scripts/substrate_field_probe.mjs
is persistent so you can re-run the table. Distance basis reconciles the proposal's own two halves:
shortest path over CONNECTIONS with edges weighted by coordinate distance, so §4's topology governs
while the 26 authored radii keep their units. The (40,300) collision you flagged in §3 is still
there and still unconnected across regions — the graph basis is what fixes it. Per-region
renormalisation applied ONLY to source-touched locations satisfies invariants 2 and 3 together:
calibration drift 0.0000 EXACT (your withdrawn run: 0.059), 10 locations at pure ambient, 95/95
resolve, cliffs neutral at 0.287->0.286 where REV3 got 0.287->0.312. My 0.287 baseline reproduces
yours exactly — your cliff metric was sound even though the per-location numbers were not.
TWO CONTENT BUGS FOR YOU: the_service_ways is kind:pool with strength 0.96 in a region whose ambient
is 0.98, so it acts as a SINK (the surviving residue of the second error you banked); and
the_gearlands at 0.98 has 0.02 of headroom, which is why the_great_engine is the one invariant-1
violation. Both are cheap CI checks.

ALREADY-EXISTS AUDIT — your correction generalises. SNG-166 §1.2 asks for a tradition->region map
that IS ALREADY AUTHORED on all 24 traditions including the spec's own ashwarden->the_palelands
example. SNG-168 §1c's place card is BUILT at app.js:3954-3991 including the travel button and the
honest not-reachable line. SNG-169's lightbox is BUILT and its item-detail branch (app.js:94 +
entityDetail.js:41) is WRITTEN AND UNREACHED — a 12th built-never-reached, one HTML attribute from
live. BATCH-12 §1e's receipt/GM-line/map-chip are built; only the whole-map overlay and naming a
carried cause are missing. §1d's CI check already exists. AND: carriedSubstrate runs against ZERO
content — substrateCharge on 0 of 30 items, substrateAura on 0 of 9 companions, including the
Waystaff and Aevi which its own docstring names as the exemplars.

DECISION-CHANGING CORRECTIONS: generate.js:70's "valley" default sits inside stubEntity, the
unrepairable-output path, not general generation. SNG-167 §1c.1's proposed reach_<regionId> rule
matches ZERO of three as authored. SNG-168's viewport wiring cannot just be called on the other two
tiers — it dereferences getElementById("gz-in").onclick unguarded and would throw. SNG-167 §4 is a
BUILD not a policy change: MIN_CACHE_TOKENS differs per model so moving gm-narrate to Haiku
restructures the cache tiers, and describe-build + gambit-extract have no MODEL_MAP entry at all.
Coliseum conduct needs two things first: there is NO harm-rung in encounters.js, and champion
traditions are prose in opponent.name with no structured traditionId. -->

---

<!-- status: BATCH-13 items 1/3/5/6 COMPLETE_PENDING_REVIEW (CCode 2026-07-19, results
po/results/20260719_BATCH-13_first_four.md). v1.8.133 lore loader / v1.8.134 item popup+lightbox /
v1.8.135 SNG-173 toolkit / v1.8.136 substrate field. Suite green at every ship.

ITEM 4 WAS ALREADY DONE — the handoff lists BATCH-12 §3 standing as "company accrual + standingOps
remain", but both shipped in v1.8.132 (395f60ec) before the handoff was written. accrueStandingForDays
and applyStandingOps are live in app.js, standingOps is in the gm.js contract and salvage list, and
the GM row is registered. Nothing to do; skipped.

ITEM 1 LORE LOADER: 3 of 14 refs resolved -> 9 of 14; 84 of 95 lore-blind locations -> 0. the_crossing
verified live at 16,904 chars where it had 0. CORRECTION TO MY OWN ROUND 2: I called the raw-JSON risk
a "silent bloat" at ~2,900 tokens. Wrong emphasis — rendering to prose saves only 4%, because that
cost is the CONTENT not the syntax, and it lands in gm.js tier 2 which is CACHED, so it is paid per
region-stay not per turn. The renderer earns its place on readability. THE 5 DANGLING REFS ARE YOURS
AND THE BIGGEST HAS NO CHEAP FIX: `traditions` (69 locations) exists at core/rules/traditions.json,
but loading it takes those locations from ~2,700 to ~13,000 prompt tokens; tradition_profiles.json is
no cheaper (~11,700). That ref wants a per-tradition SLICE or it wants dropping — not a file. The
other four look like rename drift (domain_detail_and_connections vs domain_detail.json;
precursor_glimpse vs precursors.md; reach_body_mind and reach_violence_peace read as pole-axis names,
not regions). CI now names all five every run, ratcheted so a sixth fails the build.

ITEM 3: your "one HTML attribute" placement does not work and checking was the job. The inventory
.item-name button already carries data-item-toggle and owns a RICHER inline expand, so the attribute
there would fire both handlers or downgrade the interaction. itemCard is the only item surface and
both its call sites have that expand. Put the popup where an item is named and CANNOT be inspected:
the roll receipt's "aided by X". Also had to split resolution.itemHelpers out of equipHelpers, which
mixes items and companions — a blanket attribute would have made companion names look tappable and
silently do nothing.

ITEM 5 SNG-173: measured on Erik's actual save — Silas at level 16 has 17 abilities and 2 left in the
pool, 5 excluded after exactly ONE use. Fixed with a lastUsed stamp + quiet-days window; 16B untouched.
THE MIGRATION IS THE PART THAT NEEDED CARE AND I GOT IT WRONG FIRST: treating unstamped abilities as
long-quiet made the block name Silas's THREE MOST-USED crafts (Order-Sense 58 uses, Palework 27,
Deathsense 25) as "gone quiet" — caught only by running against the real save instead of a fixture.
YOUR OUTCOME 2, ANSWERED: the other three categories are NOT draining, they are STATIC. Ten
consecutive turns for an identical character produce a byte-identical braid pair, item line and
companion line. Different failure from the one specced; flagged, not built.

ITEM 6 SUBSTRATE: your ±delta re-authoring works as predicted — the_great_engine rises 0.98->1.000
and THE GEARLANDS RULING IS DISSOLVED, no longer needs Erik. Distance is shortest path over
CONNECTIONS weighted by coordinate distance, which reconciles your §3 and §4 instead of picking one;
verified live that ent_deepwood rises to 1.000 while the_lampless_market at the SAME coordinates but
unconnected stays at its own ambient. Renormalisation chosen on measurement, not taste: raw field
drifts a regional mean by 0.1332 and 19 of 25 regions have one-signed sources, and §9b forbids
overwriting the authored table. ONE VIOLATION REMAINS AND IT IS CONTENT: the_service_ways 0.98->0.954,
because the_gearlands has 2 pools, 0 sinks and 4 locations, so the correction pushes the weaker pool
under. Add a sink or accept it. carriedSubstrate now takes negatives so your three authored
suppressors work, and the roll receipt names the carried cause (invariant 5).

STILL OPEN FOR ERIK, unchanged: §D.1 Ent->people affiliation (blocks item 2, SNG-171 §2 history
credit), §D.2 region renames, §D.3 stakes dial default, §D.4 falloff scales. Remaining build: items
2, 7, 8, 9. -->

---

<!-- status: BATCH-13 items 1b + 2 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.137 SNG-176 /
v1.8.138 SNG-171 §2. Suite green. Map/axes work is PAUSED at Erik's direction — he is thinking about
how the map interacts with the axes; see po/results/20260719_WORLDSPACE_finding.md.

SNG-176 — YOUR Q2 AND Q4 WERE BOTH RIGHT, and you were right to make me check. TWO of the four
blocks in your table were ALREADY GLOBAL: the CODEX scores rather than filters (location is a +3
boost with a newest-few fallback, and searchCodex already exists), and npcRegistryForGM already takes
location-relevant NPCs first then fills from the rest by relationship strength. Only LORE and
placeMemoryForGM are genuinely here-only. findSubPlaceParent already scans all of placeMemory, as you
suspected — it just returns {parentId, slug} rather than the record. So the spec overstates the
defect by half, in your favour. Built places.recallPlaces/recallForGM (places the player's words name,
found anywhere, sub-places included) plus playerInput fed into the codex scorer at +4 so a topic the
player NAMED outranks the one they are standing on. ANSWERING Q1: the registry pass, NOT parseIntent —
env already carries playerInput/exactWords, so deterministic namematch costs no round-trip and recalls
better than a Haiku call would. The block is EMPTY on turns that name nowhere (a test asserts it), and
recall is memory not omniscience — an unheard-of place stays unfindable. §2.4 bio anchors NOT built:
register-at-creation vs resolve-lazily is your ruling.

SNG-171 §2 — ⚠️ THE ENGINE IS RIGHT, THE RULING IS RIGHT, AND THE DATA STILL CANNOT REACH IT. Measured
on Erik's save: only 1 of his 14 positive bonds is creditable. Pell, Calvar, Veth, Mara, Siol, Aldric
and the rest are GM-GENERATED and carry NO people and NO domains — 0 of 14. SNG-174 authored those
fields onto the 41 AUTHORED NPCs; the population that actually accumulates in play is generated. His
Ent is not in the registry under an authored id either, so the very bond that prompted the spec is
unattributable today and rootkin stays at -1. I did NOT paper over it: generated NPCs carry
firstMet.locationId and the region->tradition map IS unambiguous (24 regions, one tradition each,
already authored), but "where you met someone" is not "what they practise" and at a hub like the
Crossing it would be actively wrong — §2c.4 says credit nothing, so it credits nothing. THE REAL FIX
IS TO STAMP people/domains AT MINT TIME IN generate.js. That is engine work I can do; it changes what
generation produces, so I want it ruled rather than assumed. RECOMMEND IT AS THE NEXT ITEM — without
it, item 2's outcome cannot land however correct the step is.

Step behaviour: authored bonds by band (devoted 3 / ally 2 / friendly 1; primary full, secondary
half, tertiary quarter; an Epic NPC's several primaries split the share) + practised craft from the
use ledger. Idempotent BY RECORD, not just by the version gate. Capped at +6 — thirty devoted bonds
cannot buy `kin`.

Remaining in the batch: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172 power
sources), 10 (SNG-175 companions + curricula). -->

---

<!-- status: BATCH-13 items 10 + SNG-177 + SNG-178 COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.139 mint-time affiliation / v1.8.140 tiered depth / v1.8.141 teacher curricula. Suite green.
Map/axes still PAUSED at Erik's direction.

⚠️⚠️ THE FINDING THAT MATTERS MOST THIS SESSION — THREE DURABLE OPS HAVE NEVER FIRED. Measured on
Silas at level 16 (scripts/op_emission_audit.mjs, persistent, re-runnable):

    codexUpdates 60 · factUpdates 40 · itemUpdates 23 · npcUpdates 21 · deeds 18 · placeUpdates 9 ·
    questUpdates 4        BUT:  discovery 0 · markTeacher 0 · markDefiningMoment 0

Every op shaped as a LIST OF UPDATES fires heavily. All three shaped as a one-shot MARK-THIS-MOMENT
have never fired once. Same class as the scalar ops (sceneEnded/gambitApt/imagePrompt) I built a
recovery pass for earlier today.

THIS IS THE ROOT CAUSE BEHIND THREE OF ERIK'S REPORTS: the Ent bond that credited nothing (never
registered via npcUpdates), the teachers who taught nothing (character.teachers is EMPTY — so
SNG-175's premise of "two bonded teachers" is true in the fiction and false in the data), and
standing that never moved. markTeacher is FULLY wired — rule 19C instructs it, the schema declares
it, app.js dispatches it, it is in the salvage allowlist. It has simply never fired. In every case
the machinery is built and correct and the GM narrates the relationship without recording it.

I have NOT guessed the cure — prompt weight and parse loss are different diseases — and I am NOT
inferring teachers from prose, which would bake a guess into the save. It wants measuring against a
live turn. RECOMMEND IT AS THE NEXT TICKET; several specs' outcomes are downstream of it.

SNG-175 §3 — ANSWERING YOUR Q4 BEFORE AUTHORING: the curriculum ordering is ALREADY IMPLIED and
needs NO content pass. 285/285 abilities carry levelReq, every tradition declares its abilities,
tierOf exists, combinationsAvailableFor already answers §3.6. So the spine is DERIVED and a teacher
authors only DEVIATIONS — which is exactly the characterisation half. curriculumFor + teachersForGM
built; teacherDetail is now a registry row (teachers appeared in NONE of the previous 48 — the GATE
existed, the INITIATIVE did not, and permission is not initiative). Refusal named as a legitimate
answer per §3.4. Parity 49/49. Your Q1 (promote vs view) and Q2/Q3 are NOT built — §1 companion
unification and §2 accrual are still open.

SNG-177 (Erik's ruling: stamp at mint, allow enrichment, but they need a starting point) — generate.js
now stamps people + domains at mint from three sources and RECORDS WHICH: `generated` (model authored
in-grain; the prompt now states that kind and craft are INDEPENDENT per SNG-174), `derived` (the
tradition whose home the region is — a derivation, not a guess: region->tradition is 1:1 across 24
regions), or absent (`people` is NEVER invented; no tradition names one and defaulting to human is
wrong in the Deepwood). Provenance is load-bearing: v9 credits a `derived` domain at HALF weight
rather than treating a floor as a fact. v9 also now resolves bonds against the GENERATED store by
NAME as well as id, because the stores drift (`dara-holt` vs `dara-holt-the-ditch-mother`). v10
backfills existing generated records. On Erik's save this lit up Siol, Tane Solr, Dara Holt, Calvar.

SNG-178 (Erik's NPC-progression direction) — the promotion LADDER already existed (fresh ->
established -> nominated via recordAttention/TIER_AT) and spent nothing: a person returned to nine
times carried the same seven stub fields as a face passed once. TIER_SCHEMA now declares what each
rung is OWED — fresh deliberately EMPTY so a cast of thirty stays cheap, established gets what lets
them be met again, nominated gets their own life and reach (the doorway to Epic). Lazy, not eager;
enrichment is earned. app.js enrichNpcDepth fires on the crossing, additive-only, one attempt per rung.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record at
all; I declined to derive them from firstMet because at a hub it is actively wrong), and the map/axes
ruling. Remaining build: 7 (SNG-171 §1 arc anchors), 8 (166/167 rest, 168, 170), 9 (SNG-172). -->

---

<!-- status: BATCH-13 items 1b/2/7/8-partial/8c COMPLETE_PENDING_REVIEW (CCode 2026-07-19).
v1.8.142 SNG-179 · v1.8.143 SNG-171 §1 · v1.8.144 SNG-181 · v1.8.145 SNG-167 §1c.1 · v1.8.146
SNG-167 §2. Suite green at every ship, verified by EXIT CODE. ROUND 2 answers filed in
po/results/20260719_ROUND2_worldspace_and_179.md as directed. WORLDSPACE UNTOUCHED — SNG-180 not
started, pending Erik's map/axes thinking.

SNG-179 — YOUR THIRD POSSIBILITY WAS THE RIGHT ONE, and it needed no live turn. Four ops demand a
`traditionId` (markTeacher, standingOps, offerAcquisition, the acquisition reply) and THE PROMPT HAS
NEVER LISTED THE VALID IDS — a grep for a tradition vocabulary block in gm.js returns nothing. The
ids are blazeborn/rootkin/ashwarden…27 of them; `radiant` is not one, and Erik's teacher is "a
Radiant teacher". app.js then discarded the miss in total silence. An enum the writer has never seen
is not an enum. Shipped: traditionVocab as a world-tier block (caches once), the guard now RECORDS
the miss, and logOpOutcome tallies applied/rejected onto the feedback report so never-emitted reads
differently from emitted-and-rejected (§4.4). ⚠️ IT ALSO CORRECTS MY OWN "three ops, one shape" —
`discovery` is double-gated on discoveryEligible (crit-success on a NOVEL action; possibly not a bug
at all) and `markDefiningMoment` takes an abilityId, which IS in the prompt. THREE CAUSES, NOT ONE
SHAPE. Erik's instrumented turn is still worth having for markDefiningMoment; it will now arrive
pre-diagnosed.

SNG-171 §1 — both defects confirmed verbatim then fixed. Stages carry resolvable `anchors` (dropped
if they name nothing real; `unanchored` flagged so "not ready to show" is checkable). Outcomes carry
real effects clamped to the SAME quests.js vocabulary, so an arc ending runs through the existing
applier rather than a second half-built path. §1c.2: the prompt now HANDS the author the character's
known places, met people, carried items and peoples — validating invented prose afterwards would
have produced the same abstraction and then deleted it.

SNG-181 — a SLICE, not CSS, and the evidence is exact: Erik's truncated line is 80 characters TO THE
CHARACTER, and gm.js:603 read `.slice(0, 80)`. Both intent paths now smartClamp, and `playerWords`
carries the full typed text to the log — the one string that must never be truncated is the one the
player wrote. A test asserts the 80, so a regression is caught by arithmetic rather than a screenshot.

SNG-167 §1c.1 — region lore is automatic now; 11 locations gain their Reach. ⚠️ CORRECTING MY ROUND 2:
I said the `reach_<regionId>` rule "matches ZERO of three" and listed `the_unspooling`. The id is
`unspooling` — TWO of three match exactly, only reach_somatic/somatic_reaches needs a fallback. I
asserted a detail without checking it. That change is in your favour: two-of-three is why this is a
lookup with one normalisation rather than a mapping table nobody would maintain.

SNG-167 §2 — npcSeedDetail registered and consumed as rule 10b. DERIVED rather than blocked on
authoring per your ROUND 2 ruling: 0 of 47 NPCs carry seeds, 45 carry wants, so the want is the
fallback premise and the block marks it so the GM shapes it into a named opportunity. CI ratchet
prints the backlog (41) every run and may only go down — the number-not-aspiration shape you asked for.

⚠️ PROCESS ERROR, RECORDED: one ship (v1.8.143) went out RED. My command was
`npm test | grep ... && git commit`, which chains on GREP's exit status, not the suite's. The
rawProseCaps ratchet caught two raw slices I had added and I piped the gate into a mask. Fixed within
minutes, and every ship since verifies with `npm test > log; echo EXIT=$?`.

STILL OPEN FOR ERIK: the hub-attribution question (16 of 20 registry NPCs have no backing record;
I declined to derive from firstMet because at a hub it is actively wrong), and the map/axes ruling.
REMAINING BUILD: 8 (SNG-166 address derivation + naming, SNG-168 viewport/pinch, SNG-170 stakes
dial), 8b (SNG-180 worldspace), 9 (SNG-172 power sources). -->

---

<!-- status: BATCH-13 item 8 SUBSTANTIALLY COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.147
SNG-168 viewport · v1.8.148 SNG-166 §1 address derivation · v1.8.149 SNG-166 §3 naming. Suite green
at each, verified by EXIT CODE.

SNG-168 — FOUR defects and the first explains the rest. The world and location tiers rendered a BARE
<svg>, but the reason they were never simply wired is that wireSkillGraphViewport DEREFERENCED THREE
CONTROLS only the region tier renders (getElementById("gz-in").onclick, unguarded) — so calling it
anywhere else threw before reaching the listeners. The null-guard is what makes one wiring serve five
surfaces; the markup fix alone would have crashed. PINCH: touches[1] appeared ZERO times repo-wide,
so zoom was wheel-only and a phone has no wheel. THE LEAK IS REAL as your audit suspected — one
module-level graphView served map AND wheel AND graph, so zooming the map and opening the wheel
inherited the transform; state is now keyed per surface (world/location/map/wheel/graph). Verified
against the app the browser actually serves, zero console errors.

SNG-166 §1 — MEASURED ON THE LIVE SAVE: all 6 generated locations carried regionId=valley, including
`gen-center`, which IS the Crossing, and `gen-ashwarden-march-road`, which is the Palelands. My ROUND
2 noted the stubEntity default only fires on unrepairable output and MISSED the second cause: the
general path never asked the model for a region at all, and the prompt handed it "WHERE: <the
player's current place>" and nothing else. Same lesson as SNG-179 — the valid regionId list now ships
in the prompt and says the right answer is NOT necessarily the place above. resolveRegionFor orders
evidence authored -> named -> anchor -> unresolved, and THE ORDER IS THE FIX: the anchor is wherever
the player stands, so inheriting it IS the bug. Re-resolved: gen-center -> the_center,
gen-ashwarden-march-road -> the_palelands, the four genuinely-local ones correctly stay valley.
Unresolvable now yields NULL + regionSource:"unresolved" per ROUND 2. CI guard added from my own
ROUND 2 §6.1 — content_ci fails on a hardcoded region default, because "derive, else default" had
already come back once.

SNG-166 §3 — YOUR CORRECTION PROVING ITSELF, with the number. Across 10 characters on this device: 52
distinct given names, 5 recurring, and MARA MET BY FOUR CHARACTERS. Within any one save there is
exactly one Mara, so the per-character ratchet the spec first proposed would have read GREEN forever
while the thing Erik noticed kept happening. namematch now carries givenName / usedGivenNames /
namesToAvoid / nameRepetitionCount, counted across the device, avoid-list sorted worst-first so
truncation keeps the real offenders. THE ONOMASTICS HALF CAME FROM CONTENT THAT ALREADY EXISTED —
traditions.json carries an `aesthetic` line for all 24 peoples, so names can sound like the country
that made them with no phoneme table and no authoring pass.

REMAINING AND WAITING ON A RULING, NOT ON ME: SNG-166 §2 region renames (display-name migration —
cost measured at 52 occurrences across 18 files, ids provably unaffected), SNG-170 stakes dial
(default + whether the boar/greatcat flip to lethal), SNG-180 worldspace (Erik's map/axes thinking),
SNG-172 power sources (wants the substrate ruler settled). Also still open: the hub-attribution
question — 16 of 20 registry NPCs have no backing record, and I declined to derive them from
firstMet because at a hub it is actively wrong. -->

---

<!-- status: SNG-182 + SNG-180 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.150 SNG-182 ·
v1.8.151 SNG-180. Suite green, verified by exit code.

SNG-182 — ANSWERING YOUR Q1 BEFORE BUILDING: there is no resolver, there are FIFTY-SEVEN. 57 ad-hoc
"look the record up by id, take .name, fall back to the id" sites across app.js and engine/, 52 of
them for traditions alone, and the region lookup written out verbatim twice. Erik's generalisation is
exactly right. Q2: {{…}} is unreserved. Q4: ZERO tokens today, so this is the cheapest possible
moment for the gate — your guess, confirmed. Q3 — RESOLUTION BELONGS AT ASSEMBLY, NOT LOAD, and
SNG-111 decides it: progressive naming is PER-CHARACTER, so the same NPC id is "the dock-master" to
one character and "Sorel" to another; baking a name at load destroys that permanently. Wired at
assembleGMContext, the one choke point every view already passes through, so no builder has to
remember and the model can never see token syntax. §2.3 acceptance test PASSES — change the record,
every reference follows, one edit. §2.4 is the loreRefs lesson applied IN ADVANCE: unresolvable
tokens fail CI and degrade readably at runtime, never a blank and never raw {{…}} to a player.
Verified by planting a broken token — it failed, named the file and field, and resolved the good
token in the same file. Migration stays incremental per §2.7; nothing retrofitted.

SNG-180 — the sphere ships. Geodesic on your authored worldPos, and the geometry confirms itself:
the_great_engine <-> the_numen = 3.1277 radii (~π, 299 walking days), and routing that trip VIA THE
CROSSING costs 3.1314 — a difference of 0.0036. The hub sits exactly πR/2 from every Reach and the
antipode/neighbour ratio is 12, the same 12 as the axes. walkingDays is wired to the map place card
so the year-to-walk scale is immediately player-visible.

⚠️⚠️ THE SUBSTRATE RULER DOES NOT SHIP AND THIS IS THE PART TO READ. Erik is right that mechanics
should not measure with a drawing, so I switched the substrate field to geodesic — and the §9b
invariants BROKE: pools/sinks 25/26 -> 11/26, locations with local variation 73 -> 0. Not a constant
problem; I derived the conversion twice, first from median pairwise ratio (222) then properly from
median CONNECTED-EDGE length (309) since the radii were tuned against reach along the graph. Both
flat. CAUSE: intra-region geodesic distance has a median of 0.234 radii against a converted radius of
0.388, so a source sits at ~55% strength across its ENTIRE region — every location gets a near-uniform
delta and per-region renormalisation cancels it to nothing. YOUR worldPos IS NOT THE PROBLEM: it is
distinct for all 95 and 0% identical within any region. The issue is GRANULARITY — the sphere resolves
regions; the substrate field needs sub-region resolution. Either the 26 radii re-author much smaller
in world units, or substrate keeps the travel graph as its ruler. A design call with numbers attached,
not something to dial until it passes. I reverted rather than ship a flat field to satisfy an
architectural preference.

MY OWN GATES CAUGHT ME TWICE IN THIS SHIP: the revert left geodesic with no consumer (testOnlyExports
8 -> 10, "CANNOT FIRE IN PLAY"), which is what prompted the place-card wiring; then isAntipodal and
nameRepetitionCount were still test-only — speculative API I wrote because it seemed worth having.
Deleted rather than special-cased. Ratchet improved 8 -> 7.

REMAINING: SNG-172 power sources (ruling 2 unblocked the 285-ability classification; largest left),
SNG-166 §2 renames (now land THROUGH SNG-182), SNG-170 stakes dial (default still yours). -->

---

<!-- status: SNG-183 CAPSTONE COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.152. Suite green,
verified by exit code. Results: po/results/20260719_SNG-183_full_accounting.md.

FOUR OF THE SIX LENSES NOW RUN IN npm test. L1 (testOnlyExports/importedNeverCalled) and L4 (loreRef
gate) already existed. The two that were only ideas are now gates:

  L2 permission-isn't-initiative — ENGINE_MAP gains a third authored column, `what makes it fire`.
  A module with a real player surface and NONE for a trigger is a capability nothing makes happen —
  the teacher gate that never fired. Gate requires all THREE columns present or all absent; warns on
  the L2 shape. 24/55 described (incremental per the accepted split). Verified by flipping gm.js to
  NONE and watching the warn fire.

  L5 static half — the missing link was DISPATCH. GUARD 2 already checked schema<->salvage parity;
  wiring_audit now also checks every documented op has a turn.<op> consumer in applyTurn. An op with
  full wiring that nothing reads is dead on arrival, caught at build. Proven with a phantom op. The
  runtime _opLedger (SNG-179) is the other half.

  L6 universal-gate-for-a-local-fact — content_ci finds a random encounter whose minDanger exceeds
  the dangerLevel of every location its tags match. re_toll_bandits is fixed (reaches all 6 tag-homes
  now). ⚠️ THE CHECK IMMEDIATELY SURFACED A LIVE SECOND INSTANCE THE BATCH HAD NOT FOUND:
  re_creature_chase, minDanger 3, whose only "wild"-tagged home is dl2 — a predator that can never
  appear on the one wild road. Ratcheted at 1 and NAMED, because the fix is a number Erik owns (lower
  the floor or raise a location's danger). A second new instance fails the build.

  L3 guard-in-a-pipe — the ONE lens that cannot be a gate, because it IS the verification layer.
  Lives as a rule (verify by exit code, no test result across a pipe) in the lens table, and it is
  the discipline every ship since has followed. Reported as unmechanizable rather than faked.

NOT DONE, DELIBERATELY: the full op->engine->surface connection GRAPH as a single rendered artifact
(§3d). The pieces exist (registry, dispatch check, authored surface column); I did not want to ship a
half-derived graph and call it the accounting. Natural next increment.

STILL OPEN AND YOURS: the substrate ruler (my handoff question — does your implementation renormalise
per region? mine forces drift to ~0 by construction and I believe that is what breaks invariant 1 at
your radiusWorld scale), SNG-172 power-source classification, the renames themselves (land through
SNG-182), the stakes-dial default, SNG-179's live instrumented turn for markDefiningMoment, and
re_creature_chase's danger number. -->

---

<!-- status: SUBSTRATE RULER SHIPPED (CCode 2026-07-19). v1.8.153. Suite green, browser-verified.
Results: po/results/20260719_CCODE_three_landings_verified.md.

Your no-renormalisation answer was the whole difference and I found it myself. Removed the
renormalisation block — pools-rise/sinks-fall is now STRUCTURAL. Your corrected §9b invariant-2
wording shipped into SYSTEM_SPEC (means stay NEAR as a consequence, drift-to-zero is a symptom). AND
my second error: the distance was DIRECT geodesic, not path-over-connections — path-over-connections
is right for walkingDays (roads) and wrong for the field (the lattice radiates through space).
Confirmed empirically: direct geodesic reproduces your drift 0.0515 TO THE DIGIT; the connection
graph does not. Verified through the LIVE browser modules: 26/26 invariant, drift 0.0515, the_blaze
1.00 / the_heartroot 0.02 / sunken_choir 0.66 — every number matches yours.

RENAMES verified through my resolver: 7 tokens across content, 0 unresolvable, the five renames
resolve live. content-CI token gate now reports 7-and-all-resolve on the real corpus.

⚠️ FOUND, NOT BUILT — power_sources.json IS AN L4 ORPHAN, caught by the lens I shipped hours ago.
state.js never loads it (no loadRule("power_sources")); nothing in engine/app/tests/scripts reads
it. And the ruling it encodes is NOT yet mechanically true: umbral — your worked example — has NO
substrateBand, so it is substrate-NEUTRAL today (full power everywhere), not benefiting from thin. I
did NOT wire it, for two reasons: (1) "natural benefits from thin" means an INVERTED band, which is
new curve shape under tuningNote — your content lane and Erik's balance call; (2) my L4 gate covers
lore and location addresses but NOT rules-file reachability, so a registered-but-unloaded rules file
sails through — a real gap in my own gate. ONE SMALL TICKET: either wire power_sources into
substrateVerdict (with balance_sim as the gate) or mark it a reference document, so the lens stops
seeing an ambiguous half-landed state. I can extend the L4 gate to rules files either way.

STILL OPEN AND YOURS: stakes-dial default, SNG-179's live turn, re_creature_chase's danger number,
and the power_sources wire-or-flag decision. -->

---

<!-- status: SNG-172 audit + L4 rules gate (v1.8.154) and SNG-179 fix (v1.8.155) COMPLETE_PENDING_REVIEW
(CCode 2026-07-19). Suite green, verified by exit code + regression-proven gates. Results:
20260719_SNG-179_FIX.md, and the audit/gate in the same commits.

SNG-172 — AUDIT, not wired, per Erik. content_ci now checks classification agrees with band centre
(natural low, lattice high). Verified the relationship before encoding: naturals 0.18-0.36, lattice
0.58-0.95, cleanly separable. threnodist + verist (natural, banded 0.50) are your two
flagged-not-changed disagreements — known-listed, reported, not failed. The umbral hole is closed
(0.58/0.28) and the check proves it fires by stripping a band. AND this reads power_sources.json, so
it is no longer the L4 orphan.

SNG-183 L4 FOR RULES FILES — closed the gap you named ("registered-but-unloaded should not pass").
A kind:"rules" file must have a consumer (loader or CI); design/reference kinds are exempt.
power_sources passes via the audit; quest_structure (kind:rules, authoring guidance) is ratcheted at
1, named not reclassified. A NEW unloaded operational rules file fails — proven with a probe.

SNG-179 — I CHECKED ALL THREE MAPPINGS AND ONLY ONE WAS SAFE TO BUILD, which is what "check each
pairing" is for. markTeacher: BUILT — derived from bondType:"mentor" + the mentor's own domain,
never invented, additive to explicit markTeacher. discovery: NOT derived — it is precondition-gated
(discoveryEligible, a crit-success on novel; Silas has 0), so deriving from codexUpdates would fire a
false reward. markDefiningMoment: NOT derived — Silas HAS ripe candidates so it IS substitution, but
a deed carries no abilityId and there is nothing clean to derive from. Both 19C and 19B rebalanced —
brake to the middle, qualifier last, NO emphasis added. 19B's engine confirm-and-refuse reframed from
a warning into the safety net that PERMITS firing.

⚠️ THE VERIFICATION IS ERIK'S and I did not pretend a unit test suffices — you said it wouldn't.
Re-run "Ask Veth to teach you," confirm character.teachers non-empty, confirm the capstone unlock
opens. TWO UPSTREAM DEPENDENCIES you will hit, both the SAME open gap: the captured Veth turn set
NEITHER bondType NOR a domain (she is sworn, registry-only, no backing record). The 19C rebalance
makes the model likelier to set the bond; the domain needs the SNG-177 backfill for REGISTRY-ONLY
NPCs — the same hub-attribution gap behind the Ent crediting nothing. Mechanism verified; Veth's
end-to-end waits on that gap. logOpOutcome now records "derived-from-bond" so the op-ledger shows it.

THE HUB-ATTRIBUTION GAP (registry-only NPCs with no domain) is now the single upstream dependency
behind BOTH the Ent-standing and the Veth-teacher outcomes. Recommend it as its own ticket — it is
the last thing between three shipped mechanisms and the outcomes Erik reported.

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, the reproduced-symptom
verification of SNG-179, and the registry-only-NPC affiliation gap. -->

---

<!-- status: SNG-185 hub-attribution COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.156. Suite
green, verified by exit code. Results: po/results/20260719_SNG-185_hub_attribution.md. This CLOSES
the single upstream dependency the last three blocks kept naming.

YOUR ONE-LINE GAP WAS EXACT — two paths mint people, only generate.js stamped domains. §5.1 answered
by DOING it: generate.js:affiliationFor is no longer a second implementation, it delegates to a new
engine/affiliation.js that the GM meet-path (npcs.js applyNpcUpdates) and the reconcile v11 backfill
also call. One rule now. The shared version is a strict superset, so generation gains role +
skillsObserved reading with nothing regressed.

§5.2 — SAFE, and I did NOT add a third required-on-meet field. You warned the list (gender,
appearance) is getting long and the model drops fields under load; deriving from the ROLE the model
already writes sidesteps it entirely. Order per §3: role string FIRST, skillsObserved second, region
home LAST (marked derived, half-weight). §5.3 backfill uses that same order.

⛔ THE TRAP AVOIDED, STRUCTURALLY not carefully — readPeople and readDomains match SEPARATE
vocabularies and share no code path. The Crossing Ent resolves people:ent AND no domain invented from
being an Ent. Whole-word too, so `mason` never matches inside `stonemasonry`. Erik's SNG-174 ruling
made mechanical.

⚠️ AN HONEST NUMBER: the backfill affiliated 1 of 21 registry NPCs and that is CORRECT. 20 were met
in the VALLEY, home to no single tradition, and their roles name no craft — so region-fallback rightly
abstains (§4.4, never assign what the record cannot support) rather than manufacturing 20 domains.
I'd rather report 1/21 with the reason than tune the fallback to fire for the mixed basin.

VETH: the DOMAIN half — the blocker — is CLOSED. She carries ashwarden (source role) after backfill;
markTeacher would resolve it and open the capstone gate. The remaining half is the model setting
bondType:"mentor" on the live turn (the SNG-179 rebalance) — that stays your reproduced-symptom check.
THE ENT was never in Silas's registry at all (SNG-179 finding), so nothing to backfill; going forward
the meet-path stamps it people:ent at meet. 14 new tests, all acceptance points. affiliation.js earned
its SYSTEM_SPEC row + three ENGINE_MAP columns (my own ratchets caught the omission).

STILL OPEN AND YOURS: stakes-dial default, re_creature_chase's danger number, and the reproduced-
symptom verification of SNG-179 (now unblocked on the domain half). -->

---

<!-- status: SNG-186 §2f (see the machine) COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.157.
Suite green by exit code; 🔬 Machine screen verified live in the browser. Results:
po/results/20260719_SNG-186_2f_see_the_machine.md. §2f ONLY — §2c/§2a/§2b are the next increments.

Stakes + re_creature_chase (minDanger 3→2) received at HEAD; the creature-chase number passes my L6
check clean (reachable on dl2 now), no re-baseline. Built §2f first per your §4 order.

YOUR §5, ANSWERED BY BUILDING IT. §5.1 (clean seam?) — ONE, and the cleanest possible: every model
call routes through callClaude, so a single optional observer there (setCallObserver) captures the GM
turn AND every sub-call (intent-parse/narrate/generate) for free. The transport stays dev-agnostic;
app.js registers the capture ONLY under isDevMode() at boot. No lever reached past a path. §5.2 (prompt
recoverable?) — was NOT retained (locals in gmTurn); is now, at that one seam, 24-entry ring, dev-only.
§5.4 — one screen with sections; §2f is the first.

§3.4 HELD AND TESTED — armed starts false; in a player view the observer is null and NOTHING is
captured. Disarmed recordCall returns null (asserted).

THE ZERO IS THE SIGNATURE. The firing-counts panel shows a count for EVERY documented op including the
never-fired — the SNG-183 §3c view (three ops read zero for sixteen levels) without a play session.
Verified live: NEVER FIRED (32) lists discovery/markTeacher/markDefiningMoment at 0. To avoid a THIRD
copy of the op list I made salvageOps' array the exported SALVAGEABLE_OPS — the ONE source the
salvager, the wiring audit GUARD 2, and this panel share; two source-regex consumers updated so the
rename can't drift them. Ops-fired from the parsed turn, applied/rejected from the real _opLedger
(reused) — fired / rejected-only / never read as three states.

§3.2 — feedback reports now carry ctx.devMode + a _devActions ledger (the mutating levers §2c/d/e will
append to). §2f is read-only so it appends nothing, but a dev session can no longer hide itself.

⚠️ THE ONE PATH NOT EXERCISED: an actual API capture (prompt→raw→parsed for a real turn) needs a key +
a played turn — it is Erik's browser-leg AND it DOUBLES as the SNG-179 verification. Play a turn with
dev on, open 🔬 Machine, and the Veth teach-me exchange is right there: raw npcUpdates, whether
bondType:"mentor" fired, whether markTeacher derived. The instrument and the thing it diagnoses arrive
together. 9 new smoke tests; devcapture.js earned its SYSTEM_SPEC row + ENGINE_MAP columns + count bump.

REMAINING IN SNG-186: §2c stage-an-encounter (seam confirmed clean — startEncounter takes a full def,
sanitizeNewEncounter clamps it), §2a go-anywhere, §2b know-nothing reset. Then SNG-187 cold-load
(received, briefed — Promise.all per manifest group; caution 3 the order-independence trap is noted).
STILL OPEN AND YOURS: SNG-179's reproduced-symptom verification (now also the §2f live check). -->

---

<!-- status: SNG-187 cold-load COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.158. Suite green by
exit code; correctness proven byte-identical against the sequential load. Results:
po/results/20260719_SNG-187_cold_load.md. Erik chose this over §2c and SNG-188.

YOUR DIAGNOSIS WAS EXACT. loadContent awaited ~250 JSON files STRICTLY SEQUENTIALLY (Promise.all
appeared zero times) = ~15s of pure round-trip latency, not payload. Counted the fetches: 250.

THE FIX — three sequential stretches parallelised: the ~12 core rule-loads (one Promise.all), the 10
content groups (the 252 files, promises created before the first await so groups OVERLAP), the
~14-fetch tail. ~250 serial round-trips → a handful of waves.

BOTH CAUTIONS HELD. Failure tolerance — valley items + quests keep allSettled (skip a bad file);
every fatal-on-miss group stays Promise.all. Order-independence — Promise.all/allSettled preserve
INPUT order in their results, so every fold runs in manifest order; an id collision's winner is
unchanged (last-write-wins), quests concat in the same order. CAUTION 3 PROVEN NOT ASSUMED: a Node
harness (fetch shim over the real files) ran loadContent both ways and compared a fingerprint —
counts + a value-size hash per id-keyed map (catches a reordered collision winner, not just a drop) +
accord-tagged abilities + legends-in-npcs — IDENTICAL TO THE DIGIT. That run also proves loadContent
executes end-to-end without throwing.

THE WIN, QUANTIFIED (localhost can't show latency — your point): synthetic per-fetch delay, 250
fetches, PEAK CONCURRENCY 221 (was 1), parallel 258ms vs sequential-equivalent 6250ms at 25ms/fetch =
24x. Scaled to ~60ms CDN the sequential path is ~15s — reproducing your 15.30s and confirming the
diagnosis; parallel is a few waves, inside the <2s target.

⚠️ VERIFICATION IS YOURS, and localhost cannot substitute — I could not even see the change in the
in-app browser (its ES-module cache pinned the old state.js across a server restart + force reload;
the stale-tab trap), and localhost is a disk read with no latency regardless. LCP before/after on the
LIVE CDN is the real proof (§6). A [loadContent] count canary logs at boot so a silent group-drop on
the real server shows in the console. Prompt caching untouched (§4). §3.5 early-paint + §5 bundling
NOT done — likely moot now; measure the new LCP first.

QUEUE NOW: SNG-186 §2c/§2a/§2b (workbench remainder), SNG-188 moved-without-consent (new spec at HEAD).
STILL OPEN AND YOURS: SNG-179 reproduced-symptom check, SNG-187 CDN LCP. -->

---

<!-- status: SNG-190 ALL FIVE SECTIONS COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.159–163, one
verified commit each. Suite green by exit code at every ship. Results:
po/results/20260719_SNG-190_teleport_and_three.md. Three of four were the engine contradicting itself,
as you called it; §3 was a defect in my own §2f panel.

§1 THE TELEPORT (v1.8.159) — dead. §1.3 sub-place → PARENT LOCATION (findSubPlaceParent first; the
kitchen is a sub-place of Cairnhold so it lands in Cairnhold, no move) — the fix that alone prevents
it. §1.1 the waygate router is skipped for a sub-place and only claims a move to a REAL GATE. §1.2
unresolvable-from-gate FAILS CLOSED (returns null), never the hub — same principle as SNG-188 §4.2.
§1.4 prompt reconciled: a sub-place (room/garden/kitchen) is NOT a destination; minting stays for
separate places (SNG-117 intact). Reproduced-symptom test on the literal captured ref.

§2 ONE PERSON TWO RECORDS (v1.8.162) — reconcileGeneratedNpcWithMeet (npcs.js, the identity module)
re-homes the generated record onto the MET id, matched by the hint naming the met person. silas-mother
keeps its bond, gains Hesta Vorn's name + craft; hesta-vorn gone. Unrelated requests don't falsely
merge. Tested on the literal scenario.

§3 FIRING PANEL FALSE ZEROS (v1.8.160) — MY §2f bug, trust-critical. It read _opLedger, which only
markTeacher instruments, and rendered 31 un-instrumented ops as NEVER FIRED above an exchange that
emitted six. Now: emission counted for EVERY op every turn (_opEmitted + _opTurns denominator);
applied/rejected shown ✓/✗ only where instrumented; captures folded so a card's emitted op can't read
as not-emitted above it; caption with no turns says "it is not a finding." Verified live, 4 guards.

§4 RAW MARKDOWN (v1.8.161) — renderProseHtml (narration_voice.js, the visual twin of cleanForSpeech)
renders the *✦ … **bold** …* asides as styled .beat-aside; zero asterisks reach the reader.
Unit-tested on the literal captured string.

§5 SNG-189 CARRY-OVERS (v1.8.163) — §5a [object Object]: coerceSceneSummary guards the chronicle push
(the ONLY raw-object write — Q2 answered: facts/places already String-coerce); reconcile v12 sweeps
corrupted saves. §5b the silent 72h clamp: raised to 168h (a montage journey is expressible) and a
truncation is now RECORDED (_timeClampNote), never silent.

⚠️ STILL NEEDS YOUR RULING (SNG-189 §5 Q1): the invented "World-day 23" in durable notes is the GM
adding journey days to a real-time-derived shared calendar. I did NOT strip the day-numbers — if
journeys DO advance the calendar, 23 is correct and the calendar is what's wrong. That's yours.

QUEUE NOW: SNG-186 §2c/§2a/§2b, SNG-188 moved-without-consent. STILL OPEN AND YOURS: SNG-179 repro
check, SNG-187 CDN LCP, and the SNG-189 §5 Q1 calendar ruling. -->

---

<!-- status: RUNNING_FIXES A5 COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.164. Suite green by
exit code. (Also: A1 the 72h clamp already landed as SNG-190 §5b — both struck through in
RUNNING_FIXES.md.)

A5 — the GM stopped denying REAL places. Erik asked to travel to The Blocklands; it said the place
"isn't a named location in the world." the_blocklands.json exists, is manifested, has 2 inbound
connections. Cause: recallForGM was gated by isPlaceKnown, so a place the player NAMED but never
visited was filtered out, recalledDetail came back empty, and the GM answered from lore (Valley only).
Absence from context rendered as absence from the world — the SAME shape as SNG-190 §3's false zeros.

FIX: existence and knowledge were collapsed; now separated. recallPlaces surfaces a NAMED place from
the full atlas in two tiers — KNOWN (with detail, ranked first) and REAL-BUT-ROUTE-UNKNOWN (existence
only, no detail — still not omniscience). recallForGM renders the far tier under an explicit "these
EXIST, the way is unknown, never deny them" instruction, and the gm.js RECALLED header now says "you
are UNAWARE of it" for a name in neither tier (honest uncertainty) instead of "has not been placed
yet" (a denial). Refines SNG-176 without undoing it — a non-atlas name stays truly unfindable.
Reproduced-symptom test on the literal Blocklands capture; the SNG-176 test reconciled to
existence-only. Erik's browser-leg is the live check.

RUNNING_FIXES still OPEN and mine: A2 (scene closed on a live thread — mechanically detectable),
A4 (the CLASS of unguarded prose-counts in content files — one instance fixed, the gate is not),
A3 (low). QUEUE unchanged otherwise: SNG-186 §2c/§2a/§2b, SNG-188. -->

---

<!-- status: SNG-188 moved-without-consent COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.165. Suite
green by exit code. Results: po/results/20260719_SNG-188_moved_without_consent.md. All FIVE outcomes.

Your root — the guard needs more to fire than the action needs to act — closed from both ends.

§4 DISCUSSING ≠ DOING: isSpeechAct (engine/intent.js, pure + exported) is the code belt behind the
parser prompt; a label led by a speech verb (announce/confide/tell/discuss/plan…) returns null from
travelIntentOf before buildTravelDirective can force anything. Erik's exact label stays in the alcove.
§3 THE DIRECTIVE IS NO LONGER ABSOLUTE: buildTravelDirective was "you MUST emit moveTo"; now "move
them IF the fiction departs this beat; if still planning, don't." SNG-122's judgement given back.
§2 FAILS CLOSED: departureGateFor now ASKS on an unresolvable origin/dest (names what it couldn't
resolve) instead of returning null — the old fail-open is exactly why Silas moved (his origin, the
unrecorded warden post, didn't resolve; that's the SNG-176 defect causing a second one). §5 SAME-REGION
TRAVEL IS STILL TRAVEL: gates a crossing OR a non-adjacent journey; an adjacent step still proceeds
(not a nag). §1 offer is go/stay/stay-default, declining commits nothing (SNG-145 held).

Reproduced-symptom test on Erik's literal label + the full gate matrix. Two SNG-145 tests that
asserted the old fail-open behavior updated to the new contract. Both the teleport (SNG-190 §1) and
this are now fail-closed — the same failure seen in both directions in one day, both shut.

QUEUE NOW: SNG-186 §2c/§2a/§2b (workbench remainder) is the last big open build. RUNNING_FIXES still
mine: A2 (scene closed on a live thread), A4 (the CLASS of unguarded prose-counts), A3 (low). Erik's
browser-legs: SNG-179, SNG-187 LCP, SNG-190 §1/§2 and SNG-188 live checks, and the SNG-189 §5 Q1
calendar ruling (C1). -->

---

<!-- status: SNG-186 §2a + §2b COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.166. Suite green.
Built BEFORE §2c per Erik's reorder — the dev character couldn't reach a real location to test, so
go-anywhere and know-everything were the live blockers on his whole verification workflow.

§2a GO ANYWHERE — jump to any of the ~95 locations by id/name, ignoring connections/waygates/travel
time (incl. unreachable ones), through the REAL move fields (currentLocationId/addKnownPlace/
notePlaceVisit/notePerception — §3.3), clears the scene and drops into Play at the new place. §2b KNOW
EVERYTHING / NOTHING — reveal all locations, or reset to just where you stand (the inverse matters
more: SNG-176 retrieval bugs only reproduce from ignorance). §3.2: markDevAction stamps every pull
onto _devActions, which rides into feedback. 5 source guards green; no-character render verified live;
the with-character lever is Erik's real-save test (the purpose). §2c (encounter harness) remains.

SNG-191 READ AND SCOPED, not yet started — it is genuinely the big one, and the unit-name ruling it
flags is ALREADY resolved in canon (world_clock.json: canonical "count", formal "the Kept Count"), so
nothing is blocked. Five phases: (A) the two-clock SPLIT — world time becomes a COUNT not days, which
is what removes the day-number the GM keeps inventing (closes C1/SNG-189 §2/SNG-190 §5; scoped, low
blast radius: add worldCount + rewrite the CURRENT TIME block + uncap timeOps + load world_clock.json);
(B) the peoples' idioms on top of the count; (C) party formation syncs CHARACTER clocks; (D §4) the
WORLD-TICK INVERSION — stop imagining vignettes, advance delegated assignments (the substantive half,
a real rewrite of worldtick.js); (E §7) the GENERATION TURN — latent arcs foment on the world count
and surface at thresholds (a whole new proactive subsystem). Recommend building Phase A first — it is
the highest-value, most-contained, and closes the recurring day-number bug. D and E are large enough
to each warrant their own focused build. -->

---

<!-- status: SNG-191 PHASE A COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.167. Node suite green;
code proven in the browser via a cache-busted fresh loadContent. Results:
po/results/ pending (will file). The two-clock split — the piece that kills the invented day-numbers.

worldCount() is the world's monotonic COUNT (~1/real-hour, never rewound, the shared ordering key).
world_clock.json loads onto CONTENT.worldClock (unit "count"/"the Kept Count" + custody + 11 idioms —
the unit-name ruling was ALREADY resolved in canon). The CURRENT TIME block now shows the character's
own days/season + the Kept Count as an ORDERING mark that is explicitly NOT a date — no world
day-number remains to invent (closes C1 / SNG-189 §2 / SNG-190 §5). timeOps UNCAPPED (RUNNING_FIXES A1
dies — a four-day journey costs four character-days). worldDateLabel → worldCountLabel.

⚠️ HONEST VERIFICATION NOTE: the preview browser's static-import boot shows the known STALE-MODULE
artifact — this session edited many bare-imported engine modules and the mcp browser holds them hard
(no service worker; pure HTTP module cache) against a fresh app.js. A cache-busted fresh loadContent
returns 95 locations, world_clock loaded, 285 abilities — so the CODE is correct; a clean full-boot in
THIS preview wasn't demonstrable without a fresh origin. Erik's fresh deploy loads clean (Pages ETag
revalidation); a hard reload clears it if a returning tab hits it. The CURRENT TIME prompt is his
browser-leg (narrate from character time; no day-number).

REMAINING SNG-191: B (peoples' idioms on the count) + C (party-formation syncs CHARACTER clocks) are
small; D §4 (world-tick inversion — advance delegated assignments, not vignettes) + E §7 (the
generation turn — latent arcs foment and surface) are large, each its own focused build. -->

---

<!-- status: SNG-191 PHASE B COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.168. Suite green.
The count is spoken in the LOCAL people's idiom — one number underneath, many words on top (§2).
worldCountLabel(count, worldClock, peopleId) resolves the idiom from world_clock.json canon; the
gm_registry builder finds the people from the character's region (region → home tradition); the
CURRENT TIME block frames it "the shared count, spoken as the people here count it." Cairnhold →
tolls, Gearlands → revolutions, rootkin → risings; churnfolk (no steady word) and any absent people
fall back to the formal "the Kept Count." Tested against the canon idiom table.

⚠️ PHASE C RECLASSIFIED — NOT a quick phase. The shared scene (party.js) carries NO clock, so syncing
members' CHARACTER clocks means propagating a time delta across players' saves on different devices —
distributed infrastructure (each save is client-side; I cannot write another player's save
synchronously), untestable without two players, and stamping the join ALONE would be inert data with
no reader (the built-but-unconnected anti-pattern this batch's lenses exist to catch). So C sits in
the D/E focused-build tier, not the quick one. My "B+C are quick" call was optimistic about C.

WHERE SNG-191 STANDS: A+B shipped — the clock is now correct (world time is a count, no day-number to
invent — C1/SNG-189 §2/SNG-190 §5 closed) and localized (each people's idiom). The three LARGE pieces
remain, each its own focused build: C (distributed party clock-sync), D §4 (world-tick inversion — the
substantive half), E §7 (the generation turn — the proactive world). Recommend D next for gameplay
value. Erik to steer. -->

---

<!-- status: SNG-191 PHASES D + E COMPLETE_PENDING_REVIEW (CCode 2026-07-19). v1.8.169 (D) · v1.8.170
(E). Suite green by exit code. Erik: "Take D then E." Results:
po/results/20260719_SNG-191_two_clocks_and_a_turning_world.md.

D §4 THE WORLD TURNS — the tick stops imagining what a person FELT and advances what PROGRESSED on
what they were DELEGATED. engine/assignments.js holds delegation as state; a delegateOps op captures
it (contract + SALVAGEABLE_OPS + dispatch + rule 14). The tick advances each charge (progress/stall/
problem/done — an OUTCOME); news is DERIVED from what moved and empty news is legitimate; personal
colour → statusNote. §4.2 a charge against a crisis HOLDS it from worsening, two EASE it a stage back
— an untended crisis worsens as before; delegation is how a crisis gets solved offscreen.
UNGUARDRAILED (§4b). The GM sees the commitments (DELEGATED WORK block). 16 tests.

E §7 THE GENERATION TURN — the proactive half generateRequest never built. engine/latentarcs.js:
arcs FOMENT on the world count whether or not seen, and SURFACE at thresholds (discovery is a LATE
event). Three fates — grows (unguardrailed), RESOLVES ITSELF (the world solves its own problem, §7.3),
handled (model ready; trigger a follow-on). ATTRIBUTABLE — every arc carries a cause that existed
before it surfaced (§7 inv2); new arcs seed from the disposition of the regions the player knows
(regional). runGenerationTurn runs on return; surfaced arcs ride a STIRRING IN THE WORLD block. 10 tests.

assignments.js + latentarcs.js earned their SYSTEM_SPEC rows + ENGINE_MAP columns + count 57→59.

SNG-191 A/B/D/E SHIPPED. REMAINING follow-ons, each honestly scoped: C (party clock-sync — distributed,
per-device saves, its own build), the handled-fate trigger (intervention capture), §7.4 seasonal
pressure (a clean cyclical layer). The invented day-numbers are gone; the clock speaks the local tongue;
the delegated work goes on; the world ferments its own trouble while you are away. Erik's browser-legs:
the CURRENT TIME narration (no day-number), a return after time away (work moved, arcs stir). -->

<!-- status: SNG-191 §7 FOLLOW-ONS COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.171. Suite green.
Two of the three named SNG-191 follow-ons closed; only Phase C (party clock-sync) remains open.
THE HANDLED FATE — setArcFate(arc, fate) + an arcOps op {arcId, fate:"handled|resolved"} (SALVAGEABLE_OPS
+ contract + dispatch + STIRRING block instruction); the GM closes a surfaced arc the character dealt
with, so the world stops carrying it as unfinished. §7.4 SEASONAL PRESSURE — SEASON_PRESSURE table +
seasonalPressure/seasonalDetailForGM; runGenerationTurn tilts a matching arc kind with the season (a
scarcity winter presses shortage/feud arcs harder); THE SEASON gm block. 10 tests. -->

<!-- status: SNG-193b SCHOOLS WIRING COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.172. Suite green by
exit code. Results: po/results/20260720_SNG-193b_schools_wiring.md.

§3.3 THE FEATURE — band resolution reads the SCHOOL, not the tradition: two practitioners of one tradition
get OPPOSITE best-grounds (reaching mind wants thin, instrumented wants dense). ONE seam (§5 Q1 answered:
substrateVerdict/bandForSchool; no prerequisite refactor). substrate.js SOURCE_BAND (material=flat floor,
inherent/natural low, lattice high, wild wide). §4 THE FLOOR IS THE ROOT'S — a material root/extension is
never starved (materialFloor 0.7); an augmented craft degrades TOWARD its pure form, never to zero; "the
material school travels." §5 Q3 — un-schooled saves fall back to the pure/root school SILENTLY (byte-
identical), reconcile v13 backfills. §3.5 CI GATE — all 19 schoolAffinity refs resolve to a school of their
own tradition (fails the build otherwise). A non-pure school is EARNED in play via the adoptSchool GM op
(story-gated, "changing is hard, a story"), validated by setCharacterSchool; the GM is told the school
(schoolsDetail §3.6). 35 tests. SYSTEM_SPEC schools architecture section; ENGINE_MAP regenerated
(substrate.js gains the CONTENT.schools edge + adoptSchool verb); count unchanged 59/32; RUNNING_FIXES
nothing (a build). §5 Q2 answered: creation step order IS flexible — a creation-time school picker is a
clean SNG-192 add reading the same setCharacterSchool seam; not built here. Erik's browser-leg: two same-
tradition characters in different schools feel opposite ground; a story-earned school change lands via play. -->

<!-- status: SNG-194 THE GM OFFERS COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.173. Suite green by exit
code. Results: po/results/20260720_SNG-194_the_gm_offers.md. Built per Erik's steer ("the engine work next")
using SNG-195 §4b as the trigger design.

THE OUTCOME — the world OFFERS, not only responds: the GM introduces ONE thing the player isn't reaching
for, rarely, drawn from something already true. §4b THE ENGINE DECIDES, THE MODEL NEVER JUDGES —
pacing.roomForAnOffer is a pure gate (a grip = encounter/gambit/intent/world-already-pushing is never room;
else a positive opening lull||arrived, off OFFER_COOLDOWN). The short unconditional invitation reaches the
prompt ONLY when the engine set it — the same fix as the ops that fired 0× in 16 levels (don't ask a model
to judge in one clause; compute it). §3 THE OFFER OP {thing, from} — from REQUIRED (attribution is the whole
difference from a random-encounter table), COUNTED via logOpOutcome (SNG-190 §3), resets turnsSinceOffer. §5
answered: Q1 fears was NOT in the turn prompt (only wants) — npcFearsForGM adds it, surfaced only inside a
room-gated offer (the richest NON-hostile-surprise source); Q2 no rate-limit counter (per §4a it lands
mid-duel) — scene-state gate instead; Q3 distinct op, yes. Invariants (non-blocking, declinable, not-always-
trouble, foreseeable) in the block. 24 tests. SYSTEM_SPEC §13 'the world OFFERS' + latentarcs API drift
fixed (markHandled→setArcFate); ENGINE_MAP regenerated; count unchanged 59/32. Follow-on flagged: feed an
ignored offer's `from` into seedArc so an offered thread persists as a latent arc (turns a beat into a
commitment — not built). Erik's browser-leg: arrive somewhere quiet and someone turned down scenes ago is
at the door; never mid-duel. -->

<!-- status: SNG-195 PROMPT REVIEW COMPLETE_PENDING_REVIEW (CCode 2026-07-20). AUDIT — no engine change, no
version bump. Results: po/results/20260720_SNG-195_prompt_review.md. A6 (writerly audit) folded into column 4.

METHOD: backbone from ENGINE_MAP + 56 gm_registry rows; three parallel evidence passes (block-by-block
directive-mood classification of all 60 prompt blocks; op dispatch+firing observability; content-corpus
orphan sweep). BOTH directions (§2a).

HEADLINE: the pipeline fires — every op dispatches, and every op's FIRING is observed (the '31 uncounted'
scare is STALE: opsFiredIn→_opEmitted drives the fired/never split, not logOpOutcome). The losses are all one
shape (authored intent, no consumer). RANKED GAPS:
- G1 ⭐ orphaned CONTENT — reactsToReputation (40 NPCs, only touch is a write-of-empty at generate.js:83),
  personality (40, +warmth/trust/candor/patience), gains (779 rank-node strings). Real authored intent nothing
  reads. WIRE (they're the offer's own material) or STOP AUTHORING. Aevi decides wire-vs-cut; CCode wires.
- G2 permission→instruction: 2 of 7 permission blocks are genuine L2 gaps. WANTS (rule 10b) — SNG-194 already
  built the engine half (the offer); simplify the block to material. TEACHERS (rule 16B) — the exact SNG-179
  teacher-gate shape; clean next SNG-194-pattern target (roomForATeacherOffer). Other 5 correctly optional.
- G3 (1-line bug): OUTCOME_INSTRUMENTED=Set(['markTeacher']) at app.js:954 renders the applied/rejected badge
  for only 1 of the 5 ops that now write outcome (delegateOps/arcOps/adoptSchool/offer write data nobody sees).
- G4 relationshipDeltas is salvageable+dispatched but NOT in the contract (model never told); 3 undocumented
  aliases (unlockLivingCurrent/unlockWildCurrent/timeAdvanceHours).
- G5 31 of 59 engines have no one-line purpose (§1c column-1 gap; author in engine_map.authored.json).
- G6 A6 residue small; rule going forward: if a block must FIRE something, the engine computes it — SNG-194 is
  the reference. schoolAffinity (3 abilities) is CI-validated (SNG-193b) but runtime-unconsumed — deliberate
  per SNG-193 (not a gate); CCode owns that note.
RECOMMENDED FOLLOW-ONS ranked in the doc. G1 (wire vs cut) is Aevi's call; G2/G3/G4/G5 are CCode-buildable.
Nothing improvised past scope — this is the audit; the fixes are separate tickets. -->

<!-- status: SNG-195 G3 + G5 SWEPT COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.174. Suite green by
exit code. Erik-directed ("sweep g3 and g5 as aevi digests"). No standalone results doc — two small
fixes off the audit; detail here.
G3 — OUTCOME_INSTRUMENTED widened from {markTeacher} to the 5 ops that actually write outcome
(markTeacher/delegateOps/arcOps/adoptSchool/offer) at app.js:954; a smoke test now pins the display set
to the logOpOutcome callers so it cannot drift again. Dev-panel display only, no behaviour change.
G5 — authored purpose + player-surface + trigger for all 31 '— unstated —' engines in
engine_map.authored.json (grounded in each module header); ENGINE_MAP regenerated 28/59 → 59/59 described,
standing advisory cleared. Closes SNG-195 §1c.
NOTE: Aevi's ruling (po/results/20260720_SNG-195_aevi_ruling.md) confirms the audit and reorders: A7
content cache-busting goes FIRST (one line in fetchJSON/fetchText — until it lands Erik cannot verify any
content browser-leg; he saw literal \n from a file fixed at origin hours earlier). Then G2
roomForATeacherOffer carrying WANTS + reactsToReputation (WIRE to the offer path), then G4. G1 split:
reactsToReputation WIRE-to-prompt (offer material), personality CUT (redundant with voiceHints, engine-
eligible/prompt-ineligible), gains WIRE-to-engine (779 functional tags for SNG-192 coverage), never prompt.
Awaiting Erik's go on A7-first. -->

<!-- status: SNG-195 G2 COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.175. Suite green by exit code.
Results: po/results/20260720_SNG-195-G2_teacher_initiative.md. Erik: skip A7 (phantom — old screenshot),
do G2 now.
TEACHER INITIATIVE — the oldest complaint, teachers that teach nothing. The block's 'OFFER when the moment
fits' (permission the model rarely acted on, the SNG-179 shape) is GONE. roomForATeacherOffer (pacing.js):
a present teacher with a REACHABLE next step + opening + no grip + not-the-general-offer-this-beat + off the
shared offer cooldown → the block FLIPS to 'A TEACHER TAKES THE INITIATIVE' (unconditional). teacherOfferReady
(company.js): company trainer always present; bonded willing teacher only when in-scene; unreachable step =
not room ('not yet' is real). Shares turnsSinceOffer (the offer op counts + rate-limits it).
reactsToReputation WIN (G1 ⭐) — npcReactionsForGM wires the 40-NPC orphan into the offer material; the offer
draws from 'HOW THEY READ WHO THE PLAYER IS', attribution built in. FINDING/deviation from the ruling: the
keys are NOT a fixed taxonomy (adept_sona: balanced/extreme/seeking; brann: kind/threatening/honest) and no
classifier exists — that's WHY it was never wired. So the whole map is surfaced and the GM selects; the
engine never computes a key it cannot compute. WANTS already ride the SNG-194 offer (same seam). 26 tests,
SYSTEM_SPEC §13, ENGINE_MAP regen (59/59 held). personality NOT touched (Aevi: CUT/stop-authoring, no churn).
gains (WIRE-to-engine, SNG-192 coverage) is out of scope for G2's prompt seam — belongs with SNG-192.
REMAINING from the audit: G4 contract cleanup (relationshipDeltas not in contract + 3 aliases); gains-to-
engine (with SNG-192); personality schema-cut. Erik's browser-leg: stand in a lull beside a trainer with a
reachable step — they open it; never mid-encounter, never twice running. -->

<!-- status: SNG-195 G4 COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.176. Suite green by exit code.
Contract cleanup. relationshipDeltas REMOVED from SALVAGEABLE_OPS — it is not in the contract (the model is
told to move a bond via npcUpdates.relationshipDelta), so it is never emitted and cannot be salvaged; the
one true salvage↔contract asymmetry the audit found, closed. Its inbound dispatch stays as pure legacy
tolerance. The three undocumented aliases (unlockLivingCurrent/unlockWildCurrent — contract routes living/
wild via unlockSubstrate by powerSystem; timeAdvanceHours — subsumed by timeOps) now explicitly commented
legacy at the dispatch. No behaviour change; 4 tests. AUDIT G-fixes now all done (G2/G3/G4/G5); remaining is
G1's split — reactsToReputation WIRED (G2), personality CUT (no-build), gains WIRE-to-engine which rides
SNG-192. Moving to SNG-192 next (Erik-directed). -->

<!-- status: SNG-192 PHASE A COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.177. Suite green by exit code.
Results: po/results/20260720_SNG-192-PhaseA_grants_and_suggestions.md. SNG-192 decomposed (it lacked one);
Erik chose Phase A (grants-first + suggestions). §8 answered from code: Q1 attributes precede the ability
step + it recomputes on entry (nativeGrantIdsFor safe); Q2 class_archetypes.json is a genuine loader orphan
(Phase C); Q3 prologue.tags is on state.
§1 THE FIX — renderAbilityStep computes nativeGrantIdsFor at render, shows 'Yours by right of being an
<people>' as a NON-SPENDABLE group AND excludes those crafts from the choosable pool: a pick can no longer
be wasted (Erik's screenshot). §3 SUGGESTIONS — functions.suggestForCreation wraps recommendSkills with the
PROLOGUE (revealed preference: paths actually chosen) + a light bio nudge; every suggestion carries a reason
from the player's own input ('you took the Seer path twice'); reasonless crafts dropped. §2 the 45-button
wall folds behind details/summary, one click to see all. 8 tests.
⚠ BROWSER NOTE: boot hit the KNOWN stale-module cache (bare engine imports don't ?v=-bust; the long-lived
preview tab served a cached old functions.js vs the version-busted app.js → CCODE-08 watchdog, its designed
cache-mismatch self-heal via Reload-fresh). Served files VERIFIED correct (functions.js exports
suggestForCreation; app.js has the import+grants) — isolates it to browser cache, not code. Creation VISUAL
is Erik's real-save test (fresh load). REMAINING SNG-192: Phase B (coverage/source-fit §6b/braids §6c;
gains-to-engine lands here — still owe verifying gains values are in the 24-verb vocab), Phase C (archetype
picker + class_archetypes.json load). -->

<!-- status: SNG-192 PHASE B COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.178. Suite green by exit code.
Results: po/results/20260720_SNG-192-PhaseB_robustness.md. The 'robust' half of creation (§5+§6b+§6c).
⚠ GAINS VERIFICATION (owed): gains has only TWO distinct values across 779 nodes — broaden(550)/deepen(229),
a rank-PROGRESSION axis, NOT the 24-verb vocabulary. Aevi's G1 premise (gains = coverage tags) was inferred
from the one-word sample and is WRONG; gains is NOT wired to coverage (§5 uses ability.functions via the
existing functionCoverage). Third wrong-premise verify-before-build has caught this batch. If PO still wants
a broaden/deepen surface it's a separate skill-wheel ticket.
§6b commonGroundFor (substrate.js, novel + pure): intersect a build's traditions' substrate bands → the
density window where the WHOLE kit works. Matches the spec table on live content — ashwarden+rootkin+somatic
= [0.00,0.56]; ashwarden+enginewright = NONE (lo 0.77 > hi 0.73, Erik's provable half-powered-everywhere
warning, said at the pick not at level 8). groundAsPlace names it a PLACE (thin/middle/dense country).
§5 coverage rendered from functionCoverage ('you can harm·know·move; no way to restore — a real choice').
§6c coherence↔divergence framed, never a penalty ('coherence makes you strong here; divergence makes you
new'; off-source picks are seeds). 9 tests, SYSTEM_SPEC substrate row, ENGINE_MAP 59/59. Same creation
browser-leg as Phase A (engine matches the spec table; UI source-verified; visual = Erik's real-save test).
NOT done: pool source-reordering (§6b refinement) + gains-to-a-real-consumer (premise wrong). REMAINING:
Phase C (archetype picker + class_archetypes.json load) is the last SNG-192 phase. -->

<!-- status: SNG-192 PHASE C COMPLETE_PENDING_REVIEW → SNG-192 COMPLETE (all A/B/C) (CCode 2026-07-20).
v1.8.179. Suite green by exit code. Results: po/results/20260720_SNG-192-PhaseC_archetype_picker.md.
§4 ORPHAN LOADED — class_archetypes.json was authored + in provides.rules + called by nothing (clean L4);
state.js loadRule('class_archetypes') → CONTENT.classArchetypes, content_ci clean. VERIFY-BEFORE-BUILD held
this time: all 9 distinct coreFunctions (bind/break/reveal/mend/conceal/move/heal/shield/ward) ARE real
24-verb vocabulary verbs (test asserts it, so an authoring typo fails the build). THE LENS — archetypeFamilies
maps a shape's coreFunctions → the 8 families; suggestForCreation gains an archetypeFams param that BOOSTS a
matching craft with a 'fits the Shadow path' reason but NEVER gates (off-shape crafts still surface on their
own reason — tested). UI: an archetype picker row ('a lens not a class') above the suggestions; the toggle
never touches the picks (§7.5 selects not locks); click the shape again to clear. 7 tests, ENGINE_MAP regen
(class_archetypes → functions.js edge). NOT done (deliberate): no auto-fill of picks (surfaces the build, one
click each — auto-fill risks clobbering; 'lens never locks' = surface not impose) + no per-tradition byReach
(keyed by reach/axis, needs a tradition→reach map) — both small safe follow-ons if Erik wants.
SNG-192 DONE: A grants+suggestions · B robustness (coverage/common-ground/braids) · C archetype door. Same
creation browser-leg across A/B/C — engine tested, UI source-verified, VISUAL is Erik's real-save test (the
gated flow + the known stale-module preview cache). Recommend Erik real-save-test the creation flow end to
end before further creation work. -->

<!-- status: SNG-196 BRAID ENGINE (foundation) COMPLETE_PENDING_REVIEW (CCode 2026-07-20). v1.8.180. Suite
green by exit code. Results: po/results/20260720_SNG-196_braid_engine.md. Erik-directed from the diagnostic
(Silas: 40 co-activations, 0 braids — braids REQUIRED an authored recipe, only 3 existed, none for played
crafts). Made GENERATIVE. engine/braids.js (pure): mintableBraidsFor (co-activated ≥ BRAID_RIPEN_AT=5, both
crafts held, not yet braided — NO recipe needed), braidTier (power→tier, deeper parent's rank sets ceiling),
buildBraidDef (FULL-schema ability — tree/function-union/harsher-harmRung/provenance; optional model-authored
name+tree override, else a valid playable stub so a mint never halts), mintBraid (→ customAbilities so
fullCatalog resolves it everywhere + held ability + braids ledger; idempotent). NAME: auto/model-suggested,
player can override (minted.namedBy). reconcile v14 backfills earned braids on load — VERIFIED on Silas: mints
order_sense+palework (6x) + deathsense+order_sense (5x = the Double Register). 16 tests, SYSTEM_SPEC module row
+ count 60, ENGINE_MAP 60/60. FINDING: only 3 emergence recipes + 6 prose-only combos exist; the Double
Register is NOT in the abilities corpus (a spec claimed it was). REMAINING (Erik's full ask): (1) generate.js
'braid' type so the model authors the rich tree/description; (2) live-play mint flow (offer→accept→name→
generate→mint, SNG-194 pattern); (3) Pell's ironsense — the NPC-skill path (she's now more than normal;
ironsense is prose-only, 22 mentions). Recommend Erik load Silas to see the 2 backfilled braids before the
rich-generation lands on top. -->

<!-- ═══ SESSION CLOSE 2026-07-21 (CCode → Aevi). Full writeup: po/results/20260721_SESSION_HANDOFF_to_Aevi.md
Erik is taking it to Aevi to spec the next session. Shipped this session (all green, pending review; 193b
CLOSED by Aevi): 191 §7 follow-ons, 193b, 194, 195 audit + G2/G3/G4/G5, 192 A/B/C, 196, 197 part 1.
BRAID = the live thread. Done: engine (196) + doctrine/tier fixes (197 part 1, Aevi-verified). NOT built =
SNG-197 part 2, now grown by Erik's live decisions into 4 pieces (build order):
  1. RICH GENERATION — generate.js "braid" type: model authors name (his ex: "Perfect Inevitability"),
     description, tree prose, emergent-capability flavour. Prerequisite. (Also: make the §4 vocab validation
     of the emergent function REAL code, not the comment 197 part 1 left.)
  2. THE MINT MOMENT — a distinct holy-shit beat, reachable later; backfilled stubs (Silas's 2) get the
     moment they never got on next load.
  3. ⭐ SHARED RECIPES (Erik decided): global, FIRST-FINDER authors the name/def, rides the shared-canon
     sync, later finders of the same pairing ADOPT it (no dup), collisions → canon rank-by-realness. Reuse
     the emergence_recipes format.
  4. ⭐⭐ WHEEL BY COORDINATE (Erik's vision — NEEDS AN AEVI SPEC): braids placed BETWEEN the two axes they
     braid; more broadly every skill placed by its axis-composition (mostly-death-adopts-order → near death,
     rotated toward order; pure-tradition on the axis) — this is where SCHOOLS surface, and it doubles as the
     skill-tree view (click a tradition → highlight its tree). Plus braids as an ability-list category. This
     is real geometry tying braids+schools+skill-trees — spec it properly, don't rush the coordinate math.
My part-2 Round-2 answers (locked): emergent=an added function (validated); enrich at mint (stubs lazily on
load); rename on both the moment + the ability card; re-present backfilled stubs as the moment.
STILL AWAITING ROUND 2 (I did not build — Erik prioritized the braid): SNG-198 (world-tick: join the two
offscreen halves + the never-built wantProgress counter + widen to met/heard-of/EPIC) and SNG-199 (one
person one codex: prose-in-name, aliases-never-read, no codex auto-mirror on meet, player-conferred names,
search). SNG-199 Q5 first: 197/198/199 + SNG-134 all touch the codex/ability ledger — sequence before build.
My preliminary reads on both are in the handoff §4. ═══ -->










