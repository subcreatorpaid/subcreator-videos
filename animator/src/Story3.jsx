// Generic, data-driven story scenes for the 100-video plan (26 Oct 2026). Each one takes its numbers and words from
// beat.show, so any verified fact can be shown without new code. Same rules as Story.jsx: the creator face acts every
// line, green only for money coming in, red for loss/denial, soft glows, side entries and pops, no cheap bottom rises.
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, FONT} from './Short';
import {RED, ease, pop, glow, FromSide, PopIn, Logo, Face, Phone, Cursor, Stamp, DrawLine, XMark, BlackChip, Chip} from './graphics';

const lerp = (f, a, b, x, y) => interpolate(f, [a, Math.max(b, a + 1)], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});  // b <= a happens in hook clips, where the timing words aren't spoken
const MUTED = '#5F5E58';
const GREEN_GLOW = '0 0 60px rgba(46,125,79,0.45)';
const RED_GLOW = '0 18px 60px rgba(217,58,58,0.3)';
const LOGOS = ['instagram', 'tiktok', 'youtube', 'spotify'];
const Guy = ({x, y, sc = 0.4, mood = 0, f, hold = null, o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${sc})`, transformOrigin: 'left top', opacity: o}}><Face mood={mood} f={f} size={700} hold={hold} /></div>
);
// A brand mark: a real logo when we have one, otherwise a black rounded tile with the first letters.
const Mark = ({name, size = 72}) => LOGOS.includes(name) ? <Logo name={name} size={size} /> : (
  <div style={{width: size, height: size, borderRadius: size * 0.26, background: C.ink, color: '#fff', fontWeight: 900, fontSize: size * 0.42, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{String(name || '?').slice(0, 2)}</div>
);
const Title = ({f, text, top = 150, color = C.ink, size = 64}) => text ? (
  <PopIn f={f - 2} origin="left center" style={{left: 70, right: 70, top}}><div style={{fontWeight: 900, fontSize: size, lineHeight: 1.05, color}}>{text}</div></PopIn>
) : null;
const Source = ({f, text, top = 1330}) => text ? <div style={{position: 'absolute', right: 60, top, fontWeight: 600, fontSize: 28, color: MUTED, opacity: ease(f - 10, 10)}}>Source: {text}</div> : null;
const countTo = (f, at, to, d = 24) => interpolate(f - at, [0, d], [0, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const fmtNum = (n, dec = 0, pre = '', suf = '') => pre + (dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-US')) + suf;

// 1. An official page drawn as a browser card: URL bar, title, bullets that light up as they are read.
const PageCard = ({f, w, s}) => {
  const p = ease(f - 2, 16);
  const bullets = s.bullets || [];
  const call = s.call || null;
  return (<>
    <div style={{position: 'absolute', left: 80, top: 170, width: 920, borderRadius: 30, background: '#fff', overflow: 'hidden', boxShadow: glow('0,0,0', 0.16, 80), opacity: p,
      transform: `perspective(2200px) rotateY(${(1 - p) * 40 - 6}deg) rotateX(5deg) translateX(${(1 - p) * 320}px)`}}>
      <div style={{height: 76, background: '#EFEEEA', display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px'}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#D6D2C4'}} />)}
        <div style={{marginLeft: 16, flex: 1, height: 46, borderRadius: 23, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 22px', fontWeight: 700, fontSize: 26, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden'}}>{s.url}</div>
      </div>
      <div style={{padding: '34px 44px 40px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>{s.mark && <Mark name={s.mark} size={64} />}<div style={{fontWeight: 900, fontSize: 48, lineHeight: 1.1}}>{s.title}</div></div>
        {bullets.map(([k, t, money], i) => {
          const on = ease(f - w(k) + 2, 8);
          return (
            <div key={i} style={{display: 'flex', gap: 18, alignItems: 'flex-start', marginTop: 22, padding: '14px 18px', borderRadius: 18, opacity: 0.35 + 0.65 * Math.max(on, ease(f - 8 - i * 4, 8) * 0.5),
              background: on > 0.5 ? (money ? '#E3F0E7' : '#F1F0EC') : 'transparent', boxShadow: on > 0.5 && money ? GREEN_GLOW : 'none'}}>
              <div style={{width: 14, height: 14, borderRadius: 7, marginTop: 16, background: money && on > 0.5 ? C.acc : C.ink, flexShrink: 0}} />
              <div style={{fontWeight: 800, fontSize: 38, lineHeight: 1.25}}>{t}</div>
            </div>
          );
        })}
        {s.checked && <div style={{marginTop: 26, fontWeight: 600, fontSize: 26, color: MUTED}}>{s.checked}</div>}
      </div>
    </div>
    {call && <PopIn f={f - w(call[0]) + 2} style={{left: 90, top: 1130}}><div style={{background: call[2] ? C.acc : C.ink, color: '#fff', fontWeight: 900, fontSize: 52, padding: '18px 36px', borderRadius: 26, boxShadow: call[2] ? GREEN_GLOW : glow('0,0,0', 0.2, 50)}}>{call[1]}</div></PopIn>}
    <Guy x={700} y={1020} sc={0.36} mood={-0.5} f={f} hold="laptop" o={ease(f - 6, 10)} />
  </>);
};

// 2. Up to 3 numbers on cards fanned in 3D; the last (or `green`) one is the focus.
const StatCards = ({f, w, s}) => {
  const cards = s.cards || [];
  const n = cards.length;
  return (<>
    {s.title && <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontWeight: 800, fontSize: 44, letterSpacing: 5, color: MUTED, opacity: ease(f, 10)}}>{s.title}</div>}
    {cards.map(([k, big, sub, green], i) => {
      const p = ease(f - w(k) + 6, 14);
      const W = n === 1 ? 700 : n === 2 ? 470 : 380;
      const left = n === 1 ? 190 : n === 2 ? 70 + i * 480 : 50 + i * 330;
      return (
        <div key={i} style={{position: 'absolute', left, top: 300 + (n === 3 ? Math.abs(i - 1) * 40 : 0), width: W, height: 640, borderRadius: 46, background: green ? 'linear-gradient(160deg, #FFFFFF, #E3F0E7)' : '#fff', opacity: p,
          transform: `perspective(1800px) rotateY(${(n - 1) / 2 * 0 + (i - (n - 1) / 2) * -10 + (1 - p) * 50}deg) translateY(${(1 - p) * 60}px)`, boxShadow: green ? '0 30px 90px rgba(46,125,79,0.35)' : s.red && s.red.includes(k) ? RED_GLOW : glow('0,0,0', 0.12, 70),
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30, boxSizing: 'border-box', textAlign: 'center'}}>
          <div style={{fontWeight: 900, fontSize: String(big).length > 6 ? 96 : 140, lineHeight: 1, color: green ? C.acc : (s.redcards || []).includes(i) ? RED : C.ink}}>{big}</div>
          <div style={{fontWeight: 700, fontSize: 38, color: MUTED, lineHeight: 1.2}}>{sub}</div>
        </div>
      );
    })}
    <Guy x={-10} y={960} sc={0.42} mood={s.mood ?? -0.6} f={f} hold={s.hold === undefined ? 'money' : s.hold} o={ease(f - 8, 10)} />
    <Source f={f} text={s.source} />
  </>);
};

// 3. Where a sale goes: one bar split into fees (red) and what you keep (green), with a legend that counts up.
const FeeSplit = ({f, w, s}) => {
  const parts = s.parts || [];
  const total = parts.reduce((a, p) => a + p[2], 0) || 1;
  let x = 0;
  const keepAt = parts.find((p) => p[3] === 'keep');
  return (<>
    <PopIn f={f - 2} origin="left center" style={{left: 80, top: 160}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        {s.mark && <Mark name={s.mark} size={80} />}
        <div style={{background: '#fff', border: `5px solid ${C.ink}`, borderRadius: 26, padding: '14px 32px', fontWeight: 900, fontSize: 64, boxShadow: glow('0,0,0', 0.14, 50)}}>{s.label}</div>
      </div>
    </PopIn>
    <div style={{position: 'absolute', left: 80, top: 370, width: 920, height: 150, borderRadius: 34, background: C.line, overflow: 'hidden', display: 'flex', opacity: ease(f - 4, 10)}}>
      {parts.map(([k, , amt, kind], i) => {
        const g = ease(f - w(k) + 4, 14);
        const el = <div key={i} style={{width: `${(amt / total) * 100 * g}%`, height: '100%', background: kind === 'keep' ? C.acc : i % 2 ? '#B9332F' : RED, borderRight: '4px solid #fff', boxSizing: 'border-box'}} />;
        x += amt; return el;
      })}
    </div>
    {parts.map(([k, label, amt, kind], i) => {
      const on = ease(f - w(k) + 2, 10);
      return (
        <FromSide key={i} f={f - w(k) + 4} side={i % 2 ? 'right' : 'left'} style={{left: 80, right: 80, top: 580 + i * 120}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#fff', borderRadius: 26, padding: '18px 28px', boxShadow: kind === 'keep' ? GREEN_GLOW : glow('0,0,0', 0.1, 40)}}>
            <div style={{width: 30, height: 30, borderRadius: 8, background: kind === 'keep' ? C.acc : RED}} />
            <div style={{flex: 1, fontWeight: 800, fontSize: 40}}>{label}</div>
            <div style={{fontWeight: 900, fontSize: 48, color: kind === 'keep' ? C.acc : RED}}>{kind === 'keep' ? '' : '−'}{fmtNum(countTo(f, w(k), amt, 18), s.dec ?? 2, s.pre ?? '$')}</div>
          </div>
        </FromSide>
      );
    })}
    <Guy x={keepAt && f > w(keepAt[0]) ? 700 : 720} y={1080} sc={0.3} mood={keepAt && f > w(keepAt[0]) ? -0.8 : 0.4} f={f} hold={keepAt && f > w(keepAt[0]) ? 'money' : null} />
    <Source f={f} text={s.source} top={1340} />
  </>);
};

// 4. A worked example as an equation: tiles pop in, the result counts up (green when it is money in).
const Calc = ({f, w, s}) => {
  const rows = s.rows || [];
  const [rk, rlabel, rnum, rpre, rsuf, rdec, rgreen = true] = s.result || [];
  const rp = ease(f - w(rk) + 2, 12);
  return (<>
    <Title f={f} text={s.title} />
    {rows.map(([k, label, big, op], i) => (
      <FromSide key={i} f={f - w(k) + 4} side={i % 2 ? 'right' : 'left'} style={{left: 110, right: 110, top: 300 + i * 200}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, background: '#fff', borderRadius: 32, padding: '22px 34px', boxShadow: glow('0,0,0', 0.12, 50)}}>
          {op && <div style={{width: 76, height: 76, borderRadius: 38, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{op}</div>}
          <div style={{flex: 1, fontWeight: 700, fontSize: 38, color: MUTED}}>{label}</div>
          <div style={{fontWeight: 900, fontSize: 72}}>{big}</div>
        </div>
      </FromSide>
    ))}
    {rk && (
      <div style={{position: 'absolute', left: 110, right: 110, top: 300 + rows.length * 200 + 20, opacity: rp, transform: `scale(${pop(f - w(rk) + 2, 12)})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, background: rgreen ? C.acc : RED, color: '#fff', borderRadius: 34, padding: '26px 36px', boxShadow: rgreen ? GREEN_GLOW : RED_GLOW}}>
          <div style={{width: 76, height: 76, borderRadius: 38, background: '#fff', color: rgreen ? C.acc : RED, fontWeight: 900, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>=</div>
          <div style={{flex: 1, fontWeight: 800, fontSize: 40}}>{rlabel}</div>
          <div style={{fontWeight: 900, fontSize: 84}}>{fmtNum(countTo(f, w(rk), rnum || 0, 20), rdec || 0, rpre || '', rsuf || '')}</div>
        </div>
      </div>
    )}
    <Guy x={-10} y={1050} sc={0.32} mood={rp > 0.5 ? (rgreen ? -0.9 : 0.8) : 0} f={f} hold={rp > 0.5 && rgreen ? 'money' : 'laptop'} />
    {s.note && <div style={{position: 'absolute', right: 60, top: 1330, fontWeight: 600, fontSize: 28, color: MUTED, opacity: rp}}>{s.note}</div>}
  </>);
};

