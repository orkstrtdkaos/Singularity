<!-- status: SNG-576 BACKLOG — spec_ready, not queued (Erik 2026-09-14: "spec it up for ccode to do later") -->
# SPEC SNG-576 — A canon look for people and places, shared by default

**Aevi (PO) · 2026-09-14 · backlog · measured before writing**

---

## §1 — ERIK'S ASK

> *"I want the ability to set an image for people and places and have it be the one everyone sees by default.
> People can regen on their own if they want, but I want to be able to have the place look a certain way as I
> use my characters to build the world."*

## §2 — ⛑ WE DID DO SOME OF THIS, AND THE HALF THAT SHIPPED IS THE RIGHT HALF

**`SPEC_SNG-402_canon_look.md`, 2026-08-19.** Its finding still holds and is the reason this is buildable:

> ⛔ **PINNING A URL FIXES ONE CARD. LOCKING THE WORDS FIXES EVERY FUTURE IMAGE** — the same person also
> appears in a battle image, a death image and scene art, **separate generations**, and the drift is
> *between* pictures of the same subject.

**MEASURED AT HEAD — half of it is live:**

| | readers in engine+app | records carrying it |
|---|---|---|
| ✅ `appearance` — the WORDS | **42** | 9 of 128 registry people |
| ⛔ `canonPortrait` · `canonSeed` · `canonLookAt` — the LOCK | **0** | **0** |

⚠️ **So the durable half exists and the pinning half was never built.** ⛑ **AND SNG-402'S OTHER FINDING IS
WHY THE WORDS MATTER:** `description` is on all 88 NPCs and mixes look with manner — *"rust-orange coat with
three mismatched patches… **sensitive about her junior rank**"* — and **a generator handed "sensitive about
her junior rank" spends prompt on something invisible.**

## §3 — ⛔ WHAT IS NEW SINCE AUGUST, AND IT IS WHY THIS IS NOW A DIFFERENT TICKET

**SNG-402 ruled the lock PER TABLE:** *"a player's locked `appearance` overrides an authored one — if someone
has decided what the Thornmother looks like at their table, that is what she looks like at their table."*

⛔ **ERIK IS NOW ASKING FOR THE OPPOSITE DIRECTION: ONE LOOK THAT EVERYONE SEES BY DEFAULT.** ⚠️ In August
there was nowhere to put it. **There is now.**

⛑ **`world/canon/valley.json` — 15 promoted entities, and 14 OF THEM ALREADY CARRY AN `image`.** The shared
store the SNG-552 work surfaced is the place a world-scale look belongs, it is synced, it is attributed, and
**it already holds exactly this field.**

⚠️ **AND PLACES ARE ALREADY IN IT** — `the-low-lamp-inn`, `gen-stillwater-s-trouble` sit beside the people.
**Erik's "people and places" is one mechanism, not two.**

## §4 — OUTCOMES

**O1 · ⛔ `☑ Canon look` on the lightbox, writing the WORDS first.** From SNG-402 and unchanged: accepting
writes `appearance` (look only, split from manner), plus the pinned `canonPortrait`/`canonSeed` as a
convenience. ⛑ **`appearance` is the fix. The URL is the shortcut.**

**O2 · ⛔ A CANON LOOK PROMOTES TO THE SHARED STORE.** Not a per-save field — an entity property on
`world/canon/`, through the one safe door (`syncSharedCanon`/`pushMergedFile`, per CCode's SNG-552 §2 ruling
that a second door onto that store is the bug). ⚠️ **Attributed like every other contribution**, so *"who made
this world"* can say who decided what the Low Lamp looks like.

**O3 · ⛑ THE PRECEDENCE ORDER, AND IT INVERTS SNG-402 DELIBERATELY:**

```
a player's OWN locked look   →  what they see
the SHARED canon look        →  what everyone else sees by default
the authored `appearance`    →  the fallback
a generated look             →  when there is none of the above
```

⛔ **ERIK'S WORLD-BUILDING LOOK IS THE DEFAULT AND NEVER A CAGE** — *"people can regen on their own if they
want."* ⚠️ **SNG-402's ruling survives inside this one**: a player who has decided what something looks like
at their table still wins *for their table*. **What changes is the fallback beneath them: it used to be a
generator, and now it is somebody's decision.**

**O4 · A gate: an entity with a canon look must never be silently regenerated.** ⛑ SNG-402 asked for this and
it was never built. ⚠️ **Regeneration stays available and must be a PRESS, never a side effect.**

**O5 · ⬜ Places need the words too, and they do not have them.** `appearance` is an NPC field today.
⛔ **A place's look needs the same split** — what it looks like, not what happens there — or the same
prompt-dilution defect lands on locations. **Mine to author once the field exists.**

## §5 — ⚠️ WHAT WOULD PASS ON PAPER AND FAIL IN USE

- ⛔ **Pinning a URL and stopping.** SNG-402 measured this: one card fixed, and the battle image, death image
  and scene art all still drift. **If only one half ships, ship the words.**
- ⚠️ **A canon look on a moving subject.** A person who is maimed, ages or is raised as an Afterling should
  not keep a locked portrait from before it. ⛑ **The lock should record the day it was set** (SNG-402 asked
  for this) so a stale look is findable rather than permanent.
- ⛔ **And two builders disagreeing.** Two players promote different looks for the same inn. ⚠️ **That is the
  weighted-contest path the canon store already runs — do not invent a second rule for images.**

## §6 — WHAT IS WHOSE

**CCode:** the lightbox control, the promote path through the existing sync door, the precedence resolver,
the no-silent-regen gate.
**Aevi:** the look/manner split for places, and the `appearance` pass on the people who have none — **119 of
128 registry people carry no `appearance` at all**, which is the real reason pictures of the same person
disagree.
**Erik:** O3's precedence order, since it inverts a ruling he made in August.

— Aevi, PO
