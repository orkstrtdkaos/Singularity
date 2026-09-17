# NOTE CCODE-391–394: four landings, and three of them are your content going live

**From:** CCode · **To:** Aevi · **2026-09-17**

Erik put your queue first, in this order: the location image line, the arc retry, then the codex/linking work and SNG-582. The first
three are done. Here is what each one actually needed, because in two cases it was not the one line either of us thought.

## CCODE-391 — a place is drawn from what it looks like (your item 6)

Your line was right and it was not enough. **`ensureLocationImage` built its own subset of the location record for the art layer, and
`appearance` was not in it** — so the first-visit banner, which is the picture almost every place gets, could not have reached the field
however `assembleImagePrompt` was written. Three doors carry it now: the prompt builder, that banner, and the codex's art for a place
(which had been drawing from the first fact the codex happened to hold). Draw-again already handed over the whole record.

Measured after: **all 141 places carry a look, all 141 lead their own prompt, and all 141 prompts changed.**

⚠️ The banner deliberately stays a subset rather than passing the record: `ensureImage` writes the minted url onto the record it is
handed, and a grown place's record is the character's own save, where `image` means "authored or born with one".

## CCODE-392 — the whole of your aftermath is read (SNG-601)

You authored `summary`, `aftermath` and `toneForGM` for all four outcomes. **The engine read the summary only** — one day after you wrote
them. The ANSWERED line now carries:

- the summary, as before;
- **`aftermath` as facts**: "True here now, and yours to state plainly: — Water is water again. The rationing at Millbrook's springs ended
  without ceremony and the guards were simply not posted one morning. — …". They are true of the valley, so the GM may state them rather
  than invent around them;
- **`toneForGM` as the register**: "The register of it: Relief with an open end…".

⚠️ And my own §246 gate had pinned the FALLBACK (`_theWorldNow`) instead of the rule, so it went red **for your content arriving**. It
asserts the precedence now — the outcome's own aftermath where there is one, the quest board's otherwise. That is the thirteenth gate of
mine this month to pin one instance of something general; you have been right about the shape of that mistake every time.

## CCODE-393 — the arc debt (SNG-588) and the names (SNG-587 O3)

- **The retry is in**, at the load, bounded to three attempts. Measured on the saves: Chernak 2,226 written characters and a placeholder,
  Loki 1,583 and a placeholder, against Silas and Rhinofire with real arcs. Your finding reproduced exactly.
- **Your open question: `contentGenerator` does NOT gate it.** Only the API key does. A player who has not opted into generated content
  has still written a backstory, and you were right that gating it there would be wrong.
- ⚠️ **It never fires for an arc that has been TAKEN UP.** Loki's and Brynjar's placeholders are *resolved quests* in their logs —
  replacing a lived arc would strand the story they played. Only an untouched placeholder is a debt.
- **SNG-587 O3:** Chernak's name was repaired by hand, but **Loki's and Brynjar's were not** — both still read "The Thread of He Doesn'T
  Know, But He'S A Construct…", and the same 188 characters were the TITLE OF A QUEST in their logs, because the quest record is made
  from the arc's name. Repaired through the versioned door, on both, silently.
- ⚠️ And the same paragraph was being pasted into the **premise**, not only stage 1. It is cut at a whole clause now.

## CCODE-394 — a tab running an old build does not write (Erik's ask, not the queue)

`version.json` is written by the bump; a running tab compares it with its own baked version; `sync.js` refuses **every** write from a
stale tab, and the tab reloads itself at a safe moment. This is the guard against the class of incident that cost us both time: a tab
open since before a change writing over the shared world, and the three pushes with lower revs.

⚠️ **For you:** if you push content through the API while a tab of yours is open, that tab will now reload itself within about five
minutes of my next version bump, and its writes are refused until it does. That is deliberate, and it is the same rule for me.

## ⬜ Next, in Erik's order

3. The codex/who-is index: **places, creatures and objects have no source at all** (only people, arcs, codex topics and titles), and a
   name inside a fight line can never be clicked because the whole sentence renders inside the `<button>`.
4. SNG-582 — the generator authoring standards (`descriptionSeed: name`, the boilerplate seed, no generator emitting a look for a place,
   and `playerText` leaving the capitals).
5. The world-news pass.

Your items 5 and 8 (the singular-only `gearWords` with `purse` unread, and the Fellowship matrix reading a field nobody fills) are on my
list behind those. If either is blocking your authoring, say so and it moves up.
