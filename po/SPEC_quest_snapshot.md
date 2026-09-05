# SPEC — the quest snapshot is lossy, and three live quests have blank stages

**Author:** Aevi (PO) · **2026-09-05** · **Status:** `spec_ready` — ⬜ **CCode ROUND 2**
**subject:** quests
> Erik: *"We talked about quests being broken in the past — this is a reminder that we need to fix the
> quests up."*

**The screenshot: *The Mercy That Won't Ask*, four stages, and not one carries a word.** A ▶, a *Mark this
stage met* button, and three bare circles.

---

## §1 — ⛔ THE MEASUREMENT: THE STAGES ON THE SAVE ARE EMPTY OBJECTS

**Silas carries ten quests. Three actives have every stage blank:**

| quest | status | stages | blank |
|---|---|---|---|
| `the-edge-district-ledger` | resolved | 4 | ✅ 0 |
| `the-door-that-closed-behind` | resolved | 3 | ✅ 0 |
| `the-second-thread` | resolved | 6 | ✅ 0 |
| `what-the-water-remembers` | resolved | 4 | ✅ 0 |
| `the-light-that-will-not-dim` | active | 3 | ✅ 0 |
| ⛔ **`the-stag-that-wont-die`** | active | 3 | ⛔ **3** |
| ⛔ **`the-mercy-that-wont-ask`** | active | 4 | ⛔ **4** |
| ⛔ **`the-wyrm-of-endings`** | active | 4 | ⛔ **4** |

⚠️ **AND THEY ARE NOT PARTLY BLANK. THEY ARE `{}`** — ⛔ **empty objects with no `id`, no `objective`, no
`condition`.**

```
save stage[0]:  {}
def  stage[0]:  {"id":"s1","title":"Find where the Pure-of-Ash walks its 'mercy'",
                 "objective":"Keeper Ilma knows what this was. Go where the unasked
                 deaths are happening…","condition":"…","imagePrompt":"…"}
```

⚑ **THE CONTENT IS FULLY AUTHORED.** Every stage in `quests.json` carries `title`, `objective`, `condition`
and `imagePrompt`. ⛔ **The renderer reads `s.objective` and `s.condition` and outputs them correctly.**
➡️ ⚠️ **Nothing is wrong with the content or the view. The RECORD is empty.**

---

## §2 — ⚑ WHY: A QUEST RECORD IS A FROZEN WHITELIST SNAPSHOT

**`engine/quests.js:226` copies the def into the character at start:**

```js
stages: (def.stages || []).map(s => ({ id: s.id, objective: …, condition: …, change: … })),
```

⛔ **THREE THINGS FOLLOW, AND THE FILE ALREADY KNOWS ABOUT ALL THREE:**

**1 · IT IS A WHITELIST, SO NEW FIELDS DO NOT REACH A STARTED QUEST.** ⚠️ `title` and `imagePrompt` are
authored on every stage and **dropped on every copy.** ⛔ **The stage art feature reads `s.imagePrompt` from
the RECORD, which never has one.**

**2 · IT IS FROZEN, SO CONTENT FIXES NEVER ARRIVE.** ⚠️ Improve a stage's prose and **every save that
already started it keeps the old version forever.**

**3 · ⛔ AND THIS EXACT BUG HAS HAPPENED BEFORE, IN THIS FUNCTION, WITH A COMMENT ABOUT IT:**

> ⚠️ *"CCODE-22: this whitelist-record dropped all three, so the mechanic was dead for every started
> bound/personal arc — **the def has them; the record didn't**."*

➡️ ⚑ **SAME SHAPE, SAME LINE, SECOND TIME.**

---

## §3 — ⬜ WHY THESE THREE AND NOT THE OTHER SEVEN

⚠️ **The five working quests were started when the copy worked; these three were not.** ⛔ **Empty `{}`
means the mapper ran against stage objects it could not read** — a shape mismatch at start time, not a
missing field.

⬜ **CCode: the likely cause is that these three were started from a DIFFERENT source than
`quests.json`** — generated, or an older schema — ⚠️ **and the mapper produced `{}` rather than failing.**
⛔ **A mapper that silently yields an empty object is the defect underneath the defect.**

---

## §4 — ⬜ WHAT TO BUILD

### 4a · ⛔ STOP SNAPSHOTTING WHAT CAN BE LOOKED UP

⚑ **A started quest should carry PROGRESS, not a copy of the content.**

| ✅ on the record | ⛔ from the def, at read time |
|---|---|
| `id` · `status` · `stageIndex` · `completedStages` | `title` · `premise` · `stakes` |
| `outcomeId` · `startedDay` · `boundTo…` | ⚑ **every stage's `title`, `objective`, `condition`, `imagePrompt`** |
| ⚠️ anything the PLAYER changed | `routes` · `outcomes` |

➡️ ⚠️ **This is the rule the project has ruled three times already** — *"a stored copy of a derived value is
the failure that produced this ticket."* ⛔ **`ringDistance`'s 552 rows. `meaningDensity`. The shared health
pool.** ⚑ **A quest record is the same mistake wearing a different hat.**

⬜ **Where the def is GONE** (content retired under a live save), ⚠️ **fall back to the snapshot** — which is
the argument for keeping one, thin, as a fallback rather than as the source.

### 4b · repair the three live quests
⚑ **Re-hydrate from the def by `id`.** ⚠️ **`stageIndex` and `completedStages` are intact on all three, so
progress is not lost** — ⛔ **only the words are missing.**

### 4c · ⬜ AND A GATE
⛔ **No started quest may carry a stage without an `objective`.** ⚠️ **A ratchet at 3, may only fall.**
⚑ **Same shape as §84 — and this is the second time this function has lost fields silently.**

---

## §5 — ROUND 2 QUESTIONS

1. ⛔ **Where did the three broken ones come from?** ⚠️ **`{}` is a mapper reading a shape it did not
   expect** — ⬜ generated quests, an older schema, or a migration?
2. **Does anything else read the snapshot rather than the def?** ⬜ `structuredQuestsForGM` builds the GM's
   directive from the record — ⛔ **so a blank stage means the GM is also being told nothing.**
3. ⚠️ **`s.title` is authored on every stage and read NOWHERE** — not in the copy, not in the renderer.
   ⬜ **The UI shows `objective` as the heading.** ⛔ **Either the renderer should show the title, or the
   field should go.**
4. **Is `imagePrompt` reaching stage art at all?** ⬜ `ensureQuestArt(s.imagePrompt, …)` reads the record,
   ⛔ **and the copy never carried it — so stage art has never worked for any quest.**
5. ⬜ **How many other saves are affected?** ⚠️ Silas is one character; **the fix should sweep.**
