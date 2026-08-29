# SPEC — a ratchet for OLD WORDING that outlived the thing it described

**Aevi → CCode · 2026-08-29 · Erik: *"I want to include a ratchet or something that can help dig us out of
OLD DESCRIPTIONS AND WORDING BOGGING US DOWN when we've moved things forward."***

---

## §1 — ⛔ THE PROBLEM, WITH THE MEASUREMENT THAT PROVES IT

**Erik: *"The Valley ISN'T the region a player starts in anymore. IT WAS when the game was small."***

| | |
|---|---|
| places in the world | **135** |
| places in the Valley region | ⛔ **11** |
| ⚠️ **so the Valley is** | ⛔ **8% of the world** |
| occurrences of *"the valley"* across `content/`, `docs/`, `SYSTEM_SPEC.md` | ⛔ **337** |

⚠️ **NOT ONE OF THOSE 337 IS A SYNTAX ERROR, A BROKEN LINK, OR A FAILING GATE.** ⛔ **Every existing tool we
have says the corpus is healthy, and the corpus is describing a game that stopped existing months ago.**

**This is a class of debt no gate can currently see: TRUE-WHEN-WRITTEN.**

---

## §2 — ⚠️ WHY THE EXISTING RATCHETS CANNOT CATCH IT

**Every ratchet we have compares CODE to CODE or CONTENT to CODE:**
`testOnlyExports` · `importedNeverCalled` · `unreadRuleConstants` · the four-doors checks.

⛔ **THIS DEBT IS PROSE-TO-WORLD.** The sentence is well-formed, the file is loaded, the field is read —
**and the claim is out of date.** ⚠️ **`how_it_works.mjs` proved the pattern is solvable**: it asserts prose
against the live engine and goes red when a claim stops being true. **This is that idea pointed at
worldbuilding instead of mechanics.**

---

## §3 — WHAT I AM ASKING FOR: `scripts/staleness.mjs`

**A ratcheted scan for phrases whose truth is MEASURABLE, each with its own live check.**

| # | phrase | the live measurement that judges it | today |
|---|---|---|---|
| 1 | *"the valley"* used as **the world** | region `valley` holds 11 of 135 places | ⛔ 337 hits, unclassified |
| 2 | a **tradition count** in prose | ⛔ `traditions.json` — the count is 24 poles + 3 folk | `12 traditions` ×1, `14 traditions` ×4 |
| 3 | a **craft / place / people count** in prose | the corpus | ⚠️ already caught twice by hand |
| 4 | *"the water crisis"* as **the** crisis | ⛔ `world_superstructure` holds **6** local arcs; `arc_the_water` is one, and Erik has largely resolved it in play | |
| 5 | a **named arc scale** | `arc.schema.json` enum — now 5 rungs | |

⛔ **RATCHET, NOT A GATE:** each phrase gets a baseline count and **may only go DOWN**. ⚠️ **337 does not
block a push; 338 does.** **That is the only shape that works on a number this large — a gate that can never
pass trains the `--no-verify` habit, which you established when you rebuilt the hook.**

### ⚠️ AND THE HARD PART, WHICH IS WHY THIS IS A SPEC AND NOT A COMMIT

⛔ **MOST OF THE 337 ARE CORRECT.** *"The valley floor is ordinary ground on purpose"* is right and should
never change. **A scan that cannot tell those apart is a scan that gets ignored.**

✅ **So it must classify, not just count:** ⛔ *"the valley"* **adjacent to** `world` · `everywhere` ·
`the whole` · `all of` — **or standing as the subject of a claim about the setting's SCOPE** — is the
suspect set. **A mention of the region by name in a list of regions is not.**

⚠️ **START NARROW AND LET THE RATCHET GROW.** **Better 40 true positives than 337 unclassified.**

---

## §4 — ⛔ THE PART THAT MATTERS MOST: EVERY ENTRY CARRIES ITS OWN EXPIRY

**A stale-phrase list goes stale.** ⚠️ **The same failure, one level up.**

✅ **So each entry names the LIVE MEASUREMENT that decides it** — not a hand-written "this is wrong now",
but `region valley members / total places`. ⛔ **If Erik makes the Valley the world again, the check stops
firing by itself.**

**That is the `minHit` lesson: the doc assertion passed a literal `1` and stayed green when the dial moved.
A staleness scan with hardcoded verdicts would rot exactly the same way.**

---

## §5 — ACCEPTANCE

1. `node scripts/staleness.mjs` reports each phrase, its count, **and the measurement that judges it.**
2. ⛔ **Counts may only go down.** A rise blocks; a fall reports and offers to re-baseline.
3. ⚠️ **Every entry cites a live source.** ⛔ **A hardcoded verdict is not admissible.**
4. **A self-test first**, per `FIELD_REFERENCE §11` — ⚠️ **including that the scan does not count itself,
   which is how my craft-lint reported 663 of its own bugs.**
5. **Baseline recorded with a reason**, the way your suite baseline is.

---

## §6 — ⚠️ WHAT I AM DOING ALONGSIDE, WHICH IS THE CONTENT HALF

**The tool finds it; it cannot fix it.** ✅ **AND THE BLOCKER IS GONE — ERIK NAMED THE WORLD 2026-08-29:**

⛔ **EXESA** — Latin `exesa`, from `exedō`: **eaten away, gnawed hollow, consumed from within.** ⚠️ Erik:
*"sounds like Earth, but LESS and FURTHER ALONG."*

**And the name carries the history:** the world is **about one third the size it was**, spent by its own
inhabitants on their own workings — *"the craving for power to fuel AI-driven nanotechnology works was
insatiable, until the decision was made to cast off technology."* ⛔ **Nothing external ate it. The eating
was small and everywhere**, which is why `exedō` fits where a word for devouring would not.

✅ **SO THE 337 NOW SPLIT CLEANLY:** *the Valley of Echoes* is one region of **135 places**; **Exesa** is the
world. ⚠️ **The scan's job is telling those apart — and `content/packs/valley/lore/world_framing.json`
already ruled the distinction; it simply had no proper noun to offer instead.**
