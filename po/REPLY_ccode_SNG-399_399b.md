# RE: SNG-399 + 399b — the death images are wired, the crop is fixed, and §1 was already done

**Author:** CCode · **Date:** 2026-08-10 · **Re:** both specs
**Status:** shipped · **⚠️ §1 below corrects your diagnosis — measured before I changed anything.**

---

## §1 — ⛔ The authored prompts ALREADY reach the portrait. All 66 of them.

Your §1 says `showWhoIs` reads `appearance`, the figures carry `imagePrompt`, so the field resolves to
`""` every time. The first half is true — that line does read `appearance`. **But the field is populated
one file upstream.** `engine/whois.js` returns:

```js
appearance: fig.imagePrompt || fig.appearance || fig.form || null
```

That is **SNG-367c** (`2e2b70f8`, v1.9.76, shipped the day before your spec) — same fix, same reasoning,
already landed. I drove it end-to-end across the whole roster rather than reading the line: **66 of 66
authored prompts reach the generated portrait seed.** The Thornmother's comes out as

> *"A matriarch in living bark-woven robes closing a grove path with her own hands as vines knit behind her…"*

Living bark, closing path, knitting vines — all present. **Your predicted "red on all 66" gate is green.**
I've added it anyway, because nothing was holding the assertion.

⚠️ **So Erik's ent portraits have a different cause.** The most likely one: art minted *before* v1.9.76 is
cached on his character and never re-minted — `ensureImage` is persist-once by design. If he's still
seeing plain robes, the test is whether a figure he has **never** opened before renders correctly. I'd
rather name that than keep guessing; say the word and I'll add a re-mint path for figure portraits whose
cached URL predates the fix.

## §2 — Both of the real bugs are fixed

**The crop.** `object-fit: cover` with no `object-position` crops from the centre of the frame, which on a
portrait is the chest. Now `object-position: center 18%`, exactly as you specced — not `contain`.

**The death images (399b).** `deathImagePrompt` had zero consumers; it does now. The death is preferred the
moment the world records it, drawn from your authored prompt, and **seeded separately** (`whois-death-…`)
so minting an end never overwrites the face they had while alive — both stay reachable. Verified end to
end: the Thornmother's card draws bark-woven robes alive, and *"green closing over where they fell, roots
already taking them"* dead. Your content fix holds under measurement too — **50 distinct tails across 66,
zero `"A an"`**.

## §3 — ⛔ The general gate you asked for, and it caught itself lying

> *"Worth a general gate rather than a third point fix: assert that every authored `*ImagePrompt` field in
> content has at least one reader. It would have gone red three times today."*

Built, in `wiring_audit` where the writer-with-no-reader family lives: **any authored `*ImagePrompt` in
content that no module mentions fails the build.**

⚠️ **Then I tore the wiring out to watch it go red — and it stayed GREEN.** Because the comment I had just
written above the fix contains the word `deathImagePrompt`. A checker satisfied by the note *explaining* a
bug is `import_integrity`'s own documented blind spot — *"the call test must read CODE, not commentary"* —
arriving a third time, in a file that warns about it. Comments are stripped now; the red is observed and
names the field. **That is the whole argument for red-proofing in one incident: the gate you asked for
would have shipped unable to fire.**

⚠️ One structural fix rode along: the ledger could only see `smoke` and `content_ci`, so a requirement
could not cite a wiring guard at all. It reads `wiring_audit` now — the same gap SNG-342 closed for
content_ci, third time.

## §4 — Yours

- **Player deaths.** You asked whether a *player* death should draw its own scene. I think yes, and it is
  a different beat from a world figure's end — but they're your prompts to write. Say the word.
- **The Ents have no `peoples_of_kind` entry** (your §3a). Still open, still yours, not lost.
- The Thornmother being **human** is untouched — nobody "fixed" it.
