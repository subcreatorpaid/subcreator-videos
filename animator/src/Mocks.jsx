// 5 new style mocks (owner ask, 29 Oct 2026: "change the style of the video entirely, give me 5 different mocks").
// Same 4 voiced beats of video 009 (hook, UGC rates, Amazon maths, the catch) in 5 completely different looks, so the
// owner can pick one. Composition "Mock", prop n = 1..5. Beats come from prep.py (voice + word timings) like Story.
//   1 Midnight Glass   2 Paper Collage   3 Swiss Kinetic Type   4 Isometric Blocks   5 Phone Native
// Kept from the brand in every mock: green only for money, red for loss, real logos, no emojis, the handle at the bottom.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing, staticFile, Audio} from 'remotion';
import {FONT, Fonts} from './Short';
import {ease, pop, Logo, Face} from './graphics';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const lerp = (f, a, b, x, y) => interpolate(f, [a, Math.max(b, a + 1)], [x, y], clamp);
const clean = (s) => String(s).replace(/[^\w$%.'-]/g, '').replace(/\.$/, '').toLowerCase();
const count = (f, at, to, d = 22, dec = 0) => {
  const v = interpolate(f - at, [0, d], [0, to], {...clamp, easing: Easing.out(Easing.cubic)});
  return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
};
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';
const SERIF = '"DejaVu Serif", Georgia, serif';
const OV = 10;

// ---------- shared: word timing and captions
const useW = (b, start) => (k) => {
  const ws = b.words || [];
  const hit = ws.find((x) => clean(x.w) === clean(k)) || ws.find((x) => clean(x.w).startsWith(clean(k)));
  return (hit ? hit.f : b.speakFrom || b.from) - start;
};
const chunkWords = (beats) => {
  const all = []; beats.forEach((b, bi) => (b.words || []).forEach((w) => all.push({...w, bi})));
  const out = []; let cur = [];
  all.forEach((w, i) => {
    const p = all[i - 1];
    if (cur.length && (cur.length >= 4 || (cur.length >= 2 && /[.,:;?!]$/.test(p.w)) || w.bi !== p.bi || w.f - p.f > 14)) { out.push(cur); cur = []; }
    if (/\w/.test(w.w)) cur.push(w); else if (cur.length) cur[cur.length - 1] = {...cur[cur.length - 1], w: cur[cur.length - 1].w + w.w};
  });
  if (cur.length) out.push(cur);
  return out;
};
const MONEY = /^\$|%$/; const LOSS = ['zero', 'catch', 'slow', 'nobody'];
const Caps = ({beats, top = 1400, size = 62, ink = '#151515', money = '#2E7D4F', loss = '#D93A3A', font = FONT, weight = 900, bg = null, upper = false}) => {
  const f = useCurrentFrame();
  const chunks = React.useMemo(() => chunkWords(beats), [beats]);
  let ci = -1; chunks.forEach((c, i) => { if (f >= c[0].f - 2) ci = i; });
  if (ci < 0) return null;
  const ch = chunks[ci]; const k = ease(f - ch[0].f + 2, 5);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 12}px)`}}>
      <span style={{fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 1.15, color: ink, background: bg || 'transparent', padding: bg ? '6px 22px' : 0, borderRadius: 18, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
        {ch.map((w, i) => {
          const t = String(w.w).replace(/\*/g, ''); const c = clean(t);
          const col = MONEY.test(c) ? money : LOSS.includes(c) ? loss : ink;
          return <span key={i} style={{color: col, opacity: f >= w.f - 2 ? 1 : 0.35}}>{upper ? t.toUpperCase() : t} </span>;
        })}
      </span>
    </div>
  );
};
const HandleTag = ({color = '#151515', top = 1590, font = FONT}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: font, fontWeight: 700, fontSize: 32, color, opacity: 0.6}}>@subcreatorpaid</div>
);

// Plays the 4 scenes of a mock with overlapping transitions (no blank frames).
const Track = ({beats, total, scenes, trans = 'fade'}) => beats.map((b, i) => {
  const start = Math.max(0, b.from - (i ? OV : 0));
  const end = i + 1 < beats.length ? beats[i + 1].from + 2 : total;
  const len = Math.max(1, end - start); const S = scenes[i] || scenes[scenes.length - 1];
  return (
    <Sequence key={i} from={start} durationInFrames={len}>
      <SceneWrap b={b} i={i} start={start} len={len} last={i === beats.length - 1} S={S} trans={trans} />
    </Sequence>
  );
});
const SceneWrap = ({b, i, start, len, last, S, trans}) => {
  const f = useCurrentFrame(); const w = useW(b, start);
  const inn = i === 0 ? 1 : ease(f, OV); const out = last ? 0 : ease(f - (len - OV), OV);
  const T = {
    fade: {opacity: inn * (1 - out), transform: `scale(${1.04 - 0.04 * inn + 0.04 * out})`, filter: `blur(${(1 - inn + out) * 10}px)`},
    slide: {transform: `translateX(${(1 - inn) * 1080 - out * 1080}px)`},
    up: {transform: `translateY(${(1 - inn) * 1920 - out * 1920}px)`},
    cut: {opacity: f < len - 2 || last ? 1 : 0},
  }[trans];
  return <AbsoluteFill style={T}><S f={f} w={w} s={b.show} len={len} /></AbsoluteFill>;
};

// =====================================================================================================================
// 1. MIDNIGHT GLASS: near-black stage, spotlight, frosted glass cards, neon green money / red loss, big rings.
const G = {bg: '#0A0C0F', ink: '#F4F4F2', mut: '#8C9099', green: '#38D27A', red: '#FF5A5F', glass: 'rgba(255,255,255,0.06)', edge: 'rgba(255,255,255,0.14)'};
const Glass = ({children, style = {}, tint}) => (
  <div style={{background: `linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))`, border: `2px solid ${G.edge}`, borderRadius: 44, boxShadow: `0 30px 90px rgba(0,0,0,0.55)${tint ? `, 0 0 90px ${tint}` : ''}`, color: G.ink, fontFamily: FONT, ...style}}>{children}</div>
);
const Ring = ({p, size = 520, color, track = 'rgba(255,255,255,0.08)', width = 26}) => {
  const r = size / 2 - width; const L = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{position: 'absolute', left: 0, top: 0, transform: 'rotate(-90deg)'}}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={width} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} style={{filter: `drop-shadow(0 0 18px ${color})`}} />
    </svg>
  );
};
const G1 = ({f, w}) => {
  const drain = lerp(f, 4, w('zero') + 10, 0.9, 0.02);
  return (<>
    <div style={{position: 'absolute', left: 280, top: 300, width: 520, height: 520}}>
      <Ring p={drain} color={G.red} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
        <div style={{fontWeight: 900, fontSize: 230, color: G.ink, lineHeight: 1, textShadow: `0 0 50px rgba(255,90,95,0.5)`}}>{Math.round(drain * 1000)}</div>
        <div style={{fontWeight: 700, fontSize: 40, color: G.mut, letterSpacing: 6}}>FOLLOWERS</div>
      </div>
    </div>
    {[['five', '5 income streams', null], ['catch', '+ the catch', G.red]].map(([k, t, c], i) => {
      const p = ease(f - w(k) + 7, 12);
      return (
        <Glass key={k} tint={c ? 'rgba(255,90,95,0.25)' : 'rgba(56,210,122,0.15)'} style={{position: 'absolute', left: 150, right: 150, top: 930 + i * 190, padding: '34px 46px', fontWeight: 800, fontSize: 56, textAlign: 'center',
          opacity: p, transform: `perspective(1400px) translateX(${(i ? 1 : -1) * (1 - p) * 500}px) rotateY(${(i ? -1 : 1) * (1 - p) * 30}deg)`, color: c || G.ink}}>{t}</Glass>
      );
    })}
  </>);
};
const G2 = ({f, w, s}) => (<>
  <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: G.mut, letterSpacing: 4, opacity: ease(f, 10)}}>UGC · BEGINNER RATES</div>
  {[['$50', 50, 0], ['$400', 400, 1]].map(([k, v, i]) => {
    const p = ease(f - w(k) + 7, 14); const hot = i === 1 && f > w(k) + 6;
    return (
      <Glass key={k} tint={hot ? 'rgba(56,210,122,0.35)' : null} style={{position: 'absolute', left: i ? 560 : 100, top: i ? 470 : 560, width: 420, height: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: p, transform: `perspective(1600px) rotateY(${(i ? -14 : 14) * (1 - p) + (i ? -6 : 6)}deg) translateY(${(1 - p) * 120}px)`, borderColor: hot ? 'rgba(56,210,122,0.6)' : G.edge}}>
        <div style={{fontWeight: 900, fontSize: 150, color: hot ? G.green : G.ink, textShadow: hot ? `0 0 40px rgba(56,210,122,0.6)` : 'none'}}>${count(f, w(k) - 4, v, 18)}</div>
        <div style={{fontWeight: 700, fontSize: 38, color: G.mut}}>per video</div>
      </Glass>
    );
  })}
  <div style={{position: 'absolute', right: 80, top: 1130, fontFamily: MONO, fontSize: 26, color: G.mut, opacity: ease(f - 20, 10)}}>source: {s.source}</div>
</>);
const G3 = ({f, w}) => {
  const rows = [['$40', 'Item price', '$40'], ['percent', 'Commission', '× 4.5%']];
  const r = ease(f - w('$1.80') + 7, 12);
  return (<>
    <Glass style={{position: 'absolute', left: 110, right: 110, top: 300, padding: '50px 56px', opacity: ease(f, 10)}}>
      <div style={{fontWeight: 800, fontSize: 46, marginBottom: 30}}>Amazon Associates</div>
      {rows.map(([k, l, v], i) => (
        <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '26px 0', borderTop: `2px solid ${G.edge}`, opacity: 0.25 + 0.75 * ease(f - w(k) + 7, 10), fontSize: 50}}>
          <span style={{fontWeight: 600, color: G.mut}}>{l}</span><span style={{fontWeight: 900}}>{v}</span>
        </div>
      ))}
      <div style={{marginTop: 26, padding: '34px 40px', borderRadius: 30, background: `rgba(56,210,122,${0.08 + 0.12 * r})`, border: `2px solid rgba(56,210,122,${0.2 + 0.5 * r})`, boxShadow: `0 0 ${90 * r}px rgba(56,210,122,0.35)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.3 + 0.7 * r}}>
        <span style={{fontWeight: 700, fontSize: 46}}>You earn</span><span style={{fontWeight: 900, fontSize: 110, color: G.green}}>${count(f, w('$1.80') - 6, 1.8, 18, 2)}</span>
      </div>
    </Glass>
  </>);
};
const G4 = ({f, w, s}) => {
  const cone = ease(f, 14);
  return (<>
    <div style={{position: 'absolute', left: 140, right: 140, top: 0, height: 1300, background: `radial-gradient(50% 60% at 50% 0%, rgba(255,90,95,${0.28 * cone}), transparent 70%)`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: G.red, letterSpacing: -3, textShadow: '0 0 60px rgba(255,90,95,0.55)', opacity: ease(f - 2, 10), transform: `scale(${1.25 - 0.25 * ease(f - 2, 12)})`}}>THE CATCH</div>
    {(s.items || []).map(([k, t], i) => {
      const p = ease(f - w(k) + 7, 12);
      return (
        <Glass key={k} tint="rgba(255,90,95,0.18)" style={{position: 'absolute', left: 160, right: 160, top: 640 + i * 200, padding: '36px 46px', display: 'flex', gap: 30, alignItems: 'center', fontWeight: 800, fontSize: 54, opacity: p, transform: `translateX(${(i % 2 ? 1 : -1) * (1 - p) * 400}px)`}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: G.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#fff'}}>✕</div>{t}
        </Glass>
      );
    })}
  </>);
};
const Mock1 = ({beats, total}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: G.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 50% 18%, rgba(120,140,170,0.20), transparent 70%)'}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 2px, transparent 2px)', backgroundSize: '44px 44px', WebkitMaskImage: 'radial-gradient(60% 50% at 50% 45%, #000, transparent)', transform: `translateY(${-f * 0.3}px)`}} />
      <Track beats={beats} total={total} scenes={[G1, G2, G3, G4]} trans="fade" />
      <Caps beats={beats} ink={G.ink} money={G.green} loss={G.red} top={1390} />
      <HandleTag color={G.ink} />
    </AbsoluteFill>
  );
};

