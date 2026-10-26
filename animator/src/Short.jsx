import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Brand tokens (brain/brand.md)
const C = {bg: '#F6F5F1', ink: '#151515', muted: '#A9A79F', acc: '#2E7D4F', accSoft: '#E3F0E7', card: '#FFFFFF', line: '#E2DFD7', gold: '#E9C46A'};
const FONT = '"InterX", Inter, Arial, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

const Fonts = () => (
  <style>{`
    @font-face{font-family:InterX;font-weight:500;src:url(${staticFile('Inter-Medium.otf')})}
    @font-face{font-family:InterX;font-weight:700;src:url(${staticFile('Inter-Bold.otf')})}
    @font-face{font-family:InterX;font-weight:800;src:url(${staticFile('Inter-ExtraBold.otf')})}
    @font-face{font-family:InterX;font-weight:900;src:url(${staticFile('Inter-Black.otf')})}
  `}</style>
);

// "*WORD* text" -> [{t, acc}]
const parse = (s = '') => {
  const out = [];
  String(s).split(/(\*[^*]+\*)/).forEach((p) => {
    if (!p) return;
    const acc = p.startsWith('*') && p.endsWith('*');
    (acc ? p.slice(1, -1) : p).split(/\s+/).filter(Boolean).forEach((w) => out.push({t: w, acc}));
  });
  return out;
};

const useSpr = (delay = 0, cfg = {damping: 14, mass: 0.7}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: cfg});
};

// Words rise in grey and darken as they are spoken; accent words are green, uppercase and bigger.
const Words = ({text, start = 0, per = 4, size = 64, weight = 800, align = 'center', accScale = 1.35, color = C.ink, maxWidth = 940}) => {
  const f = useCurrentFrame();
  const ws = parse(text);
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'left' ? 'flex-start' : 'center', alignItems: 'baseline',
      gap: `${size * 0.12}px ${size * 0.26}px`, maxWidth, margin: align === 'left' ? 0 : '0 auto', textAlign: align}}>
      {ws.map((w, i) => {
        const t = f - start - i * per;
        const k = interpolate(t, [0, 8], [0, 1], clamp);
        const dark = interpolate(t, [4, 14], [0, 1], clamp);
        const col = w.acc ? C.acc : dark > 0.5 ? color : C.muted;
        return (
          <span key={i} style={{fontFamily: FONT, fontWeight: w.acc ? 900 : weight, fontSize: w.acc ? size * accScale : size,
            textTransform: w.acc ? 'uppercase' : 'none', color: col, opacity: k, transform: `translateY(${(1 - k) * 26}px)`,
            letterSpacing: w.acc ? '-0.02em' : '-0.01em', lineHeight: 1.08}}>{w.t}</span>
        );
      })}
    </div>
  );
};

// Black box that wipes open left -> right
const HiBox = ({text, delay = 0, size = 58}) => {
  const k = useSpr(delay, {damping: 18, mass: 0.6});
  return (
    <div style={{display: 'inline-block', background: C.ink, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: size,
      padding: `${size * 0.18}px ${size * 0.42}px ${size * 0.24}px`, borderRadius: 6, boxShadow: '0 18px 36px rgba(0,0,0,.22)',
      clipPath: `inset(0 ${(1 - Math.min(1, k)) * 100}% 0 0)`}}>{String(text).replace(/\*/g, '')}</div>
  );
};

const Icon = ({kind = 'x', size = 54}) => {
  const map = {x: ['✕', C.ink, '#fff'], check: ['✓', C.acc, '#fff'], tag: ['$', C.gold, C.ink], clock: ['◷', C.ink, '#fff'],
    alert: ['!', '#A83A2C', '#fff'], coin: ['$', C.gold, C.ink], link: ['↗', C.acc, '#fff'], play: ['▶', C.ink, '#fff']};
  const [g, bg, fg] = map[kind] || map.x;
  return <div style={{width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'grid', placeItems: 'center',
    fontFamily: FONT, fontWeight: 900, fontSize: size * 0.5, flex: 'none'}}>{g}</div>;
};

