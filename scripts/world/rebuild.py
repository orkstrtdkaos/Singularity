#!/usr/bin/env python3
"""scripts/world/rebuild.py — SNG-391 §3. THE REBUILD CHAIN, AS ONE SCRIPT.

⛔ WHY THIS FILE EXISTS. The world was regenerated eight times during authoring, and each
time the derived layers had to be rebuilt. Doing that BY HAND caused, in order:
  - the base globe and the detail patch drawing different worlds (a visible seam)
  - region jump targets landing in open ocean, twice
  - four settlements standing inside lakes
  - a hypsometric scale keyed to a stale elevation range
  - the world flooding to 32% land after a threshold retune measured on too coarse a grid

Every one of those is a step someone forgot. A script cannot forget.

RUN THIS after ANY change to scripts/world/terrain.mjs or to genparams.json.
Order matters; see the spec. CCode: port to node and gate it (SNG-391 §4).
"""

#!/usr/bin/env python3
"""SNG-391 §3 — the rebuild chain, in order, as ONE script.
Every previous regression came from running these by hand and missing a step."""
import json, math, sys, base64, os, re
from collections import defaultdict, Counter
sys.setrecursionlimit(30000)
sys.path.insert(0,'/home/claude/sing'); os.chdir('/home/claude/sing')
from api import *
W,H=720,360
T=open('B_TYPE.bin','rb').read(); E0=open('B_ELEV.bin','rb').read()
P=json.load(open('BPTS.json')); pos={p['id']:(p['la'],p['lo']) for p in P}
AUTH=json.load(open('WATERAUTH.json'))['authored']
sub=json.loads(get("content/packs/core/rules/the_substrate.json")[0])
NF=sub['naniteField']['byRegion']; BASE=sub['substrateDensity']
BLIST=json.load(open('BLIST.json')); BIDX={b:i for i,b in enumerate(BLIST)}
NB=[(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
N8=[(-1,-1),(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1)]
def K(j,i): return j*W+(i%W)
def ll(k):
    j,i=divmod(k,W); return (90-(j+0.5)*(180/H), -180+(i+0.5)*(360/W))
def idx(lon,lat):
    lo=((lon+180)%360+360)%360
    return min(H-1,int((90-lat)/180*H))*W+min(W-1,int(lo/360*W))
# ---- 4. biome / density / nanite ----
NST={'ordered':1,'wild':2,'clear':3}
BIOM=bytearray(W*H);DENS=bytearray(W*H);NAN=bytearray(W*H)
srcs=[p for p in P if p['src']]
land=sorted(E0[i] for i in range(W*H) if T[i]); p85=land[int(len(land)*0.85)]
for j in range(H):
    lat=90-(j+0.5)*(180/H)
    for i in range(W):
        k=j*W+i
        if T[k]==0: continue
        lon=-180+(i+0.5)*(360/W)
        if T[k]==3: BIOM[k]=BIDX.get('varies',0);NAN[k]=0;DENS[k]=128;continue
        bw={};rw={}
        for p in P:
            dl=abs(lon-p['lo']); dl=360-dl if dl>180 else dl
            d2=(lat-p['la'])**2+(dl*math.cos(math.radians(lat)))**2
            w=1/((d2+6)**1.6)
            bw[p['b']]=bw.get(p['b'],0)+w; rw[p['r']]=rw.get(p['r'],0)+w
        BIOM[k]=BIDX['mountain'] if (E0[k]>=p85 and 'mountain' in BIDX) else BIDX[max(bw,key=bw.get)]
        reg=max(rw,key=rw.get); NAN[k]=NST.get(NF[reg]['state'],0)
        d=BASE.get(reg,0.5)
        for s in srcs:
            dl=abs(lon-s['lo']); dl=360-dl if dl>180 else dl
            dist=math.hypot(lat-s['la'], dl*math.cos(math.radians(lat)))/57.3
            rw2=s['src'].get('radiusWorld') or 0.05
            if dist<rw2*2.5: d+=s['src']['delta']*math.exp(-(dist/rw2)**2)
        DENS[k]=max(0,min(255,int(max(0,min(1,d))*255)))
for n,a in [('B_BIOM',BIOM),('B_DENS',DENS),('B_NAN',NAN)]: open(n+'.bin','wb').write(bytes(a))
# ---- 5. hydrology ----
E=[float(x) for x in E0]
for lid,(kind,why) in AUTH.items():
    if lid not in pos: continue
    la,lo=pos[lid]; c=idx(lo,la); cj,ci=divmod(c,W)
    for dj in range(-5,6):
        for di in range(-5,6):
            j=cj+dj
            if not(0<=j<H): continue
            k=K(j,ci+di)
            if not T[k]: continue
            d=math.hypot(dj,di)
            if d<=5: E[k]=max(129.0,E[k]-9.0*math.exp(-(d/2.6)**2))
for _ in range(3):
    N2=E[:]
    for j in range(1,H-1):
        for i in range(W):
            k=K(j,i)
            if not T[k]: continue
            s=E[k]*2.0;n=2.0
            for dj,di in NB:
                m=K(j+dj,i+di)
                if T[m]: s+=E[m];n+=1
            N2[k]=s/n
    E=N2
for _ in range(6):
    ch=0
    for j in range(1,H-1):
        for i in range(W):
            k=K(j,i)
            if not T[k]: continue
            nb=[E[K(j+dj,i+di)] for dj,di in NB if T[K(j+dj,i+di)]]
            if not nb: continue
            lo2=min(nb)
            if E[k]<=lo2: E[k]=lo2+0.35; ch+=1
    if ch==0: break
order=sorted((i for i in range(W*H) if T[i]),key=lambda x:-E[x])
acc=[1.0]*(W*H); down=[-1]*(W*H)
for k in order:
    j,i=divmod(k,W); best=-1; bv=E[k]
    for dj,di in NB:
        if not(0<=j+dj<H): continue
        m=K(j+dj,i+di)
        if E[m]<bv: bv=E[m]; best=m
    down[k]=best
for k in order:
    if down[k]>=0: acc[down[k]]+=acc[k]
va=sorted(acc[i] for i in range(W*H) if T[i])
WA=bytearray(W*H)
for k in range(W*H):
    if T[k] and acc[k]>=va[int(len(va)*0.985)]: WA[k]=1
sinks=[k for k in range(W*H) if T[k] and down[k]<0 and acc[k]>va[int(len(va)*0.995)]]
sinks.sort(key=lambda k:-acc[k]); sinks=sinks[:30]
for s in sinks:
    lvl=E[s]+1.7; stack=[s]; seen={s}; WA[s]=2; n=0
    while stack and n<320:
        k=stack.pop(); n+=1; j,i=divmod(k,W)
        for dj,di in NB:
            if not(0<=j+dj<H): continue
            m=K(j+dj,i+di)
            if m not in seen and T[m] and E[m]<=lvl: seen.add(m);WA[m]=2;stack.append(m)
def n1(x,y): return math.sin(x*1.7+math.cos(y*1.3))*math.cos(y*1.1+math.sin(x*0.9))
KIND={'river':1,'lake':2,'marsh':3}
for lid,(kind,why) in AUTH.items():
    if lid not in pos or kind not in KIND: continue
    k0=KIND[kind]; la,lo=pos[lid]; c=idx(lo,la); cj,ci=divmod(c,W)
    if not T[c]: continue
    if k0==1:
        j,i=cj,ci
        for step in range(26):
            k=K(j,i)
            if not T[k]: break
            if WA[k]==0: WA[k]=1
            best=None;bv=1e9
            for dj,di in NB:
                if not(0<=j+dj<H): continue
                m=K(j+dj,i+di)
                if T[m] and E[m]<bv: bv=E[m];best=(j+dj,i+di)
            if not best: break
            j,i=best[0],best[1]%W
    else:
        r=4 if k0==2 else 5
        for dj in range(-r,r+1):
            for di in range(-r,r+1):
                j=cj+dj
                if not(0<=j<H): continue
                k=K(j,ci+di)
                if not T[k] or WA[k]: continue
                if math.hypot(dj,di)+0.9*n1((lo+di)*0.5,(la+dj)*0.5)<=r*0.72: WA[k]=k0
lowE=sorted(E[i] for i in range(W*H) if T[i]); q40=lowE[int(len(lowE)*0.40)]
for k in range(W*H):
    if not T[k] or WA[k]: continue
    j,i=divmod(k,W)
    if not any(WA[K(j+dj,i+di)] for dj,di in NB if 0<=j+dj<H): continue
    if max(abs(E[k]-E[K(j+dj,i+di)]) for dj,di in NB if 0<=j+dj<H)<=1.3 and E[k]<q40: WA[k]=3
# only the Sunken Choir is authored as SUBMERGED ('a pre-Transition amphitheatre, flooded').
# every other water-adjacent settlement stands on the shore.
for lid in ['archive_hollow','cairn_and_scour','millbrook','the_quiet_ground','the_wellspring_deep','wellspring','echo_river_crossing','greywater_stilts','waystone','thinwater','the_hollowing']:
    if lid not in pos: continue
    la,lo=pos[lid]; c=idx(lo,la); cj,ci=divmod(c,W)
    for dj in range(-2,3):
        for di in range(-2,3):
            j=cj+dj
            if 0<=j<H and WA[K(j,ci+di)]==2: WA[K(j,ci+di)]=0
open('B_WATER.bin','wb').write(bytes(WA))
open('B_ELEV.bin','wb').write(bytes(bytearray(max(0,min(255,int(round(x)))) for x in E)))
# ---- 6. vectors ----
def blobs(kind,minc):
    cells={k for k in range(W*H) if WA[k]==kind}; seen=set(); out=[]
    for st in cells:
        if st in seen: continue
        stack=[st];seen.add(st);g=[]
        while stack:
            x=stack.pop();g.append(x);j,i=divmod(x,W)
            for dj,di in N8:
                if not(0<=j+dj<H): continue
                m=K(j+dj,i+di)
                if m in cells and m not in seen: seen.add(m);stack.append(m)
        if len(g)>=minc: out.append(set(g))
    return out
def moore(cells):
    start=min(cells,key=lambda k:(k//W,k%W)); b=start; pd=6; loop=[start]; g=0
    while True:
        g+=1
        if g>8000: return None
        j,i=divmod(b,W); found=None
        for st in range(8):
            d=(pd+6+st)%8; dj,di=N8[d]
            if not(0<=j+dj<H): continue
            m=K(j+dj,i+di)
            if m in cells: found=(m,d);break
        if not found: break
        b,pd=found
        if b==start and len(loop)>2: break
        loop.append(b)
    return [ll(k) for k in loop] if len(loop)>=6 else None
def smooth(p,n=3):
    for _ in range(n):
        if len(p)<5: break
        p=[((p[i-1][0]+2*p[i][0]+p[(i+1)%len(p)][0])/4,(p[i-1][1]+2*p[i][1]+p[(i+1)%len(p)][1])/4) for i in range(len(p))]
    return p
def perp(p,a,b):
    if a==b: return math.hypot(p[0]-a[0],p[1]-a[1])
    dx,dy=b[0]-a[0],b[1]-a[1]
    t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
def dp(pts,eps):
    if len(pts)<3: return pts
    dm=0;ix=0
    for i in range(1,len(pts)-1):
        d=perp(pts[i],pts[0],pts[-1])
        if d>dm: dm=d;ix=i
    if dm>eps: return dp(pts[:ix+1],eps)[:-1]+dp(pts[ix:],eps)
    return [pts[0],pts[-1]]
def compact(q):
    per=sum(math.hypot(q[k][0]-q[k-1][0],q[k][1]-q[k-1][1]) for k in range(len(q)))
    A=abs(sum(q[k-1][1]*q[k][0]-q[k][1]*q[k-1][0] for k in range(len(q))))/2
    return per*per/max(1e-6,A)/(4*math.pi)
def buildv(kind,minc,eps,cap):
    out=[]
    for g in blobs(kind,minc):
        t=moore(g)
        if not t: continue
        e=eps;r=dp(smooth(t),e)
        while len(r)>cap and e<3: e*=1.5;r=dp(smooth(t),e)
        if len(r)<5 or compact(r)>12: continue
        out.append(r)
    return out
lakes=buildv(2,4,0.030,150); marsh=buildv(3,6,0.050,150)
riv={k for k in range(W*H) if WA[k]==1}
dn={}
for k in riv:
    j,i=divmod(k,W); best=None;bv=E[k]
    for dj,di in NB:
        if not(0<=j+dj<H): continue
        m=K(j+dj,i+di)
        if m in riv and E[m]<bv: bv=E[m];best=m
    if best is not None: dn[k]=best
ups=defaultdict(list)
for k,v in dn.items(): ups[v].append(k)
paths=[];used=set()
for h in [k for k in riv if k not in ups]:
    p=[h];cur=h
    while cur in dn and dn[cur] not in used:
        used.add(cur);cur=dn[cur];p.append(cur)
        if len(p)>400: break
    if len(p)>=3: paths.append([ll(x) for x in p])
def sm(p):
    if len(p)<3: return p
    o=[p[0]]
    for i in range(1,len(p)-1): o.append(((p[i-1][0]+2*p[i][0]+p[i+1][0])/4,(p[i-1][1]+2*p[i][1]+p[i+1][1])/4))
    o.append(p[-1]);return o
paths=[dp(sm(sm(p)),0.012) for p in paths]
rr=lambda Q:[[[round(a,3),round(b,3)] for a,b in q] for q in Q]
HY={"rivers":rr(paths),"lakes":rr(lakes),"marsh":rr(marsh)}
json.dump(HY,open('HYDRO.json','w'),separators=(',',':'))
print(f"[5-6] rivers {len(paths)} lakes {len(lakes)} marsh {len(marsh)}")

# ---- 7. region jump targets (medoid over members ON LAND in the NEW terrain) ----
import subprocess
seat=json.loads(subprocess.run(['node','-e','''
const {makeTerrain}=require("./terrain2.js");
const GP=require("./GENPARAMS.json"), G=require("./UNIFIED.json");
const f=makeTerrain(GP); const out={};
for(const r of G.regions){
 const mem=G.rpts.filter(p=>p.r===r.id);
 const onLand=mem.filter(p=>f(p.lo,p.la).type); const pool=onLand.length?onLand:mem;
 let best=null,bv=1e18;
 for(const a of pool){let s=0;
  for(const b of mem){const dl=((a.lo-b.lo+540)%360)-180;
   s+=Math.hypot(a.la-b.la,dl*Math.cos((a.la+b.la)/2*Math.PI/180));}
  if(s<bv){bv=s;best=a;}}
 let mx=0;
 for(const b of mem){const dl=((best.lo-b.lo+540)%360)-180;
  mx=Math.max(mx,Math.hypot(best.la-b.la,dl*Math.cos((best.la+b.la)/2*Math.PI/180)));}
 out[r.id]={lat:+best.la.toFixed(3),lon:+best.lo.toFixed(3),span:+Math.max(5,Math.min(90,mx*2.3)).toFixed(1),medoid:best.id};}
process.stdout.write(JSON.stringify(out));
'''],capture_output=True,text=True,cwd='/home/claude/sing').stdout)
json.dump(seat,open('SEATFIX.json','w'))
print(f"[7] region seats: {len(seat)}")

# ---- 8. downsample, pack, and inject EVERYTHING into the viewer ----
RANGE=json.load(open('/tmp/RANGE.json'))
p='/mnt/user-data/outputs/singularity_world.html'
s=open(p).read()
ga=s.index("function makeTerrain(GP, view){"); gb=s.index("const G = {")
tj=open('terrain2.js').read().replace("if(typeof module!=='undefined') module.exports={makeTerrain};","")
s=s[:ga]+tj+"\n"+s[gb:]
a=s.index("const HY={"); b=s.index(";",s.index('"marsh"',a))
s=s[:a]+"const HY="+json.dumps(HY,separators=(',',':'))+s[b:]
a=s.index("const SEAT="); b=s.index(";\n",a)
s=s[:a]+"const SEAT="+json.dumps(seat,separators=(',',':'))+s[b:]
s=re.sub(r"const RLO=[\d.]+, *RHI=[\d.]+;", f"const RLO={RANGE['RLO']:.4f}, RHI={RANGE['RHI']:.4f};", s)
w2,h2=480,240
TT=open('B_TYPE.bin','rb').read();BB=open('B_BIOM.bin','rb').read()
DD=open('B_DENS.bin','rb').read();NN=open('B_NAN.bin','rb').read();EE=open('B_ELEV.bin','rb').read()
def ds(x):
    o=bytearray(w2*h2)
    for j in range(h2):
        sj=int(j*H/h2)
        for i in range(w2): o[j*w2+i]=x[sj*W+int(i*W/w2)]
    return o
t,e,bb,d,n,wa=map(ds,(TT,EE,BB,DD,NN,WA))
enc=lambda x: base64.b64encode(bytes(x)).decode()
i0=s.index('const G = {'); j0=s.index('const RW=G.W'); k0=s.rindex(';',i0,j0)
G=json.loads(s[i0+len('const G = '):k0])
G['B']['c0']=enc(bytes(((t[q]&3)|((n[q]&3)<<2)|((wa[q]&3)<<4)) for q in range(w2*h2)))
G['B']['c1']=enc(bytes((bb[q]&63) for q in range(w2*h2)))
G['B']['c2']=enc(bytes((d[q]>>2) for q in range(w2*h2)))
G['B']['c3']=enc(e)
s=s[:i0]+'const G = '+json.dumps(G,separators=(',',':'))+s[k0:]
open(p,'w').write(s)
print(f"[8] packed; html {os.path.getsize(p)} bytes; RLO {RANGE['RLO']:.4f} RHI {RANGE['RHI']:.4f}")
