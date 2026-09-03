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
