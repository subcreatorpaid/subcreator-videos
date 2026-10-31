// "Fluid" style (owner's Drive reference, 31 Oct 2026): copies the reference reel's animation and FX language in our
// palette. Full-bleed backgrounds that switch light / ink / lime, one soft 3D lime blob that grows, morphs into a block,
// splits into floating tags and back; heavy tight type that blurs in word by word and explodes letter by letter;
// directional motion-blur whips, iris wipes and depth-of-field UI cards; a white word-by-word caption pill.
// Everything sits inside the Instagram safe area (x 80-930, y 240-1420) with @subcreatorpaid at the top centre.
// Scenes are written for the v101 Adobe Stock video (one scene per beat); transitions are per boundary (TR).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, staticFile} from 'remotion';
import {FONT} from '../Short';
import {expo, expoIn, inOut, spring, kf, mix, clamp01, hash, typedCount, useTimes} from './kit';
import {BrandLogo} from './art';

const K = {ink: '#0E0E10', lime: '#CDF24F', hi: '#ECFF9E', lo: '#A9D12A', mut: '#6B6A63', card: '#19191C', line: '#2A2A2F', red: '#D93A3A', paper: '#FBFBF8'};
const MONO = '"DejaVu Sans Mono", ui-monospace, Menlo, monospace';
const CX = 510; // centre of the safe area (right edge kept clear of the like/comment buttons)
const BG = {
  light: 'radial-gradient(120% 75% at 50% 38%, #F7F6F2 0%, #ECEBE5 62%, #DEDDD5 100%)',
  dark: 'radial-gradient(120% 75% at 50% 38%, #1C1C21 0%, #0E0E10 70%)',
  lime: 'radial-gradient(120% 75% at 50% 38%, #DDF97A 0%, #CDF24F 58%, #BCE13C 100%)',
};
const SCENE_BG = ['light', 'light', 'light', 'dark', 'dark', 'lime', 'dark', 'dark', 'light', 'light', 'lime', 'lime', 'light', 'lime'];
// transition INTO scene i
const TR = {1: 'cut', 2: 'cut', 3: 'whipX', 4: 'zoom', 5: 'iris', 6: 'whipY', 7: 'soft', 8: 'iris', 9: 'soft', 10: 'iris', 11: 'push', 12: 'whipX', 13: 'iris'};
const IRIS_AT = {5: [CX, 1010], 8: [CX, 640], 10: [CX, 1120], 13: [CX, 1040]};
const TW = 9; // half-length of a transition, frames