const Sunburst = ({x, y, s = 160, rot = 0}) => {
  const f = useCurrentFrame();
  return (
    <svg width={s} height={s} viewBox="-50 -50 100 100" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot + f * 0.4}deg)`}}>
      <g stroke={C.acc} strokeWidth="8" strokeLinecap="round">
        {[...Array(12)].map((_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={Math.cos(a) * 9} y1={Math.sin(a) * 9} x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} />; })}
      </g><circle r="10" fill={C.acc} />
    </svg>
  );
};

const Steps = ({step, labels = []}) => {
  if (!step) return null;
  return (
    <div style={{position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
      {labels.map((l, i) => (
        <div key={i} style={{border: `3px solid ${C.ink}`, borderRadius: 10, padding: '8px 16px', fontFamily: FONT, fontWeight: 800, fontSize: 26,
          background: i + 1 === step[0] ? C.acc : i + 1 < step[0] ? C.ink : C.card, color: i + 1 <= step[0] ? '#fff' : C.ink,
          boxShadow: `4px 4px 0 ${C.ink}`}}>{String(i + 1).padStart(2, '0')} {l}</div>
      ))}
    </div>
  );
};

// ---------- beat types
const Hook = ({s, sp}) => {
  const lines = s.lines || [];
  const head = lines.length > 1 ? lines.slice(0, -1) : lines;
  const last = lines.length > 1 ? lines[lines.length - 1] : null;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 34, padding: '0 70px'}}>
      <Sunburst x={-60} y={150} s={260} /><Sunburst x={800} y={1380} s={300} rot={20} />
      {head.map((l, i) => <Words key={i} text={l} start={sp + i * 10} per={3} size={parse(l).some((w) => w.acc) ? 92 : 76} accScale={1.7} weight={800} />)}
      {last && <div style={{marginTop: 18}}><HiBox text={last} delay={sp + head.length * 10 + 14} size={64} /></div>}
    </AbsoluteFill>
  );
};

const Flow = ({s, sp, per}) => {
  const f = useCurrentFrame(); const steps = s.steps || []; const n = steps.length;
  const gap = Math.max(12, Math.round(per * 0.9));
  const ys = steps.map((_, i) => 560 + i * (780 / Math.max(1, n - 1)));
  const xs = steps.map((_, i) => (i % 2 ? 760 : 300));
  const d = ys.map((y, i) => (i ? `C ${xs[i - 1]} ${y - 220}, ${xs[i]} ${ys[i - 1] + 220}, ${xs[i]} ${y}` : `M ${xs[0]} ${y}`)).join(' ');
  const draw = interpolate(f, [sp, sp + gap * (n - 1) + 10], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{position: 'absolute'}}>
        <path d={d} fill="none" stroke={C.ink} strokeWidth="6" strokeDasharray="2 16" strokeLinecap="round" pathLength="1"
          style={{strokeDasharray: '0.012 0.02', strokeDashoffset: 0, opacity: 1 - draw * 0.9}} />
      </svg>
      {steps.map((t, i) => {
        const k = spring({frame: f - sp - i * gap, fps: 30, config: {damping: 13}});
        return (
          <div key={i} style={{position: 'absolute', left: xs[i] - 230, top: ys[i] - 60, width: 460, transform: `scale(${0.6 + 0.4 * k})`, opacity: k}}>
            <div style={{width: 36, height: 36, borderRadius: '50%', background: C.acc, border: `5px solid ${C.ink}`, margin: '0 auto 14px'}} />
            <Words text={t} start={sp + i * gap} per={2} size={50} weight={700} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Features = ({s, sp, per}) => {
  const f = useCurrentFrame(); const items = s.items || [];
  const gap = Math.max(10, Math.round(per));
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 90px', gap: 40}}>
      {s.heading && <Words text={s.heading} start={sp} per={2} size={74} weight={900} accScale={1.1} />}
      <div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 20}}>
        {items.map(([ic, t], i) => {
          const k = spring({frame: f - sp - 8 - i * gap, fps: 30, config: {damping: 15}});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${(1 - k) * -700}px)`, opacity: Math.min(1, k * 1.4),
              background: C.card, border: `3px solid ${C.ink}`, borderRadius: 18, padding: '22px 28px', boxShadow: `8px 8px 0 ${C.ink}`}}>
              <Icon kind={ic} /><span style={{fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.ink, lineHeight: 1.15}}>{t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Statement = ({s, sp, fr}) => {
  const f = useCurrentFrame();
  const strikeK = interpolate(f, [sp + 10, sp + 22], [0, 1], clamp);
  const n = parse(s.text).length;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40, padding: '0 80px'}}>
      <Sunburst x={850} y={1350} s={180} />
      {s.strike && (
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.ink, position: 'relative'}}>
          {s.strike_pre || 'Not'}{' '}
          <span style={{position: 'relative', color: C.muted}}>{s.strike}
            <span style={{position: 'absolute', left: 0, top: '52%', height: 9, background: C.acc, width: `${strikeK * 100}%`, borderRadius: 5}} /></span>
        </div>
      )}
      <Words text={s.text} start={sp + (s.strike ? 26 : 0)} per={3} size={70} accScale={1.45} />
      {s.highlight && <HiBox text={s.highlight} delay={sp + (s.strike ? 26 : 0) + n * 3 + 10} size={66} />}
    </AbsoluteFill>
  );
};

const CountUp = ({big, start}) => {
  const f = useCurrentFrame();
  const m = String(big).match(/^([^0-9]*)([0-9][0-9,]*)(.*)$/);
  if (!m) return <span>{big}</span>;
  const target = parseInt(m[2].replace(/,/g, ''), 10);
  const v = Math.round(target * interpolate(f, [start, start + 28], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)}));
  return <span>{m[1]}{m[2].includes(',') ? v.toLocaleString('en-US') : v}{m[3]}</span>;
};

