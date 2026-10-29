// Film 4, "Overview" (owner, 29 Oct 2026: "one detailed video ... as a company overview, max animations and dynamic
// graphics"). Same launch-film look (rules F): one palette (white #F5F5F2 / ink #0E0E10 / lime #CDF24F, red only on
// "the catch"), real logos, Instagram safe box with @subcreatorpaid on top. One continuous take: every chapter is a cell
// on one big canvas and the camera whips from cell to cell (dip zoom + skew), so there are no cuts or fades.
// Chapters: who we are -> the channel -> the website + 16 guides -> AI Income Finder -> tracker + tools -> free guide ->
// newsletter -> our promise -> outro.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, staticFile} from 'remotion';
import {FONT} from '../Short';
import {Logo} from '../graphics';
import {expo, expoIn, inOut, spring, kf, mix, clamp01, camera, Rise, typedCount, Cursor, useTimes, hash} from './kit';
import {StreamArt, Avatar, Icon, Check, BrandLogo} from './art';
import {Burst, Pulse, Dust, Iridescent} from './Launch';

const K = {bg: '#E3E3DB', ui: '#0E0E10', lime: '#CDF24F', soft: '#F1FBD0', mut: '#5F5E58', line: '#CFCEC4', red: '#D93A3A', card: '#1C1C1F'};
const ART = {ink: '#0E0E10', a: '#CDF24F', b: '#FFFFFF', c: '#2E2E33', box: '#FFFFFF', rec: '#CDF24F', recInk: '#0E0E10'};
const ORBIT = ['instagram', 'tiktok', 'youtube', 'spotify', 'etsy', 'amazon', 'fiverr', 'elevenlabs', 'kit', 'patreon', 'substack', 'gumroad', 'twitch', 'beehiiv', 'billo', 'kofi'];
// the 16 stream guides on the site (site/data/streams), shown by the platform's own mark
const STREAMS = [['ugc', 'UGC'], ['etsy', 'Etsy'], ['amazon', 'Amazon'], ['fiverr', 'Fiverr'], ['elevenlabs', 'Voice'], ['beehiiv', 'Newsletter'], ['gumroad', 'Gumroad'], ['kofi', 'Ko-fi'],
  ['patreon', 'Patreon'], ['spotify', 'Spotify'], ['substack', 'Substack'], ['tiktok', 'Rewards'], ['tiktok', 'TikTok Shop'], ['twitch', 'Twitch'], ['youtube', 'Shopping'], ['youtube', 'Fan funding']];
// beat -> canvas cell; cells sit on a zigzag so each move is a diagonal whip
const CELL = [0, 1, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 11];
const DARK = {5: true, 10: true, 11: true};
const cellPos = (c) => ({x: (c % 2) * 1300, y: c * 2100});
const CHAPTERS = [[0, 'Who we are'], [2, 'The channel'], [4, 'The website'], [6, 'AI Income Finder'], [8, 'Free tools'], [9, 'Free guides'], [10, 'The free list'], [11, 'All free'], [12, 'Our promise']];

// Real captures of the live site (Lime Glass look), taken with playwright from the built site; listed in beat 4's show.images so prep.py copies them.
const Cap = ({name, w = 980, y = 0, h, r = 0, style = {}}) => (
  <div style={{width: w, height: h, overflow: 'hidden', borderRadius: r, position: 'relative', ...style}}>
    <img src={staticFile('a_' + name + '.png')} style={{width: w, display: 'block', marginTop: -y}} />
  </div>
);
const CapBox = ({name, w = 900, h, x = 0, y = 0, sc = 1, style = {}}) => (
  <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', ...style}}>
    <img src={staticFile('a_' + name + '.png')} style={{position: 'absolute', left: -x * sc, top: -y * sc, width: 1000 * sc}} />
  </div>
);
// Sophisticated pointer (owner, 29 Oct): arrow with a lime halo, a short comet trail, a click ripple and an optional label chip.
const Pointer = ({f, track, clicks = [], label, labelAt = 0}) => {
  if (f < track[0][0] || f > track[track.length - 1][0] + 12) return null;
  const at = (ff) => [kf(ff, track.map(([t, x]) => [t, x])), kf(ff, track.map(([t, , y]) => [t, y]))];
  const [x, y] = at(f); const ck = clicks.find((c) => f >= c && f < c + 16); const t = ck === undefined ? -1 : (f - ck) / 16;
  const appear = expo(f - track[0][0], 6);
  return (<>
    {[8, 5, 3].map((d, i) => { const [tx, ty] = at(f - d); return <div key={d} style={{position: 'absolute', left: tx - 8 + 4, top: ty - 8 + 4, width: 16 - i * 3, height: 16 - i * 3, borderRadius: '50%', background: K.lime, opacity: (0.18 + i * 0.16) * appear, zIndex: 59}} />; })}
    {t >= 0 && <div style={{position: 'absolute', left: x + 4 - 20 - t * 50, top: y + 4 - 20 - t * 50, width: 40 + t * 100, height: 40 + t * 100, borderRadius: '50%', border: `${5 - t * 4}px solid ${K.lime}`, opacity: 1 - t, zIndex: 58}} />}
    <div style={{position: 'absolute', left: x, top: y, zIndex: 60, opacity: appear, transform: `scale(${t >= 0 && t < 0.3 ? 0.82 : 1})`, transformOrigin: '4px 4px'}}>
      <div style={{position: 'absolute', left: -26, top: -26, width: 72, height: 72, borderRadius: 36, background: K.lime, opacity: 0.45, filter: 'blur(10px)'}} />
      <svg width="52" height="64" viewBox="0 0 27 33" style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))'}}>
        <path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill="#0E0E10" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
      {label && f >= labelAt && <div style={{position: 'absolute', left: 46, top: 52, transform: `scale(${spring(f - labelAt, {w: 0.55, z: 0.55})})`, transformOrigin: '0 0'}}><Pill bg={K.ui} color="#fff" size={30} style={{border: `3px solid ${K.lime}`}}>{label}</Pill></div>}
    </div>
  </>);
};
const pop = (f, at, o = {w: 0.42, z: 0.6}) => spring(f - at, o);
const Card = ({children, style = {}, dark}) => (
  <div style={{position: 'absolute', background: dark ? K.card : '#fff', borderRadius: 44, boxShadow: '0 30px 70px rgba(0,0,0,0.12)', fontFamily: FONT, ...style}}>{children}</div>
);
const Tile = ({name, size = 120, r = 30, logo = 0.62, bg = '#fff', style = {}}) => (
  <div style={{width: size, height: size, borderRadius: r, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 ${size * 0.14}px ${size * 0.34}px rgba(0,0,0,0.20), 0 2px 4px rgba(0,0,0,0.10), 0 0 ${size * 0.5}px rgba(205,242,79,0.55)`, ...style}}>
    {name === 'ugc' ? <StreamArt kind="ugc" size={size * 0.9} p={{...ART, a: '#fff', rec: K.ui, recInk: K.lime}} /> : <BrandLogo name={name} size={size * logo} />}
  </div>
);
const Pill = ({children, bg = K.ui, color = '#fff', size = 40, style = {}}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: bg, color, borderRadius: 999, padding: `${size * 0.36}px ${size * 0.8}px`, fontFamily: FONT, fontWeight: 800, fontSize: size, whiteSpace: 'nowrap', ...style}}>{children}</span>
);
const Lock = ({size = 40, color = K.ui}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3" fill={color} /><path d="M8 10 V7 A4 4 0 0 1 16 7 V10" stroke={color} strokeWidth="2.4" fill="none" /></svg>
);
const Money = ({children, size = 76, p = 1}) => (
  <span style={{display: 'inline-block', background: K.lime, color: K.ui, borderRadius: size * 0.24, padding: `${size * 0.06}px ${size * 0.3}px 0`, fontWeight: 900, fontSize: size, transform: `scaleX(${p})`, transformOrigin: 'left'}}>{children}</span>
);
const count = (f, at, to, d = 20) => Math.round(to * expo(f - at, d));
const fmt = (n) => n.toLocaleString('en-US');

// ---------------------------------------------------------------- 0: hook + brand reveal
const S0 = ({f, W}) => {
  const out = expoIn(f - W(0, 'this') + 6, 8);
  const roll = count(f, W(0, '10000') - 8, 10000, 18);
  const strike = expo(f - W(0, 'to'), 8); const fall = expoIn(f - W(0, 'paid') - 4, 12);
  const paid = pop(f, W(0, 'paid') - 2, {w: 0.5, z: 0.55});
  const mark = pop(f, W(0, 'this') - 2, {w: 0.4, z: 0.62});
  return (<>
    <div style={{position: 'absolute', left: 90, right: 90, top: 300, opacity: 1 - out}}>
      <Rise f={f} at={4} text="You don't need" size={96} weight={900} font={FONT} />
    </div>
    <Card style={{left: 110, top: 560, width: 860, height: 420, transform: `translateY(${fall * 900 + (1 - pop(f, W(0, 'need') - 8)) * 500}px) rotate(${fall * 24 + Math.sin(f / 12) * 1.5}deg) scale(${1 - out})`, opacity: 1 - out}}>
      <div style={{position: 'absolute', left: 60, top: 50, display: 'flex', gap: 18}}>{['instagram', 'tiktok', 'youtube'].map((n, i) => <span key={n} style={{transform: `scale(${pop(f, W(0, 'need') - 4 + i * 3)})`}}><Logo name={n} size={64} /></span>)}</div>
      <div style={{position: 'absolute', left: 56, top: 130, fontWeight: 900, fontSize: 190, letterSpacing: -8, color: K.ui}}>{fmt(roll)}</div>
      <div style={{position: 'absolute', left: 62, top: 330, fontWeight: 700, fontSize: 44, color: K.mut}}>followers</div>
      <div style={{position: 'absolute', left: 40, top: 225, width: 780, height: 26, borderRadius: 13, background: K.ui, transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: 'left'}} />
    </Card>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', transform: `scale(${mix(2.2, 1, paid) * (1 - out)}) rotate(${(1 - paid) * -12}deg)`, opacity: clamp01(paid * 2)}}>
      <Pill bg={K.lime} color={K.ui} size={110}>to get paid.</Pill>
    </div>
    <Burst f={f} at={W(0, 'paid')} x={540} y={1240} n={18} r={460} />
    {/* brand mark with the 16 stream logos orbiting it */}
    {mark > 0 && <>
      <div style={{position: 'absolute', left: 540 - 520, top: 860 - 520, width: 1040, height: 1040, borderRadius: '50%', opacity: mark * (0.85 + 0.15 * Math.sin(f / 9)), background: 'radial-gradient(circle, rgba(205,242,79,0.85) 0%, rgba(205,242,79,0.35) 38%, rgba(205,242,79,0) 70%)'}} />
      <svg width="900" height="900" style={{position: 'absolute', left: 90, top: 410, transform: `rotate(${f * 4}deg)`, opacity: mark}}>
        <circle cx="450" cy="450" r="420" stroke={K.lime} strokeWidth="12" fill="none" strokeDasharray="400 900" strokeLinecap="round" />
        <circle cx="450" cy="450" r="420" stroke={K.ui} strokeWidth="5" fill="none" strokeDasharray="80 1300" strokeDashoffset="-700" strokeLinecap="round" />
      </svg>
      {ORBIT.map((n, i) => { const p = expo(f - W(0, 'this') - i * 0.8, 14); const a = (i / 16) * Math.PI * 2 + f / 40; const R = 360 * p;
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * R - 50, top: 860 + Math.sin(a) * R - 50, transform: `scale(${p}) rotate(${(1 - p) * 180}deg)`, filter: `drop-shadow(0 ${20 + Math.sin(a) * 8}px 18px rgba(14,14,16,0.22))`}}><Tile name={n} size={100} r={28} /></div>; })}
      <div style={{position: 'absolute', left: 540 - 150, top: 860 - 150, width: 300, height: 300, borderRadius: 80, background: K.ui, transform: `scale(${mark}) rotate(${(1 - mark) * -90}deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontWeight: 900, fontSize: 200}}>S</div>
      <Pulse f={f} x={540} y={860} d={320} from={W(0, 'this') + 6} every={22} />
      <Burst f={f} at={W(0, 'this') + 2} x={540} y={860} n={20} r={520} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center'}}>
        <Rise f={f} at={W(0, 'sub-creator') - 3} text="Sub-Creator Paid" size={108} weight={900} font={FONT} />
      </div>
    </>}
  </>);
};

