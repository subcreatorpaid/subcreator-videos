// Reusable graphics for the animator (owner review 26 Oct 2026): soft glow instead of hard shadows, 3D tilt,
// pop-ups, elements entering from left/right, a drawn line, a reacting face, phone UIs, a reel wall, a stamp.
// Every piece takes a local frame `f` (frames since it entered), so scenes can chain them without gaps.
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, FONT} from './Short';
import {LOGO} from './logos';

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

// Real platform logos (simple-icons paths, official colours).
export const Logo = ({name, size = 90}) => {
  if (name === 'spotify') return <svg width={size} height={size} viewBox="0 0 24 24"><path d={LOGO.spotify} fill="#1DB954" /></svg>;
  if (name === 'youtube') return <svg width={size} height={size} viewBox="0 0 24 24"><path d={LOGO.youtube} fill="#FF0000" /></svg>;
  if (name === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs><radialGradient id="igg" cx="0.3" cy="1.07" r="1.3"><stop offset="0" stopColor="#FDF497" /><stop offset="0.05" stopColor="#FDF497" /><stop offset="0.45" stopColor="#FD5949" /><stop offset="0.6" stopColor="#D6249F" /><stop offset="0.9" stopColor="#285AEB" /></radialGradient></defs>
      <rect x="0" y="0" width="24" height="24" rx="6" fill="url(#igg)" />
      <g transform="translate(4.2 4.2) scale(0.65)"><path d={LOGO.instagram} fill="#fff" /></g>
    </svg>);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="0" y="0" width="24" height="24" rx="6" fill="#000" />
      <g transform="translate(5 4.6) scale(0.6)"><path d={LOGO.tiktok} fill="#25F4EE" transform="translate(-0.9 -0.7)" /><path d={LOGO.tiktok} fill="#FE2C55" transform="translate(0.9 0.7)" /><path d={LOGO.tiktok} fill="#fff" /></g>
    </svg>);
};
export const BRAND_GLOW = {instagram: '214,36,159', tiktok: '37,244,238', youtube: '255,0,0', spotify: '29,185,84'};

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

