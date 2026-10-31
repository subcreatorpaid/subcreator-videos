// Film 5, "Case file" (owner, 31 Oct 2026: "make a short video keeping the reference in the folder of my drive ... take reference of
// the animations, kinetic typo animations, transitions, sound effects and flow ... keep the color scheme same").
// Cues taken from the two Drive reference explainers, rebuilt in our palette (backdrop #E3E3DB / white / ink / lime, red only for loss):
// - graph-paper backdrop (full screen), flat outlined objects that stay on screen and gain parts beat by beat
// - a source card (mono kicker + bold claim, accent bar) for every fact, counters that roll, labelled bars that fill
// - word-by-word caption pill (spoken words white, the rest grey, numbers lime)
// - the "X-ray": a glowing scan line sweeps up into a dark blueprint version of the same object, and back down to leave it
// - a hand/pointer that taps each example, a rubber stamp to close the case, then a logo lockup with "Follow for more"
// One continuous take: scene A (the claim) and scene C (what pays first, then our website's AI Income Finder demoed with a cursor)
// sit side by side and the camera whips between them. Owner notes 31 Oct: full screen, real hand, no case header, new streams, show the site.
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
// realistic pointing hand (owner, 31 Oct: "hand shape is a bit odd make it a real hand"): shaded skin, nail, knuckle creases,
// thumb over the curled fingers, shirt cuff; enters from the right edge
const Hand = ({x, y, press = 0, w = 360}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(${press * -14}px, ${press * 4}px)`, zIndex: 40, filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.22))'}}>
    <svg width={w} height={w * 200 / 420} viewBox="0 0 420 200">
      <defs>
        <linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F8D9BE" /><stop offset="0.55" stopColor="#EDBB97" /><stop offset="1" stopColor="#D79A74" /></linearGradient>
        <linearGradient id="hf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBE2CB" /><stop offset="1" stopColor="#E6AC86" /></linearGradient>
      </defs>
      <path d="M298 44 Q246 36 196 54 L190 100 L214 102 L222 130 L234 158 L242 182 Q272 198 300 192 Z" fill="url(#hs)" stroke="#A86E4C" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M250 178 Q218 178 202 182 Q186 188 192 197 Q198 203 214 200 L254 197 Z" fill="url(#hs)" stroke="#A86E4C" strokeWidth="2.5" />
      <path d="M242 154 Q206 153 184 158 Q162 165 168 178 Q174 188 192 185 L246 181 Z" fill="url(#hs)" stroke="#A86E4C" strokeWidth="2.5" />
      <path d="M234 126 Q196 125 172 131 Q148 139 154 153 Q160 163 180 160 L238 156 Z" fill="url(#hs)" stroke="#A86E4C" strokeWidth="2.5" />
      <path d="M196 54 L50 57 Q20 59 20 78 Q20 97 50 99 L200 101 Z" fill="url(#hf)" stroke="#A86E4C" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M48 62 L180 60" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <path d="M27 72 Q26 63 36 62 L56 62 Q61 70 56 79 L36 80 Q27 80 27 72 Z" fill="#FBE8DA" stroke="#C99474" strokeWidth="1.8" />
      <path d="M92 66 Q96 78 92 92 M134 64 Q139 78 134 94" stroke="#B87A58" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M222 104 L138 110 Q114 113 116 125 Q120 137 140 135 L226 128 Z" fill="url(#hf)" stroke="#A86E4C" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M124 116 Q122 124 128 130" stroke="#C99474" strokeWidth="2" fill="none" />
      <path d="M176 140 Q172 148 178 154 M190 166 Q186 173 192 178" stroke="#B87A58" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M200 70 Q250 66 288 74" stroke="#C48B66" strokeWidth="2" fill="none" opacity="0.5" />
      <rect x="292" y="28" width="140" height="172" rx="10" fill="#0E0E10" />
      <rect x="292" y="28" width="22" height="172" rx="6" fill="#CDF24F" />
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
    <div style={{position: 'absolute', left: 0, right: 0, top: 1530, display: 'flex', justifyContent: 'center', zIndex: 50}}>
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

// ---------------------------------------------------------------- scene C: what pays first -> find it on our website (light)
// real captures of the mobile site (animator/previews/case_site/, scripts/capture_site.js style, header hidden on the finder)
// chip boxes in CSS px inside the #finder capture (400 px wide, device scale 2.7): [x, y, w, h]
const CHIP = {'0 to 1k': [39, 710, 72, 36], Instagram: [39, 833, 96, 36], TikTok: [143, 833, 73, 36], 'Filming products': [39, 913, 141, 36], Writing: [195, 1001, 77, 36], 'Find my income streams': [39, 1065, 226, 47]};
const BR = {x: 130, y: 290, w: 820, chrome: 96, h: 1180}; const CS = BR.w / 400;
const Arrow = ({f, track, clicks = []}) => {
  if (f < track[0][0] || f > track[track.length - 1][0] + 10) return null;
  const at = (ff) => [kf(ff, track.map(([t, x]) => [t, x])), kf(ff, track.map(([t, , y]) => [t, y]))];
  const [x, y] = at(f); const ck = clicks.find((c) => f >= c && f < c + 16); const t = ck === undefined ? -1 : (f - ck) / 16;
  return (<>
    {t >= 0 && <div style={{position: 'absolute', left: x + 4 - 22 - t * 50, top: y + 4 - 22 - t * 50, width: 44 + t * 100, height: 44 + t * 100, borderRadius: '50%', border: `${6 - t * 5}px solid ${K.lime}`, opacity: 1 - t, zIndex: 58}} />}
    <div style={{position: 'absolute', left: x, top: y, zIndex: 60, transform: `scale(${t >= 0 && t < 0.3 ? 0.82 : 1})`, transformOrigin: '4px 4px'}}>
      <div style={{position: 'absolute', left: -26, top: -26, width: 76, height: 76, borderRadius: 38, background: K.lime, opacity: 0.5, filter: 'blur(10px)'}} />
      <svg width="58" height="72" viewBox="0 0 27 33" style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))'}}>
        <path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill="#0E0E10" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
    </div>
  </>);
};
const MATCH = [
  {key: 'newsletter', name: 'Email newsletter', pay: '$0 to start · grows with your list', logo: 'beehiiv'},
  {key: 'substack', name: 'Paid Substack', pay: 'You set the price · 10% fee', logo: 'substack'},
  {key: 'gumroad', name: 'Gumroad product', pay: '10% + 50c per direct sale', logo: 'gumroad'},
];
const SceneC = ({f, W, B, E}) => {
  const head = pop(f, W(6, 'other') - 6, {w: 0.34, z: 0.72}); const headOut = expoIn(f - B(7) + 4, 10);
  // the website: home page -> tap "Find my income streams" -> finder, scroll to the chips, pick size / platform / enjoy, find
  const win = pop(f, B(7) - 2, {w: 0.34, z: 0.72}); const winOut = expoIn(f - B(8) + 6, 10);
  const URL = 'subcreatorpaid.com'; const ty = Math.round(URL.length * clamp01((f - B(7) - 4) / Math.max(10, W(7, 'subcreatorpaid.com') - B(7) + 6)));
  const go = W(7, 'subcreatorpaid.com') + 16; const finder = f >= go + 6;
  const scroll = finder ? mix(60, 600, inOut(f - go - 8, 18)) : 0;
  const cs = (r) => [BR.x + (r[0] + r[2] / 2) * CS, BR.y + BR.chrome + (r[1] + r[3] / 2 - scroll) * CS];
  const cSize = W(7, 'size'), cPlat = W(7, 'platform') + 2, cEnj = W(7, 'enjoy') + 2, cFind = Math.min(E(7) - 10, cEnj + 26);
  const homeBtn = [BR.x + 200 * CS, BR.y + BR.chrome + 408 * CS];
  const track = [[B(7) + 8, 980, 1500], [go - 12, homeBtn[0], homeBtn[1]], [go, homeBtn[0], homeBtn[1]], [go + 24, 600, 1100],
    [cSize - 6, ...cs(CHIP['0 to 1k'])], [cSize + 4, ...cs(CHIP['0 to 1k'])], [cPlat - 8, ...cs(CHIP.TikTok)], [cPlat + 4, ...cs(CHIP.TikTok)],
    [cEnj - 8, ...cs(CHIP.Writing)], [cEnj + 4, ...cs(CHIP.Writing)], [cFind - 8, ...cs(CHIP['Find my income streams'])], [cFind + 12, ...cs(CHIP['Find my income streams'])]];
  const chip = (name, on, key) => { const r = CHIP[name]; const lit = on && f >= on && f < on + 14 ? 1 - (f - on) / 14 : 0; const pad = on && f >= on ? 0 : 3;
    return <div key={key} style={{position: 'absolute', left: (r[0] - pad) * CS, top: (r[1] - scroll - pad) * CS, width: (r[2] + pad * 2) * CS, height: (r[3] + pad * 2) * CS, borderRadius: 999, background: on && f >= on ? '#fff' : '#232325', border: on && f >= on ? 'none' : '2px solid #4A4A4C',
      color: on && f >= on ? K.ui : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 15 * CS, boxShadow: lit ? `0 0 0 ${8 * lit}px rgba(205,242,79,0.9), 0 0 40px rgba(205,242,79,${lit})` : 'none'}}>{name}</div>; };
  const tap = (i) => W(8, MATCH[i].key) + 2; const ry = (i) => 440 + i * 300;
  const handIdx = MATCH.reduce((a, r, i) => (f >= tap(i) - 14 ? i : a), -1);
  const hp = handIdx < 0 ? 0 : expo(f - tap(handIdx) + 14, 10); const press = handIdx >= 0 && f >= tap(handIdx) && f < tap(handIdx) + 6 ? 1 : 0;
  const close = expoIn(f - B(9) + 2, 12); const sum = pop(f, B(9) + 6, {w: 0.36, z: 0.7}); const end = expo(f - B(10), 18);
  return (<>
    {headOut < 1 && <div style={{opacity: 1 - headOut, transform: `translateY(${-headOut * 200}px)`}}>
      <Source kicker="What pays small creators first" p={head} y={250}>Paid per job or sale, <span style={{background: K.lime, padding: '0 8px', borderRadius: 8}}>not per view</span></Source>
      {[0, 1, 2].map((i) => { const g = pop(f, W(6, 'first') - 4 + i * 3, {w: 0.5, z: 0.6}); return g > 0.01 && <div key={'g' + i} style={{position: 'absolute', left: 100, top: 470 + i * 300, width: 880, height: 260, borderRadius: 36, border: `5px dashed ${K.grey}`, transform: `scale(${g})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mono size={40} color={K.grey}>? ? ?</Mono></div>; })}
    </div>}
    {f >= B(7) - 4 && winOut < 1 && <div style={{position: 'absolute', left: BR.x, top: BR.y, width: BR.w, height: BR.h, borderRadius: 44, overflow: 'hidden', background: '#F5F3EE', border: `6px solid ${K.ui}`, zIndex: 5,
      boxShadow: '0 30px 0 rgba(14,14,16,0.10), 0 50px 100px rgba(0,0,0,0.25), 0 0 80px rgba(205,242,79,0.35)',
      transform: `translateY(${(1 - win) * 1500}px) rotate(${(1 - win) * 8}deg) translateX(${-winOut * 1300}px) scale(${1 - winOut * 0.3})`}}>
      <div style={{height: BR.chrome, background: '#EDEDE8', borderBottom: `4px solid ${K.ui}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: i === 2 ? K.lime : '#C8C8C2', border: `2px solid ${K.ui}`}} />)}
        <div style={{marginLeft: 12, flex: 1, height: 60, borderRadius: 30, background: '#fff', border: `3px solid ${K.ui}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: K.ui}}>
          <Lock size={26} color={K.mut} />{URL.slice(0, ty)}{ty < URL.length && f % 16 < 8 ? '|' : ''}</div>
      </div>
      <div style={{position: 'relative', width: BR.w, height: BR.h - BR.chrome, overflow: 'hidden'}}>
        {!finder ? <img src={staticFile('a_home_m.png')} style={{position: 'absolute', left: 0, top: 0, width: BR.w, opacity: expo(f - B(7) - 6, 8)}} /> : <>
          <img src={staticFile('a_finder_m.png')} style={{position: 'absolute', left: 0, top: -scroll * CS, width: BR.w}} />
          {chip('0 to 1k', cSize, 'a')}
          {chip('Instagram', 0, 'b')}{chip('TikTok', cPlat, 'c')}
          {chip('Filming products', 0, 'd')}{chip('Writing', cEnj, 'e')}
          {(() => { const r = CHIP['Find my income streams']; const on = f >= cFind; return <div style={{position: 'absolute', left: r[0] * CS, top: (r[1] - scroll) * CS, width: r[2] * CS, height: r[3] * CS, borderRadius: 999, background: on ? K.lime : '#fff', color: K.ui,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 17 * CS, transform: `scale(${on && f < cFind + 5 ? 0.94 : 1})`}}>{on ? 'Finding your streams…' : 'Find my income streams'}</div>; })()}
        </>}
        {f >= go - 2 && f < go + 8 && <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: 1 - Math.abs(f - go - 3) / 5}} />}
      </div>
    </div>}
    {winOut < 1 && <Arrow f={f} track={track} clicks={[go, cSize, cPlat, cEnj, cFind]} />}
    {/* the finder's matches (different streams from earlier videos) */}
    {f >= B(8) - 6 && <div style={{opacity: 1 - close}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, B(8) - 2)})`}}>
        <Chip bg={K.ui} color="#fff" border={K.ui} size={30}><span style={{width: 16, height: 16, borderRadius: 8, background: K.lime, display: 'inline-block'}} />AI Income Finder · your matches</Chip></div>
      {MATCH.map((r, i) => { const p = pop(f, W(8, r.key) - 8, {w: 0.4, z: 0.62}); const lit = f >= tap(i) ? expo(f - tap(i), 8) : 0;
        return (
          <div key={r.key} style={{position: 'absolute', left: 100, top: ry(i) + Math.sin(f / 14 + i) * 4, width: 880, height: 260, transform: `translateY(${(1 - p) * 1400}px) rotate(${(1 - p) * -8}deg)`,
            background: '#fff', border: `5px solid ${K.ui}`, borderRadius: 36, boxShadow: `0 16px 0 rgba(14,14,16,0.10)${lit ? `, 0 0 ${40 * lit}px rgba(205,242,79,0.9)` : ''}`, fontFamily: FONT}}>
            <div style={{position: 'absolute', left: 26, top: 26, width: 200, height: 200, borderRadius: 30, border: `4px solid ${K.ui}`, background: lit > 0.5 ? K.lime : '#F1F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <BrandLogo name={r.logo} size={120} /></div>
            <div style={{position: 'absolute', left: 256, top: 30, fontWeight: 900, fontSize: 54, color: K.ui, letterSpacing: -1.5}}>{r.name}</div>
            <div style={{position: 'absolute', left: 258, top: 102}}><Mono size={23}>{r.pay}</Mono></div>
            <div style={{position: 'absolute', left: 258, top: 160, display: 'flex', alignItems: 'center', gap: 14}}>
              <Mono size={23} color={K.ui}>Followers needed</Mono>
              <span style={{display: 'inline-block', transform: `scale(${f >= tap(i) ? pop(f, tap(i), {w: 0.6, z: 0.5}) : 0})`}}><Chip bg={K.lime} size={24}>None</Chip></span>
            </div>
          </div>); })}
      {handIdx >= 0 && f < B(9) && <Hand x={mix(1120, 820, hp)} y={ry(handIdx) + 70 + (1 - hp) * 80} press={press} />}
      {MATCH.map((r, i) => <Burst key={i} f={f} at={tap(i)} x={860} y={ry(i) + 130} n={10} r={160} />)}
    </div>}
    {/* verdict card -> shrinks into the lockup */}
    {f >= B(9) && <div style={{position: 'absolute', left: 120, top: mix(520, 250, end), width: 840, transform: `scale(${sum * mix(1, 0.62, end)}) rotate(${mix(0, -3, end)}deg)`, transformOrigin: '50% 0'}}>
      <div style={{background: '#fff', border: `5px solid ${K.ui}`, borderRadius: 40, padding: '40px 46px', boxShadow: '0 20px 0 rgba(14,14,16,0.10), 0 40px 80px rgba(0,0,0,0.15)', fontFamily: FONT}}>
        <Mono size={24}>The verdict</Mono>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 30, opacity: clamp01(pop(f, W(9, 'views') - 4) * 2)}}>
          <span style={{fontWeight: 900, fontSize: 66, color: K.ui}}>Views</span><span style={{display: 'inline-block', transform: `scale(${pop(f, W(9, 'bonus') - 3)})`}}><Chip bg="#EDEDE8" color={K.mut} border={K.grey} size={36}>the bonus</Chip></span></div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 30, opacity: clamp01(pop(f, W(9, 'direct') - 4) * 2)}}>
          <span style={{fontWeight: 900, fontSize: 66, color: K.ui}}>Direct pay</span><span style={{display: 'inline-block', transform: `scale(${pop(f, W(9, 'first') - 3, {w: 0.55, z: 0.5})})`}}><Money size={60}>comes first</Money></span></div>
      </div>
      <Stamp f={f} at={W(9, 'closed') - 1} text="CASE CLOSED" x={470} y={410} size={76} />
    </div>}
    <Burst f={f} at={W(9, 'closed')} x={540} y={800} n={18} r={460} />
    {/* lockup + four-part ending */}
    {f >= B(10) - 2 && <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, transform: `scale(${pop(f, B(10) + 4, {w: 0.4, z: 0.6})})`}}>
        <div style={{width: 130, height: 130, borderRadius: 36, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, boxShadow: '0 0 50px rgba(205,242,79,0.7)'}}>S</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, letterSpacing: -4, color: K.ui, lineHeight: 0.95}}>SUB-CREATOR<br />PAID</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', opacity: expo(f - B(10) - 10, 10)}}><Mono size={28}>Which income really pays</Mono></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 980, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, W(10, 'comment') - 3, {w: 0.5, z: 0.55})})`}}>
        <Money size={58}>Comment PAID → free guide</Money></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: K.ui, clipPath: `inset(0 ${(1 - expo(f - W(10, 'subcreatorpaid.com') + 4, 10)) * 50}% 0 ${(1 - expo(f - W(10, 'subcreatorpaid.com') + 4, 10)) * 50}%)`}}>subcreatorpaid.com/links</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', transform: `scale(${pop(f, W(10, 'tool') - 3)})`}}>
        <Chip bg="#fff" size={26}><span style={{display: 'inline-flex', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', border: `3px solid ${K.ui}`}}><BrandLogo name="beehiiv" size={38} /></span>Tool I'd start with · beehiiv · Affiliate link</Chip></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1320, display: 'flex', justifyContent: 'center'}}>
        <div style={{background: f > W(10, 'follow') + 6 ? K.lime : K.ui, color: f > W(10, 'follow') + 6 ? K.ui : '#fff', border: `5px solid ${K.ui}`, borderRadius: 18, padding: '18px 40px', fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: 4,
          opacity: expo(f - W(10, 'follow') + 8, 8), transform: `scale(${f > W(10, 'follow') + 2 && f < W(10, 'follow') + 7 ? 0.92 : 1})`}}>{f > W(10, 'follow') + 6 ? 'FOLLOWING ✓' : 'FOLLOW FOR MORE →'}</div>
      </div>
      <Burst f={f} at={W(10, 'follow') + 6} x={540} y={1360} n={16} r={360} />
    </>}
  </>);
};