// ---------------------------------------------------------------- 1: what we do (find, check, the catch)
const S1 = ({f, W, B}) => {
  const rows = [
    {at: W(1, 'find'), y: 430, k: 'Find', t: 'The ways small creators really get paid'},
    {at: W(1, 'check'), y: 870, k: 'Check', t: 'Every number on the official page'},
    {at: W(1, 'catch') - 10, y: 1310, k: 'The catch', t: 'Always shown, never hidden', red: true},
  ];
  return (<>
    <div style={{position: 'absolute', left: 90, top: 250}}><Rise f={f} at={B(1) + 2} text="What we do" size={84} weight={900} font={FONT} /></div>
    <div style={{position: 'absolute', left: 178, top: 560, width: 12, height: 900, background: K.lime, borderRadius: 6, transform: `scaleY(${kf(f, [[W(1, 'find'), 0], [W(1, 'catch'), 1]])})`, transformOrigin: 'top'}} />
    {rows.map((r, i) => { const p = pop(f, r.at - 4); if (p <= 0) return null; const sw = r.red ? Math.sin((f - r.at) / 4) * 10 * Math.exp(-(f - r.at) / 18) : 0;
      return (
        <Card key={i} style={{left: 90, top: r.y + Math.sin(f / 13 + i) * 6, width: 900, height: 360, transform: `translateX(${(1 - p) * 900}px) rotate(${(1 - p) * 8 + sw}deg)`, transformOrigin: '0 50%', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 44, top: 44, width: 180, height: 180, borderRadius: 48, background: r.red ? K.red : K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {i === 0 && <Icon name="search" size={110} color={K.lime} />}
            {i === 1 && <Check size={120} color={K.lime} p={expo(f - r.at, 12)} />}
            {i === 2 && <span style={{color: '#fff', fontWeight: 900, fontSize: 120}}>!</span>}
          </div>
          <div style={{position: 'absolute', left: 260, top: 50, fontWeight: 900, fontSize: 76, color: r.red ? K.red : K.ui}}>{r.k}</div>
          <div style={{position: 'absolute', left: 262, top: 145, right: 40, fontWeight: 700, fontSize: 42, lineHeight: 1.2, color: K.mut}}>{r.t}</div>
          {i === 0 && <div style={{position: 'absolute', left: 24, right: 24, top: 236, height: 104, borderRadius: 30, background: 'linear-gradient(180deg, #D9F58A, #CDF24F)', boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.18)', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 20, top: 14, display: 'flex', gap: 18, transform: `translateX(${-((f * 4) % 720)}px)`}}>{[...ORBIT, ...ORBIT].map((n, j) => <Tile key={j} name={n} size={76} r={22} />)}</div></div>}
          {i === 1 && <div style={{position: 'absolute', left: 262, top: 262, transform: `scale(${pop(f, W(1, 'official'), {w: 0.6, z: 0.5})}) rotate(-6deg)`}}>
            <Pill bg={K.lime} color={K.ui} size={38}><Check size={40} color={K.ui} />Source checked</Pill></div>}
          {i === 2 && <div style={{position: 'absolute', left: 262, top: 262}}><Pill bg="#FBE3E3" color={K.red} size={38}>Shown in every video</Pill></div>}
        </Card>
      ); })}
    <Burst f={f} at={W(1, 'official')} x={500} y={1160} n={14} r={300} />
  </>);
};

// ---------------------------------------------------------------- 2: who it's for (any size; each guide shows the followers needed)
const S2 = ({f, W, B}) => {
  const ex = W(2, 'exactly'); const card = pop(f, ex - 22, {w: 0.36, z: 0.72}); const hl = expo(f - ex + 2, 10);
  return (<>
    <div style={{position: 'absolute', left: 90, top: 250}}><Rise f={f} at={B(2) + 2} text="Made for every size" size={84} weight={900} font={FONT} /></div>
    {['instagram', 'tiktok', 'youtube'].map((n, i) => { const at = W(2, n); const p = pop(f, at - 4, {w: 0.5, z: 0.5});
      return <div key={n} style={{position: 'absolute', left: 430 + (i - 1) * 300, top: 400 + Math.sin(f / 10 + i * 2) * 10, transform: `scale(${p}) rotate(${(1 - p) * 40}deg)`}}>
        <Tile name={n} size={220} r={60} logo={0.55} />
        {p > 0.9 && f < at + 30 && <Pulse f={f} x={110} y={110} d={230} from={at} every={30} />}
      </div>; })}
    <Card style={{left: 90, top: 740, width: 900, height: 430, overflow: 'hidden', transform: `translateY(${(1 - card) * 900}px) rotate(${(1 - card) * -6}deg)`}}>
      <CapBox name="stream" w={900} h={430} x={575} y={128} sc={2.05} />
      <div style={{position: 'absolute', left: 14, top: 38, width: 872, height: 212, borderRadius: 26, background: 'rgba(205,242,79,0.42)', border: `5px solid ${K.ui}`, opacity: hl, transform: `scale(${mix(1.06, 1, hl)})`}} />
    </Card>
    <Pointer f={f} track={[[ex - 26, 900, 1500], [ex - 6, 700, 1000], [ex + 6, 560, 880], [ex + 60, 560, 880]]} clicks={[ex + 4]} label="Followers needed" labelAt={ex} />
    {(() => { const p = pop(f, W(2, 'learning') - 4); return (
      <div style={{position: 'absolute', left: 90, right: 90, top: 1290, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, transform: `scale(${p})`}}>
        <div style={{transform: `rotate(${Math.sin(f / 6) * 6}deg)`}}><Avatar size={150} hat={false} /></div>
        <div style={{background: K.ui, color: '#fff', borderRadius: '44px 44px 44px 8px', padding: '30px 40px', fontFamily: FONT, fontWeight: 800, fontSize: 50}}>
          I'm learning <span style={{color: K.lime}}>alongside you.</span></div>
      </div>); })()}
  </>);
};

// ---------------------------------------------------------------- 3: the channel (UGC-style ads playing in a phone)
const ADS = [
  {bg: '#CDF24F', fg: '#0E0E10', art: 'bottle', hook: 'My new routine', cta: 'Shop now', tag: '$24'},
  {bg: '#0E0E10', fg: '#CDF24F', art: 'phones', hook: 'Unboxing day', cta: 'Learn more', tag: '$79'},
  {bg: '#FFFFFF', fg: '#0E0E10', art: 'mug', hook: 'Morning coffee, sorted', cta: 'Shop now', tag: '$18'},
];
const AdArt = ({kind, fg, acc}) => {
  if (kind === 'bottle') return <svg width="260" height="360" viewBox="0 0 130 180"><rect x="48" y="6" width="34" height="26" rx="6" fill={fg} /><rect x="38" y="30" width="54" height="16" rx="5" fill={fg} opacity="0.7" /><rect x="22" y="44" width="86" height="128" rx="26" fill={acc} stroke={fg} strokeWidth="5" /><rect x="40" y="82" width="50" height="40" rx="8" fill={fg} /></svg>;
  if (kind === 'phones') return <svg width="320" height="300" viewBox="0 0 160 150"><path d="M26 92 V70 A54 54 0 0 1 134 70 V92" stroke={fg} strokeWidth="12" fill="none" strokeLinecap="round" /><rect x="14" y="84" width="34" height="56" rx="14" fill={acc} stroke={fg} strokeWidth="5" /><rect x="112" y="84" width="34" height="56" rx="14" fill={acc} stroke={fg} strokeWidth="5" /></svg>;
  return <svg width="300" height="300" viewBox="0 0 150 150"><path d="M30 50 H108 V104 A26 26 0 0 1 82 130 H56 A26 26 0 0 1 30 104 Z" fill={acc} stroke={fg} strokeWidth="6" strokeLinejoin="round" /><path d="M108 62 H122 A14 14 0 0 1 122 96 H108" stroke={fg} strokeWidth="6" fill="none" /><path d="M54 40 Q48 28 56 18 M72 40 Q66 28 74 18 M90 40 Q84 28 92 18" stroke={fg} strokeWidth="5" fill="none" strokeLinecap="round" /></svg>;
};
const AdClip = ({f, i, ad}) => {
  const dark = ad.bg === '#0E0E10'; const acc = dark ? '#2E2E33' : ad.bg === '#FFFFFF' ? K.lime : '#FFFFFF';
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 484, height: 1024, background: ad.bg, fontFamily: FONT, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 24, top: 58, display: 'flex', gap: 10}}><Pill bg={dark ? '#2E2E33' : K.ui} color={dark ? '#fff' : K.lime} size={22}>Sponsored</Pill></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220 + Math.sin(f / 12 + i) * 14, display: 'flex', justifyContent: 'center', transform: `rotate(${Math.sin(f / 16 + i) * 3}deg)`}}><AdArt kind={ad.art} fg={ad.fg} acc={acc} /></div>
      <div style={{position: 'absolute', right: 120, top: 200 + Math.cos(f / 9) * 6, transform: `scale(${spring(f - 14, {w: 0.5, z: 0.5})}) rotate(8deg)`}}><Pill bg={K.lime} color={K.ui} size={30} style={{border: `3px solid ${K.ui}`}}>{ad.tag}</Pill></div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 640, fontWeight: 900, fontSize: 46, color: ad.fg, lineHeight: 1.05}}>{ad.hook}</div>
      <div style={{position: 'absolute', left: 24, top: 790, display: 'flex', alignItems: 'center', gap: 14}}><Avatar size={70} hat={false} /><div style={{fontWeight: 800, fontSize: 28, color: ad.fg}}>@creator</div></div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 890, height: 80, borderRadius: 40, background: dark ? K.lime : K.ui, color: dark ? K.ui : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 34, transform: `scale(${1 + 0.03 * Math.sin(f / 5)})`}}>{ad.cta}</div>
      <div style={{position: 'absolute', right: 20, top: 520, display: 'flex', flexDirection: 'column', gap: 28}}>{['star', 'play', 'link'].map((n) => <Icon key={n} name={n} size={44} color={ad.fg} />)}</div>
    </div>
  );
};
const S3 = ({f, W, B, E}) => {
  const ph = pop(f, B(3) + 2, {w: 0.36, z: 0.7});
  const D = Math.max(70, (E(3) - B(3) - 12) / 3); const lt = f - B(3) - 8; const k = Math.max(0, Math.floor(lt / D)); const sw = clamp01((lt - (k + 1) * D + 12) / 12);
  const yOff = -(Math.min(k, 2) * 1024 + (k < 2 ? inOut(sw * 12, 12) * 1024 : 0));
  const SERIES = [['Stream of the Week', 30, 360, -5], ['Tools That Pay', 650, 520, 4], ['Myths + how-tos', 20, 1160, 3], ['Small Account Wins', 560, 1470, -4]];
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230, display: 'flex', alignItems: 'center', gap: 16}}>
      <Rise f={f} at={B(3) + 2} text="The channel" size={84} weight={900} font={FONT} />
      {['instagram', 'tiktok', 'youtube'].map((n, i) => <span key={n} style={{transform: `scale(${pop(f, W(3, 'channel') + i * 3)})`, marginTop: -10}}><Logo name={n} size={60} /></span>)}
    </div>
    <div style={{position: 'absolute', left: 280, top: 400, width: 520, height: 1060, borderRadius: 80, background: K.ui, padding: 18, transform: `translateY(${(1 - ph) * 1200}px) rotate(${(1 - ph) * 14 + Math.sin(f / 20) * 1.5}deg)`, boxShadow: '0 50px 100px rgba(0,0,0,0.3), 0 0 90px rgba(205,242,79,0.35)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 64, overflow: 'hidden', background: K.ui}}>
        <div style={{position: 'absolute', left: 0, top: yOff, width: 484, height: 3072}}>
          {ADS.map((ad, i) => <div key={i} style={{position: 'absolute', left: 0, top: i * 1024}}><AdClip f={f} i={i} ad={ad} /></div>)}
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 24, height: 8, borderRadius: 4, background: 'rgba(120,120,120,0.45)'}}><div style={{width: `${clamp01((f - B(3)) / (E(3) - B(3))) * 100}%`, height: '100%', borderRadius: 4, background: '#fff'}} /></div>
      </div>
    </div>
    {SERIES.map(([t, x, y, r], i) => { const p = pop(f, W(3, 'short') + i * 4, {w: 0.5, z: 0.55});
      return <div key={t} style={{position: 'absolute', left: x, top: y + Math.sin(f / 11 + i) * 10, transform: `scale(${p}) rotate(${r}deg)`, boxShadow: '0 16px 40px rgba(0,0,0,0.2)', borderRadius: 999}}>
        <Pill bg={i % 2 ? '#fff' : K.lime} color={K.ui} size={36}>{t}</Pill></div>; })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1590, display: 'flex', justifyContent: 'center', gap: 20}}>
      <span style={{display: 'inline-block', transform: `scale(${pop(f, W(3, 'pay') - 3)})`}}><Money size={52}>$50–$400 a video</Money></span>
      <span style={{display: 'inline-block', transform: `scale(${pop(f, W(3, 'catch') - 3)}) rotate(${f >= W(3, 'catch') ? Math.sin((f - W(3, 'catch')) / 3) * 4 * Math.exp(-(f - W(3, 'catch')) / 14) : 0}deg)`}}><Pill bg={K.red} size={46}>The catch</Pill></span>
    </div>
    <Burst f={f} at={W(3, 'pay')} x={540} y={1620} n={14} r={300} />
  </>);
};