// The recurring creator (owner picked this face, 26 Oct 2026: keep it the same in every video).
// mood: -1 = happy, 0 = neutral, 1 = frustrated. hold: what is in the hands.
//   'phone0' phone showing red $0 | 'film' filming a sample | 'laptop' applying on a laptop | 'call' on a call with a brand
//   'money' green payout on the phone | null nothing
export const Face = ({mood = 0, f = 0, size = 620, hold = 'phone0', phoneText = '$0'}) => {
  const m = mood;
  const brow = interpolate(m, [-1, 0, 1], [-10, 0, 18]);
  const browY = interpolate(m, [-1, 0, 1], [-8, 0, 2]);
  const mouth = interpolate(m, [-1, 0, 1], [26, 4, -16]);
  const sweat = interpolate(m, [0.6, 1], [0, 1], clamp);
  const blush = interpolate(m, [-1, -0.4], [0.55, 0], clamp);
  const happyEyes = m < -0.55;
  const shake = m > 0.9 ? Math.sin(f * 1.4) * 4 : 0;
  const bob = Math.sin(f / 9) * 2;
  return (
    <svg width={size * 4 / 3} height={size * 1.25} viewBox="-40 0 320 300" fill="none" style={{transform: `translate(${shake}px, ${bob}px)`, overflow: 'visible'}}>
      <path d="M50 300c4-64 32-96 70-96s66 32 70 96" fill={C.ink} />
      <circle cx="120" cy="104" r="72" fill="#F2C9A5" stroke={C.ink} strokeWidth="5" />
      <path d="M56 84c10-44 52-62 94-50 22 6 34 22 38 40-22-12-50-14-72-6-24 8-42 10-60 16z" fill={C.ink} />
      <path d={`M80 ${96 + browY - brow * 0.2}l28 ${brow * 0.5}`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <path d={`M160 ${96 + browY - brow * 0.2}l-28 ${brow * 0.5}`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      {happyEyes ? (<>
        <path d="M90 120q8-10 16 0" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
        <path d="M134 120q8-10 16 0" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
      </>) : (<><circle cx="98" cy="118" r="7" fill={C.ink} /><circle cx="142" cy="118" r="7" fill={C.ink} /></>)}
      <circle cx="78" cy="140" r="11" fill={RED} opacity={blush * 0.5} /><circle cx="162" cy="140" r="11" fill={RED} opacity={blush * 0.5} />
      <path d={`M96 ${154 - mouth * 0.3}q24 ${mouth} 48 0`} stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
      <path d="M178 70c8 8 8 18 0 24" stroke="#4A90D9" strokeWidth="6" strokeLinecap="round" opacity={sweat} transform={`translate(0 ${sweat * 6})`} />
      {hold === 'phone0' && (
        <g transform="rotate(-12 178 238)">
          <rect x="148" y="186" width="60" height="100" rx="10" fill="#fff" stroke={C.ink} strokeWidth="5" />
          <text x="178" y="246" textAnchor="middle" fontFamily="Inter, Arial" fontWeight="900" fontSize="24" fill={RED}>{phoneText}</text>
        </g>)}
      {hold === 'money' && (
        <g transform="rotate(-10 178 238)">
          <rect x="146" y="184" width="64" height="104" rx="10" fill="#fff" stroke={C.ink} strokeWidth="5" />
          <rect x="154" y="222" width="48" height="26" rx="6" fill={C.acc} />
          <text x="178" y="241" textAnchor="middle" fontFamily="Inter, Arial" fontWeight="900" fontSize="17" fill="#fff">+$50</text>
        </g>)}
      {hold === 'film' && (
        <g transform="rotate(8 190 200)">
          <rect x="150" y="170" width="92" height="56" rx="10" fill={C.ink} />
          <rect x="157" y="176" width="78" height="44" rx="6" fill="#9CC9B0" />
          <circle cx="226" cy="186" r="5" fill={RED} opacity={Math.floor(f / 10) % 2 ? 1 : 0.2} />
        </g>)}
      {hold === 'call' && (
        <g>
          <rect x="176" y="82" width="34" height="62" rx="8" fill={C.ink} transform="rotate(14 193 113)" />
          {[0, 1, 2].map((i) => (<path key={i} d={`M${222 + i * 12} ${96 - i * 4}q${8 + i * 4} 18 0 ${36 + i * 8}`} stroke={C.acc} strokeWidth="5" strokeLinecap="round" opacity={(Math.sin(f / 5 - i) + 1) / 2} />))}
        </g>)}
      {hold === 'laptop' && (
        <g>
          <rect x="30" y="196" width="180" height="104" rx="10" fill="#2A2A2A" stroke={C.ink} strokeWidth="5" />
          <rect x="40" y="206" width="160" height="80" rx="4" fill="#fff" />
          <rect x="52" y="218" width="80" height="8" rx="4" fill={C.line} />
          <rect x="52" y="234" width={40 + ((f * 2) % 90)} height="8" rx="4" fill={C.ink} />
          <rect x="52" y="254" width="56" height="18" rx="5" fill={C.acc} />
          <circle cx="120" cy="250" r="3" fill="#fff" opacity="0.9" />
        </g>)}
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
  <div style={{position: 'absolute', left: x, top: y, width: 34, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.75)', border: '3px solid rgba(21,21,21,0.35)',
    boxShadow: `0 0 0 ${press * 16}px rgba(21,21,21,${0.12 * press})`, transform: `translate(-50%,-50%) scale(${1 - press * 0.2})`}} />
);

export const Chip = ({children, green = false, dark = false, style = {}}) => (
  <div style={{position: 'absolute', whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: '18px 30px', borderRadius: 26,
    background: green ? C.acc : dark ? C.ink : '#fff', color: green || dark ? '#fff' : C.ink, border: dark || green ? 'none' : `3px solid ${C.ink}`,
    boxShadow: green ? `0 0 50px rgba(46,125,79,0.45)` : glow('0,0,0', 0.14, 50), ...style}}>{children}</div>
);

// Tilted wall of YouTube-style video cards scrolling like a feed, columns at different speeds.
const TILES = [
  ['#E9C46A', '#C9962F', 'I tried this serum for 7 days', 'GlowWithMia', '12K views', '0:42'],
  ['#9CC9B0', '#2E7D4F', 'My $30 desk setup glow-up', 'DeskDiaries', '8.1K views', '0:58'],
  ['#C7B8E8', '#6E58B8', 'Honest coffee maker review', 'BrewBen', '23K views', '1:12'],
  ['#F4B6A6', '#D9644A', 'This bottle fixed my gym bag', 'FitByNoor', '5.4K views', '0:35'],
  ['#A9C8E8', '#3D6FA8', 'Phone case drop test', 'TechTariq', '41K views', '0:49'],
  ['#E8D9B8', '#B08C52', 'Healthy snack haul under $20', 'SnackSam', '9.7K views', '0:51'],
  ['#B8E0D2', '#3C8C78', 'Plant care app, 30 days later', 'GreenAisha', '3.2K views', '0:44'],
  ['#F2C1D1', '#C0587A', 'Lip tint wear test', 'BeautyByZara', '17K views', '0:38'],
  ['#D6D2C4', '#6B6658', 'Travel mug: worth it?', 'CommuteKai', '6.6K views', '0:55'],
];
const Tile = ({t, i, f}) => (
  <div style={{borderRadius: 30, background: '#fff', overflow: 'hidden', boxShadow: glow('0,0,0', 0.16, 50), fontFamily: FONT}}>
    <div style={{height: 300, background: `linear-gradient(135deg, ${t[0]}, ${t[1]})`, position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 24, top: 24, right: 120, color: '#fff', fontWeight: 900, fontSize: 40, lineHeight: 1.05, textShadow: '0 3px 12px rgba(0,0,0,0.35)'}}>{t[2].split(' ').slice(0, 3).join(' ').toUpperCase()}</div>
      <div style={{position: 'absolute', right: 26, bottom: -20, width: 120, height: 190, borderRadius: '60px 60px 0 0', background: 'rgba(21,21,21,0.55)'}} />
      <div style={{position: 'absolute', right: 52, bottom: 150, width: 70, height: 70, borderRadius: 35, background: 'rgba(21,21,21,0.55)'}} />
      <div style={{position: 'absolute', right: 14, bottom: 14, background: 'rgba(0,0,0,0.8)', color: '#fff', fontWeight: 700, fontSize: 24, padding: '2px 10px', borderRadius: 8}}>{t[5]}</div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 7, width: `${((f * 1.1 + i * 23) % 100)}%`, background: '#FF0000'}} />
    </div>
    <div style={{display: 'flex', gap: 16, padding: '18px 20px 22px'}}>
      <div style={{width: 58, height: 58, borderRadius: 29, background: t[1], flexShrink: 0, color: '#fff', fontWeight: 900, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t[3][0]}</div>
      <div style={{minWidth: 0}}>
        <div style={{fontWeight: 800, fontSize: 28, lineHeight: 1.15, color: C.ink}}>{t[2]}</div>
        <div style={{fontWeight: 500, fontSize: 23, color: '#606060', marginTop: 6}}>{t[3]} · {t[4]}</div>
      </div>
    </div>
  </div>
);
export const ReelWall = ({f, speed = [3.2, 4.4, 2.6]}) => (
  <div style={{position: 'absolute', left: -240, top: -300, width: 1560, height: 2600, transform: 'perspective(1800px) rotateX(22deg) rotateZ(-12deg)', display: 'flex', gap: 34}}>
    {[0, 1, 2].map((c) => (
      <div key={c} style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 34, transform: `translateY(${-((f * speed[c]) % 474) - (c === 1 ? 220 : 0)}px)`}}>
        {[0, 1, 2, 3, 4, 5, 6].map((r) => { const i = (c * 3 + r) % TILES.length; return <Tile key={r} t={TILES[i]} i={i} f={f} />; })}
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

// Shared story pieces: red X badge, black chip (optionally with the X), green payout card.
export const XMark = ({size = 54}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: RED, color: '#fff', fontWeight: 900, fontSize: size * 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>✕</div>
);
export const BlackChip = ({children, x = false, style = {}}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 20, background: C.ink, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: '20px 32px', borderRadius: 28,
    boxShadow: x ? '0 16px 60px rgba(217,58,58,0.35)' : glow('0,0,0', 0.18, 50), whiteSpace: 'nowrap', ...style}}>{x && <XMark />}{children}</div>
);
export const Payout = ({p, amount = '+$150', label = 'Brand payment', style = {}}) => (
  <div style={{position: 'absolute', opacity: p, transform: `translateY(${(1 - p) * -80}px) scale(${0.9 + 0.1 * p})`, ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 30, padding: '20px 30px', boxShadow: '0 0 60px rgba(46,125,79,0.45)', border: `4px solid ${C.acc}`}}>
      <div style={{width: 60, height: 60, borderRadius: 16, background: C.acc, color: '#fff', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>
      <div><div style={{fontWeight: 700, fontSize: 28, color: '#5F5E58'}}>{label}</div><div style={{fontWeight: 900, fontSize: 48, color: C.acc}}>{amount}</div></div>
    </div>
  </div>
);
