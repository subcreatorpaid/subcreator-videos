// Film 5, "Case file" (owner, 31 Oct 2026: "make a short video keeping the reference in the folder of my drive ... take reference of
// the animations, kinetic typo animations, transitions, sound effects and flow ... keep the color scheme same").
// Cues taken from the two Drive reference explainers, rebuilt in our palette (backdrop #E3E3DB / white / ink / lime, red only for loss):
// - graph-paper backdrop, mono case header ("CASE FILE #01 · ..."), flat outlined objects that stay on screen and gain parts beat by beat
// - a source card (mono kicker + bold claim, accent bar) for every fact, counters that roll, labelled bars that fill
// - word-by-word caption pill (spoken words white, the rest grey, numbers lime)
// - the "X-ray": a glowing scan line sweeps up into a dark blueprint version of the same object, and back down to leave it
// - a hand/pointer that taps each example, a rubber stamp to close the case, then a logo lockup with "Follow for more"
// One continuous take: scene A (the claim) and scene C (what pays first) sit side by side and the camera whips between them.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, staticFile} from 'remotion';
import {FONT} from '../Short';
import {Logo} from '../graphics';
import {expo, expoIn, inOut, spring, kf, mix, clamp01, useTimes} from './kit';
import {StreamArt, BrandLogo, Check} from './art';
import {Burst, Pulse} from './Launch';

const K = {bg: '#E3E3DB', ui: '#0E0E10', lime: '#CDF24F', mut: '#5F5E58', grey: '#8B8B86', line: '#CFCEC4', red: '#D93A3A', paper: '#F5F5F2'};
const MONO = '"MonoX", "JetBrains Mono", "DejaVu Sans Mono", monospace';
const ART = {ink: '#0E0E10', a: '#fff', b: '#FFFFFF', c: '#2E2E33', rec: '#0E0E10', recInk: '#CDF24F'};
const pop = (f, at, o = {w: 0.42, z: 0.6}) => spring(f - at, o);
const count = (f, at, to, d = 20, from = 0) => Math.round(from + (to - from) * expo(f - at, d));
const fmt = (n) => n.toLocaleString('en-US');

