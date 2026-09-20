#!/usr/bin/env python3
"""Region-tier book-map prototype. Reads content/packs/core/world/terrain.json ONLY.
Derived render, writes nothing back. Proves the aesthetic + the field layer at region tier."""
import json, base64, math, sys

T = json.load(open('terrain.json'))
SC = json.load(open('scale.json'))
MI_DEG = SC['milesPerDegree']; DAY_DEG = SC['walkingDaysPerDegree']

enc = T['encoding']; GW, GH = enc['grid']['w'], enc['grid']['h']
EW, EH = enc['elevationGrid']['w'], enc['elevationGrid']['h']
C0 = base64.b64decode(T['layers']['c0']); C3 = base64.b64decode(T['layers']['c3'])

def elev(lon, lat):
    lon = (lon + 180) % 360 - 180                       # 0-254, 128 = sea level
    x = int((lon + 180) / 360 * EW) % EW
    y = min(EH - 1, max(0, int((90 - lat) / 180 * EH)))
    return C3[y * EW + x]

def surf(lon, lat):
    lon = (lon + 180) % 360 - 180                       # bits 0-1: 0 water 1 land 2 volcanic 3 unexplored
    x = int((lon + 180) / 360 * GW) % GW
    y = min(GH - 1, max(0, int((90 - lat) / 180 * GH)))
    return C0[y * GW + x] & 3

REGION = sys.argv[1] if len(sys.argv) > 1 else 'valley'
pts = [p for p in T['points'] if p[1] == REGION]
lats = [p[2] for p in pts]; lons = [p[3] for p in pts]
# ANTIMERIDIAN: the valley straddles +-180. A naive min/max reads it as 343deg wide.
# Circular mean, then unwrap every longitude into a frame centred on it.
_cm = math.degrees(math.atan2(sum(math.sin(math.radians(l)) for l in lons),
                              sum(math.cos(math.radians(l)) for l in lons)))
def unwrap(lo, c=_cm):
    d = (lo - c + 180) % 360 - 180
    return c + d
LONC = _cm
lons = [unwrap(l) for l in lons]
PAD = 3.0
lat0, lat1 = min(lats) - PAD, max(lats) + PAD
lon0, lon1 = min(lons) - PAD * 2, max(lons) + PAD * 2
midLat = (lat0 + lat1) / 2
CONV = max(0.12, math.cos(math.radians(midLat)))   # longitude convergence, per makeRegionBase

MARG = 64
_asp = ((lon1-lon0)*max(0.12,math.cos(math.radians((lat0+lat1)/2)))) / (lat1-lat0)
_asp = min(2.05, max(0.80, _asp))
W = 1500; H = int(min(1400, max(760, (W-2*MARG)/_asp + 2*MARG)))
dLat, dLon = lat1 - lat0, (lon1 - lon0) * CONV
sc = min((W - 2 * MARG) / dLon, (H - 2 * MARG) / dLat)
OX = (W - dLon * sc) / 2; OY = (H - dLat * sc) / 2

def px(lon, lat):
    return (OX + (lon - lon0) * CONV * sc, OY + (lat1 - lat) * sc)

# ---- LOCAL NORMALISATION: a region is not a planet. Every threshold below is derived
# ---- from THIS window's elevation and slope distribution, never from world-absolute levels.
_E=[]; _G=[]; _WATER=0; _N=0
_la=lat0
while _la<lat1:
    _lo=lon0
    while _lo<lon1:
        _N+=1
        if surf(_lo,_la)==0: _WATER+=1
        else:
            _E.append(elev(_lo,_la))
            _G.append(math.hypot(elev(_lo+0.09,_la)-elev(_lo-0.09,_la),
                                 elev(_lo,_la+0.09)-elev(_lo,_la-0.09)))
        _lo+=(lon1-lon0)/90
    _la+=(lat1-lat0)/90