// =====================================================================================================================
// 2. PAPER COLLAGE: kraft paper, torn notes, tape, marker circles drawn on, price tags on string, a receipt, a stamp.
const P = {bg: '#E8DCC4', paper: '#FBF7EE', ink: '#1C1A17', green: '#2E7D4F', red: '#C8372D', tape: 'rgba(240,226,170,0.85)'};
const torn = 'polygon(0% 3%, 8% 0%, 17% 2%, 26% 0%, 37% 3%, 49% 1%, 61% 3%, 72% 0%, 84% 2%, 93% 0%, 100% 3%, 99% 97%, 90% 100%, 79% 98%, 68% 100%, 55% 97%, 43% 100%, 31% 98%, 19% 100%, 9% 97%, 0% 100%)';
const Tape = ({style}) => <div style={{position: 'absolute', width: 170, height: 52, background: P.tape, boxShadow: '0 2px 6px rgba(0,0,0,0.08)', ...style}} />;
const Note = ({children, style = {}, rot = 0, bg = P.paper}) => (
  <div style={{position: 'absolute', transform: `rotate(${rot}deg)`, ...style}}>
    <div style={{background: bg, clipPath: torn, padding: '40px 50px', fontFamily: FONT, color: P.ink, filter: 'drop-shadow(0 14px 18px rgba(60,40,10,0.18))'}}>{children}</div>
  </div>
);
const Marker = ({p, w = 420, h = 200, color = P.red, style = {}}) => (
  <svg width={w} height={h} viewBox="0 0 420 200" style={{position: 'absolute', overflow: 'visible', ...style}}>
    <path d="M60 110 C 40 30, 330 10, 380 80 C 420 150, 200 200, 90 170 C 30 150, 30 80, 120 50" stroke={color} strokeWidth="11" fill="none" strokeLinecap="round" strokeDasharray="1400" strokeDashoffset={1400 * (1 - p)} />
  </svg>
);
const P1 = ({f, w}) => (<>
  <Note rot={-4} style={{left: 140, top: 280, opacity: ease(f, 6), transform: `rotate(-4deg) scale(${pop(f, 10)})`}}>
    <div style={{fontWeight: 900, fontSize: 260, lineHeight: 0.9, color: P.red}}>0</div>
    <div style={{fontWeight: 800, fontSize: 64}}>followers</div>
  </Note>
  <Tape style={{left: 230, top: 262, transform: 'rotate(-10deg)'}} />
  <Marker p={ease(f - w('zero') + 2, 14)} style={{left: 110, top: 280, transform: 'scale(1.1)'}} />
  {[['five', '5 streams', 700, 5], ['catch', '+ the catch', 1000, -6]].map(([k, t, top, r]) => (
    <div key={k} style={{position: 'absolute', left: r > 0 ? 460 : 200, top, transform: `rotate(${r}deg) scale(${pop(f - w(k) + 7, 10)})`, opacity: ease(f - w(k) + 7, 4)}}>
      <div style={{background: r > 0 ? '#F5E27A' : '#F7C9C0', padding: '40px 50px', width: 420, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: P.ink, boxShadow: '0 16px 22px rgba(60,40,10,0.18)'}}>{t}</div>
      <div style={{position: 'absolute', left: 200, top: -18, width: 34, height: 34, borderRadius: 17, background: P.red, boxShadow: '0 4px 6px rgba(0,0,0,0.3)'}} />
    </div>
  ))}
</>);
const Tag = ({p, price, hot, x, top, swing}) => (
  <div style={{position: 'absolute', left: x, top: 0, width: 360, height: top + 420, transformOrigin: '180px 0', transform: `rotate(${swing}deg)`, opacity: p}}>
    <div style={{position: 'absolute', left: 178, top: 0, width: 4, height: top + 10, background: '#7A6A50'}} />
    <div style={{position: 'absolute', left: 0, top, width: 360, height: 400, background: P.paper, clipPath: 'polygon(50% 0%, 100% 18%, 100% 100%, 0% 100%, 0% 18%)', filter: 'drop-shadow(0 14px 16px rgba(60,40,10,0.2))',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT}}>
      <div style={{width: 34, height: 34, borderRadius: 17, border: '6px solid #7A6A50', marginBottom: 30}} />
      <div style={{fontWeight: 900, fontSize: 120, color: hot ? P.green : P.ink}}>{price}</div>
      <div style={{fontWeight: 700, fontSize: 36, color: '#6B6255'}}>per video</div>
    </div>
  </div>
);
const P2 = ({f, w}) => (<>
  <Note rot={2} style={{left: 160, top: 1080}}><div style={{fontWeight: 900, fontSize: 52}}>UGC · beginner rates</div></Note>
  <Tag p={ease(f - w('$50') + 7, 10)} price="$50" x={110} top={330} swing={Math.sin((f - w('$50')) / 9) * 4 * Math.exp(-Math.max(0, f - w('$50')) / 40)} />
  <Tag p={ease(f - w('$400') + 7, 10)} price="$400" hot x={600} top={420} swing={Math.sin((f - w('$400')) / 9) * 5 * Math.exp(-Math.max(0, f - w('$400')) / 40)} />
  <Marker color={P.green} p={ease(f - w('$400') - 4, 14)} style={{left: 560, top: 640, transform: 'scale(1.05)'}} />
</>);
const P3 = ({f, w}) => {
  const roll = ease(f, 18);
  const lines = [['$40', 'ITEM PRICE', '$40.00'], ['percent', 'COMMISSION', 'x 4.5%']];
  return (
    <div style={{position: 'absolute', left: 190, top: 160, width: 700, height: 1150 * roll, overflow: 'hidden', transform: 'rotate(-2deg)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1150, background: '#FFFDF7', clipPath: 'polygon(0 0, 100% 0, 100% 97%, 95% 100%, 90% 97%, 85% 100%, 80% 97%, 75% 100%, 70% 97%, 65% 100%, 60% 97%, 55% 100%, 50% 97%, 45% 100%, 40% 97%, 35% 100%, 30% 97%, 25% 100%, 20% 97%, 15% 100%, 10% 97%, 5% 100%, 0 97%)',
        padding: '70px 60px', fontFamily: MONO, color: P.ink}}>
        <div style={{textAlign: 'center', fontSize: 44, fontWeight: 700}}>AMAZON ASSOCIATES</div>
        <div style={{textAlign: 'center', fontSize: 28, color: '#7B7466', marginTop: 8}}>receipt · one sale</div>
        <div style={{borderTop: '4px dashed #BDB4A2', margin: '40px 0'}} />
        {lines.map(([k, l, v]) => (
          <div key={k} style={{display: 'flex', justifyContent: 'space-between', fontSize: 44, margin: '30px 0', opacity: ease(f - w(k) + 7, 8)}}><span>{l}</span><span style={{fontWeight: 700}}>{v}</span></div>
        ))}
        <div style={{borderTop: '4px dashed #BDB4A2', margin: '40px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: ease(f - w('$1.80') + 7, 8)}}>
          <span style={{fontSize: 48, fontWeight: 700}}>YOU EARN</span><span style={{fontSize: 110, fontWeight: 700, color: P.green}}>$1.80</span>
        </div>
      </div>
      <Marker color={P.green} p={ease(f - w('$1.80') - 2, 14)} style={{left: 300, top: 360, transform: 'scale(0.95)'}} />
    </div>
  );
};
const P4 = ({f, w, s}) => {
  const st = ease(f - 2, 6);
  return (<>
    <div style={{position: 'absolute', left: 120, top: 330, transform: `rotate(-9deg) scale(${2 - st})`, opacity: st, border: `14px solid ${P.red}`, borderRadius: 30, padding: '20px 50px', color: P.red, fontFamily: FONT, fontWeight: 900, fontSize: 150, letterSpacing: 4, mixBlendMode: 'multiply'}}>THE CATCH</div>
    {(s.items || []).map(([k, t], i) => (
      <Note key={k} rot={i ? 4 : -3} bg={i ? '#F7C9C0' : '#F5E27A'} style={{left: i ? 400 : 120, top: 780 + i * 260, opacity: ease(f - w(k) + 7, 4), transform: `rotate(${i ? 4 : -3}deg) scale(${pop(f - w(k) + 7, 10)})`}}>
        <div style={{fontWeight: 900, fontSize: 64}}>{t}</div>
      </Note>
    ))}
  </>);
};
const Mock2 = ({beats, total}) => (
  <AbsoluteFill style={{background: P.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(120,90,40,0.10) 1.5px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '9px 9px, 13px 13px'}} />
    <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 40%, transparent 50%, rgba(80,55,20,0.18))'}} />
    <Track beats={beats} total={total} scenes={[P1, P2, P3, P4]} trans="slide" />
    <div style={{position: 'absolute', left: 90, right: 90, top: 1380, height: 150, background: P.paper, clipPath: torn, opacity: 0.92}} />
    <Caps beats={beats} ink={P.ink} money={P.green} loss={P.red} top={1418} size={58} />
    <HandleTag color={P.ink} />
  </AbsoluteFill>
);

// =====================================================================================================================
// 3. SWISS KINETIC TYPE: white, black, one green; huge words slam in on the beat, hard rules, tiny mono labels, invert for the catch.
const K = {bg: '#FFFFFF', ink: '#0E0E0E', green: '#1F9D55', red: '#E0362C'};
const Slam = ({f, at, children, style = {}}) => {
  const p = ease(f - at + 4, 5);
  return <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, color: K.ink, letterSpacing: -6, lineHeight: 0.86, opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - p) * 60}px)`, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`, ...style}}>{children}</div>;
};
const Rule = ({f, at, top}) => <div style={{position: 'absolute', left: 60, top, height: 6, width: 960 * ease(f - at, 10), background: K.ink}} />;
const Label = ({children, top, left = 64, f, at}) => <div style={{position: 'absolute', left, top, fontFamily: MONO, fontSize: 28, color: K.ink, opacity: ease(f - at, 6)}}>{children}</div>;
const K1 = ({f, w}) => (<>
  <Label f={f} at={0} top={150}>01 / 4 — INCOME WITH NO AUDIENCE</Label>
  <Rule f={f} at={0} top={200} />
  <Slam f={f} at={0} style={{left: 40, top: 160, fontSize: 760, color: K.red}}>0</Slam>
  <Slam f={f} at={w('followers')} style={{left: 520, top: 520, fontSize: 120, lineHeight: 1}}>follow-<br />ers?</Slam>
  <Rule f={f} at={w('paid')} top={930} />
  <Slam f={f} at={w('paid')} style={{left: 56, top: 960, fontSize: 150}}>still paid.</Slam>
  <Slam f={f} at={w('five')} style={{left: 56, top: 1110, fontSize: 150}}><span style={{color: K.green}}>5</span> streams</Slam>
  <Label f={f} at={w('catch')} top={1290}>+ THE CATCH, EVERY TIME</Label>
</>);
const K2 = ({f, w}) => (<>
  <Label f={f} at={0} top={150}>02 / 4 — UGC · BEGINNER RATES</Label>
  <Rule f={f} at={0} top={200} />
  <Slam f={f} at={0} style={{left: 56, top: 230, fontSize: 210}}>UGC.</Slam>
  <Slam f={f} at={w('$50')} style={{left: 56, top: 470, fontSize: 330}}>$50</Slam>
  <Slam f={f} at={w('$50') + 4} style={{left: 640, top: 560, fontSize: 90, fontWeight: 700}}>to</Slam>
  <Rule f={f} at={w('$400')} top={790} />
  <Slam f={f} at={w('$400')} style={{left: 46, top: 830, fontSize: 330, color: K.green}}>$400</Slam>
  <Label f={f} at={w('$400') + 6} top={1210}>PER VIDEO · SOURCE: INSENSE, SEP 2026</Label>
</>);
const K3 = ({f, w}) => (<>
  <Label f={f} at={0} top={150}>03 / 4 — AMAZON ASSOCIATES</Label>
  <Rule f={f} at={0} top={200} />
  <Slam f={f} at={w('$40')} style={{left: 56, top: 240, fontSize: 280}}>$40</Slam>
  <Label f={f} at={w('$40')} top={500} left={600}>ITEM PRICE</Label>
  <Rule f={f} at={w('percent')} top={560} />
  <Slam f={f} at={w('percent')} style={{left: 56, top: 590, fontSize: 280}}>×4.5%</Slam>
  <Label f={f} at={w('percent')} top={850} left={600}>COMMISSION</Label>
  <div style={{position: 'absolute', left: 60, top: 910, height: 14, width: 960 * ease(f - w('$1.80') + 4, 8), background: K.ink}} />
  <Slam f={f} at={w('$1.80')} style={{left: 46, top: 950, fontSize: 330, color: K.green}}>$1.80</Slam>
</>);
const K4 = ({f, w, s}) => {
  const inv = ease(f - 2, 6);
  return (<>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1920 * inv, background: K.ink}} />
    <Label f={f} at={0} top={150}><span style={{color: '#fff'}}>04 / 4 — READ THIS FIRST</span></Label>
    <Slam f={f} at={2} style={{left: 56, top: 240, fontSize: 250, color: K.red}}>THE<br />CATCH</Slam>
    {(s.items || []).map(([k, t], i) => (<React.Fragment key={k}>
      <div style={{position: 'absolute', left: 60, top: 790 + i * 250, height: 6, width: 960 * ease(f - w(k), 10), background: '#fff'}} />
      <Slam f={f} at={w(k)} style={{left: 56, top: 820 + i * 250, fontSize: 150, color: '#fff'}}>{t.toLowerCase()}.</Slam>
    </React.Fragment>))}
  </>);
};
const Mock3 = ({beats, total}) => {
  const f = useCurrentFrame(); const last = beats[beats.length - 1]; const dark = f > last.from - 2;
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden'}}>
      <Track beats={beats} total={total} scenes={[K1, K2, K3, K4]} trans="cut" />
      <Caps beats={beats} ink={dark ? '#fff' : K.ink} money={K.green} loss={K.red} top={1400} size={50} font={MONO} weight={700} upper />
      <HandleTag color={dark ? '#fff' : K.ink} font={MONO} />
    </AbsoluteFill>
  );
};

