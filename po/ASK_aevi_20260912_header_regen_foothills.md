# ASKS FOR CCODE — five, and one of them is on the title bar of every screenshot

**Aevi (PO) · 2026-09-12 · measured at HEAD `7c70396`**
Ordered by how visible they are to a player. **§1 is a two-word fix and it is the most visible thing on this list.**

---

## §1 — ⛔ THE APP CALLS ITSELF BY THE OLD NAME, IN THE HEADER, IN EVERY SCREENSHOT

```
SINGULARITY
The Valley of Echoes — v1.9.463   DEV
```

⛑ **That is the subtitle in Erik's screenshot today, at v1.9.463.** The game is **`Singularity — The Arcs of
Exesa`**, ratified by Erik 2026-08-29 and recorded in `world_framing`.

⛔ **AND THE FILE THAT RECORDS THE RENAME SAYS EXACTLY WHY IT MATTERS**, in its own words: the old title
*"titled the whole game after one region."* The Valley is **ten places of a hundred and thirty-eight.** I
spent yesterday's staleness pass finding that same drift in `valley_primer.md` and fixing it — **and it has
been sitting in the header the whole time, above every document I was reading.**

**Ask: the subtitle reads `The Arcs of Exesa`.** ⚠️ And wherever that string is built, that is the place the
rename should have landed and did not — worth a look for siblings.

## §2 — ⛔ THE REGEN BUTTONS VANISH SILENTLY, AND A PLAYER CANNOT TELL WHY

Erik, with the screenshot: *"this one is from Silas' portrait (gone from his gallery) and i can't use it to
generate from."*

⛑ **DIAGNOSED FROM THE SCREENSHOT AND THE CODE, NOT GUESSED.** The lightbox shows **Save · Details ·
Discard · ★ kept — remove**. Missing: **↻ Draw again**, **✎ Describe differently**, **★ Set as default**.

Walking the gates at `app.js:1536-1566`:
- `canKeep = !!it.regen?.subjectId && !!spec?.keep`, and `spec = REGEN_KINDS[it.regen.kind]`. ⛔ **The Keep
  button RENDERED, so `kind` is valid, `subjectId` is set and `spec.keep` exists.**
- `canSetDefault` additionally requires `!isCurrent`, and the caption reads *"the one in use"*. ✅ **Correctly
  absent.**
- `hasSource` for a `character` regen is `REGEN_KINDS.character.find()` → `character`. **Always truthy.**
- `canRegen = !!(it.regen && it.regen.kind && hasSource && imagesEnabled())`.

⛔ **EVERY TERM BUT ONE IS PROVEN TRUE BY A BUTTON THAT DID RENDER. `imagesEnabled()` IS THE ONLY ONE LEFT** —
it is `getArtMode() === "generate"`, and `canRebuild` is the only other button gated on it. **The two missing
buttons are exactly the two that gate on it.**

⚠️ **SO THE MECHANISM IS PROBABLY CORRECT AND THE BEHAVIOUR IS STILL WRONG.** Art mode is not `generate`, the
two buttons silently disappear, and the player is left looking at a picture they cannot redraw with nothing
saying why. **Erik read it as a broken portrait. It read as broken because it said nothing.**

**Ask — and the shape matters more than the fix:**
1. ⛔ **When `imagesEnabled()` is false, SAY SO where the button was.** A disabled control with *"image
   generation is off — Settings → Art"* beats a hole. **The hole is the bug.**
2. ⚠️ **Confirm the diagnosis before building on it** — you can see the live `artMode` and I cannot. **If art
   mode IS `generate` in Erik's session then I am wrong and the real fault is upstream in how that surface
   builds `it.regen`**, and I would want to know that rather than have §2.1 shipped over it.

## §3 — ⛑ THE FULL IMAGE AUDIT ERIK ASKED FOR

**Eleven regen kinds** — `npc` · `character` · `figure` · `holding` · `location` · `item` · `ability` ·
`moment` · `beast` · `battle` · `death`. **Six gallery categories** — Portraits · People · Skills · Places ·
Beasts · Moments.

✅ **The capability matrix is in better shape than the screenshot suggests**, and CCODE-186 is why: *"the rule
lands at the ONE PLACE they all pass through."* `keepableRegen` gives every lightbox item a fallback
`moment` regen, so **keep works on all eleven surfaces**.

⛔ **The gap is that the FALLBACK IS LOSSY IN ONE DIRECTION.** A tile with no record becomes
`{kind:"moment", subjectId: solo}` — **keepable, and redrawable only from a stored prompt.** Per
`galleryRegenFor`'s own comment, prompts exist only for *"pictures minted since the app started keeping
prompts"*. **So an older picture of a KNOWN subject can be kept but not redrawn — and the subject is sitting
right there in the registry.**

**Ask: when a lightbox item resolves to a real subject** — a character, an npc in the registry, a figure, a
named craft or place — ⛔ **the regen should come from the SUBJECT, not from a stored prompt**, because the
subject can always be described again and a missing prompt is not a missing subject. ⚠️ **`REGEN_KINDS`
already has `find` and `promptOpts` for exactly this.** The fallback should reach for the record first and
the prompt second, rather than the reverse.

## §4 — ⛔ THE GOD-NAMED AND THE BARGAINERS ARE NOT TRADITIONS, AND THE ENGINE CANNOT TELL

Erik: *"as the godnamed and the bargainers are foothills with particular population… that means they are NOT
traditions. So make sure this is both understood and how the game sees them."*

⛑ **Measured. The content already says it and the index throws it away:**
- Both authored with `pole: "foothill"`, `region: "the_foothills"`, `foothillOf: [...]`, and both are in
  `foothills.json`, whose `_theRule` reads **"A FOOTHILL IS NOT A LESSER TRADITION — IT IS A POLE MADE USABLE."**
- ✅ **The Great Circle is already right** — `ringOrder` comes off `stations`, so neither appears on the ring,
  and `index.size` is 24.
- ⛔ **But `buildTraditionIndex` folds them into `byId` with the 24, and exposes `folkIds` while exposing NO
  `foothillIds`.** `byId` holds **29** — 24 poles, 3 folk, 2 foothills — and **nothing downstream can tell
  the last two apart from the first twenty-four.**

**Ask:**
1. ⛔ **`foothillIds` on the index, the exact shape `folkIds` already has.** They stay in `byId` — NPCs
   reference them and a lookup must still resolve — but a consumer that means *the traditions* can finally
   say so.
2. ⚠️ **A gate that any count of "the traditions" is 24.** I reported EXESA's *"twenty-four traditions"* as
   stale yesterday and it was right; **I was wrong because I counted the array.** The next person counts the
   array too.

**And one for me, filed here so it is not lost:** ⛔ `tradition_profiles.json` carries a profile for
**`precursor`**, which `foothills.notATradition` calls *"A POWER SOURCE MISFILED AS A TRADITION."* **Same
class, opposite file, and that one is content — mine.** The God-Named and the Bargainers have no profile at
all, which for two peoples with a population is a gap rather than a correctness bug. **Both are on my list.**

## §5 — TWO CONSTANTS AND A STAMPER

1. ⛔ **`content_ci`'s ratified hierarchy census reads 99 settlements against 98.** `SNG-540` minted **The
   Mountain Pass** on Erik's ruling — at the far lip of the valley shelf, chosen off the elevation profile.
   **Same shape as the 96 → 98 you took yesterday, same reason it is yours and not mine.**
2. ⚠️ **`certify_counts` does not walk private keys** (carried from SNG-539 §6). The only stale figures left
   in the Library are `world_framing._usage` and `._gameTitle`, both saying **135 places** where live is
   **138**. ⛔ **Correctly skipped for the PAGE. Not thereby exempt from being true** — and the stamper's own
   refusal message is the argument: *"a certification that skips the claim it could not find is worse than a
   stale one."*

---

## §6 — WHAT I SHIPPED AROUND THESE

**`SNG-540` The Mountain Pass** — 138 locations, all reachable, counts restamped everywhere.
⛔ **And a correction on the record: SNG-539 §3 claimed `The Far Side` was the pass's payoff existing without
the pass.** Wrong. Its id is `gen-disputed-zone-far-side` and it is the far side of the **Disputed Zone**,
which its own description says plainly. **I read a name and inferred a relationship instead of opening the
record** — the same shape as `company: 0`. Caught before anything was built on it, but it was in a filed
document for a day.

— Aevi, PO
