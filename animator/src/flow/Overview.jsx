// Film 4, "Overview" (owner, 29 Oct 2026: "one detailed video ... as a company overview, max animations and dynamic
// graphics"). Same launch-film look (rules F): one palette (white #F5F5F2 / ink #0E0E10 / lime #CDF24F, red only on
// "the catch"), real logos, Instagram safe box with @subcreatorpaid on top. One continuous take: every chapter is a cell
// on one big canvas and the camera whips from cell to cell (dip zoom + skew), so there are no cuts or fades.
// Chapters: who we are -> the channel -> the website + 16 guides -> AI Income Finder -> tracker + tools -> free guide ->
// newsletter -> our promise -> outro.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {Logo} from '../graphics';
import {expo, expoIn, spring, kf, mix, clamp01, camera, Rise, typedCount, Cursor, useTimes, hash} from './kit';
import {StreamArt, Avatar, Icon, Check, BrandLogo} from './art';
import {Burst, Pulse, Dust, Iridescent} from './Launch';

const K = {bg: '#F5F5F2', ui: '#0E0E10', lime: '#CDF24F', soft: '#F1FBD0', mut: '#5F5E58', line: '#E2DFD7', red: '#D93A3A', card: '#1C1C1F'};
const ART = {ink: '#0E0E10', a: '#CDF24F', b: '#FFFFFF', c: '#2E2E33', box: '#FFFFFF', rec: '#CDF24F', recInk: '#0E0E10'};
const ORBIT = ['instagram', 'tiktok', 'youtube', 'spotify', 'etsy', 'amazon', 'fiverr', 'elevenlabs', 'kit', 'patreon', 'substack', 'gumroad', 'twitch', 'beehiiv', 'billo', 'kofi'];
// the 16 stream guides on the site (site/data/streams), shown by the platform's own mark
const STREAMS = [['ugc', 'UGC'], ['etsy', 'Etsy'], ['amazon', 'Amazon'], ['fiverr', 'Fiverr'], ['elevenlabs', 'Voice'], ['beehiiv', 'Newsletter'], ['gumroad', 'Gumroad'], ['kofi', 'Ko-fi'],
  ['patreon', 'Patreon'], ['spotify', 'Spotify'], ['substack', 'Substack'], ['tiktok', 'Rewards'], ['tiktok', 'TikTok Shop'], ['twitch', 'Twitch'], ['youtube', 'Shopping'], ['youtube', 'Fan funding']];
// beat -> canvas cell; cells sit on a zigzag so each move is a diagonal whip
const CELL = [0, 1, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10];
const DARK = {5: true, 9: true, 10: true};
const cellPos = (c) => ({x: (c % 2) * 1300, y: c * 2100});
const CHAPTERS = [[0, 'Who we are'], [2, 'The channel'], [4, 'The website'], [6, 'AI Income Finder'], [8, 'Free tools'], [9, 'Free guides'], [10, 'The free list'], [11, 'Our promise']];

const pop = (f, at, o = {w: 0.42, z: 0.6}) => spring(f - at, o);
const Card = ({children, style = {}, dark}) => (
  <div style={{position: 'absolute', background: dark ? K.card : '#fff', borderRadius: 44, boxShadow: '0 30px 70px rgba(0,0,0,0.12)', fontFamily: FONT, ...style}}>{children}</div>
);
const Tile = ({name, size = 120, r = 30, logo = 0.62, bg = '#fff', style = {}}) => (
  <div style={{width: size, height: size, borderRadius: r, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 28px rgba(0,0,0,0.13)', ...style}}>
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
      <svg width="900" height="900" style={{position: 'absolute', left: 90, top: 410, transform: `rotate(${f * 4}deg)`, opacity: mark}}>
        <circle cx="450" cy="450" r="420" stroke={K.lime} strokeWidth="12" fill="none" strokeDasharray="400 900" strokeLinecap="round" />
        <circle cx="450" cy="450" r="420" stroke={K.ui} strokeWidth="5" fill="none" strokeDasharray="80 1300" strokeDashoffset="-700" strokeLinecap="round" />
      </svg>
      {ORBIT.map((n, i) => { const p = expo(f - W(0, 'this') - i * 0.8, 14); const a = (i / 16) * Math.PI * 2 + f / 40; const R = 360 * p;
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * R - 50, top: 860 + Math.sin(a) * R - 50, transform: `scale(${p}) rotate(${(1 - p) * 180}deg)`}}><Tile name={n} size={100} r={28} /></div>; })}
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
          {i === 0 && <div style={{position: 'absolute', left: 44, top: 260, display: 'flex', gap: 16, transform: `translateX(${-((f * 4) % 680)}px)`}}>
            {[...ORBIT, ...ORBIT].map((n, j) => <Tile key={j} name={n} size={74} r={20} />)}</div>}
          {i === 1 && <div style={{position: 'absolute', left: 262, top: 262, transform: `scale(${pop(f, W(1, 'official'), {w: 0.6, z: 0.5})}) rotate(-6deg)`}}>
            <Pill bg={K.lime} color={K.ui} size={38}><Check size={40} color={K.ui} />Source checked</Pill></div>}
          {i === 2 && <div style={{position: 'absolute', left: 262, top: 262}}><Pill bg="#FBE3E3" color={K.red} size={38}>Shown in every video</Pill></div>}
        </Card>
      ); })}
    <Burst f={f} at={W(1, 'official')} x={500} y={1160} n={14} r={300} />
  </>);
};

