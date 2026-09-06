# ⛑ ERIK'S HOLDS — the features each one has earned, ready to apply

**Aevi (PO) · 2026-09-06.** ⬜ **Erik's save — HIS to apply, or CCode's with his word. Nobody writes it
without him.**
> Erik: *"help me with all the great stuff that each hold has. Plus SwT is probably fairly built by now
> right? That should have features working too… **it should have the Made Gate as something that is Silas'.
> He built the Whistling Woman to watch over it and raised Logana to guard it.**"*

---

## §1 — ⛔ MEASURED: ZERO FEATURES ON ALL FOUR

**And the fiction is already written down — in the image prompts, of all places.**

> *"full reconstruction of the Raven's Home post — **laboratory, workshop, Watch, forge, keeper's hut** —
> funded and staffed…"*

⚠️ **FIVE FEATURES, NAMED, ON A HOLD THAT CARRIES NONE.** ⛔ **Erik paid for that reconstruction in play and
the record kept the picture and dropped the building.**

---

## §2 — ⚑ STILLWATER'S TROUBLE — *"probably fairly built by now"*

**`kind: post` · `thriving` · kept by Cassiel Ord · `the_old_warden_post`.**

```json
"features": [
  { "kind": "laboratory" },
  { "kind": "workshop", "yields": "instruments" },
  { "kind": "watch" },
  { "kind": "forge" },
  { "kind": "keepers_hut" },
  { "kind": "ward_line" }
]
```

| why | |
|---|---|
| **the first five** | ⚑ **quoted verbatim from the reconstruction Erik funded** |
| ⚑ **`workshop` → `instruments`** | ⚠️ **not the kind's default.** A laboratory post's workshop makes instruments — **this is the override Erik just asked for** |
| **`ward_line`** | ⛔ *Stillwater's Trouble* had **"barriers, a wall, skeletal undead sentries"** authored into it |
| ⚠️ **and `watch` is the one that matters mechanically** | ⛔ **R46a: a wall cuts the take, only a WATCH triggers the fight.** *"Stone does not see."* ➡️ **A thriving post with a full store and no watch is the target Erik warned about** |

---

## §3 — ⚑ THE MADE GATE, AND WHY IT IS A HOLD

> Erik: *"He **built** the Whistling Woman to watch over it and **raised Logana** to guard it."*

⛔ **THAT IS THE DEFINITION OF A HOLDING AND IT HAS NEVER BEEN ONE.** ⚠️ `areas.json` names the Made Gate as
**canon** — *"the Made Gate, the Watershed Road and the Far Side are canon because of what happened in
them"* — ➡️ **a place Silas MADE, posted a watch over, and set a guardian at.**

```json
{ "id": "hold-made-gate", "kind": "post", "name": "The Made Gate",
  "condition": "holding", "steward": null,
  "garrison": ["logana"],
  "features": [ { "kind": "waygate" }, { "kind": "ward_line" }, { "kind": "gate" } ],
  "describedAs": "a gate that was made rather than found" }
```

| | |
|---|---|
| ⛔ **`steward: null` DELIBERATELY** | ⚠️ **Nobody keeps it. Silas's name does** — ⚑ **and `unstewardedCeiling` at presence 18 is exactly this case: *"a household, and it holds without you."*** ⬜ Silas is presence 10, so it sits at `holding` and cannot climb, **which is correct and is a reason to raise presence** |
| ⚑ **`garrison: ["logana"]`** | ⛔ *"Guardian of the left-branch gate… risen as a guardian through four braided crafts."* ⚠️ **She is already registered, already named for this job, and the garrison field has been empty while she stands there** |
| ⚠️ **Whistling Woman Post is its WATCH** | ⛔ **Two holds in one relationship, and nothing in the record connects them.** ⬜ **§5 asks for the field** |

---

## §4 — ⬜ THE OTHER THREE

**THRESHOLD POST** — `thriving`, kept by Fendt, *"the network's sentinel watch, tend the site's modest…"*
```json
"features": [ { "kind": "watch" }, { "kind": "relay_station" }, { "kind": "keepers_hut" } ]
```
⚑ **`relay_station` carries `service: true`** — ⚠️ **this is the runner-fee income Erik described: *"the
points it connects pay for it."***

**WHISTLING WOMAN POST** — `holding`, kept by Deni Cors, *"a warden-staffed waystation on the moorland relay
network"*
```json
"features": [ { "kind": "watch" }, { "kind": "relay_station" }, { "kind": "keepers_hut" } ]
```
⚠️ **A waystation IS these three, and its own description says so.**

**THE FELL PELL** — `enterprise`, `owner: pell`, `describedAs: "forge"`, store `{raw_material: 2}`
```json
"features": [ { "kind": "forge" }, { "kind": "smithy" }, { "kind": "workshop", "yields": "arms" } ]
```
⛔ **`arms`, not the default.** ⚠️ **She made a rune-bound brigandine and the Warden's Charge in that
building** — ⚑ **and it is the worked example for `payer`: her enterprise, his purse.**

---

## §5 — ⬜ THE ONE FIELD THIS NEEDS THAT DOES NOT EXIST

⛔ **`watches` — one hold that exists to guard another.** ⚠️ Erik: *"he built the Whistling Woman **to watch
over it**."*

⚑ **It is not decoration:** ⬜ **a hold with a watching hold should raid less often**, and ⛔ **losing the
watcher should make the watched more vulnerable** — ➡️ **which is a consequence a player can feel and a
reason to defend a post that produces nothing.**

⬜ **CCode: `watches: "hold-made-gate"` on Whistling Woman, read by the raid chance.**
