// scripts/world/terrain.mjs — THE WORLD GENERATOR (SNG-391)
// Pure and deterministic: same params in, same world out, no RNG.
// ⛔ Three fixes are load-bearing; see po/SPEC_SNG-391 §2b before changing anything:
//   1. great-circle distance (chord form) — the flat approximation starbursts at the poles
//   2. 3D noise on the sphere — lon/lat noise is anisotropic near a pole, unfixably
//   3. view culling with a cos(lat) longitude pad — 4.5x faster, verified identical
// Tuned constants (swept, not guessed): thr 1.30, taper 2.2, cont 0.62, F3 57.2957795
// Absolute elevation range for normalisation: RLO 0.0915  RHI 1.9265 — RECOMPUTE on any change.
// Terrain generator with VIEW CULLING — only the parameters that can affect the current
// window are considered, which is what makes a regional zoom affordable.
function makeTerrain(GP, view){
 const R=Math.PI/180;
 function dlon(a,b){return ((a-b+540)%360)-180;}
 // cull: a gaussian at sigma s is negligible past ~3.5s
 let pts=GP.pts, lw=GP.landwant, br=GP.bridges, sh=GP.short, belts=GP.belts, north=GP.north, umb=GP.umb;
 if(view){
  const {la0,la1,lo0,lo1}=view;
  // ⚠️ meridians converge: near the pole a huge longitude span is a small distance,
  // so the longitude pad must be divided by cos(lat) or the cull eats real contributors.
  const maxAbsLat=Math.max(Math.abs(la0),Math.abs(la1));
  const conv=Math.max(0.12,Math.cos(Math.min(88,maxAbsLat)*R));
  const inR=(la,lo,pad)=>{
   if(la<la0-pad||la>la1+pad) return false;
   if(maxAbsLat>62) return true;               // near the pole, keep everything
   const d=Math.abs(dlon(lo,(lo0+lo1)/2));
   return d <= Math.abs(lo1-lo0)/2 + pad/conv;
  };
  pts  = GP.pts.filter(p=>inR(p[0],p[1],46));
  lw   = GP.landwant.filter(p=>inR(p[0],p[1],10));
  umb  = GP.umb.filter(p=>inR(p[0],p[1],20));
  br   = GP.bridges.filter(b=>inR(b[0],b[1],26)||inR(b[2],b[3],26));
  sh   = GP.short.filter(b=>inR(b[0],b[1],12)||inR(b[2],b[3],12));
  north= GP.north.filter(n=>inR(n[0],n[1],n[2]*4));
  belts= GP.belts.filter(b=>b.some(q=>inR(q[1],q[0],34)));
 }
 // squared great-circle distance in DEGREES², via the chord — no acos.
 // chord² = 2(1-cos d); arc² ≈ chord²(1 + chord²/12), exact to <0.5% out to ~25°.
 const DEG2=(180/Math.PI)*(180/Math.PI);
 function gcd2(sin1,cos1,sinLat,cosLat,dlRad_cos){
  const c=Math.max(-1,Math.min(1, sinLat*sin1 + cosLat*cos1*dlRad_cos));
  const ch2=2*(1-c);
  return ch2*(1+ch2/12)*DEG2;
 }
 // ⛔ 3D NOISE ON THE SPHERE. Sampling in lon/lat is anisotropic near a pole — a longitude
 // degree is 111 km at the equator and 2 km at 89°, so noise streaks radially no matter what
 // blend is applied. A unit vector has no poles, so this is isotropic everywhere by construction.
 const F3=57.2957795;                       // degrees-of-arc per unit of the sphere vector
 function sph(lon,lat){const t=(90-lat)*R, p=lon*R, st=Math.sin(t);
  return [st*Math.cos(p), Math.cos(t), st*Math.sin(p)];}
 function n3(v,o,s,seed){o=o||4;s=(s||1)*F3;seed=seed||0;
  let acc=0,a=1,f=s;
  for(let q=0;q<o;q++){
   acc+=a*Math.sin(v[0]*f*1.9+seed+Math.cos(v[1]*f*1.4+seed))
          *Math.cos(v[1]*f*1.2+Math.sin(v[2]*f*1.05+seed))
          *Math.cos(v[2]*f*0.85+Math.sin(v[0]*f*1.15+seed));
   a*=0.5; f*=2.05;}
  return acc*1.35;}
 function n2(x,y,o,s,seed){o=o||4;s=s||1;seed=seed||0;let v=0,a=1,f=s;
  for(let q=0;q<o;q++){v+=a*Math.sin(x*f*1.9+seed+Math.cos(y*f*1.4+seed))*Math.cos(y*f*1.2+Math.sin(x*f*1.05+seed));a*=0.5;f*=2.05;}
  return v;}
 function segd(lon,lat,ay,ax,by,bx){
  const px=dlon(lon,ax),py=lat-ay,qx=dlon(bx,ax),qy=by-ay;
  const L=qx*qx+qy*qy,t=L===0?0:Math.max(0,Math.min(1,(px*qx+py*qy)/L));
  // the along-segment point, then TRUE distance to it
  const sy=ay+qy*t, sx=ax+qx*t;
  const d2=gcd2(Math.sin(sy*R),Math.cos(sy*R),Math.sin(lat*R),Math.cos(lat*R),Math.cos((lon-sx)*R));
  return {d:Math.sqrt(d2),t:t};}
 const PT=pts.map(p=>[p[0],p[1],Math.sin(p[0]*R),Math.cos(p[0]*R)]);
 const LW=lw.map(p=>[p[0],p[1],Math.sin(p[0]*R),Math.cos(p[0]*R)]);
 return function(lon,lat){
  const cl=Math.cos(lat*R);
  const V=sph(lon,lat);
  let s=0;
  const sinLat=Math.sin(lat*R), cosLat=cl;
  for(let i=0;i<PT.length;i++){const p=PT[i];
   const d2=gcd2(p[2],p[3],sinLat,cosLat,Math.cos((lon-p[1])*R));
   if(d2<900) s+=0.78*Math.exp(-d2/67.24);}
  let g=0;
  for(let i=0;i<LW.length;i++){const p=LW[i];
   const d2=gcd2(p[2],p[3],sinLat,cosLat,Math.cos((lon-p[1])*R));
   if(d2<64){const v=1.55*Math.exp(-d2/12.96); if(v>g)g=v;}}
  let b2=0;
  for(let i=0;i<br.length;i++){const b=br[i];const q=segd(lon,lat,b[0],b[1],b[2],b[3]);
   const warp=2.6*n3(V,3,0.14,5.1);
   const ends=1+1.35*(Math.exp(-Math.pow(q.t/0.22,2))+Math.exp(-Math.pow((1-q.t)/0.22,2)));
   const wid=(5.2+2.4*n3(V,2,0.09,8.3))*ends*(b[4]||1);
   const v=1.25*Math.exp(-Math.pow((q.d-warp*0.35)/Math.max(1.4,wid),2)); if(v>b2)b2=v;}
  for(let i=0;i<sh.length;i++){const b=sh[i];const q=segd(lon,lat,b[0],b[1],b[2],b[3]);
   if(q.d<6.5){const v=0.95*Math.exp(-(q.d*q.d)/9.61); if(v>b2)b2=v;}}
  for(let i=0;i<umb.length;i++){const u=umb[i];const dl=dlon(lon,u[1]);
   const d=Math.hypot(lat-u[0],dl*cl);
   if(d<13) s*=(0.5+0.8*Math.abs(Math.sin(d*0.9)+0.4*n3(V,4,0.8,0)));}
  const cont=1.55*n3(V,2,0.015,0.7)+0.85*n3(V,2,0.036,2.3)+0.4*n3(V,2,0.085,4.1);
  s+=cont*0.62;
  s-=Math.pow(Math.max(0,(lat-4)/56),1.3)*2.2;
  s+=g+b2;
  const thr=1.30+0.18*n3(V,4,0.09,0);
  const known=s-thr;
  let un=0;
  for(let i=0;i<north.length;i++){const n=north[i];const dl=dlon(lon,n[1]);
   const v=Math.exp(-Math.pow(Math.hypot(lat-n[0],dl*cl)/n[2],2))*(0.85+0.5*n3(V,4,0.13,0));
   if(v>un)un=v;}
  const unk=un-0.42;
  let bd=1e9;
  for(let i=0;i<belts.length;i++){const b=belts[i];
   for(let k=0;k<b.length-1;k++){const q=segd(lon,lat,b[k][1],b[k][0],b[k+1][1],b[k+1][0]); if(q.d<bd)bd=q.d;}}
  const belt=Math.exp(-(bd*bd)/49);
  const ridged=1-Math.abs(n3(V,4,0.42,1.1));
  const relief=belt*(0.30+1.05*ridged*ridged)+0.09*Math.abs(n3(V,3,0.2,0));
  if(known>0) return {type:(known<0.16&&belt>0.5&&ridged>0.80)?2:1, raw:Math.log1p(known*3)*0.30+relief*1.5};
  if(unk>0)   return {type:3, raw:Math.log1p(unk*3)*0.4+relief*0.9};
  return {type:0, raw:Math.max(known,unk)};
 };
}
if(typeof module!=='undefined') module.exports={makeTerrain};