const Stat = ({s, sp}) => {
  const k = useSpr(sp + 6);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26, padding: '0 70px'}}>
      {s.top && <Words text={s.top} start={sp} per={3} size={58} weight={700} />}
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: String(s.big).length > 8 ? 150 : 210, color: C.ink, letterSpacing: '-0.04em',
        transform: `scale(${0.7 + 0.3 * k})`, fontVariantNumeric: 'tabular-nums'}}><CountUp big={s.big} start={sp + 6} /></div>
      {s.caption && <Words text={s.caption} start={sp + 24} per={3} size={54} weight={700} accScale={1.15} />}
      {(s.rows || []).map(([ic, t], i) => (
        <div key={i} style={{display: 'flex', gap: 18, alignItems: 'center', marginTop: 10}}><Icon kind={ic} size={46} />
          <Words text={t} start={sp + 40 + i * 8} per={2} size={44} weight={700} align="left" accScale={1.1} /></div>
      ))}
    </AbsoluteFill>
  );
};

const Stack = ({s, sp, per}) => {
  const f = useCurrentFrame(); const cards = s.cards || []; const gap = Math.max(10, Math.min(30, Math.round(per * 0.6)));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {cards.map((c, i) => {
          const k = spring({frame: f - sp - i * gap, fps: 30, config: {damping: 12}});
          return (
            <React.Fragment key={i}>
              {i > 0 && <div style={{width: 120 * k, height: 5, background: C.ink}} />}
              <div style={{transform: `scale(${k})`, textAlign: 'center'}}>
                <div style={{width: 64, height: 64, borderRadius: '50%', background: i === cards.length - 1 ? C.acc : C.ink, color: '#fff', display: 'grid',
                  placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 30, margin: '0 auto'}}>{i + 1}</div>
                <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 28, marginTop: 10, color: C.ink}}>{c.node}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {cards.map((c, i) => {
        const k = spring({frame: f - sp - i * gap, fps: 30, config: {damping: 11, mass: 0.8}});
        return (
          <div key={i} style={{position: 'absolute', left: 150 + i * 24, top: 520 + i * Math.min(300, 1050 / Math.max(1, cards.length)), width: 780, padding: '28px 40px', background: C.card,
            border: `3px solid ${C.ink}`, borderRadius: 26, boxShadow: `12px 12px 0 ${C.ink}`, transform: `translateY(${(1 - k) * -900}px) rotate(${(i - 1) * 2.2}deg)`}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.ink}}>{c.title}</div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 80, color: i === cards.length - 1 ? C.acc : C.ink, letterSpacing: '-0.03em'}}>{c.big}</div>
            <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 32, color: '#5F5E58'}}>{c.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Fanout = ({s, sp, per}) => {
  const f = useCurrentFrame(); const to = s.to || []; const gap = Math.max(8, Math.round(per));
  const xs = to.map((_, i) => 140 + (i * 800) / Math.max(1, to.length - 1));
  return (
    <AbsoluteFill>
      {s.top && <div style={{position: 'absolute', top: 260, left: 70, right: 70}}><Words text={s.top} start={sp} per={2} size={56} weight={700} accScale={1.15} /></div>}
      <div style={{position: 'absolute', top: 640, left: 340, width: 400, textAlign: 'center', background: C.ink, color: '#fff', borderRadius: 22, padding: '26px 0',
        fontFamily: FONT, fontWeight: 900, fontSize: 46}}>{s.from}</div>
      <svg width="1080" height="1920" style={{position: 'absolute'}}>
        {to.map((_, i) => { const k = interpolate(f, [sp + 10 + i * gap, sp + 24 + i * gap], [0, 1], clamp);
          return <line key={i} x1={540} y1={740} x2={540 + (xs[i] - 540) * k} y2={740 + 360 * k} stroke={C.ink} strokeWidth="6" />; })}
      </svg>
      {to.map((t, i) => { const k = spring({frame: f - sp - 22 - i * gap, fps: 30, config: {damping: 12}});
        return <div key={i} style={{position: 'absolute', left: xs[i] - 120, top: 1110, width: 240, textAlign: 'center', transform: `scale(${k})`, background: C.card,
          border: `3px solid ${C.ink}`, borderRadius: 18, padding: '18px 8px', fontFamily: FONT, fontWeight: 800, fontSize: 32, boxShadow: `6px 6px 0 ${C.ink}`}}>{t}</div>; })}
      {s.text && <div style={{position: 'absolute', top: 1340, left: 70, right: 70}}><Words text={s.text} start={sp + 40} per={3} size={64} /></div>}
    </AbsoluteFill>
  );
};

const Orbit = ({s, sp}) => {
  const f = useCurrentFrame(); const items = s.items || [];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 390, top: 560, width: 300, height: 300, borderRadius: '50%', background: C.acc, color: '#fff', display: 'grid',
        placeItems: 'center', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, transform: `scale(${spring({frame: f - sp, fps: 30, config: {damping: 12}})})`}}>{s.center}</div>
      {items.map((t, i) => { const a = (i / items.length) * Math.PI * 2 + f * 0.012; const k = spring({frame: f - sp - 6 - i * 4, fps: 30, config: {damping: 12}});
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * 380 * k - 110, top: 710 + Math.sin(a) * 380 * k - 36, width: 220, textAlign: 'center',
          background: C.card, border: `3px solid ${C.ink}`, borderRadius: 999, padding: '16px 0', fontFamily: FONT, fontWeight: 800, fontSize: 32}}>{t}</div>; })}
      {s.text && <div style={{position: 'absolute', top: 1260, left: 70, right: 70}}><Words text={s.text} start={sp + 20} per={3} size={66} /></div>}
    </AbsoluteFill>
  );
};