const Mono = ({children, size = 26, color = K.mut, style = {}}) => (
  <span style={{fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.12, color, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
const Chip = ({children, bg = '#fff', color = K.ui, size = 26, border = K.ui, style = {}}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color, border: `4px solid ${border}`, borderRadius: 14, padding: `${size * 0.3}px ${size * 0.6}px`,
    fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.08, textTransform: 'uppercase', whiteSpace: 'nowrap', ...style}}>{children}</span>
);
const Money = ({children, size = 76}) => (
  <span style={{display: 'inline-block', background: K.lime, color: K.ui, borderRadius: size * 0.22, padding: `${size * 0.08}px ${size * 0.3}px ${size * 0.02}px`, fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.03, border: `5px solid ${K.ui}`, boxShadow: `0 ${size * 0.12}px 0 ${K.ui}`}}>{children}</span>
);
// source card: mono kicker + bold claim, accent bar on the left (reference: "CARMINE GALLO · FORBES · 2012")
const Source = ({kicker, children, x = 100, y = 250, w = 880, p = 1, bar = K.lime, dark}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateY(${(1 - p) * -420}px) rotate(${(1 - p) * -6}deg)`, opacity: clamp01(p * 3)}}>
    <div style={{position: 'relative', background: dark ? '#17171A' : '#fff', border: `4px solid ${dark ? K.lime : K.ui}`, borderRadius: 22, padding: '22px 30px 24px 50px', boxShadow: dark ? '0 0 40px rgba(205,242,79,0.25)' : '0 18px 0 rgba(14,14,16,0.08), 0 24px 50px rgba(0,0,0,0.12)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: bar, borderRadius: '18px 0 0 18px', borderRight: `4px solid ${dark ? K.lime : K.ui}`}} />
      <Mono size={22} color={dark ? '#9FB54A' : K.grey}>{kicker}</Mono>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, lineHeight: 1.18, color: dark ? '#fff' : K.ui, marginTop: 8}}>{children}</div>
    </div>
  </div>
);
// labelled bar (reference: "FEELS LIKE MINE" bars)
const Bar = ({label, value, p, color = K.lime, x = 120, y, w = 840, dark, marker}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 12}}><Mono size={24} color={dark ? '#A7A7A0' : K.mut}>{label}</Mono><Mono size={24} color={dark ? K.lime : K.ui}>{value}</Mono></div>
    <div style={{position: 'relative', height: 34, borderRadius: 17, border: `4px solid ${dark ? K.lime : K.ui}`, background: dark ? '#141416' : '#fff', overflow: 'visible'}}>
      <div style={{position: 'absolute', left: 4, top: 4, bottom: 4, width: `calc(${clamp01(p) * 100}% - 8px)`, borderRadius: 10, background: color, boxShadow: dark ? `0 0 18px ${color}` : 'none'}} />
      {marker}
    </div>
  </div>
);
// flat outlined phone; `blue` = blueprint (x-ray) version
const Phone = ({x, y, s = 1, children, xray}) => (
  <div style={{position: 'absolute', left: x - 200, top: y - 360, width: 400, height: 720, transform: `scale(${s})`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 64, border: `${xray ? 5 : 10}px solid ${xray ? K.lime : K.ui}`, background: xray ? 'rgba(205,242,79,0.05)' : '#fff',
      boxShadow: xray ? `0 0 40px rgba(205,242,79,0.55), inset 0 0 30px rgba(205,242,79,0.25)` : `0 26px 0 rgba(14,14,16,0.10), 0 40px 80px rgba(0,0,0,0.18)`}}>
      <div style={{position: 'absolute', left: 140, top: 18, width: 100, height: 26, borderRadius: 13, background: xray ? 'transparent' : K.ui, border: xray ? `3px solid ${K.lime}` : 'none'}} />
      {xray && [180, 360, 540].map((yy) => <div key={yy} style={{position: 'absolute', left: 20, right: 20, top: yy, borderTop: `3px dashed rgba(205,242,79,0.35)`}} />)}
      {children}
    </div>
  </div>
);
const Lock = ({size = 60, color = K.red, open = 0}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3" fill={color} /><path d={`M8 10 V7 A4 4 0 0 1 16 7 V${10 - open * 3}`} stroke={color} strokeWidth="2.6" fill="none" /></svg>
);
const Hand = ({x, y, press = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${press * -10}px, ${press * 6}px)`, zIndex: 40, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))'}}>
    <svg width="230" height="120" viewBox="0 0 230 120">
      <path d="M8 46 H96 Q110 46 110 58 Q110 70 96 70 H70 L72 74 Q150 74 180 70 L230 66 V112 L176 112 Q150 116 120 112 L80 106 Q64 104 64 92 Q64 84 72 82 Q60 80 60 70 Q60 62 66 60 H8 Q-4 60 -4 53 Q-4 46 8 46 Z"
        fill="#F2C9A0" stroke={K.ui} strokeWidth="5" strokeLinejoin="round" />
      <path d="M72 82 H120 M66 60 H112" stroke={K.ui} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  </div>
);
// rubber stamp (reference: red "DECOY #23" slam); ours is ink on a lime wash, red stays for loss only
const Stamp = ({f, at, text, x, y, rot = -9, size = 92, color = K.ui}) => {
  if (f < at - 4) return null; const p = expo(f - at + 4, 6); const t = f - at; const shake = t > 0 && t < 10 ? Math.sin(t * 2.4) * 8 * (1 - t / 10) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateX(${shake}px) rotate(${rot}deg) scale(${mix(2.6, 1, p)})`, opacity: clamp01(p * 1.5), zIndex: 30}}>
      <div style={{border: `10px solid ${color}`, borderRadius: 22, padding: '6px 34px', fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: size * 0.06, color, background: 'rgba(205,242,79,0.55)', whiteSpace: 'nowrap',
        WebkitMaskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 61%, #000 70%)'}}>{text}</div>
    </div>
  );
};
const Grid = ({dark, f = 0}) => (
  <div style={{position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${dark ? 'rgba(205,242,79,0.10)' : 'rgba(14,14,16,0.06)'} 2px, transparent 2px), linear-gradient(90deg, ${dark ? 'rgba(205,242,79,0.10)' : 'rgba(14,14,16,0.06)'} 2px, transparent 2px)`,
    backgroundSize: '120px 120px', backgroundPosition: `${dark ? f * 0.6 : 0}px ${dark ? f * 0.6 : 0}px`}} />
);

