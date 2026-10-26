// Reusable graphics for the animator (owner review 26 Oct 2026): soft glow instead of hard shadows, 3D tilt,
// pop-ups, elements entering from left/right, a drawn line, a reacting face, phone UIs, a reel wall, a stamp.
// Every piece takes a local frame `f` (frames since it entered), so scenes can chain them without gaps.
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, FONT} from './Short';

export const RED = '#D93A3A';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
export const ease = (t, d = 12) => interpolate(t, [0, d], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
// Pop: small overshoot (1.06) then settle, for chips and stickers only.
export const pop = (t, d = 10) => interpolate(t, [0, d * 0.7, d], [0, 1.06, 1], {...clamp, easing: Easing.out(Easing.cubic)});
export const glow = (rgb = '46,125,79', a = 0.22, r = 60) => `0 18px ${r}px rgba(${rgb},${a})`;

// Slides in from the left or right edge, with a little 3D turn that settles flat.
export const FromSide = ({f, side = 'left', d = 14, dist = 700, children, style = {}}) => {
  const p = ease(f, d);
  const s = side === 'left' ? -1 : 1;
  return (
    <div style={{position: 'absolute', opacity: p, transform: `perspective(1600px) translateX(${s * dist * (1 - p)}px) rotateY(${s * -25 * (1 - p)}deg)`, ...style}}>
      {children}
    </div>
  );
};

export const PopIn = ({f, d = 10, children, style = {}, origin = 'center'}) => (
  <div style={{position: 'absolute', transform: `scale(${pop(f, d)})`, transformOrigin: origin, opacity: ease(f, 4), ...style}}>{children}</div>
);

export const CountUp = ({f, from = 0, to, d = 40, fmt = (n) => Math.round(n).toLocaleString('en-US')}) => (
  <>{fmt(interpolate(f, [0, d], [from, to], {...clamp, easing: Easing.out(Easing.cubic)}))}</>
);

export const RedPill = ({children, size = 64, style = {}}) => (
  <div style={{display: 'inline-block', background: RED, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: size, padding: `${size * 0.08}px ${size * 0.32}px`,
    borderRadius: size * 0.22, boxShadow: `0 0 ${size * 0.8}px rgba(217,58,58,0.45)`, ...style}}>{children}</div>
);

const Ico = {
  instagram: (c) => (<><rect x="3" y="3" width="18" height="18" rx="5" stroke={c} /><circle cx="12" cy="12" r="4" stroke={c} /><circle cx="17.5" cy="6.5" r="1" fill={c} /></>),
  tiktok: (c) => (<><path d="M14 3v10.5a3.5 3.5 0 1 1-3.5-3.5" stroke={c} /><path d="M14 3c.5 2.5 2.5 4.5 5 5" stroke={c} /></>),
  youtube: (c) => (<><rect x="2" y="5" width="20" height="14" rx="4" stroke={c} /><path d="M10 9l5 3-5 3z" fill={c} /></>),
};
export const PlatformIcon = ({name, size = 70, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{Ico[name](color)}</svg>
);

export const GlowCard = ({children, style = {}, tint = '46,125,79'}) => (
  <div style={{background: C.card, borderRadius: 40, boxShadow: glow(tint, 0.2, 70), fontFamily: FONT, color: C.ink, ...style}}>{children}</div>
);

// Bottom stack (owner rule): subtitle chunk, then the handle under it.
export const Subtitle = ({text = '', hi = [], red = [], top = 1420}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 62, lineHeight: 1.15}}>
    {text.split(' ').map((w, i) => (
      <span key={i} style={{color: red.includes(w.replace(/[^\w$]/g, '').toLowerCase()) ? RED : hi.includes(w.replace(/[^\w$]/g, '').toLowerCase()) ? C.acc : 'inherit'}}>{w} </span>
    ))}
  </div>
);
export const Handle = ({top = 1560}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, opacity: 0.6}}>@subcreatorpaid</div>
);

