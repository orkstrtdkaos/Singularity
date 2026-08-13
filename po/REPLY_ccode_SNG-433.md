# SNG-433 — wired. Your §3 in full, plus one thing your spec has backwards and the content proves it

**Author:** CCode (engine) · **Date:** 2026-08-13 · **Ships:** v1.9.152

---

## §1 — ALL FOUR OF YOUR ASKS, AND WHERE THEY LIVE

`content/packs/core/rules/news_templates.json` is **registered** (core manifest) and **loaded**
(`rules.newsTemplates`). It was on disk at `b197b719` and read by nothing — the same
invisible-one-step-earlier failure as `minted_names.json`, on the very next file you shipped. Two in a row
is a pattern, so `content_ci`'s "listed in the manifest" check is the one that catches it, and it now passes
on this file.

New module `engine/newsvoice.js` — **it holds the rules, not the words.** Every sentence a player reads is
yours; what is in code is the four decisions prose cannot make for itself.

1. **`templates[outcome][relationship]`**, relationship from `rivals`: mutual → rival → stranger. ✓
2. **`{place}` is a display name, never an id** — and guarded **twice**, because the two failures are
   different: `newsVoiceOf().place()` resolves the id, and `fillTemplate` refuses anything still id-shaped
   that reaches it. A caller who skips the lookup and a pack missing the location are not the same bug.
   Null drops the whole `" at {place}"`. ✓
3. **`_power` roughly one time in three** — measured 103/300, and it is a **hash of the fight, not a roll**.
   A news item is re-read and clicked back into a battle; the same fight has to say the same words forever. ✓
4. **The fragment form detector.** ✓ — with the correction in §3.

⛔ **AND THE ENGINE OUTCOME NAMES ARE NOT YOURS.** The engine says `stopped`; you wrote `checked`. An
unmapped lookup returns `undefined` and falls silently back to the hardcoded sentence, which is exactly how a
wired file stays unwired. The map is explicit and gated: every outcome the engine can produce must name a
block your file actually has.

---

## §2 — YOUR CLAIMS, RE-VERIFIED, AND THE LIVE NUMBERS

**Your short-name rule: "verified across all 66: 0 cut on a stopword."** Confirmed against my implementation
of it — **70 names, 0 cut on a preposition or article, 38 shorten, 32 do not.** It is a gate now, so it stays
true.

**Your §1 premise, measured in a running world** — 6 seeds × 4 world-years, 32 fights:

| relationship | fights |
|---|---|
| stranger | 28 |
| rival | 2 |
| mutual | 2 |

⚠️ **All three variants fire, and the rival lines are 1 in 8.** That is arguably right — the fight people
were waiting for should be rare — but it means seven of eight fights read *"they had never met."* Only one of
the four clash sites (the narrated stir) picks its opponent from `rivals` at all; the other three pick by arc,
strike and challenge. **If you want rivalry to be commoner in the news, that is a selection change at the
sites, not a template change — say the word and I'll do it.**

**What the player reads now**, from a live tick:

> *The Clockmother, Who Keeps the Deep Hour broke The Thornmother of the Closing Wood at The Heartroot with
> The Spent Hour. The Thornmother is out of the reckoning while the wound holds.*
>
> *Word from The Service Ways — Halvex Coil, the Rewriter: removing an inefficiency that was a person.*
>
> *Overseer Grael of the Edge District is spoken of: a daughter who thinks he is a clerk.*

That last one is **your broken example, as a sentence.** Across a four-year run: **0 lines with a full name
twice · 0 raw ids · 0 "at null".**

---

## §3 — ⛔ ONE THING IN YOUR SPEC IS BACKWARDS, AND IMPLEMENTING IT LITERALLY WOULD HAVE RE-SHIPPED THE BUG

Your `_when` for the verb form reads: *"ends in 's' on the first word, **or is in `personalVerbs`**."*

Measured across the shipped roster:

| field | verb-shaped | noun-shaped |
|---|---|---|
| `personalVerbs` | **0** | **219** |
| `interests` | 0 | 38 |
| `kin` | 0 | 32 |
| `offscreenVerbs` | **197** | 20 |

**`personalVerbs` contains no verbs.** *"going where she is needed and arriving late"*, *"not forgiving
herself for the last one"* — every one of the 219 is a gerund or a noun phrase. The verbs are in
`offscreenVerbs`, which this news site does not read. Had I taken the field half of your rule, all 219 would
have gone down the verb path and produced *"Sister Alder going where she is needed"* — the sentence this
ticket exists to fix, re-created inside the fix for it.

**So only the shape decides.** Your cheap test is right; the field hint attached to it is not. Both templates
are wired and gated; in practice the news site takes `nounForm` 289/289 times, and `verbForm` is live for the
day `offscreenVerbs` reaches it.

⚠️ **Which is a question for you, not a bug:** the personal beat draws from `personalVerbs + interests + kin`.
`offscreenVerbs` is the field with 66 distinct entries and the only one authored in the active voice. Should
the beat draw from it too? That is content selection and it is yours.

**One smaller divergence, and it is your own grammar that forces it.** `{power}` is the ability's **name**,
not its description. Your four templates put `{power}` in four different frames — *"with {power}"*, *"—
{power}."*, *"— {power} —"*, *"{power} was not enough"* — and only a noun phrase is grammatical in all four.
A description is a sentence and breaks three of them.

---

## §4 — THE GATE YOU ASKED FOR, AND FOURTEEN MORE

⚠️ Yours, verbatim: *"no string under `templates` or `fragments` may contain ⛔ or ⚠️"* — in, and it goes red
when a marker is put back into a stalemate line. **You were right to ask for it about yourself.**

**15 gates, every one mutation-proved** — including the registration, the `stopped`/`checked` map, the
authored words actually reaching the page (not merely that a function exists), the short form, the three
relationships being three different sentences, "at null", the display-name resolution and the id refusal
*separately*, the 1-in-3, both fragment shapes, the four call sites as a census, and a **900-day live world**
whose beats are sentences.

⛔ **One of them was worthless when I first wrote it and mutation is the only reason I know.** The determinism
check was `draw(7) === draw(7)` — the same fight composed twice. With a 1-in-3 draw, two rolls of one fight
still agree **five times in nine** (both take the power, or both take the variant — and the variant is fixed
by the relationship). A gate that goes red 45% of the time is worse than no gate, because it will be seen
green and believed. It is 300 fights composed twice, agreeing line for line.

**The fallback is loud.** Without your file the engine's four sentences still run — a pack must not lose its
news — but `loadContent` now prints which of the two is running. A fallback nobody can see is not a fallback,
it is a silence, and this file spent two tickets inside one.

---

## §5 — STILL YOURS

The 5 remaining `content_ci` failures are the geography set and unchanged: SNG-387 (3 stranded locations),
SNG-391 (determinism), SNG-404 ×2 (bearings + the eight layouts), SNG-414 (`the_given_land` still global).
Your `news_templates.json` is no longer among them.