// ---------------------------------------------------------------- word-by-word caption pill
const Captions = ({f, beats, dark}) => {
  const bi = beats.findIndex((b, i) => f < (beats[i + 1] ? beats[i + 1].from : 1e9)); const b = beats[bi]; if (!b || !b.words || !b.words.length) return null;
  const groups = []; let g = [];
  b.words.forEach((w, i) => { g.push(w); if (g.length >= 3 || /[.,?!]$/.test(w.w) || i === b.words.length - 1) { groups.push(g); g = []; } });
  let gi = 0; groups.forEach((gr, i) => { if (f >= gr[0].f - 2) gi = i; });
  const gr = groups[gi]; const p = pop(f, gr[0].f - 3, {w: 0.6, z: 0.6});
  if (f > b.from + b.frames - 1 && bi === beats.length - 1) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1600, display: 'flex', justifyContent: 'center', zIndex: 50}}>
      <div style={{background: K.ui, borderRadius: 20, padding: '14px 30px 16px', fontFamily: FONT, fontWeight: 900, fontSize: 58, letterSpacing: -1.5, display: 'flex', gap: 16,
        transform: `scale(${mix(0.86, 1, clamp01(p))}) translateY(${(1 - clamp01(p)) * 14}px)`, boxShadow: dark ? `0 0 0 3px ${K.lime}, 0 0 30px rgba(205,242,79,0.4)` : '0 14px 30px rgba(0,0,0,0.25)'}}>
        {gr.map((w, i) => <span key={i} style={{color: f >= w.f - 1 ? (w.k ? K.lime : '#fff') : '#5E5E5A'}}>{w.w.replace(/[,.]$/, '')}</span>)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- scene A: the claim (light)
const SceneA = ({f, W, B}) => {
  const views = count(f, W(0, 'one') - 4, 1000000, 34);
  const shrink = expo(f - B(1), 14);
  const src = pop(f, B(1) + 2, {w: 0.34, z: 0.72});
  const chk = pop(f, W(0, 'paycheck') - 3, {w: 0.5, z: 0.5});
  const lo = W(2, '$400'), hi = W(2, '$1,000');
  const pay = f < lo - 2 ? '$ ? ? ?' : f < hi - 2 ? `$${count(f, lo - 2, 400, 14)}` : `$400–$${fmt(count(f, hi - 2, 1000, 12, 400))}`;
  const money = pop(f, lo - 3, {w: 0.5, z: 0.55});
  const phY = mix(840, 760, shrink), phS = mix(1, 0.74, shrink);
  return (<>
    <Source kicker="Stack Influence · Jun 2026 · 3rd-party report" p={src}>Creator Rewards: <span style={{background: K.lime, padding: '0 8px', borderRadius: 8}}>$0.40–$1.00</span> per 1,000 qualifying views</Source>
    <Phone x={420} y={phY} s={phS}>
      <div style={{position: 'absolute', left: 34, top: 80}}><span style={{display: 'inline-block', transform: `scale(${pop(f, W(0, 'tiktok') - 3)})`}}><Logo name="tiktok" size={70} /></span></div>
      <div style={{position: 'absolute', left: 34, top: 230}}><Mono size={26}>Views</Mono></div>
      <div style={{position: 'absolute', left: 30, top: 270, fontFamily: FONT, fontWeight: 900, fontSize: 62, letterSpacing: -2.5, color: K.ui}}>{fmt(views)}</div>
      <div style={{position: 'absolute', left: 34, right: 34, top: 390, height: 18, borderRadius: 9, background: '#EDEDE8', border: `3px solid ${K.ui}`}}><div style={{width: `${(views / 1e6) * 100}%`, height: '100%', background: K.lime, borderRadius: 6}} /></div>
      {[0, 1, 2].map((i) => { const t = (f - W(0, 'one') - i * 9) % 40; return f > W(0, 'one') && <div key={i} style={{position: 'absolute', left: 250 + i * 30, top: 600 - t * 9, opacity: clamp01(1 - t / 40), fontSize: 46, color: K.red}}>♥</div>; })}
      <div style={{position: 'absolute', left: 34, top: 470, display: 'flex', gap: 14}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 92, height: 150, borderRadius: 16, border: `4px solid ${K.ui}`, background: i === 1 ? K.lime : '#F1F1EC'}} />)}</div>
    </Phone>
    {/* paycheck tag pinned to the phone */}
    <div style={{position: 'absolute', left: mix(600, 610, shrink), top: mix(560, 540, shrink), transform: `scale(${chk}) rotate(${(1 - chk) * 30 + 7}deg)`, transformOrigin: 'left center'}}>
      <div style={{position: 'absolute', left: -60, top: 60, width: 70, height: 5, background: K.ui}} />
      <div style={{background: '#fff', border: `5px solid ${K.ui}`, borderRadius: 22, padding: '18px 26px', boxShadow: '0 14px 0 rgba(14,14,16,0.1)'}}>
        <Mono size={22}>Paycheck</Mono>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: f < lo - 2 ? 64 : 50, color: K.ui, letterSpacing: -2, marginTop: 4}}>{pay}</div>
      </div>
    </div>
    {/* the maths, chips appear on each number */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: shrink}}>
      {[['1,000,000 views', W(2, 'million') - 4, '#fff'], ['÷ 1,000', W(1, '1,000') - 3, '#fff'], ['× $0.40–$1', W(1, '$0.40') - 3, K.lime]].map(([t, at, bg], i) =>
        <span key={i} style={{display: 'inline-block', transform: `scale(${pop(f, at, {w: 0.55, z: 0.5})}) translateY(${Math.sin(f / 10 + i) * 4}px)`}}><Chip bg={bg} size={30}>{t}</Chip></span>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', transform: `scale(${money * (1 + 0.06 * Math.max(0, 1 - Math.abs(f - hi - 2) / 6))}) rotate(${(1 - money) * -10}deg)`}}>
      <Money size={104}>$400–$1,000</Money>
    </div>
    <Burst f={f} at={hi} x={540} y={1300} n={16} r={420} />
    <div style={{position: 'absolute', left: 700, top: 1400, transform: `scale(${pop(f, W(2, 'bad') - 3, {w: 0.6, z: 0.5})}) rotate(6deg)`}}><Chip bg={K.ui} color={K.lime} border={K.ui} size={28}>Not bad?</Chip></div>
  </>);
};

