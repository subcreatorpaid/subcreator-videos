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
  const f = useCurrentFrame(); const cards = s.cards || []; const gap = Math.max(14, Math.round(per * 1.4));
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
          <div key={i} style={{position: 'absolute', left: 150 + i * 34, top: 640 + i * 150, width: 780, padding: '34px 40px', background: C.card,
            border: `3px solid ${C.ink}`, borderRadius: 26, boxShadow: `12px 12px 0 ${C.ink}`, transform: `translateY(${(1 - k) * -900}px) rotate(${(i - 1) * 2.2}deg)`}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.ink}}>{c.title}</div>
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: i === cards.length - 1 ? C.acc : C.ink, letterSpacing: '-0.03em'}}>{c.big}</div>
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

const VIEWS = {hook: Hook, flow: Flow, features: Features, statement: Statement, stat: Stat, stack: Stack, fanout: Fanout, orbit: Orbit,
  title_card: TitleCard, shot: Shot, save: Save, follow: Follow};

const Beat = ({b}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const sp = b.speakFrom - b.from; // local frame where the voice starts
  const words = Math.max(1, (b.say || '').split(/\s+/).length);
  const per = (b.speakFrames * 0.8) / Math.max(1, (b.show.items || b.show.steps || b.show.cards || b.show.to || [1]).length);
  const punch = spring({frame: f, fps, config: {damping: 16, mass: 0.6}});
  const V = VIEWS[b.show.type] || Statement;
  return (
    <AbsoluteFill style={{transform: `scale(${1.08 - 0.08 * punch})`, opacity: interpolate(f, [0, 5], [0, 1], clamp)}}>
      <Steps step={b.show.step} labels={b.show.step_labels} />
      <V s={b.show} sp={sp} per={per} fr={b.frames} words={words} />
    </AbsoluteFill>
  );
};

export const Short = ({beats = [], handle}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Fonts />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`,
        backgroundSize: '72px 72px', backgroundPosition: `0 ${-f * 0.6}px`,
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)'}} />
      {beats.map((b, i) => (
        <Sequence key={i} from={b.from} durationInFrames={Math.max(1, b.frames)}><Beat b={b} /></Sequence>
      ))}
      <div style={{position: 'absolute', bottom: 210, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#C9C6BE'}}>{handle}</div>
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
