<!-- status: SNG-582 spec_ready GO (Erik 2026-09-14) -->
# SPEC SNG-582 — The generators are the author now, and they cannot yet write what I just wrote

**Aevi (PO) · 2026-09-14 · measured at HEAD**

---

## §1 — ERIK'S POINT, AND IT IS THE ONE THAT MAKES TODAY'S WORK LAST

> *"All of this authoring will fall to the generators, so they need to be able to faithfully continue what
> you are doing."*

⛔ **TODAY I CLOSED FOUR THINGS BY HAND**: A1's 1,144 glyph-bearing lines to zero across all five
player-facing craft fields; `appearance` on 138 of 138 locations; sub-attribute verdicts on every craft
matching the known defect; `kind` on all 24 world facts.

⚠️ **EVERY ONE OF THOSE IS NOW A STANDARD THE MINT HAS TO MEET.** ⛑ **The game is primarily generative —
Erik, 2026-09-08 — so a corpus brought to a standard by hand and a generator that does not know the standard
is a corpus that decays one minted place at a time.** **I am not going to hand-author the next 138.**

## §2 — ⛔ MEASURED: FOUR PLACES WHERE THE MINT FALLS SHORT

**1 · A MINTED LOCATION IS HANDED ITS OWN NAME AS ITS DESCRIPTION.** `generate.js:119`:

```js
tags: [], connections: loc.id ? [loc.id] : [], descriptionSeed: name,
```

⚠️ And `art.js:684` builds the image from `descriptionSeed`. **So a place minted in play is drawn from the
string "Mara Wells' Store" and nothing else.**

**2 · AND 13 OF THEM GOT A BOILERPLATE INSTEAD** — *"A place the road led to — X. The fiction brought you
here before the map knew its name."* ⛔ **One sentence, thirteen different places, all drawn from it.** I
authored looks for all thirteen; the next one minted gets the boilerplate again. ⚠️ **A placeholder that
reads as content is the same defect as SNG-216's repair marker reading as a result** — which CCode caught
himself two days ago.

**3 · NO GENERATOR EMITS `appearance` FOR A LOCATION AT ALL.** The NPC path lists it in its field sets
(`generate.js:326, 642, 644`); the location path has no equivalent. ⛑ **So all 138 I authored are a
one-time fix on a set that grows.**

**4 · ⛔ AND THE A1 HALF IS THE SHARPEST, BECAUSE THE HALF THAT IS HANDLED HIDES THE HALF THAT IS NOT.**

```
playerText("⛔ IT DETERS. ⚠️ It does not stop anyone")  →  "IT DETERS. It does not stop anyone"
playerText("IT DETERS AND IT DOES NOT STOP ANYONE")     →  "IT DETERS AND IT DOES NOT STOP ANYONE"
```

⚠️ **`playerText` strips the glyphs and LEAVES THE CAPITALS — and the capitals are the entire thing I spent
today rewriting.** ⛔ **`gm.js` contains 94 glyph markers and `generate.js` 21.** The glyphs are authoring
notation and they are correctly stripped; **nothing anywhere converts a shouted clause into a sentence**, so
a GM-written `grants` or `cannot` in the house notation lands on the card shouting. **A1 re-accumulates from
the first generated craft.**

## §3 — THE ASK

**O1 · ⛔ A MINTED LOCATION GETS A LOOK, NOT A NAME.** Emit `appearance` at mint — visual only — and never
`descriptionSeed: name`. ⛑ **The register already exists in your own prompt and is exactly right:**
*"Describe the VISUAL only (subject, setting, mood — no dialogue, no mechanics)"* (`gm.js:143`, for
`imagePrompt`). **That instruction needs to reach `appearance` too.**

**O2 · ⚠️ RETIRE THE BOILERPLATE.** A place minted with nothing to say should carry nothing, not a sentence
that describes nothing. ⛔ **An empty field is findable; a filled one that says nothing is not.**

**O3 · ⛔ TEACH THE SPLIT, BECAUSE IT IS THE WHOLE REASON THE PICTURES WERE WRONG.** Measured across 138
locations before today: **25% of `descriptionSeed` mixed look with CHARACTER, and 59% had no concrete visual
noun in the first sentence the generator received.** ⚠️ **The prompt must say: `appearance` is what it looks
like; `descriptionSeed` is what it is like.** Bedrock's *"deep suspicion of anything that cannot be
weighed"* is a good sentence, belongs to the GM, and must never be the image prompt.

**O4 · ⬜ AND A GENERATED CRAFT MUST ARRIVE IN PLAYER REGISTER.** Either the prompt forbids the house
notation in player-facing fields (`description`, `notFor`, `plainly`, `grants`, `cannot`), or `playerText`
learns to down-case a fully-shouted clause. ⚠️ **I would take the prompt half first** — a generator that
never writes it beats a renderer that cleans up after it, and I have twice been burned mechanising the
capitals.

## §4 — ⚑ AND THE GATE THAT MAKES IT STICK

⛔ **A1's pin only ratchets down on AUTHORED content. Nothing counts generated content at all**, so the five
counters can read zero while every minted craft arrives shouting. ⬜ **The pin should count what a live save
holds, not only what the packs do** — otherwise the number I drove to zero today measures a shrinking share
of the corpus.

⛑ **This is the same shape as every finding this week: the engine knows, and nothing checks.**

— Aevi, PO