// 5. Myth -> fact: a claim card gets a red MYTH stamp, then flips to the black FACT side.
const Myth = ({f, w, s}) => {
  const stamp = w(s.myth_word || 'myth');
  const flip = ease(f - w(s.fact_word || 'fact') + 4, 14);
  const ang = flip * 180;
  return (<>
    <div style={{position: 'absolute', left: 110, top: 220, width: 860, height: 640, transform: `perspective(2400px) rotateY(${ang}deg)`, transformStyle: 'preserve-3d'}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: '#fff', boxShadow: glow('0,0,0', 0.14, 80), backfaceVisibility: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, boxSizing: 'border-box',
        opacity: ang < 90 ? 1 : 0}}>
        <div style={{fontWeight: 900, fontSize: 70, lineHeight: 1.1, textAlign: 'center', color: f > stamp ? '#A9A79F' : C.ink}}>"{s.myth}"</div>
      </div>
      <div style={{position: 'absolute', inset: 0, borderRadius: 44, background: C.ink, color: '#fff', transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', padding: 60, boxSizing: 'border-box', opacity: ang >= 90 ? 1 : 0,
        boxShadow: s.fact_green ? '0 30px 90px rgba(46,125,79,0.4)' : glow('0,0,0', 0.25, 80), display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24}}>
        <div style={{fontWeight: 900, fontSize: 40, letterSpacing: 6, color: s.fact_green ? '#7BE0A0' : '#D6D2C4'}}>FACT</div>
        <div style={{fontWeight: 900, fontSize: 64, lineHeight: 1.12}}>{s.fact}</div>
      </div>
    </div>
    {f >= stamp && flip < 0.4 && <Stamp f={f - stamp} text="MYTH" color={RED} size={130} rot={-12} style={{left: 300, top: 440}} />}
    <Guy x={330} y={940} sc={0.44} mood={flip > 0.5 ? -0.6 : lerp(f, 0, stamp, 0, 0.9)} f={f} hold={null} />
  </>);
};

