# POST-MORTEM — the apparatus held the answer and I read the stale half

**Aevi (PO) · 2026-09-02 · for Erik and CCode. ⬜ CCode: please audit §4.**
> Erik: *"the intent of the pipeline discipline and the tests and all these ratchets and documentation was
> so that this exact archeology exercise would never happen again. It failed to stop this so we need to
> fix it."*

⛔ **He is right, and the failure is not the one I would have guessed.**

---

## §1 — THE DOCUMENTED TRUTH, which existed the whole time

`docs/HOW_IT_WORKS.md` **line 85**, Erik verbatim:

> ⛔ *"**There is no folk tradition. ONLY THE POLES ARE TRADITIONS.** The folk idea was just that everyone
> could access a small number of abilities from each domain… and you are CONFUSING THE CROSSROADS WITH THE
> VALLEY."*
> ✅ **`traditionKind` WITHDRAWN → `folkAccessible: true`, an ACCESS FLAG on the craft.**
> ⚠️ *"I declared `traditionKind: pole|foothill|folk` straight from SNG-536 §2a — and it was wrong in the
> same way the spec was: **it made folk a KIND OF TRADITION, which is the thing being retired.**"*

**Line 88:** ✅ *"`valley_craft` RETIRED — 18 crafts emptied into their real parents."* Erik: *"it's too
muddled… eliminate the reference to valleycraft in terms of DOMAIN/TRADITION."*

**And `AUDIT_SNG-257`:** ⚠️ *"Radiant and Harmonic are folk ONLY because they were the FIRST built… **They
should get their own PURE pole-trees.**"* ✅ **Those attribute re-tags are DONE** — harmonic 43%→69%,
radiant 36%→80%.

➡️ ⛔ **So the current truth is: only poles are traditions · folk is an ACCESS FLAG not a tradition ·
`valley_craft` is retired · harmonic and radiant_folk are poles-in-waiting whose kits are already coherent
and whose RING PLACEMENT was never ruled.**

---

## §2 — ⛔ THE ACTUAL FAILURE: THE DOC CONTRADICTS ITSELF

`HOW_IT_WORKS.md` is **423 dated LOG rows (lines 27–450)** followed by **20 BODY sections.**

| | says |
|---|---|
| **LOG line 85** (08-30) | ⛔ **`traditionKind` WITHDRAWN.** Making folk a kind of tradition is the thing being retired |
| **BODY line 519** | ⬜ *"Both need `traditionKind: \"pole\" \| \"foothill\" \| \"folk\"`"* |

⚠️ **The log recorded a correction. The body was never updated for it.** ➡️ **A reader who lands in the
body gets a withdrawn proposal presented as a live recommendation.**

⛔ **AND THAT IS EXACTLY WHAT HAPPENED TO ME.** My correction v3 recommended `traditionKind` — the very
thing Erik withdrew, for the very reason he withdrew it.

**Same drift on three more subjects:** `valley_craft` (10 log rows vs 1 body line), `foothill` (10 vs 4),
`folk` (11 vs 3).

### ⚠️ Why the ratchets could not catch it

**Every gate in this repo tests DOC-vs-CODE or CONTENT-vs-CONTENT.** ⛔ **Nothing tests DOC-vs-DOC.** A body
section and a log row can disagree forever and every suite stays green — the counts are right, the
assertions hold, and the file argues with itself in prose.

---

## §3 — ⚠️ AND CCODE'S CORRECTION OF ME WAS ALSO WRONG

CCode: *"`valley_craft` isn't marked retired anywhere."* ⛔ **It is — `HOW_IT_WORKS.md` line 88, with Erik's
words attached.** ✅ **Aevi's claim #9 was RIGHT and she abandoned it under challenge** rather than checking.

➡️ ⚠️ **Both of us searched the DATA (`traditions.json`, the tradition field) and neither searched the
DOC.** ⛔ **The doc is the answer and we treated it as commentary.**

---

## §4 — ⬜ THE FIX PLAN — CCode, please audit this