// ------------------------------------------------------------------ primitives
// Directional (motion) blur through an SVG filter; x/y = blur in px along each axis.
const MB = ({id, x = 0, y = 0, style = {}, children}) => {
  const on = x > 0.4 || y > 0.4;
  return (<>
    {on && <svg width="0" height="0" style={{position: 'absolute'}}><filter id={id} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={`${x.toFixed(1)} ${y.toFixed(1)}`} /></filter></svg>}
    <div style={{position: 'absolute', inset: 0, ...style, filter: on ? `url(#${id})` : undefined}}>{children}</div>
  </>);
};
// Words that arrive out of a blur (rise + de-scale); `out` makes them blur away again.
const BlurIn = ({f, at, text, size = 100, color = K.ink, weight = 900, stagger = 3, ats, out, lh = 0.98, align = 'center', box, style = {}}) => {
  const words = String(text).split(' ');
  return (
    <div style={{fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: -size * 0.045, color, textAlign: align, ...style}}>
      {words.map((w, i) => {
        const t0 = ats ? ats[i] : at + i * stagger; const p = expo(f - t0, 13); const o = out ? expoIn(f - out - i * 1.5, 10) : 0;
        const isBox = box && box.includes(i);
        return (
          <span key={i} style={{display: 'inline-block', marginRight: i < words.length - 1 ? size * 0.2 : 0, opacity: clamp01(p * 1.7) * (1 - o),
            filter: `blur(${(1 - p) * 16 + o * 22}px)`, transform: `translateY(${(1 - p) * size * 0.32 - o * size * 0.3}px) scale(${mix(1.18, 1, p)})`,
            ...(isBox ? {background: color === '#fff' ? '#fff' : K.lime, color: K.ink, padding: `0 ${size * 0.12}px`, borderRadius: size * 0.1} : {})}}>{w}</span>
        );
      })}
    </div>
  );
};
// Letters fly apart (the reference's "scattered" moment).
const Explode = ({f, at, text, size = 100, color = K.ink, seed = 1, x, y, w = 840}) => {
  const t = f - at; if (t < 0 || t > 30) return null; const p = expo(t, 22);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.045, color, lineHeight: 1}}>
      {String(text).split('').map((c, i) => { const a = hash(seed + i) * Math.PI * 2; const d = (180 + hash(seed * 3 + i) * 520) * p;
        return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d + p * p * 260}px) rotate(${(hash(i + seed * 7) - 0.5) * 540 * p}deg) scale(${1 - p * 0.4})`,
          filter: `blur(${p * 10}px)`, opacity: 1 - clamp01((p - 0.55) / 0.45)}}>{c}</span>; })}
    </div>
  );
};
// The soft 3D lime blob (circle, block or anything in between).
const Blob = ({x, y, w, h, r, children, glow = 1, style = {}}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: r,
    background: `radial-gradient(130% 120% at 30% 22%, ${K.hi} 0%, ${K.lime} 42%, ${K.lo} 100%)`,
    boxShadow: `0 ${Math.min(h, 500) * 0.16}px ${Math.min(h, 500) * 0.34}px rgba(118,148,18,${0.32 * glow}), inset 0 -${Math.min(h, 400) * 0.05}px ${Math.min(h, 400) * 0.12}px rgba(80,110,0,0.16), inset 0 ${Math.min(h, 400) * 0.04}px ${Math.min(h, 400) * 0.08}px rgba(255,255,255,0.55)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style}}>{children}</div>
);
const Tag = ({children, size = 42, dark, style = {}}) => (
  <span style={{display: 'inline-block', background: dark ? K.ink : '#fff', color: dark ? '#fff' : K.ink, fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.03,
    padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: size * 0.36, boxShadow: '0 14px 30px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08)', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
const Mono = ({children, size = 26, color = K.ink, style = {}}) => (
  <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.18, textTransform: 'uppercase', color, ...style}}>{children}</div>
);
const pop = (f, at, o = {w: 0.42, z: 0.62}) => spring(f - at, o);
const at = (el, x, y, extra = {}) => ({position: 'absolute', left: x, top: y, ...extra});
// Glowing lime cursor (the reference's soft blob pointer) with a click ripple.
const Glow = ({f, track, clicks = [], dark}) => {
  if (f < track[0][0] - 2 || f > track[track.length - 1][0] + 14) return null;
  const x = kf(f, track.map(([t, xx]) => [t, xx])), y = kf(f, track.map(([t, , yy]) => [t, yy]));
  const ck = clicks.find((c) => f >= c && f < c + 16); const t = ck === undefined ? -1 : (f - ck) / 16; const a = expo(f - track[0][0] + 2, 8);
  return (<>
    {t >= 0 && <div style={{position: 'absolute', left: x - 30 - t * 70, top: y - 30 - t * 70, width: 60 + t * 140, height: 60 + t * 140, borderRadius: '50%', border: `${6 - t * 5}px solid ${K.lime}`, opacity: 1 - t, zIndex: 40}} />}
    <div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: '50%', background: K.lime, opacity: (dark ? 0.35 : 0.25) * a, filter: 'blur(22px)', zIndex: 40}} />
    <div style={{position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${K.hi}, ${K.lime} 55%, ${K.lo})`, opacity: a,
      transform: `scale(${t >= 0 && t < 0.35 ? 0.75 : 1})`, boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 41}} />
  </>);
};
const Arrow = ({f, track, clicks = []}) => {
  if (f < track[0][0] || f > track[track.length - 1][0] + 10) return null;
  const x = kf(f, track.map(([t, xx]) => [t, xx])), y = kf(f, track.map(([t, , yy]) => [t, yy])); const ck = clicks.some((c) => f >= c && f < c + 5);
  return (<div style={{position: 'absolute', left: x, top: y, zIndex: 45, transform: `scale(${ck ? 0.85 : 1})`, transformOrigin: '4px 4px'}}>
    <svg width="56" height="68" viewBox="0 0 27 33" style={{filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))'}}><path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill={K.ink} stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
  </div>);
};

// little duotone "photos" for the camera roll
const PhotoArt = ({k, s}) => {
  const P = [
    ['#DCDBD3', <><circle cx="70" cy="30" r="14" fill={K.lime} /><path d="M0 100 L0 70 Q25 45 50 66 T100 58 L100 100Z" fill={K.ink} /></>],
    [K.ink, <><rect x="30" y="38" width="40" height="40" rx="8" fill="#fff" /><path d="M70 48 h8 a8 8 0 0 1 0 16 h-8" stroke="#fff" strokeWidth="5" fill="none" /><path d="M42 30 q-4 -8 2 -14 M56 30 q-4 -8 2 -14" stroke={K.lime} strokeWidth="4" fill="none" strokeLinecap="round" /></>],
    [K.lime, <><path d="M0 100 V62 h14 V40 h16 v22 h10 V28 h18 v34 h10 V48 h16 v52Z" fill={K.ink} /><rect x="46" y="36" width="6" height="6" fill={K.lime} /></>],
    ['#EFEFEA', <><path d="M50 90 V50" stroke={K.ink} strokeWidth="5" /><path d="M50 60 Q24 52 28 26 Q50 32 50 60 Q76 52 72 26 Q50 32 50 60" fill={K.lime} stroke={K.ink} strokeWidth="3" /></>],
    ['#2A2A2F', <><path d="M0 100 L34 46 L52 70 L70 38 L100 86 V100Z" fill="#DCDBD3" /><path d="M64 48 L70 38 L76 48Z" fill="#fff" /><circle cx="22" cy="24" r="9" fill={K.lime} /></>],
    ['#CFCEC6', <><path d="M0 56 Q25 44 50 56 T100 56 V100 H0Z" fill={K.ink} /><path d="M0 70 Q25 58 50 70 T100 70" stroke={K.lime} strokeWidth="4" fill="none" /></>],
    [K.lime, <><rect x="18" y="30" width="64" height="42" rx="6" fill={K.ink} /><rect x="10" y="72" width="80" height="6" rx="3" fill={K.ink} /><rect x="26" y="38" width="30" height="5" rx="2" fill={K.lime} /></>],
    ['#F4F4F0', <><circle cx="50" cy="52" r="20" fill={K.lime} />{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={50 + Math.cos(i) * 28} cy={52 + Math.sin(i) * 28} r="10" fill={K.ink} />)}</>],
    [K.ink, <><circle cx="50" cy="50" r="26" fill="none" stroke={K.lime} strokeWidth="6" /><circle cx="50" cy="50" r="10" fill="#fff" /></>],
  ][k % 9];
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{display: 'block'}}><rect width="100" height="100" fill={P[0]} />{P[1]}</svg>;
};
const Photo = ({k, s, video, r = 18, style = {}}) => (
  <div style={{width: s, height: s, borderRadius: r, overflow: 'hidden', position: 'relative', boxShadow: '0 10px 24px rgba(0,0,0,0.14)', ...style}}>
    <PhotoArt k={k} s={s} />
    {video && <div style={{position: 'absolute', right: 10, bottom: 10, background: 'rgba(14,14,16,0.75)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: s * 0.11, padding: '3px 10px', borderRadius: 8}}>▶ 0:10</div>}
  </div>
);

// ------------------------------------------------------------------ scenes
// 0: camera roll, then the lime blob swells over it
const S0 = ({f, W, B, E}) => {
  const b = W(0, 'paying') - 8; const g = spring(f - b, {w: 0.28, z: 0.6}); const fade = expo(f - b, 18);
  const panel = pop(f, B(0) + 1, {w: 0.3, z: 0.75});
  return (<>
    <div style={{position: 'absolute', left: 110, top: 300, width: 800, height: 960, borderRadius: 48, background: K.paper, boxShadow: '0 40px 90px rgba(0,0,0,0.14)', overflow: 'hidden',
      transform: `translateY(${(1 - panel) * 300}px) scale(${mix(1, 0.93, fade)})`, opacity: clamp01(panel * 2) * mix(1, 0.4, fade), filter: `blur(${fade * 9 + (1 - panel) * 12}px)`}}>
      <div style={{position: 'absolute', left: 40, top: 34, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: K.ink, letterSpacing: -2}}>Recents</div>
      <div style={{position: 'absolute', right: 40, top: 54, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: K.mut}}>1,284 items</div>
      <div style={{position: 'absolute', left: 28, top: 130, display: 'grid', gridTemplateColumns: 'repeat(3, 240px)', gap: 12, transform: `translateY(${-Math.max(0, f - 8) * 1.6}px)`}}>
        {Array.from({length: 15}, (_, i) => { const p = pop(f, B(0) + 3 + i * 1.4, {w: 0.5, z: 0.6});
          return <div key={i} style={{transform: `scale(${p})`, opacity: clamp01(p * 2)}}><Photo k={i} s={240} r={14} video={i % 4 === 2} /></div>; })}
      </div>
    </div>
    {g > 0 && <Blob x={CX} y={880} w={620 * g} h={620 * g} r={400} />}
  </>);
};
// 1: Adobe Stock pays per licence -> the blob turns into "0 followers."
const S1 = ({f, W, B, E}) => {
  const lic = W(1, 'licenses'); const m = expo(f - W(1, 'no') + 5, 12);
  const squash = [0, 1, 2].reduce((s, i) => s + 0.07 * Math.max(0, 1 - Math.abs(f - (lic - 4 + i * 7) - 2) / 5), 0);
  const w = mix(620, 840, m), h = mix(620, 250, m), y = mix(880 + Math.sin(f / 14) * 8, 900, m);
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 290}}>
      <BlurIn f={f} ats={[W(1, 'adobe') - 2, W(1, 'stock') - 2, W(1, 'pays') - 2, W(1, 'every') - 2, W(1, 'licenses') - 6]} text="Adobe Stock pays per licence." size={92} out={E(1) - 12} box={[4]} />
    </div>
    {[0, 1, 2].map((i) => { const t0 = lic - 22 + i * 7; const p = inOut(f - t0, 18); if (f < t0 || p >= 1) return null;
      const sx = [-200, 1240, 300][i], sy = [700, 760, 2100][i];
      return <div key={i} style={{position: 'absolute', left: mix(sx, CX, p) - 90, top: mix(sy, 880, p) - 90, transform: `scale(${mix(1, 0.2, p)}) rotate(${(1 - p) * (i - 1) * 40}deg)`, filter: `blur(${Math.sin(p * Math.PI) * 4}px)`}}><Photo k={i * 3 + 1} s={180} /></div>; })}
    <Blob x={CX} y={y} w={w * (1 + squash)} h={h * (1 - squash * 0.6)} r={mix(310, 60, m)}>
      {m > 0.2 && <BlurIn f={f} at={W(1, 'no') + 1} stagger={4} text="0 followers." size={128} />}
    </Blob>
    {[0, 1, 2].map((i) => { const t0 = lic - 4 + i * 7 + 2; const p = expo(f - t0, 22); if (f < t0 || f > t0 + 34) return null;
      return <div key={i} style={{position: 'absolute', left: CX - 150 + (i - 1) * 170, top: 620 - p * 170, opacity: 1 - clamp01((f - t0 - 20) / 14), transform: `scale(${pop(f, t0)})`}}><Tag size={40}>+ royalty</Tag></div>; })}
  </>);
};
// 2: the rates as floating tags
const TAGS = [['Photos', 'photos', 250, 640], ['Vectors', 'vectors', 760, 600], ['Illustrations', 'illustrations', 330, 1010], ['Videos', 'videos', 730, 1090]];
const S2 = ({f, W, B, E}) => {
  const s0 = B(2); const k = expo(f - s0, 6); const ex = E(2) - 12;
  const flyOut = expoIn(f - ex, 12);
  const p33 = pop(f, W(2, '33%') - 3, {w: 0.5, z: 0.5}), p35 = pop(f, W(2, '35%') - 3, {w: 0.5, z: 0.5});
  return (<>
    {k < 1 && <Blob x={CX} y={900} w={mix(840, 200, k)} h={mix(250, 200, k)} r={mix(60, 100, k)}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 128, letterSpacing: -6, opacity: 1 - k * 3, filter: `blur(${k * 20}px)`}}>0 followers.</div></Blob>}
    {f < ex + 2 && <div style={{position: 'absolute', left: 80, width: 860, top: 290}}>
      <BlurIn f={f} at={s0 + 3} stagger={3} text="Your cut of every licence" size={104} box={[2]} /></div>}
    <Explode f={f} at={ex} text="Your cut of every licence" size={104} x={CX} y={290} seed={3} />
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: 1 - flyOut}}>
      {[0, 1, 2].map((i) => { const [, , x, y] = TAGS[i]; const d = expo(f - W(2, '33%') - i * 2, 12);
        return <line key={i} x1={300} y1={840} x2={mix(300, x, d)} y2={mix(840, y + 30, d)} stroke={K.ink} strokeWidth="4" strokeDasharray="10 10" />; })}
      {(() => { const d = expo(f - W(2, '35%'), 12); return <line x1={660} y1={1250} x2={mix(660, 730, d)} y2={mix(1250, 1120, d)} stroke={K.ink} strokeWidth="4" strokeDasharray="10 10" />; })()}
    </svg>
    {TAGS.map(([label, word, x, y], i) => { const t = W(2, word) - 4; const mv = expo(f - Math.min(t, s0 + 2 + i * 2), 14); const tg = pop(f, t, {w: 0.5, z: 0.55});
      const bob = Math.sin(f / 13 + i * 1.7) * 10; const ox = (x - CX) * flyOut * 1.6, oy = (y - 900) * flyOut * 1.6;
      return (<React.Fragment key={i}>
        {k >= 1 && <Blob x={mix(CX, x - 70, mv) + ox} y={mix(900, y + 46, mv) + bob + oy} w={mix(200, 96, mv)} h={mix(200, 96, mv)} r={100} glow={0.8} />}
        <div style={{position: 'absolute', left: x + ox, top: y + bob + oy, transform: `translate(-50%, 0) scale(${tg}) rotate(${(i % 2 ? 1 : -1) * 4}deg)`, opacity: clamp01(tg * 2), filter: `blur(${(1 - clamp01(tg)) * 10 + flyOut * 14}px)`}}>
          <Tag size={46}>{label}</Tag></div>
      </React.Fragment>); })}
    <div style={{position: 'absolute', left: 300, top: 800, transform: `translate(-50%, 0) scale(${p33 * (1 - flyOut)}) rotate(-6deg)`}}><Tag dark size={96}>33%</Tag></div>
    <div style={{position: 'absolute', left: 640, top: 1210, transform: `translate(-50%, 0) scale(${p35 * (1 - flyOut)}) rotate(5deg)`}}><Tag dark size={96} style={{color: K.lime}}>35%</Tag></div>
  </>);
};
// 3: giant cropped type, "the catch"
const S3 = ({f, W, B, E}) => {
  const t = f - B(3); const drift = -t * 2.2; const c = W(3, 'catch');
  const p1 = expo(t + 4, 10), p2 = pop(f, c - 4, {w: 0.5, z: 0.6});
  return (<>
    <MB id="s3a" x={(1 - p1) * 40}><div style={{position: 'absolute', left: 60 + drift + (1 - p1) * 500, top: 560, fontFamily: FONT, fontWeight: 900, fontSize: 250, letterSpacing: -14, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1}}>here's</div></MB>
    <div style={{position: 'absolute', left: 40 - drift * 1.4 - (1 - p2) * 300, top: 830, transform: `scale(${mix(1.3, 1, p2)})`, transformOrigin: 'left center', opacity: clamp01(p2 * 2), whiteSpace: 'nowrap'}}>
      <span style={{display: 'inline-block', background: '#fff', color: K.ink, fontFamily: FONT, fontWeight: 900, fontSize: 250, letterSpacing: -14, lineHeight: 1, padding: '0 30px 18px', borderRadius: 24}}>the catch</span></div>
    <div style={{position: 'absolute', left: 80, width: 860, top: 1150}}><BlurIn f={f} at={W(3, 'nobody') - 2} text="nobody mentions" size={64} color="#8D8D88" weight={800} /></div>
    <div style={{position: 'absolute', left: 120, top: 1105, width: 780, height: 8, borderRadius: 4, background: K.red, transform: `scaleX(${expo(f - c, 14)})`, transformOrigin: 'left'}} />
  </>);
};
// 4: dark UI card with depth of field: what one licence can pay
const S4 = ({f, W, B, E}) => {
  const t = f - B(4); const e = expo(t, 22); const sub = W(4, 'subscription'), one = W(4, 'one'), val = W(4, '$0.33');
  const chip = (txt, on, w) => (
    <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 70, padding: '0 26px', minWidth: w, borderRadius: 35, fontFamily: FONT, fontWeight: 800, fontSize: 32,
      background: on ? '#fff' : '#26262B', color: on ? K.ink : '#C9C9C4', boxShadow: on ? `0 0 0 4px ${K.lime}, 0 0 40px rgba(205,242,79,0.45)` : 'none'}}>{txt}</div>);
  const n = Math.min(33, Math.round(33 * expo(f - val + 8, 16)));
  return (<>
    <div style={{position: 'absolute', left: 80, top: 300, width: 860, height: 960, perspective: 1600}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: K.card, border: `2px solid ${K.line}`, boxShadow: '0 50px 120px rgba(0,0,0,0.55)',
        transform: `rotateX(${mix(24, 0, e) + Math.sin(f / 30) * 1.5}deg) rotateZ(${mix(-4, 0, e)}deg) translateY(${(1 - e) * 200}px) scale(${mix(0.9, 1, e)})`, filter: `blur(${(1 - e) * 14}px)`, opacity: clamp01(e * 2)}}>
        <Mono size={24} color={K.lime} style={{position: 'absolute', left: 50, top: 46}}>● Adobe Stock · royalty floor</Mono>
        <div style={{position: 'absolute', left: 50, top: 100, width: 780}}><BlurIn f={f} at={B(4) + 6} text="What one licence can pay" size={74} color="#fff" align="left" box={[3, 4]} /></div>
        <div style={{position: 'absolute', left: 50, top: 300, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#9A9A94'}}>Plan</div>
        <div style={{position: 'absolute', left: 50, top: 346, display: 'flex', gap: 14}}>{chip('Single', false)}{chip('Big plan · 350+/mo', f > sub + 6)}</div>
        <div style={{position: 'absolute', left: 50, top: 456, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#9A9A94'}}>Your lifetime licences</div>
        <div style={{position: 'absolute', left: 50, top: 502, display: 'flex', gap: 14}}>
          {[['0–999', '$0.33'], ['1k–9,999', '$0.36'], ['10k+', '$0.38']].map(([a, v], i) => (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: clamp01(expo(f - sub - 4 - i * 3, 10))}}>{chip(a, i === 0 && f > one + 8, 220)}
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: i === 0 ? K.lime : '#77776F'}}>{v} min</div></div>))}
        </div>
        <div style={{position: 'absolute', left: 50, right: 50, top: 700, height: 210, borderRadius: 32, background: '#111114', border: `2px solid ${K.line}`, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 30}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#9A9A94', width: 230, lineHeight: 1.2}}>as little as, per licence</div>
          <div style={{background: K.lime, color: K.ink, borderRadius: 26, padding: '6px 30px 10px', fontFamily: FONT, fontWeight: 900, fontSize: 130, letterSpacing: -6,
            transform: `scale(${mix(0.6, 1, pop(f, val - 8))})`, opacity: clamp01(pop(f, val - 8) * 2), filter: `blur(${(1 - clamp01(expo(f - val + 8, 10))) * 8}px)`}}>${`0.${String(n).padStart(2, '0')}`}</div>
        </div>
      </div>
    </div>
    <Glow f={f} dark track={[[sub - 14, 900, 1300], [sub + 4, 640, 682], [one - 2, 640, 682], [one + 6, 210, 838], [val - 6, 210, 838], [val + 10, 560, 1110], [E(4), CX, 1010]]} clicks={[sub + 4, one + 6, val + 8]} />
  </>);
};
// 5: lime, stacked cards with the payout maths
const S5 = ({f, W, B, E}) => {
  const rows = [
    {at: B(5) + 4, k: 'Per licence, at the floor', v: '$0.33', tag: 'Royalty'},
    {at: W(5, '$25') - 6, k: 'Minimum payout', v: '$25', tag: 'PayPal · Payoneer · Skrill'},
    {at: W(5, '76') - 10, k: 'Sales to reach it', v: <>$25 ÷ $0.33 ≈ <span style={{background: K.ink, color: K.lime, borderRadius: 16, padding: '0 16px'}}>76</span></>, tag: 'Example maths'},
  ];
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 280}}><BlurIn f={f} at={B(5) + 2} text="Your first payout" size={104} /></div>
    {rows.map((r, i) => { const p = pop(f, r.at, {w: 0.32, z: 0.7}); if (f < r.at - 1) return null;
      return (
        <div key={i} style={{position: 'absolute', left: 110, top: 470 + i * 236, width: 800, height: 210, borderRadius: 36, background: K.paper, boxShadow: '0 26px 60px rgba(60,80,0,0.22)',
          transform: `translateY(${(1 - p) * 520}px) rotate(${(1 - p) * (i % 2 ? 5 : -5)}deg)`, filter: `blur(${(1 - clamp01(p)) * 10}px)`}}>
          <div style={{position: 'absolute', left: 40, top: 28, fontFamily: FONT, fontWeight: 800, fontSize: 36, color: K.ink}}>{r.k}</div>
          <div style={{position: 'absolute', left: 38, top: 78, fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: -4, color: K.ink, lineHeight: 1}}>{r.v}</div>
          <Mono size={20} color="#4C7A1A" style={{position: 'absolute', right: 34, bottom: 22}}>{r.tag}</Mono>
          <div style={{position: 'absolute', left: 40, right: 40, bottom: 58, height: 2, background: '#E4E4DD'}} />
        </div>); })}
    <Mono size={22} style={{position: 'absolute', left: 0, right: 0, top: 1196, textAlign: 'center', opacity: expo(f - W(5, '76'), 10)}}>Example at the $0.33 floor · not a promise</Mono>
  </>);
};
// 6: dark counter: 45 days
const S6 = ({f, W, B, E}) => {
  const c = W(6, '45'); const n = Math.round(45 * expo(f - c + 14, 26)); const prev = Math.max(0, n - 3);
  const roll = (f - c + 14) >= 0 && n < 45 ? ((f * 0.5) % 1) : 0;
  return (<>
    <div style={{position: 'absolute', left: 95, top: 330, display: 'grid', gridTemplateColumns: 'repeat(9, 86px)', gap: 12, filter: 'blur(2.5px)', opacity: 0.85}}>
      {Array.from({length: 45}, (_, i) => { const on = i < n; return (
        <div key={i} style={{width: 86, height: 86, borderRadius: 18, background: on ? '#2B3410' : '#1C1C20', border: `2px solid ${on ? '#55681C' : '#26262B'}`, position: 'relative', opacity: clamp01(expo(f - B(6) - i * 0.4, 8))}}>
          <div style={{position: 'absolute', left: 12, top: 12, width: 14, height: 14, borderRadius: 7, background: on ? K.lime : '#55681C'}} /></div>); })}
    </div>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 520, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 420, letterSpacing: -24, color: '#fff', lineHeight: 1}}>
      {roll > 0 && <span style={{position: 'absolute', left: 0, right: 0, opacity: 0.25, transform: `translateY(${-roll * 60}px)`, filter: 'blur(6px)'}}>{prev}</span>}
      <span style={{display: 'inline-block', transform: `translateY(${roll * 30}px) scale(${1 + 0.06 * Math.max(0, 1 - Math.abs(f - c - 12) / 6)})`, opacity: clamp01(expo(f - c + 16, 6))}}>{n}</span>
    </div>
    <Mono size={30} color="#fff" style={{position: 'absolute', left: 0, width: 1020, top: 960, textAlign: 'center', opacity: expo(f - c, 10)}}>days to your first payout</Mono>
    <div style={{position: 'absolute', left: 160, top: 1110, width: 700, height: 14, borderRadius: 7, background: '#26262B'}}>
      <div style={{width: `${(n / 45) * 100}%`, height: 14, borderRadius: 7, background: K.lime, boxShadow: '0 0 24px rgba(205,242,79,0.6)'}} /></div>
    <div style={{position: 'absolute', left: 160, top: 1150, width: 700, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#C9C9C4', opacity: expo(f - W(6, 'after') + 4, 10)}}>
      <span>1st sale</span><span style={{color: K.lime}}>payout</span></div>
  </>);
};
// 7: blob with a tax form -> 30%
const S7 = ({f, W, B, E}) => {
  const p = pop(f, B(7) + 2, {w: 0.4, z: 0.55}); const flip = W(7, '30%') - 6; const fl = clamp01((f - flip) / 8); const sx = Math.abs(Math.cos(fl * Math.PI)); const after = fl > 0.5;
  const sh = f > W(7, '30%') && f < W(7, '30%') + 10 ? Math.sin((f - W(7, '30%')) * 2.4) * 12 * (1 - (f - W(7, '30%')) / 10) : 0;
  return (<>
    {after && [0, 1].map((k) => { const t = ((f - flip + k * 14) % 28) / 28; return <div key={k} style={{position: 'absolute', left: CX - 170 * (1 + t * 0.8), top: 640 - 170 * (1 + t * 0.8), width: 340 * (1 + t * 0.8), height: 340 * (1 + t * 0.8), borderRadius: '50%', border: `6px solid ${K.lime}`, opacity: (1 - t) * 0.7}} />; })}
    <Blob x={CX + sh} y={640} w={340 * p} h={340 * p} r={200}>
      <div style={{transform: `scaleX(${sx})`}}>
        {!after ? <svg width="150" height="180" viewBox="0 0 30 36"><path d="M4 2 H20 L26 8 V34 H4 Z" fill="#fff" stroke={K.ink} strokeWidth="2.4" strokeLinejoin="round" /><path d="M9 14 H21 M9 19 H21 M9 24 H16" stroke={K.ink} strokeWidth="2.4" strokeLinecap="round" /><path d="M20 2 V8 H26" fill="none" stroke={K.ink} strokeWidth="2.4" /></svg>
          : <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 132, letterSpacing: -7, color: K.ink}}>30%</div>}
      </div>
    </Blob>
    <div style={{position: 'absolute', left: 80, width: 860, top: 870}}>
      <BlurIn f={f} ats={[W(7, 'no') - 2, W(7, 'tax') - 2, W(7, 'form') - 2, W(7, 'on') - 2, W(7, 'file') - 2]} text="No tax form on file?" size={104} color="#fff" box={[1, 2]} /></div>
    {(() => { const q = pop(f, W(7, 'hold') - 4, {w: 0.5, z: 0.5}); return (
      <div style={{position: 'absolute', left: CX, top: 1140, transform: `translate(-50%, 0) scale(${q}) rotate(-3deg)`}}>
        <Tag size={52} style={{background: K.red, color: '#fff'}}>Up to 30% held back</Tag></div>); })()}
  </>);
};
// 8: the four steps, rows sharpen as they are said
const STEPS = [['join', 'Join as a contributor (free)'], ['upload', 'Upload phone photos + clips'], ['keywords', 'Add honest keywords'], ['review', 'Pass review, then wait']];
const S8 = ({f, W, B, E}) => (<>
  <div style={{position: 'absolute', left: 80, width: 860, top: 280}}><BlurIn f={f} at={B(8) + 3} text="Start this week" size={104} /></div>
  {STEPS.map(([w, t], i) => { const a = W(8, w) - 4; const on = expo(f - a, 10); const enter = pop(f, B(8) + 4 + i * 3, {w: 0.4, z: 0.7});
    return (
      <div key={i} style={{position: 'absolute', left: 100, top: 470 + i * 170, width: 820, height: 138, borderRadius: 30, background: K.paper, boxShadow: `0 ${10 + on * 16}px ${24 + on * 30}px rgba(0,0,0,${0.08 + on * 0.08})`,
        transform: `translateX(${(1 - enter) * 600 + (1 - on) * 30}px) scale(${mix(0.96, 1, on)})`, filter: `blur(${(1 - on) * 3.5}px)`, opacity: clamp01(enter * 2) * mix(0.45, 1, on), display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px'}}>
        <div style={{width: 76, height: 76, borderRadius: 20, background: on > 0.5 ? K.ink : '#D6D5CE', color: on > 0.5 ? K.lime : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30}}>{`0${i + 1}`}</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: -1.5, color: K.ink, flex: 1}}>{t}</div>
        <div style={{width: 60, height: 60, borderRadius: 30, background: K.lime, transform: `scale(${pop(f, a + 6, {w: 0.55, z: 0.5})})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12.5 L10 17 L19 7" stroke={K.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
      </div>); })}