// 6. A path of steps; the camera glides from step to step and the creator acts each one out.
const Steps = ({f, w, s}) => {
  const steps = s.steps || [];
  const GAP = 330; const Y = (i) => 230 + i * GAP; const L = (i) => i % 2 === 0;
  const at = (i) => (i === 0 ? Math.min(4, w(steps[0][0]) - 6) : w(steps[i][0]) - 6);
  let cam = 0;  // three steps fit on screen; from the 4th on, the path scrolls up one step at a time
  steps.forEach((p, i) => { if (i > 2) cam += GAP * ease(f - at(i), 14); });
  const X = (i) => (L(i) ? 330 : 750);
  const path = `M${X(0)} ${Y(0) + 60}` + steps.slice(1).map((_, j) => { const i = j + 1; return ` C ${X(i - 1)} ${Y(i - 1) + 220}, ${X(i)} ${Y(i) - 140}, ${X(i)} ${Y(i) + 10}`; }).join('');
  const last = steps.length - 1;
  return (<>
    {s.title && <div style={{position: 'absolute', left: 70, top: 110, fontWeight: 900, fontSize: 52, opacity: ease(f, 10), zIndex: 2}}>{s.title}</div>}
    <div style={{position: 'absolute', left: 0, top: s.title ? 60 : 0, width: 1080, height: 4000, transform: `translateY(${-cam}px)`}}>
      <DrawLine d={path} p={lerp(f, at(0), at(last) + 10, 0, 1)} color={C.line} width={10} len={420 * steps.length} />
      {steps.map(([k, t, hold, mood], i) => (
        <React.Fragment key={i}>
          <FromSide f={f - at(i)} side={L(i) ? 'left' : 'right'} dist={500} style={{left: L(i) ? 60 : undefined, right: L(i) ? undefined : 60, top: Y(i)}}>
            <Chip green={s.money_last && i === last} dark={!(s.money_last && i === last)} style={{position: 'static', fontSize: 46}}>{i + 1}. {t}</Chip>
          </FromSide>
          <Guy x={L(i) ? 780 : 60} y={Y(i) - 40} sc={0.32} mood={mood ?? 0} f={f} hold={hold ?? null} o={ease(f - at(i) - 4, 10)} />
        </React.Fragment>
      ))}
    </div>
  </>);
};

