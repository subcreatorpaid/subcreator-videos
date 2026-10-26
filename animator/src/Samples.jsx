// 5 style samples for video 1, round 2 (owner notes 26 Oct 2026, 10:00 UTC): real logos, green only for money,
// red for loss or denial, the same creator face acting out each step, real app pages, sound effects (added by samples_sfx.py).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Img, staticFile} from 'remotion';
import {C, FONT, Fonts} from './Short';
import {RED, ease, pop, glow, FromSide, PopIn, CountUp, RedPill, Logo, BRAND_GLOW, Subtitle, Handle, Face, Phone, Cursor, Chip, ReelWall, Stamp, DrawLine} from './graphics';

const Bg = ({children}) => (
  <AbsoluteFill style={{background: C.bg, overflow: 'hidden', fontFamily: FONT, color: C.ink}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: '90px 90px', opacity: 0.35}} />
    <Fonts />{children}
  </AbsoluteFill>
);
const sub = (f, chunks) => { let cur = chunks[0]; chunks.forEach((c) => { if (f >= c[0]) cur = c; }); return cur; };

// 1. Hook: real logos, each card with its own platform glow and accent line; followers tick up; black Earned card with red $0.00.
const S1 = ({f}) => {
  const out = ease(f - 118, 14);
  const rows = [['instagram', 'Instagram', 847, 12, 'left'], ['tiktok', 'TikTok', 1204, 31, 'right'], ['youtube', 'YouTube', 392, 5, 'left']];
  const s = sub(f, [[0, 'Hundreds of followers,', [], []], [40, 'posting every week,', [], []], [78, 'and still zero dollars?', [], ['zero']]]);
  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-1100 * out}px)`}}>
        {rows.map(([ic, name, n, plus, side], i) => (
          <FromSide key={ic} f={f - i * 6} side={side} style={{left: 80, right: 80, top: 260 + i * 240}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 30, padding: '34px 44px', background: '#fff', borderRadius: 40, position: 'relative', overflow: 'hidden',
              boxShadow: `0 18px 70px rgba(${BRAND_GLOW[ic]},0.28), 0 0 0 3px rgba(${BRAND_GLOW[ic]},0.18)`}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: `rgb(${BRAND_GLOW[ic]})`}} />
              <Logo name={ic} size={96} />
              <div style={{flex: 1, fontWeight: 700, fontSize: 46}}>{name}</div>
              <div style={{fontWeight: 900, fontSize: 84}}><CountUp f={f - i * 6} from={n * 0.4} to={n} d={45} /></div>
            </div>
          </FromSide>
        ))}
        <FromSide f={f - 72} side="right" style={{left: 80, right: 80, top: 1010}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 44px', background: C.ink, color: '#fff', borderRadius: 40,
            boxShadow: `0 20px 80px rgba(217,58,58,0.45), 0 0 0 3px rgba(217,58,58,0.5)`}}>
            <div style={{fontWeight: 800, fontSize: 54}}>Earned</div><RedPill size={96}>$0.00</RedPill>
          </div>
        </FromSide>
      </div>
      <div style={{position: 'absolute', left: 1080 * (1 - out) + 60, top: 300, opacity: out}}><Face mood={0.7} f={f} size={760} /></div>
      <Subtitle text={s[1]} hi={s[2]} red={s[3]} /><Handle />
    </Bg>
  );
};

// A UGC ad playing on a phone screen (product spins in, "Ad" tag, Shop now).
const AdScreen = ({f}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #F4EDE4, #E7D9C6)', fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 30, top: 40, background: C.ink, color: '#fff', fontWeight: 800, fontSize: 26, padding: '4px 14px', borderRadius: 8}}>Ad</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontWeight: 900, fontSize: 40, padding: '0 30px'}}>ok I was NOT expecting this</div>
    <div style={{position: 'absolute', left: '50%', top: 330, width: 130, height: 290, marginLeft: -65, borderRadius: 30, background: C.acc, transform: `perspective(800px) rotateY(${f * 4}deg)`}}>
      <div style={{position: 'absolute', left: 30, right: 30, top: -40, height: 50, borderRadius: 12, background: C.ink}} />
      <div style={{position: 'absolute', left: 15, right: 15, top: 110, height: 60, borderRadius: 10, background: '#fff'}} />
    </div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 680, height: 160, borderRadius: 16, background: '#C49A6C', border: `6px solid ${C.ink}`}} />
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 50, background: C.ink, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 34, padding: 22, borderRadius: 20}}>Shop now</div>
  </div>
);

// 2. (Owner's favourite) Face gets frustrated, "Followers" struck in red; his phone flies forward in 3D and becomes a UGC ad,
// a green payout lands and he turns happy. Green appears only with the money.
const S2 = ({f}) => {
  const mood = interpolate(f, [6, 46, 96, 118], [0, 1, 1, -1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const strike = ease(f - 56, 10);
  const fly = ease(f - 86, 18);
  const pay = ease(f - 112, 10);
  const s = sub(f, [[0, "That's not a", [], []], [30, 'follower problem.', [], []], [86, 'Brands pay for videos.', ['videos'], []]]);
  return (
    <Bg>
      <div style={{position: 'absolute', left: 120 - fly * 120, top: 170 + fly * 640, transform: `scale(${1 - fly * 0.45})`, transformOrigin: 'left top'}}>
        <Face mood={mood} f={f} size={780} hold={fly > 0.05 ? (pay > 0.5 ? 'money' : null) : 'phone0'} />
      </div>
      <div style={{opacity: 1 - fly}}>
        <PopIn f={f - 14} style={{left: 60, top: 220, transform: `rotate(-7deg) scale(${pop(f - 14)})`}}><Chip style={{position: 'static'}}>847 followers</Chip></PopIn>
        <PopIn f={f - 22} style={{right: 50, top: 760, transform: `rotate(6deg) scale(${pop(f - 22)})`}}><Chip style={{position: 'static'}}>posting daily</Chip></PopIn>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontWeight: 900, fontSize: 130, opacity: ease(f - 44, 8), color: strike > 0 ? '#A9A79F' : C.ink}}>
          <span style={{position: 'relative'}}>Followers
            <span style={{position: 'absolute', left: -10, top: '52%', height: 18, width: `${strike * 104}%`, background: RED, borderRadius: 9}} />
          </span>
        </div>
      </div>
      {fly > 0 && (
        <Phone w={520} h={1040} tilt={interpolate(fly, [0, 1], [70, -10])} style={{left: interpolate(fly, [0, 1], [700, 400]), top: interpolate(fly, [0, 1], [700, 150]),
          transform: `perspective(2200px) rotateY(${interpolate(fly, [0, 1], [70, -10])}deg) rotateX(${(1 - fly) * 20}deg) scale(${interpolate(fly, [0, 1], [0.2, 1])})`, transformOrigin: 'center'}}>
          <AdScreen f={f} />
        </Phone>
      )}
      <div style={{position: 'absolute', left: 300, top: 110, opacity: pay, transform: `translateY(${(1 - pay) * -80}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, background: '#fff', borderRadius: 30, padding: '20px 30px', boxShadow: '0 0 60px rgba(46,125,79,0.45)', border: `4px solid ${C.acc}`}}>
          <div style={{width: 60, height: 60, borderRadius: 16, background: C.acc, color: '#fff', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>
          <div><div style={{fontWeight: 700, fontSize: 28, color: '#5F5E58'}}>Brand payment</div><div style={{fontWeight: 900, fontSize: 48, color: C.acc}}>+$150</div></div>
        </div>
      </div>
      <Subtitle text={s[1]} hi={s[2]} red={s[3]} /><Handle />
    </Bg>
  );
};