const CardImg = ({src, k, tilt = 0}) => src ? (
  <Img src={staticFile(src)} style={{width: 880, maxHeight: 820, objectFit: 'cover', objectPosition: 'top', borderRadius: 22, border: `4px solid ${C.ink}`,
    boxShadow: `14px 14px 0 ${C.ink}`, transform: `translateY(${(1 - k) * 900}px) rotate(${tilt}deg)`, background: C.card}} />
) : null;

const TitleCard = ({s, sp}) => {
  const k = useSpr(sp + 8, {damping: 13}); const k2 = useSpr(sp + 18, {damping: 15});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 330, gap: 40}}>
      <Words text={s.intro || `${s.label} is`} start={sp} per={3} size={84} weight={700} />
      <div style={{display: 'flex', alignItems: 'center', gap: 24, background: C.card, border: `4px solid ${C.ink}`, borderRadius: 26, padding: '22px 36px',
        boxShadow: `10px 10px 0 ${C.ink}`, transform: `translateX(${(1 - k) * 1100}px)`}}>
        <div style={{width: 92, height: 92, borderRadius: 20, background: C.ink, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 58}}>{s.letter || '•'}</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 70, textTransform: 'uppercase', color: C.ink, letterSpacing: '-0.02em'}}>{s.badge || s.title}</div>
      </div>
      {s.image ? <div style={{marginTop: 30}}><CardImg src={s.image} k={k2} tilt={-1.5} /></div>
        : s.sub ? <div style={{marginTop: 20, padding: '0 80px'}}><Words text={s.sub} start={sp + 22} per={3} size={58} weight={700} accScale={1.2} /></div> : null}
    </AbsoluteFill>
  );
};

const Shot = ({s, sp}) => {
  const k = useSpr(sp + 4, {damping: 15}); const ks = useSpr(sp + 30, {damping: 9});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300, gap: 46}}>
      {s.headline && <div style={{padding: '0 80px', alignSelf: 'stretch'}}><Words text={s.headline} start={sp} per={3} size={62} weight={800} align="left" accScale={1.1} /></div>}
      <div style={{position: 'relative'}}>
        <CardImg src={s.image} k={k} />
        {s.sticker && <div style={{position: 'absolute', right: -20, top: -40, background: C.acc, color: '#fff', border: `4px solid ${C.ink}`, borderRadius: 16,
          padding: '14px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 48, boxShadow: `6px 6px 0 ${C.ink}`, transform: `rotate(-8deg) scale(${ks})`}}>{s.sticker}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Save = ({s, sp}) => {
  const f = useCurrentFrame(); const k = useSpr(sp + 4, {damping: 9}); const filled = f > sp + 22;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 60}}>
      <svg width="240" height="300" viewBox="0 0 24 30" style={{transform: `scale(${k * (filled ? 1.04 : 1)})`}}>
        <path d="M2 2h20v26l-10-7-10 7z" fill={filled ? C.acc : 'none'} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div style={{padding: '0 80px'}}><Words text={s.text} start={sp + 6} per={3} size={66} /></div>
    </AbsoluteFill>
  );
};

const Follow = ({s, sp}) => {
  const f = useCurrentFrame(); const k = useSpr(sp + 8, {damping: 7, mass: 0.8});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 44, padding: '0 70px'}}>
      <Words text="make sure you *Follow*" start={sp} per={3} size={56} weight={700} accScale={1} />
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: C.ink, letterSpacing: '-0.03em', textAlign: 'center'}}>Sub-Creator Paid</div>
      <div style={{width: 230, height: 230, borderRadius: '50%', background: C.acc, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT,
        fontWeight: 900, fontSize: 140, transform: `scale(${k}) translateY(${Math.sin(f / 6) * 6}px)`, boxShadow: '0 24px 40px rgba(46,125,79,.35)'}}>$</div>
      {s.text && <Words text={s.text} start={sp + 18} per={3} size={56} weight={700} accScale={1.5} />}
    </AbsoluteFill>
  );
};


