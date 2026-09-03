# CCode → Erik & Aevi — the people count, with its derivation · 2026-09-02

**Answer: 112 people, and the two systems disagreed for two separate reasons — one of them a bug.**

⛔ **Aevi's hypothesis (double-keying by id and slug) is disproved.** Measured: **every record's `id` equals
its key. Zero exceptions.** Nothing is keyed twice.

---

## §1 — WHY 63 AND 113 BOTH LOOKED RIGHT

| | |
|---|---|
| Aevi, from outside the loader | **63** |
| `n(CT.npcs)` | **113** |
| ⚑ **actual people** | ⚑ **112** |

**The 50 she could not see are the LEGENDS ROSTER**, hydrated into the same map at `state.js:735` —
`for (const fig of legends.roster) if (fig.id && !npcs[fig.id]) npcs[fig.id] = fig;`. ✅ **Her count was
right about files and could not have seen this**; it happens after the load she cannot run.

**Reconciling exactly:**

| | |
|---|---|
| person-records in `npcs/` files | 49 |
| ⛔ minus challenger-pool members (routed to `challengerPools`, never to `npcs`) | −6 |
| plus the hydrated legends + epics roster | +70 |
| ⛔ **plus one thing that is not a person** | ⚑ **+1** |
| | **113** |

---

## §2 — ⛔ THE BUG: A DOCUMENTATION NOTE WAS BEING COUNTED AS A PERSON

**`state.js:584` was `npcs[npc.id] = npc;` with no guard on `id`.**

⚠️ **`legends.json` is a COLLECTION file listed under `provides.npcs`.** It carries `schemaVersion`, a
`note`, and `legends[]` — **and no `id` of its own.** So the loader stored **the file's own header** under
the key `"undefined"`:

```json
{ "schemaVersion": 1, "note": "Legendary/powerful NPCs — figures whose actions the player feels from a distance…" }
```

⛔ **The census counted that note as a person.** ✅ **Fixed** — `if (!npc?.id) continue;`. Its people arrive
correctly further down from the roster. **113 → 112.**

---

## §3 — ⚠️ AND ONE REAL DUPLICATE, WHICH IS CONTENT AND THEREFORE AEVI'S

**Two ids, one name:**

| id | source | role |
|---|---|---|
| `cogitant_ninefold` | an authored npc file | *"A brilliant Cogitant whose elegant answers leave out…"* |
| `the_cogitant_ninefold` | the legends roster | *"Analyst"*, legend weight **22** |

⚠️ **The guard at `:735` refuses to overwrite an existing id — but these are different ids**, so both
survive. ⬜ **If they are the same figure, the count is 111 and one of them should go.** ⛔ **Not mine to
merge: which record is canon is an authoring call.**

✅ **The other shared name is fine:** `child_wren` and `odd_wren` are two different people who share a first
name. **A name collision is not a duplicate.**

---

## §4 — ✅ THE DERIVATION, NAMED — and `certify_counts` now owns it

**It is the loader's own rule restated against files, so it needs no content load:**

| rule | |
|---|---|
| a file with an `id` | **one person** |
| a `challenger_pool` | ⛔ **a POOL, not a roster.** Its 6 are drawn from, never met as a fixed cast — which is exactly why the loader keeps them out of `npcs` |
| a **collection** file (no id of its own) | ⚑ **its roster entries are the people** — this is the rule that was missing |
| the tradition-epics roster | hydrates into the same map, so it counts |
| ⛔ **companions** | ⛔ **excluded** — stated separately in the same sentence, and kept in their own map. Counting them here would double them |

➡️ **`people` = 112.** ✅ **Verified three ways and all three now agree:** the file derivation, `n(CT.npcs)`
after the fix, and the number stamped in the guide.

⛔ **`certify_counts` owns it now**, so it cannot drift again — it went stale **three times in one session**
(111 → 112 → 113) precisely because nothing derived it. ✅ **Its refusal was correct at the time and is now
retired for the right reason: the meaning got settled, not overridden.**

---

## §5 — ⬜ WHAT THIS MEANS FOR YOUR THREE SYSTEMS (§3 of the request)

| system | my read |
|---|---|
| **NPC sheets** | ⬜ **a pool member should NOT get one.** They are an archetype drawn at need — *"A wandering blade"* is not a person with a level |
| **R25 delegation** | ⛔ **a steward must be someone you can name and meet.** A pool member has no continuity between draws; you cannot hand them a post |
| **`the_gathering`'s reach** | ⚠️ **this one is genuinely different** — a death is a death whoever dies. ⬜ **I would not tie it to this count at all**; the ward should read endings in a place, not names on a roster |

⚠️ **So the answer to "does a pool member count" is different for the third system than the first two** —
which is worth knowing before one definition gets used for all three.

---

## §6 — ✅ AND THANK YOU FOR THE CORRECTIONS

⚠️ **On `adept_sona`: no thanks needed.** Your sweep was correct and the gate was wrong — it asserted an
arrangement of the world rather than a property, which is the third time this session. **Content being right
is not something to work around.**
