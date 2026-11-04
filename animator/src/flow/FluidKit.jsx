// "Fluid" look as a scene kit (4 Nov 2026): the v101 Adobe Stock film (Fluid.jsx) hard-codes one scene per beat. FluidKit
// keeps the same primitives and FX (lime blob, blur-in type, letter explode, motion-blur whips, iris wipes, DOF cards,
// number rolls, white caption pill) but builds every scene from the spec, so a new video is only JSON:
//   beat.show = {type: 'fluid', scene: '<kind>', bg?: 'light'|'dark'|'lime', tr?: '<transition in>', ...params}
// Kinds: hook, title, catch, card, stack, counter, warn, steps, comment, site, tool, follow (params documented per scene).
// Word anchors ("word" params) are display words from the beat's `say`; a missing word falls back to a time in the beat.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, staticFile} from 'remotion';
import {FONT} from '../Short';
import {expo, expoIn, inOut, mix, clamp01, typedCount} from './kit';
import {BrandLogo} from './art';
import {K, MONO, CX, BG, TW, MB, BlurIn, Explode, Blob, Tag, Mono, pop, Glow, Arrow, useChunks, Caption} from './Fluid';

const DEF_BG = {hook: 'light', title: 'light', catch: 'dark', card: 'dark', stack: 'lime', counter: 'dark', warn: 'dark', steps: 'light',
  comment: 'lime', site: 'lime', tool: 'light', follow: 'lime'};