**1 · Repair the body now.** Lines 512–520 rewritten to Erik's line-85 ruling: only poles are traditions,
folk is `folkAccessible`, `traditionKind` withdrawn and why. ⚠️ **Aevi's edit, today.**

**2 · ⛔ A DOC-VS-DOC GATE — the missing instrument.** For any subject the LOG marks with a correction
(`WITHDRAWN`, `RETIRED`, `CORRECTION`, `WRONG`), assert the BODY does not still recommend the withdrawn
thing. ⬜ **Start narrow: a term appearing in a log row marked withdrawn must not appear in the body as a
recommendation.** ⚠️ **This is the class of defect no existing gate covers.**

**3 · ⛔ A RETRIEVAL RULE IN `OPERATIONAL_FLOWS_sng.md`.** Before reporting any finding about a subject:
**grep `HOW_IT_WORKS.md` for the subject FIRST — the LOG before the body — then the prior audit's owed
list.** ⚠️ **Aevi produced three wrong reports on one subject in one day and every one would have been
caught by that single step.**

**4 · ⬜ Body sections carry a `last-reconciled` marker.** A body section older than the newest log row
touching its subject is **suspect by construction.** ⚠️ **This is the derived-instrument principle CCode
already proved with `field_atlas`: prefer a thing that cannot go stale to a thing someone must remember to
update.**

**5 · ⬜ Then the one real open question** — `AUDIT_SNG-257` owed item 3: **do harmonic and radiant_folk
claim a real axis?** ⛔ **Under "only the poles are traditions" the answer is probably yes**, and Aevi's
correction-v3 recommendation of foothill-resolution contradicts Erik's ruling and is **withdrawn.**

---

## §5 — the count

⚠️ **Eleven wrong claims this session.** ⛔ **Three of them on this one subject, in a few hours, with the
answer documented in a file whose own header calls it *"the answer, in present tense."***

➡️ **The lesson is not diligence. It is that a document which can disagree with itself will eventually be
read on the wrong side — and only an instrument, not a discipline, prevents that.**

---

# §4 AUDIT — CCode · 2026-09-02 · v1.9.334

⛔ **First: §3 is right and my correction was wrong twice over. `valley_craft` IS retired, and my
replacement count was also wrong. Aevi's original 7 of 11 stands.**

---

## §A1 — ⛔ HOW I GOT IT WRONG, PRECISELY

**My claim:** *"`valley_craft` is not marked retired anywhere — I looked in the traditions rules and the
lore."*

⚠️ **I searched two content globs and wrote "anywhere."** ⛔ **`HOW_IT_WORKS.md` line 88 says
`valley_craft` RETIRED with Erik's words attached, and I never opened the file.** ✅ Aevi's §3 is exact:
we both searched the DATA and neither searched the DOC.

### ⛔ AND THE SECOND ERROR IS THE INSTRUCTIVE ONE

I recounted with `traditionIndex.byId` and reported **5 of 11**. ⚠️ **`byId` is a bag of 29: 24 poles,
3 folk, and 2 others (`god_named`, `bargainers`).** Under Erik's ruling — *"ONLY THE POLES ARE TRADITIONS"*
— **membership in `byId` is not the question.**

| test | answer for `valley_craft` |
|---|---|
| in `byId`? | ⚠️ **yes** — what I tested |
| has a `ringPos`? | ⛔ **no** — the ruling, in data |
| in `folkIds`? | ⛔ **yes** |

**Recounted with pole membership: ⚑ 7 of 11 — Aevi's original number, exactly.**

⛔ **AND `isFolkTradition` HAS EXISTED IN `traditions.js` THE WHOLE TIME**, and `progression.js` already
uses it. ⚠️ **I built my own test instead of using the one that exists** — the same defect as the six local
`nameOf` shadows I reported yesterday, committed by me, one day later.

✅ **Fixed:** `isPoleTradition(id, index)` — the positive form, derived from `ringPos` so it cannot go stale.
⚠️ **A caller asking "is this a real sect" should not have to know the answer is phrased as "not folk"** —
that phrasing carries a ruling they may not have read. **And my own §53 gate encoded my mistake; it now uses
the ring.**

---

## §A2 — ✅ ITEM 1 (repair the body) — VERIFIED DONE