// ---------------------------------------------------------------- 2: who it's for
const S2 = ({f, W, B}) => {
  const z = W(2, 'zero'), top = W(2, '10000');
  const v = kf(f, [[z - 2, 0], [top + 6, 1]]);
  return (<>
    <div style={{position: 'absolute', left: 90, top: 250}}><Rise f={f} at={B(2) + 2} text="Made for" size={64} weight={800} font={FONT} color={K.mut} /></div>
    <div style={{position: 'absolute', left: 90, top: 330, transform: `scale(${1 + 0.05 * Math.max(0, 1 - Math.abs(f - top - 2) / 7)})`, transformOrigin: 'left'}}>
      <Rise f={f} at={z - 4} text={`0 – ${v >= 1 ? '10k' : fmt(Math.round(v * 10000))} followers`} size={100} weight={900} font={FONT} />
    </div>
    {/* slider */}
    <div style={{position: 'absolute', left: 120, top: 760, width: 840, height: 24, borderRadius: 12, background: K.line}}>
      <div style={{width: `${v * 100}%`, height: '100%', borderRadius: 12, background: K.lime}} />
      <div style={{position: 'absolute', left: v * 840 - 44, top: -32, width: 88, height: 88, borderRadius: 44, background: K.ui, border: `8px solid ${K.lime}`}} />
      {['0', '1k', '5k', '10k'].map((l, i) => <div key={l} style={{position: 'absolute', left: [0, 84, 420, 840][i] - 40, width: 80, textAlign: 'center', top: 70, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: K.mut}}>{l}</div>)}
      {[0.08, 0.3, 0.52, 0.74, 0.95].map((x, i) => { const p = v >= x ? pop(f, z + x * (top - z + 6)) : 0;
        return <div key={i} style={{position: 'absolute', left: x * 840 - 55, top: -170 + Math.sin(f / 9 + i) * 8, transform: `scale(${p})`}}><Avatar size={110} hat={false} bg={i % 2 ? K.lime : '#fff'} /></div>; })}
    </div>
    {/* platforms */}
    {['instagram', 'tiktok', 'youtube'].map((n, i) => { const at = W(2, n); const p = pop(f, at - 4, {w: 0.5, z: 0.5});
      return <div key={n} style={{position: 'absolute', left: 120 + i * 300, top: 980 + Math.sin(f / 10 + i * 2) * 10, transform: `scale(${p}) rotate(${(1 - p) * 40}deg)`}}>
        <Tile name={n} size={240} r={64} logo={0.55} />
        {p > 0.9 && f < at + 30 && <Pulse f={f} x={120} y={120} d={250} from={at} every={30} />}
      </div>; })}
    {/* learning alongside you */}
    {(() => { const p = pop(f, W(2, 'learning') - 4); return (
      <div style={{position: 'absolute', left: 90, top: 1330, display: 'flex', alignItems: 'center', gap: 24, transform: `scale(${p})`, transformOrigin: 'left center'}}>
        <div style={{transform: `rotate(${Math.sin(f / 6) * 6}deg)`}}><Avatar size={150} hat={false} /></div>
        <div style={{background: K.ui, color: '#fff', borderRadius: '44px 44px 44px 8px', padding: '30px 40px', fontFamily: FONT, fontWeight: 800, fontSize: 50}}>
          I'm learning <span style={{color: K.lime}}>alongside you.</span></div>
      </div>); })()}
  </>);
};

