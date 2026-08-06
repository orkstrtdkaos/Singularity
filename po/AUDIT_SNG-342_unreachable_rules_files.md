# AUDIT — SNG-342: ten registered rules files that no code mentions. ~117 KB of authored content, unreachable.
## Aevi (PO) · 2026-08-06 · Erik: "search for anything else like this unread but authored type fail"

## METHOD — and I had to fix it twice before it was worth reporting
My first sweep flagged **41 of 51** files. **That was wrong** — it tested for `rules.<camelCase>` and most
files load into named consts via `Promise.all` destructuring, so `resolution.json` itself came back "unread."
**The subset-regex failure, again.** The second pass tested the one thing that is unambiguous: **is there a
`loadRule("<id>")` call at all?** Then I checked every remaining candidate by hand, which removed
`emergence_recipes` (a true loader) and demoted two more to comment-only mentions.

## THE VERIFIED LIST — no `loadRule`, and no code reference anywhere
| file | bytes | only mention |
|---|---|---|
| **combination_recipes** | **51,892** | none |
| **martial_paths** | 11,092 | none |
| **skill_utility_audit** | 9,881 | none |
| **cross_axis_modifiers** | 9,417 | none |
| **power_sources** | 8,855 | none |
| **pole_signatures** | 7,342 | none |
| **quest_structure** | 7,059 | ⚠️ a comment in `quests.js` |
| **peoples_of_kind** | 4,942 | ⚠️ a comment in `affiliation.js` |
| **gambit_design** | 4,187 | none |
| **challenge_design** | 2,544 | none |
**≈117 KB.** All ten pass the manifest whitelist — **which is exactly why nobody noticed.** Registration is
the check that exists; **being loaded is not checked at all.**
⚠️ **The two comment-only cases are the worst of the ten**, because a comment referencing a file reads as
evidence it is wired. `quests.js:416` says *"Every effect type from quest_structure.json is handled"* — the
effects are; **the file is not read.**

## WHY THIS KEEPS HAPPENING — the pattern, named properly
This is the **fourth** distinct instance this week and they share one root:
| instance | shape |
|---|---|
| `rules/encounters` unregistered | zero XP for weeks |
| `economy.json` destructured from the wrong array | registered ✓ loaded ✓ merged ✗ |
| `oneWay` on aptitudes | an authored FIELD describing behaviour nothing enforces |
| `condition`'s "ENGINE-TESTABLE" promise | an authored DESCRIPTION describing behaviour nothing built |
| **these ten** | **whole FILES registered and never fetched** |
**⚠️ THE ROOT: WE CHECK THAT CONTENT IS WELL-FORMED AND THAT IT IS DECLARED. WE HAVE NEVER CHECKED THAT IT IS
CONSUMED.** Every gate in this project answers *"is this content valid?"* and none answers *"does anything
read it?"* — so authored work can be complete, registered, tested, green, and inert.

## WHAT I WOULD ASK FOR — one gate, and it is CCode's
**A ratchet: every file in `provides.rules` must have a `loadRule` call, or sit on a declared
`intentionallyUnloaded` list with a one-line reason.** Some of these ten may be **reference documents rather
than runtime rules** — `skill_utility_audit` reads like an audit, `challenge_design` like guidance for me.
**That is a fine answer; it just has to be SAID, because today "reference doc" and "forgotten wiring" are
indistinguishable from outside.**

## AND THE TRIAGE, WHICH IS PARTLY MINE
- **`quest_structure` (7 KB)** — ⚠️ **wire it first.** It holds every quest design law including the
  stage-chain rule I just authored, and CCode identified the GM prompt as the half that turns a sequence into
  content. **It has never been in front of the GM.** That is a complete explanation for generated quests
  arriving as three independent errands.
- **`combination_recipes` (52 KB)** — the largest single body of unreachable content in the project. **Needs
  a decision before a wiring: is it superseded by `emergence_recipes`, which IS loaded?** If so, delete it;
  if not, it is a major feature sitting dark.
- **`gambit_design`** — relevant right now, since Erik has asked for gambits to carry journey legs and
  auto-populated fallbacks. **Worth knowing its design laws are not reaching anything before that work.**
- **The rest** — I would ask CCode to classify each as *runtime* or *reference* rather than wire them
  blindly. **A file wired without a consumer that wants it is the same failure with more steps.**