// ---------- v2 elements (text-sync structure): every view gets `b` (beat with word frames) so motion lands on spoken words
const clean = (w) => String(w).toLowerCase().replace(/[^a-z0-9$%'-]/g, '');
const at = (b, key, fb = 0) => { // local frame where a word starting with `key` is spoken
  const w = (b.words || []).find((x) => clean(x.w).startsWith(clean(key)));
  return w ? w.f - b.from : (b.speakFrom - b.from) + fb;
};
const Card = ({children, style = {}}) => (
  <div style={{background: C.card, border: `4px solid ${C.ink}`, borderRadius: 28, boxShadow: `12px 12px 0 ${C.ink}`, ...style}}>{children}</div>
);
const Phone = ({children, w = 520, h = 900, style = {}}) => (
  <div style={{width: w, height: h, borderRadius: 64, background: C.ink, padding: 16, boxShadow: `16px 16px 0 rgba(21,21,21,.18)`, ...style}}>
    <div style={{width: '100%', height: '100%', borderRadius: 50, background: C.card, overflow: 'hidden', position: 'relative'}}>
      <div style={{position: 'absolute', top: 16, left: '50%', width: 120, height: 30, marginLeft: -60, borderRadius: 20, background: C.ink, zIndex: 5}} />
      {children}
    </div>
  </div>
);
const Lock = ({size = 60}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="12" rx="3" fill={C.ink} />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke={C.ink} strokeWidth="2.6" /><circle cx="12" cy="16" r="1.8" fill="#fff" /></svg>
);
const Blur = ({w = 300}) => <div style={{height: 22, width: w, borderRadius: 11, background: '#C9C6BE', filter: 'blur(5px)', marginTop: 10}} />;

const Dashboard = ({s, b, sp}) => {
  const f = useCurrentFrame();
  const fz = s.freeze ? 0 : 1;
  const kin = spring({frame: f - 2, fps: 30, config: {damping: 14}});
  const cnt = fz * interpolate(f, [sp, sp + 34], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const fol = Math.round((s.followers || 847) * cnt);
  const pf = at(b, s.posts_word || 'post', 20); const zf = at(b, s.zero_word || 'zero', 40);
  const kp = fz * spring({frame: f - pf, fps: 30, config: {damping: 13}});
  const kz = fz * spring({frame: f - zf, fps: 30, config: {damping: 8, mass: 0.7}});
  const shake = f > zf && f < zf + 10 ? Math.sin(f * 2.3) * 14 * (1 - (f - zf) / 10) : 0;
  const bubbles = fz ? [0, 1, 2, 3, 4].map((i) => {
    const t0 = sp + 4 + i * 6; const k = interpolate(f, [t0, t0 + 26], [0, 1], clamp);
    return k > 0 && k < 1 ? <div key={i} style={{position: 'absolute', right: 110 + (i % 2) * 150, top: 380 - k * 160, opacity: 1 - k, fontFamily: FONT, fontWeight: 800,
      fontSize: 34, color: C.acc}}>+{[12, 30, 7, 21, 15][i]} followers</div> : null; }) : null;
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 440}}>
      <Sunburst x={-70} y={300} s={220} />
      <Card style={{width: 860, padding: '40px 50px', transform: `translateY(${(1 - kin) * 300}px)`, opacity: kin}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '.14em', color: '#5F5E58'}}>YOUR CREATOR DASHBOARD</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 26}}>
          <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>Followers</span>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, color: C.ink, fontVariantNumeric: 'tabular-nums'}}>{fol.toLocaleString('en-US')}<span style={{color: C.acc, fontSize: 60}}> ↑</span></span>
        </div>
        <div style={{height: 3, background: C.line, margin: '18px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: kp, transform: `translateX(${(1 - kp) * 80}px)`}}>
          <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>Posts</span>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 72, color: C.ink}}>{s.posts || 'Every week'}</span>
        </div>
        <div style={{height: 3, background: C.line, margin: '18px 0'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: Math.min(1, kz * 2)}}>
          <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>Earned</span>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#fff', background: C.ink, borderRadius: 18, padding: '4px 26px',
            transform: `scale(${0.5 + 0.5 * kz}) translateX(${shake}px)`}}>{s.earnings || '$0.00'}</span>
        </div>
      </Card>
      {bubbles}
    </AbsoluteFill>
  );
};

const Versus = ({s, b}) => {
  const f = useCurrentFrame();
  const lf = at(b, s.left_word || s.left, 10); const rf = at(b, s.right_word || s.right, 30);
  const kl = spring({frame: f - lf, fps: 30, config: {damping: 12}}); const kr = spring({frame: f - rf, fps: 30, config: {damping: 10}});
  const strike = interpolate(f, [lf + 8, lf + 16], [0, 1], clamp);
  const side = (label, k, ok, extra) => (
    <Card style={{width: 400, height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30,
      background: ok ? C.accSoft : C.card, transform: `scale(${0.4 + 0.6 * k}) rotate(${ok ? 3 : -3}deg)`, opacity: Math.min(1, k * 1.5), ...extra}}>
      <Icon kind={ok ? 'check' : 'x'} size={120} />
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: ok ? C.acc : C.ink, position: 'relative'}}>{label}
        {!ok && <span style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 10, background: C.ink, borderRadius: 5, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />}</div>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#5F5E58'}}>{ok ? s.right_sub || 'what brands pay for' : s.left_sub || "doesn't pay"}</div>
    </Card>
  );
  return (
    <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 400, gap: 40}}>
      {side(s.left, kl, false)}{side(s.right, kr, true, {boxShadow: `12px 12px 0 ${C.ink}, 0 0 80px rgba(46,125,79,${0.45 * kr})`})}
    </AbsoluteFill>
  );
};