// A cartoon creator whose mood goes from 0 (hopeful) to 1 (frustrated).
export const Face = ({mood = 0, f = 0, size = 620, phoneText = '$0'}) => {
  const m = mood;
  const brow = interpolate(m, [0, 1], [-6, 18]);
  const mouth = interpolate(m, [0, 1], [16, -16]);
  const sweat = interpolate(m, [0.6, 1], [0, 1], clamp);
  const shake = m > 0.9 ? Math.sin(f * 1.4) * 4 : 0;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 240 300" fill="none" style={{transform: `translateX(${shake}px)`}}>
      <path d="M50 300c4-64 32-96 70-96s66 32 70 96" fill={C.ink} />
      <circle cx="120" cy="104" r="72" fill="#F2C9A5" stroke={C.ink} strokeWidth="5" />
      <path d="M56 84c10-44 52-62 94-50 22 6 34 22 38 40-22-12-50-14-72-6-24 8-42 10-60 16z" fill={C.ink} />
      <path d={`M80 ${96 - brow * 0.2}l28 ${brow * 0.5}`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <path d={`M160 ${96 - brow * 0.2}l-28 ${brow * 0.5}`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <circle cx="98" cy="118" r="7" fill={C.ink} /><circle cx="142" cy="118" r="7" fill={C.ink} />
      <path d={`M96 ${156 - mouth * 0.3}q24 ${mouth} 48 0`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <path d="M178 70c8 8 8 18 0 24" stroke="#4A90D9" strokeWidth="6" strokeLinecap="round" opacity={sweat} transform={`translate(0 ${sweat * 6})`} />
      <g transform="rotate(-12 178 238)">
        <rect x="148" y="186" width="60" height="100" rx="10" fill="#fff" stroke={C.ink} strokeWidth="5" />
        <text x="178" y="246" textAnchor="middle" fontFamily="Inter, Arial" fontWeight="900" fontSize="24" fill={RED}>{phoneText}</text>
      </g>
    </svg>
  );
};

// Phone frame with a 3D tilt; content is whatever screen you pass.
export const Phone = ({children, w = 560, h = 1120, tilt = 0, style = {}}) => (
  <div style={{position: 'absolute', width: w, height: h, borderRadius: 80, background: C.ink, padding: 22, boxSizing: 'border-box',
    transform: `perspective(2200px) rotateY(${tilt}deg) rotateZ(${tilt * -0.12}deg)`, boxShadow: glow('46,125,79', 0.28, 90), ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 60, background: '#fff', overflow: 'hidden', position: 'relative'}}>{children}</div>
  </div>
);

export const Cursor = ({x, y, press = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70, height: 70, borderRadius: 35, background: 'rgba(21,21,21,0.18)', border: '5px solid rgba(21,21,21,0.7)',
    transform: `translate(-50%,-50%) scale(${1 - press * 0.25})`}} />
);

export const Chip = ({children, green = false, style = {}}) => (
  <div style={{position: 'absolute', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: '18px 30px', borderRadius: 26,
    background: green ? C.acc : '#fff', color: green ? '#fff' : C.ink, boxShadow: green ? `0 0 50px rgba(46,125,79,0.45)` : glow('0,0,0', 0.1, 50), ...style}}>{children}</div>
);

// Tilted wall of sample "videos" scrolling like reels, columns at different speeds.
const TILES = [
  ['#E9C46A', '#C9962F', 'skincare unboxing'], ['#9CC9B0', '#2E7D4F', 'desk setup'], ['#C7B8E8', '#6E58B8', 'coffee review'],
  ['#F4B6A6', '#D9644A', 'gym bottle'], ['#A9C8E8', '#3D6FA8', 'phone case'], ['#E8D9B8', '#B08C52', 'snack haul'],
  ['#B8E0D2', '#3C8C78', 'plant care'], ['#F2C1D1', '#C0587A', 'lip tint'], ['#D6D2C4', '#6B6658', 'travel mug'],
];
const Tile = ({t, i, f}) => (
  <div style={{height: 520, borderRadius: 36, background: `linear-gradient(180deg, ${t[0]}, ${t[1]})`, position: 'relative', overflow: 'hidden', boxShadow: glow('0,0,0', 0.16, 50)}}>
    <div style={{position: 'absolute', left: '50%', top: '42%', width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.85)',
      transform: `translate(-50%,-50%) scale(${1 + 0.05 * Math.sin((f + i * 9) / 8)})`}}>
      <div style={{position: 'absolute', left: 48, top: 36, width: 0, height: 0, borderTop: '24px solid transparent', borderBottom: '24px solid transparent', borderLeft: `38px solid ${t[1]}`}} />
    </div>
    <div style={{position: 'absolute', left: 24, bottom: 24, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34}}>{t[2]}</div>
    <div style={{position: 'absolute', left: 24, right: 24, bottom: 10, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.4)'}}>
      <div style={{width: `${((f * 1.3 + i * 30) % 100)}%`, height: '100%', background: '#fff', borderRadius: 3}} />
    </div>
  </div>
);
export const ReelWall = ({f, speed = [3.2, 4.4, 2.6]}) => (
  <div style={{position: 'absolute', left: -220, top: -300, width: 1520, height: 2600, transform: 'perspective(1800px) rotateX(22deg) rotateZ(-12deg)', display: 'flex', gap: 36}}>
    {[0, 1, 2].map((c) => (
      <div key={c} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 36, transform: `translateY(${-((f * speed[c]) % 556) - (c === 1 ? 260 : 0)}px)`}}>
        {[0, 1, 2, 3, 4, 5].map((r) => { const i = (c * 3 + r) % TILES.length; return <Tile key={r} t={TILES[i]} i={i} f={f} />; })}
      </div>
    ))}
  </div>
);

// Stamp that slams down (scale 2.2 -> 1) with a short settle; black by default.
export const Stamp = ({f, text, color = C.ink, size = 92, rot = -8, style = {}}) => {
  const s = interpolate(f, [0, 6, 10], [2.2, 0.96, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', opacity: ease(f, 3), transform: `rotate(${rot}deg) scale(${s})`, background: color, color: '#fff', fontFamily: FONT, fontWeight: 900,
      fontSize: size, letterSpacing: 3, padding: '22px 44px', borderRadius: 24, boxShadow: `0 0 70px rgba(0,0,0,${0.35 * ease(f - 6, 8)})`, whiteSpace: 'nowrap', ...style}}>{text}</div>
  );
};

// A path that draws itself; p = 0..1.
export const DrawLine = ({d, p, color = C.acc, width = 12, len = 4000, dash = false}) => (
  <svg width={1080} height={4000} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} fill="none">
    <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} opacity={dash ? 0.9 : 1} />
  </svg>
);