// ---------------------------------------------------------------- 4 + 5: the website and its 16 guides
const S4 = ({f, W, B}) => {
  const win = pop(f, B(4) - 2, {w: 0.34, z: 0.72});
  const URL = 'subcreatorpaid.com'; const typed = typedCount(f, B(4) + 4, URL.length, 7, 2.4);
  const built = B(4) + 16;
  const scroll = expo(f - B(5) + 2, 16);
  const tileAt = (i) => B(5) + 4 + i * 1.6;
  const hi = {UGC: W(5, 'ugc'), Etsy: W(5, 'etsy'), Rewards: W(5, 'rewards'), Patreon: W(5, 'patreon')};
  const n16 = count(f, B(5) + 2, 16, 26);
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(4) + 2} text="The website" size={84} weight={900} font={FONT} /></div>
    <div style={{position: 'absolute', left: 50, top: 380, width: 980, height: 1180, borderRadius: 44, background: '#fff', overflow: 'hidden', boxShadow: '0 50px 110px rgba(0,0,0,0.2)',
      transform: `perspective(1800px) translateY(${(1 - win) * 1300}px) rotateX(${(1 - win) * 30}deg)`, fontFamily: FONT}}>
      {/* chrome */}
      <div style={{height: 120, background: '#EDEDE8', display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 24, height: 24, borderRadius: 12, background: i === 2 ? K.lime : '#C8C8C2'}} />)}
        <div style={{marginLeft: 20, flex: 1, height: 70, borderRadius: 35, background: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px', fontWeight: 700, fontSize: 38, color: K.ui}}>
          <Lock size={30} color={K.mut} />{URL.slice(0, typed)}{typed < URL.length && f % 16 < 8 ? '|' : ''}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, transform: `translateY(${-scroll * 1060}px)`, opacity: expo(f - built + 4, 6)}}>
        <Cap name="home" w={980} />
        <Cap name="streams" w={980} />
        <div style={{position: 'absolute', left: 60, top: 1000, transform: `scale(${pop(f, built + 6)})`, transformOrigin: 'left'}}><Pill bg={K.lime} color={K.ui} size={34}>Live on subcreatorpaid.com</Pill></div>
        <div style={{position: 'absolute', left: 40, top: 1930, display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(14,14,16,0.92)', borderRadius: 40, padding: '14px 30px 14px 14px', transform: `scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(f - W(5, '16') - 2) / 6)})`, transformOrigin: 'left'}}>
          <div style={{width: 96, height: 96, borderRadius: 28, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 66, color: K.ui, fontFamily: FONT}}>{n16}</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: '#fff'}}>income stream guides</div></div>
        {[['UGC', 330, 1480], ['Etsy', 250, 1640], ['Rewards', 610, 1560], ['Patreon', 560, 1740]].map(([l, x, y]) => { const at = hi[l]; const on = f >= at - 3 ? Math.max(0, 1 - (f - at) / 40) : 0; if (f < at - 3 || on <= 0) return null;
          return <div key={l} style={{position: 'absolute', left: x, top: y, transform: `scale(${pop(f, at - 3, {w: 0.6, z: 0.5})}) rotate(-5deg)`, opacity: clamp01(on * 2)}}><Pill bg={K.lime} color={K.ui} size={34} style={{border: `4px solid ${K.ui}`}}>{l}</Pill></div>; })}
      </div>
    </div>
    {(() => { const p = pop(f, W(5, 'source') - 4); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1470, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * 300}px) scale(${p})`}}>
        <Pill bg={K.ui} color="#fff" size={44}><Icon name="cal" size={46} color={K.lime} />Every number: source + date</Pill></div>); })()}
    {f >= built - 14 && f < built + 8 && (() => { const p = expo(f - built + 14, 10); return <Cursor x={mix(900, 600, p)} y={mix(1400, 470, p)} s={f > built - 2 && f < built + 3 ? 0.85 : 1} />; })()}
  </>);
};

// ---------------------------------------------------------------- 6 + 7: AI Income Finder (dark cell): real capture + cursor scenarios, then the typed demo, then examples
const LINES = ['I post Reels, TikToks', 'and YouTube Shorts,', '600 followers.'];
const RES = [
  {name: 'Etsy templates', pay: 'Sell a file again and again', logo: 'etsy', key: 'etsy'},
  {name: 'UGC videos', pay: '$50–$400 a video', logo: 'ugc', key: 'ugc'},
  {name: 'YouTube Shopping', pay: 'Tag products in your videos', logo: 'youtube', key: 'youtube'},
];
// chip positions in the capture (1000 px wide): [x, y, width, label]
const SCEN = [
  {a: [536, 364, 96, 'Instagram'], b: [559, 443, 142, 'Filming products'], res: 'UGC videos', logo: 'ugc'},
  {a: [716, 364, 87, 'YouTube'], b: [727, 443, 178, 'Recommending things'], res: 'YouTube Shopping', logo: 'youtube'},
  {a: [628, 364, 72, 'TikTok'], b: [562, 487, 134, 'Making templates'], res: 'Etsy templates', logo: 'etsy'},
];
const BTN = [601, 556];
const S6 = ({f, W, B}) => {
  const head = pop(f, W(6, 'ai') - 6);
  const send = B(7); const sent = expo(f - send, 10);
  const typeAt = W(6, 'type');
  const typed = (() => { let left = typedCount(f, W(6, 'reels') - 2, LINES.join('').length, 3, 2.1); return LINES.map((l) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return s; }); })();
  const pick = W(7, 'picks') - 4; const ringOut = expoIn(f - pick + 6, 8);
  const ringIn = expo(f - send - 2, 12);
  const n = Math.min(16, Math.round(16 * clamp01((f - send - 6) / Math.max(8, pick - send - 10))));
  const cards = spring(f - pick, {w: 0.42, z: 0.66});
  const comp = {x: mix(90, 230, sent), y: mix(560, 300, sent), w: mix(900, 760, sent), h: mix(400, 230, sent)};
  const capOut = expoIn(f - typeAt + 4, 8);
  // cursor scenarios on the real capture
  const c0 = B(6) + 22, c1 = typeAt - 10; const SL = Math.max(54, (c1 - c0) / 3);
  // capture is zoomed on the controls (right column of the panel): image px -> cell px
  const ZX = 470, ZY = 100, ZS = 1.8, OX = 50, OY = 400 + 70; const sx = (x) => OX + (x - ZX) * ZS, sy = (y) => OY + (y - ZY) * ZS;
  const track = [[c0 - 14, 900, 1500]]; const clicks = [];
  SCEN.forEach((S, k) => { const t = c0 + k * SL; track.push([t + 0.2 * SL, sx(S.a[0]) - 8, sy(S.a[1]) - 6], [t + 0.4 * SL, sx(S.b[0]) - 8, sy(S.b[1]) - 6], [t + 0.58 * SL, sx(BTN[0]) - 8, sy(BTN[1]) - 6], [t + 0.9 * SL, sx(BTN[0]) + 60, sy(BTN[1]) + 80]); clicks.push(t + 0.2 * SL, t + 0.4 * SL, t + 0.58 * SL); });
  const sc = Math.max(0, Math.min(2, Math.floor((f - c0) / SL))); const lt = f - c0 - sc * SL; const SS = SCEN[sc];
  const chip = (c, on, key) => <div key={key} style={{position: 'absolute', left: (c[0] - ZX - c[2] / 2) * ZS, top: (c[1] - ZY - 20) * ZS, width: c[2] * ZS, height: 40 * ZS, borderRadius: 20 * ZS, background: on ? K.lime : '#222', border: on ? 'none' : '2px solid #444', color: on ? K.ui : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 15 * ZS, boxShadow: on ? '0 0 30px rgba(205,242,79,0.9)' : 'none'}}>{c[3]}</div>;
  const res = clamp01((lt - 0.64 * SL) / 10);
  return (<>
    {capOut < 1 && <div style={{position: 'absolute', left: OX, top: 400, width: 980, height: 960, borderRadius: 40, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 0 80px rgba(205,242,79,0.25)', background: '#222',
      transform: `translateY(${(1 - pop(f, B(6) + 4, {w: 0.34, z: 0.72})) * 1400 - capOut * 300}px) scale(${1 - capOut * 0.15}) rotate(${(1 - pop(f, B(6) + 4)) * 8}deg)`, opacity: 1 - capOut}}>
      <div style={{height: 70, background: '#EDEDE8', display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px'}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: i === 2 ? K.lime : '#C8C8C2'}} />)}
        <div style={{marginLeft: 16, flex: 1, height: 46, borderRadius: 23, background: '#fff', display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: K.ui}}><Lock size={22} color={K.mut} />subcreatorpaid.com</div></div>
      <div style={{position: 'relative', width: 980, height: 890, overflow: 'hidden'}}>
        <img src={staticFile('a_finder.png')} style={{position: 'absolute', left: -ZX * ZS, top: -ZY * ZS, width: 1000 * ZS}} />
        {f >= c0 && <>
          {chip(SCEN[0].a, false, 'd0')}{chip(SCEN[0].b, false, 'd1')}
          {lt >= 0.2 * SL && chip(SS.a, true, 'a')}{lt >= 0.4 * SL && chip(SS.b, true, 'b')}
          {lt >= 0.58 * SL && lt < 0.7 * SL && <div style={{position: 'absolute', left: (BTN[0] - ZX - 113) * ZS, top: (BTN[1] - ZY - 23) * ZS, width: 226 * ZS, height: 46 * ZS, borderRadius: 23 * ZS, boxShadow: '0 0 0 8px rgba(205,242,79,0.9), 0 0 40px rgba(205,242,79,0.9)'}} />}
        </>}
      </div>
    </div>}
    {capOut < 1 && res > 0 && lt < SL && (
      <div style={{position: 'absolute', left: 90, top: 1400, width: 900, height: 230, borderRadius: 44, background: K.lime, opacity: (1 - capOut) * res, transform: `translateY(${(1 - res) * 60}px) scale(${mix(0.94, 1, res)})`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', fontFamily: FONT, boxShadow: '0 0 90px rgba(205,242,79,0.7)'}}>
        <div style={{width: 150, height: 150, borderRadius: 40, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 30px rgba(0,0,0,0.25)'}}>{SS.logo === 'ugc' ? <StreamArt kind="ugc" size={130} p={{...ART, a: K.lime, rec: K.ui, recInk: K.lime}} /> : <BrandLogo name={SS.logo} size={96} />}</div>
        <div><div style={{fontWeight: 800, fontSize: 30, color: K.ui, letterSpacing: 3}}>BEST MATCH</div><div style={{fontWeight: 900, fontSize: 58, color: K.ui, marginTop: 6}}>{SS.res}</div></div>
      </div>)}
    {capOut < 1 && <div style={{opacity: 1 - capOut}}><Pointer f={f} track={track} clicks={clicks} /></div>}
    <div style={{position: 'absolute', left: 90, top: 250, display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${head})`, transformOrigin: 'left', opacity: 1 - sent}}>
      <div style={{width: 110, height: 110, borderRadius: 32, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(205,242,79,0.7)'}}><Icon name="spark" size={64} color={K.ui} /></div>
      <div><div style={{fontWeight: 900, fontSize: 64, color: '#fff'}}>AI Income Finder</div><div style={{marginTop: 4}}><Pill bg={K.lime} color={K.ui} size={30}>Free</Pill></div></div>
    </div>
    {/* composer -> sent bubble */}
    <div style={{position: 'absolute', left: comp.x, top: comp.y, width: comp.w, height: comp.h, transform: `scale(${pop(f, typeAt - 10, {w: 0.45, z: 0.7})})`}}>
      {sent < 0.6 && <div style={{opacity: 1 - sent * 1.6}}><Iridescent f={f} w={comp.w} h={comp.h} r={48} /></div>}
      <div style={{position: 'absolute', inset: 0, borderRadius: 48, background: sent > 0.5 ? K.lime : '#fff'}} />
      <div style={{position: 'absolute', left: mix(54, 40, sent), top: mix(54, 30, sent), fontFamily: FONT, fontWeight: 700, fontSize: mix(56, 46, sent), lineHeight: 1.3, color: K.ui}}>
        {typed.map((l, i) => <div key={i} style={{height: mix(73, 58, sent)}}>{l}</div>)}
      </div>
      {sent < 0.3 && <div style={{position: 'absolute', right: 34, bottom: 34, width: 100, height: 100, borderRadius: 50, background: K.ui, transform: `scale(${f >= send - 3 && f < send + 3 ? 0.85 : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontSize: 56, fontWeight: 900}}>↑</div>}
    </div>
    {sent < 1 && [[W(6, 'reels'), 90, 1010, -4, 'p'], [W(6, '600'), 480, 1190, 4, 'n']].map(([at, x, y, r, k], i) => { const p = pop(f, at - 2, {w: 0.5, z: 0.55}); const fly = expoIn(f - send + 2, 8);
      return <div key={k} style={{position: 'absolute', left: mix(x, 400, fly), top: mix(y + Math.sin(f / 9 + i) * 8, 400, fly), transform: `scale(${p * (1 - fly)}) rotate(${r}deg)`, boxShadow: '0 0 40px rgba(205,242,79,0.45)', borderRadius: 999}}>
        <Pill bg={k === 'n' ? K.lime : '#fff'} color={K.ui} size={44}>{k === 'p' ? <><Logo name="instagram" size={46} /><Logo name="tiktok" size={46} /><Logo name="youtube" size={46} />Reels · TikTok · YouTube</> : <>{count(f, at - 2, 600, 14)} followers</>}</Pill></div>; })}
    {/* thinking ring with the 16 streams */}
    {f >= send && f < pick + 12 && <>
      <div style={{position: 'absolute', left: 540 - 160, top: 1000 - 160, width: 320, height: 320, borderRadius: 160, background: '#1E1E21', border: `14px solid ${K.lime}`, transform: `scale(${ringIn * (1 - ringOut)})`, boxShadow: '0 0 90px rgba(205,242,79,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontWeight: 900, fontSize: 130}}>{n}</div>
      <svg width="520" height="520" style={{position: 'absolute', left: 280, top: 740, transform: `rotate(${f * 10}deg) scale(${ringIn * (1 - ringOut)})`}}>
        <circle cx="260" cy="260" r="240" stroke={K.lime} strokeWidth="12" fill="none" strokeDasharray="320 1200" strokeLinecap="round" /></svg>
      {ORBIT.map((t, i) => { const p = expo(f - send - 4 - i * 1.2, 12) * (1 - ringOut); const a = (i / 16) * Math.PI * 2 + (f - send) / 14; const R = 380;
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * R * p - 48, top: 1000 + Math.sin(a) * R * p - 48, transform: `scale(${p})`, opacity: i < n ? 1 : 0.4}}><Tile name={t} size={96} r={26} /></div>; })}
      <div style={{position: 'absolute', left: 190, right: 190, top: 1470, opacity: ringIn * (1 - ringOut)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 44, color: '#fff'}}><span>Checking streams</span><span style={{color: K.lime}}>{n}/16</span></div>
        <div style={{height: 22, borderRadius: 11, background: '#2A2A2D', marginTop: 18, overflow: 'hidden'}}><div style={{width: `${(n / 16) * 100}%`, height: '100%', background: K.lime}} /></div>
      </div>
    </>}
    {/* examples: the best match hops between three different streams */}
    {f >= pick && RES.map((c, i) => { const at = W(7, c.key) - 3; const nxt = RES[i + 1] ? W(7, RES[i + 1].key) - 3 : 1e9; const l = expo(f - at, 9) * (1 - expo(f - nxt, 9)); const x = 540 + (i - 1) * 330;
      return (
        <div key={c.name} style={{position: 'absolute', left: x - 150, top: 780 - l * 70 + Math.sin(f / 9 + i) * 8, width: 300, transform: `perspective(1200px) rotateY(${(i - 1) * -14 * (1 - l)}deg) scale(${cards * (1 + l * 0.2)})`, opacity: 0.55 + l * 0.45, zIndex: l > 0.5 ? 2 : 1}}>
          {l > 0.5 && <Pulse f={f} x={150} y={210} d={360} from={at} every={20} />}
          <div style={{borderRadius: 34, background: '#fff', overflow: 'hidden', fontFamily: FONT, boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 ${l * 70}px rgba(205,242,79,0.8)`}}>
            <div style={{height: 220, background: l > 0.5 ? K.lime : '#EDEDE8', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {c.logo === 'ugc' ? <StreamArt kind="ugc" size={200} p={{...ART, a: '#fff', rec: K.ui, recInk: K.lime}} /> : <BrandLogo name={c.logo} size={120} />}</div>
            <div style={{padding: '22px 24px'}}><div style={{fontWeight: 900, fontSize: 34, color: K.ui}}>{c.name}</div><div style={{fontWeight: 700, fontSize: 24, color: K.mut, marginTop: 8}}>{c.pay}</div></div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: -70, textAlign: 'center', opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}><Pill bg={K.ui} color={K.lime} size={30} style={{border: `3px solid ${K.lime}`}}>Best match</Pill></div>
        </div>
      ); })}
    <Burst f={f} at={W(7, 'ugc')} x={540} y={900} n={18} r={440} />
    {(() => { const p = pop(f, W(7, 'first') - 4, {w: 0.5, z: 0.55}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1340, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * 400}px) scale(${p})`}}>
        <Pill bg={K.lime} color={K.ui} size={48}><Check size={52} color={K.ui} p={expo(f - W(7, 'first'), 10)} />Plus your first step</Pill></div>); })()}
  </>);
};

// ---------------------------------------------------------------- 8: tools page (real capture + pointer)
const S8 = ({f, W, B}) => {
  const tl = pop(f, B(8) + 2, {w: 0.34, z: 0.72}); const fr = W(8, 'free'); const af = W(8, 'affiliate');
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(8) + 2} text="The tools page" size={84} weight={900} font={FONT} /></div>
    <Card style={{left: 90, top: 380, width: 900, height: 860, overflow: 'hidden', transform: `translateY(${(1 - tl) * 1300}px) rotate(${(1 - tl) * 8}deg)`}}>
      <CapBox name="tools" w={900} h={860} x={mix(0, 250, expo(f - fr + 30, 24))} y={mix(100, 175, expo(f - fr + 30, 24))} sc={mix(0.9, 1.15, expo(f - fr + 30, 24))} />
      <div style={{position: 'absolute', left: 26, bottom: 26}}><Pill bg={K.lime} color={K.ui} size={32}>Every tool we checked</Pill></div>
    </Card>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center', gap: 26}}>
      {['beehiiv', 'kit', 'elevenlabs', 'opusclip', 'skool'].map((n, i) => { const p = pop(f, W(8, 'tools') + 6 + i * 3, {w: 0.5, z: 0.55});
        return <div key={n} style={{transform: `scale(${p}) translateY(${Math.sin(f / 9 + i) * 6}px)`}}><Tile name={n} size={130} r={34} logo={0.62} /></div>; })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center', gap: 20}}>
      <span style={{display: 'inline-block', transform: `scale(${pop(f, fr - 2, {w: 0.6, z: 0.5})}) rotate(-3deg)`}}><Pill bg={K.lime} color={K.ui} size={40} style={{border: `4px solid ${K.ui}`}}>Free plans marked</Pill></span>
      <span style={{display: 'inline-block', transform: `scale(${pop(f, af - 2, {w: 0.6, z: 0.5})}) rotate(3deg)`}}><Pill bg={K.ui} color="#fff" size={40}>Affiliate links labelled</Pill></span>
    </div>
    <Pointer f={f} track={[[fr - 34, 960, 1500], [fr - 12, 800, 760], [fr + 2, 770, 640], [fr + 60, 770, 640]]} clicks={[fr + 2]} label="Free plan" labelAt={fr} />
    <Burst f={f} at={fr} x={540} y={1400} n={14} r={360} />
  </>);
};

// ---------------------------------------------------------------- 9: the free guide (PDF book)
const S9 = ({f, W, B}) => {
  const b = pop(f, W(9, 'covers') - 2, {w: 0.32, z: 0.7}); const fan = expo(f - W(9, 'first') + 14, 16);
  const pages = ['ugc', 'etsy', 'patreon', 'tiktok', 'amazon'];
  const gOut = expoIn(f - W(9, 'covers') + 8, 10);
  return (<>
    {gOut < 1 && <div style={{position: 'absolute', left: 50, top: 400, width: 980, height: 760, borderRadius: 40, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.25)', background: '#fff',
      transform: `translateY(${(1 - pop(f, B(9) + 2, {w: 0.34, z: 0.72})) * 1300 - gOut * 400}px) scale(${1 - gOut * 0.2})`, opacity: 1 - gOut}}>
      <CapBox name="guide" w={980} h={760} x={0} y={60} sc={1.3} />
    </div>}
    <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(9) + 2} text="Free guides" size={84} weight={900} font={FONT} /></div>
    <div style={{position: 'absolute', left: 290, top: 470, width: 500, height: 680, transform: `translateY(${(1 - b) * 1200}px) translateY(${Math.sin(f / 14) * 12}px)`}}>
      {pages.map((n, i) => { const a = (i - 2) * 16 * fan; return (
        <div key={i} style={{position: 'absolute', inset: 0, borderRadius: 24, background: '#fff', border: `3px solid ${K.line}`, transform: `rotate(${a}deg) translateX(${(i - 2) * 60 * fan}px)`, transformOrigin: '50% 120%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: 40}}>
          <Tile name={n} size={110} r={28} /><div style={{marginTop: 30, height: 18, width: '80%', borderRadius: 9, background: K.ui}} />
          {[0, 1, 2, 3].map((j) => <div key={j} style={{marginTop: 20, height: 14, width: `${60 + hash(i * 4 + j) * 35}%`, borderRadius: 7, background: K.line}} />)}
          <div style={{marginTop: 30, height: 44, width: '55%', borderRadius: 12, background: K.lime}} />
        </div>); })}
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: K.ui, overflow: 'hidden', padding: 50, fontFamily: FONT, transform: `perspective(1600px) rotateY(${mix(-70, -10, b) + Math.sin(f / 18) * 5}deg)`, transformOrigin: 'left', boxShadow: '30px 40px 80px rgba(0,0,0,0.35)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 26, background: K.lime}} />
        <div style={{position: 'absolute', left: ((f * 30) % 1400) - 300, top: -200, width: 100, height: 1200, background: 'rgba(255,255,255,0.12)', transform: 'rotate(20deg)'}} />
        <div style={{width: 110, height: 110, borderRadius: 30, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 74, color: K.ui, marginTop: 30}}>S</div>
        <div style={{fontWeight: 900, fontSize: 68, color: '#fff', lineHeight: 1.08, marginTop: 50}}>The Small Creator <span style={{color: K.lime}}>Income Guide</span></div>
        <div style={{position: 'absolute', left: 50, bottom: 50}}><Pill bg={K.lime} color={K.ui} size={32}>Free PDF</Pill></div>
      </div>
    </div>
    {(() => { const p = pop(f, W(9, 'first') - 3, {w: 0.55, z: 0.5}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', transform: `scale(${mix(2, 1, p)}) rotate(${-4 + (1 - p) * 10}deg)`, opacity: clamp01(p * 2)}}>
        <Pill bg={K.lime} color={K.ui} size={64} style={{border: `6px solid ${K.ui}`}}>Step by step</Pill></div>); })()}
    <Burst f={f} at={W(9, 'first')} x={540} y={1300} n={18} r={440} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', justifyContent: 'center', opacity: expo(f - W(9, 'guide') + 2, 8)}}>
      <div style={{transform: `translateY(${Math.abs(Math.sin(f / 7)) * -16}px)`}}><Pill bg={K.ui} size={38}><span style={{color: K.lime, fontSize: 44}}>↓</span>Download free</Pill></div></div>
  </>);
};

// ---------------------------------------------------------------- 10: the newsletter
const S10 = ({f, W, B}) => {
  const card = pop(f, B(10)); const EM = 'you@email.com'; const typed = typedCount(f, W(10, 'join') - 2, EM.length, 11, 2.4);
  const joined = f >= W(10, 'get') - 2; const press = f >= W(10, 'get') - 6 && f < W(10, 'get') - 2;
  const env = pop(f, W(10, 'one') - 6, {w: 0.4, z: 0.62}); const letter = expo(f - W(10, 'verified') + 2, 12);
  const logos = ['etsy', 'patreon', 'fiverr', 'substack']; const li = Math.max(0, Math.floor((f - W(10, 'verified')) / 8)) % 4;
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(10) + 2} text="The free list" size={84} weight={900} font={FONT} /></div>
    <Card style={{left: 90, top: 380, width: 900, height: 250, transform: `scale(${card})`}}>
      <div style={{position: 'absolute', left: 40, top: 40, right: 40, height: 80, borderRadius: 40, background: '#F5F5F2', display: 'flex', alignItems: 'center', padding: '0 34px', fontWeight: 700, fontSize: 40, color: K.ui}}>
        {EM.slice(0, typed)}{typed < EM.length && f % 14 < 7 ? '|' : ''}</div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 140, height: 80, borderRadius: 40, background: joined ? K.lime : K.ui, color: joined ? K.ui : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontWeight: 900, fontSize: 40, transform: `scale(${press ? 0.95 : 1})`}}>
        {joined ? <><Check size={44} color={K.ui} p={expo(f - W(10, 'get') + 2, 8)} />You're in</> : 'Join free'}</div>
    </Card>
    {/* envelope -> letter */}
    <div style={{position: 'absolute', left: 190, top: 820, width: 700, height: 470, transform: `translateX(${(1 - env) * 1200}px) rotate(${(1 - env) * 20 + Math.sin(f / 15) * 2}deg)`}}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 40 - letter * 150, height: 400, borderRadius: 26, background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', padding: 36, fontFamily: FONT}}>
        <div style={{fontWeight: 800, fontSize: 30, color: K.mut}}>THIS WEEK'S STREAM</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 20}}><Tile key={li} name={logos[li]} size={100} r={26} style={{transform: `scale(${pop(f, W(10, 'verified') + li * 8, {w: 0.6, z: 0.5})})`}} />
          <Pill bg={K.ui} color={K.lime} size={30}><Check size={32} color={K.lime} />Verified</Pill></div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, borderRadius: 34, background: K.ui, overflow: 'hidden'}}>
        <svg width="700" height="300" style={{position: 'absolute', left: 0, top: 0}}><path d="M0 0 L350 170 L700 0" stroke="#2E2E33" strokeWidth="10" fill="none" /></svg>
        <div style={{position: 'absolute', left: 40, bottom: 34, fontWeight: 900, fontSize: 44, color: '#fff'}}>Every <span style={{color: K.lime}}>week</span></div>
      </div>
    </div>
    {/* weeks */}
    <div style={{position: 'absolute', left: 90, top: 1340, display: 'flex', gap: 24}}>
      {[1, 2, 3, 4].map((w, i) => { const on = f >= W(10, 'week') + i * 5; const p = pop(f, W(10, 'every') - 6 + i * 3);
        return <div key={w} style={{width: 207, height: 120, borderRadius: 30, background: on ? K.lime : '#fff', border: `3px solid ${on ? K.ui : K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: K.ui, transform: `scale(${p * (on && f < W(10, 'week') + i * 5 + 6 ? 1.08 : 1)})`}}>
          <Icon name="cal" size={40} color={K.ui} />Wk {w}</div>; })}
    </div>
    <div style={{position: 'absolute', left: 90, top: 1500, display: 'flex', gap: 20}}>
      {['No spam', 'Unsubscribe anytime'].map((t, i) => <span key={t} style={{transform: `scale(${pop(f, (i ? W(10, 'unsubscribe') : W(10, 'spam')) - 4)})`, display: 'inline-block'}}><Pill bg={K.ui} color="#fff" size={38}>{t}</Pill></span>)}
    </div>
  </>);
};