// ---------------------------------------------------------------- 3: the channel (a reel inside a phone)
const S3 = ({f, W, B, E}) => {
  const ph = pop(f, B(3) + 2, {w: 0.36, z: 0.7});
  const prog = clamp01((f - B(3)) / (E(3) - B(3)));
  const SERIES = [['Stream of the Week', 40, 360, -5], ['Tools That Pay', 640, 520, 4], ['Myths + how-tos', 20, 1160, 3], ['Small Account Wins', 590, 1330, -4]];
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230, display: 'flex', alignItems: 'center', gap: 16}}>
      <Rise f={f} at={B(3) + 2} text="The channel" size={84} weight={900} font={FONT} />
      {['instagram', 'tiktok', 'youtube'].map((n, i) => <span key={n} style={{transform: `scale(${pop(f, W(3, 'channel') + i * 3)})`, marginTop: -10}}><Logo name={n} size={60} /></span>)}
    </div>
    <div style={{position: 'absolute', left: 280, top: 400, width: 520, height: 1060, borderRadius: 80, background: K.ui, padding: 18, transform: `translateY(${(1 - ph) * 1200}px) rotate(${(1 - ph) * 14 + Math.sin(f / 20) * 1.5}deg)`, boxShadow: '0 50px 100px rgba(0,0,0,0.25)'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 64, background: K.card, overflow: 'hidden', fontFamily: FONT}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 34, height: 8, borderRadius: 4, background: '#3A3A3E'}}><div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 4, background: '#fff'}} /></div>
        <div style={{position: 'absolute', left: 36, top: 80, transform: `scale(${pop(f, W(3, 'one') - 4)})`, transformOrigin: 'left'}}><Pill bg={K.lime} color={K.ui} size={26}>Income stream</Pill></div>
        <div style={{position: 'absolute', left: 36, top: 150}}><Rise f={f} at={W(3, 'one')} text="UGC videos" size={66} weight={900} font={FONT} color="#fff" /></div>
        <div style={{position: 'absolute', left: 90, top: 250, transform: `scale(${pop(f, W(3, 'verified') - 4)}) rotate(${Math.sin(f / 9) * 4}deg)`}}><StreamArt kind="ugc" size={300} p={ART} /></div>
        <div style={{position: 'absolute', left: 36, top: 580}}>
          <div style={{fontWeight: 700, fontSize: 28, color: '#A5A5A0', opacity: expo(f - W(3, 'pay') + 4, 8)}}>Pay</div>
          <Money size={54} p={expo(f - W(3, 'pay') + 2, 10)}>$50–$400</Money>
        </div>
        <div style={{position: 'absolute', left: 36, top: 720, transform: `translateX(${(1 - expo(f - W(3, 'need') + 3, 10)) * -500}px)`}}><Pill bg="#2E2E33" size={30}><Check size={32} color={K.lime} />You need: 3 samples</Pill></div>
        <div style={{position: 'absolute', left: 36, top: 820, transform: `translateX(${(1 - expo(f - W(3, 'catch') + 3, 10)) * -500}px) rotate(${f >= W(3, 'catch') ? Math.sin((f - W(3, 'catch')) / 3) * 4 * Math.exp(-(f - W(3, 'catch')) / 14) : 0}deg)`}}>
          <Pill bg={K.red} size={30}>The catch: samples first</Pill></div>
        {/* reel side buttons + rising hearts */}
        <div style={{position: 'absolute', right: 22, top: 540, display: 'flex', flexDirection: 'column', gap: 30}}>{['star', 'play', 'link'].map((n) => <Icon key={n} name={n} size={46} color="#fff" />)}</div>
        {Array.from({length: 6}, (_, i) => { const t = ((f - B(3) + i * 17) % 60) / 60; return <div key={i} style={{position: 'absolute', right: 30 + Math.sin(t * 6 + i) * 16, top: 520 - t * 360, opacity: (1 - t) * 0.9, transform: `scale(${0.6 + t * 0.6})`}}><Icon name="star" size={36} color={K.lime} /></div>; })}
      </div>
    </div>
    {SERIES.map(([t, x, y, r], i) => { const p = pop(f, W(3, 'short') + i * 4, {w: 0.5, z: 0.55});
      return <div key={t} style={{position: 'absolute', left: x, top: y + Math.sin(f / 11 + i) * 10, transform: `scale(${p}) rotate(${r}deg)`, boxShadow: '0 16px 40px rgba(0,0,0,0.14)', borderRadius: 999}}>
        <Pill bg={i % 2 ? '#fff' : K.lime} color={K.ui} size={36}>{t}</Pill></div>; })}
    <Burst f={f} at={W(3, 'pay')} x={420} y={1010} n={14} r={280} />
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
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, transform: `translateY(${-scroll * 1060}px)`}}>
        {/* home hero (matches the live Lime Glass site) */}
        <div style={{padding: '50px 60px', background: `radial-gradient(circle at 10% 20%, ${K.soft}, transparent 60%)`}}>
          <div style={{opacity: expo(f - built, 8), fontWeight: 800, fontSize: 30, color: K.mut, letterSpacing: 2}}>FOR CREATORS UNDER 10K FOLLOWERS</div>
          <div style={{marginTop: 20}}><Rise f={f} at={built + 2} text="Small account." size={96} weight={900} font={FONT} /></div>
          <div style={{marginTop: 6}}><Money size={96} p={expo(f - built - 6, 10)}>Real income.</Money></div>
          <div style={{display: 'flex', gap: 20, marginTop: 44}}>
            {['Try the AI finder', 'Get the free guide'].map((t, i) => <div key={t} style={{transform: `scale(${pop(f, built + 10 + i * 4)})`}}><Pill bg={i ? '#fff' : K.ui} color={i ? K.ui : '#fff'} size={36} style={{border: `3px solid ${K.ui}`}}>{t}</Pill></div>)}
          </div>
        </div>
        <div style={{display: 'flex', gap: 20, padding: '20px 60px'}}>
          {[['16', 'income stream guides'], ['15', 'creator tools'], ['$0', 'to use it all']].map(([n, l], i) => { const p = pop(f, built + 16 + i * 4);
            return <div key={l} style={{flex: 1, borderRadius: 30, background: i === 2 ? K.lime : '#F5F5F2', padding: 26, transform: `translateY(${(1 - p) * 200}px)`, opacity: clamp01(p * 2)}}>
              <div style={{fontWeight: 900, fontSize: 72, color: K.ui}}>{n}</div><div style={{fontWeight: 700, fontSize: 28, color: K.mut}}>{l}</div></div>; })}
        </div>
        <div style={{margin: '20px 60px', height: 300, borderRadius: 34, background: K.ui, padding: 34, opacity: expo(f - built - 26, 8)}}>
          <div style={{fontWeight: 800, fontSize: 44, color: '#fff'}}>AI Income Finder</div><div style={{marginTop: 22, height: 80, borderRadius: 40, background: '#2A2A2D'}} />
        </div>
        {/* streams library (beat 5) */}
        <div style={{padding: '40px 60px 0'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{width: 150, height: 150, borderRadius: 40, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 100, color: K.ui, transform: `scale(${1 + 0.08 * Math.max(0, 1 - Math.abs(f - W(5, '16') - 2) / 6)})`}}>{n16}</div>
            <div><div style={{fontWeight: 900, fontSize: 58, color: K.ui}}>Income stream guides</div><div style={{fontWeight: 700, fontSize: 32, color: K.mut}}>Pay, requirements, steps, the catch</div></div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 190px)', gap: 30, marginTop: 40}}>
            {STREAMS.map(([n, l], i) => { const p = expo(f - tileAt(i), 10); const h = hi[l]; const on = h && f >= h - 2 ? Math.max(0, 1 - (f - h - 2) / 26) : 0;
              const chk = expo(f - W(5, 'source') - i * 0.8, 8);
              return (
                <div key={l} style={{position: 'relative', textAlign: 'center', transform: `perspective(800px) rotateY(${(1 - p) * 90}deg) scale(${1 + on * 0.18})`, opacity: clamp01(p * 3), zIndex: on ? 2 : 1}}>
                  <Tile name={n} size={190} r={44} logo={0.5} bg={on ? K.lime : '#fff'} style={{border: `3px solid ${on ? K.ui : K.line}`, boxShadow: on ? '0 20px 40px rgba(0,0,0,0.2)' : 'none'}} />
                  <div style={{fontWeight: 700, fontSize: 26, color: K.ui, marginTop: 8}}>{l}</div>
                  {chk > 0 && <div style={{position: 'absolute', right: -8, top: -8, width: 56, height: 56, borderRadius: 28, background: K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${chk})`}}><Check size={36} color={K.lime} /></div>}
                </div>
              ); })}
          </div>
        </div>
      </div>
    </div>
    {(() => { const p = pop(f, W(5, 'source') - 4); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1470, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * 300}px) scale(${p})`}}>
        <Pill bg={K.ui} color="#fff" size={44}><Icon name="cal" size={46} color={K.lime} />Every number: source + date</Pill></div>); })()}
    {f >= built - 14 && f < built + 8 && (() => { const p = expo(f - built + 14, 10); return <Cursor x={mix(900, 600, p)} y={mix(1400, 470, p)} s={f > built - 2 && f < built + 3 ? 0.85 : 1} />; })()}
  </>);
};