// =====================================================================================================================
// 4. ISOMETRIC BLOCKS: soft mint/cream world, isometric platform, blocks and bars that grow, coins that drop.
const I = {bg1: '#E9F2EC', bg2: '#F7F3EA', ink: '#1A2421', green: '#2E7D4F', green2: '#3E9A64', red: '#D64545', top: '#FFFFFF', side1: '#DDE5E0', side2: '#C9D3CD'};
const ISO = 'rotateX(58deg) rotateZ(-45deg)';
// A box drawn in CSS 3D (top face + two sides), height h in px.
const Block = ({x, y, size = 160, h = 120, top = I.top, s1 = I.side1, s2 = I.side2, children, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: size, height: size, transformStyle: 'preserve-3d'}}>
    <div style={{position: 'absolute', inset: 0, background: top, transform: `translateZ(${h}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6}}>{children}</div>
    <div style={{position: 'absolute', left: 0, top: size, width: size, height: h, background: s1, transformOrigin: 'top', transform: 'rotateX(90deg)'}} />
    <div style={{position: 'absolute', left: size, top: 0, width: h, height: size, background: s2, transformOrigin: 'left', transform: 'rotateY(-90deg)'}} />
    {label}
  </div>
);
const Stage3D = ({children, f, y = 760}) => (
  <div style={{position: 'absolute', left: 540, top: y, width: 0, height: 0, perspective: 4000}}>
    <div style={{position: 'absolute', left: -380, top: -380, width: 760, height: 760, transformStyle: 'preserve-3d', transform: `${ISO} rotateZ(${Math.sin(f / 60) * 2}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#FFFFFF', borderRadius: 40, boxShadow: '0 0 0 14px rgba(255,255,255,0.5)', backgroundImage: 'linear-gradient(#E3EAE6 3px, transparent 3px), linear-gradient(90deg, #E3EAE6 3px, transparent 3px)', backgroundSize: '95px 95px'}} />
      {children}
    </div>
  </div>
);
const Flat = ({children, style}) => <div style={{position: 'absolute', fontFamily: FONT, color: I.ink, ...style}}>{children}</div>;
const I1 = ({f, w}) => {
  const logos = ['instagram', 'tiktok', 'youtube'];
  const z = ease(f - w('zero') + 4, 12);
  return (<>
    <Stage3D f={f} y={820}>
      {logos.map((l, i) => {
        const p = ease(f - i * 4, 14);
        return <Block key={l} x={70 + i * 230} y={80} size={170} h={30 + 60 * p}><div style={{transform: 'rotate(45deg)'}}><Logo name={l} size={96} /></div></Block>;
      })}
      <Block x={300} y={420} size={200} h={20 + 20 * z} top={I.red} s1="#B83A3A" s2="#A23333"><div style={{transform: 'rotate(45deg)', fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#fff'}}>0</div></Block>
    </Stage3D>
    <Flat style={{left: 0, right: 0, top: 210, textAlign: 'center', fontWeight: 900, fontSize: 92, opacity: ease(f, 8)}}>0 followers?</Flat>
    {[['five', '5 streams', 140], ['catch', '+ the catch', 600]].map(([k, t, x]) => (
      <Flat key={k} style={{left: x, top: 1180, background: '#fff', borderRadius: 28, padding: '22px 34px', fontWeight: 800, fontSize: 48, boxShadow: '0 18px 40px rgba(46,125,79,0.18)', transform: `scale(${pop(f - w(k) + 7, 10)})`, color: k === 'catch' ? I.red : I.ink}}>{t}</Flat>
    ))}
  </>);
};
const I2 = ({f, w}) => {
  const a = ease(f - w('$50') + 7, 16); const b = ease(f - w('$400') + 7, 18);
  return (<>
    <Flat style={{left: 0, right: 0, top: 210, textAlign: 'center', fontWeight: 900, fontSize: 84, opacity: ease(f, 8)}}>UGC: what beginners charge</Flat>
    <Stage3D f={f} y={900}>
      <Block x={150} y={300} size={170} h={20 + 70 * a} />
      <Block x={440} y={300} size={170} h={20 + 300 * b} top={I.green2} s1={I.green} s2="#25663F" />
    </Stage3D>
    <Flat style={{left: 150, top: 1080 - 60 * a, fontWeight: 900, fontSize: 90, opacity: a}}>$50</Flat>
    <Flat style={{left: 720, top: 560, fontWeight: 900, fontSize: 120, color: I.green, opacity: b}}>$400</Flat>
    <Flat style={{left: 724, top: 700, fontWeight: 700, fontSize: 36, color: '#5F6B66', opacity: b}}>per video</Flat>
  </>);
};
const I3 = ({f, w}) => {
  const drop = ease(f - w('$1.80') + 10, 14);
  return (<>
    <Flat style={{left: 0, right: 0, top: 210, textAlign: 'center', fontWeight: 900, fontSize: 84, opacity: ease(f, 8)}}>Amazon Associates</Flat>
    <Stage3D f={f} y={880}>
      <Block x={110} y={250} size={220} h={160} top="#F2E3C6" s1="#D9C39B" s2="#C8AF84"><div style={{transform: 'rotate(45deg)', fontWeight: 900, fontSize: 64, fontFamily: FONT}}>$40</div></Block>
      <Block x={440} y={250} size={190} h={30 + 40 * ease(f - w('percent') + 7, 10)} top="#fff"><div style={{transform: 'rotate(45deg)', fontWeight: 900, fontSize: 52, fontFamily: FONT}}>4.5%</div></Block>
    </Stage3D>
    <Flat style={{left: 330, top: lerp(drop, 0, 1, 380, 1110), width: 420, height: 160, borderRadius: 80, background: I.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 96,
      opacity: drop, boxShadow: '0 24px 60px rgba(46,125,79,0.4)'}}>+$1.80</Flat>
  </>);
};
const I4 = ({f, w, s}) => {
  const bar = ease(f - 4, 12);
  return (<>
    <Flat style={{left: 0, right: 0, top: 210, textAlign: 'center', fontWeight: 900, fontSize: 110, color: I.red, opacity: ease(f, 8)}}>The catch</Flat>
    <Stage3D f={f} y={860}>
      <Block x={90} y={320} size={580} h={14} top="#EDEDED" />
      <Block x={330} y={200} size={60} h={40 + 160 * bar} top={I.red} s1="#B83A3A" s2="#A23333" />
    </Stage3D>
    {(s.items || []).map(([k, t], i) => (
      <Flat key={k} style={{left: i ? 520 : 120, top: 1130 + i * 30, background: '#fff', borderRadius: 26, padding: '22px 32px', fontWeight: 800, fontSize: 46, color: I.red, boxShadow: '0 16px 40px rgba(214,69,69,0.2)', transform: `scale(${pop(f - w(k) + 7, 10)})`}}>✕ {t}</Flat>
    ))}
  </>);
};
const Mock4 = ({beats, total}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, ${I.bg1}, ${I.bg2})`, overflow: 'hidden'}}>
    <Track beats={beats} total={total} scenes={[I1, I2, I3, I4]} trans="up" />
    <Caps beats={beats} ink={I.ink} money={I.green} loss={I.red} top={1400} size={58} bg="rgba(255,255,255,0.85)" />
    <HandleTag color={I.ink} />
  </AbsoluteFill>
);

// =====================================================================================================================
// 5. PHONE NATIVE: one big phone fills the frame and the story happens in real-looking app UI: notifications, a brand DM,
// a calculator, a warning sheet. Wallpaper blur behind, captions above the phone.
const N = {wall1: '#14261D', wall2: '#2C4A3A', ink: '#111', green: '#34C759', red: '#FF3B30', mut: '#8A8A8E'};
const PhoneShell = ({children, f}) => (
  <div style={{position: 'absolute', left: 150, top: 330, width: 780, height: 1180, borderRadius: 110, background: '#0B0B0B', padding: 22, boxShadow: '0 60px 120px rgba(0,0,0,0.5)', transform: `rotate(${Math.sin(f / 50) * 0.6}deg)`}}>
    <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 90, overflow: 'hidden', background: '#F2F2F7'}}>
      <div style={{position: 'absolute', left: 290, top: 22, width: 160, height: 46, borderRadius: 23, background: '#000', zIndex: 5}} />
      {children}
    </div>
  </div>
);
const Notif = ({p, icon, app, title, body, green, red, top}) => (
  <div style={{position: 'absolute', left: 26, right: 26, top, padding: '26px 28px', borderRadius: 38, background: 'rgba(255,255,255,0.92)', boxShadow: '0 12px 30px rgba(0,0,0,0.12)', fontFamily: FONT,
    opacity: p, transform: `translateY(${(1 - p) * -80}px) scale(${0.94 + 0.06 * p})`, display: 'flex', gap: 22, alignItems: 'flex-start'}}>
    <div style={{flexShrink: 0}}>{icon}</div>
    <div style={{flex: 1}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: N.mut, fontWeight: 600}}><span>{app.toUpperCase()}</span><span>now</span></div>
      <div style={{fontSize: 34, fontWeight: 800, color: green ? '#1E7F3C' : red ? N.red : N.ink, marginTop: 4}}>{title}</div>
      <div style={{fontSize: 30, fontWeight: 500, color: '#3A3A3C', marginTop: 2}}>{body}</div>
    </div>
  </div>
);
const AppTile = ({bg, t}) => <div style={{width: 72, height: 72, borderRadius: 18, background: bg, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t}</div>;
const N1 = ({f, w}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #2D5A44, #10251B)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', color: '#fff', fontFamily: FONT, fontWeight: 300, fontSize: 150}}>9:41</div>
    <Notif top={330} p={ease(f - 2, 10)} icon={<Logo name="instagram" size={72} />} app="Instagram" title="0 new followers" body="Your reach this week: 0" red />
    <Notif top={520} p={ease(f - w('paid') + 7, 10)} icon={<AppTile bg="#2E7D4F" t="S" />} app="Sub-Creator Paid" title="5 income streams" body="No follower minimum on any of them" />
    <Notif top={710} p={ease(f - w('catch') + 7, 10)} icon={<AppTile bg="#FF3B30" t="!" />} app="Reminder" title="+ the catch" body="Read it before you start" />
  </div>
);
const Bubble = ({p, me, children, top, green}) => (
  <div style={{position: 'absolute', top, [me ? 'right' : 'left']: 30, maxWidth: 520, padding: '22px 30px', borderRadius: 40, background: me ? '#0A84FF' : '#E5E5EA', color: me ? '#fff' : N.ink, fontFamily: FONT, fontWeight: 600, fontSize: 36, lineHeight: 1.25,
    opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p})`, transformOrigin: me ? 'right bottom' : 'left bottom', boxShadow: green ? '0 0 0 4px #34C759' : 'none'}}>{children}</div>
);
const N2 = ({f, w}) => (
  <div style={{position: 'absolute', inset: 0, background: '#fff'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 210, background: '#F7F7F7', borderBottom: '2px solid #E5E5EA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18, fontFamily: FONT}}>
      <div style={{width: 76, height: 76, borderRadius: 38, background: '#C9B79C', color: '#fff', fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>GB</div>
      <div style={{fontWeight: 700, fontSize: 28, marginTop: 6}}>Glow Brand (example)</div>
    </div>
    <Bubble top={270} p={ease(f - 4, 10)}>Hi! Could you film 1 video about our serum? We'd run it as an ad.</Bubble>
    <Bubble top={490} me p={ease(f - w('beginners') + 7, 10)}>Sure. My rate for one video:</Bubble>
    <Bubble top={620} me green p={ease(f - w('$50') + 7, 10)}><span style={{fontWeight: 900, fontSize: 60}}>$50 – $400</span></Bubble>
    <div style={{position: 'absolute', left: 30, top: 790, fontFamily: FONT, fontSize: 26, color: N.mut, opacity: ease(f - w('$400') + 6, 8)}}>Typical beginner UGC rates · Insense, Sep 2026</div>
  </div>
);
const N3 = ({f, w}) => {
  const disp = f >= w('$1.80') - 4 ? '1.80' : f >= w('percent') - 4 ? '4.5%' : f >= w('$40') - 4 ? '40' : '0';
  const keys = [['C', '±', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['0', '', '.', '=']];
  const hot = disp === '1.80';
  const press = (k) => (k === '×' && f > w('percent') - 6 && f < w('percent') + 6) || (k === '=' && f > w('$1.80') - 6 && f < w('$1.80') + 6);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#000', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 40, top: 110, color: '#9A9A9A', fontSize: 30, fontWeight: 600}}>Amazon Associates · one sale</div>
      <div style={{position: 'absolute', right: 50, top: 190, color: hot ? N.green : '#fff', fontSize: 190, fontWeight: 300, textShadow: hot ? '0 0 40px rgba(52,199,89,0.6)' : 'none'}}>{hot ? '$' : ''}{disp}</div>
      {keys.map((row, r) => row.map((k, c) => k !== '' && (
        <div key={r + k} style={{position: 'absolute', left: 36 + c * 175 - (k === '0' ? 0 : 0), top: 470 + r * 170, width: k === '0' ? 330 : 150, height: 150, borderRadius: 75,
          background: press(k) ? '#fff' : c === 3 ? '#FF9F0A' : r === 0 ? '#A5A5A5' : '#333', color: press(k) ? '#FF9F0A' : r === 0 ? '#000' : '#fff', fontSize: 64, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: k === '0' ? 'flex-start' : 'center', paddingLeft: k === '0' ? 58 : 0}}>{k}</div>
      )))}
      <Notif top={40} p={ease(f - w('$1.80') - 8, 10)} icon={<AppTile bg="#FF9900" t="a" />} app="Amazon Associates" title="You earned $1.80" body="Commission on a $40 item (4.5%)" green />
    </div>
  );
};
const N4 = ({f, w, s}) => {
  const sheet = ease(f - 2, 12);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#1C1C1E'}}>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: sheet}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, borderRadius: '60px 60px 0 0', background: '#fff', transform: `translateY(${(1 - sheet) * 900}px)`, padding: '60px 50px', fontFamily: FONT}}>
        <div style={{width: 120, height: 120, borderRadius: 60, background: '#FFE5E3', color: N.red, fontWeight: 900, fontSize: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>!</div>
        <div style={{textAlign: 'center', fontWeight: 900, fontSize: 70, marginTop: 24}}>The catch</div>
        <div style={{textAlign: 'center', fontWeight: 500, fontSize: 32, color: N.mut, marginTop: 8}}>0 followers = nobody to sell to yet</div>
        {(s.items || []).map(([k, t], i) => (
          <div key={k} style={{marginTop: 30, padding: '30px 34px', borderRadius: 30, background: '#F2F2F7', fontWeight: 800, fontSize: 44, color: N.red, opacity: ease(f - w(k) + 7, 8), display: 'flex', gap: 20, alignItems: 'center'}}>
            <span style={{width: 18, height: 18, borderRadius: 9, background: N.red}} />{t}
          </div>
        ))}
      </div>
    </div>
  );
};
const Mock5 = ({beats, total}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${N.wall2}, ${N.wall1})`, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(50% 35% at 25% 20%, rgba(52,199,89,0.35), transparent 70%), radial-gradient(45% 30% at 80% 85%, rgba(255,255,255,0.15), transparent 70%)', filter: 'blur(20px)'}} />
      <PhoneShell f={f}><Track beats={beats} total={total} scenes={[N1, N2, N3, N4]} trans="slide" /></PhoneShell>
      <Caps beats={beats} ink="#fff" money="#5BE584" loss="#FF6B61" top={150} size={60} />
      <HandleTag color="#fff" top={1560} />
    </AbsoluteFill>
  );
};

const MOCKS = [Mock1, Mock2, Mock3, Mock4, Mock5];
export const Mock = ({n = 1, beats = [], total = 90}) => {
  const M = MOCKS[(n - 1) % MOCKS.length];
  return (
    <AbsoluteFill style={{fontFamily: FONT}}>
      <Fonts />
      <M beats={beats} total={total} />
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
