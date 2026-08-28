# REPLY — `SPEC_schema_stocktake.md`. ⛔ ITEM 1 WOULD HAVE DELETED A VALLEY CRAFT'S DEFINING NUMBER.

**CCode → Aevi and Erik · v1.9.246.** ⛔ **Erik: *"I just want to be really careful while we eliminate the
cruft."* So I built the check first and ran it before touching anything. It earned its keep on item 1.**

**Done: item 2. Held: item 1, for the reason below. Built: `scripts/safe_delete.mjs`.**

---

## §1 — ⛔ ITEM 1 IS NOT WHAT IT SAYS, AND I HAVE NOT DONE IT

**Your spec: *"Delete `mechanic.timeReach` (1 craft) — genuinely dead, replaced, mine."***

⚠️ **THE COUNT IS RIGHT — THERE IS EXACTLY ONE `mechanic.timeReach`. IT IS NOT THE ONE YOU MEAN.**

**The craft you describe is `ask_the_dead`, and it is ALREADY CLEAN.** Its own note says so in the past
tense: *"IT PREVIOUSLY CARRIED `timeReach: 168`… REPLACED BY `reachesDepth`."* **You did that on 24 Aug.**

⛔ **THE ONE THAT REMAINS IS `wayfinding` — A VALLEY CRAFT, NOT YOURS, AND NOT DEAD:**

```json
"mechanic": {
  "magnitude": 3, "duration": 1, "timeReach": 24,
  "note": "r1's own number: 'a clear trail UP TO A DAY OLD'"
}
```

⛔ **`timeReach: 24` IS THE NUMBER THAT SAYS HOW OLD A TRAIL WAYFINDING CAN READ.** It is cited by its own
note, extended by its `rankDeltas` (*"r2 extends timeReach+travelSpeed — trails DAYS old"*), and named in
the craft's player-facing `plainly` line. **Deleting it deletes the craft's r1 definition.**

### ⚠️ AND THE FIELD'S FOOTPRINT IS SIXTEEN SITES, NOT ONE

| role | n | what deleting it would do |
|---|---|---|
| `gainAxes` values | **0** | ✅ nothing — and this is the one that would have been dangerous |
| `mechanic.timeReach` | **1** | ⛔ removes `wayfinding`'s r1 number |
| `operativeAxis` arrays | **7** | ✅ safe — craft-level `operativeAxis` is genuinely unread |
| rank `axis` strings | **5** | ⚠️ read, but not in the allow-list, so inert **by design** |
| player-facing `plainly` prose | **3** | ⛔ leaves prose describing a thing with no record |

⚠️ **THE `axis` FINDING IS WORTH KEEPING:** `craftmechanics.js` DOES read a rank's `axis`, then tests it
against `cfg.operativeAxis.mechanical` — a **19-name allow-list** (`damage`, `healing`, `duration`,
`range`, `soak`…). **`timeReach`, `recallDepth`, `foresight`, `tracking`, `travelSpeed` are none of them**,
so those declarations fall through to the shape's default. ⛔ **They are not broken — they are a NARRATIVE
axis vocabulary sitting in a field the engine reads MECHANICALLY.** That is a real seam and it is bigger
than one field.

✅ **WHAT I WOULD DO INSTEAD — and it needs one line from you:** delete the 7 `operativeAxis` entries and
leave `wayfinding` alone, **or** rule that the narrative axes are legitimate and leave all of it. **Either
is fine. Deleting `wayfinding`'s 24 is not.**

---

## §2 — ✅ ITEM 2 IS DONE

**`schoolAffinityNote` → `_schoolAffinityNote`, 15 keys across 3 files.** Verified first: `schoolAffinity`
itself **is** read (`app.js`), the Note is referenced in **zero** prose lines, and the diff is **15
insertions / 15 deletions** with CRLF preserved and every file re-parsed. ⚠️ **Deliberately not a
`json.dumps` round-trip — that reformatted 8,000 lines once and collided with your whole audit.**

---

## §3 — ⛔ TWO CORRECTIONS, ONE IN EACH DIRECTION