// 7. A DM / chat thread on a phone, bubbles in order; the creator reacts beside it.
const Chat = ({f, w, s}) => {
  const msgs = s.msgs || [];
  return (<>
    <Phone w={540} h={1000} style={{left: 480, top: 170, transform: `perspective(2200px) rotateY(${-10 + (1 - ease(f - 2, 14)) * -45}deg) translateX(${(1 - ease(f - 2, 14)) * 300}px)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 140, borderBottom: `2px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 24px 18px'}}>
        <Mark name={s.mark || 'B'} size={60} /><div style={{fontWeight: 800, fontSize: 30}}>{s.name || 'Brand team'}</div>
      </div>
      {msgs.map(([k, t, me], i) => {
        const p = ease(f - w(k) + 4, 8);
        return (
          <div key={i} style={{position: 'absolute', [me ? 'right' : 'left']: 22, top: 180 + i * 175, maxWidth: 400, background: me ? C.ink : '#EFEEEA', color: me ? '#fff' : C.ink,
            borderRadius: me ? '28px 28px 8px 28px' : '28px 28px 28px 8px', padding: '18px 24px', fontWeight: 700, fontSize: 32, lineHeight: 1.25, opacity: p, transform: `translateX(${(1 - p) * (me ? 60 : -60)}px)`}}>{t}</div>
        );
      })}
    </Phone>
    <Guy x={-20} y={520} sc={0.55} mood={s.mood ?? 0} f={f} hold={s.hold ?? null} />
  </>);
};

// 8. Requirement bars: where you are vs what the program asks for. Full bar = green check, short bar = red.
const Progress = ({f, w, s}) => {
  const bars = s.bars || [];
  return (<>
    <FromSide f={f} side="right" style={{left: 70, right: 70, top: 170}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '36px 44px 46px', boxShadow: glow('0,0,0', 0.13, 70)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>{s.mark && <Mark name={s.mark} size={80} />}<div style={{fontWeight: 900, fontSize: 52}}>{s.title}</div></div>
        {bars.map(([k, label, cur, target, unit], i) => {
          const p = ease(f - w(k) + 4, 22);
          const ok = cur >= target;
          return (
            <div key={i} style={{marginTop: 34}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 42}}><span>{label}</span>
                <span style={{color: p > 0.95 ? (ok ? C.acc : RED) : C.ink}}>{fmtNum(cur * p)} / {Number(target).toLocaleString('en-US')}{unit ? ' ' + unit : ''}</span></div>
              <div style={{height: 34, borderRadius: 17, background: C.line, marginTop: 14, overflow: 'hidden'}}>
                <div style={{width: `${Math.min(1, cur / target) * p * 100}%`, height: '100%', background: ok ? C.acc : RED, borderRadius: 17}} />
              </div>
            </div>
          );
        })}
      </div>
    </FromSide>
    {s.big && <PopIn f={f - w(s.big[0]) + 2} style={{left: 0, right: 0, top: 260 + bars.length * 130 + 200, textAlign: 'center'}}><div style={{display: 'inline-block', fontWeight: 900, fontSize: 130, color: s.big[2] ? C.acc : RED}}>{s.big[1]}</div></PopIn>}
    <Guy x={330} y={960} sc={0.45} mood={s.mood ?? 0.5} f={f} hold={s.hold === undefined ? 'phone0' : s.hold} />
  </>);
};

// 9. A timeline: a dot travels along a line, markers pop with labels (days, months, deadlines).
const Timeline = ({f, w, s}) => {
  const pts = s.points || [];
  const n = pts.length;
  const X = (i) => 120 + (n === 1 ? 420 : (i * 840) / (n - 1));
  const lastAt = pts.length ? w(pts[n - 1][0]) : 30;
  const ins = pts.map((p) => w(p[0])).concat(n === 1 ? [w(pts[0][0]) + 1] : []); for (let i = 1; i < ins.length; i++) ins[i] = Math.max(ins[i], ins[i - 1] + 1);  // strictly increasing, even when words repeat or aren't spoken
  const dot = interpolate(f, ins, pts.map((_, i) => X(i)).concat(n === 1 ? [X(0)] : []), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<>
    <Title f={f} text={s.title} />
    <div style={{position: 'absolute', left: 100, top: 640, width: 880, height: 12, borderRadius: 6, background: C.line}} />
    <div style={{position: 'absolute', left: 100, top: 640, width: Math.max(0, dot - 100), height: 12, borderRadius: 6, background: C.ink}} />
    {pts.map(([k, big, sub, kind], i) => {
      const p = pop(f - w(k) + 2);
      const up = i % 2 === 0;
      const col = kind === 'green' ? C.acc : kind === 'red' ? RED : C.ink;
      return (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: X(i) - 26, top: 620, width: 52, height: 52, borderRadius: 26, background: '#fff', border: `8px solid ${col}`, transform: `scale(${p})`}} />
          <div style={{position: 'absolute', left: Math.min(Math.max(X(i) - 180, 20), 700), width: 360, top: up ? 330 : 730, textAlign: 'center', opacity: ease(f - w(k) + 2, 8), transform: `translateY(${(1 - ease(f - w(k) + 2, 10)) * (up ? -40 : 40)}px)`}}>
            <div style={{fontWeight: 900, fontSize: 76, color: col, lineHeight: 1}}>{big}</div>
            <div style={{fontWeight: 700, fontSize: 34, color: MUTED, marginTop: 10, lineHeight: 1.2}}>{sub}</div>
          </div>
        </React.Fragment>
      );
    })}
    <div style={{position: 'absolute', left: dot - 20, top: 626, width: 40, height: 40, borderRadius: 20, background: C.ink, boxShadow: glow('0,0,0', 0.3, 30)}} />
    <Guy x={360} y={1000} sc={0.36} mood={f > lastAt ? (s.end_mood ?? -0.6) : 0.2} f={f} hold={s.hold ?? 'phone0'} />
  </>);
};

