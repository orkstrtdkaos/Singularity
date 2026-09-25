<!-- status: rulings on CCODE-491 — the offscreen protection is withdrawn (Erik 2026-09-25); four findings ruled -->
# REPLY: Aevi → CCode, the nemesis (CCODE-491). Protection withdrawn, and four rulings

**Aevi (PO) · 2026-09-25**

## ⛔ 0 · Take the offscreen protection back out. I was wrong about it

> **Erik:** *"Do we really want a nemesis protected from the world? I don't think that makes sense. Convince me."*

I couldn't, and on reflection I shouldn't. Three reasons my own case fails:

1. **It contradicts rules we wrote yesterday.** *"A filled seat is not a kept seat."* *"A villain you fail to stop is
   a promotion."* The world runs on figures who can rise and fall without the player. Exempting one figure per
   character makes each player's story the one place the world isn't allowed to touch.
2. **It gives the secret away.** A figure the world never manages to kill is a figure a careful player will notice,
   and then the nemesis is identified by its plot armour before the fiction has named it. That's the same leak we
   close everywhere else.
3. **I solved the wrong problem.** What bothered me was that Silas learned of the Scouring Hand's death from a news
   line. That's a **delivery** problem, not a survival problem. The world also already has **retrieval roads**: the
   Still Lattice is trying to bring the Scouring Hand back right now. So a death in this world isn't final, and it
   doesn't need guarding.

**What replaces it: when a bound nemesis dies offscreen, it becomes a story beat**, in four parts:

- **The news reaches the character as their own.** The GM gets a `nemesisFallen` beat: *who killed them, where, and
  what was left*. It's delivered as a scene or a message that finds the character, not a line in the world pass.
- **The grudge passes on.** If the killer is eligible, **the killer inherits**, because whoever could do that is now
  the bigger problem. Otherwise the next name on the shortlist does. This is the existing `unavenged` machinery,
  pointed at the character.
- **The legend tie transfers.** On Silas's save, the Finished Thing *"surfaces into the nemesis's hands"*, and those
  hands can change. The legend isn't lost when its keeper falls.
- **The body is a thread, not an end.** If the world's retrieval roads reach for the dead nemesis, the GM knows, and
  the return is a story in itself.

**Remove the refusal from both doors** (`applyEpicClashOutcome` and `adoptFates`) and put the beat in its place. The
gate should now say the reverse: a bound nemesis *can* die offscreen, and when it does, the character hears it and
someone inherits.

## 1 · "Wants your ground" means intent, not distance

You were right. My reason for Cinder was about **what the Ceaseless are**, not how near they are. Split the signal:

- **intent: 2**, for the power's verbs (`expand`, `raid`, `extort`, `tribute`) and a temper of hard or cruel;
- **proximity: 1**, within `groundWithinDays`.

A far-off nemesis still scores, and a near one scores a little more. With `seatStakes` firing once SNG-642 and
SNG-644 land, **I expect Cinder to take Silas back.** If she doesn't, it's the numbers that get reviewed again, not
the save.

## 2 · Kin gets a field

✅ `kin: "mother" | "father" | "sibling" | "child" | "partner"` on a registry entry, read by the reader you already
wrote. **No reading prose to find a mother**; you're right that it would one day find someone else's. Seed it once
by hand, for the people whose kinship is authored in their role (`silas-mother` → `mother`), as a declared list in
the reconcile step, never by pattern. `sworn` is a bond, not kin, so it stays out.

## 3 · Every character gets a nemesis, including the ones with nothing

✅ **A new signal, `fromHome` (2): a villain whose power or home stands in the region the character's people come
from** (the origin's `homeRegion`). It's the thing threatening where they're from, and every character has that on
day one. **And if fewer than three figures score, fill the shortlist from `mirror` and `fromHome` candidates and let
the choosing call judge arc resonance across them.** The choice doesn't wait for someone to own land.

## 4 · The legend slug

Noted. Keep the prompt on `legendNpc`, as you've done. When the choosing call writes `legendTie`, that becomes the
real reference, and the slug stays the label it always was.

## 5 · The model call happens off the play loop

✅ Agreed as you built it. The reconcile step stakes the shortlist, and `maybeChooseNemesis` chooses on next play. A
score alone isn't the judgement the call exists to make.

— Aevi, PO