// Full screen (owner, 31 Oct: "make the video on full screen"): backdrop, x-ray and scan line fill the whole 1080x1920 frame; the
// content group is scaled to 0.88 so it still sits inside Instagram's safe box (x 60-940, y 230-1440) with @subcreatorpaid on top.
const FIT = {s: 0.88, x: 65, y: 80};
export const CaseFile = ({beats = [], total = 0}) => {
  const f = useCurrentFrame();
  const {B, W, E} = useTimes(beats);
  const scanIn = W(3, 'x-ray') - 2, scanOut = B(6) + 2, SC = 20;
  const pin = clamp01((f - scanIn) / SC), pout = clamp01((f - scanOut) / SC);
  const xray = f >= scanIn && pout < 1; const dark = pin > 0.5 && pout < 0.5;
  // camera: A (x 540) -> whip -> C (x 1840); punch zooms on the key words; slow drift the whole time
  const panAt = W(6, 'small') - 10; const pp = inOut(f - panAt, 20);
  const camX = mix(540, 1840, pp); const sn = Math.sin(Math.PI * pp);
  const keys = [W(0, 'paycheck'), W(2, '$1,000'), W(5, 'zero'), W(9, 'closed')];
  const punch = keys.reduce((s, w) => s + 0.04 * Math.max(0, 1 - Math.abs(f - w - 2) / 7), 0);
  const z = (1 - 0.3 * sn) * (1 + punch) * (1 + 0.012 * Math.sin(f / 50));
  const vx = camX - mix(540, 1840, inOut(f - 1 - panAt, 20));
  const cam = `translate(540px, 960px) scale(${z}) skewX(${Math.max(-10, Math.min(10, -vx * 0.08))}deg) translate(${-camX - Math.sin(f / 37) * 5}px, ${-960 - Math.cos(f / 43) * 7}px)`;
  const fit = {position: 'absolute', left: FIT.x, top: FIT.y, width: 1080, height: 1920, transform: `scale(${FIT.s})`, transformOrigin: '0 0'};
  const scanY = f < scanOut ? 1920 * (1 - pin) : 1920 * pout; const scanOn = (pin > 0 && pin < 1) || (pout > 0 && pout < 1);
  return (
    <AbsoluteFill style={{background: K.paper, overflow: 'hidden', fontFamily: FONT}}>
      <style>{`@font-face{font-family:MonoX;font-weight:700;src:url(${staticFile('JetBrainsMono-Bold.ttf')})}`}</style>
      <div style={{position: 'absolute', left: -1400, top: -200, width: 4000, height: 2400, transform: `translateX(${-(camX - 540) * FIT.s * z}px) scale(${z})`, transformOrigin: '1940px 1160px'}}><Grid /></div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0) 55%, rgba(14,14,16,0.07) 100%)'}} />
      <div style={fit}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: cam}}>
          {pp < 1 && <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}><SceneA f={f} W={W} B={B} /></div>}
          {f >= panAt - 4 && <div style={{position: 'absolute', left: 1300, top: 0, width: 1080, height: 1920}}><SceneC f={f} W={W} B={B} E={E} /></div>}
        </div>
      </div>
      {/* x-ray layer: revealed above a glowing scan line that sweeps up, removed by the line sweeping back down */}
      {xray && <div style={{position: 'absolute', inset: 0, background: '#0E0E10', clipPath: f < scanOut ? `inset(${(1 - pin) * 100}% 0 0 0)` : `inset(${pout * 100}% 0 0 0)`}}>
        <Grid dark f={f} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(205,242,79,0.12), rgba(0,0,0,0) 60%)'}} />
        <div style={fit}><SceneX f={f} W={W} B={B} /></div>
      </div>}
      {scanOn && <>
        <div style={{position: 'absolute', left: 0, right: 0, top: scanY - 4, height: 8, background: K.lime, boxShadow: `0 0 40px 14px rgba(205,242,79,0.8)`, zIndex: 45}} />
        <div style={{position: 'absolute', left: 80, top: scanY + (f < scanOut ? 20 : -56), zIndex: 45}}><Mono size={26} color={K.lime}>X-ray · scanning</Mono></div>
      </>}
      {/* brand on top + progress line */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, zIndex: 46}}>
        <div style={{width: 66, height: 66, borderRadius: 18, background: dark ? K.lime : K.ui, color: dark ? K.ui : K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44}}>S</div>
        <div style={{fontWeight: 800, fontSize: 46, color: dark ? '#fff' : K.ui, letterSpacing: -1}}>@subcreatorpaid</div>
      </div>
      <div style={{position: 'absolute', left: 200, right: 200, top: 240, height: 6, borderRadius: 3, background: dark ? '#2A2A2D' : K.line, zIndex: 46}}><div style={{width: `${clamp01(f / Math.max(1, total)) * 100}%`, height: '100%', borderRadius: 3, background: dark ? K.lime : K.ui}} /></div>
      <div style={{...fit, zIndex: 50}}><Captions f={f} beats={beats} dark={dark} /></div>
    </AbsoluteFill>
  );
};