// 10. Where it works: a turning globe, country chips pop around it, a count badge.
const Countries = ({f, w, s}) => {
  const items = s.items || [];
  const spin = (f * 2) % 360;
  return (<>
    <Title f={f} text={s.title} />
    <svg width="520" height="520" style={{position: 'absolute', left: 280, top: 300, opacity: ease(f - 2, 12)}} viewBox="-130 -130 260 260" fill="none">
      <circle r="120" fill="#fff" stroke={C.ink} strokeWidth="8" />
      {[-60, -20, 20, 60].map((y) => <ellipse key={y} cx="0" cy={y} rx={Math.sqrt(120 * 120 - y * y)} ry="6" stroke={C.ink} strokeWidth="3" opacity="0.35" />)}
      {[0, 45, 90, 135].map((a) => <ellipse key={a} cx="0" cy="0" rx={Math.abs(Math.cos(((a + spin) * Math.PI) / 180)) * 120} ry="120" stroke={C.ink} strokeWidth="4" opacity="0.5" />)}
    </svg>
    {items.map(([k, t], i) => {
      const ang = (i / Math.max(1, items.length)) * 2 * Math.PI - Math.PI / 2;
      const x = 540 + Math.cos(ang) * 400; const y = 560 + Math.sin(ang) * 330;
      return <PopIn key={i} f={f - w(k) - (i % 3) * 3 + 2} style={{left: x, top: y, transform: `translate(-50%,-50%) scale(${pop(f - w(k) - (i % 3) * 3 + 2)})`}}><BlackChip style={{fontSize: 40, padding: '14px 26px'}}>{t}</BlackChip></PopIn>;
    })}
    {s.badge && <PopIn f={f - w(s.badge[0]) + 2} style={{left: 0, right: 0, top: 1000, textAlign: 'center'}}><div style={{display: 'inline-block', background: s.badge[2] ? RED : C.ink, color: '#fff', fontWeight: 900, fontSize: 60, borderRadius: 28, padding: '16px 40px', boxShadow: s.badge[2] ? RED_GLOW : glow('0,0,0', 0.2, 50)}}>{s.badge[1]}</div></PopIn>}
    <Guy x={-10} y={1040} sc={0.32} mood={s.mood ?? -0.3} f={f} hold={s.hold ?? 'laptop'} />
  </>);
};

