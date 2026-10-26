// 5 style samples for video 1 (owner review 26 Oct 2026). Each is 5 s and shows how one scene hands over to the next with no gap.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {C, FONT, Fonts} from './Short';
import {RED, ease, pop, glow, FromSide, PopIn, CountUp, RedPill, PlatformIcon, GlowCard, Subtitle, Handle, Face, Phone, Cursor, Chip, ReelWall, Stamp, DrawLine} from './graphics';

const Bg = ({children}) => (
  <AbsoluteFill style={{background: C.bg, overflow: 'hidden', fontFamily: FONT, color: C.ink}}>
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: '90px 90px', opacity: 0.35}} />
    <Fonts />{children}
  </AbsoluteFill>
);
const sub = (f, chunks) => { let cur = chunks[0]; chunks.forEach((c) => { if (f >= c[0]) cur = c; }); return cur; };

// 1. Hook: follower counts tick up on 3 platforms, red $0 on top and on Earned, then the cards push out to the left.
const S1 = ({f}) => {
  const out = ease(f - 118, 14);
  const rows = [['instagram', 'Instagram', 847, 12, 'left'], ['tiktok', 'TikTok', 1204, 31, 'right'], ['youtube', 'YouTube', 392, 5, 'left']];
  const s = sub(f, [[0, 'Hundreds of followers,', []], [40, 'posting every week,', []], [78, 'and still zero dollars?', ['zero']]]);
  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${-1100 * out}px)`}}>
        <PopIn f={f - 62} style={{left: 0, right: 0, top: 170, textAlign: 'center'}}><RedPill size={110}>$0</RedPill></PopIn>
        {rows.map(([ic, name, n, plus, side], i) => (
          <FromSide key={ic} f={f - i * 6} side={side} style={{left: 80, right: 80, top: 400 + i * 220}}>
            <GlowCard style={{display: 'flex', alignItems: 'center', gap: 30, padding: '36px 44px'}}>
              <PlatformIcon name={ic} size={84} />
              <div style={{flex: 1, fontWeight: 700, fontSize: 46}}>{name}</div>
              <div style={{fontWeight: 900, fontSize: 80}}><CountUp f={f - i * 6} from={n * 0.4} to={n} d={45} /></div>
              <div style={{color: C.acc, fontWeight: 900, fontSize: 44, opacity: ease(f - 40 - i * 6, 8)}}>+{plus}</div>
            </GlowCard>
          </FromSide>
        ))}
        <FromSide f={f - 76} side="right" style={{left: 80, right: 80, top: 1100}}>
          <GlowCard tint="217,58,58" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 44px'}}>
            <div style={{fontWeight: 800, fontSize: 52}}>Earned</div><RedPill size={88}>$0.00</RedPill>
          </GlowCard>
        </FromSide>
      </div>
      <div style={{position: 'absolute', left: 1080 * (1 - out) + 140, top: 330, opacity: out}}><Face mood={0.3} f={f} size={800} /></div>
      <Subtitle text={s[1]} red={s[2]} /><Handle />
    </Bg>
  );
};

// 2. Face reacts; "Followers" gets crossed out; a green panel wipes in with "Videos".
const S2 = ({f}) => {
  const mood = ease(f - 6, 40);
  const strike = ease(f - 58, 10);
  const wipe = ease(f - 92, 16);
  const s = sub(f, [[0, "That's not a", []], [30, 'follower problem.', []], [86, 'Brands pay for videos.', ['videos']]]);
  return (
    <Bg>
      <div style={{position: 'absolute', left: 140, top: 170}}><Face mood={mood} f={f} size={800} /></div>
      <PopIn f={f - 14} style={{left: 60, top: 230, transform: `rotate(-7deg) scale(${pop(f - 14)})`}}><Chip style={{position: 'static'}}>847 followers</Chip></PopIn>
      <PopIn f={f - 22} style={{right: 50, top: 760, transform: `rotate(6deg) scale(${pop(f - 22)})`}}><Chip style={{position: 'static'}}>posting daily</Chip></PopIn>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontWeight: 900, fontSize: 130, opacity: ease(f - 44, 8), color: strike > 0 ? '#A9A79F' : C.ink}}>
        <span style={{position: 'relative'}}>Followers
          <span style={{position: 'absolute', left: -10, top: '52%', height: 18, width: `${strike * 104}%`, background: RED, borderRadius: 9}} />
        </span>
      </div>
      <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: `${wipe * 100}%`, background: C.acc, overflow: 'hidden'}}>
        <div style={{position: 'absolute', right: 0, width: 1080, top: 560, textAlign: 'center', color: '#fff'}}>
          <div style={{fontSize: 46, fontWeight: 800, letterSpacing: 6, opacity: 0.8}}>WHAT BRANDS BUY</div>
          <div style={{fontSize: 190, fontWeight: 900}}>Videos</div>
          <div style={{display: 'inline-block', marginTop: 20, background: '#fff', color: C.acc, fontWeight: 900, fontSize: 80, padding: '8px 40px', borderRadius: 24}}>$50+</div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, color: wipe > 0.6 ? '#fff' : C.ink}}>
        <Subtitle text={s[1]} hi={wipe > 0.6 ? [] : s[2]} /><Handle />
      </div>
    </Bg>
  );
};

// 3. Real-app style sign-up: phone turns in from the right, a finger taps each field, step chips pop out left and right, then swipes to the next app.
const Field = ({label, value, on, done}) => (
  <div style={{border: `5px solid ${on ? C.acc : C.line}`, borderRadius: 26, padding: '22px 24px', fontSize: 30, fontWeight: 700, display: 'flex', justifyContent: 'space-between', color: C.ink}}>
    <span style={{color: '#5F5E58'}}>{label}</span><span>{value}{done ? '  ✓' : ''}</span>
  </div>
);
const S3 = ({f}) => {
  const inP = ease(f, 16);
  const swap = ease(f - 112, 16);
  const email = 'you@email.com'.slice(0, Math.max(0, Math.floor((f - 22) / 1.6)));
  const cur = f < 50 ? [400, 314] : f < 80 ? [400, 428] : f < 96 ? [400, 548] : [280, 713];
  const press = (t) => (f > t && f < t + 6 ? 1 : 0);
  const s = sub(f, [[0, 'Billo: sign up with your email,', ['email']], [50, 'pick US, UK or Canada,', []], [80, 'no follower minimum.', ['no']], [112, 'JoinBrands is free to join.', ['free']]]);
  return (
    <Bg>
      <Phone tilt={interpolate(inP, [0, 1], [-40, 10]) - swap * 50} style={{left: 260 + 700 * (1 - inP) - 1100 * swap, top: 150, opacity: 1 - swap * 0.6}}>
        <div style={{padding: '70px 44px', fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 26}}>
          <div style={{fontSize: 30, fontWeight: 800, color: C.acc}}>billo</div>
          <div style={{fontSize: 52, fontWeight: 900, lineHeight: 1.1}}>Become a Billo creator</div>
          <Field label="Email" value={email} on={f >= 20 && f < 50} />
          <Field label="Country" value={f >= 56 ? 'United States' : ''} on={f >= 50 && f < 80} />
          <Field label="Followers" value={f >= 84 ? 'not needed' : ''} on={f >= 80} done={f >= 84} />
          <div style={{marginTop: 40, background: f >= 100 ? C.acc : C.ink, color: '#fff', borderRadius: 30, padding: 30, textAlign: 'center', fontSize: 38, fontWeight: 800}}>Sign up</div>
        </div>
        <Cursor x={cur[0]} y={cur[1]} press={press(22) || press(52) || press(82) || press(100)} />
      </Phone>
      <Phone tilt={interpolate(swap, [0, 1], [40, -8])} style={{left: 260 + 900 * (1 - swap), top: 150, opacity: swap}}>
        <div style={{padding: '70px 44px', fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 26}}>
          <div style={{fontSize: 30, fontWeight: 800, color: '#3D6FA8'}}>JoinBrands</div>
          <div style={{fontSize: 52, fontWeight: 900, lineHeight: 1.1}}>Join for free</div>
          <Field label="Email" value="you@email.com" />
          <Field label="Followers" value="any" done />
          <Field label="Price" value="Free" on done />
          <div style={{marginTop: 40, background: C.acc, color: '#fff', borderRadius: 30, padding: 30, textAlign: 'center', fontSize: 38, fontWeight: 800}}>Start pitching brands</div>
        </div>
      </Phone>
      <FromSide f={f - 24} side="left" style={{left: 40, top: 420}}><Chip style={{position: 'static'}}>1  Email</Chip></FromSide>
      <FromSide f={f - 54} side="right" style={{right: 40, top: 640}}><Chip style={{position: 'static'}}>2  US · UK · CA</Chip></FromSide>
      <FromSide f={f - 84} side="left" style={{left: 40, top: 900}}><Chip green style={{position: 'static'}}>0 followers OK</Chip></FromSide>
      <Subtitle text={s[1]} hi={s[2]} /><Handle />
    </Bg>
  );
};

// 4. 3D reel wall of sample videos scrolling; black NOT SPONSORED stamp slams on.
const S4 = ({f}) => {
  const s = sub(f, [[0, 'Film 3 samples on your phone.', ['3']], [56, 'Label them not sponsored.', []]]);
  return (
    <Bg>
      <div style={{position: 'absolute', inset: 0, opacity: ease(f, 10)}}><ReelWall f={f + 20} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: `linear-gradient(180deg, rgba(246,245,241,0), ${C.bg} 30%)`}} />
      {f >= 56 && <Stamp f={f - 56} text="NOT SPONSORED" style={{left: 110, top: 760}} />}
      <Subtitle text={s[1]} hi={s[2]} /><Handle />
    </Bg>
  );
};

// 5. One line runs through the steps; the camera follows it down; ends on the free guide pop-up.
const S5 = ({f}) => {
  const cam = interpolate(f, [0, 110], [0, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const steps = [[100, 220, 'left', '0 followers'], [560, 520, 'right', '3 phone samples'], [100, 820, 'left', 'Apply on Billo'], [480, 1120, 'right', 'Pitch on JoinBrands'], [260, 1440, 'left', 'First $50 video']];
  const book = ease(f - 104, 14);
  const s = sub(f, [[0, 'Here is the path.', []], [104, 'Comment GUIDE for all steps.', ['guide']]]);
  return (
    <Bg>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 3000, transform: `translateY(${-cam}px)`, opacity: 1 - book * 0.8}}>
        <DrawLine d="M200 160 C 900 220, 900 420, 600 560 S 120 760, 300 880 S 960 1000, 700 1160 S 200 1360, 420 1480" p={ease(f, 110)} />
        {steps.map(([x, y, side, t], i) => (
          <FromSide key={i} f={f - i * 20} side={side} dist={500} style={{left: x, top: y}}>
            <Chip green={i === 4} style={{position: 'static'}}>{t}</Chip>
          </FromSide>
        ))}
      </div>
      <div style={{position: 'absolute', left: 290, top: 300, width: 500, height: 660, opacity: book, transform: `perspective(1800px) translateY(${(1 - book) * 300}px) rotateY(${-24 + book * 10}deg) rotateX(6deg)`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '12px 30px 30px 12px', background: `linear-gradient(150deg, ${C.acc}, #1F5A38)`, boxShadow: glow('46,125,79', 0.4, 90), padding: 50, boxSizing: 'border-box', color: '#fff'}}>
          <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 4, opacity: 0.8}}>FREE GUIDE</div>
          <div style={{fontSize: 74, fontWeight: 900, lineHeight: 1.05, marginTop: 20}}>UGC: your first paid video</div>
          <div style={{position: 'absolute', left: 50, bottom: 50, fontSize: 30, fontWeight: 700}}>subcreatorpaid.com</div>
        </div>
        <div style={{position: 'absolute', left: -16, top: 10, bottom: 10, width: 24, borderRadius: 8, background: '#16432A'}} />
      </div>
      <PopIn f={f - 118} style={{left: 0, right: 0, top: 1030, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: C.ink, color: '#fff', fontWeight: 900, fontSize: 64, padding: '18px 44px', borderRadius: 30}}>Comment <span style={{background: C.acc, borderRadius: 14, padding: '0 16px'}}>GUIDE</span></div>
      </PopIn>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1360, height: 560, background: C.bg, opacity: 0.92}} />
      <Subtitle text={s[1]} hi={s[2]} /><Handle />
    </Bg>
  );
};

const SCENES = [S1, S2, S3, S4, S5];
export const Sample = ({n = 1}) => {
  const f = useCurrentFrame();
  const S = SCENES[(n - 1) % 5];
  return <S f={f} />;
};
