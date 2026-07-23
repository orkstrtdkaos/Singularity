# SPEC — SNG-212: The missing op — correct an established NPC's name
## Aevi (PO) · 2026-07-22 · verified at origin · a real capability gap, not a GM failure

> **Erik, live:** Silas's mother "still doesn't have a name the GM recognizes"; the NPC created when he first
> saw her was "Hesta Vorn," but in narrative she gave her name as "Maret Weir." Things still aren't working.
> **Canonical name (Erik's ruling):** `Hesta (Weir) Vorn`, alias `Ama Deyja` (a Pale March mother's greeting).

## §1 — Verified: three names, none in the registry, and NO op can fix it
Silas's save (char-mrhs8286), all verified at origin:
- Mother record `silas-mother` still has the **placeholder** `name: "Silas's Mother"`, `aliases: null`. This
  is the ONLY name queryable — which is why the GM recognizes no given name.
- **"Maret Weir"** (spoken in fiction): **0 occurrences in the entire save.** The naming turn never persisted.
- **"Hesta Vorn"** (the day-20 portrait): exists ONLY as an `imagePrompt`/caption. Never written to the record.
- The record is a **fully-established NPC** — 10 history entries, relationship 8, `_filledFromGenerate` NOT set.

**The killer finding:** NO repair op can rename it. Checked every stateOp in corrections.js:
- `registerEstablishedNpc` — **refuses**: `if (existing && !existing._filledFromGenerate) → "already known"`.
  The mother is established, not a stub, so this bounces.
- `correctField` — edits the PLAYER's own fields (background/origin/nativeTradition/form), not an NPC name.
- `mergeEntity` — merges two RECORDS; there's only one mother record (the other names are a caption + lost
  fiction, not records). Nothing to merge.
- `correctNpcGender` — gender/pronouns only.

**So even a perfectly-behaved GM that TRIES to fix this finds every applicable op refuses.** This is NOT a
SNG-207 escape (unlike SNG-207c) — it is a genuine **missing lever**. SNG-207's own thesis is "ultimately
capable, bounded by fairness not by missing levers" — here the lever is actually missing, which is the one
thing the doctrine says shouldn't be the blocker. It is.

## §2 — Outcome wanted: a `correctNpcName` op (the rename repair)
Add to the stateOps vocabulary + corrections.js:
- **`correctNpcName`** — `{op, id (npcId), name (the corrected display name), aliases[] (optional)}`. Sets an
  EXISTING npc record's `name` (and merges any given `aliases` into `aliases[]`), preserving id, history,
  relationship, firstMet — everything else. A pure repair: it renames, never creates or grants.
  - **Trace-gated like the other grants:** apply only if the new name (or the fact that the placeholder is
    wrong) has a fiction trace — she SAID a name, or the player asserts it. For the placeholder→real case,
    the player's assertion IS the authority (they know their own mother's name); don't over-gate a rename the
    way a power-grant is gated.
  - **Placeholder detection:** a name like "Silas's Mother" / "the innkeeper" / "a traveler" is a placeholder;
    renaming off a placeholder is always safe repair. Renaming a NON-placeholder (already has a real name)
    should still work but is rarer — the player is correcting a wrong real name.
  - Aliases matter here: set `aliases: ["Hesta Vorn", "Maret Weir", "Ama Deyja"]` so EVERY name that ever
    referred to her — the portrait's, the fiction's, the greeting — resolves to the one record via
    `namematch.js resolveByName` (which already reads aliases). This heals the fragmentation, not just the
    display name.

## §3 — The trigger (so the GM actually reaches for it)
Add to the stateOps prompt block: *"If the player tells you a person's NAME — 'my mother is Hesta Vorn', 'the
innkeeper is called X', 'her name is actually Y' — and that person is already on the known list under a
placeholder or a wrong name, emit `correctNpcName` (id + the name [+ aliases]) THIS TURN. This is the
'why doesn't the GM know her name?' case. Do NOT try registerEstablishedNpc for someone already known — it
will refuse; correctNpcName is the rename."* (Same trigger-gap lesson as SNG-207c: an op with no trigger
example doesn't fire.)

## §4 — The live fix for Silas's mother
Once the op ships, Erik (or the GM on his ask) sets:
`correctNpcName { id: "silas-mother", name: "Hesta (Weir) Vorn", aliases: ["Hesta Vorn","Maret Weir","Ama Deyja"] }`
→ she's known by her real name, the portrait name and the fiction name both resolve to her, and "Ama Deyja"
works as the Pale March greeting-alias. One op heals all three fragments.

⚠️ **Why not just hand-edit the save now?** The save is the LOWEST layer (LLW) and the most volatile — it
rewrites from the running app constantly. An origin edit races the app and can be clobbered or clobber Erik's
progress. The fix must go through the live layer (the op, via GM or Repair panel), not an origin poke. This
is exactly the file where origin is NOT the truth.

## §5 — Sibling finding: the name never committed (the upstream bug)
Why is she a placeholder at all? She gave her name in fiction (day ~12+) and it never wrote to the record —
same **commit-outrunning-narration** family as SNG-210 (location) and SNG-067/068 (creation). When the
fiction ESTABLISHES a name for a known-but-unnamed NPC, the naming turn should persist it (an npcUpdate that
sets name on the existing record). Worth a look alongside this: the rename op fixes the SYMPTOM (existing
placeholders); the commit fix stops NEW placeholders from getting stuck when the fiction names someone.

## GUARDS
- **Rename, don't create.** correctNpcName only touches an EXISTING record; if the id doesn't exist, refuse
  (registerEstablishedNpc is for new people).
- **Preserve everything but the name/aliases** — id, history, relationship, firstMet all carry.
- **Player asserts their own NPCs' names** — don't over-gate; a placeholder rename on player assertion is
  clean repair, not a wish.

## OPEN QUESTIONS — CCODE ROUND 2
1. Fold `correctNpcName` into `correctField` (add npc-name as a field target) or a distinct op? A distinct op
   is clearer for the trigger; your call on vocabulary economy.
2. Placeholder detection — heuristic (name contains "'s Mother"/"the "/"a ", or equals a role) or just "any
   rename the player asserts is fine"? I lean the latter — simpler, and the player is the authority on names.
3. Should renaming also update `imagePrompt` history captions, or leave the portrait caption as-is (it's a
   historical artifact)? Leaning leave-as-is; the alias makes it resolve anyway.
