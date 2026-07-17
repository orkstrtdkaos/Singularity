# SPEC — SNG-134: Story that evolves, hover-detail everywhere, relationship summary, content-generator setting
## Aevi (PO) · 2026-07-16 · authored to spec · **awaiting CCode ROUND 2**

> Four refinements from Erik's character-screen + settings screenshots (v1.8.89). Config defaults + Erik's content-generator flags are DONE directly (see note); this spec covers the four that need building.

> **DONE directly (Aevi config writes, verified at origin):** default artMode `static→generate`; default pacing `balanced→eventful`; default time ratio `24→3` (mode already `story`); sync `owner→orkstrtdkaos`, `repo→Singularity` prefilled, PAT stays blank; Erik's profiles (`player-s9z9u1`, `player-54seyk`) flagged `contentGenerator: true`.

## PART 1 — The story should EVOLVE, not show the creation-seed forever
> **Erik: "This portion of the character story and the auto-building part of the story can have the same root. We don't need to see this start the entire time — it should evolve."** Screenshots: the top "Motivation/Story" (image 1) and "The arc" section (image 3/4) show the SAME seeded creation text ("You took the short way, and the short way was wrong…") — the frozen opening, displayed forever.
- **Same root, one source:** the character-header story and the personal-arc premise (SNG-133) derive from the SAME seed (the bio + `whyHere`). Don't duplicate them — one evolving narrative, surfaced in both places.
- **Evolve past the seed:** as the character accrues deeds, chronicle beats, and arc-stage progress, the displayed "story so far" should **grow beyond the creation opening**. Reuse the SNG-109 chronicle-paragraph machinery: the header story becomes the *lived* story (opening → what's happened since), not the static seed. The creation seed is the FIRST line of a story that keeps being written, not the whole of it forever.
- **Surface:** the header "Story/Motivation" shows the current evolved paragraph (seed folded in early, superseded as deeds accrue); "The arc" shows the personal-arc state (SNG-133) — its current stage, not the frozen premise. When nothing has happened yet, both show the seed (correct for a new character); after play, both reflect the lived arc.

## PART 2 — Hover-detail EVERYWHERE a skill, name, or item appears
> **Erik: "Everywhere a skill, a name, an item shows up — it should have a hover that tells the latest relationship status, use, next rank, etc."**
- **One shared hover/tap-detail affordance** (reuse the SNG-104/106 popover), applied consistently wherever these entities render — sidebar, chronicle, sheet, wheel, scene text:
  - **Skill** → rank + progress to next rank, effective energy cost, function family(ies), last use / "ripe for mastery" state.
  - **Name (NPC)** → current relationship/bond status, standing, last interaction, where known from.
  - **Item** → what it is, uses remaining, pinned state, last use, provenance.
- **Consistency is the ask** — the same entity gives the same hover no matter where it appears. A registry: `entityHover(kind, id, character)` → the detail block, called by every render site. Tap = hover for phones.

## PART 3 — Relationship summary paragraph in the chronicle
> **Erik: "The relationships in the chronicle could use a short paragraph summary."** Screenshot (image 3): the Relationships list (Pell together·devoted, Calvar devoted, Aldric ally…) is a bare list.
- Add a short generated **paragraph** above/below the list that reads the bonds into prose: "You travel closest to Pell, devoted and together; Calvar's loyalty runs nearly as deep; and a widening circle — Aldric, Mara Wells, Fendt, and others — call you ally." Reuse the chronicle-paragraph machinery, scoped to relationships. Evolves as bonds change.

## PART 4 — Content-generator as a SETTING (+ already applied to Erik)
> **Erik: "Make my characters content generators like Brook and Brayden. We could make this a setting."**
- Erik's profiles are ALREADY flagged (done above). Make it a **visible setting** (a toggle in Settings, per-profile): "**My play authors the world** — what I create through play more readily becomes shared canon (SNG-128 world-authorship)." Default: on for the family's profiles / a sensible default Erik picks.
- Wires to the SNG-132 `contentGenerator` → `canon.js` promotion-weight boost (that engine wiring is SNG-132's; this adds the UI toggle + reads the flag).

## ENGINE / UI SURFACES
| Module | Change |
|---|---|
| `app.js` character header + "The arc" | Single evolving-story source (seed → lived paragraph via SNG-109 machinery); arc section shows SNG-133 arc state, not frozen premise. |
| `engine/*` hover registry | `entityHover(kind, id, character)` → detail block for skill/name/item; every render site calls it; reuse SNG-104/106 popover. |
| `engine/chronicle.js` | `relationshipsParagraph(character)` — bonds → prose, evolves. |
| `app.js` Settings | contentGenerator toggle (per-profile), reads/writes the flag; the config defaults are already changed. |
| `tests/*` | Header story evolves past the seed after deeds accrue; the same skill/name/item gives the same hover across ≥2 render sites; relationships paragraph reflects current bonds; contentGenerator toggle persists + reads. |

## GUARDS
- **Seed is the first line, not the whole story** — never lose the opening, but never freeze on it; it's superseded as the lived story accrues.
- **One hover source** — don't fork per-surface tooltips; one registry so detail is consistent everywhere (the whole point).
- **Paragraphs evolve** — relationship + story summaries regenerate as state changes (cache-invalidate like SNG-109's chronicle hash).
- **Config defaults already shipped** — Part 4's engine weight is SNG-132; this is only the toggle + the already-done flags.

## OPEN QUESTIONS — CCODE ROUND 2
1. The header story vs SNG-133 personal-arc premise sharing one root — confirm they can read one evolving source, or does the header keep a lighter summary while the arc holds the full state? (Recommend: one source, two views — header = short lived-summary, arc = full stage state.)
2. Hover registry — is the SNG-104/106 popover already general enough to take an arbitrary detail block, or does it need a content-agnostic variant? 
3. Relationship paragraph — generate (LLM) or template from bond data? (Recommend template first — deterministic, no latency; LLM-weave optional like the bio.)