_E.sort(); _G.sort()
EMIN,EMAX=(_E[0],_E[-1]) if _E else (128,129)
def _q(a,f): return a[min(len(a)-1,int(len(a)*f))] if a else 0
GMED=_q(_G,0.55) or 0.35
GMAX=_q(_G,0.985) or (GMED*4)
HAS_WATER=_WATER>_N*0.01
LEVELS=[(EMIN+(EMAX-EMIN)*f) for f in (0.2,0.4,0.6,0.8)]

INK   = "#4c3a26"; INK2 = "#6b553c"; SEA = "#7d8f96"
PARCH = "#e9dcc0"; HOT  = "#b0432b"; COLD = "#2f6b70"
O = []
A = O.append

A(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
  f'font-family="Georgia,\'Iowan Old Style\',serif">')
A('<defs>'
  '<filter id="grain"><feTurbulence baseFrequency="0.85" numOctaves="3" result="n"/>'
  '<feColorMatrix in="n" type="saturate" values="0"/>'
  '<feComponentTransfer><feFuncA type="linear" slope="0.055"/></feComponentTransfer>'
  '<feComposite operator="over" in2="SourceGraphic"/></filter>'
  '<radialGradient id="vig" cx="50%" cy="50%" r="72%">'
  '<stop offset="60%" stop-color="#000" stop-opacity="0"/>'
  '<stop offset="100%" stop-color="#4a3418" stop-opacity="0.30"/></radialGradient>'
  '<radialGradient id="bloom"><stop offset="0%" stop-color="'+HOT+'" stop-opacity="0.50"/>'
  '<stop offset="55%" stop-color="'+HOT+'" stop-opacity="0.13"/>'
  '<stop offset="100%" stop-color="'+HOT+'" stop-opacity="0"/></radialGradient>'
  '<radialGradient id="sink"><stop offset="0%" stop-color="'+COLD+'" stop-opacity="0.42"/>'
  '<stop offset="60%" stop-color="'+COLD+'" stop-opacity="0.10"/>'
  '<stop offset="100%" stop-color="'+COLD+'" stop-opacity="0"/></radialGradient>'
  '<pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'
  f'<line x1="0" y1="0" x2="0" y2="7" stroke="{COLD}" stroke-width="0.8" opacity="0.5"/></pattern>'
  '</defs>')
A(f'<rect width="{W}" height="{H}" fill="{PARCH}"/>')

# ---------- water body + coast ----------
STEP = 0.07
A(f'<g stroke="none" fill="{SEA}" fill-opacity="0.20">')
lat = lat0 if HAS_WATER else lat1
while lat < lat1:
    lon = lon0
    while lon < lon1:
        if surf(lon, lat) == 0:
            x, y = px(lon, lat); w = STEP * CONV * sc + 1.2; h = STEP * sc + 1.2
            A(f'<rect x="{x:.1f}" y="{y-h:.1f}" width="{w:.1f}" height="{h:.1f}"/>')
        lon += STEP
    lat += STEP
A('</g>')

# coast hatching — parallel lines just offshore, the old-chart treatment
A(f'<g stroke="{SEA}" fill="none" stroke-width="0.7" opacity="0.55">')
lat = lat0 if HAS_WATER else lat1
while lat < lat1:
    lon = lon0
    while lon < lon1:
        if surf(lon, lat) == 0:
            near = any(surf(lon + dx, lat + dy) == 1
                       for dx, dy in ((STEP,0),(-STEP,0),(0,STEP),(0,-STEP)))
            if near:
                for k in (1.6, 3.4):
                    x, y = px(lon, lat)
                    A(f'<line x1="{x-k*2:.1f}" y1="{y+k:.1f}" x2="{x+k*2:.1f}" y2="{y+k:.1f}"/>')
        lon += STEP
    lat += STEP
A('</g>')