// ---------------------------------------------------------------- scene A, x-ray (dark blueprint of the same claim)
const SceneX = ({f, W, B}) => {
  const req = expo(f - W(4, '10,000') + 4, 16), vreq = expo(f - W(4, '100,000') + 4, 16);
  const you = expo(f - W(5, '600') + 2, 14); const zeroAt = W(5, 'zero'); const payDrop = W(5, 'pay');
  const lockP = pop(f, payDrop - 3, {w: 0.5, z: 0.5});
  const payout = f < payDrop ? 1000 : count(f, payDrop, 0, Math.max(8, zeroAt - payDrop), 1000);
  const zs = f > zeroAt && f < zeroAt + 10 ? Math.sin((f - zeroAt) * 2.6) * 10 * (1 - (f - zeroAt) / 10) : 0;
  return (<>
    <div style={{position: 'absolute', left: 100, top: 250, display: 'flex', justifyContent: 'space-between', width: 880}}>
      <Mono size={26} color={K.lime}>X-ray · who gets paid</Mono><Mono size={26} color={f % 30 < 18 ? K.lime : 'transparent'}>● Scanning</Mono>
    </div>
    <Phone x={540} y={600} s={0.6} xray>
      <div style={{position: 'absolute', left: 34, top: 230}}><Mono size={26} color={K.lime}>Views</Mono></div>
      <div style={{position: 'absolute', left: 30, top: 270, fontFamily: FONT, fontWeight: 900, fontSize: 62, letterSpacing: -2.5, color: 'transparent', WebkitTextStroke: `2.5px ${K.lime}`}}>1,000,000</div>
      <div style={{position: 'absolute', left: 120, top: 430, transform: `scale(${lockP * 1.8})`}}><Lock size={150} color={K.red} /></div>
    </Phone>
    <Pulse f={f} x={540} y={600} d={300} from={W(3, 'x-ray') + 14} every={30} />
    <div style={{opacity: expo(f - B(4), 10)}}>
      <Bar dark label="Followers needed" value={fmt(count(f, W(4, '10,000') - 4, 10000, 16))} p={req} y={900} color="rgba(205,242,79,0.35)"
        marker={you > 0 && <>
          <div style={{position: 'absolute', left: 4, top: 4, bottom: 4, width: `${you * 6}%`, minWidth: 18 * you, borderRadius: 10, background: K.red, boxShadow: `0 0 18px ${K.red}`}} />
          <div style={{position: 'absolute', left: -10, top: 44, transform: `scale(${pop(f, W(5, '600') - 2)})`, transformOrigin: 'left top'}}><Chip bg={K.red} color="#fff" border={K.red} size={24}>You · 600</Chip></div></>} />
      <Bar dark label="Views · last 30 days" value={fmt(count(f, W(4, '100,000') - 4, 100000, 16))} p={vreq} y={1080} color={K.lime}
        marker={vreq > 0.95 && <div style={{position: 'absolute', right: -18, top: -18, width: 60, height: 60, borderRadius: 30, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check size={40} color={K.ui} p={expo(f - W(4, '100,000') - 10, 8)} /></div>} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1220, display: 'flex', justifyContent: 'center', gap: 18}}>
        {['18+', 'Selected countries'].map((t, i) => <span key={t} style={{display: 'inline-block', transform: `scale(${pop(f, W(4, 'thirty') + i * 4)})`}}><Chip bg="transparent" color={K.lime} border={K.lime} size={26}>{t}</Chip></span>)}
      </div>
    </div>
    {f >= payDrop - 4 && <div style={{position: 'absolute', left: 0, right: 0, top: 1350, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, transform: `translateX(${zs}px) scale(${pop(f, payDrop - 4)})`}}>
      <Mono size={30} color="#A7A7A0">Creator Rewards payout</Mono>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: payout === 0 ? K.red : '#fff', letterSpacing: -3}}>${fmt(payout)}</span>
    </div>}
    <Burst f={f} at={zeroAt} x={720} y={1400} n={14} r={300} color={K.red} />
  </>);
};

