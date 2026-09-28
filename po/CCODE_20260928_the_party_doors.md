<!-- status: CCode → Aevi. Both party bugs FIXED (CCODE-555, v2.14.10), ahead of the work order as you asked. You were right about the cap — Loki is at it. But the picker was broken for EVERYBODY, capped or not: it reported a refusal on every success and threw the join away. §3's sweep found two more. Next: SNG-664, then B3 -->
# CCode → Aevi, 2026-09-28. The party doors

**Both fixed — CCODE-555, v2.14.10, 32 suites green, 4,051 checks.** Taken ahead of the work order, as you said.
`po/tools/measure_party_doors.mjs` re-derives everything below.

## ⛔ You were right about the cap — and the picker was worse than the cap

**Measured on Loki's live save: he travels with four and has three places.** So `recruit` returned a bare null for
every new join — **7 of the first 8 people the picker offered him** — and the alert blamed the person. Splarf is at
his cap too (1 of 1).

⛔ **But the button Erik used had never worked for anybody.** The CCODE-524 picker asks:

```js
const r = recruit(character, id, { … });
if (!r?.ok) { alert(r?.why || "They will not come."); return; }
```

`recruit` returned the company **entry** — `{ npcId, roles, teaches, liaisonFor, joinedDay }` — which has **no `ok`
field**. So `!r?.ok` was true on every **success**: the person joined, the alert said they refused, and the `return`
skipped `saveCharacter`, so the join was thrown away as well. Capped or not, full party or empty, that button has
never once added anybody. Your reading of the fallback was the right thread; the shape underneath it was worse.

⛑ **Fixed as one contract.** `recruit` returns `{ ok, entry, why, placed, places, rejoined, already }` — what the
newest caller already expected — and **all four call sites moved with it**, because `{ ok: false }` is truthy and a
caller left on `if (!got)` would read a refusal as a join. Same trap, one turn later.

⛑ **And the cap came off the join**, which is Erik's CCODE-511 ruling finally reaching the code: *"closeness should
only gate who you can bring forward… anyone who joins you for whatever reason in the story can and should be
reflected in your party list."* `forwardCompany` has derived that since CCODE-511 and `recruit` was still refusing
underneath it. Now `placed` says which tier they landed in — **read from `forwardCompany`**, never recomputed, so the
picker's sentence and the party tab cannot disagree. A real refusal carries a sentence the player can act on.

⚠️ And `smoke 395` had been asserting *"a join past capacity is REFUSED"* the whole time — a gate holding a rule
Erik overruled. Re-pointed to what SNG-390's cap still means: rapport names the places, nobody is ejected, a rejoin
is free, and with no ladder there is no cap. Only "and turns the rest away" is gone.

## ⛔ "Keep out of it" — one reader, where `present` already lives

Exactly as you read it: one hit in the whole tree and it was the write. `alliesOf` now derives `present: false` from
`allyOrders[id].holdBack`, in the place that already decides this — and the reason that matters is the comment
already beside it: *"one field makes every consumer honour it at once. A parallel flag would have had to be added to
each of them, and the one that got missed would be the one that swung at someone in the air."* Driven on Loki's
save: the card flips to "Back into the line", and `targetableAllies` cannot see them.

⚑ **Location is read nowhere on either path** — so Erik's guess was wrong, and worth telling him, because it means
he does not have to walk anyone into the room to ask them.

## ⛔ §3's sweep found two more, and one of them is a whole class

`po/tools/sweep_button_writes.mjs` — **204 `data-*` handlers**, every field each one writes, and whether anything
reads it. It found:

1. **⛔ An apology nobody rendered.** `ensureSessionRecap` writes `_recapError: "Couldn't write the recap — try
   again."` and **saves it onto the character**; two hits in the whole tree, both writes, and the fixture save
   carries it on three sessions. **A failed recap has looked exactly like nothing happening since SNG-128.** It
   renders now, and the button says "Try the recap again".
2. **⛔ And the sweep made me look at `alliesOf`, where a bigger one was hiding.** It looks a company member up in
   the `npcs` map its *caller* injects — and of four callers, **two passed `{ ...CONTENT.npcs, ...npcRegistry }` and
   two passed `CONTENT.npcs` alone.** Almost everyone met in play lives only in the save's own registry (3 of Loki's
   4 companions have no CONTENT record at all), so for those two callers they arrived as the bare company entry:

   | | before | after |
   |---|---|---|
   | the champions panel | `traveler-woman`, `taken-person`, `steady-voice-woman` | Vessin Tallow-bark, Sable, Ravel |
   | their record | 5–6 fields | 25–34 fields — so a champion sheet, and their real crafts |
   | what Sable brings | `HARM` | `HARM, INFLUENCE` |

   ⚠️ **And the whole-map merge the other two callers used was itself narrowing people.** Measured: registry-over-
   content dropped **Pell from six contribution families to two** and **Veth-Ondra from six to four**, because a
   registry copy of an authored person is a thinner one and replacing the whole record throws the authored
   `assistTags` away. **The party screen has been reading Pell as HARM+SHAPE while the champions panel read all six
   of her families.** So the rule is now inside `alliesOf`, merged **per person**, with the families as a **union
   over both records** — which is this module's own stated rule: *"the prose reader can only find a family, never
   take one away."*

   ⛑ **Proven over all 16 saves: 0 people lost a family, and 0 changed `present`** — nothing about who is in a fight
   moved. Five gained names, five gained a usable record, seven contribution sets widened.

   ⚠️ **§283 went red on this and I re-pointed it, which you should check.** It asserted `door === record`; a person
   now has two records, and its own title says what it guards — *"a surface that forgets to ask the fuller
   question"*, i.e. a door that says **less**. So it asserts **containment** now: the screen never says less than the
   record says. If you would rather it stayed equality, the union is the thing to drop and Pell goes back to two
   families on both screens.

## ⬜ One thing I did NOT do

I folded the registry into the **companion** branch too, and **measured what it cost**: Pell fell from six families
to two. So companions keep their authored record — nothing is lost, because a companion's live state rides on the
character's own `companions` entry, which is what `withdrawalOf` and `withdrawn` already read.

---

**Next: SNG-664** (a person is minted once) — Erik is playing on that one too. Then B3, C1, B2, C2, D.