# ---------- hachures: short strokes down the slope, density by steepness ----------
A(f'<g stroke="{INK}" stroke-linecap="round" fill="none">')
HS = 0.055
lat = lat0
_row = 0
while lat < lat1:
    _row += 1
    lon = lon0 + (HS * 1.05 if _row % 2 else 0)
    while lon < lon1:
        if surf(lon, lat) == 1:
            e  = elev(lon, lat)
            gx = elev(lon + HS, lat) - elev(lon - HS, lat)
            gy = elev(lon, lat + HS) - elev(lon, lat - HS)
            s  = math.hypot(gx, gy)
            if s > GMED * 0.75:
                t0 = min(1.0, s / GMAX)
                if ((hash((round(lon,3), round(lat,3))) >> 5) % 100) / 100.0 > 0.30 + t0 * 0.70:
                    lon += HS * 2.1; continue
                ang = math.atan2(gy, gx)
                jx = (((hash((round(lon,3), round(lat,3))) >> 3) % 100)/100.0 - .5) * HS * 1.7
                jy = (((hash((round(lat,3), round(lon,3))) >> 3) % 100)/100.0 - .5) * HS * 1.7
                x, y = px(lon + jx, lat + jy)
                t = t0
                L = 1.5 + t * 5.0
                w = 0.30 + t * 0.95
                dx, dy = math.cos(ang) * L, math.sin(ang) * L
                op = 0.22 + t * 0.55
                A(f'<line x1="{x-dx:.1f}" y1="{y-dy:.1f}" x2="{x+dx:.1f}" y2="{y+dy:.1f}" '
                  f'stroke-width="{w:.2f}" opacity="{op:.2f}"/>')
        lon += HS * 2.1
    lat += HS * 2.1
A('</g>')

# ---------- contours: thin ink, wide interval ----------
def contour(level, width, op):
    segs = []
    CS = 0.14
    lat = lat0
    while lat < lat1:
        lon = lon0
        while lon < lon1:
            a = elev(lon, lat); b = elev(lon + CS, lat); c = elev(lon, lat + CS)
            if surf(lon, lat) == 1:
                if (a - level) * (b - level) < 0:
                    f = (level - a) / (b - a) if b != a else .5
                    segs.append(px(lon + CS * f, lat))
                if (a - level) * (c - level) < 0:
                    f = (level - a) / (c - a) if c != a else .5
                    segs.append(px(lon, lat + CS * f))
            lon += CS
        lat += CS
    if segs:
        d = ''.join(f'M{x:.1f} {y:.1f}h0.9' for x, y in segs)
        O.append(f'<path d="{d}" stroke="{INK2}" stroke-width="{width}" '
                 f'opacity="{op}" fill="none" stroke-linecap="round"/>')

for _i, lv in enumerate(LEVELS):
    contour(lv, 0.75 + 0.05*_i, 0.40 + 0.05*_i)

# ---------- rivers ----------
def inbox(la, lo):
    return lat0 <= la <= lat1 and lon0 <= unwrap(lo) <= lon1
A(f'<g stroke="{SEA}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.92">')
for path in T['hydrology'].get('rivers', []):
    run = []
    for la, lo in path:
        if inbox(la, lo):
            run.append(px(unwrap(lo), la))
        else:
            if len(run) > 1:
                A('<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in run) +
                  '" stroke-width="1.55"/>')
            run = []
    if len(run) > 1:
        A('<polyline points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in run) +
          '" stroke-width="1.55"/>')
A('</g>')

