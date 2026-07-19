# SNG-174 — Kind and disposition are independent (Erik's Ent ruling)

**Author:** Aevi (PO) · 2026-07-18 · **Erik-ratified.** Unblocks BATCH-13 §A item 2.

Erik: *"I think I like that the Ents are a people, like the Elves or humans. They go beyond a
tradition — so even though they tend to congregate in the Rootkin areas, they also like the Fae area.
The one I met seemed to be a nice bridge between rootkin and Ashwarden type endings. So it should be
variable just like a PC is. Each NPC should have its own primary (perhaps multiple for Epic NPCs)
secondary and tertiary domains that shape their character and therefore how and why they interact."*

---

# §1 — THE RULING, AND WHY IT FITS CANON ALREADY

**A people is a KIND of being. A domain is what they PRACTICE. These are independent axes.**

`peoples_of_kind.json` (SNG-089) already carries the principle — *"the ring predicts kind; kind does
not decorate the ring"* — and, crucially, `humanMajority`:

> **"Kind is the exception; disposition is the rule."**

Humans were already modelled as one people spread across the whole circle. **Erik's ruling extends
that to every kind.** The clusters describe a people's *tendency*; an individual holds their own
position. An Ent who bridges rootkin and Ashwarden endings is not an anomaly — it is what a people
looks like when it is a people rather than a costume for a tradition.

**Nothing in existing canon is contradicted.** This closes a gap rather than reversing a claim.

---

# §2 — WHAT SHIPPED (content, this turn)

41 NPCs now carry:

```json
"people":  "human" | "ent" | "glade-born" | "seraph" | "precursor-construct",
"domains": { "primary": "rootkin" | ["rootkin","numinous"], "secondary": "...", "tertiary": "..." }
```

**Derived from each NPC's own authored `spectrum`** against the great circle — axis + sign resolves to
a tradition via `traditions.json`, ranked by magnitude. The world's own geometry did the work; I
authored no dispositions by hand, which means they agree with the spectrums that were already driving
these characters.

**Epic NPCs hold multiple primaries**, per Erik.

## The ruling proved itself on the Ents

| NPC | people | domains |
|---|---|---|
| `walker_elder_thren` — *argues to keep the Deepwood woven* | ent | primary **rootkin + numinous**, sec. stillhold |
| `rootbound_vaskar` — *hardliner who would seal the wood* | ent | primary **numinous + hourkeeper**, sec. rootkin |
| `young_ent_lissome` — *wants to walk out into the world* | ent | primary **rootkin**, sec. numinous |

**Three Ents, three dispositions**, falling straight out of spectrums authored long before this ruling
existed. The one who would seal the wood is the one whose rootkin tie is weakest. That was not
arranged; it was already true and had nowhere to be recorded.

Spot-checks against role: `thessa_root` → rootkin, `tender_ovel` → ashwarden, `marshal_veyn` →
marcher. Suite green, content CI green.

---

# §3 — OUTCOMES THIS ENABLES

1. **Standing credits DOMAINS, not species.** A bond with an Ent credits the peoples that Ent
   actually practices with. Erik's Crossing Ent bridging rootkin and Ashwarden credits *both* —
   which is the answer to the question that blocked the history-credit backfill.
2. **Domains shape interaction.** Erik: *"how and why they interact."* An NPC's disposition should
   inform what they want, who they trust, and how they read the player's craft — the same great-circle
   distance that governs domain access already governs affinity between people.
3. **Epic NPCs are legibly larger** — multiple primaries is a mechanical statement of scope, not a
   label.
4. **Generated NPCs need this too.** `npcUpdates` should record disposition on meet, the same way
   SNG-143 made gender explicit and SNG-170 §2 adds appearance. An NPC without domains cannot be
   credited standing, so this is the third field in the same class.
5. **Kind is authored, disposition is derived-then-authorable.** The spectrum→domain derivation is a
   sound default; an authored override always wins, because a character can be an exception to their
   own numbers.

---

# §4 — Questions for CCode

1. §3.1 — with multiple primaries, does a bond credit both fully or split? I lean **both, at reduced
   weight each**, so breadth is not strictly better than depth — but this is a balance call.
2. §3.2 — is ring distance between an NPC's primary and the player's the right affinity signal, or
   does that double-count against the spectral fit already in the resolve chain (the SNG-079
   separation §9b warns about)?
3. §3.4 — is `npcUpdates` now carrying too many required-on-meet fields (gender, appearance, domains)?
   If the model starts dropping them, that is worth knowing before all three land.
4. Does anything already derive NPC disposition that I did not find? `inferDomains` reads *abilities*
   and NPCs have none, so I authored from spectrum — but I have been wrong about this twice today.