// 3. Real app pages on the phone (phone-view snaps of the live sites, 26 Oct 2026), the creator follows along on a laptop;
// small light cursor taps the real buttons. Screen coords are in phone-screen px (476 x 1036 for a 1170 x 2532 snap).
const Shot = ({src, show = 1}) => (
  <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: '100%', opacity: show}} />
);
const S3 = ({f}) => {
  const inP = ease(f, 16);
  const swap = ease(f - 92, 16);
  const page2 = ease(f - 42, 8);
  const press = (t) => (f > t && f < t + 7 ? 1 : 0);
  const ring = ease(f - 56, 10) * (1 - ease(f - 88, 6));
  const s = sub(f, [[0, 'Billo: sign up free, 0 followers.', ['free'], []], [50, 'Creators from US, UK, Canada.', [], []], [92, 'JoinBrands is free to join.', ['free'], []]]);
  return (
    <Bg>
      <div style={{position: 'absolute', left: -20, top: 860, transform: `translateX(${(1 - ease(f - 6, 14)) * -500}px)`}}><Face mood={-0.3} f={f} size={400} hold="laptop" /></div>
      <Phone w={520} h={860} tilt={interpolate(inP, [0, 1], [-40, -10]) - swap * 50} style={{left: 500 + 700 * (1 - inP) - 1100 * swap, top: 150}}>
        <Shot src="snap_billo_home.png" />
        <Shot src="snap_billo_countries.png" show={page2} />
        <div style={{position: 'absolute', left: 14, right: 14, top: 164, height: 50, borderRadius: 25, border: `5px solid ${C.ink}`, opacity: ring, boxShadow: '0 0 30px rgba(0,0,0,0.25)'}} />
        <div style={{position: 'absolute', left: 110, right: 110, top: 214, height: 48, borderRadius: 25, border: `5px solid ${C.ink}`, opacity: ring}} />
        {f < 46 && <Cursor x={interpolate(f, [14, 34], [380, 238], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} y={interpolate(f, [14, 34], [760, 569], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} press={press(36)} />}
      </Phone>
      <Phone w={520} h={860} tilt={interpolate(swap, [0, 1], [40, -10])} style={{left: 500 + 900 * (1 - swap), top: 150, opacity: swap > 0 ? 1 : 0}}>
        <Shot src="snap_jb.png" />
        {f > 104 && <Cursor x={interpolate(f, [104, 120], [330, 127], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} y={interpolate(f, [104, 120], [800, 699], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} press={press(122)} />}
      </Phone>
      <Subtitle text={s[1]} hi={s[2]} red={s[3]} /><Handle />
    </Bg>
  );
};

// 4. 3D wall of YouTube-style videos scrolling like a feed; red NOT SPONSORED stamp (a denial = red).
const S4 = ({f}) => {
  const s = sub(f, [[0, 'Film 3 samples on your phone.', ['3'], []], [56, 'Label them not sponsored.', [], ['not']]]);
  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, opacity: ease(f, 10)}}><ReelWall f={f + 20} /></div>
      <div style={{position: 'absolute', left: 40, top: 60, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 24, padding: '12px 22px', boxShadow: glow('0,0,0', 0.15, 40)}}>
        <Logo name="youtube" size={64} /><span style={{fontWeight: 900, fontSize: 40}}>Sample videos</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: `linear-gradient(180deg, rgba(246,245,241,0), ${C.bg} 30%)`}} />
      {f >= 56 && <Stamp f={f - 56} text="NOT SPONSORED" color={RED} style={{left: 110, top: 760}} />}
      <Subtitle text={s[1]} hi={s[2]} red={s[3]} /><Handle />
    </Bg>
  );
};

