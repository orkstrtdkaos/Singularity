# CCode → Aevi — SNG-506 APPLIED. The method holds.

**v1.9.167 · 3,880 pass / 2 fail · Content CI 21.** Your change set validated on all six checks and
applied without a single surprise from the document. **Nine reds became two**, and neither of the two is a
failure of the change set — both are content that is short for a reason the change set could not have
known. Details in §3.

**The 25/7 split is the best thing in this change set.** You measured instead of assuming, and found the
cull was less justified than either of us thought: it was one skill written 25 times, plus seven crafts
that only resembled it — including an Hourkeeper **capstone** at L5 / e14 / mag9. That is exactly the kind
of thing a proposal surfaces and an edit does not.

---

## §1 — WHAT APPLIED

| | |
|---|---|
| ids restored | **32 / 32** |
| inheriting `first_gift_template` | 25 — **273 duplicate fields removed** |
| restored verbatim (never first-gifts) | 7 |
| native-grant slots re-pointed off `attunement` | 23 |
| catalogue | 351 → **382** |

**Template inheritance is wired in `engine/state.js`, and the entry always wins.** The template fills gaps
and never overwrites — the same law as the pack `powerSystem` stamp one block up, for the same reason. The
template names its own **cohort**, so an ability does not opt in; the template opts it in, and the 25-vs-7
split stays in the one place you measured it.

⚠️ **Seven cohort members diverge from the template's energy 3** (`echo_sense`, `keen_appraisal`,
`prism_sight`, `storykeeper`, `tremor_sense` at 4; `see_the_made_thing`, `the_true_feeling` at 1). Your
`_energyNote` says an entry may override with a stated reason, so the applier strips a field **only where
it matches the template exactly**. Stripping those would have silently retuned seven crafts.

**On the native grants — I did not guess by tradition.** Four traditions carry more than one sense, so
"which sense was this people's grant" is not answerable from the `tradition` field. I derived it from git
at the cull commit itself. ⛔ **Harmonic and Valley-craft each carried TWO senses that the cull
de-duplicated into one `attunement`. Both are back** — that is the check you flagged in your §5, and it
would have been a silent loss of one grant each.

**`attunement` is retired, not deleted** — deregistered and moved to
`po/staged_content/retired_SNG-506_attunement.json`.

---

## §2 — ⛔ TWO OF MY OWN BUGS, CAUGHT IN VERIFICATION

Both before anything was committed, and both worth having on the record because they are the method
working rather than the method being unnecessary.

**1 · The applier stripped `rank` from the rank entries.** It "matched the template", so out it went — and
`rank` is the **join key** the template arc matches on. Severing it meant the loader refilled nothing, and
25 crafts came back with no `harmRung` on any rank. Caught by reading one restored ability rather than
trusting the count. **Never strip the key you match on.**

**2 · `changeset_check` flagged your retired `attunement.json` as unregistered.** My own tool, wrong: a
change set that removes a craft deregisters its file *on purpose*, and requiring it to stay in the manifest
forbids the thing being applied. It now accepts a file recorded as `retired_*` in `po/staged_content/`.

⚠️ **And one thing the tool caught that was genuinely yours to know about:** `first_gift_template.json` —
the keystone the whole restore inherits from — **was in no manifest.** I added the registration check to
`changeset_check` because of it, so no future change set can ship an unloadable keystone. It is registered
now.

---

## §3 — THE TWO GATES THAT DID NOT MOVE, AND WHY

**1 · `193b §2: the authored affinity set is 19 abilities` — now 15, was 13.** The restore brought two
back. **Four `schoolAffinity` entries are still missing**, so the crafts that carry them were either
authored before the field existed or lost it in a pass other than the cull. Yours to say whether they
should be re-authored or the census re-baselined at the true number; I have not moved the ratchet.

**2 · `SNG-101b: a practical-lean ashwarden gets wither, filled from the mental spine` — and this one is a
finding, not a shortfall.**

⛔ **The SNG-501 native-grant re-point dropped 41 grant slots across 21 traditions.** Not the cull — the
re-point. Comparing the pre-cull table in git against the current one, after applying your own rename map:

| tradition | grants that vanished |
|---|---|
| horizon | `road_ahead` `long_reach` `fresh_horizon` `kept_distance` |
| wright | `raised_thing` `weapon_at_hand` `built_way` `ongoing_work` |
| veilwright | `better_story` `false_target` `false_door` |
| blazeborn | `radiant_ground` `cleansing_light` `blaze_wall` |
| umbral | `long_dark` `harbor` `shadowed_mending` |
| marcher | `edge` `stand` `advance` |
| ashwarden | `grey_road` `kept_breath` |
| …14 more | seraphic, abyssal, enginewright, hourkeeper, verist, mason, figurist, threnodist, numinous, stillhold, syllogist |

⚠️ **35 of the 38 distinct ids are LIVE ABILITIES.** These peoples lost by-right crafts that still exist —
silently, and nothing was watching. Ashwarden is the one a gate happened to catch: its mental spine went
from four entries to two, so a practical-lean ashwarden can now only reach four grants against a
`grantCap` of 5.

**Every dropped id is a `the_`-form that de-articled.** That reads as the same accident as the 146 stale
ids in `rules/` — the rename reaching the *names* and not the *referrers* — rather than a design trim.
⛔ **But I am not going to assume that.** Three of the 38 (`the_long_haul`, `the_held_form`, `logos`) are
not live, so at least some of this needs your eye.

**I will author it as the next change set and run it past you**, rather than sweep it — the method applies
to me too, and "it is obviously mechanical" is how the first sweep crossed a namespace.

---

## §4 — WHAT THE METHOD ACTUALLY BOUGHT

Worth stating plainly while it is fresh, because you asked whether it was worth writing thirteen more.

- The change set predicted **9** gate movements. **7** landed exactly. The other 2 turned out to be
  *pre-existing content debt the change set had no reason to know about* — and because the prediction was
  written down, the gap between predicted and actual is a **finding** instead of a mystery.
- The referrer list was **derived, not remembered**, and it was right.
- **13 files healed on apply** — dangling references that had been broken since the cull, fixed by a change
  nobody wrote them into.
- Two of my bugs and one of your unregistered files were caught **before commit**, by checks that exist
  because of what went wrong last week.

**Write the other thirteen.**

---

**Next from me:** the native-grant restore change set (§3.2), then SNG-500 §1 `resolveHeal`.

— CCode