const PhoneAd = ({s, b, sp}) => {
  const f = useCurrentFrame();
  const kp = spring({frame: f - 2, fps: 30, config: {damping: 14}});
  const lf = at(b, s.label_word || s.label, 6); const st = at(b, s.sticker_word || 'zero', 50);
  const prog = interpolate(f, [sp, sp + 120], [0, 1], clamp);
  const ks = spring({frame: f - st, fps: 30, config: {damping: 8}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 250}}>
      <div style={{transform: `translateY(${(1 - kp) * 900}px) rotate(-3deg)`, position: 'relative'}}>
        <Phone w={500} h={860}>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${C.accSoft}, #fff)`}} />
          <div style={{position: 'absolute', top: 80, left: 30, background: C.ink, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 26, borderRadius: 10, padding: '6px 14px'}}>Ad</div>
          <div style={{position: 'absolute', top: 300, left: '50%', marginLeft: -70, width: 140, height: 140, borderRadius: '50%', background: C.ink, display: 'grid', placeItems: 'center'}}>
            <div style={{width: 0, height: 0, borderTop: '30px solid transparent', borderBottom: '30px solid transparent', borderLeft: `48px solid #fff`, marginLeft: 12}} /></div>
          <div style={{position: 'absolute', top: 500, left: 40, right: 40, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink, textAlign: 'center'}}>{s.phone_text || 'filmed by you, run by the brand'}</div>
          <div style={{position: 'absolute', bottom: 40, left: 40, right: 40, height: 8, borderRadius: 4, background: C.line}}>
            <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 4, background: C.acc}} /></div>
        </Phone>
        <div style={{position: 'absolute', right: -150, top: 110, transform: `rotate(10deg) scale(${ks})`, background: C.acc, color: '#fff', border: `4px solid ${C.ink}`,
          borderRadius: 18, padding: '16px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 44, boxShadow: `6px 6px 0 ${C.ink}`}}>{s.sticker || '0 followers needed'}</div>
        <div style={{position: 'absolute', left: -110, bottom: 60}}><HiBox text={s.label} delay={lf} size={90} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Rate = ({s, b}) => {
  const f = useCurrentFrame();
  const lo = at(b, s.low_word || '$' + s.low, 10); const hi = at(b, s.high_word || '$' + s.high, 30);
  const k = spring({frame: f - 2, fps: 30, config: {damping: 10}});
  const swing = Math.sin(f / 7) * 7 * Math.exp(-f / 50);
  const vlo = Math.round(s.low * interpolate(f, [lo, lo + 14], [0, 1], clamp));
  const vhi = Math.round(s.high * interpolate(f, [hi, hi + 18], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)}));
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <Sunburst x={780} y={240} s={200} />
      <div style={{width: 6, height: 120, background: C.ink, transform: `scaleY(${k})`, transformOrigin: 'top'}} />
      <div style={{transform: `rotate(${swing}deg) scale(${k})`, transformOrigin: 'top center', position: 'relative'}}>
        <Card style={{width: 820, padding: '70px 40px 50px', textAlign: 'center', borderRadius: 40}}>
          <div style={{position: 'absolute', top: 26, left: '50%', marginLeft: -22, width: 44, height: 44, borderRadius: '50%', border: `6px solid ${C.ink}`, background: C.bg}} />
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: '.14em', color: C.acc}}>{s.label || 'BEGINNER RATES'}</div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, color: C.ink, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1}}>
            ${vlo}<span style={{color: f >= hi ? C.acc : C.line}}>–${vhi}</span></div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>{s.unit || 'per video'}</div>
        </Card>
      </div>
      <div style={{marginTop: 40, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#5F5E58'}}>Source: {s.src}</div>
    </AbsoluteFill>
  );
};