// ---------------------------------------------------------------- 11: everything you get (real captures as thumbnails)
const SERVICES = [
  ['Stream guides', '16 verified, with sources', 'streams', 'stream'], ['AI Income Finder', 'Your best match in seconds', 'finder', 'finder'], ['Income tracker', 'Saved on your device', 'tracker', 'tracker'],
  ['Tools page', 'Free plans marked', 'tools', 'tools'], ['Free PDF guide', 'Every stream, step by step', 'guide', 'pdf'], ['Weekly email', 'One verified stream a week', null, 'weekly']];
const S11a = ({f, W, B}) => (<>
  <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(11) + 2} text="What you get" size={84} weight={900} font={FONT} /></div>
  <div style={{position: 'absolute', left: 90, top: 360 + 0}}><Pill bg={K.lime} color={K.ui} size={40}>All free</Pill></div>
  {SERVICES.map(([t, sub, img, key], i) => { const at = W(11, key) - 4; const p = pop(f, at, {w: 0.5, z: 0.58}); if (p <= 0) return null;
    return (
      <Card key={t} style={{left: 90, top: 470 + i * 215, width: 900, height: 190, transform: `translateX(${(1 - p) * 1000}px) rotate(${(1 - p) * 6}deg)`, borderRadius: 40, overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
        <div style={{width: 190, height: 190, flexShrink: 0, background: img ? '#EDEDE8' : K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {img ? <Cap name={img} w={380} h={190} /> : <Icon name="cal" size={90} color={K.lime} />}</div>
        <div style={{padding: '0 36px', flex: 1}}><div style={{fontWeight: 900, fontSize: 52, color: K.ui}}>{t}</div><div style={{fontWeight: 700, fontSize: 30, color: K.mut, marginTop: 6}}>{sub}</div></div>
        <div style={{marginRight: 30, transform: `scale(${pop(f, at + 6, {w: 0.6, z: 0.5})})`}}><Pill bg={K.lime} color={K.ui} size={30}>Free</Pill></div>
      </Card>); })}
  <Burst f={f} at={W(11, 'weekly')} x={540} y={1500} n={16} r={420} />
</>);

// ---------------------------------------------------------------- 11: our promise (dark kinetic type)
const S11 = ({f, W, B}) => {
  const L = [
    {at: W(12, 'hype'), t: 'No hype.', c: '#fff'},
    {at: W(12, 'promises'), t: 'No promises.', c: '#fff'},
    {at: W(12, 'real'), t: 'Real numbers.', money: true},
    {at: W(12, 'catch') - 6, t: '+ the catch.', c: K.red},
  ];
  return (<>
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
      {[0, 1, 2].map((i) => <circle key={i} cx="540" cy="900" r={300 + i * 180 + ((f - B(12)) * 3) % 180} stroke="#2A2A2D" strokeWidth="4" fill="none" />)}
    </svg>
    <div style={{position: 'absolute', left: 90, top: 300}}><Rise f={f} at={B(12)} text="Our promise" size={56} weight={800} font={FONT} color="#8B8B86" /></div>
    {L.map((l, i) => { const p = pop(f, l.at - 3, {w: 0.55, z: 0.55}); if (p <= 0) return null; const shake = f - l.at < 8 ? Math.sin((f - l.at) * 2.6) * 10 * (1 - (f - l.at) / 8) : 0;
      return <div key={i} style={{position: 'absolute', left: 90, top: 470 + i * 230, transform: `translateX(${shake}px) scale(${mix(1.8, 1, p)})`, transformOrigin: 'left center', opacity: clamp01(p * 2), fontFamily: FONT, fontWeight: 900, fontSize: 118, letterSpacing: -4, color: l.c}}>
        {l.money ? <Money size={118}>{l.t}</Money> : l.t}</div>; })}
    <Burst f={f} at={W(12, 'real')} x={480} y={1060} n={20} r={480} />
  </>);
};

// ---------------------------------------------------------------- 12: outro (dark)
const S12 = ({f, W, B}) => {
  const outro = B(13); const o = expo(f - outro, 12); const p = expo(f - outro - 1, 16);
  const x = mix(mix(140, 440, p), mix(440, 540, p), p), y = mix(mix(1500, 1050, p), mix(1050, 620, p), p);
  const mark = expo(f - outro - 14, 10);
  return (<>
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
      <path d="M140 1500 C 300 1300, 220 1100, 440 1050 S 700 800, 540 620" stroke="#2A2A2D" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 * (1 - o)} />
    </svg>
    {mark < 1 && <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: K.lime, opacity: 1 - mark}} />}
    <div style={{position: 'absolute', left: 540 - 110, top: 620 - 110 - mark * 120, width: 220, height: 220, borderRadius: mix(110, 56, mark), background: K.lime, transform: `scale(${mix(0.2, 1, mark)})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.ui, fontWeight: 900, fontSize: 130 * mark, fontFamily: FONT}}>S</div>
    {mark > 0.9 && <Pulse f={f} x={540} y={500} d={240} from={outro + 24} every={22} />}
    <Burst f={f} at={outro + 20} x={540} y={500} n={18} r={380} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontWeight: 900, fontSize: 84, color: '#fff', clipPath: `inset(0 ${(1 - expo(f - W(13, 'subcreatorpaid.com') + 6, 10)) * 50}% 0 ${(1 - expo(f - W(13, 'subcreatorpaid.com') + 6, 10)) * 50}%)`}}>subcreatorpaid.com</div>
      <div style={{fontWeight: 700, fontSize: 40, color: '#9A9A94', marginTop: 16, opacity: expo(f - W(13, 'subcreatorpaid.com'), 8)}}>Free AI Income Finder · 16 guides · free guide</div>
    </div>
    {(() => { const q = pop(f, W(13, 'comment') - 3, {w: 0.5, z: 0.55}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', transform: `scale(${q})`}}>
        <Pill bg={K.lime} color={K.ui} size={54}>Comment GUIDE for the free guide</Pill></div>); })()}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center', opacity: expo(f - W(13, 'tools') + 4, 10), fontFamily: FONT}}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#1E1E21', color: '#CFCFCA', borderRadius: 40, padding: '12px 26px', fontWeight: 700, fontSize: 30}}>Tools I use:
        {['beehiiv', 'elevenlabs', 'opusclip', 'skool'].map((n, i) => <span key={n} style={{display: 'inline-flex', width: 56, height: 56, borderRadius: 14, background: '#fff', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(f - W(13, 'tools') - i * 3, {w: 0.5, z: 0.6})})`}}><BrandLogo name={n} size={42} /></span>)} · Affiliate links</span>
    </div>
    <div style={{position: 'absolute', left: 300, top: 1290, width: 480, height: 110, borderRadius: 55, background: f > W(13, 'follow') + 4 ? '#2A2A2D' : '#fff', color: f > W(13, 'follow') + 4 ? '#fff' : K.ui, fontFamily: FONT,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44, opacity: expo(f - W(13, 'follow') + 10, 8), transform: `scale(${f > W(13, 'follow') && f < W(13, 'follow') + 5 ? 0.92 : 1})`}}>{f > W(13, 'follow') + 4 ? 'Following' : 'Follow'}</div>
  </>);
};