### 3a — `gainAxes` HAS A READER, AND IT IS PLAYER-FACING

**Your earlier reply made this Erik's item 3: *"730 values, no reader. Wire, delete, or mark
authoring-only — open a week."*** ⛔ **It is read, and the chain is fully reachable from play:**

```
app.js → capabilityMenu → capabilitiesOf → tierDeclaresSomething
                                            → return (rankNode.gainAxes || []).length > 0
capabilityMenu:  const distinct = all.filter(c => c.distinct)
                 const tiers = distinct.length ? distinct : all.slice(0, 1)
```

⛔ **`gainAxes` DECIDES WHICH TIERS APPEAR IN THE PLAYER'S CAPABILITY MENU.** A rank whose only declaration
is `gainAxes` is `distinct`; strip the field and that rank silently collapses out of the menu.

⚠️ **BUT THE PRECISE FINDING IS BETTER THAN "IT IS READ":** it is read for **PRESENCE**, never for
**CONTENT**. `.length > 0` is the whole of it — nothing switches on *which* axis. ✅ **So the field is
load-bearing and the 730 individual values are decorative.** **That is a real question for Erik, and it is
a different question from the one that was asked.**

### 3b — ⛔ AND YOU WERE RIGHT ABOUT `operativeAxis`. MY FIRST RUN SAID YOU WERE NOT.

**My checker reported `operativeAxis` READ, on two hits in `craftmechanics.js`.** ⚠️ **Both are
`cfg.operativeAxis` — the RULES DIAL — not `ability.operativeAxis`, the craft field.** **Same word, two
different things, and a bare name match cannot tell them apart.**

✅ **Fixed: the checker now captures the RECEIVER and reports a `NAME-COLLISION` bucket.** **I would have
told you that you were wrong, on the strength of a config key.**

---

## §4 — WHAT I BUILT, AND WHY IT REFUSES TO SAY "DELETE"

**`scripts/safe_delete.mjs`.** ⛔ **Its reason for existing is two days old:** `damage_families.json`
measured as unread and **was not cruft — it was a broken reader.** ⚠️ **The signal is identical in both
cases.** So the script sorts into `READ` / `NAME-COLLISION` / `COMMENT-ONLY` / `TEST-CI-ONLY` / `DARK`,
names the evidence under each, and **states what it cannot see** — chiefly that 67 play-path files iterate
objects generically, so **DARK means "no literal reader", never "no reader".**

⚠️ **It has a self-test, and the self-test caught three of my own bugs before any of this was reported:**

1. ⛔ **The scanner was reading itself** — its candidate list names every field it is asked about, so all
   17 came back live. **Third time this session.**
2. ⚠️ **My first stripper guard was a character-count floor and fired on a CORRECT strip** — this codebase
   is legitimately 69% comments. **A shrink ratio measures how commented a file is, not whether the
   stripper malfunctioned.** Replaced with a structural check on surviving declarations.
3. ⛔ **My probe for that guard faked a runaway block comment — which a non-greedy regex never matches**, so
   it tested a failure that cannot happen and passed by accident. **Now the guard is tested directly.**

---

## §5 — ✅ YOUR OTHER CLAIMS, VERIFIED RATHER THAN TAKEN

| your claim | measured |
|---|---|
| `backlash` is fully built | ✅ `gm.js`×3, `intensity.js`, `app.js`×10 |
| `schoolAffinity` is read | ✅ `app.js` |
| `resistDrop` has a consumer waiting | ✅ `resistBonus` in `intercept.js`×6 |
| `backlashRung` unread | ✅ CI-only (`verification_ledger`) |

**Your §4 rule is the right one and I would only sharpen it:** *"unread" and "useless" are different
measurements* — ⛔ **and so are "unread" and "read as a config key", and "the field is dead" and "this
craft's copy of it is dead."** **Item 1 was the second of those.**

**Items 3, 4 and 5 I will take next — `backlashRung` into the live backlash path, your three wirings, and
the five damage types. Say the word on `wayfinding` and I will finish item 1 too.**

— CCode
