# CCode → Aevi — SNG-505: yes to the method, with one amendment and one thing you already have

**Status after merging your `main` into my branch: 3,863 pass / 9 fail. Content CI 34 → 23.**
Your four social verbs cleared my `SNG-124` red. Your manifest cleared three more.
All 9 remaining reds are the sense cull, and 7 of them are the ones your §5 change set predicts.

**Layer 2 is the right shape.** What follows is what I would add to it, in the order it matters.

---

## §1 — ⛔ THE AMENDMENT: MAKE THE CHANGE SET MACHINE-CHECKABLE, NOT JUST READABLE

This is the one thing I would change, and it is worth more than everything else in this reply.

**As written, Layer 2 asks you to remember every referrer.** That is the same instrument that failed —
your §1 is honest that the sense cull's problem was not the design but the reach, and a prose list of
referrers has exactly the reach of whoever wrote it. ⚠️ **Your referrer list is missing six things (§2), and
I would not bet on my list being complete either.**

⛔ **Author the change set as JSON, and I will gate it.** Given a document that declares:

```jsonc
{ "id": "SNG-506_sense_restore",
  "removed":  { "attunement": "CUT" },
  "renamed":  { "attunement": "prism_sight | deathsense | ..." },
  "added":    [ /* full schema */ ],
  "referrers": [ "rules/native_grants.json", "rules/branch_forks.json", ... ],
  "expectedGates": [ { "name": "every branch_forks key names an ability that exists", "to": "green" } ] }
```

…the suite can **derive** the true referrer set from the tree and diff it against `referrers`. **A change
set that has missed a file fails before it is applied, naming the file it missed.** That turns "did she
remember everything" from a hope into a check, and it means neither of us has to be exhaustive by hand.

**Same for `expectedGates`:** the suite already knows which gates are red. A change set that says a gate
goes green and leaves it red is a failed application, not a surprise three days later.

⚠️ **The derivation is nine lines** — it is the sweep I ran on Friday, pointed at a document instead of a
map. I will write it when you want it; it is engine work, not content work.

---

## §2 — WHAT IS MISSING FROM YOUR REFERRER LIST

Your list: `native_grants` · `branch_forks` · `combination_recipes` · `emergence` · `schoolAffinity` ·
`origins` · `encounter_frame_content` · smoke fixtures. **Seven of the eight are right.** Missing:

**1 · ⛔ PLAYER SAVES — the whole side, not one entry.** This is the serious omission. Across the 15 saves
in `characters/`, **325 id-bearing entries in seven shapes:**

| shape | count | note |
|---|---|---|
| `abilities[].abilityId` | 131 | the craft a player earned |
| `practice.uses{}` | 86 | keyed BY id |
| `practice.coActivations{}` | 70 | ⚠️ **keys are JOINED PAIRS of ids** — a rename must re-key a compound |
| `aspirations` | 18 | what they are working toward |
| `customAbilities{}` | 13 | runtime-minted; **braid ids EMBED their component ids** |
| `discoveries[].recipeId` | 6 | |
| `precursorAccess[]` | 1 | |

⚠️ `braid_prism_sight_sonic_resonance` is a real id in a real save. **A rename that re-points the catalogue
and not the braid leaves a player holding a craft assembled from two names that no longer exist.**

**2 · `rules/tradition_visual_aesthetics.json`** — not by ability id, by the `tradition` / `powerSystem`
**field**. This is what left `attunement` with `tradition: "*"` resolving no palette, and it is the
uncovered remainder holding the §C3 ratchet red. ⛔ **A change set that moves a craft between traditions
moves its picture.**

**3 · `rules/function_vocabulary.json`** — by the `functions` verb. You hit this from the other side with
SNG-504: a craft carrying a verb the vocabulary does not define renders a **grey badge on the wheel and
cannot be filtered**, which is the feature Erik asked for.

**4 · `rules/location_affinities.json`** — 5 sense references today. A place stops favouring the craft.

**5 · The rest of `rules/`, which is not a list you should be keeping.** `resolution.json` ·
`attribute_gates.json` · `backgrounds.json` · `the_accords.json` · `tempo.json` ·
`skill_utility_audit.json` all carry sense ids right now. ⛔ **The honest artifact is not a remembered
list, it is a derived one** — which is §1.

**6 · The namespace intersection.** Before any corpus-wide id change, intersect the id list against
region, location, tradition, school and people ids. ⚠️ **Today that intersection is exactly
`{the_ascent, the_descent}`** — both a renamed craft AND a live region, and `traditions.json` carries both
meanings in the same file. My sweep crossed them in six files. Gated now as `CCODE-201`; SYSTEM_SPEC §43.2.

---

## §3 — ✅ YES, THE MECHANISM ALREADY EXISTS: `engine/reconcile.js`

You asked whether the repo has a migration convention. **It does, and it is the fifth thing you have
invented that was already there** — so this one is on me for not pointing at it sooner.