// ---------------------------------------------------------------- 6 + 7: AI Income Finder (dark cell)
const LINES = ['I post Reels and TikToks,', '600 followers.', 'What can pay me?'];
const RES = [
  {name: 'Etsy templates', pay: '$8.60 of a $10 sale', logo: 'etsy'},
  {name: 'UGC videos', pay: '$50–$400 a video', logo: 'ugc', best: true},
  {name: 'Fiverr gigs', pay: 'Fiverr keeps 20%', logo: 'fiverr'},
];
const S6 = ({f, W, B}) => {
  const head = pop(f, W(6, 'ai') - 6);
  const send = B(7); const sent = expo(f - send, 10);
  const typed = (() => { let left = typedCount(f, W(6, 'tell') - 2, LINES.join('').length, 3, 2.3); return LINES.map((l) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return s; }); })();
  const pick = W(7, 'picks') - 4; const ringOut = expoIn(f - pick + 6, 8);
  const ringIn = expo(f - send - 2, 12);
  const n = Math.min(16, Math.round(16 * clamp01((f - send - 6) / Math.max(8, pick - send - 10))));
  const cards = spring(f - pick, {w: 0.42, z: 0.66}); const lift = expo(f - W(7, 'best') + 3, 8);
  const comp = {x: mix(90, 230, sent), y: mix(560, 300, sent), w: mix(900, 760, sent), h: mix(400, 230, sent)};
  return (<>
    <div style={{position: 'absolute', left: 90, top: 250, display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${head})`, transformOrigin: 'left', opacity: 1 - sent}}>
      <div style={{width: 110, height: 110, borderRadius: 32, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="spark" size={64} color={K.ui} /></div>
      <div><div style={{fontWeight: 900, fontSize: 64, color: '#fff'}}>AI Income Finder</div><div style={{marginTop: 4}}><Pill bg={K.lime} color={K.ui} size={30}>Free</Pill></div></div>
    </div>
    {/* composer -> sent bubble */}
    <div style={{position: 'absolute', left: comp.x, top: comp.y, width: comp.w, height: comp.h, transform: `scale(${pop(f, W(6, 'tell') - 10, {w: 0.45, z: 0.7})})`}}>
      {sent < 0.6 && <div style={{opacity: 1 - sent * 1.6}}><Iridescent f={f} w={comp.w} h={comp.h} r={48} /></div>}
      <div style={{position: 'absolute', inset: 0, borderRadius: 48, background: sent > 0.5 ? K.lime : '#fff'}} />
      <div style={{position: 'absolute', left: mix(54, 40, sent), top: mix(54, 30, sent), fontFamily: FONT, fontWeight: 700, fontSize: mix(56, 46, sent), lineHeight: 1.3, color: K.ui}}>
        {typed.map((l, i) => <div key={i} style={{height: mix(73, 58, sent)}}>{l}</div>)}
      </div>
      {sent < 0.3 && <div style={{position: 'absolute', right: 34, bottom: 34, width: 100, height: 100, borderRadius: 50, background: K.ui, transform: `scale(${f >= send - 3 && f < send + 3 ? 0.85 : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontSize: 56, fontWeight: 900}}>↑</div>}
    </div>
    {sent < 1 && [[W(6, 'post'), 90, 1040, -4, 'p'], [W(6, 'followers'), 420, 1200, 4, 'n']].map(([at, x, y, r, k], i) => { const p = pop(f, at - 2, {w: 0.5, z: 0.55}); const fly = expoIn(f - send + 2, 8);
      return <div key={k} style={{position: 'absolute', left: mix(x, 400, fly), top: mix(y + Math.sin(f / 9 + i) * 8, 400, fly), transform: `scale(${p * (1 - fly)}) rotate(${r}deg)`}}>
        <Pill bg={k === 'n' ? K.lime : '#fff'} color={K.ui} size={46}>{k === 'p' ? <><Logo name="instagram" size={48} /><Logo name="tiktok" size={48} />Reels + TikToks</> : <>{count(f, at - 2, 600, 14)} followers</>}</Pill></div>; })}
    {/* thinking ring with the 16 streams */}
    {f >= send && f < pick + 12 && <>
      <div style={{position: 'absolute', left: 540 - 160, top: 1000 - 160, width: 320, height: 320, borderRadius: 160, background: '#1E1E21', border: `14px solid ${K.lime}`, transform: `scale(${ringIn * (1 - ringOut)})`,
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
    {/* results: three cards, the best match lifts */}
    {f >= pick && RES.map((c, i) => { const l = c.best ? lift : 0; const x = 540 + (i - 1) * 330;
      return (
        <div key={c.name} style={{position: 'absolute', left: x - 150, top: 780 - l * 70 + Math.sin(f / 9 + i) * 8, width: 300, transform: `perspective(1200px) rotateY(${(i - 1) * -14 * (1 - l * (c.best ? 1 : 0))}deg) scale(${cards * (c.best ? 1 + l * 0.22 : 1 - lift * 0.1)})`, opacity: c.best ? 1 : 1 - lift * 0.45, zIndex: c.best ? 2 : 1}}>
          {c.best && l > 0.5 && <Pulse f={f} x={150} y={210} d={360} from={W(7, 'best')} every={20} />}
          <div style={{borderRadius: 34, background: '#fff', overflow: 'hidden', fontFamily: FONT, boxShadow: '0 30px 60px rgba(0,0,0,0.4)'}}>
            <div style={{height: 220, background: c.best ? K.lime : '#EDEDE8', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {c.logo === 'ugc' ? <StreamArt kind="ugc" size={200} p={{...ART, a: '#fff', rec: K.ui, recInk: K.lime}} /> : <BrandLogo name={c.logo} size={120} />}</div>
            <div style={{padding: '22px 24px'}}><div style={{fontWeight: 900, fontSize: 36, color: K.ui}}>{c.name}</div><div style={{fontWeight: 700, fontSize: 26, color: K.mut, marginTop: 8}}>{c.pay}</div></div>
          </div>
          {c.best && <div style={{position: 'absolute', left: 0, right: 0, top: -70, textAlign: 'center', opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}><Pill bg={K.ui} color={K.lime} size={30} style={{border: `3px solid ${K.lime}`}}>Best match</Pill></div>}
        </div>
      ); })}
    <Burst f={f} at={W(7, 'best')} x={540} y={900} n={18} r={440} />
    {(() => { const p = pop(f, W(7, 'first') - 4, {w: 0.5, z: 0.55}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1340, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * 400}px) scale(${p})`}}>
        <Pill bg={K.lime} color={K.ui} size={48}><Check size={52} color={K.ui} p={expo(f - W(7, 'first'), 10)} />First step: 3 sample videos</Pill></div>); })()}
  </>);
};

// ---------------------------------------------------------------- 8: tracker + tools
const S8 = ({f, W, B}) => {
  const tr = pop(f, B(8) + 2); const tl = pop(f, W(8, 'tools') - 6);
  return (<>
    <div style={{position: 'absolute', left: 90, top: 230}}><Rise f={f} at={B(8) + 2} text="Free tools" size={84} weight={900} font={FONT} /></div>
    <Card style={{left: 90, top: 380, width: 900, height: 560, transform: `translateX(${(1 - tr) * -1100}px) rotate(${(1 - tr) * -10}deg)`}}>
      <div style={{position: 'absolute', left: 50, top: 44, fontWeight: 900, fontSize: 56, color: K.ui}}>Income tracker</div>
      <div style={{position: 'absolute', right: 44, top: 46}}><Pill bg={K.lime} color={K.ui} size={30}>Free</Pill></div>
      {['ugc', 'etsy', 'patreon'].map((n, i) => { const p = expo(f - B(8) - 8 - i * 5, 10);
        return <div key={n} style={{position: 'absolute', left: 50, right: 50, top: 150 + i * 112, height: 92, borderRadius: 26, background: '#F5F5F2', display: 'flex', alignItems: 'center', gap: 22, padding: '0 20px', transform: `translateX(${(1 - p) * 600}px)`, opacity: p}}>
          <Tile name={n} size={66} r={18} /><div style={{fontWeight: 800, fontSize: 36, color: K.ui, flex: 1}}>{['UGC deals', 'Etsy shop', 'Patreon'][i]}</div>
          <div style={{width: 220, height: 20, borderRadius: 10, background: K.line, overflow: 'hidden'}}><div style={{width: `${expo(f - B(8) - 14 - i * 5, 20) * [70, 45, 30][i]}%`, height: '100%', background: i === 0 ? K.lime : K.ui}} /></div>
          <div style={{width: 52, height: 52, borderRadius: 16, background: K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Check size={34} color={K.lime} p={expo(f - B(8) - 20 - i * 5, 8)} /></div>
        </div>; })}
      <div style={{position: 'absolute', left: 50, bottom: 36, transform: `scale(${pop(f, W(8, 'device') - 4, {w: 0.6, z: 0.5})})`, transformOrigin: 'left'}}><Pill bg={K.ui} color="#fff" size={34}><Lock size={36} color={K.lime} />Saved on your device only</Pill></div>
    </Card>
    <Card style={{left: 90, top: 1000, width: 900, height: 470, transform: `translateX(${(1 - tl) * 1100}px) rotate(${(1 - tl) * 10}deg)`}}>
      <div style={{position: 'absolute', left: 50, top: 44, fontWeight: 900, fontSize: 56, color: K.ui}}>Tools page</div>
      <div style={{position: 'absolute', right: 44, top: 56, fontWeight: 700, fontSize: 28, color: K.mut}}>Affiliate links</div>
      {['beehiiv', 'kit', 'elevenlabs', 'opusclip'].map((n, i) => { const p = pop(f, W(8, 'tools') - 2 + i * 3, {w: 0.5, z: 0.55}); const tag = pop(f, W(8, 'free') - 2 + i * 3, {w: 0.6, z: 0.5});
        return <div key={n} style={{position: 'absolute', left: 50 + i * 205, top: 160 + Math.sin(f / 9 + i) * 6, transform: `scale(${p})`}}>
          <Tile name={n} size={180} r={44} logo={0.6} style={{border: `3px solid ${K.line}`}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', transform: `scale(${tag}) rotate(${(i % 2 ? 1 : -1) * 4}deg)`}}><Pill bg={K.lime} color={K.ui} size={26}>Free plan</Pill></div>
        </div>; })}
    </Card>
    <Burst f={f} at={W(8, 'marked')} x={540} y={1400} n={14} r={360} />
  </>);
};

// ---------------------------------------------------------------- 9: the free guide (PDF book)
const S9 = ({f, W, B}) => {
  const b = pop(f, B(9) - 2, {w: 0.32, z: 0.7}); const fan = expo(f - W(9, 'covers') + 4, 16);
  const pages = ['ugc', 'etsy', 'patreon', 'tiktok', 'amazon'];
  return (<>
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
    {(() => { const p = pop(f, W(9, 'under') - 3, {w: 0.55, z: 0.5}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 1240, display: 'flex', justifyContent: 'center', transform: `scale(${mix(2, 1, p)}) rotate(${-4 + (1 - p) * 10}deg)`, opacity: clamp01(p * 2)}}>
        <Pill bg={K.lime} color={K.ui} size={64} style={{border: `6px solid ${K.ui}`}}>Under 10k followers</Pill></div>); })()}
    <Burst f={f} at={W(9, 'under')} x={540} y={1300} n={18} r={440} />
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

// ---------------------------------------------------------------- 11: our promise (dark kinetic type)
const S11 = ({f, W, B}) => {
  const L = [
    {at: W(11, 'hype'), t: 'No hype.', c: '#fff'},
    {at: W(11, 'promises'), t: 'No promises.', c: '#fff'},
    {at: W(11, 'real'), t: 'Real numbers.', money: true},
    {at: W(11, 'catch') - 6, t: '+ the catch.', c: K.red},
  ];
  return (<>
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: 0.5}}>
      {[0, 1, 2].map((i) => <circle key={i} cx="540" cy="900" r={300 + i * 180 + ((f - B(11)) * 3) % 180} stroke="#2A2A2D" strokeWidth="4" fill="none" />)}
    </svg>
    <div style={{position: 'absolute', left: 90, top: 300}}><Rise f={f} at={B(11)} text="Our promise" size={56} weight={800} font={FONT} color="#8B8B86" /></div>
    {L.map((l, i) => { const p = pop(f, l.at - 3, {w: 0.55, z: 0.55}); if (p <= 0) return null; const shake = f - l.at < 8 ? Math.sin((f - l.at) * 2.6) * 10 * (1 - (f - l.at) / 8) : 0;
      return <div key={i} style={{position: 'absolute', left: 90, top: 470 + i * 230, transform: `translateX(${shake}px) scale(${mix(1.8, 1, p)})`, transformOrigin: 'left center', opacity: clamp01(p * 2), fontFamily: FONT, fontWeight: 900, fontSize: 132, letterSpacing: -5, color: l.c}}>
        {l.money ? <Money size={132}>{l.t}</Money> : l.t}</div>; })}
    <Burst f={f} at={W(11, 'real')} x={480} y={1060} n={20} r={480} />
  </>);
};

// ---------------------------------------------------------------- 12: outro (dark)
const S12 = ({f, W, B}) => {
  const outro = B(12); const o = expo(f - outro, 12); const p = expo(f - outro - 1, 16);
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
      <div style={{fontWeight: 900, fontSize: 84, color: '#fff', clipPath: `inset(0 ${(1 - expo(f - W(12, 'subcreatorpaid.com') + 6, 10)) * 50}% 0 ${(1 - expo(f - W(12, 'subcreatorpaid.com') + 6, 10)) * 50}%)`}}>subcreatorpaid.com</div>
      <div style={{fontWeight: 700, fontSize: 40, color: '#9A9A94', marginTop: 16, opacity: expo(f - W(12, 'subcreatorpaid.com'), 8)}}>Free AI Income Finder · 16 guides · free guide</div>
    </div>
    {(() => { const q = pop(f, W(12, 'comment') - 3, {w: 0.5, z: 0.55}); return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', transform: `scale(${q})`}}>
        <Pill bg={K.lime} color={K.ui} size={54}>Comment GUIDE for the free guide</Pill></div>); })()}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, textAlign: 'center', opacity: expo(f - W(12, 'tools') + 4, 10), fontFamily: FONT}}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#1E1E21', color: '#CFCFCA', borderRadius: 40, padding: '12px 26px', fontWeight: 700, fontSize: 30}}>Tools I use:
        {['beehiiv', 'elevenlabs', 'opusclip', 'skool'].map((n, i) => <span key={n} style={{display: 'inline-flex', width: 56, height: 56, borderRadius: 14, background: '#fff', alignItems: 'center', justifyContent: 'center', transform: `scale(${spring(f - W(12, 'tools') - i * 3, {w: 0.5, z: 0.6})})`}}><BrandLogo name={n} size={42} /></span>)} · Affiliate links</span>
    </div>
    <div style={{position: 'absolute', left: 300, top: 1290, width: 480, height: 110, borderRadius: 55, background: f > W(12, 'follow') + 4 ? '#2A2A2D' : '#fff', color: f > W(12, 'follow') + 4 ? '#fff' : K.ui, fontFamily: FONT,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44, opacity: expo(f - W(12, 'follow') + 10, 8), transform: `scale(${f > W(12, 'follow') && f < W(12, 'follow') + 5 ? 0.92 : 1})`}}>{f > W(12, 'follow') + 4 ? 'Following' : 'Follow'}</div>
  </>);
};

const SCENES = {0: S0, 1: S1, 2: S2, 3: S3, 4: S4, 5: S6, 6: S8, 7: S9, 8: S10, 9: S11, 10: S12};

export const Overview = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W, E} = useTimes(beats);
  const nb = beats.length;
  // camera: hold on each cell, whip (with a dip zoom) to the next one when its first line starts
  const centre = (c) => { const p = cellPos(c); return [p.x + 540, p.y + 960]; };
  const track = [[0, 1, ...centre(0)]];
  for (let i = 1; i < nb; i++) {
    if (CELL[i] === CELL[i - 1]) continue;
    const a = centre(CELL[i - 1]), b = centre(CELL[i]);
    track.push([B(i) - 9, 1, ...a], [B(i) + 1, 0.62, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [B(i) + 11, 1, ...b]);
  }
  const cam = camera(f, track);
  const prev = camera(f - 1, track);
  const vy = cam.y - prev.y, vx = cam.x - prev.x;
  const keys = [W(0, '10000'), W(0, 'paid'), W(2, '10000'), W(3, 'dollars'), W(5, '16'), W(7, 'best'), W(9, 'under'), W(11, 'real')];
  const punch = keys.reduce((s, w) => s + 0.035 * Math.max(0, 1 - Math.abs(f - w - 2) / 7), 0);
  const z = cam.z * (1 + punch); const cx = cam.x + Math.sin(f / 37) * 6, cy = cam.y + Math.cos(f / 43) * 8;
  const skew = Math.max(-14, Math.min(14, vy * 0.03)); const rot = Math.max(-4, Math.min(4, vx * 0.012));
  const css = `translate(540px, 960px) rotate(${rot}deg) skewY(${skew}deg) scale(${z}) translate(${-cx}px, ${-cy}px)`;

  const SAFE = {s: 0.7, x: 92, y: 262};
  const beat = Math.max(0, beats.findIndex((b, i) => f < E(i)) === -1 ? nb - 1 : beats.findIndex((b, i) => f < E(i)));
  const chapter = CHAPTERS.reduce((a, c, i) => (beat >= c[0] ? i : a), 0);
  const dark = DARK[CELL[beat]] && f > B(beat) + 1;
  const showCell = (c) => { const idx = CELL.map((x, i) => (x === c ? i : -1)).filter((i) => i >= 0); return f >= B(idx[0]) - 14 && f < E(idx[idx.length - 1]) + 14; };
  const cells = [...new Set(CELL)];
  const chAt = B(CHAPTERS[chapter][0]);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden', fontFamily: FONT}}>
      <Dust f={f} />
      <div style={{position: 'absolute', left: 0, right: 140, top: 168, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
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
