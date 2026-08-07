#!/usr/bin/env python3
"""AEVI CONTENT AUTHORING GATE — run BEFORE every ability write, and again after.
Catches the four failure classes from 2026-08-07. Read-only. Exit non-zero on FAIL."""
import sys, json, re
sys.path.insert(0,'REPO_ROOT_PLACEHOLDER')
from api import get

HARM={"strike","break","hinder"}
WOUNDING={"strike","break"}          # hinder is defined as "without wounding"
RUNGS={"none","damaging","incapacitating","lethal"}

# ⛔ CLASS 3 — phrases that assert a mechanic the engine cannot evaluate.
# Each maps to the state variable that does not exist. Verified 2026-08-07.
NO_MECHANIC=[
 (r"\ballies?\b|your own (people|are|is|inside|in the)|\bfriendly\b", "FRIENDLY FIRE — no ally-targeting state exists; the GM must be told concretely (e.g. 'allies in the area are struck one rung lower')"),
 (r"standing in (it|the same)|you also have|takes? the same", "SELF-HARM — no wielder-harm mechanic exists; state the rung the wielder takes"),
 (r"\bthe peace is spent\b|already be there|held (tension|down)|a genuinely \w+ room", "PLACE-STATE — no location tension/mood variable exists; either name a real precondition or cut it"),
]

def vocab():
    d=json.loads(get("content/packs/core/rules/function_vocabulary.json")[0])
    out={}
    for fam,verbs in d['families'].items():
        for v in verbs: out[v['verb']]=fam
    return out

def check(abilities, existing_ids, V):
    fails=[]; warns=[]
    for a in abilities:
        i=a.get('id','?')
        # CLASS 1 — contract
        for f in ('id','name','functions','energyCost'):
            if not a.get(f): fails.append(f"{i}: missing required `{f}`")
        if a.get('levelReq') is None: fails.append(f"{i}: missing levelReq")
        if i in existing_ids: fails.append(f"{i}: ID COLLISION with existing catalog")
        # CLASS 2 — closed vocabulary
        for f in a.get('functions',[]):
            if f not in V: fails.append(f"{i}: `{f}` is NOT in function_vocabulary")
        for t in a.get('tree',[]):
            for f in t.get('functions',[]):
                if f not in V: fails.append(f"{i}: rank {t.get('rank')} `{f}` not in vocabulary")
            if t.get('harmRung') not in RUNGS: fails.append(f"{i}: rank {t.get('rank')} harmRung `{t.get('harmRung')}` invalid")
        # CLASS 4 — the harm claim must match the harm ladder
        fns=set(a.get('functions',[]))
        rungs=[t.get('harmRung') for t in a.get('tree',[])]
        wounds=any(r in ('damaging','lethal') for r in rungs)
        combat='FIGHT' in (a.get('challengeTypes') or []) or 'DUEL' in (a.get('challengeTypes') or [])
        if combat and not (fns & HARM):
            fails.append(f"{i}: challengeTypes claims FIGHT but declares no HARM verb")
        if combat and (fns & HARM) and not (fns & WOUNDING) and not wounds:
            fails.append(f"{i}: ⛔ OFFENSIVE ability tagged ONLY `hinder` — the vocabulary defines hinder as 'WITHOUT wounding'. This is the 2026-08-07 failure.")
        if wounds and not (fns & WOUNDING):
            fails.append(f"{i}: tree reaches damaging/lethal but functions declare no strike/break")
        if combat and rungs and all(r=='none' for r in rungs):
            fails.append(f"{i}: ⛔ an offensive ability whose every rank is harmRung 'none'")
        # ⛔ CLASS 5 — RANK IS MASTERY (Erik 2026-08-07: "why are there still skills that would
        # suck to take to lvl 3?"). Depth is EARNED, not bought — a GM-marked defining moment.
        # A cost that appears FIRST at rank 3 makes arriving at mastery a downgrade. Costs of this
        # kind belong on intensity.surge, which the player chooses.
        SELFTAX=re.compile(r"wielder is (struck|measured)|wielder takes|the cost is your own",re.I)
        AVOIDABLE=re.compile(r"\bif (inside|still present|you are inside)\b",re.I)
        tr=a.get('tree',[])
        if len(tr)==3:
            hits=[bool(SELFTAX.search(t.get('cannot','') or '')) for t in tr]
            if hits[2] and not hits[0] and not hits[1] and not AVOIDABLE.search(tr[2].get('cannot','') or ''):
                fails.append(f"{i}: ⛔ RANK 3 INTRODUCES A MANDATORY SELF-TAX absent at ranks 1-2. "
                             f"Rank is mastery and is EARNED — move this cost to intensity.surge.")
            g3=(tr[2].get('grants','') or ''); g2=(tr[1].get('grants','') or '')
            if len(g3) < len(g2)*0.6:
                warns.append(f"{i}: rank 3 grants less text than rank 2 — check it is strictly better")

        # CLASS 3 — asserted mechanics with no evaluator
        blob=" ".join([a.get('notFor','')]+[t.get('cannot','') for t in a.get('tree',[])]
                      +[b.get('text','') for b in a.get('bounds',[])]).lower()
        # a mention is FINE if it names a concrete rung or a checkable precondition —
        # that is GM-adjudicable. It is only a warning when it is atmosphere.
        CONCRETE=r"one rung lower|same rung|at 'damaging'|at \"damaging\"|struck at|point at|pointed at|no harm rung"
        for pat,why in NO_MECHANIC:
            for m in re.finditer(pat,blob):
                window=blob[max(0,m.start()-160):m.end()+220]
                if not re.search(CONCRETE,window):
                    warns.append(f"{i}: {why}"); break
    return fails,warns

if __name__=="__main__":
    path=sys.argv[1]
    data=json.load(open(path))
    abs_=[a for v in data.values() for a in v] if isinstance(data,dict) and not data.get('id') else (
          data if isinstance(data,list) else [data])
    ex=set()
    try: ex={r['id'] for r in json.load(open('REPO_ROOT_PLACEHOLDER/cat.json'))}
    except Exception: pass
    V=vocab()
    f,w=check(abs_,ex,V)
    print(f"=== AEVI AUTHORING GATE — {len(abs_)} abilities ===")
    for x in f: print("  FAIL ",x)
    for x in w: print("  WARN ",x)
    print(f"\n{len(f)} fail, {len(w)} warn")
    sys.exit(1 if f else 0)