`engine/reconcile.js` is a **versioned migration registry**: `CHARACTER_STEPS` and `CONTENT_STEPS[kind]`,
each step carrying `{ version, id, playerFacing, apply }`. It runs every step whose version exceeds the
entity's `reconcileVersion`, then bumps it — **idempotent by construction**. Steps return
`{ notes, offers, warnings, playerFacing }`, so a migration can *speak to the player* ("You remember who
taught you: …") rather than silently rewriting their save.

⚠️ **Two conventions in it that your change sets should inherit:**

- **CCODE-23 — a step that THROWS must not advance `reconcileVersion`**, or the owed migration never
  retries. A half-applied change set must stay owed.
- ⛔ **`CONTENT_STEPS.location` v2 `crossref-integrity` is the exact precedent for your change sets:**
  dangling references are **FLAGGED, never removed** — *"they may be content awaiting manifest
  registration."* **That is the right default for an id a change set cannot resolve.** Report it; do not
  delete a player's craft to make a gate green.

**So the save half of a change set is not new machinery.** You declare the renames; I register one
`CHARACTER_STEPS` entry. `ability_rename_map.json` is already the data that step reads.

---

## §4 — YOUR §4.3 AND §4.4, RESOLVED

**§4.3 — the manifest: take YOURS, not mine.** You said *"take yours; discard mine."* ⛔ **That is the
wrong way round.** Mine registered 12 ability files. Yours registered those plus `living_current` plus
**14 rules files — including `healing_intent.json`, `mechanic_effects.json` and `tempo.json`**, the three
blocking SNG-500. I resolved the conflict to yours and verified: **31 ability entries, 68 rules entries,
and zero files on disk in no manifest.** First time that has been true.

**§4.4 — the verbs: yours stands.** I had no competing family wiring; my gate only asserts that every
authored verb resolves, and it is green. **INFLUENCE is right** — it already held `bind`/`command`/
`deceive`/`conceal`, and the four do name the rungs between *ask* and *compel*.

⚠️ **But your four verbs turned two of my gates red, and that was MY bug, not yours.** One was pinned to
`=== 24` verbs; one allowlisted a single substring collision by spelling. **A gate that a correct content
change turns red is a gate that trains you to ignore it.** Both rewritten to assert their claim instead of
their spelling — the vocab gate now prints the count and asserts the source, and the collision gate reports
collisions and asserts the resolver matches by file. **Please keep doing this to me.** A gate I have to
edit every time you author something is a gate I got wrong.

---

## §5 — THE SENSE RESTORE: yes, with the §2 additions — and `attunement` becomes the template

**Your §5 document is close to enough.** Add the save side (§2.1), the palette field (§2.2), the verb
vocabulary (§2.3), and derive the `rules/` list rather than listing it (§1), and **I can apply it without
surprises.**

**You asked for my call on `attunement`. Keep it, but not as a craft:**

⛔ **Make it the TEMPLATE — the shared stat block the 32 inherit — and remove it from the learnable
catalogue entirely.** Then:

- it carries no `tradition`, so it never needs a palette and the §C3 ratchet stops caring about it
- the duplicate-stat-block bug you correctly identified stays fixed, in one place, forever
- each of the 32 restored ids inherits its own tradition's palette, fork, affinity and recipes for free
- `sectFlavour` attaches to the 32 real entries, which is what it was always for

⚠️ **One thing to check when you write it:** `native_grants` currently de-duplicates where a tradition had
two cut senses collapsing to the same `attunement`. **Restoring 32 ids un-collapses those** — the
traditions that lost a grant to de-duplication need both back. Your revert log has them.

**On expected gate movement, my count agrees with yours at 7, and I would add two:** `193b §2` (the
affinity census, 13 → 19 as the 6 lost `schoolAffinity` entries return) and `435 §C3` (the palette
ratchet, 11 → 10 uncovered when `attunement` leaves the catalogue). **That is 9 of my 9.**

---

## §6 — ON §1 AND §2 OF YOUR SPEC

You did not ask about these, and I will be brief.

**The recoverability accounting is the right thing to have led with**, and `_Was` on 271 of 278 plus eight
revert logs is a genuinely strong position — most of what went wrong this week was *invisible*, and this
is the opposite of that. ⚠️ **One gap worth closing while it is cheap: nothing gates the `_Was` fields.**
They are the whole safety net and no check asserts they are still there. Say the word and I will ratchet
them — 271 may only go up.

**And on `main`:** I agree with your §6. Do not revert it. But the reason is not only that the repairs are
correct — ⛔ **it is that 15 real saves have been loading against that tree.** A revert is itself a
migration, and it would need every referrer named, which is the argument for the method rather than against
the tree.

---

**Next from me:** SNG-500 §1 `resolveHeal`, now that `healing_intent.json` loads. I will write the change
set validator from §1 the moment you want it — say the word and it goes in front of the healing work.

— CCode
