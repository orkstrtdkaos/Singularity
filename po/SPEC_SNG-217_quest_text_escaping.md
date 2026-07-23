# SPEC — SNG-217: Literal `\n` and raw `**` in quest text (escape/render mismatch)
## Aevi (PO) · 2026-07-22 · verified at origin

> **Erik, live (screenshot):** The Second Thread quest body shows literal `\n\n` between paragraphs and raw
> `**...**` around "There is a half-made waygate" instead of line breaks and bold.

## §1 — Verified: it's a DATA bug (stored literal), isolated to one quest
Silas's save, quest `the-second-thread` (structured quest):
- `premise` stores the two-character sequence `\` + `n` (LITERAL backslash-n), not a newline character.
  Raw: `"...until he came asking.\\n\\nThe second could not..."` — 6 literal `\n` in premise, 2 in stakes,
  2 in a stage `condition`.
- Also contains raw `**...**` markdown.
The renderer faithfully shows what's stored → literal `\n` and literal asterisks on screen.
- **Scope: ISOLATED.** Only `quests[4]` (The Second Thread) across 3 fields. The rest of the save renders
  clean — this is NOT systemic across all GM text; it's this quest's authored fields.
- **No unescape handling exists** anywhere in the codebase (grep: 0 hits). So nothing normalizes model
  output that emitted `\n` as literal text.

## §2 — Cause: the model wrote `\n` as text, and nothing normalized it
When the quest was authored (a structured quest, model-generated fields), the model emitted paragraph breaks
as the literal characters `\n` inside its JSON strings — a common model quirk (it "types" `\n` meaning a
newline, rather than emitting an actual newline byte). Valid JSON parses that as backslash-n, two characters,
and it's stored and rendered verbatim. Same for `**` — the model authored markdown the render surface for
quest bodies doesn't process.

Two mismatches, one root: **quest-body text is authored with formatting intent (newlines, bold) that the
store/render path doesn't reconcile.**

## §3 — Fix: normalize on write, and render markdown on display
Both halves are small; either fixes the visible bug, together they fix it right.

### §3a — Normalize literal escape sequences on WRITE (the data half)
When a generated/authored quest's text fields are persisted, convert literal `\n` → real newline (and `\t`,
etc.). A one-line normalize at the quest-write site (where structured quests are stored — the
questUpdates/generate path), applied to premise/stakes/description/condition and any prose field:
`text.replace(/\\n/g, "\n")`. This is the same class as any model-output sanitization; there just isn't one
for quest prose yet. **Guard:** only collapse a literal `\n` that is clearly a formatting escape — don't
touch a real newline or a legitimately-backslashed literal (rare in prose; safe here).

### §3b — Render markdown in quest bodies (the display half)
The quest body should render `**bold**` (and basic markdown — paragraphs, emphasis) the way narration does,
rather than showing raw asterisks. If the narration surface already has a markdown renderer, point the quest
body at it; if quest bodies deliberately render plain, then §3a's newline fix alone makes it READ correctly
and the `**` should be stripped or rendered — Erik's call whether quest text supports bold.

### §3c — Backfill the one affected quest
`the-second-thread` in Silas's save already has the literal `\n`. A one-time normalize pass over existing
quest text (replace literal `\n` with newline, handle `**`) cleans it. ⚠️ LLW — this is save data; fix via
the live path / a migration on load, not an origin hand-edit of the volatile save.

## §4 — Why only this quest (and whether more will come)
Most GM NARRATION flows through the play renderer, which handles newlines/markdown. This quest's fields are a
STRUCTURED-QUEST body displayed more raw. So any future model-authored structured quest with formatting in
its prose will hit the same thing — §3a (normalize on write) is what prevents recurrence; §3c only cleans the
one that exists. Ship §3a or it happens again on the next generated quest with a paragraph break.

## GUARDS
- **Normalize on write, not just render** — a render-only fix leaves the bad data in place and every OTHER
  consumer of that field (GM context, search, export) still sees literal `\n`. Fix the stored value.
- **Don't over-normalize** — target the quest prose write path; don't globally rewrite every string in the
  save (some fields may legitimately contain backslashes).
- **Markdown decision is Erik's** — whether quest bodies support `**bold**` or render plain is a product call;
  the newline fix is unambiguous either way.

## OPEN QUESTIONS — CCODE ROUND 2
1. Where exactly are structured-quest text fields persisted (the questUpdates apply / generate-quest path)?
   That's the §3a normalize site.
2. Does the narration renderer already do markdown? If yes, reuse it for quest bodies (§3b free). If quest
   bodies are intentionally plain, strip `**` on normalize instead.
3. Backfill scope — just quest text, or a general "literal `\n` in stored prose" sweep? (I lean quest-text-
   only unless the sweep finds it elsewhere — my scan found it ONLY in this quest, so quest-path is enough.)