</>);
// 9: lime block morphs into a phone that records a 10 s clip
const S9 = ({f, W, B, E}) => {
  const m = inOut(f - B(9) - 2, 18); const w = mix(840, 470, m), h = mix(250, 820, m), y = mix(900, 840, m);
  const rec = W(9, 'film') - 4; const secs = Math.min(10, Math.max(0, Math.floor((f - rec) / 3)));
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 260}}><BlurIn f={f} at={B(9) + 2} text="Clips earn more" size={92} out={E(9) - 8} box={[2]} /></div>
    <Blob x={CX} y={y} w={w} h={h} r={mix(60, 70, m)} style={{border: `${m * 16}px solid ${K.ink}`}}>
      {m > 0.6 && <div style={{position: 'absolute', inset: 0, background: '#2A2A2F', opacity: clamp01((m - 0.6) * 3)}}>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1.15 + Math.sin(f / 20) * 0.03})`}}><PhotoArt k={4} s={440} /></div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><span style={{background: secs > 0 ? K.lime : 'rgba(0,0,0,0.5)', color: secs > 0 ? K.ink : '#fff', fontFamily: MONO, fontWeight: 700, fontSize: 30, padding: '6px 18px', borderRadius: 10}}>00:{String(secs).padStart(2, '0')}</span></div>
        <div style={{position: 'absolute', left: '50%', bottom: 46, width: 110, height: 110, marginLeft: -55, borderRadius: 55, border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: f > rec ? 48 : 84, height: f > rec ? 48 : 84, borderRadius: f > rec ? 12 : 42, background: K.lime}} /></div>
      </div>}
    </Blob>
    <div style={{position: 'absolute', left: 230, top: 520, transform: `translate(-50%, 0) scale(${pop(f, W(9, 'higher') - 4, {w: 0.5, z: 0.5})}) rotate(-8deg)`}}><Tag dark size={88} style={{color: K.lime}}>35%</Tag></div>
    <div style={{position: 'absolute', left: 760, top: 1140, transform: `translate(-50%, 0) scale(${pop(f, W(9, 'ten') - 4, {w: 0.5, z: 0.5})}) rotate(5deg)`}}><Tag size={44}>10 s of everything</Tag></div>
  </>);
};
// 10: ending 1, comment STOCK, the guide is free
const S10 = ({f, W, B, E}) => {
  const s = W(10, 'stock') - 6; const typed = 'STOCK'.slice(0, typedCount(f, s, 5, 4, 0.8)); const card = pop(f, B(10) + 2, {w: 0.35, z: 0.7}); const fr = W(10, 'free') - 4;
  return (<>
    <div style={{position: 'absolute', left: 110, top: 330, width: 800, height: 300, borderRadius: 40, background: K.paper, boxShadow: '0 30px 70px rgba(60,80,0,0.25)', transform: `translateY(${(1 - card) * 400}px) rotate(${(1 - card) * -6}deg)`, filter: `blur(${(1 - clamp01(card)) * 10}px)`}}>
      <div style={{position: 'absolute', left: 40, top: 40, width: 90, height: 90, borderRadius: 45, background: K.ink, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48}}>?</div>
      <div style={{position: 'absolute', left: 156, top: 44, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: K.mut}}>Add a comment</div>
      <div style={{position: 'absolute', left: 154, top: 92, fontFamily: FONT, fontWeight: 900, fontSize: 120, letterSpacing: -4, color: K.ink, lineHeight: 1}}>{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: K.lo}}>|</span></div>
      <div style={{position: 'absolute', right: 40, top: 44, transform: `scale(${1 + 0.4 * Math.max(0, 1 - Math.abs(f - s - 14) / 6)})`}}>
        <svg width="56" height="56" viewBox="0 0 24 24"><path d="M12 21 C 5 15, 2 12, 2 8 A5 5 0 0 1 12 6 A5 5 0 0 1 22 8 C 22 12, 19 15, 12 21Z" fill={f > s + 12 ? K.ink : 'none'} stroke={K.ink} strokeWidth="2" /></svg></div>
    </div>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 690, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -16, color: K.ink, lineHeight: 1,
      transform: `scale(${mix(1.5, 1, pop(f, fr))})`, opacity: clamp01(pop(f, fr) * 2), filter: `blur(${(1 - clamp01(expo(f - fr, 10))) * 16}px)`, textShadow: '0 30px 50px rgba(60,80,0,0.35)'}}>$0</div>
    <div style={{position: 'absolute', left: CX, top: 1040, transform: `translate(-50%, 0) scale(${pop(f, W(10, 'guide') - 2)})`}}><Tag dark size={50}>Free guide</Tag></div>
    <div style={{position: 'absolute', left: CX, top: 1150, transform: `translate(-50%, 0) scale(${pop(f, W(10, 'grab') - 2)})`}}><Tag size={42}>or subcreatorpaid.com</Tag></div>
  </>);
};
// 11: ending 2, the website: type the address, the real home page, click the finder
const S11 = ({f, W, B, E}) => {
  const t0 = B(11) + 2; const url = 'subcreatorpaid.com'; const n = typedCount(f, t0, url.length, 9, 1.6); const page = pop(f, t0 + 18, {w: 0.32, z: 0.75});
  const click = Math.min(E(11) - 22, t0 + 46); const swap = expo(f - click - 3, 10);
  const lg = pop(f, B(11), {w: 0.45, z: 0.6});
  return (<>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 270, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${lg})`}}>
      <div style={{width: 64, height: 64, borderRadius: 16, background: K.ink, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 42}}>$</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: -2, color: K.ink}}>sub-creator paid</div></div>
    <div style={{position: 'absolute', left: 110, top: 380, width: 800, height: 830, borderRadius: 40, background: '#F2F1EC', boxShadow: '0 40px 90px rgba(60,80,0,0.3)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 22, height: 84, borderRadius: 42, background: '#E2E1DA', display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: FONT, fontWeight: 800, fontSize: 44, color: K.ink, letterSpacing: -1}}>
        {url.slice(0, n)}<span style={{opacity: n < url.length || Math.floor(f / 8) % 2 ? 1 : 0, marginLeft: 2, fontWeight: 400}}>|</span></div>
      <div style={{position: 'absolute', left: 0, top: 124, width: 800, height: 706, overflow: 'hidden', transform: `translateY(${(1 - page) * 300}px)`, opacity: clamp01(page * 2), filter: `blur(${(1 - clamp01(page)) * 12}px)`}}>
        <img src={staticFile('a_home.png')} style={{position: 'absolute', left: 0, top: -20 - swap * 40, width: 800, opacity: 1 - swap, filter: `blur(${swap * 10}px)`}} />
        <img src={staticFile('a_finder.png')} style={{position: 'absolute', left: 0, top: (1 - swap) * 200, width: 800, opacity: swap}} />
      </div>
    </div>
    <Arrow f={f} track={[[t0 + 26, 900, 1300], [click - 2, 420, 900], [E(11) + 4, 420, 900]]} clicks={[click]} />
    <Mono size={20} style={{position: 'absolute', left: 0, width: 1020, top: 1236, textAlign: 'center'}}>Not financial advice</Mono>
  </>);
};
// 12: ending 3, the tool
const S12 = ({f, W, B, E}) => {
  const c = pop(f, W(12, 'tool') - 6, {w: 0.35, z: 0.65});
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 290}}><BlurIn f={f} at={B(12) + 2} text="The tool I'd start with" size={96} box={[1]} /></div>
    <div style={{position: 'absolute', left: 160, top: 560, width: 700, height: 470, borderRadius: 44, background: K.paper, boxShadow: '0 40px 90px rgba(0,0,0,0.16)', transform: `translateY(${(1 - c) * 500}px) rotate(${(1 - c) * 8}deg)`, filter: `blur(${(1 - clamp01(c)) * 10}px)`}}>
      <div style={{position: 'absolute', left: 50, top: 50, width: 170, height: 170, borderRadius: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.18), 0 0 70px rgba(205,242,79,0.7)', transform: `rotate(${Math.sin(f / 14) * 4}deg)`}}>
        <BrandLogo name="fiverr" size={110} /></div>
      <div style={{position: 'absolute', left: 250, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: 84, letterSpacing: -3, color: K.ink}}>Fiverr</div>
      <div style={{position: 'absolute', left: 252, top: 168, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: K.mut}}>Freelance marketplace</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 268, fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: -1, color: K.ink, lineHeight: 1.15}}>Sell photo + video shoots as gigs</div>
      <div style={{position: 'absolute', left: 50, top: 382}}><Tag dark size={30}><span style={{color: K.lime}}>●</span> Affiliate link</Tag></div>
    </div>
    <div style={{position: 'absolute', left: CX, top: 1110, transform: `translate(-50%, 0) scale(${pop(f, W(12, 'linked') - 3, {w: 0.5, z: 0.5})})`}}><Tag size={52} style={{background: K.lime}}>Link in bio ↑</Tag></div>
  </>);
};
// 13: ending 4, follow
const S13 = ({f, W, B, E}) => {
  const m = pop(f, B(13) + 2, {w: 0.42, z: 0.55}); const fo = W(13, 'follow') + 6; const done = f > fo + 3;
  return (<>
    <Blob x={CX} y={600} w={260 * m} h={260 * m} r={70} style={{background: K.ink, boxShadow: '0 40px 80px rgba(60,80,0,0.4)'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170 * m, color: K.lime}}>S</div></Blob>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 770}}><BlurIn f={f} at={B(13) + 6} text="@subcreatorpaid" size={76} /></div>
    <div style={{position: 'absolute', left: CX - 230, top: 900, width: 460, height: 120, borderRadius: 60, background: done ? K.paper : K.ink, color: done ? K.ink : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      fontFamily: FONT, fontWeight: 900, fontSize: 52, transform: `scale(${pop(f, B(13) + 8) * (f >= fo && f < fo + 4 ? 0.92 : 1)})`, boxShadow: '0 24px 50px rgba(0,0,0,0.2)'}}>{done ? 'Following ✓' : 'Follow'}</div>
    <Glow f={f} track={[[fo - 16, 860, 1300], [fo, CX + 175, 985], [E(13) + 10, CX + 175, 985]]} clicks={[fo]} />
    <div style={{position: 'absolute', left: 80, width: 860, top: 1090}}><BlurIn f={f} at={W(13, 'verified') - 2} text="1 verified stream a week" size={58} weight={800} /></div>
  </>);
};
const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13];

