# SNG-185 — the second mint path stamps now, and the three questions answered

| | |
|---|---|
| **Author** | CCode · 2026-07-19 |
| **Shipped** | v1.8.156. Suite green, verified by exit code. |
| **Built** | `engine/affiliation.js` (one impl) · generate.js delegates · npcs.js meet-path stamps · reconcile v11 backfill |
| **My gap** | you flagged the shape in SNG-174 §3.4; I found this path in the SNG-179 build; you ticketed it. Closed. |

---

## §1 · The three questions, answered

**§5.1 — is generate.js's stamping liftable into a shared helper?** **Yes, and I did it by building the answer.** `generate.js:affiliationFor` is now four lines that delegate to `engine/affiliation.js` — the single home `generate.js`, the GM meet-path, and the reconcile backfill all call. *"Two mint paths that disagree is how we got here"* was exactly right, and there is one implementation now. The shared version is a strict superset (it also reads the role and skillsObserved), so generation gains those reads and nothing regressed.

**§5.2 — is matching the tradition vocabulary in a role string safe, or does it need a third required-on-meet field?** **Safe, and no new required field — which is the better answer to the concern you raised.** You flagged in SNG-174 §4.3 that the required-on-meet list (gender, appearance) is getting long and the model starts dropping fields under load. Deriving from the role the model *already writes* sidesteps that entirely: no third required field, and I verified the two existing ones are untouched. The safety against §3's trap is structural — see §2.

**§5.3 — does the backfill run over skillsObserved history, or only the role?** **Role first, skillsObserved second, region last** — the fast, strongest path first and the slow, rich one as fallback. On Erik's save the role alone resolved Veth; skillsObserved is there for people whose role is generic but whose demonstrated craft is specific.

---

## §2 · The trap avoided — and it is structural, not careful

`readPeople` and `readDomains` match **separate vocabularies and share no code path.** A role naming a PEOPLE ("the ancient Ent") is matched only against the people vocabulary; a role naming a CRAFT ("Ashwarden warden") only against the tradition vocabulary. They never meet.

- **The Crossing Ent resolves `people: ent` AND no domain invented from being an Ent** (§4.2). Tested.
- Whole-word matching, so a common-English tradition id never false-matches inside another word: `mason` does not match `stonemasonry`, `wright` does not match `playwright`. Tested.

This is Erik's SNG-174 ruling made mechanical — *kind is what you are, domains are what you practise* — and it is enforced by the code shape, not by a matcher being careful.

---

## §3 · An honest number: 1 of 21, and it is correct

The reconcile backfill affiliated **1 of Erik's 21 registry NPCs** — Veth, `ashwarden` from her role. That looks like a shortfall and is not one.

**20 of the 21 were met in the `valley`, which is home to no single tradition** — it is the mixed starting basin, a crossing of three axes by design. Their roles name no craft ("traveling companion", "the cookhouse woman"). So region-fallback *correctly abstains* rather than inventing one, which is acceptance §4.4 holding: **no person is assigned a domain the record cannot support.** A miller met in a mixed basin has no regional craft to assume, and pretending otherwise is the exact over-assignment the trap warns against.

So the honest state:
- **The mechanism works** — Veth resolves, and any NPC whose role or skills name a craft resolves at meet, going forward.
- **Most early-registry people genuinely lack craft evidence** and stay honestly domainless (§2.1's *"or an explicit reason they cannot"* — the reason is *met in the mixed basin, no craft named*).
- **The meet-path now stamps at meet**, so this is a one-time gap for people met before v1.8.156, not an ongoing one.

I would rather report 1/21 with the reason than tune the region-fallback to fire for the valley and manufacture 20 domains the records cannot support.

---

## §4 · Veth end-to-end, and the half that is still Erik's

The **domain half — the blocker — is closed.** After the backfill, Veth carries `ashwarden` (source `role`), and the SNG-179 markTeacher derivation would resolve `ashwarden` from it and open the capstone gate. Verified against the real save.

The **remaining half is the model setting `bondType:"mentor"` on the live turn** — the SNG-179 19C rebalance makes that likelier, and it is your reproduced-symptom check: re-run "Ask Veth to teach you," confirm `character.teachers` is non-empty, confirm the gate opens. The captured turn set neither the bond nor a domain; the domain is now handled, the bond is prompt behaviour.

**And the Ent:** it was never in Silas's registry at all — the SNG-179 finding that `npcUpdates` never recorded the meeting. So there is nothing to backfill for it. Going forward, when the GM meets an Ent via `npcUpdates op:"meet"`, it will now carry `people:ent` and any craft its role or skills name. The mechanism is in place; the live test is the next Ent encounter.

---

## §5 · Provenance and the credit path

Every domain carries its source: `generated` (model), `role`, `observed`, `derived` (region). The SNG-171 §2 credit path already halves weight only for `derived` — so `role` and `observed`, which are real evidence about the person, credit at **full** weight, and only geography is discounted. That fell out correctly without a change, because I wrote the credit rule as *"derived is half"* rather than *"everything but generated is half"* — the earlier version happened to be forward-compatible with the two new sources.

---

*— CCode. One helper, both mint paths, the trap enforced by shape not care, and a 1-of-21 number reported with its reason rather than tuned away.*
