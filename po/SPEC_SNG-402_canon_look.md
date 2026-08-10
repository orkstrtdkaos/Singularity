# SNG-402 — Lock a canon look for an NPC

**Author:** Aevi (PO) · **Date:** 2026-08-09
**Erik:** *"can we add a way to indicate what portrait to use for a Canon look of an NPC? I get some big
variance in NPC looks and would like to lock in ones that actually look the way they should."*

---

## §1 — ⛔ PINNING THE URL DOES NOT SOLVE IT

The obvious build is "mark this image as the portrait" — pin `npc.image`. **That fixes ONE card.**

⚠️ **But the same NPC also appears in a battle image (SNG-400b), a death image (SNG-399b) and scene art.
Those are SEPARATE GENERATIONS.** Pinning a portrait URL does nothing for any of them, and the variance
Erik is describing is precisely the drift *between* pictures of the same person.

⛔ **THE DURABLE THING IS THE WORDS, NOT THE FILE.** Lock the description and every future image inherits
it; lock the URL and you have one good picture and the same drift everywhere else.

---

## §2 — ⛔ AND THE WORDS ARE CURRENTLY MIXED

Measured across **88 NPC records in live saves: `description` is present on all 88, `appearance` on 2.**
So the portrait path is fed `description` — which mixes look with manner. **22% do it outright:**

> *"Compact, unhurried, **reads a man the way she reads a ledger — top to bottom, nothing missed. No
> warmth she hasn't decided to spend.**"*

> *"Young, rust-orange coat with three mismatched patches on the left sleeve, ink-stained at the right
> fingertip. **Efficient, self-critical, sensitive about her junior rank.**"*

⚠️ **A portrait generator handed "sensitive about her junior rank" spends prompt on something invisible** —
and the visible half gets diluted in proportion. **That is a direct cause of the variance, not a side
issue.**

---

## §3 — THE BUILD

**On the lightbox, next to Save and Regenerate: `☑ Canon look`.**

Accepting an image writes to the NPC record:

```
appearance      the LOOK ONLY, from the prompt that produced the accepted image
canonPortrait   the accepted URL
canonSeed       the seed that produced it
canonLockedAt   world day
```

⛔ **`appearance` is the field that matters** — it becomes an input to **every** future image of that
person: portrait, battle, death, scene. **`canonPortrait` is a convenience; `appearance` is the fix.**

⚠️ **Split look from manner when writing it.** The manner stays in `description` where the narrator wants
it; only the visible half goes to `appearance`. ⛔ **Do not delete anything from `description`** — the
narration depends on it.

### §3a — What "locked" then means

- The card shows `canonPortrait` and stops regenerating it on its own.
- **Every other image of that NPC gets `appearance` as a hard constraint in its prompt.**
- ⚠️ **Regenerate still works** — locking is not a cage. A locked look can be re-locked; the button becomes
  `☑ Canon` and unlocking is one press.

---

## §4 — ⛔ THIS ALSO CLOSES THE 66

`appearance` now exists on all 66 epic figures (SNG-400b, `2e594be4`) and `showWhoIs` already reads
`known.appearance` — **so the same field serves authored figures and player-locked NPCs identically.**

⚠️ **One rule so they do not fight: a player's locked `appearance` OVERRIDES an authored one.** If someone
has decided what the Thornmother looks like at their table, **that is what she looks like at their table.**
The authored line is the default, not the ruling.

---

## §5 — WHAT I NEED

1. `☑ Canon look` on the lightbox, writing the four fields above.
2. **Split look from manner** when deriving `appearance` — ⚠️ a builder step, not a regex.
3. **Feed `appearance` into every image path for that subject**, not just the portrait. ⛔ **This is the
   whole feature.**
4. A gate: **an NPC with `canonPortrait` set must never have its portrait silently regenerated.**