// ---------------------------------------------------------------- scene C: what pays small creators first (light)
const ROWS = [
  {key: 'ugc', name: 'UGC videos', pay: '$50–$400 a video (beginners)', need: 'None', art: 'ugc'},
  {key: 'etsy', name: 'Etsy templates', pay: '~$8.60 kept on a $10 sale', need: 'None', art: 'etsy'},
  {key: 'youtube', name: 'YouTube Shopping', pay: 'Commission on each sale', need: '500 subs', art: 'youtube'},
];
const SceneC = ({f, W, B}) => {
  const head = pop(f, W(6, 'other') - 6, {w: 0.34, z: 0.72});
  const close = expoIn(f - B(8) + 2, 12); const sum = pop(f, B(8) + 6, {w: 0.36, z: 0.7});
  const end = expo(f - B(9), 18);
  const tap = (i) => W(7, ROWS[i].key) + 2;
  const handIdx = ROWS.reduce((a, r, i) => (f >= tap(i) - 14 ? i : a), -1);
  const ry = (i) => 470 + i * 300;
  const hp = handIdx < 0 ? 0 : expo(f - tap(handIdx) + 14, 10); const press = handIdx >= 0 && f >= tap(handIdx) && f < tap(handIdx) + 6 ? 1 : 0;
  return (<>
    <div style={{opacity: 1 - close}}>
      <Source kicker="What pays small creators first" p={head} y={250}>Paid per job or sale, <span style={{background: K.lime, padding: '0 8px', borderRadius: 8}}>not per view</span></Source>
      {ROWS.map((r, i) => { const g = pop(f, W(6, 'first') - 4 + i * 3, {w: 0.5, z: 0.6}) * (1 - pop(f, W(7, r.key) - 6));
        return g > 0.01 && <div key={'g' + i} style={{position: 'absolute', left: 100, top: ry(i), width: 880, height: 260, borderRadius: 36, border: `5px dashed ${K.grey}`, transform: `scale(${g})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mono size={40} color={K.grey}>? ? ?</Mono></div>; })}
      {ROWS.map((r, i) => { const p = pop(f, W(7, r.key) - 6, {w: 0.4, z: 0.62}); const lit = f >= tap(i) ? expo(f - tap(i), 8) : 0;
        return (
          <div key={r.key} style={{position: 'absolute', left: 100, top: ry(i) + Math.sin(f / 14 + i) * 4, width: 880, height: 260, transform: `translateX(${(1 - p) * 1100}px) rotate(${(1 - p) * 6}deg) scale(${1 + lit * 0.03 * Math.max(0, 1 - (f - tap(i)) / 12)})`,
            background: '#fff', border: `5px solid ${K.ui}`, borderRadius: 36, boxShadow: `0 16px 0 rgba(14,14,16,0.10)${lit ? `, 0 0 ${40 * lit}px rgba(205,242,79,0.9)` : ''}`, fontFamily: FONT}}>
            <div style={{position: 'absolute', left: 26, top: 26, width: 200, height: 200, borderRadius: 30, border: `4px solid ${K.ui}`, background: lit > 0.5 ? K.lime : '#F1F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {r.art === 'ugc' ? <StreamArt kind="ugc" size={180} p={ART} /> : <BrandLogo name={r.art} size={120} />}</div>
            <div style={{position: 'absolute', left: 256, top: 30, fontWeight: 900, fontSize: 54, color: K.ui, letterSpacing: -1.5}}>{r.name}</div>
            <div style={{position: 'absolute', left: 258, top: 102}}><Mono size={23}>{r.pay}</Mono></div>
            <div style={{position: 'absolute', left: 258, top: 160, display: 'flex', alignItems: 'center', gap: 14}}>
              <Mono size={23} color={K.ui}>Followers needed</Mono>
              <span style={{display: 'inline-block', transform: `scale(${f >= tap(i) ? pop(f, tap(i), {w: 0.6, z: 0.5}) : 0})`}}><Chip bg={K.lime} size={24}>{r.need}</Chip></span>
            </div>
          </div>); })}
      {handIdx >= 0 && f < B(8) && <Hand x={mix(1100, 860, hp)} y={ry(handIdx) + 90 + (1 - hp) * 80} press={press} />}
      {ROWS.map((r, i) => <Burst key={i} f={f} at={tap(i)} x={900} y={ry(i) + 130} n={10} r={160} />)}
    </div>
    {/* case closed summary card -> shrinks into the lockup */}
    {f >= B(8) && <div style={{position: 'absolute', left: 120, top: mix(520, 250, end), width: 840, transform: `scale(${sum * mix(1, 0.62, end)}) rotate(${mix(0, -3, end)}deg)`, transformOrigin: '50% 0'}}>
      <div style={{background: '#fff', border: `5px solid ${K.ui}`, borderRadius: 40, padding: '40px 46px', boxShadow: '0 20px 0 rgba(14,14,16,0.10), 0 40px 80px rgba(0,0,0,0.15)', fontFamily: FONT}}>
        <Mono size={24}>Case file #01 · verdict</Mono>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 30, opacity: clamp01(pop(f, W(8, 'views') - 4) * 2)}}>
          <span style={{fontWeight: 900, fontSize: 66, color: K.ui}}>Views</span><span style={{display: 'inline-block', transform: `scale(${pop(f, W(8, 'bonus') - 3)})`}}><Chip bg="#EDEDE8" color={K.mut} border={K.grey} size={36}>the bonus</Chip></span></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 30, opacity: clamp01(pop(f, W(8, 'direct') - 4) * 2)}}>
          <span style={{fontWeight: 900, fontSize: 66, color: K.ui}}>Direct pay</span><span style={{display: 'inline-block', transform: `scale(${pop(f, W(8, 'first') - 3, {w: 0.55, z: 0.5})})`}}><Money size={60}>comes first</Money></span></div>
      </div>
      <Stamp f={f} at={W(8, 'closed') - 1} text="CASE CLOSED" x={600} y={360} size={80} />
    </div>}
    <Burst f={f} at={W(8, 'closed')} x={540} y={800} n={18} r={460} />
    {/* lockup + four-part ending */}
    {f >= B(9) - 2 && <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, transform: `scale(${pop(f, B(9) + 4, {w: 0.4, z: 0.6})})`}}>
        <div style={{width: 130, height: 130, borderRadius: 36, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, boxShadow: '0 0 50px rgba(205,242,79,0.7)'}}>S</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: -4, color: K.ui, lineHeight: 0.95}}>SUB-CREATOR<br />PAID</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: expo(f - B(9) - 10, 10)}}><Mono size={28}>Which income really pays</Mono></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 980, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, W(9, 'comment') - 3, {w: 0.5, z: 0.55})})`}}>
        <Money size={58}>Comment PAID → free guide</Money></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: K.ui, clipPath: `inset(0 ${(1 - expo(f - W(9, 'subcreatorpaid.com') + 4, 10)) * 50}% 0 ${(1 - expo(f - W(9, 'subcreatorpaid.com') + 4, 10)) * 50}%)`}}>subcreatorpaid.com/links</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, W(9, 'tool') - 3)})`}}>
        <Chip bg="#fff" size={26}><span style={{display: 'inline-flex', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', border: `3px solid ${K.ui}`}}><BrandLogo name="opusclip" size={38} /></span>Tool I'd start with · OpusClip · Affiliate link</Chip></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1320, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: f > W(9, 'follow') + 6 ? K.lime : K.ui, color: f > W(9, 'follow') + 6 ? K.ui : '#fff', border: `5px solid ${K.ui}`, borderRadius: 18, padding: '18px 40px', fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 4,
          opacity: expo(f - W(9, 'follow') + 8, 8), transform: `scale(${f > W(9, 'follow') + 2 && f < W(9, 'follow') + 7 ? 0.92 : 1})`}}>{f > W(9, 'follow') + 6 ? 'FOLLOWING ✓' : 'FOLLOW FOR MORE →'}</div>
      </div>
      <Burst f={f} at={W(9, 'follow') + 6} x={540} y={1360} n={16} r={360} />
    </>}
  </>);
};

export const CaseFile = ({beats = [], total = 0, case: cs = {}}) => {
  const f = useCurrentFrame();
  const {B, W} = useTimes(beats);
  const scanIn = W(3, 'x-ray') - 2, scanOut = B(6) + 2, SC = 20;
  const pin = clamp01((f - scanIn) / SC), pout = clamp01((f - scanOut) / SC);
  const xray = f >= scanIn && pout < 1; const dark = pin > 0.5 && pout < 0.5;
  // camera: A (x 540) -> whip -> C (x 1840); punch zooms on the key words; slow drift the whole time
  const panAt = W(6, 'small') - 10; const pp = inOut(f - panAt, 20);
  const camX = mix(540, 1840, pp); const sn = Math.sin(Math.PI * pp);
  const keys = [W(0, 'paycheck'), W(2, '$1,000'), W(5, 'zero'), W(8, 'closed')];
  const punch = keys.reduce((s, w) => s + 0.04 * Math.max(0, 1 - Math.abs(f - w - 2) / 7), 0);
  const z = (1 - 0.3 * sn) * (1 + punch) * (1 + 0.012 * Math.sin(f / 50));
  const vx = (mix(540, 1840, inOut(f - panAt, 20)) - mix(540, 1840, inOut(f - 1 - panAt, 20)));
  const cam = `translate(540px, 960px) scale(${z}) skewX(${Math.max(-10, Math.min(10, -vx * 0.08))}deg) translate(${-camX - Math.sin(f / 37) * 5}px, ${-960 - Math.cos(f / 43) * 7}px)`;
  const SAFE = {s: 0.7, x: 162, y: 262};
  const label = f < B(3) ? (cs.name || 'Creator Rewards') : f < B(6) ? 'X-ray' : f < B(9) ? 'Other ways first' : 'Sub-Creator Paid';
  const scanY = f < scanOut ? 1920 * (1 - pin) : 1920 * pout; const scanOn = (pin > 0 && pin < 1) || (pout > 0 && pout < 1);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden', fontFamily: FONT}}>
      <style>{`@font-face{font-family:MonoX;font-weight:700;src:url(${staticFile('JetBrainsMono-Bold.ttf')})}`}</style>
      <div style={{position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <div style={{width: 66, height: 66, borderRadius: 18, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44}}>S</div>
        <div style={{fontWeight: 800, fontSize: 46, color: K.ui, letterSpacing: -1}}>@subcreatorpaid</div>
      </div>
      <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y, width: 1080, height: 1920, transform: `scale(${SAFE.s})`, transformOrigin: '0 0', overflow: 'hidden', borderRadius: 60, background: K.paper, boxShadow: '0 0 0 4px rgba(14,14,16,0.08)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: cam}}>
          <div style={{position: 'absolute', left: -600, top: -400, width: 3400, height: 2800}}><Grid /></div>
          {pp < 1 && <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}><SceneA f={f} W={W} B={B} /></div>}
          {f >= panAt - 4 && <div style={{position: 'absolute', left: 1300, top: 0, width: 1080, height: 1920}}><SceneC f={f} W={W} B={B} /></div>}
        </div>
        {/* x-ray layer: revealed above a glowing scan line that sweeps up, removed by the line sweeping back down */}
        {xray && <div style={{position: 'absolute', inset: 0, background: '#0E0E10', clipPath: f < scanOut ? `inset(${(1 - pin) * 100}% 0 0 0)` : `inset(${pout * 100}% 0 0 0)`}}>
          <Grid dark f={f} />
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(205,242,79,0.10), rgba(0,0,0,0) 60%)'}} />
          <SceneX f={f} W={W} B={B} />
        </div>}
        {scanOn && <>
          <div style={{position: 'absolute', left: 0, right: 0, top: scanY - 3, height: 6, background: K.lime, boxShadow: `0 0 30px 10px rgba(205,242,79,0.8)`, zIndex: 45}} />
          <div style={{position: 'absolute', left: 40, top: scanY + (f < scanOut ? 16 : -46), zIndex: 45}}><Mono size={22} color={K.lime}>X-ray · scanning</Mono></div>
        </>}
        {/* case header (reference: "DECOY #23 / CASE · MERE TOUCH") + progress line */}
        <div style={{position: 'absolute', left: 70, right: 70, top: 70, display: 'flex', justifyContent: 'space-between', zIndex: 46}}>
          <Mono size={28} color={dark ? K.lime : K.ui} style={{letterSpacing: 4}}>Case file #{cs.no || '01'}</Mono>
          <Mono key={label} size={28} color={dark ? '#A7A7A0' : K.mut} style={{display: 'inline-block', transform: `translateY(${(1 - expo(f - (label === 'X-ray' ? B(3) : label === 'Other ways first' ? B(6) : label === 'Sub-Creator Paid' ? B(9) : 0), 10)) * -40}px)`}}>Case · {label}</Mono>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 128, height: 6, borderRadius: 3, background: dark ? '#2A2A2D' : K.line, zIndex: 46}}><div style={{width: `${clamp01(f / Math.max(1, total)) * 100}%`, height: '100%', borderRadius: 3, background: dark ? K.lime : K.ui}} /></div>
        <Captions f={f} beats={beats} dark={dark} />
      </div>
    </AbsoluteFill>
  );
};