const Samples = ({s, b}) => {
  const f = useCurrentFrame(); const items = s.items || ['Sample 1', 'Sample 2', 'Sample 3'];
  const t0 = at(b, s.word || 'three', 8); const pf = at(b, s.phone_word || 'phone', 50);
  const kc = spring({frame: f - pf, fps: 30, config: {damping: 9}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 330}}>
      <div style={{display: 'flex', gap: 34}}>
        {items.map((it, i) => {
          const k = spring({frame: f - t0 - i * 5, fps: 30, config: {damping: 11, mass: 0.8}});
          return (
            <div key={i} style={{transform: `translateY(${(1 - k) * -1000}px) rotate(${(i - 1) * 4}deg)`}}>
              <Card style={{width: 270, height: 480, borderRadius: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
                background: i === 1 ? C.accSoft : C.card}}>
                <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color: i === 1 ? C.acc : C.ink}}>{s.hidden === false ? i + 1 : '?'}</div>
                <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.ink}}>{it}</div>
                {s.hidden !== false && <Lock size={54} />}
              </Card>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 70, display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${kc})`, background: C.ink, color: '#fff', borderRadius: 999,
        padding: '18px 40px', fontFamily: FONT, fontWeight: 800, fontSize: 44}}>
        <svg width="54" height="44" viewBox="0 0 27 22"><rect x="1" y="5" width="25" height="16" rx="4" fill="none" stroke="#fff" strokeWidth="2.4" /><circle cx="13.5" cy="13" r="4.5" fill="none" stroke="#fff" strokeWidth="2.4" /><rect x="8" y="1" width="11" height="5" rx="2" fill="#fff" /></svg>
        {s.chip || 'All filmed on your phone'}</div>
    </AbsoluteFill>
  );
};

const Stamp = ({s, b}) => {
  const f = useCurrentFrame();
  const sf = at(b, s.word || 'sponsored', 20);
  const kc = spring({frame: f - 2, fps: 30, config: {damping: 14}});
  const ks = interpolate(f, [sf - 2, sf + 4], [0, 1], {...clamp, easing: (x) => x * x});
  const shake = f > sf + 3 && f < sf + 12 ? Math.sin(f * 3) * 10 * (1 - (f - sf - 3) / 9) : 0;
  const ws = at(b, s.sub_word || 'never', 50);
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 300}}>
      <div style={{position: 'relative', transform: `translateX(${shake}px) translateY(${(1 - kc) * 600}px)`}}>
        <Card style={{width: 560, height: 700, borderRadius: 40, overflow: 'hidden', position: 'relative', background: `linear-gradient(170deg, ${C.accSoft}, #fff)`}}>
          <div style={{position: 'absolute', top: 230, left: '50%', marginLeft: -80, width: 160, height: 160, borderRadius: '50%', background: C.ink, display: 'grid', placeItems: 'center'}}>
            <div style={{width: 0, height: 0, borderTop: '34px solid transparent', borderBottom: '34px solid transparent', borderLeft: '56px solid #fff', marginLeft: 14}} /></div>
          <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.ink}}>{s.tile || 'Your sample'}</div>
        </Card>
        <div style={{position: 'absolute', left: -60, top: 260, transform: `rotate(-14deg) scale(${2.4 - 1.4 * ks})`, opacity: ks, border: `10px solid ${C.acc}`, borderRadius: 18,
          padding: '14px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 82, color: C.acc, background: 'rgba(255,255,255,.88)', letterSpacing: '.02em', whiteSpace: 'nowrap'}}>{s.text || 'NOT SPONSORED'}</div>
      </div>
      <div style={{marginTop: 50, opacity: interpolate(f, [ws, ws + 8], [0, 1], clamp), fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.ink}}>{s.sub}</div>
    </AbsoluteFill>
  );
};

const CaptionCta = ({s, b, sp, fr}) => {
  const f = useCurrentFrame();
  const kp = spring({frame: f - 2, fps: 30, config: {damping: 14}});
  const cf = at(b, s.word || 'caption', 40); const svf = at(b, s.save_word || 'save', 80);
  const scroll = interpolate(f, [cf - 10, cf + 14], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const saved = f >= svf;
  const ks = spring({frame: f - svf, fps: 30, config: {damping: 8}});
  return (
    <AbsoluteFill style={{alignItems: 'center', paddingTop: 230}}>
      <div style={{transform: `translateY(${(1 - kp) * 900}px)`, position: 'relative'}}>
        <Phone w={560} h={1000}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-scroll * 420}px)`}}>
            <div style={{height: 560, background: `linear-gradient(160deg, ${C.accSoft}, #fff)`, display: 'grid', placeItems: 'center'}}>
              <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.ink, textAlign: 'center', padding: '0 40px'}}>{s.post || 'This video'}</div></div>
            <div style={{display: 'flex', gap: 26, padding: '22px 30px', alignItems: 'center'}}>
              <svg width="44" height="44" viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="none" stroke={C.ink} strokeWidth="2" /></svg>
              <svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 4h16v12H8l-4 4z" fill="none" stroke={C.ink} strokeWidth="2" /></svg>
              <div style={{flex: 1}} />
              <svg width="44" height="44" viewBox="0 0 24 30" style={{transform: `scale(${saved ? 1 + 0.3 * (1 - ks) + 0.0 : 1})`}}><path d="M3 2h18v26l-9-7-9 7z" fill={saved ? C.acc : 'none'} stroke={C.ink} strokeWidth="2.2" /></svg>
            </div>
            <div style={{padding: '0 30px'}}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink}}>@subcreatorpaid <span style={{fontWeight: 600}}>{s.first || 'The list from the video:'}</span></div>
              {(s.rows || []).map((r, i) => {
                const k = spring({frame: f - cf - 4 - i * 5, fps: 30, config: {damping: 14}});
                return <div key={i} style={{marginTop: 22, opacity: k, transform: `translateX(${(1 - k) * 60}px)`}}>
                  <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.ink}}>{r}</div><Blur w={380 - (i % 2) * 70} /></div>;
              })}
            </div>
          </div>
        </Phone>
        <div style={{position: 'absolute', right: -120, top: 560, transform: `translateY(${Math.sin(f / 4) * 14}px)`, opacity: scroll}}>
          <svg width="120" height="160" viewBox="0 0 60 80"><path d="M30 4v58M10 44l20 22 20-22" fill="none" stroke={C.acc} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
      </div>
    </AbsoluteFill>
  );
};

