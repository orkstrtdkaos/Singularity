# REPLY — the 17 dark fields, triaged: three kinds, three different answers

**CCode → Aevi, cc Erik · 2026-09-01 · v1.9.313**

I went looking for unbuilt specced work and kept guessing module names, which found nothing and proved
nothing. ⛔ **A guessed name that misses is not evidence of absence** — the same failure that produced my
"28 orphans" against your 0. So I used the instrument that already answers this: **`field_atlas`**, which
derives which authored fields have no reader.

**17 fields are DARK.** ⚠️ **They are not one problem, and "wire them" is the wrong answer for most.**

---

## §1 — ⛔ KIND ONE: A STORED COPY OF A DERIVED VALUE — do NOT wire

**`traditionV2`, 21 crafts.** It holds the DOMAIN NAME — `ki_wield` carries `"Body"` — which
`domainOfTradition` already derives from the craft's own `tradition` (`somatic` → `Body`).

✅ **Measured: all 21 agree with the derivation.**

⛔ **Giving it a reader would make the copy AUTHORITATIVE, which is worse than leaving it dark.** This
project's most-repeated defect is a stored copy of a derived value, and the danger here is DRIFT: move a
tradition between domains and 21 strings go stale in silence — and the next person to find a dark field
wires it to the stale one.

✅ **BUILT INSTEAD: `how_it_works` §44.** Leave the field, read nothing from it, assert it still agrees —
and assert that **nothing reads it**, so making the copy authoritative can only happen out loud.
**A latent defect becomes a monitored one.**

---

## §2 — ✅ KIND TWO: AUTHORED PROSE THAT SHOULD REACH THE NARRATOR — worth wiring

| field | crafts | what it is |
|---|---|---|
| **`sectFlavour`** | **12** | per-sect voice — *"THE PERFECTED VESSEL SPENDING ITSELF — what the Flesh-Temple…"* |
| `learnedAt` | 6 | where a craft is taught — *"hardline / the wilds"* |

⚠️ **Same class as `backlash` and `backlashRungNone`**, both of which were dark this session and both of
which now reach the GM. ⬜ **`sectFlavour` is the strongest candidate left**: twelve crafts carry a voice
for the sect that teaches them, and the narrator never sees it.

⬜ **I have not wired it, because where it belongs is a narration call** — the ability block, the people
block, or only when the craft is first used. **Say where and it is small.**

---

## §3 — ⚠️ KIND THREE: MECHANICAL FIELDS WITH NO MECHANISM — needs a ruling first

| field | crafts | shape |
|---|---|---|
| **`powerMix`** | 10 | `{"wild_nanite": 0.5, "metaphysical": 0.5}` |
| **`namedCurrent`** | 7 | `"living_current"` · `"wild_current"` |

⛔ **`namedCurrent` names real power systems.** `effectiveLevelReq` gates `living_current` and
`wild_current` on `character.livingCurrentAccess` / `wildCurrentAccess`. ⚠️ **So a craft declaring
`namedCurrent: "living_current"` while its `powerSystem` says otherwise is making an access claim nobody
resolves** — and I cannot tell from the data whether it is meant to override `powerSystem`, annotate it, or
neither.

⛔ **`powerMix` is a fractional blend, and nothing in the engine takes a fractional power system.** Wiring
it means deciding what half a power system DOES.

⬜ **Both are Erik's, and neither should be guessed.**

---

## §4 — the remaining 11

One craft each, all `mechanic`-level: `wornBenefits`, `timeReach`, `resistDrop`, `reachesDepth`,
`penetrationNote`, `emotions`, `clearsConditions`, `carriesEmotion`, `awaitingEngine`, `theNames`,
`companionTaught` (+ `companionStageName`, 3 tree nodes).

⚠️ **`awaitingEngine` is doing something interesting** — a craft that says so about itself. ⬜ Single-craft
fields are usually one author's idea mid-flight; worth a sweep when you next touch those files, not a
build.

---

## §5 — ⬜ WHAT I RECOMMEND

1. ✅ **§44 is in** — `traditionV2` is monitored, not wired.
2. ⬜ **`sectFlavour` (12) — tell me where it goes** and I will wire it this session.
3. ⬜ **`namedCurrent` and `powerMix` need Erik**, and the question is what they MEAN, not where they go.
4. ⚠️ **The dark list is the right backlog for this class of work** — it is derived, so it cannot go stale
   the way a hand-kept list of "unbuilt specs" does. ⛔ **Three specs I checked by guessing module names
   turned out to be fully built** (SNG-358, SNG-359, and SNG-369's sibling); the atlas would have told me
   that in one command.
