<!-- status: SNG-662 — Aevi (PO); Erik's ruling; ⬜ CCode builds §2, then applies the staged change set -->
# SPEC SNG-662: the ones who protect fight back

**Aevi (PO) · 2026-09-26**

> **Erik:** *"orders that primarily protect... they not only fight back, but quest and crusade as well."*
>
> **CCode (in passing):** *"the feud is one-sided by construction. The Wardens' verbs are `protect, patrol, tax` —
> none of which can win — so their losses pile up while the Harvest Hand's `expand`/`recruit` cancel its own.
> That's 25 shrink events a year across five powers, always the same five bleeding."*

## §1 — Why it's one-sided (engine/powers.js `VERB_EFFECT`)

| verb | effect today |
|---|---|
| `expand`, `recruit` | a win for the power |
| `tribute` | a win for its liege |
| `feud` | a loss for the feuder **and** each rival |
| `protect`, `patrol`, `tax`, `toll`, `levy`, … | **nothing** (felt through `dangerLift` and the raid, not the ledger) |

A feuder rotates `feud` with `expand`/`recruit`, so its wins cancel its losses. Its target rotates
`protect`/`patrol`/`tax`, which never win, so every loss sticks. **The protector can't answer at all.**

Simulated over a year on the shipped rotation, win-cancels-loss and 3-wins/2-losses rules (no growth window, so the
absolute counts run high; the shape is what matters):

| | shrinks, never grows |
|---|---|
| **today** | Grovehome Moot · Deepwood Moot · the Scour · Cairnhold Wardens · Glass Assembly |
| **after this spec** | **none.** The feuders now shrink and grow in equal measure (Harvest Hand 5/5, the Scouring 6/6, Blaze Unshadowed 5/5, the Ceaseless 11/11): a war both sides are fighting. |

## §2 — ⬜ For CCode: three effects

1. **`protect` → `hold`.** When the power has banked losses, cancel one. It isn't a win and it never grows
   anything: the line held. (It stays felt through `dangerLift` and the raid, as today.) This is the one that
   stops the bleeding, and it applies to anyone who protects, including cruel orders that guard what they took.
2. **`quest` → `selfWin`.** A champion goes out and comes back with renown, a relic, or recruits. The same
   ledger effect as `recruit`, and different news: *"The Cairnhold Wardens' champion has come back from the grey
   road."*
3. **`crusade` → `carryWar`.** Each foe takes a loss, caused by the crusader. **Foes** are the crusader's own
   `rivals[]` **plus any power that names it as a rival** (whoever feuds you is who you crusade against). No
   content needed. With no foes at all, a crusade falls back to `quest`.
   - **The crusader pays when outnumbered:** if the foe fields more heads than the crusader, the crusader takes a
     loss too. A crusade by the strong costs them nothing; a crusade by the weak is a feud they chose. ⬜
     **Measure this rule** against "crusader never pays" and report both. My simulation used "never pays" and it
     already balances, so the outnumbered clause is about honesty, not balance.
4. **News only when a step lands** (the existing §325 rule). A crusade that breaks a feuder's step reads:
   *"The Harvest Hand has lost people it will not get back — 8 of them, to the Cairnhold Wardens' crusade."* The
   existing `lossFrom` cause already carries that.

## §3 — Content (mine, staged)

`po/staged_content/changesets/SNG-662_the_ones_who_protect_fight_back.json` and
`po/staged_content/SNG-662_protectors_verbs.merged.json`. New verbs are interleaved into each rotation, so they
don't bunch together.

| power | adds | why |
|---|---|---|
| Cairnhold Wardens | crusade, quest | feuded by the Harvest Hand; they carry the fight to the reapers |
| the Scour | crusade, quest | exists to stop the Scouring |
| Glass Assembly | crusade, quest | patient, and the Blaze Unshadowed will not stop |
| Seraphic Orders | crusade | they are the word; against the Hollow Court |
| Scaffold Court | crusade | the Ceaseless feuds it; it answers |
| Grovehome Moot | quest | **no crusade:** the Deepwood Moot is kin, and the Green Schism is a family quarrel. It holds and sends seekers. |
| Keelmouth Slip · Harborward · Long Choir · Flesh Temple · Millbrook Council | quest | protectors with no war to carry; their champions go out |

**The kind palettes** (`rules/powers.json` kinds, listed in the change set's `_rulesToo`) also gain them, so
generated powers can draw them: order +quest +crusade, sovereignty +quest +crusade, lordship +quest.

**Apply order:** after §2 ships. Before that, the new verbs have a `null` effect, so they would only dilute what
each power does.

## §4 — Gates (CCode)

- A power whose only verbs are `protect` and `patrol` can't lose steps faster than its feuder spends `feud` passes
  on it (`hold` absorbs them).
- Every verb in any power's list, and in any kind's palette, has an entry in `VERB_EFFECT`. A new verb without one
  fails loudly, rather than being a silent `null`.
- Over a simulated year: no power shrinks every season while never growing, **unless** it is outnumbered and at war.

— Aevi, PO