# ---------- THE FIELD LAYER — power sources at region tier ----------
SRC = [s for s in T['fields']['sources'] if inbox(s[0], s[1])]
A('<g>')
for la, lo, stren, rad in SRC:
    x, y = px(unwrap(lo), la)
    R = max(46, rad * 1100 * CONV * sc / 60)
    A(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R:.1f}" fill="url(#{"bloom" if stren>0 else "sink"})"/>')
for la, lo, stren, rad in SRC:
    x, y = px(unwrap(lo), la)
    col = HOT if stren > 0 else COLD
    R = max(46, rad * 1100 * CONV * sc / 60)
    for k in (0.55, 0.78, 1.0):                      # field contour rings, drawn not glowed
        A(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{R*k:.1f}" fill="none" stroke="{col}" '
          f'stroke-width="0.85" opacity="{0.40 if stren>0 else 0.34}" stroke-dasharray="5 6"/>')
    if stren > 0:
        A(f'<g stroke="{col}" stroke-width="1.5" opacity="0.92">'
          f'<line x1="{x-7}" y1="{y}" x2="{x+7}" y2="{y}"/>'
          f'<line x1="{x}" y1="{y-7}" x2="{x}" y2="{y+7}"/>'
          f'<line x1="{x-5}" y1="{y-5}" x2="{x+5}" y2="{y+5}"/>'
          f'<line x1="{x-5}" y1="{y+5}" x2="{x+5}" y2="{y-5}"/></g>')
    else:
        A(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6.5" fill="url(#hatch)" stroke="{col}" '
          f'stroke-width="1.3" opacity="0.95"/>')
    A(f'<text x="{x:.1f}" y="{y-R*1.0-7:.1f}" fill="{col}" font-size="10.5" font-style="italic" '
      f'text-anchor="middle" opacity="0.85">{abs(stren):.2f}</text>')
A('</g>')

# ---------- places ----------
LBL = {}
KIND = {'settlement': 'town', 'region': 'seat', 'waygate': 'gate'}
for pid, reg, la, lo, kind in T['points']:
    if not inbox(la, lo): continue
    meta = T['locations'].get(pid, {})
    nm = meta.get('n', pid); x, y = px(unwrap(lo), la)
    home = (reg == REGION)
    if meta.get('wg'):
        A(f'<g stroke="{INK}" fill="{PARCH}" stroke-width="1.5">'
          f'<circle cx="{x:.1f}" cy="{y:.1f}" r="6.5"/>'
          f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{INK}"/></g>')
    else:
        A(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.6" fill="{PARCH}" stroke="{INK}" stroke-width="1.5"/>')
        A(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.7" fill="{INK}"/>')
    fs = 15 if home else 12.5
    flip = x > W - 260
    ax = x - 11 if flip else x + 11
    an = 'end' if flip else 'start'
    _k = (round(x/150), round(y/17)); dy = LBL.get(_k, 0); LBL[_k] = dy + 16
    A(f'<text x="{ax:.1f}" y="{y+5+dy:.1f}" font-size="{fs}" fill="{INK}" text-anchor="{an}" '
      f'{"" if home else "opacity=\'0.62\' font-style=\'italic\'"} '
      f'letter-spacing="0.6">{nm}</text>')
    if not home:
        A(f'<text x="{ax:.1f}" y="{y+18+dy:.1f}" font-size="9" fill="{INK2}" opacity="0.5" '
          f'text-anchor="{an}" font-style="italic">in {reg.replace("_"," ")}</text>')

# ---------- frame, title, compass, scale ----------
A(f'<rect x="{MARG*0.5}" y="{MARG*0.5}" width="{W-MARG}" height="{H-MARG}" fill="none" '
  f'stroke="{INK}" stroke-width="2.5" opacity="0.75"/>')
A(f'<rect x="{MARG*0.5+7}" y="{MARG*0.5+7}" width="{W-MARG-14}" height="{H-MARG-14}" fill="none" '
  f'stroke="{INK}" stroke-width="0.9" opacity="0.5"/>')
A(f'<text x="{MARG*0.5+26}" y="{MARG*0.5+46}" font-size="30" fill="{INK}" letter-spacing="3.5">'
  f'{REGION.replace("_"," ").upper()}</text>')
A(f'<text x="{MARG*0.5+27}" y="{MARG*0.5+68}" font-size="12.5" fill="{INK2}" font-style="italic">'
  f'region tier · drawn from canon terrain · {len(SRC)} power sources · relief {EMIN}-{EMAX} of world 94-253{" · landlocked" if not HAS_WATER else ""}</text>')

# scale bar — miles AND walking days, together
BAR = 4.0
bx, by = W - MARG * 0.5 - 30 - BAR * CONV * sc, H - MARG * 0.5 - 46
A(f'<g stroke="{INK}" stroke-width="1.5" fill="none">'
  f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{bx+BAR*CONV*sc:.1f}" y2="{by:.1f}"/>'
  f'<line x1="{bx:.1f}" y1="{by-5:.1f}" x2="{bx:.1f}" y2="{by+5:.1f}"/>'
  f'<line x1="{bx+BAR*CONV*sc:.1f}" y1="{by-5:.1f}" x2="{bx+BAR*CONV*sc:.1f}" y2="{by+5:.1f}"/>'
  f'<line x1="{bx+BAR*CONV*sc/2:.1f}" y1="{by-3:.1f}" x2="{bx+BAR*CONV*sc/2:.1f}" y2="{by+3:.1f}"/></g>')
A(f'<text x="{bx+BAR*CONV*sc/2:.1f}" y="{by+20:.1f}" font-size="12.5" fill="{INK}" text-anchor="middle">'
  f'{BAR*MI_DEG:.0f} miles</text>')
A(f'<text x="{bx+BAR*CONV*sc/2:.1f}" y="{by+34:.1f}" font-size="12.5" fill="{HOT}" text-anchor="middle" '
  f'font-style="italic">{BAR*DAY_DEG:.1f} walking days</text>')

cx, cy = MARG * 0.5 + 62, H - MARG * 0.5 - 62
A(f'<g stroke="{INK}" fill="{INK}" opacity="0.8">'
  f'<circle cx="{cx}" cy="{cy}" r="27" fill="none" stroke-width="1.2"/>'
  f'<circle cx="{cx}" cy="{cy}" r="21" fill="none" stroke-width="0.6"/>'
  f'<path d="M{cx} {cy-25} L{cx+6} {cy} L{cx} {cy+25} L{cx-6} {cy} Z" fill="{PARCH}" stroke-width="1.2"/>'
  f'<path d="M{cx} {cy-25} L{cx+6} {cy} L{cx-6} {cy} Z"/></g>')
A(f'<text x="{cx}" y="{cy-33}" font-size="12" fill="{INK}" text-anchor="middle">N</text>')

# legend for the field layer
lx, ly = MARG * 0.5 + 26, H - MARG * 0.5 - 190
A(f'<g><text x="{lx}" y="{ly}" font-size="11.5" fill="{INK}" letter-spacing="1.4">THE FIELD</text>'
  f'<g stroke="{HOT}" stroke-width="1.5"><line x1="{lx+4}" y1="{ly+19}" x2="{lx+18}" y2="{ly+19}"/>'
  f'<line x1="{lx+11}" y1="{ly+12}" x2="{lx+11}" y2="{ly+26}"/></g>'
  f'<text x="{lx+28}" y="{ly+23}" font-size="11" fill="{INK2}">source · feeds the lattice</text>'
  f'<circle cx="{lx+11}" cy="{ly+42}" r="6.5" fill="url(#hatch)" stroke="{COLD}" stroke-width="1.3"/>'
  f'<text x="{lx+28}" y="{ly+46}" font-size="11" fill="{INK2}">sink · draws it down</text></g>')

A(f'<rect width="{W}" height="{H}" fill="url(#vig)" pointer-events="none"/>')
A(f'<rect width="{W}" height="{H}" filter="url(#grain)" fill="{PARCH}" opacity="0.30" pointer-events="none"/>')
A('</svg>')

out = f'/mnt/user-data/outputs/region_map_{REGION}.svg'
open(out, 'w').write(''.join(O))
print(f"{out}  ·  {len(''.join(O))/1024:.0f} KB  ·  {len(SRC)} sources  ·  "
      f"extent lat {lat0:.1f}..{lat1:.1f} lon {lon0:.1f}..{lon1:.1f}  ·  "
      f"{(lon1-lon0)*CONV*MI_DEG:.0f} mi wide, {(lat1-lat0)*DAY_DEG:.1f} days tall")