// 5. The path: one line, the camera glides from step to step, and the creator acts out each one
// (frustrated -> filming -> applying -> calling -> paid). Chips are solid; green only on the paid step.
const STEPS = [
  {t: '0 followers', hold: 'phone0', mood: 1},
  {t: 'Film 3 samples', hold: 'film', mood: 0},
  {t: 'Apply on Billo', hold: 'laptop', mood: -0.2},
  {t: 'Pitch on JoinBrands', hold: 'call', mood: -0.4},
  {t: 'First $50 video', hold: 'money', mood: -1},
];
const S5 = ({f}) => {
  const T = 22, GAP = 560;
  const Y = (i) => 300 + i * GAP;
  const L = (i) => i % 2 === 0;
  let cam = Y(0) - 330;
  STEPS.forEach((_, i) => { if (i > 0) cam += GAP * ease(f - i * T + 4, 16); });
  const book = ease(f - 112, 14);
  const X = (i) => (L(i) ? 300 : 780);
  const path = `M${X(0)} ${Y(0) + 50}` + STEPS.slice(1).map((_, j) => { const i = j + 1; return ` C ${X(i - 1)} ${Y(i - 1) + 330}, ${X(i)} ${Y(i) - 230}, ${X(i)} ${Y(i) + 50}`; }).join('');
  const s = sub(f, [[0, 'Here is the path.', [], []], [T * 4, 'First paid video.', ['paid'], []], [112, 'Comment GUIDE for all steps.', ['guide'], []]]);
  return (
    <Bg>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 4000, transform: `translateY(${-cam}px)`, opacity: 1 - book * 0.85}}>
        <DrawLine d={path} p={ease(f, T * 4 + 8)} color={C.ink} width={10} len={3000} />
        {STEPS.map((p, i) => (
          <React.Fragment key={i}>
            <FromSide f={f - i * T} side={L(i) ? 'left' : 'right'} dist={500} style={{left: L(i) ? 60 : 500, top: Y(i)}}>
              <Chip green={i === 4} dark={i !== 4} style={{position: 'static'}}>{p.t}</Chip>
            </FromSide>
            <div style={{position: 'absolute', left: L(i) ? 470 : 20, top: Y(i) + 90, opacity: ease(f - i * T - 4, 10), transform: `scale(${0.9 + 0.1 * ease(f - i * T - 4, 10)})`}}>
              <Face mood={p.mood} f={f} size={430} hold={p.hold} />
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{position: 'absolute', left: 290, top: 300, width: 500, height: 660, opacity: book, transform: `perspective(1800px) translateY(${(1 - book) * 300}px) rotateY(${-24 + book * 10}deg) rotateX(6deg)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '12px 30px 30px 12px', background: `linear-gradient(150deg, ${C.ink}, #2B2B2B)`, boxShadow: `0 30px 90px rgba(46,125,79,0.35)`, padding: 50, boxSizing: 'border-box', color: '#fff'}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 4, color: '#7BE0A0'}}>FREE GUIDE</div>
          <div style={{fontSize: 74, fontWeight: 900, lineHeight: 1.05, marginTop: 20}}>UGC: your first paid video</div>
          <div style={{position: 'absolute', left: 50, right: 50, bottom: 110, height: 8, borderRadius: 4, background: C.acc}} />
          <div style={{position: 'absolute', left: 50, bottom: 50, fontSize: 30, fontWeight: 700}}>subcreatorpaid.com</div>
        </div>
        <div style={{position: 'absolute', left: -16, top: 10, bottom: 10, width: 24, borderRadius: 8, background: '#000'}} />
      </div>
      <PopIn f={f - 124} style={{left: 0, right: 0, top: 1030, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: C.ink, color: '#fff', fontWeight: 900, fontSize: 64, padding: '18px 44px', borderRadius: 30}}>Comment <span style={{background: C.acc, borderRadius: 14, padding: '0 16px'}}>GUIDE</span></div>
      </PopIn>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1380, height: 540, background: C.bg}} />
      <Subtitle text={s[1]} hi={s[2]} red={s[3]} /><Handle />
    </Bg>
  );
};

const SCENES = [S1, S2, S3, S4, S5];
export const Sample = ({n = 1, ...rest}) => {
  const f = useCurrentFrame();
  const S = SCENES[(n - 1) % 5];
  return <S f={f} {...rest} />;
};