const VIEWS = {dashboard: Dashboard, versus: Versus, phone_ad: PhoneAd, rate: Rate, samples: Samples, stamp: Stamp, caption_cta: CaptionCta, hook: Hook, flow: Flow, features: Features, statement: Statement, stat: Stat, stack: Stack, fanout: Fanout, orbit: Orbit,
  title_card: TitleCard, shot: Shot, save: Save, follow: Follow};

const Beat = ({b, i}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const sp = b.speakFrom - b.from; // local frame where the voice starts
  const words = Math.max(1, (b.say || '').split(/\s+/).length);
  const per = (b.speakFrames * 0.8) / Math.max(1, (b.show.items || b.show.steps || b.show.cards || b.show.to || [1]).length);
  const V = VIEWS[b.show.type] || Statement;
  // camera: whip in from alternating sides, slow push, punch on "punch" words
  const dir = i % 2 ? -1 : 1;
  const whip = i === 0 ? 0 : 1 - interpolate(f, [0, 7], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const push = 1 + 0.04 * interpolate(f, [0, Math.max(1, b.frames)], [0, 1], clamp);
  let punch = 0, shakeX = 0;
  (b.words || []).filter((w) => w.p).forEach((w) => { const d = f - (w.f - b.from); if (d >= 0 && d < 14) { punch += 0.07 * Math.exp(-d / 4); if (d < 7) shakeX += Math.sin(d * 2.7) * 9 * (1 - d / 7); } });
  return (
    <AbsoluteFill style={{transform: `translateX(${whip * dir * 260 + shakeX}px) scale(${push + punch})`, filter: whip > 0.02 ? `blur(${whip * 14}px)` : 'none',
      opacity: i === 0 ? 1 : interpolate(f, [0, 4], [0.3, 1], clamp), transformOrigin: '50% 42%'}}>
      <Steps step={b.show.step} labels={b.show.step_labels} />
      <V s={b.show} b={b} sp={sp} per={per} fr={b.frames} words={words} />
    </AbsoluteFill>
  );
};

// Small word-synced captions in the lower third: up to 3 words per line, the spoken word pops in a green pill.
const Captions = ({beats}) => {
  const f = useCurrentFrame();
  const all = []; beats.forEach((b, bi) => (b.words || []).forEach((w) => all.push({...w, bi})));
  if (!all.length) return null;
  const chunks = []; let cur = [];
  all.forEach((w, i) => {
    const prev = all[i - 1];
    if (cur.length && (cur.length >= 3 || w.bi !== prev.bi || w.f - prev.f > 14 || /[.,:;?!]$/.test(prev.w))) { chunks.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) chunks.push(cur);
  let ci = -1; chunks.forEach((c, i) => { if (f >= c[0].f) ci = i; });
  if (ci < 0) return null;
  const ch = chunks[ci]; const next = chunks[ci + 1];
  const last = ch[ch.length - 1]; const endF = next ? next[0].f : last.f + 30;
  if (f > Math.min(endF, last.f + 30)) return null;
  const kin = spring({frame: f - ch[0].f, fps: 30, config: {damping: 15, mass: 0.5}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1395, display: 'flex', justifyContent: 'center', gap: 14, transform: `translateY(${(1 - kin) * 16}px)`, opacity: Math.min(1, kin * 1.4)}}>
      {ch.map((w, i) => {
        const on = f >= w.f && (i === ch.length - 1 || f < ch[i + 1].f);
        const k = spring({frame: f - w.f, fps: 30, config: {damping: 12, mass: 0.4}});
        const said = f >= w.f;
        return <span key={i} style={{fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1, padding: '10px 16px 14px', borderRadius: 14,
          background: on ? C.acc : 'transparent', color: on ? '#fff' : said ? C.ink : '#B9B6AE', transform: `scale(${on ? 1 + 0.08 * (1 - Math.min(1, k)) + 0.04 : 1})`,
          textShadow: on ? 'none' : '0 2px 0 rgba(255,255,255,.8)'}}>{String(w.w).replace(/\*/g, '')}</span>;
      })}
    </div>
  );
};

export const Short = ({beats = [], handle, captions, total}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Fonts />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`,
        backgroundSize: '72px 72px', backgroundPosition: `0 ${-f * 0.6}px`,
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)'}} />
      {beats.map((b, i) => (
        <Sequence key={i} from={b.from} durationInFrames={Math.max(1, b.frames)}><Beat b={b} i={i} /></Sequence>
      ))}
      {captions !== false && <Captions beats={beats} />}
      <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(f / Math.max(1, total)) * 100}%`, background: C.acc}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#C9C6BE'}}>{handle}</div>
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