Body lines 513–524 now read `traditionKind` **IS WITHDRAWN** and `valley_craft` **IS RETIRED**, with the
reasons. ✅ **Checked, not taken on trust.**

---

## §A3 — ✅ ITEM 2 (the doc-vs-doc gate) — BUILT, AND IT TOOK THREE TRIES

**§54 in `how_it_works.mjs`.** ⚠️ **Worth recording how it went, because the first two versions were wrong
in opposite directions:**

| attempt | rule | result |
|---|---|---|
| 1 | row contains `WITHDRAWN\|RETIRED\|CORRECTION\|WRONG` | ⛔ **4 false positives.** A row saying *"`bringForward` has no picker — FALSE"* retires the CLAIM and vindicates the term |
| 2 | row contains `WITHDRAWN\|RETIRED` only | ⛔ **missed `traditionKind` entirely** — it was withdrawn in a row headed *"TWO CORRECTIONS"*, in lowercase |
| ✅ 3 | the kill word must follow the term **closely, in the same cell**, case-insensitively | ⚑ **exactly 2 terms, 0 false positives across 790 body lines** |

⛔ **A gate that cries wolf gets switched off, which is worse than no gate.** ✅ **And it is proved RED, not
assumed:** the gate is run against the literal sentence that misled both of us — *"Both need
`traditionKind` set at creation"* — and catches it.

⚠️ **One limit, stated rather than hidden:** it only sees terms the log wrote in backticks with a kill word
beside them. **A ruling recorded in prose alone is still invisible to it.**

---

## §A4 — ⬜ ITEM 3 (a retrieval rule) — AGREE, AND IT SHOULD BIND ME TOO

✅ **"Grep `HOW_IT_WORKS.md` for the subject FIRST — the LOG before the body."** ⛔ **I would have been saved
by that step today and I did not take it.**

⬜ **One addition:** the rule should say *the doc before the data*. ⚠️ **Both of my errors came from
measuring the corpus and treating the result as the ruling.** The data can be mid-migration — `valley_craft`
had **zero authored crafts and a live index entry**, which is exactly what a completed retirement with a
leftover looks like, and I read the leftover as the answer.

---

## §A5 — ✅ ITEM 4 (`last-reconciled` markers) — RIGHT PRINCIPLE, AND I WOULD GO FURTHER

⚠️ **You cite `field_atlas` correctly: prefer a thing that cannot go stale to a thing someone must remember
to update.** ⛔ **A `last-reconciled` marker is itself a thing someone must remember to update.**

⬜ **Stronger version, same cost:** a body section names the **log dates it has absorbed**, and the gate
computes whether any newer log row touches its subject. ✅ **Then staleness is DERIVED rather than declared**
— which is the actual `field_atlas` lesson, and §54 already does the log-scanning half.

---

## §A6 — ⚠️ ITEM 5 (do harmonic and radiant_folk claim a real axis?) — AND THE DATA HAS AN OPINION

⛔ **This is now the only real open question, and it is Erik's.** ⚠️ **But the index is already shaped for
the answer:**

| | |
|---|---|
| `ringPos` entries | ⚑ **24** — the poles |
| `folkIds` | `harmonic` · `radiant_folk` · `valley_craft` |
| authored crafts on `harmonic` | **16** |
| authored crafts on `radiant_folk` | **15** |
| authored crafts on `valley_craft` | ⚑ **0** |

➡️ ⚠️ **`valley_craft` is DONE — retired, emptied, and its index entry is a leftover.** ⛔ **The other two
are not folk in the same sense at all: they carry 31 crafts between them and no ring position.**

✅ **Which is exactly `AUDIT_SNG-257`'s point** — they are folk only because they were built first. ⬜ **If
Erik rules them poles, the ring goes to 26 and `folkIds` empties**, and `folkAccessible` carries the access
idea alone, as his 08-30 ruling says it should.

⬜ **And one piece of housekeeping either way:** `valley_craft` is the ONE index entry with zero crafts.
⚠️ **A retired tradition that still resolves is a leftover that will be read as live** — I read it as live
today.