const SCENES = {0: S0, 1: S1, 2: S2, 3: S3, 4: S4, 5: S6, 6: S8, 7: S9, 8: S10, 9: S11a, 10: S11, 11: S12};

export const Overview = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W, E} = useTimes(beats);
  const nb = beats.length;
  // camera: hold on each cell; every move to the next cell uses its own transition (owner: "don't use the same transition")
  const centre = (c) => { const p = cellPos(c); return [p.x + 540, p.y + 960]; };
  const TR = {1: 'whip', 2: 'drop', 3: 'roll', 4: 'pullback', 6: 'iris', 8: 'spin', 9: 'drop', 10: 'pullback', 11: 'whip', 12: 'roll', 13: 'iris'};
  const TLEN = 22;
  const back = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  const pose = (ff) => {
    let last = null;
    for (let i = 1; i < nb; i++) { if (CELL[i] !== CELL[i - 1] && ff >= B(i) - 9) last = i; }
    if (last === null) { const [x, y] = centre(CELL[0]); return {x, y, z: 1, rot: 0, p: -1, type: 'none'}; }
    const a = centre(CELL[last - 1]), b = centre(CELL[last]); const p = clamp01((ff - (B(last) - 9)) / TLEN); const type = TR[last] || 'whip'; const e = inOut(p * TLEN, TLEN); const sn = Math.sin(Math.PI * e);
    const pos = (t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
    let x, y, z = 1, rot = 0;
    if (type === 'iris') { [x, y] = p < 0.5 ? a : b; }
    else if (type === 'drop') { [x, y] = pos(back(p)); z = 1 - 0.12 * sn; }
    else { [x, y] = pos(e); }
    if (type === 'whip') z = 1 - 0.38 * sn;
    if (type === 'pullback') z = 1 - 0.7 * Math.pow(sn, 0.8);
    if (type === 'roll') { z = 1 - 0.3 * sn; rot = (last % 2 ? 1 : -1) * 24 * sn; }
    if (type === 'spin') { z = 1 - 0.5 * sn; rot = 360 * e; }
    return {x, y, z, rot, p, type};
  };
  const cam = pose(f); const prev = pose(f - 1);
  const vy = cam.y - prev.y, vx = cam.x - prev.x;
  const keys = [W(0, '10000'), W(0, 'paid'), W(2, 'exactly'), W(3, 'dollars'), W(5, '16'), W(7, 'best'), W(9, 'first'), W(12, 'real')];
  const punch = keys.reduce((s, w) => s + 0.035 * Math.max(0, 1 - Math.abs(f - w - 2) / 7), 0);
  const z = cam.z * (1 + punch); const cx = cam.x + Math.sin(f / 37) * 6, cy = cam.y + Math.cos(f / 43) * 8;
  const skew = cam.type === 'whip' || cam.type === 'drop' ? Math.max(-14, Math.min(14, vy * 0.03)) : 0; const rot = cam.rot + (cam.type === 'whip' || cam.type === 'drop' ? Math.max(-4, Math.min(4, vx * 0.012)) : 0);
  const css = `translate(540px, 960px) rotate(${rot}deg) skewY(${skew}deg) scale(${z}) translate(${-cx}px, ${-cy}px)`;
  const irisR = cam.type === 'iris' && cam.p >= 0 && cam.p < 1 ? 1100 * Math.sin(Math.PI * cam.p) : 0;

  const SAFE = {s: 0.7, x: 162, y: 262};
  const beat = Math.max(0, beats.findIndex((b, i) => f < E(i)) === -1 ? nb - 1 : beats.findIndex((b, i) => f < E(i)));
  const chapter = CHAPTERS.reduce((a, c, i) => (beat >= c[0] ? i : a), 0);
  const dark = DARK[CELL[beat]] && f > B(beat) + 1;
  const showCell = (c) => { const idx = CELL.map((x, i) => (x === c ? i : -1)).filter((i) => i >= 0); return f >= B(idx[0]) - 14 && f < E(idx[idx.length - 1]) + 14; };
  const cells = [...new Set(CELL)];
  const chAt = B(CHAPTERS[chapter][0]);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden', fontFamily: FONT}}>
      <Dust f={f} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <div style={{width: 66, height: 66, borderRadius: 18, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44}}>S</div>
        <div style={{fontWeight: 800, fontSize: 46, color: K.ui, letterSpacing: -1}}>@subcreatorpaid</div>
      </div>
      <div style={{position: 'absolute', left: SAFE.x, top: SAFE.y, width: 1080, height: 1920, transform: `scale(${SAFE.s})`, transformOrigin: '0 0', overflow: 'hidden', borderRadius: 60, background: K.bg}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: css}}>
          {/* lime track joining the cells, so each whip follows a line */}
          <svg width="2600" height={cells.length * 2100} style={{position: 'absolute', left: 0, top: 0}}>
            <path d={cells.map((c, i) => { const [x, y] = centre(c); return `${i ? 'L' : 'M'}${x} ${y}`; }).join(' ')} stroke={K.lime} strokeWidth="40" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60 50" strokeDashoffset={-f * 6} />
          </svg>
          {cells.map((c) => { if (!showCell(c)) return null; const S = SCENES[c]; const p = cellPos(c);
            return (
              <div key={c} style={{position: 'absolute', left: p.x, top: p.y, width: 1080, height: 1920, borderRadius: 80, overflow: 'hidden', background: DARK[c] ? K.ui : K.bg, boxShadow: '0 0 0 6px rgba(14,14,16,0.06)'}}>
                {DARK[c] && <Dust f={f} dark />}
                <S f={f} W={W} B={B} E={E} />
              </div>
            ); })}
        </div>
        {irisR > 8 && <div style={{position: 'absolute', left: 540 - irisR, top: 960 - irisR, width: irisR * 2, height: irisR * 2, borderRadius: '50%', background: K.lime, zIndex: 5}} />}
        {/* chapter pill + progress */}
        {beat < nb - 1 && (
          <div style={{position: 'absolute', left: 60, top: 60, right: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div key={chapter} style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: dark ? K.lime : K.ui, color: dark ? K.ui : '#fff', borderRadius: 999, padding: '14px 30px', fontWeight: 800, fontSize: 36,
              transform: `translateY(${(1 - expo(f - chAt - 4, 10)) * -120}px)`}}>
              <span style={{opacity: 0.6}}>{String(chapter + 1).padStart(2, '0')}</span>{CHAPTERS[chapter][1]}</div>
            <div style={{display: 'flex', gap: 10}}>{CHAPTERS.map((c, i) => <div key={i} style={{width: i === chapter ? 54 : 18, height: 18, borderRadius: 9, background: i <= chapter ? K.lime : dark ? '#3A3A3E' : K.line, border: i <= chapter ? `3px solid ${dark ? K.lime : K.ui}` : 'none'}} />)}</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