const TRS = ['whipX', 'iris', 'zoom', 'whipY', 'soft', 'push'];
const clean = (s) => String(s).replace(/[^\w$%.'-]/g, '').replace(/\.$/, '').toLowerCase();

// Logo tile with a lime glow (real marks from art.jsx / graphics.jsx).
const LogoTile = ({name, size = 170, f = 0, glow = 0.7}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,0.18), 0 0 ${size * 0.42}px rgba(205,242,79,${glow})`, transform: `rotate(${Math.sin(f / 14) * 4}deg)`}}>
    <BrandLogo name={name} size={size * 0.64} />
  </div>
);
const Icon = ({name, size = 150}) => {
  const st = {stroke: K.ink, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none'};
  const I = {
    form: <><path d="M4 2 H20 L26 8 V34 H4 Z" {...st} fill="#fff" /><path d="M9 14 H21 M9 19 H21 M9 24 H16" {...st} /><path d="M20 2 V8 H26" {...st} /></>,
    x: <><circle cx="15" cy="18" r="13" fill="#fff" stroke={K.ink} strokeWidth="2.4" /><path d="M10 13 L20 23 M20 13 L10 23" {...st} stroke={K.red} strokeWidth="3.2" /></>,
    clock: <><circle cx="15" cy="18" r="13" fill="#fff" stroke={K.ink} strokeWidth="2.4" /><path d="M15 10 V18 L21 21" {...st} /></>,
    mic: <><rect x="10" y="3" width="10" height="19" rx="5" fill="#fff" stroke={K.ink} strokeWidth="2.4" /><path d="M5 16 Q5 27 15 27 Q25 27 25 16 M15 27 V33 M10 33 H20" {...st} /></>,
    mail: <><rect x="2" y="8" width="26" height="20" rx="3" fill="#fff" stroke={K.ink} strokeWidth="2.4" /><path d="M3 10 L15 19 L27 10" {...st} /></>,
    eye: <><path d="M1 18 Q15 4 29 18 Q15 32 1 18 Z" fill="#fff" stroke={K.ink} strokeWidth="2.4" /><circle cx="15" cy="18" r="5" fill={K.ink} /></>,
  };
  return <svg width={size} height={size * 1.2} viewBox="0 0 30 36">{I[name] || I.form}</svg>;
};

// ------------------------------------------------------------------ scenes (props: f, s = show, B0 = beat start, E0 = beat end, w(word, fallback))
// hook: {big, bigWord?, text, box?, logo?, sub?}  big words inside a swelling blob, the line blurs in under it.
const Hook = ({f, s, B0, E0, w}) => {
  const g = pop(f, B0 + 1, {w: 0.3, z: 0.6}); const bob = Math.sin(f / 14) * 8;
  const bw = Math.min(w(s.bigWord, 2), B0 + 6); const words = String(s.text || '').split(' ');
  const len = String(s.big).length; const size = len <= 4 ? 230 : len <= 8 ? 168 : len <= 11 ? 128 : 100;
  return (<>
    <Blob x={CX} y={720 + bob} w={mix(160, 820, g)} h={mix(160, 400, g)} r={200}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.05, color: K.ink, whiteSpace: 'nowrap',
        transform: `scale(${mix(1.4, 1, expo(f - bw, 12))})`, filter: `blur(${(1 - expo(f - bw, 12)) * 18}px)`, opacity: clamp01(expo(f - bw, 10) * 2)}}>{s.big}</div>
    </Blob>
    {s.logo && <div style={{position: 'absolute', left: CX + 300, top: 470 + bob * 1.5, transform: `translate(-50%, 0) scale(${pop(f, B0 + 8, {w: 0.5, z: 0.5})})`}}><LogoTile name={s.logo} size={150} f={f} /></div>}
    <div style={{position: 'absolute', left: 80, width: 860, top: 990}}>
      <BlurIn f={f} ats={words.map((x, i) => w(x, 6 + i * 3) - 3)} text={s.text} size={words.length > 6 ? 74 : 88} box={s.box} out={E0 - 10} /></div>
    {s.sub && <Mono size={26} style={{position: 'absolute', left: 0, width: 1020, top: 1250, textAlign: 'center', opacity: expo(f - B0 - 20, 12)}}>{s.sub}</Mono>}
  </>);
};
// title: {text, box?, logo?, logos?: [..], tags?: [[label, word, dark?]]}  headline + centre blob/logo + floating tags with dashed leads.
const tsize = (t) => { const n = String(t || '').length; return n <= 12 ? 104 : n <= 18 ? 84 : 72; };
const ttop = (t) => (String(t || '').length > 18 ? 560 : 470);
const SLOTS = [[270, 640], [760, 610], [300, 1090], [740, 1120]];
const Title = ({f, s, B0, E0, w}) => {
  const ex = E0 - 12; const fly = expoIn(f - ex, 12); const tags = s.tags || []; const g = pop(f, B0 + 3, {w: 0.4, z: 0.55});
  const words = String(s.text).split(' ');
  return (<>
    {f < ex + 2 && <div style={{position: 'absolute', left: 80, width: 860, top: 280}}>
      <BlurIn f={f} ats={words.map((x, i) => w(x, 2 + i * 3) - 3)} text={s.text} size={words.length > 5 ? 84 : 100} box={s.box} /></div>}
    <Explode f={f} at={ex} text={s.text} size={words.length > 5 ? 84 : 100} x={CX} y={280} seed={s.text.length} />
    <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, opacity: 1 - fly}}>
      {tags.map(([, word], i) => { const [x, y] = SLOTS[i % 4]; const d = expo(f - w(word, 10 + i * 8), 12);
        return <line key={i} x1={CX} y1={870} x2={mix(CX, x, d)} y2={mix(870, y + 30, d)} stroke={K.ink} strokeWidth="4" strokeDasharray="10 10" />; })}
    </svg>
    <Blob x={CX} y={870 + Math.sin(f / 13) * 8} w={300 * g * (1 - fly)} h={300 * g * (1 - fly)} r={150}>
      {s.logo && <div style={{transform: `scale(${g})`}}><LogoTile name={s.logo} size={170} f={f} glow={0.2} /></div>}
    </Blob>
    {(s.logos || []).map((n, i, a) => { const ang = f / 40 + (i / a.length) * Math.PI * 2; const p = pop(f, B0 + 8 + i * 4, {w: 0.5, z: 0.55});
      return <div key={n} style={{position: 'absolute', left: CX + Math.cos(ang) * 290 - 60, top: 870 + Math.sin(ang) * 200 - 60, transform: `scale(${p * (1 - fly)})`}}><LogoTile name={n} size={120} f={f + i * 9} /></div>; })}
    {tags.map(([label, word, dark], i) => { const [x, y] = SLOTS[i % 4]; const t = w(word, 10 + i * 8) - 4; const tg = pop(f, t, {w: 0.5, z: 0.55});
      const bob = Math.sin(f / 13 + i * 1.7) * 10; const ox = (x - CX) * fly * 1.6, oy = (y - 870) * fly * 1.6;
      return (<div key={i} style={{position: 'absolute', left: x + ox, top: y + bob + oy, transform: `translate(-50%, 0) scale(${tg}) rotate(${(i % 2 ? 1 : -1) * 4}deg)`, opacity: clamp01(tg * 2), filter: `blur(${(1 - clamp01(tg)) * 10 + fly * 14}px)`}}>
        <Tag size={46} dark={dark} style={dark ? {color: K.lime} : {}}>{label}</Tag></div>); })}
  </>);
};
// catch: {top?, big?, sub?, word?}  giant cropped type on ink with a red rule.
const Catch = ({f, s, B0, w}) => {
  const t = f - B0; const drift = -Math.min(t, 60) * 1.2; const c = w(s.word || 'catch', 4); const p1 = expo(t + 4, 10), p2 = pop(f, c - 4, {w: 0.5, z: 0.6});
  return (<>
    <MB id={`ct${B0}`} x={(1 - p1) * 40}><div style={{position: 'absolute', left: 60 + drift + (1 - p1) * 500, top: 560, fontFamily: FONT, fontWeight: 900, fontSize: 230, letterSpacing: -13, color: '#fff', whiteSpace: 'nowrap', lineHeight: 1}}>{s.top || "here's"}</div></MB>
    <div style={{position: 'absolute', left: 40 - drift * 0.6 - (1 - p2) * 300, top: 830, transform: `scale(${mix(1.3, 1, p2)})`, transformOrigin: 'left center', opacity: clamp01(p2 * 2), whiteSpace: 'nowrap'}}>
      <span style={{display: 'inline-block', background: '#fff', color: K.ink, fontFamily: FONT, fontWeight: 900, fontSize: 220, letterSpacing: -12, lineHeight: 1, padding: '0 30px 18px', borderRadius: 24}}>{s.big || 'the catch'}</span></div>
    <div style={{position: 'absolute', left: 120, top: 1105, width: 780, height: 8, borderRadius: 4, background: K.red, transform: `scaleX(${expo(f - c, 14)})`, transformOrigin: 'left'}} />
    {s.sub && <div style={{position: 'absolute', left: 80, width: 860, top: 1150}}><BlurIn f={f} at={c + 8} text={s.sub} size={60} color="#B9B9B3" weight={800} /></div>}
  </>);
};
// card: {label, title, box?, rows: [[k, v, word]], value?, valueWord?, valueLabel?}  dark DOF UI card, pointer hops row to row.
const Card = ({f, s, B0, E0, w}) => {
  const e = expo(f - B0, 22); const rows = s.rows || []; const rt = rows.map((r, i) => w(r[2], 8 + i * 14));
  const vt = s.value ? w(s.valueWord, 14 + rows.length * 14) : 0; const top = 330;
  const rowY = (i) => top + 300 + i * 118;
  const track = [[rt[0] - 14, 900, 1300], ...rows.map((_, i) => [rt[i] + 2, 790, rowY(i) + 46])];
  if (s.value) track.push([vt + 4, 640, top + 300 + rows.length * 118 + 110]);
  track.push([E0, 900, 1300]);
  return (<>
    <div style={{position: 'absolute', left: 80, top, width: 860, height: s.value ? 960 : 720, perspective: 1600}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: K.card, border: `2px solid ${K.line}`, boxShadow: '0 50px 120px rgba(0,0,0,0.55)',
        transform: `rotateX(${mix(24, 0, e) + Math.sin(f / 30) * 1.5}deg) rotateZ(${mix(-4, 0, e)}deg) translateY(${(1 - e) * 200}px) scale(${mix(0.9, 1, e)})`, filter: `blur(${(1 - e) * 14}px)`, opacity: clamp01(e * 2)}}>
        <Mono size={24} color={K.lime} style={{position: 'absolute', left: 50, top: 46}}>● {s.label}</Mono>
        <div style={{position: 'absolute', left: 50, top: 100, width: 780}}><BlurIn f={f} at={B0 + 6} text={s.title} size={74} color="#fff" align="left" box={s.box} /></div>
        {rows.map(([k, v], i) => { const on = expo(f - rt[i] + 4, 10); const hot = f > rt[i] - 2;
          return (<div key={i} style={{position: 'absolute', left: 50, right: 50, top: rowY(i) - top, height: 96, borderRadius: 26, background: hot ? '#232327' : '#18181B',
            border: `2px solid ${hot ? '#3A3A40' : K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', opacity: mix(0.35, 1, on), transform: `translateX(${(1 - on) * 40}px)`}}>
            <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 34, color: hot ? '#fff' : '#9A9A94'}}>{k}</div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 40, color: K.ink, background: hot ? '#fff' : '#3A3A40', padding: '6px 22px', borderRadius: 30,
              boxShadow: hot ? `0 0 0 4px ${K.lime}, 0 0 40px rgba(205,242,79,0.45)` : 'none', transform: `scale(${mix(0.8, 1, pop(f, rt[i] - 2, {w: 0.5, z: 0.5}))})`}}>{v}</div>
          </div>); })}
        {s.value && <div style={{position: 'absolute', left: 50, right: 50, top: 300 + rows.length * 118 + 20, height: 190, borderRadius: 32, background: '#111114', border: `2px solid ${K.line}`, display: 'flex', alignItems: 'center', padding: '0 36px', gap: 26}}>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#9A9A94', width: 220, lineHeight: 1.2}}>{s.valueLabel}</div>
          <div style={{background: K.lime, color: K.ink, borderRadius: 26, padding: '6px 26px 10px', fontFamily: FONT, fontWeight: 900, fontSize: String(s.value).length > 7 ? 84 : 110, letterSpacing: -5, whiteSpace: 'nowrap',
            transform: `scale(${mix(0.6, 1, pop(f, vt - 6))})`, opacity: clamp01(pop(f, vt - 6) * 2), filter: `blur(${(1 - clamp01(expo(f - vt + 6, 10))) * 8}px)`}}>{s.value}</div>
        </div>}
      </div>
    </div>
    <Glow f={f} dark track={track} clicks={[...rt.map((t) => t + 2), ...(s.value ? [vt + 4] : [])]} />
  </>);
};
// stack: {title, box?, rows: [{k, v, tag?, word}], note?}  paper cards fly up and stack.
const Stack = ({f, s, B0, w}) => {
  const rows = s.rows || []; const h = rows.length > 3 ? 170 : 210, gap = rows.length > 3 ? 190 : 236;
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 280}}><BlurIn f={f} at={B0 + 2} text={s.title} size={tsize(s.title)} box={s.box} /></div>
    {rows.map((r, i) => { const at = w(r.word, 4 + i * 12) - 6; const p = pop(f, at, {w: 0.32, z: 0.7}); if (f < at - 1) return null;
      return (<div key={i} style={{position: 'absolute', left: 110, top: ttop(s.title) + i * gap, width: 800, height: h, borderRadius: 36, background: K.paper, boxShadow: '0 26px 60px rgba(60,80,0,0.22)',
        transform: `translateY(${(1 - p) * 520}px) rotate(${(1 - p) * (i % 2 ? 5 : -5)}deg)`, filter: `blur(${(1 - clamp01(p)) * 10}px)`}}>
        <div style={{position: 'absolute', left: 40, top: 26, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: K.ink}}>{r.k}</div>
        <div style={{position: 'absolute', left: 38, top: 74, fontFamily: FONT, fontWeight: 900, fontSize: String(r.v).length > 14 ? 64 : 88, letterSpacing: -4, color: K.ink, lineHeight: 1, whiteSpace: 'nowrap'}}>{r.v}</div>
        {r.tag && <Mono size={20} color="#4C7A1A" style={{position: 'absolute', right: 34, bottom: 20}}>{r.tag}</Mono>}
      </div>); })}
    {s.note && <Mono size={22} style={{position: 'absolute', left: 0, right: 0, width: 1020, top: ttop(s.title) + rows.length * gap + 10, textAlign: 'center', opacity: expo(f - w(rows[rows.length - 1] && rows[rows.length - 1].word, 20), 10)}}>{s.note}</Mono>}
  </>);
};
// counter: {n, word, prefix?, suffix?, label, ends?: [left, right], dec?}  big number roll with a progress bar.
const Counter = ({f, s, B0, w}) => {
  const c = w(s.word, 6); const p = expo(f - c + 14, 26); const v = s.n * p;
  const fmt = (x) => (s.dec ? x.toFixed(s.dec) : Math.round(x).toLocaleString('en-US'));
  const txt = `${s.prefix || ''}${fmt(v)}${s.suffix || ''}`; const size = txt.length <= 3 ? 400 : txt.length <= 5 ? 300 : 220;
  return (<>
    <div style={{position: 'absolute', left: 95, top: 330, display: 'grid', gridTemplateColumns: 'repeat(9, 86px)', gap: 12, filter: 'blur(3px)', opacity: 0.6}}>
      {Array.from({length: 36}, (_, i) => { const on = i / 36 < p; return (
        <div key={i} style={{width: 86, height: 86, borderRadius: 18, background: on ? '#2B3410' : '#1C1C20', border: `2px solid ${on ? '#55681C' : '#26262B'}`, opacity: clamp01(expo(f - B0 - i * 0.4, 8))}} />); })}
    </div>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 950 - size * 0.98, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.06, color: '#fff', lineHeight: 1,
      transform: `scale(${1 + 0.06 * Math.max(0, 1 - Math.abs(f - c - 12) / 6)})`, opacity: clamp01(expo(f - c + 16, 6))}}>{txt}</div>
    <Mono size={30} color="#fff" style={{position: 'absolute', left: 0, width: 1020, top: 990, textAlign: 'center', opacity: expo(f - c, 10)}}>{s.label}</Mono>
    <div style={{position: 'absolute', left: 160, top: 1110, width: 700, height: 14, borderRadius: 7, background: '#26262B'}}>
      <div style={{width: `${p * 100}%`, height: 14, borderRadius: 7, background: K.lime, boxShadow: '0 0 24px rgba(205,242,79,0.6)'}} /></div>
    {s.ends && <div style={{position: 'absolute', left: 160, top: 1150, width: 700, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 32, color: '#C9C9C4', opacity: expo(f - c - 10, 10)}}>
      <span>{s.ends[0]}</span><span style={{color: K.lime}}>{s.ends[1]}</span></div>}
  </>);
};
// warn: {icon, big, flipWord, text, box?, tag?, tagWord?, tagRed?}  blob with an icon that flips to the number, red tag.
const Warn = ({f, s, B0, w}) => {
  const p = pop(f, B0 + 2, {w: 0.4, z: 0.55}); const flip = w(s.flipWord, 16) - 6; const fl = clamp01((f - flip) / 8); const sx = Math.abs(Math.cos(fl * Math.PI)); const after = fl > 0.5;
  const sh = f > flip + 6 && f < flip + 16 ? Math.sin((f - flip - 6) * 2.4) * 12 * (1 - (f - flip - 6) / 10) : 0;
  const words = String(s.text).split(' '); const len = String(s.big).length; const bs = len <= 4 ? 132 : len <= 6 ? 104 : 76;
  return (<>
    {after && [0, 1].map((k) => { const t = ((f - flip + k * 14) % 28) / 28; return <div key={k} style={{position: 'absolute', left: CX - 190 * (1 + t * 0.8), top: 600 - 190 * (1 + t * 0.8), width: 380 * (1 + t * 0.8), height: 380 * (1 + t * 0.8), borderRadius: '50%', border: `6px solid ${K.lime}`, opacity: (1 - t) * 0.7}} />; })}
    <Blob x={CX + sh} y={600} w={380 * p} h={380 * p} r={200}>
      <div style={{transform: `scaleX(${sx})`}}>
        {!after ? <Icon name={s.icon} size={150} /> : <div style={{fontFamily: FONT, fontWeight: 900, fontSize: bs, letterSpacing: -bs * 0.05, color: K.ink, whiteSpace: 'nowrap'}}>{s.big}</div>}
      </div>
    </Blob>
    <div style={{position: 'absolute', left: 80, width: 860, top: 850}}>
      <BlurIn f={f} ats={words.map((x, i) => w(x, 2 + i * 3) - 3)} text={s.text} size={words.length > 5 ? 80 : 100} color="#fff" box={s.box} /></div>
    {s.tag && (() => { const q = pop(f, w(s.tagWord, 30) - 4, {w: 0.5, z: 0.5}); return (
      <div style={{position: 'absolute', left: CX, top: 1160, transform: `translate(-50%, 0) scale(${q}) rotate(-3deg)`}}>
        <Tag size={48} style={s.tagRed === false ? {background: K.lime} : {background: K.red, color: '#fff'}}>{s.tag}</Tag></div>); })()}
  </>);
};
// steps: {title, box?, steps: [[word, text]]}  rows sharpen and tick as they are said.
const Steps = ({f, s, B0, w}) => {
  const st = s.steps || []; const gap = st.length > 4 ? 140 : 170;
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 280}}><BlurIn f={f} at={B0 + 3} text={s.title} size={tsize(s.title)} box={s.box} /></div>
    {st.map(([word, t], i) => { const a = w(word, 8 + i * 14) - 4; const on = expo(f - a, 10); const enter = pop(f, B0 + 4 + i * 3, {w: 0.4, z: 0.7});
      return (<div key={i} style={{position: 'absolute', left: 100, top: ttop(s.title) + i * gap, width: 820, height: gap - 32, borderRadius: 30, background: K.paper, boxShadow: `0 ${10 + on * 16}px ${24 + on * 30}px rgba(0,0,0,${0.08 + on * 0.08})`,
        transform: `translateX(${(1 - enter) * 600 + (1 - on) * 30}px) scale(${mix(0.96, 1, on)})`, filter: `blur(${(1 - on) * 3.5}px)`, opacity: clamp01(enter * 2) * mix(0.45, 1, on), display: 'flex', alignItems: 'center', gap: 28, padding: '0 30px'}}>
        <div style={{width: 76, height: 76, borderRadius: 20, background: on > 0.5 ? K.ink : '#D6D5CE', color: on > 0.5 ? K.lime : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 30}}>{`0${i + 1}`}</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: -1.5, color: K.ink, flex: 1}}>{t}</div>
        <div style={{width: 60, height: 60, borderRadius: 30, background: K.lime, transform: `scale(${pop(f, a + 6, {w: 0.55, z: 0.5})})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12.5 L10 17 L19 7" stroke={K.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
      </div>); })}
  </>);
};
// comment: {keyword}  ending 1: the keyword is typed into a comment box, "$0 / Free guide".
const Comment = ({f, s, B0, w}) => {
  const kw = String(s.keyword || 'GUIDE').toUpperCase(); const t = w(kw, 4) - 6; const typed = kw.slice(0, typedCount(f, t, kw.length, 4, 0.8));
  const card = pop(f, B0 + 2, {w: 0.35, z: 0.7}); const fr = w('free', 20) - 4;
  return (<>
    <div style={{position: 'absolute', left: 110, top: 330, width: 800, height: 300, borderRadius: 40, background: K.paper, boxShadow: '0 30px 70px rgba(60,80,0,0.25)', transform: `translateY(${(1 - card) * 400}px) rotate(${(1 - card) * -6}deg)`, filter: `blur(${(1 - clamp01(card)) * 10}px)`}}>
      <div style={{position: 'absolute', left: 40, top: 40, width: 90, height: 90, borderRadius: 45, background: K.ink, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48}}>?</div>
      <div style={{position: 'absolute', left: 156, top: 44, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: K.mut}}>Add a comment</div>
      <div style={{position: 'absolute', left: 154, top: 92, fontFamily: FONT, fontWeight: 900, fontSize: kw.length > 6 ? 96 : 120, letterSpacing: -4, color: K.ink, lineHeight: 1}}>{typed}<span style={{opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: K.lo}}>|</span></div>
    </div>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 690, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 300, letterSpacing: -16, color: K.ink, lineHeight: 1,
      transform: `scale(${mix(1.5, 1, pop(f, fr))})`, opacity: clamp01(pop(f, fr) * 2), filter: `blur(${(1 - clamp01(expo(f - fr, 10))) * 16}px)`, textShadow: '0 30px 50px rgba(60,80,0,0.35)'}}>$0</div>
    <div style={{position: 'absolute', left: CX, top: 1040, transform: `translate(-50%, 0) scale(${pop(f, w('guide', 24) - 2)})`}}><Tag dark size={50}>Free guide</Tag></div>
    <div style={{position: 'absolute', left: CX, top: 1150, transform: `translate(-50%, 0) scale(${pop(f, w('get', 30) - 2)})`}}><Tag size={42}>or subcreatorpaid.com</Tag></div>
  </>);
};
// site: {}  ending 2: type the address, the real home page (a_home.png), click into the AI finder (a_finder.png). Needs show.images.
const Site = ({f, B0, E0}) => {
  const t0 = B0 + 2; const url = 'subcreatorpaid.com/links'; const n = typedCount(f, t0, url.length, 9, 1.8); const page = pop(f, t0 + 16, {w: 0.32, z: 0.75});
  const click = Math.min(E0 - 20, t0 + 44); const swap = expo(f - click - 3, 10);
  return (<>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 270, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, transform: `scale(${pop(f, B0, {w: 0.45, z: 0.6})})`}}>
      <div style={{width: 64, height: 64, borderRadius: 16, background: K.ink, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 42}}>S</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: -2, color: K.ink}}>sub-creator paid</div></div>
    <div style={{position: 'absolute', left: 110, top: 380, width: 800, height: 830, borderRadius: 40, background: '#F2F1EC', boxShadow: '0 40px 90px rgba(60,80,0,0.3)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 24, right: 24, top: 22, height: 84, borderRadius: 42, background: '#E2E1DA', display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: K.ink, letterSpacing: -1}}>
        {url.slice(0, n)}<span style={{opacity: n < url.length || Math.floor(f / 8) % 2 ? 1 : 0, marginLeft: 2, fontWeight: 400}}>|</span></div>
      <div style={{position: 'absolute', left: 0, top: 124, width: 800, height: 706, overflow: 'hidden', transform: `translateY(${(1 - page) * 300}px)`, opacity: clamp01(page * 2), filter: `blur(${(1 - clamp01(page)) * 12}px)`}}>
        <img src={staticFile('a_home.png')} style={{position: 'absolute', left: 0, top: -20 - swap * 40, width: 800, opacity: 1 - swap, filter: `blur(${swap * 10}px)`}} />
        <img src={staticFile('a_finder.png')} style={{position: 'absolute', left: 0, top: (1 - swap) * 200, width: 800, opacity: swap}} />
      </div>
    </div>
    <Arrow f={f} track={[[t0 + 24, 900, 1300], [click - 2, 420, 900], [E0 + 4, 420, 900]]} clicks={[click]} />
    <div style={{position: 'absolute', left: CX, top: 1226, transform: `translate(-50%, 0) scale(${pop(f, click + 4, {w: 0.5, z: 0.5})})`}}><Tag dark size={36}>Free AI Income Finder</Tag></div>
  </>);
};
// tool: {brand, name, desc, line}  ending 3: the affiliate tool card, always labelled "Affiliate link".
const Tool = ({f, s, B0, w}) => {
  const c = pop(f, w('tool', 6) - 6, {w: 0.35, z: 0.65});
  return (<>
    <div style={{position: 'absolute', left: 80, width: 860, top: 290}}><BlurIn f={f} at={B0 + 2} text="The tool I'd start with" size={96} box={[1]} /></div>
    <div style={{position: 'absolute', left: 160, top: 560, width: 700, height: 470, borderRadius: 44, background: K.paper, boxShadow: '0 40px 90px rgba(0,0,0,0.16)', transform: `translateY(${(1 - c) * 500}px) rotate(${(1 - c) * 8}deg)`, filter: `blur(${(1 - clamp01(c)) * 10}px)`}}>
      <div style={{position: 'absolute', left: 50, top: 50}}><LogoTile name={s.brand} size={170} f={f} /></div>
      <div style={{position: 'absolute', left: 250, top: 70, fontFamily: FONT, fontWeight: 900, fontSize: String(s.name).length > 8 ? 66 : 84, letterSpacing: -3, color: K.ink}}>{s.name}</div>
      <div style={{position: 'absolute', left: 252, top: 168, fontFamily: FONT, fontWeight: 700, fontSize: 32, color: K.mut}}>{s.desc}</div>
      <div style={{position: 'absolute', left: 50, right: 50, top: 268, fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: -1, color: K.ink, lineHeight: 1.15}}>{s.line}</div>
      <div style={{position: 'absolute', left: 50, top: 382}}><Tag dark size={30}><span style={{color: K.lime}}>●</span> Affiliate link</Tag></div>
    </div>
    <div style={{position: 'absolute', left: CX, top: 1110, transform: `translate(-50%, 0) scale(${pop(f, w('linked', 30) - 3, {w: 0.5, z: 0.5})})`}}><Tag size={52} style={{background: K.lime}}>Link in bio ↑</Tag></div>
  </>);
};
// follow: {line?}  ending 4.
const Follow = ({f, s, B0, E0, w}) => {
  const m = pop(f, B0 + 2, {w: 0.42, z: 0.55}); const fo = w('follow', 2) + 6; const done = f > fo + 3;
  return (<>
    <Blob x={CX} y={600} w={260 * m} h={260 * m} r={70} style={{background: K.ink, boxShadow: '0 40px 80px rgba(60,80,0,0.4)'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170 * m, color: K.lime}}>S</div></Blob>
    <div style={{position: 'absolute', left: 0, width: 1020, top: 770}}><BlurIn f={f} at={B0 + 6} text="@subcreatorpaid" size={76} /></div>
    <div style={{position: 'absolute', left: CX - 230, top: 900, width: 460, height: 120, borderRadius: 60, background: done ? K.paper : K.ink, color: done ? K.ink : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      fontFamily: FONT, fontWeight: 900, fontSize: 52, transform: `scale(${pop(f, B0 + 8) * (f >= fo && f < fo + 4 ? 0.92 : 1)})`, boxShadow: '0 24px 50px rgba(0,0,0,0.2)'}}>{done ? 'Following ✓' : 'Follow'}</div>
    <Glow f={f} track={[[fo - 16, 860, 1300], [fo, CX + 175, 985], [E0 + 10, CX + 175, 985]]} clicks={[fo]} />
    <div style={{position: 'absolute', left: 80, width: 860, top: 1090}}><BlurIn f={f} at={fo + 6} text={s.line || '1 verified stream a week'} size={58} weight={800} /></div>
  </>);
};
const KINDS = {hook: Hook, title: Title, catch: Catch, card: Card, stack: Stack, counter: Counter, warn: Warn, steps: Steps, comment: Comment, site: Site, tool: Tool, follow: Follow};

export const FluidKit = ({beats = []}) => {
  const f = useCurrentFrame(); const nb = beats.length; const chunks = useChunks(beats);
  const B = (i) => (beats[i] ? beats[i].from : 0);
  const E = (i) => (beats[i + 1] ? beats[i + 1].from : (beats[i] ? beats[i].from + beats[i].frames : 0));
  const W = (i) => (word, fb = 0) => {
    const b = beats[i]; if (!b) return 0; const base = (b.speakFrom ?? b.from) + fb;
    if (!word) return base; const ws = b.words || []; const k = clean(word);
    const hit = ws.find((x) => clean(x.w) === k) || ws.find((x) => clean(x.w).startsWith(k)); return hit ? hit.f : base;
  };
  const show = (i) => (beats[i] && beats[i].show) || {};
  const kind = (i) => show(i).scene || 'hook';
  const bgOf = (i) => show(i).bg || DEF_BG[kind(i)] || 'light';
  // transition into scene i: spec `tr`, else cycle so two in a row never match
  const trs = []; for (let i = 0; i < nb; i++) { let t = show(i).tr || TRS[i % TRS.length]; if (i > 0 && t === trs[i - 1]) t = TRS[(i + 1) % TRS.length]; trs.push(t); }
  const T = (i) => B(i) - 3;
  const layer = (i) => {
    const S = KINDS[kind(i)]; if (!S) return null;
    const a = i > 0 ? T(i) - TW : -1, b = i < nb - 1 ? T(i + 1) + TW : 1e9; if (f < a || f > b) return null;
    const tin = i > 0 ? trs[i] : 'cut', tout = i < nb - 1 ? trs[i + 1] : 'cut';
    const ein = i > 0 ? inOut(f - (T(i) - TW), 2 * TW) : 1; const eout = i < nb - 1 ? inOut(f - (T(i + 1) - TW), 2 * TW) : 0;
    let tf = '', op = 1, blur = 0, mbx = 0, mby = 0, clip;
    if (ein < 1) {
      if (tin === 'cut') { if (f < T(i)) return null; }
      else if (tin === 'whipX') { tf += `translateX(${(1 - ein) * 1080}px)`; mbx = Math.sin(Math.PI * ein) * 60; }
      else if (tin === 'whipY') { tf += `translateY(${(1 - ein) * 1920}px)`; mby = Math.sin(Math.PI * ein) * 70; }
      else if (tin === 'push') { tf += `translateY(${(1 - ein) * 1920}px)`; mby = Math.sin(Math.PI * ein) * 30; }
      else if (tin === 'zoom') { tf += `scale(${mix(0.7, 1, ein)})`; op = ein; blur = (1 - ein) * 20; }
      else if (tin === 'soft') { tf += `scale(${mix(0.94, 1, ein)})`; op = ein; blur = (1 - ein) * 18; }
      else if (tin === 'iris') { clip = `circle(${ein * 2300}px at ${CX}px 900px)`; }
    }
    if (eout > 0) {
      if (tout === 'cut') { if (f >= T(i + 1)) return null; }
      else if (tout === 'whipX') { tf += ` translateX(${-eout * 1080}px)`; mbx = Math.sin(Math.PI * eout) * 60; }
      else if (tout === 'whipY') { tf += ` translateY(${-eout * 1920}px)`; mby = Math.sin(Math.PI * eout) * 70; }
      else if (tout === 'push') { tf += ` translateY(${-eout * 1920}px)`; mby = Math.sin(Math.PI * eout) * 30; }
      else if (tout === 'zoom') { tf += ` scale(${mix(1, 2.4, eout)})`; op = 1 - eout; blur = eout * 24; }
      else if (tout === 'soft') { tf += ` scale(${mix(1, 1.08, eout)})`; op = 1 - eout; blur = eout * 18; }
      else if (tout === 'iris') { if (eout >= 1) return null; }
    }
    return (
      <div key={i} style={{position: 'absolute', inset: 0, background: BG[bgOf(i)], transform: tf, transformOrigin: '510px 860px', opacity: op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, clipPath: clip, overflow: 'hidden', zIndex: i}}>
        <MB id={`K${i}`} x={mbx} y={mby}><S f={f} s={show(i)} B0={B(i)} E0={E(i)} w={W(i)} /></MB>
      </div>
    );
  };
  const beat = (() => { for (let i = nb - 1; i >= 0; i--) if (f >= T(i)) return i; return 0; })();
  const tone = bgOf(beat);
  return (
    <AbsoluteFill style={{background: BG[bgOf(0)], overflow: 'hidden', fontFamily: FONT}}>
      {beats.map((_, i) => layer(i))}
      <div style={{position: 'absolute', left: 0, width: 1020, top: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, zIndex: 50}}>
        <div style={{width: 58, height: 58, borderRadius: 16, background: tone === 'dark' ? K.lime : K.ink, color: tone === 'dark' ? K.ink : K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38}}>S</div>
        <div style={{fontWeight: 800, fontSize: 42, letterSpacing: -1, color: tone === 'dark' ? '#fff' : K.ink}}>@subcreatorpaid</div>
      </div>
      <Caption f={f} chunks={chunks} tone={tone} />
    </AbsoluteFill>
  );
};
