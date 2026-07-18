# Results — NPC sex/gender as explicit data + GM evolves items in-play (SNG-143)

Date: 2026-07-17 · HEAD `85f315f` · **v1.8.101** · full suite green · browser-verified (served bytes + Pell's real save). Status: **shipped, complete_pending_review.**

Two issues from Erik's screenshot.

## P1 — NPC sex/gender is now explicit DATA (the Pell-rendered-male bug)
Verified the real gap: there was **no gender/sex field written anywhere** — the prose knew Pell was a woman ("she/her/Pell herself"), but the portrait generator read a gender-less record + "blacksmith" role and **defaulted male**. (Note: the catalog schema already declared an unused `pronouns` field, consumed by no code.) Fixed by capturing gender as a fact and reading it at every render/narration site:
- **`schemas/npc.schema.json`** — added `gender` (+ a description for the existing `pronouns`). The schema is open/non-strict, and the *registry record* isn't schema-validated, so no migration.
- **`engine/npcs.js` `applyNpcUpdates`** — captures `gender`/`pronouns` on `meet` and additively on `update` (fills the first time, never rewrites an explicit value).
- **`engine/art.js` `npcPromptSeed`** — states the gender in the portrait prompt (`"…named Pell, woman, blacksmith…"`). **This is the direct Pell fix** — a woman NPC now prompts as a woman; a gender-less NPC is unchanged (no phantom gender injected).
- **`engine/npcs.js` `npcRegistryForGM`** — the KNOWN PEOPLE block now carries `[woman, she/her — use these pronouns]`, so narration stops mis-gendering mid-scene.
- **`engine/gm.js`** — the `npcUpdates` op captures `gender`/`pronouns`; rule 14 (NPC PERMANENCE) tells the GM to **record them on meet** from the fiction it's already writing.
- **`engine/npcs.js` `backfillNpcGender` + `migrate`** — a one-time retro pass stamps gender from each record's **own narration** where one gender clearly dominates. **The subtlety:** a female NPC's history often names a male partner (Pell's names Silas — "her hands on **his** forearms"), so a bare pronoun count is unreliable; it requires a **2× margin** (dominant gender ≥ 2 and ≥ 2× the other) and leaves genuinely mixed/thin records **unset — never guesses**. It clears a baked portrait `image` when it stamps, so the next SNG-136 mint regenerates with the gender. **Verified on Pell's actual committed save** (`char-mrhs8286.json`) → `woman`, `she/her`, portrait cleared for re-mint (10 NPCs stamped total).
- **Player-correctable** — new `correctNpcGender` op in `corrections.js` (registry guard, free-string, clears the wrong portrait, logs `kind:"gender"`; refuses an unknown person / an empty ask) + added to the stateOps repair vocabulary (so "Pell is a woman" said in play → the GM emits it) + a **"Set a person's gender" section in the Repair panel** (one-tap fix, derives obvious pronouns).

## P2 — the GM evolves an item in-play, not via the sheet editor
The GM had `itemUpdates` (SNG-137, "ITEMS GROW WITH THE STORY") but the **OOC "PLAYER ASKS" channel** — which is `gmAsk`'s **own `sys` literal**, a *different* string from GM_SYSTEM (the map's key correction) — only knew the creation-repair case, so it treated an item-evolution request like an un-makeable repair and punted to the Repair panel.
- **Fix:** taught the `gmAsk` `sys` bullet to distinguish a **creation ERROR** (wrong domain/background → Repair panel) from an **item GROWING** (a truer name, an evolved description → normal in-play `itemUpdates`). It now offers to do it as the next beat ("bring it into the next beat and I'll evolve it") instead of "go to the sheet editor." The mechanic already existed; this only widens the door to it.

## Guards honored
- **Explicit, never guessed at render** — the portrait/narration read the FIELD; if unset, the GM records it from the fiction. The retro-backfill only stamps unambiguous (2× dominant) cases.
- **Inclusive + simple** — free-string `gender` + `pronouns`; not a fixed binary. `nonbinary`/they-them supported; the backfill won't *infer* nonbinary from ambiguous they/them (too plural-ambiguous), only accept an explicit one.
- **Player can always correct** — the op + the Repair-panel section; a wrong value is never locked. Backfill never overwrites an already-set gender.
- **Item-evolution keeps SNG-137 guards** — never-creates-unowned, effects clamped, in-fiction. Only the OOC-channel *door* widened.
- **Minor-safety unchanged** — gender data doesn't touch the SNG-108 bond/minor rules; `isMinorSubject` reads record fields, not the built prompt.

## ROUND-2 answers (OQs)
1. **Free-string `gender` + explicit `pronouns`** (inclusive; pronouns are what narration needs).
2. **Backfill confidence:** conservative — a 2× dominance margin (not a bare count), because a record naming a partner of the other gender would otherwise conflict; ambiguous → unset.
3. **OOC item-evolution:** offer to do it as the next beat (least friction; exactly what `itemUpdates` is for).

## Verification
- **18 smoke tests:** meet captures gender/pronouns; update fills-once never-overwrites; `npcPromptSeed` states gender (woman NPC → woman prompt) and injects none when absent; the KNOWN PEOPLE block carries gender/pronouns; the retro-backfill stamps a female-dominant record = woman *even when it names a male partner*, a male-dominant = man, leaves ambiguous unset, clears the baked portrait, never overwrites; `correctNpcGender` sets/clears/logs + refuses gracefully; `describeCorrection`; gm.js raw-source (op captures gender/pronouns; rule 14 records; `correctNpcGender` in the vocab; P2 item-evolution routing); the schema declares `gender`. Full `npm test` green.
- **Real-data verification:** ran `backfillNpcGender` on **Pell's actual committed save** → `gender: "woman"`, `pronouns: "she/her"`, baked male portrait cleared. The exact bug, fixed against real data.
- **Browser-runtime, served modules (cache-busted, fresh port 8101):** served `npcPromptSeed` states gender; served `backfillNpcGender` stamps + clears; served `correctNpcGender` works; served gm.js carries the op capture + rule 14 + vocab + P2 routing; served app.js has the migrate backfill + Repair-panel `data-npcgender`; v1.8.101; boot-clean.
- **Not headless-reachable:** the GM actually emitting `gender` on a live meet, and re-minting Pell's corrected portrait with art on — both are contract/prompt-shaped + gated on a keyed session; the capture, the seed, the backfill, and the correction op are all fully verified.

## Files
`schemas/npc.schema.json` (gender) · `engine/npcs.js` (capture + registry line + `backfillNpcGender`) · `engine/art.js` (npcPromptSeed states gender) · `engine/gm.js` (npcUpdates op + rule 14 + stateOps vocab + gmAsk item-evolution routing) · `engine/corrections.js` (`correctNpcGender` + describeCorrection) · `app.js` (migrate backfill + Repair-panel gender section + handler; import) · `tests/smoke.mjs` · `index.html` (v1.8.101).

## Note for Aevi
- **Companions/party** carry gender only implicitly (authored persona prose) — `companionLine` wasn't given a gender clause because companions are authored catalog entries (no gender field), and party members carry name + recent-beats only. If a companion is ever mis-gendered in a portrait, the clean fix is a `gender` field on the companion catalog record (authoring), mirroring this. Flagged, not built.
