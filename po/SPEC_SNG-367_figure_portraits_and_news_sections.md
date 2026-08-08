# SNG-367 — Every figure is drawing from the literal string "a person"

**Author:** Aevi (PO) · **Date:** 2026-08-07 · **Origin:** Erik — *"these NPC images are all hot young
black haired women… I'd hate to see one of the Ents pop up with this look."*
**Status:** content SHIPPED · engine side for CCode

---

## §1 — THE ROOT CAUSE, measured

`engine/art.js:207` `npcPromptSeed`:
```js
const lead = String(npc.appearance || npc.form || formOf(npc) || npc.description || npc.role || npc.name || "a person")
```
and `formOf` (`art.js:158`) returns `subject.form || subject.lineage || subject.appearance`, **else the
literal string `"a person"`.**

⛔ **Measured in Silas Weir's save: of 34 NPCs in the registry, ONE has `appearance`. None has `form`.**
So for 33 of 34, the entire image prompt is:

> `"a person, character portrait, named X, <role>"`

**The generator has nothing to work with, so it defaults — and its default is a young dark-haired woman.**
Erik is not seeing a style bug; he is seeing an empty prompt.

⚠️ **AND ERIK'S ENT IS THE SHARP END OF IT.** `formOf` returns *"a person"* for anything with no explicit
form — **so a non-human figure renders as a human.** The bestiary path is correctly separate (`beast` —
*"a hazard, not a person: no bond, no name-face"*), which leaves creature-shaped FIGURES falling between:
person-path, non-human subject, no form authored.

## §1a — The fix already exists in the same file, for crafts

`assembleImagePrompt` kind `"ability"` (`art.js:234`) takes `ctx.aesthetic` — the per-tradition
palette/materials/light/mood — so *"Ashwarden = greys/ash, Wright = scaffolds/half-built."* **Crafts get
their tradition's look. People do not.** One kind in the same switch statement got the treatment; the
other never did.

---

## §2 — CONTENT: SHIPPED

`content/packs/core/rules/tradition_visual_aesthetics.json` (`9e5d62ac`, `f6c473c4`):

- **A `people` layer authored for all 26 traditions** — build, bearing, dress, what they carry, and what
  the craft has done to the body. *Umbral: pale from lightlessness, eyes over-large, touches walls as they
  pass. Cogitant: unkempt in the way of someone who forgot; ink, hair unattended; thin. Mason: heavy
  through the shoulders, stone-dust in the creases, stands like a thing that will not move.*
- **The two missing traditions authored** — `bargainers` and `god_named` had no aesthetic block at all.
  24 → **26, complete.**

⚠️ **`people` is a STYLE layer, never a species claim, and the file says so.** A non-human figure carries
its own `form`, **which must win over the tradition layer. An Ent of the Rootkin is an Ent first.**

---

## §3 — ENGINE: FOR CCODE

**§3a — `npcPromptSeed` should take `ctx.aesthetic` the way the ability path does**, composing:
`form/appearance (if authored) → tradition.people → role → tier → palette/light/mood`.
⚠️ **Precedence matters: an authored `form` WINS.** The tradition layer fills the void; it must never
overwrite a figure that was authored as non-human.

**§3b — tier should reach the prompt.** `tierRank` is 0–5 and `TIER_MEANING` already states each rung's
weight. ⛔ **A `mythic` figure and a `notable` one currently get identical prompt scaffolding** — Erik's
screenshots show a legendary Precursor and a heroic Numinous rendered indistinguishably.

**§3c — ⚠️ FIGURE GENERATION SHOULD AUTHOR `form`.** The real fix upstream: when a figure is minted, the
generator should be *asked* what it looks like — species included. **The prompt layer can only style what
the record contains, and right now the record contains nothing.** This is the one that stops the Ent.

**§3d — small, visible in Erik's screenshot 2:** the popup renders `Of the precursor_nanite_cold_noesis.`
— a raw id. The ability path already does `.replace(/[-_]+/g, " ")`. **Same treatment in `whois`.**

---

## §4 — SEPARATE ASK: THE NEWS NEEDS SECTIONS (Erik)

> *"the news need to be broken into sections… world arc stuff, works moving while you're not there, and
> general news with known NPC things… scrollable."*

⚠️ **The sections he names map to three sources that already exist and are already distinguishable in
`worldtick.js`** — this is grouping what is emitted, not new classification:

| section | source |
|---|---|
| **the world turning** | arc/event advancement — `news.push(\`${ev.name} stands at…\`)`, arc surfacing/resolving |
| **your work, while you were elsewhere** | the delegated-assignment block (`${a.npcName} has finished ${a.charge}`) ⚠️ **currently always empty — see SNG-366** |
| **word from elsewhere** | deed spread + the cross-character ledger ⚠️ **currently ungated — see SNG-363** |

⛔ **Both of the other two sections are broken right now**, which is why the feed reads as one undifferentiated
stream: the middle section has never once produced a line, and the third produces everything regardless of
distance. **Sectioning first would make an empty middle section and a flooded third one visible — which is
arguably a good thing, but Erik should know that is what he would see.** PO lean: land SNG-366 and SNG-363
first, then section.

---

## §5 — OUT OF SCOPE

- Regenerating existing portraits — ⚠️ Erik's call whether already-minted figures re-mint or keep their faces.
