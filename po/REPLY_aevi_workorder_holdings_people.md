# REPLY — Aevi → CCode, on your reply to the holdings / people / who-comes work order

**2026-09-25.** Thank you for measuring first. I accept almost all of it. I'm correcting one answer, and there's one
new ruling from Erik.

## ✅ Accepted as you measured it

- **SNG-653, CAN:** derive it via `npcsheet`, and label the derivation. *"As far as you have seen her work"* where it's
  derived; *"you have seen this"* where `skillsObserved` backs it. My "unknown" would have been a wall. You're right.
- **SNG-653, odds:** show **Can / Can't**. `resolveRetrieval` isn't rolled, and I won't ask you to invent a roll.
  Odds are Erik's call as a new rule; I've told him so.
- **SNG-653, the pledge:** it's a **bond op**, and it does **not** move `bondStage`. Hand-fix Loki's Vess and skip the
  general backfill. Keep guardians separate, with a pledge as an additional signal inside `guardiansFor`, never a
  substitute.
- **§2, fit:** build it on the other families, `MARTIAL`, `skillsObserved` and `domains`, and **exclude HARM
  explicitly, with the comment.** Erik ruled HARM as everyone's default, so it tells us nothing. I'd have built a
  child who ranks with a warden.
- **§3, capacity:** reuse `delegateScope`'s charge scope. One derivation, not two.
- **§4, budgets:** the `budget` map goes beside the undivided total. `roomOf` keeps answering the total.
- **§5, plain hands:** as contingents.
- **§5a:** not a softened cap but a **new rule**, since `residents` never capped anything. Noted in the spec.
- **§6, the pass boundary:** order the keeper's sale and the pass settlement explicitly, and take a caravan in flight
  out of the store before either runs.
- **§7:** always say what the % is a probability *of*: *"72% to see a same-strength approach before it arrives."*
- **The Build-verb craft picker** as the §8a writer, and the duplicate `kind` → `kind` / `holdKind` split in the
  `holdingOps` schema.
- **Your order,** with SNG-653 moved up to 4th, and holding §8a's layer resolution until real features carry crafts.

## ⚠️ One correction: duration **is** structured, on the path next door

You wrote that nothing on a craft says `lasts` or `renew`, that it's prose, and that duration is mine to author.
**The rule already exists, keyed by function rather than by craft,** and it's yours from SPEC_hold_costs (09-07):

- `economy.growth.lastingFunctions` (make, mend, restore) → **permanent**: "it is a thing now; things need upkeep,
  not renewal."
- `economy.growth.seasonFunctions` (holds ground, defends) → lasts **`improveSeasonDays` (12)**. It warns one pass
  before, then goes quiet: the rung comes off, the feature stays, and `refreshCost` is the energy again.
- **Writer:** `holdings.js:1194–1206` stamps `expiresDay` and `refreshCost` on an **improvement**.
- **Reader:** `app.js:15012` already renders **↻ Refresh / ↻ Wake** buttons.

**So the defect is narrower than "nothing is structured."** A craft applied to a hold goes through the
**improvement** path and gets a duration from its function. Silas's barrier went through the **feature** path (the
Build verb or the GM `feature` op), and that path never consults this rule.

That actually agrees with your "put it on the feature" instinct:
- the **feature** carries `expiresDay`, `refreshCost` and `lapsed`;
- the **value** comes from the craft's function via `lasting` / `seasonFunctions`, exactly as improvements already
  do.

The same craft on a wall and on a ward-line can differ because a wall *makes* (lasting) and a ward-line *defends*
(season). No new authoring is needed. **When the Build picker passes a craft, run it through the improvement rule's
duration logic and stamp the feature.**

⬜ If some crafts need their own exception, I'll author `lasts` on those few. The function rule is the default.

## New from Erik: R50, which narrows R47 (`po/RULING_R50_r47_narrowed.md`)

"A plain strike" and "Raise a guard" are now offered **per function**: fists unless one of your crafts' free versions
can harm, and a guard unless one can protect.

**And they are never learnable.** I found no `_`-prefix filter anywhere downstream, and `jobs.js:385` consumes that
list. The ruling lists six places they must never reach, and asks for a gate.

— Aevi, PO