// 11. A tool at work: a file drops into the app, a progress bar runs, the results pop out as cards.
const ToolDemo = ({f, w, s}) => {
  const drop = ease(f - w(s.input_word || 'upload') + 2, 12);
  const run = lerp(f, w(s.process_word || 'picks'), w(s.process_word || 'picks') + 40, 0, 1);
  const outs = s.outputs || [];
  return (<>
    <div style={{position: 'absolute', left: 70, top: 170, width: 940, height: 900, borderRadius: 34, background: '#fff', boxShadow: glow('0,0,0', 0.15, 80), overflow: 'hidden', opacity: ease(f - 2, 12),
      transform: `perspective(2200px) rotateX(${(1 - ease(f - 2, 16)) * 20}deg) rotateY(${(1 - ease(f - 2, 16)) * -20}deg)`}}>
      <div style={{height: 90, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px'}}>
        <Mark name={s.app} size={56} /><div style={{fontWeight: 900, fontSize: 40}}>{s.app}</div>
        {s.plan && <div style={{marginLeft: 'auto', background: '#fff', color: C.ink, borderRadius: 14, padding: '4px 16px', fontWeight: 800, fontSize: 26}}>{s.plan}</div>}
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 130, height: 220, borderRadius: 26, border: `5px dashed ${drop > 0.5 ? C.ink : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.ink, color: '#fff', borderRadius: 20, padding: '18px 30px', fontWeight: 800, fontSize: 38,
          transform: `translateY(${(1 - drop) * -260}px) rotate(${(1 - drop) * -8}deg)`, opacity: drop}}>
          <div style={{width: 0, height: 0, borderLeft: '26px solid #fff', borderTop: '16px solid transparent', borderBottom: '16px solid transparent'}} />{s.input || 'long-video.mp4'}
        </div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 390}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 32, color: MUTED}}><span>{s.process || 'Working...'}</span><span>{Math.round(run * 100)}%</span></div>
        <div style={{height: 26, borderRadius: 13, background: C.line, marginTop: 12, overflow: 'hidden'}}><div style={{width: `${run * 100}%`, height: '100%', background: C.ink}} /></div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 480, display: 'flex', gap: 20, flexWrap: 'wrap'}}>
        {outs.map(([k, t], i) => {
          const p = pop(f - w(k) - i * 4 + 2);
          return (
            <div key={i} style={{width: outs.length > 3 ? 196 : 270, height: outs.length > 3 ? 300 : 360, borderRadius: 22, background: ['linear-gradient(135deg,#E9C46A,#C9962F)', 'linear-gradient(135deg,#C7B8E8,#6E58B8)', 'linear-gradient(135deg,#A9C8E8,#3D6FA8)'][i % 3],
              transform: `scale(${p})`, display: 'flex', alignItems: 'flex-end', padding: 18, boxSizing: 'border-box', position: 'relative'}}>
              <div style={{position: 'absolute', left: 18, top: 18, width: 54, height: 54, borderRadius: 27, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderLeft: '18px solid #fff', marginLeft: 4}} /></div>
              <div style={{color: '#fff', fontWeight: 900, fontSize: outs.length > 3 ? 26 : 30, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.4)'}}>{t}</div>
            </div>
          );
        })}
      </div>
      {f > w(s.input_word || 'upload') - 18 && f < w(s.input_word || 'upload') + 4 && <Cursor x={lerp(f, w(s.input_word || 'upload') - 18, w(s.input_word || 'upload'), 700, 470)} y={lerp(f, w(s.input_word || 'upload') - 18, w(s.input_word || 'upload'), 600, 240)} press={f > w(s.input_word || 'upload') - 2 ? 1 : 0} />}
    </div>
    {s.limit && <FromSide f={f - w(s.limit[0]) + 4} side="left" style={{left: 70, top: 1110}}><BlackChip x={s.limit[2] !== false} style={{fontSize: 44}}>{s.limit[1]}</BlackChip></FromSide>}
    <Guy x={720} y={1040} sc={0.33} mood={-0.5} f={f} hold="laptop" />
  </>);
};

// 12. A follower ladder: each rung is a program and its threshold; the creator climbs as they are named.
const Ladder = ({f, w, s}) => {
  const rungs = s.rungs || [];
  const n = rungs.length;
  let at = 0; rungs.forEach(([k], i) => { if (f >= w(k) - 2) at = i; });
  const G = n > 3 ? 210 : 250; const pos = (i) => [70 + i * (n > 3 ? 35 : 70), 640 + ((n - 1) / 2 - i) * G];  // a staircase, lowest rung first, centred; keys starting with _ are rungs already shown
  return (<>
    {s.title && <div style={{position: 'absolute', left: 70, top: 130, fontWeight: 900, fontSize: 56, opacity: ease(f, 10)}}>{s.title}</div>}
    {rungs.map(([k, need, unlock, mark, money], i) => {
      const p = ease(f - w(k) + 6, 14);
      const [x, y] = pos(i);
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 800, opacity: 0.2 + 0.8 * p, transform: `perspective(1800px) rotateX(14deg) rotateZ(-2deg) translateY(${(1 - p) * 120}px)`}}>
          <div style={{background: C.ink, color: '#fff', borderRadius: 30, padding: '24px 30px', display: 'flex', alignItems: 'center', gap: 22, boxShadow: money && p > 0.5 ? '0 20px 70px rgba(46,125,79,0.45)' : glow('0,0,0', 0.12, 50)}}>
            {mark && <Mark name={mark} size={72} />}
            <div style={{minWidth: 0}}><div style={{fontWeight: 900, fontSize: 62, lineHeight: 1, color: money ? '#7BE0A0' : '#fff'}}>{need}</div><div style={{fontWeight: 700, fontSize: 34, opacity: 0.85, marginTop: 6}}>{unlock}</div></div>
          </div>
        </div>
      );
    })}
    {n > 0 && <Guy x={Math.min(pos(at)[0] + 560, 800)} y={pos(at)[1] - 200} sc={0.3} mood={rungs[at] && rungs[at][4] ? -0.9 : 0.2} f={f} hold={rungs[at] && rungs[at][4] ? 'money' : 'phone0'} />}
  </>);
};

// 13. A comparison table: columns are platforms, rows fill in as each line is spoken; `best` column glows green.
const Compare = ({f, w, s}) => {
  const cols = s.cols || []; const rows = s.rows || [];
  const cw = 760 / Math.max(1, cols.length);
  return (<>
    <Title f={f} text={s.title} top={140} size={56} />
    <div style={{position: 'absolute', left: 50, right: 50, top: 260, borderRadius: 34, background: '#fff', boxShadow: glow('0,0,0', 0.13, 70), overflow: 'hidden', opacity: ease(f - 2, 12),
      transform: `perspective(2200px) rotateX(${(1 - ease(f - 2, 16)) * 25}deg)`}}>
      <div style={{display: 'flex', height: 120, borderBottom: `3px solid ${C.line}`}}>
        <div style={{width: 220}} />
        {cols.map((c, i) => <div key={i} style={{width: cw, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 38, background: s.best === i && f > w(s.best_word || '') ? '#E3F0E7' : 'transparent'}}>{c}</div>)}
      </div>
      {rows.map(([k, label, cells, reds = []], r) => {
        const p = ease(f - w(k) + 4, 10);
        return (
          <div key={r} style={{display: 'flex', minHeight: 130, borderBottom: r < rows.length - 1 ? `3px solid ${C.line}` : 'none', opacity: 0.2 + 0.8 * p}}>
            <div style={{width: 220, display: 'flex', alignItems: 'center', padding: '0 24px', fontWeight: 800, fontSize: 32, color: MUTED, lineHeight: 1.15}}>{label}</div>
            {cells.map((c, i) => (
              <div key={i} style={{width: cw, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontWeight: 900, fontSize: String(c).length > 8 ? 32 : 44, padding: '0 10px', lineHeight: 1.15,
                color: reds.includes(i) ? RED : C.ink, transform: `scale(${p > 0 ? pop(f - w(k) - i * 3 + 4) : 0})`, background: s.best === i && f > w(s.best_word || '') ? '#E3F0E7' : 'transparent'}}>{c}</div>
            ))}
          </div>
        );
      })}
    </div>
    <Guy x={680} y={1060} sc={0.3} mood={-0.4} f={f} hold="laptop" />
    <Source f={f} text={s.source} top={1350} />
  </>);
};

// 14. A checklist on a clipboard: items tick as they are named (requirements, what to prepare).
const Checklist = ({f, w, s}) => {
  const items = s.items || [];
  return (<>
    <div style={{position: 'absolute', left: 140, top: 170, width: 800, height: 220 + items.length * 140, borderRadius: 30, background: '#fff', boxShadow: glow('0,0,0', 0.16, 80),
      transform: `perspective(2200px) rotateY(${-8 + (1 - ease(f - 2, 16)) * 40}deg) rotateX(5deg) translateX(${(1 - ease(f - 2, 16)) * 300}px)`, opacity: ease(f - 2, 10)}}>
      <div style={{position: 'absolute', left: 280, top: -30, width: 240, height: 70, borderRadius: 18, background: C.ink}} />
      <div style={{position: 'absolute', left: 60, top: 70, fontWeight: 900, fontSize: 54}}>{s.title || 'Checklist'}</div>
      {items.map(([k, t, bad], i) => {
        const tk = ease(f - w(k) + 2, 8);
        return (
          <div key={i} style={{position: 'absolute', left: 60, right: 40, top: 170 + i * 140, display: 'flex', alignItems: 'center', gap: 28}}>
            <div style={{width: 76, height: 76, borderRadius: 18, border: `6px solid ${bad ? RED : C.ink}`, position: 'relative', background: tk > 0.5 ? (bad ? RED : C.ink) : '#fff', flexShrink: 0}}>
              {bad ? (tk > 0.5 && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 44}}>✕</div>)
                : <svg width="76" height="76" style={{position: 'absolute', left: -6, top: -6}} fill="none"><path d="M18 40 L32 54 L60 24" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - tk)} /></svg>}
            </div>
            <div style={{fontWeight: 900, fontSize: 46, lineHeight: 1.12, opacity: 0.4 + 0.6 * Math.max(tk, 0.3)}}>{t}</div>
          </div>
        );
      })}
    </div>
    <Guy x={720} y={1030} sc={0.34} mood={s.mood ?? -0.6} f={f} hold={s.hold ?? 'laptop'} />
  </>);
};

// 15. The creator alone, big, with speech/thought chips: for opinion lines, questions and transitions.
const Talk = ({f, w, s}) => {
  const chips = s.chips || [];
  return (<>
    <Guy x={lerp(ease(f, 14), 0, 1, -200, 70)} y={300} sc={0.95} mood={s.mood ?? 0} f={f} hold={s.hold ?? null} />
    {chips.map(([k, t, kind], i) => (
      <PopIn key={i} f={f - w(k) + 2} style={{left: [80, 520, 140, 560][i % 4], top: [180, 230, 1020, 1060][i % 4], transform: `rotate(${i % 2 ? 5 : -5}deg) scale(${pop(f - w(k) + 2)})`}}>
        <div style={{background: kind === 'green' ? C.acc : kind === 'red' ? RED : C.ink, color: '#fff', borderRadius: 26, padding: '16px 30px', fontWeight: 900, fontSize: 46, whiteSpace: 'nowrap',
          boxShadow: kind === 'green' ? GREEN_GLOW : kind === 'red' ? RED_GLOW : glow('0,0,0', 0.2, 50)}}>{t}</div>
      </PopIn>
    ))}
  </>);
};

export const SCENES3 = {
  page_card: PageCard, stat_cards: StatCards, fee_split: FeeSplit, calc: Calc, myth: Myth, steps: Steps, chat: Chat, progress: Progress,
  timeline: Timeline, countries: Countries, tool_demo: ToolDemo, ladder: Ladder, compare: Compare, checklist: Checklist, talk: Talk,
};