// ------------------------------------------------------------------ captions (white word-by-word pill, like the reference)
const useChunks = (beats) => {
  const out = [];
  beats.forEach((b) => {
    const ws = (b.words || []).filter((w) => /[\w$%]/.test(w.w)); let cur = [];
    ws.forEach((w, i) => { cur.push(w); const end = /[.,?!:]$/.test(w.w) || cur.length >= 3 || i === ws.length - 1; if (end) { out.push(cur); cur = []; } });
  });
  return out;
};
const Caption = ({f, chunks, tone}) => {
  const idx = chunks.findIndex((c, i) => f >= c[0].f - 1 && (i === chunks.length - 1 || f < chunks[i + 1][0].f - 1));
  if (idx < 0) return null; const c = chunks[idx]; const last = c[c.length - 1]; if (f > last.f + 26) return null;
  const shown = c.filter((w) => f >= w.f - 1).map((w) => w.w.replace(/[.,:]$/, '')).join(' ');
  return (
    <div style={{position: 'absolute', left: 0, width: 1020, top: 1330, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <span style={{background: '#fff', color: K.ink, fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: -1, padding: '6px 20px 10px', borderRadius: 12,
        boxShadow: tone === 'dark' ? 'none' : '0 8px 24px rgba(0,0,0,0.14)', transform: `scale(${mix(0.9, 1, expo(f - c[0].f + 1, 5))})`}}>{shown}</span>
    </div>
  );
};

export const Fluid = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W, E} = useTimes(beats);
  const nb = beats.length; const chunks = useChunks(beats);
  const T = (i) => B(i) - 3; // boundary time into scene i
  const layer = (i) => {
    const S = SCENES[i]; if (!S) return null;
    const a = i > 0 ? T(i) - TW : -1, b = i < nb - 1 ? T(i + 1) + TW : 1e9; if (f < a || f > b) return null;
    const tin = i > 0 ? TR[i] : 'cut', tout = i < nb - 1 ? TR[i + 1] : 'cut';
    const ein = i > 0 ? inOut(f - (T(i) - TW), 2 * TW) : 1; const eout = i < nb - 1 ? inOut(f - (T(i + 1) - TW), 2 * TW) : 0;
    let tf = '', op = 1, blur = 0, mbx = 0, mby = 0, clip;
    // entering
    if (ein < 1) {
      if (tin === 'cut') { if (f < T(i)) return null; }
      else if (tin === 'whipX') { tf += `translateX(${(1 - ein) * 1080}px)`; mbx = Math.sin(Math.PI * ein) * 60; }
      else if (tin === 'whipY') { tf += `translateY(${(1 - ein) * 1920}px)`; mby = Math.sin(Math.PI * ein) * 70; }
      else if (tin === 'push') { tf += `translateY(${(1 - ein) * 1920}px)`; mby = Math.sin(Math.PI * ein) * 30; }
      else if (tin === 'zoom') { tf += `scale(${mix(0.7, 1, ein)})`; op = ein; blur = (1 - ein) * 20; }
      else if (tin === 'soft') { tf += `scale(${mix(0.94, 1, ein)})`; op = ein; blur = (1 - ein) * 18; }
      else if (tin === 'iris') { const [x, y] = IRIS_AT[i]; clip = `circle(${ein * 2300}px at ${x}px ${y}px)`; }
    }
    // leaving
    if (eout > 0) {
      if (tout === 'cut') { if (f >= T(i + 1)) return null; }
      else if (tout === 'whipX') { tf += ` translateX(${-eout * 1080}px)`; mbx = Math.sin(Math.PI * eout) * 60; }
      else if (tout === 'whipY') { tf += ` translateY(${-eout * 1920}px)`; mby = Math.sin(Math.PI * eout) * 70; }
      else if (tout === 'push') { tf += ` translateY(${-eout * 1920}px)`; mby = Math.sin(Math.PI * eout) * 30; }
      else if (tout === 'zoom') { tf += ` scale(${mix(1, 2.4, eout)})`; op = 1 - eout; blur = eout * 24; }
      else if (tout === 'soft') { tf += ` scale(${mix(1, 1.08, eout)})`; op = 1 - eout; blur = eout * 18; }
      else if (tout === 'iris') { if (eout >= 1) return null; }
    }
    const Scene = S;
    return (
      <div key={i} style={{position: 'absolute', inset: 0, background: BG[SCENE_BG[i]], transform: tf, transformOrigin: '510px 860px', opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, clipPath: clip, overflow: 'hidden'}}>
        <MB id={`L${i}`} x={mbx} y={mby}><Scene f={f} W={W} B={B} E={E} /></MB>
      </div>
    );
  };
  const beat = (() => { for (let i = nb - 1; i >= 0; i--) if (f >= T(i)) return i; return 0; })();
  const tone = SCENE_BG[beat];
  const lime = tone === 'lime';
  return (
    <AbsoluteFill style={{background: BG[SCENE_BG[0]], overflow: 'hidden', fontFamily: FONT}}>
      {SCENES.map((_, i) => layer(i))}
      <div style={{position: 'absolute', left: 0, width: 1020, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, zIndex: 50}}>
        <div style={{width: 58, height: 58, borderRadius: 16, background: tone === 'dark' ? K.lime : K.ink, color: tone === 'dark' ? K.ink : K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38}}>S</div>
        <div style={{fontWeight: 800, fontSize: 42, letterSpacing: -1, color: tone === 'dark' ? '#fff' : K.ink}}>@subcreatorpaid</div>
      </div>
      {!lime || true ? <Caption f={f} chunks={chunks} tone={tone} /> : null}
    </AbsoluteFill>
  );
};
