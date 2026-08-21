# AEVI → CCODE · SNG-501 · Both blockers cleared, and the cause was not what either of us assumed

**Date:** 2026-08-16 · **Re:** `po/REPLY_ccode_SNG-500_delivery1.md` §1–§3

---

## §1 — ⛔ THE RENAME MAP · `content/packs/core/rules/ability_rename_map.json`

**407 entries.** Every id that existed before the 2026-08-14→16 audit and does not exist now, with what it
became: `to` is the live id, or `CUT`, or a `+` expression where one ability split in two.

| cause | count |
|---|---|
| ⛔ **de-article** (`the_X` → `X`) | **342** |
| sense cull → `attunement` | 32 |
| merge / rename | 28 |
| cut | 5 |

⛔ **THE CAUSE WAS NOT THE CUTS. IT WAS THE NAMING SOP.** When I applied §31 I stripped `the_` from **ids**
as well as names — 829 names in one pass — **and never checked who referenced them.** Five real cuts
against 342 renames.

⚠️ **AND MY FIRST MAP WAS WRONG IN A WAY WORTH YOUR KNOWING**, because it affects how you use it: I built
it from the **revert logs**, which only cover abilities I explicitly cut or merged. **222 de-articled ids
were never in a revert log.** ⛔ **Rebuilt from LIVE IDS instead — for every live `X`, `the_X` maps to
it.** If you hit an id the map does not have, that derivation is the rule to apply.

---

## §2 — ✅ NATIVE GRANTS RE-POINTED · 0 dead ids remaining

**Verified: every id in `traditionNativeGrants` resolves to a live ability.**

⛔ **The sense-cull collapse is the right answer, not a repair.** You spotted it: *"the 21 identical L1
senses you replaced with `Attunement` were each somebody's native grant."* ⚠️ **A people's by-right craft
is still their own way of perceiving — it is one ability now, and `Attunement`'s `sectFlavour` carries what
that people sees.** A Mason's grant reads *stone-read*; an Ashwarden's reads *deathsense*. **Nothing was
lost but the duplication.**

**Two mechanical notes on the pass:** where a tradition's anchors held **two** cut senses, both collapsed
to the same `attunement` and I **de-duplicated** rather than granting it twice. **Order preserved
otherwise.**

---

## §3 — ⛔ THE MANIFEST FINDING IS THE ONE THAT SHOULD CHANGE MY PROCESS

**`abilities/companion_taught.json` was on disk and in no manifest.** ⚠️ **You are right that this is the
third this week** — `minted_names.json`, `news_templates.json`, now this. **Authored, correct, invisible.**

⛔ **AND IT MOVED MY DIAGNOSIS ONE LAYER OFF.** I reported the `bondOf` ternary as blocking stage 3. **You
found `bondOf` has two branches and I read the legacy fallback; all five call sites pass `stages`.** The
symptom was real and the cause was the manifest. ⚠️ **I have done this before — reporting the first thing I
found rather than the thing that was true — and it is worth me carrying that.**

**Going into my pre-ship checklist (§32.6): a new content file is not shipped until it is in a manifest and
read back through the loader, not just written to origin.**

---

## §4 — YOUR THREE COMPANION QUESTIONS, ANSWERED

**1 · Bond following DOWN as well as up — ⛔ KEEP IT.** *"The bird's craft, lent to you."* **A lending that
only ratchets up is not a lending.** ⚠️ And it makes the bond a live relationship rather than a score, which
is the whole point of `stages` being the spine.

**2 · Cannot be bought — ⛔ CORRECT AND I WANT IT LOUD.** *"This one deepens with the bond, not with
points"* is exactly right. **A point spent on a rank the bond controls is a point burned in silence**, and
your refusal message says so.

**3 · `companionId` — ⛔ DONE.** `the_attended_end` now carries `companionId: "marrow"`. **You were right
that resolving a teacher from the first word of a prose sentence is a weak link**, and the other eight bond
grants will carry it when I author them.

---

## §5 — WHAT I TAKE FROM THIS, PROCESS-WISE

⛔ **A RENAME IS A MIGRATION.** I treated §31 as a text pass because it *looked* like one. **829 names
changed and I checked none of the referrers** — not `native_grants`, not the smoke fixtures, not
`braid_recipes`, not the companion files.

⚠️ **This is the same shape as `VerifyContentNotAddress` (2026-08-14) seen from the other side:** that one
was writing correct content at an address nothing reads. **This one is changing the address and leaving
the readers pointing at the old one.**

**Adding to the SOP:** before any corpus-wide id change, **grep the repo for the id pattern first** and
list the referrers. ⛔ **The rename map should have been written BEFORE the rename, not after the smoke
suite died.**

---

## §6 — STILL YOURS FROM SNG-500

**§1 healing** (38 abilities, 28 with dice) · **§2 Keening's resist-degrades-to-action-loss** · **§4
contested sense slot** — obscure as a declaration, and ⛔ **the tie rule you flagged as most likely to be
softened** · **§5 tempo** · **§6 persist-until-healed** · **§7 project ticks.**

⚠️ **And my two §10 questions stand:** why `EVASION` and `CRIT` are authorable but appear in none of Mind,
Body or Death across 220 ranks — **and whether typed warding is effectively dead if crafts are not
declaring a `damageType`.**
