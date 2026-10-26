// Story-style scenes for the second batch (26 Oct 2026, owner: "use more animations that suit the videos").
// Same rules as Story.jsx: the same creator face acts out every line, green only for money, red for loss/denial,
// soft glows, elements enter from the sides or pop, nothing rises cheaply from the bottom.
// Scene props: f = frames since the scene started, w('word') = frame of that spoken word, s = beat.show, len = scene length.
import React from 'react';
import {interpolate} from 'remotion';
import {C, FONT} from './Short';
import {RED, ease, pop, glow, FromSide, PopIn, Logo, Face, Phone, Cursor, Stamp, DrawLine, XMark, BlackChip, Payout} from './graphics';

const lerp = (f, a, b, x, y) => interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const MUTED = '#5F5E58';

// The creator, placed and scaled (Face size 700 = 933 x 875 px before scaling).
const Guy = ({x, y, sc = 0.4, mood = 0, f, hold = null, o = 1, flip = false}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${flip ? -sc : sc}, ${sc})`, transformOrigin: flip ? 'right top' : 'left top', opacity: o, ...(flip ? {marginLeft: -933} : {})}}>
    <Face mood={mood} f={f} size={700} hold={hold} />
  </div>
);

// "1  Billo" style heading.
const NumHead = ({f, n, title, logo, top = 150}) => (
  <PopIn f={f - 2} origin="left center" style={{left: 70, top}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      {n != null && <div style={{width: 64, height: 64, borderRadius: 32, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>}
      {logo ? <Logo name={logo} size={72} /> : null}<div style={{fontWeight: 900, fontSize: 60, whiteSpace: 'nowrap'}}>{title}</div>
    </div>
  </PopIn>
);

// ---------- video 4: 3 UGC samples with your phone
const NoSamples = ({f, w}) => {
  const open = ease(f - w('without') + 2, 14);
  const slots = f >= w('three') - 4;
  const lift = ease(f - w('three') + 4, 12);
  return (<>
    <FromSide f={f - 2} side="right" style={{left: 70, right: 70, top: 150}}>
      <div style={{display: 'flex', gap: 24, alignItems: 'center', background: '#fff', borderRadius: 36, padding: '28px 34px', boxShadow: glow('0,0,0', 0.14, 60)}}>
        <div style={{width: 92, height: 92, borderRadius: 46, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>B</div>
        <div><div style={{fontWeight: 700, fontSize: 32, color: MUTED}}>Brand partnerships</div><div style={{fontWeight: 800, fontSize: 44, lineHeight: 1.15}}>Love your page! Can we see your samples?</div></div>
      </div>
    </FromSide>
    <div style={{position: 'absolute', left: 430, top: 520, width: 560, height: 400, opacity: ease(f - 6, 10) * (1 - lift), transform: `translateY(${-lift * 80}px) scale(${1 - lift * 0.15})`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 220, height: 70, borderRadius: '24px 24px 0 0', background: '#2B2B2B'}} />
      <div style={{position: 'absolute', left: 0, top: 50, right: 0, bottom: 0, borderRadius: 30, background: '#2B2B2B'}} />
      <div style={{position: 'absolute', left: 40, top: 110, right: 40, bottom: 40, borderRadius: 16, background: '#F6F5F1', opacity: open}} />
      <div style={{position: 'absolute', left: 0, top: 90, right: 0, bottom: 0, borderRadius: 30, background: C.ink, transformOrigin: 'bottom center',
        transform: `perspective(1400px) rotateX(${-open * 58}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 52}}>My samples</div>
    </div>
    <PopIn f={f - w('without') - 8} style={{left: 600, top: 440, transform: `rotate(6deg) scale(${pop(f - w('without') - 8)})`}}><div style={{opacity: 1 - lift}}><BlackChip x>0 samples</BlackChip></div></PopIn>
    {slots && [0, 1, 2].map((i) => {
      const p = ease(f - w('three') - i * 5 + 4, 12);
      return (
        <div key={i} style={{position: 'absolute', left: 90 + i * 310, top: 640, width: 280, height: 420, borderRadius: 30, border: `6px dashed ${C.ink}`, opacity: p,
          transform: `perspective(1600px) rotateY(${(1 - p) * 80}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)'}}>
          <div style={{fontWeight: 900, fontSize: 150, color: C.ink}}>{i + 1}</div>
        </div>
      );
    })}
    <Guy x={-10} y={slots ? 1010 : 560} sc={slots ? 0.38 : 0.47} mood={slots ? -0.4 : lerp(f, 0, w('without'), 0.2, 0.95)} f={f} hold={slots ? 'film' : 'phone0'} />
  </>);
};

// A phone in camera mode filming one sample: REC, timer, thirds grid, corner brackets, the shot itself.
const BoxShot = ({f, open}) => (<>
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #FBF3E4 0%, #EADBC4 100%)'}} />
  <div style={{position: 'absolute', left: -200, top: -100, width: 500, height: 1300, background: 'linear-gradient(90deg, rgba(255,250,235,0), rgba(255,250,235,0.85), rgba(255,250,235,0))', transform: 'rotate(28deg)', opacity: 0.8}} />
  <div style={{position: 'absolute', left: 300, top: 60, width: 150, height: 220, borderRadius: 12, border: '10px solid #fff', background: 'rgba(210,230,245,0.7)'}}>
    <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 8, marginLeft: -4, background: '#fff'}} />
  </div>
  <div style={{position: 'absolute', left: 120, top: 330, width: 220, height: 360, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 60, top: 360 - open * 260, width: 100, height: 230, borderRadius: 26, background: C.ink}}>
      <div style={{position: 'absolute', left: 22, right: 22, top: -30, height: 40, borderRadius: 10, background: C.ink}} />
      <div style={{position: 'absolute', left: 12, right: 12, top: 80, height: 54, borderRadius: 8, background: '#F6F5F1'}} />
    </div>
  </div>
  <div style={{position: 'absolute', left: 80, top: 620, width: 300, height: 210, background: '#C49A6C', border: `7px solid ${C.ink}`, borderRadius: 12}}>
    <div style={{position: 'absolute', left: 130, top: 0, bottom: 0, width: 30, background: 'rgba(21,21,21,0.25)'}} />
  </div>
  <div style={{position: 'absolute', left: 80, top: 600, width: 150, height: 40, background: '#B5885A', border: `7px solid ${C.ink}`, borderRadius: 8, transformOrigin: 'left center', transform: `rotate(${-open * 115}deg)`}} />
  <div style={{position: 'absolute', left: 230, top: 600, width: 150, height: 40, background: '#B5885A', border: `7px solid ${C.ink}`, borderRadius: 8, transformOrigin: 'right center', transform: `rotate(${open * 115}deg)`}} />
</>);

const tangle = 'M60 120 C 140 20, 220 220, 300 90 S 420 200, 330 160 S 160 60, 120 200 S 300 260, 380 120';
const FixShot = ({f, fix}) => (<>
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '50%', background: '#F3E3E1'}}>
    <div style={{position: 'absolute', left: 24, top: 90, background: RED, color: '#fff', fontWeight: 900, fontSize: 30, padding: '4px 16px', borderRadius: 10}}>Problem</div>
    <svg width="456" height="420" style={{position: 'absolute', left: 0, top: 70, transform: `translate(${Math.sin(f * 1.3) * 4}px, ${Math.cos(f * 1.1) * 3}px)`}} fill="none">
      <path d={tangle} stroke={C.ink} strokeWidth="12" strokeLinecap="round" />
      <path d="M80 300 C 200 240, 260 360, 380 280" stroke={C.ink} strokeWidth="12" strokeLinecap="round" />
    </svg>
  </div>
  <div style={{position: 'absolute', left: 0, right: 0, top: '50%', bottom: 0, background: '#ECEBE6', clipPath: `inset(0 ${(1 - fix) * 100}% 0 0)`}}>
    <div style={{position: 'absolute', left: 24, top: 24, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 30, padding: '4px 16px', borderRadius: 10}}>Fix</div>
    {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 70, top: 120 + i * 50, width: 200, height: 26, borderRadius: 13, background: C.ink}} />)}
    <div style={{position: 'absolute', left: 290, top: 100, width: 100, height: 170, borderRadius: 20, background: C.ink}}>
      <div style={{position: 'absolute', left: 16, right: 16, top: 50, height: 40, borderRadius: 8, background: '#F6F5F1'}} />
    </div>
  </div>
  <div style={{position: 'absolute', left: `${fix * 100}%`, top: '50%', bottom: 0, width: 10, marginLeft: -5, background: '#fff', opacity: fix > 0 && fix < 1 ? 1 : 0}} />
</>);

const TalkShot = ({f, w, s}) => (<>
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #EDEBE4, #DCD8CD)'}} />
  <Guy x={10} y={330} sc={0.47} mood={-0.35 + Math.sin(f / 2.6) * 0.25} f={f} hold={null} />
  {(s.points || []).map(([k, t], i) => (
    <PopIn key={k} f={f - w(k) + 2} origin="left center" style={{left: 30 + (i % 2) * 40, top: 60 + i * 100}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 24, padding: '12px 22px', boxShadow: glow('0,0,0', 0.15, 30), fontWeight: 800, fontSize: 34, whiteSpace: 'nowrap'}}>
        <div style={{width: 44, height: 44, borderRadius: 22, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26}}>{i + 1}</div>{t}
      </div>
    </PopIn>
  ))}
</>);

const Viewfinder = ({f, w, s, len}) => {
  const p = ease(f - 2, 16);
  const secs = Math.min(s.secs || 30, Math.floor(interpolate(f, [0, Math.max(1, len)], [0, s.secs || 30])));
  const shot = s.prop === 'box' ? <BoxShot f={f} open={ease(f - w(s.open || 'unbox') + 2, 16)} />
    : s.prop === 'fix' ? <FixShot f={f} fix={ease(f - w(s.fix || 'fix'), 16)} />
    : <TalkShot f={f} w={w} s={s} />;
  return (<>
    <NumHead f={f} n={s.n} title={s.title} />
    <Phone w={500} h={920} style={{left: 230, top: 270, opacity: p, transform: `perspective(2200px) rotateY(${-8 + (1 - p) * -50}deg) translateX(${(1 - p) * 300}px)`}}>
      {shot}
      {[1, 2].map((i) => <div key={'v' + i} style={{position: 'absolute', top: 0, bottom: 0, left: `${i * 33.3}%`, width: 2, background: 'rgba(255,255,255,0.55)'}} />)}
      {[1, 2].map((i) => <div key={'h' + i} style={{position: 'absolute', left: 0, right: 0, top: `${i * 33.3}%`, height: 2, background: 'rgba(255,255,255,0.55)'}} />)}
      <div style={{position: 'absolute', left: 24, top: 24, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(21,21,21,0.75)', color: '#fff', borderRadius: 14, padding: '6px 14px', fontWeight: 800, fontSize: 26}}>
        <div style={{width: 18, height: 18, borderRadius: 9, background: RED, opacity: Math.floor(f / 12) % 2 ? 1 : 0.25}} />REC 0:{String(secs).padStart(2, '0')}
      </div>
      {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], i) => (
        <div key={i} style={{position: 'absolute', [a ? 'right' : 'left']: 20, [b ? 'bottom' : 'top']: b ? 20 : 80, width: 50, height: 50,
          [`border${b ? 'Bottom' : 'Top'}`]: '6px solid #fff', [`border${a ? 'Right' : 'Left'}`]: '6px solid #fff', borderRadius: 6}} />
      ))}
    </Phone>
    {(s.chips || []).map(([k, t], i) => (
      <FromSide key={k} f={f - w(k) + 4} side={i % 2 ? 'right' : 'left'} style={{left: i % 2 ? 610 : 30, top: 360 + i * 230}}><BlackChip style={{fontSize: 42}}>{t}</BlackChip></FromSide>
    ))}
    <Guy x={700} y={1010} sc={0.38} mood={-0.3} f={f} hold="film" o={ease(f - 8, 10)} />
  </>);
};

const SAMPLE_TILES = [['#E9C46A', '#C9962F', 'Unboxing'], ['#F3E3E1', '#B9564F', 'Problem + fix'], ['#C7B8E8', '#6E58B8', 'Talking review']];
const Portfolio = ({f, w}) => {
  const ph = ease(f - 2, 14);
  const T = (i) => w('link') + i * 7;
  return (<>
    <Phone w={470} h={860} style={{left: 560, top: 160, opacity: ph, transform: `perspective(2200px) rotateY(${-12 + (1 - ph) * -40}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#F6F5F1'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
        <div style={{width: 110, height: 110, borderRadius: 55, background: '#F2C9A5', border: `5px solid ${C.ink}`, overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', left: 8, right: 8, top: 0, height: 40, background: C.ink, borderRadius: '0 0 40px 40px'}} />
        </div>
        <div style={{fontWeight: 900, fontSize: 34}}>@yourname</div>
        <div style={{fontWeight: 700, fontSize: 26, color: MUTED}}>UGC creator · samples</div>
      </div>
      {SAMPLE_TILES.map(([a, b, t], i) => {
        const land = ease(f - T(i) - 10, 6);
        return (
          <div key={i} style={{position: 'absolute', left: 26, right: 26, top: 290 + i * 150, height: 126, borderRadius: 22, background: '#fff', border: `3px solid ${land > 0 ? C.ink : C.line}`, display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px'}}>
            <div style={{width: 64, height: 100, borderRadius: 12, background: `linear-gradient(135deg, ${a}, ${b})`, opacity: land}} />
            <div style={{fontWeight: 800, fontSize: 30, opacity: land}}>{t}</div>
          </div>
        );
      })}
    </Phone>
    {SAMPLE_TILES.map(([a, b, t], i) => {
      const p = ease(f - T(i), 14);
      if (p >= 1) return null;
      const x = lerp(p, 0, 1, 80 + i * 150, 620); const y = lerp(p, 0, 1, 260 + i * 40, 470 + i * 150) - Math.sin(p * Math.PI) * 160;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 210, height: 370, borderRadius: 26, background: `linear-gradient(135deg, ${a}, ${b})`, opacity: ease(f - 4 - i * 3, 8),
          transform: `rotate(${(1 - p) * (i - 1) * 10}deg) scale(${1 - p * 0.65})`, transformOrigin: 'left top', boxShadow: glow('0,0,0', 0.2, 50), display: 'flex', alignItems: 'flex-end', padding: 18, boxSizing: 'border-box'}}>
          <div style={{color: '#fff', fontWeight: 900, fontSize: 32, textShadow: '0 2px 10px rgba(0,0,0,0.35)'}}>{t}</div>
        </div>
      );
    })}
    <Guy x={0} y={650} sc={0.45} mood={lerp(f, w('applying'), w('$50'), -0.2, -1)} f={f} hold={f > w('$50') ? 'money' : 'laptop'} o={ease(f - w('applying') + 8, 10)} />
    <Payout p={ease(f - w('$50') + 4, 12)} amount="$50 – $400" label="Per video, beginners" style={{left: 80, top: 1120}} />
    <div style={{position: 'absolute', right: 60, top: 1330, fontWeight: 600, fontSize: 28, color: MUTED, opacity: ease(f - w('$50'), 10)}}>Source: Insense, Sep 2026</div>
  </>);
};

// ---------- video 5: price your first UGC video
const DmFreeze = ({f, w}) => {
  const ph = ease(f - 2, 14);
  const ask = ease(f - w('rate') + 6, 10);
  const frozen = f > w('freeze');
  const tag = ease(f - w('price') + 4, 12);
  return (<>
    <Phone w={540} h={960} style={{left: 480, top: 170, opacity: ph, transform: `perspective(2200px) rotateY(${-12 + (1 - ph) * -45}deg) translateX(${(1 - ph) * 300}px)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, borderBottom: `2px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 26px 20px'}}>
        <div style={{width: 70, height: 70, borderRadius: 35, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>B</div>
        <div style={{fontWeight: 800, fontSize: 34}}>Brand team</div>
      </div>
      {[['Loved your samples!', 6], ['What\'s your rate for one video?', w('rate') - 6]].map(([t, at], i) => (
        <div key={i} style={{position: 'absolute', left: 26, top: 190 + i * 150, maxWidth: 380, background: '#EFEEEA', borderRadius: '28px 28px 28px 8px', padding: '20px 26px', fontWeight: 700, fontSize: 34, lineHeight: 1.2,
          opacity: ease(f - at, 6), transform: `translateX(${(1 - ease(f - at, 8)) * -60}px)`}}>{t}</div>
      ))}
      <div style={{position: 'absolute', left: 20, right: 20, bottom: 30, height: 84, borderRadius: 42, border: `3px solid ${frozen ? '#4A90D9' : C.line}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 6}}>
        <div style={{width: 4, height: 44, background: C.ink, opacity: Math.floor(f / 10) % 2 ? 1 : 0}} />
        {!frozen && ask > 0 && [0, 1, 2].map((i) => <div key={i} style={{width: 14, height: 14, borderRadius: 7, background: MUTED, opacity: (Math.sin(f / 4 - i) + 1) / 2}} />)}
      </div>
    </Phone>
    <Guy x={-20} y={540} sc={0.56} mood={lerp(f, 0, w('freeze'), 0, 1)} f={f} hold={null} />
    {frozen && <div style={{position: 'absolute', left: 30, top: 520, width: 520, height: 520, borderRadius: 260, border: '10px solid rgba(74,144,217,0.35)', transform: `scale(${pop(f - w('freeze'), 12)})`}} />}
    <div style={{position: 'absolute', left: 120, top: 180, transformOrigin: '50% 0', transform: `rotate(${Math.sin(f / 7) * 8 * tag}deg) scale(${pop(f - w('price') + 4)})`, opacity: tag}}>
      <div style={{width: 4, height: 70, background: C.ink, margin: '0 auto'}} />
      <div style={{background: '#fff', border: `6px solid ${C.ink}`, borderRadius: '24px 24px 24px 24px', padding: '18px 34px', fontWeight: 900, fontSize: 80, boxShadow: glow('0,0,0', 0.15, 50)}}>$ ???</div>
    </div>
  </>);
};

const Scale = ({f, w}) => {
  const items = ['Script', 'Filming', 'Editing'];
  const at = (i) => w('work') + i * 6;
  const tilt = ease(f - at(0), 22);
  const th = tilt * 13 * Math.PI / 180;
  const cx = 540, cy = 430, R = 380;
  const L = [cx - R * Math.cos(th), cy - R * Math.sin(th)], Rt = [cx + R * Math.cos(th), cy + R * Math.sin(th)];
  const Pan = ({p, children}) => (
    <div style={{position: 'absolute', left: p[0] - 170, top: p[1], width: 340, height: 520}}>
      <svg width="340" height="230" style={{position: 'absolute', left: 0, top: 0}}><path d="M170 0 L30 220 M170 0 L310 220" stroke={C.ink} strokeWidth="5" /></svg>
      <div style={{position: 'absolute', left: 0, top: 216, width: 340, height: 26, borderRadius: 13, background: C.ink}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 310, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 10}}>{children}</div>
    </div>
  );
  const no = ease(f - w('follower') + 2, 10);
  return (<>
    <div style={{position: 'absolute', left: cx - 14, top: cy, width: 28, height: 560, background: C.ink, borderRadius: 14}} />
    <div style={{position: 'absolute', left: cx - 170, top: cy + 540, width: 340, height: 40, background: C.ink, borderRadius: 20}} />
    <div style={{position: 'absolute', left: cx - R - 20, top: cy - 12, width: 2 * R + 40, height: 24, borderRadius: 12, background: C.ink, transform: `rotate(${tilt * 13}deg)`}} />
    <div style={{position: 'absolute', left: cx - 30, top: cy - 30, width: 60, height: 60, borderRadius: 30, background: C.ink}} />
    <Pan p={L}>
      <div style={{position: 'relative', opacity: ease(f - 4, 10)}}>
        <div style={{background: '#fff', border: `4px solid ${C.ink}`, borderRadius: 24, padding: '14px 24px', fontWeight: 900, fontSize: 40, textAlign: 'center', color: no > 0.5 ? MUTED : C.ink}}>Followers<div style={{fontSize: 56}}>847</div></div>
        {no > 0 && <div style={{position: 'absolute', right: -30, top: -30, transform: `scale(${pop(f - w('follower') + 2)})`}}><XMark size={80} /></div>}
      </div>
    </Pan>
    <Pan p={Rt}>
      {items.map((t, i) => {
        const p = ease(f - at(i), 9);
        return <div key={t} style={{opacity: p, transform: `translateY(${(1 - p) * -260}px)`, background: C.ink, color: '#fff', borderRadius: 22, padding: '14px 28px', fontWeight: 900, fontSize: 40}}>{t}</div>;
      })}
    </Pan>
    <Guy x={10} y={1000} sc={0.36} mood={lerp(f, at(0), at(2) + 10, 0.2, -0.8)} f={f} hold={null} />
  </>);
};

const Receipt = ({f, w, s}) => {
  const lines = s.lines || [];
  const shown = lines.filter(([k]) => f >= w(k) - 4).length;
  const h = 150 + lines.reduce((acc, [k], i) => acc + 120 * ease(f - w(k) + 4, 8), 0);
  return (<>
    <div style={{position: 'absolute', left: 130, top: 150, width: 820, height: 70, borderRadius: 35, background: C.ink, zIndex: 2, boxShadow: glow('0,0,0', 0.2, 50)}} />
    <div style={{position: 'absolute', left: 180, top: 190, width: 720, height: h, background: '#fff', boxShadow: glow('0,0,0', 0.14, 60), overflow: 'hidden',
      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), 95% 100%, 90% calc(100% - 20px), 85% 100%, 80% calc(100% - 20px), 75% 100%, 70% calc(100% - 20px), 65% 100%, 60% calc(100% - 20px), 55% 100%, 50% calc(100% - 20px), 45% 100%, 40% calc(100% - 20px), 35% 100%, 30% calc(100% - 20px), 25% 100%, 20% calc(100% - 20px), 15% 100%, 10% calc(100% - 20px), 5% 100%, 0 calc(100% - 20px))'}}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 50, fontWeight: 900, fontSize: 44, letterSpacing: 4, borderBottom: `4px dashed ${C.line}`, paddingBottom: 20}}>{s.title || 'YOUR QUOTE'}</div>
      {lines.map(([k, t, kind], i) => (
        <div key={k} style={{position: 'absolute', left: 50, right: 50, top: 150 + i * 120, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${C.line}`,
          opacity: ease(f - w(k) + 2, 6)}}>
          <div style={{fontWeight: 800, fontSize: 42}}>{t}</div>
          {kind === 'up' ? (<div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 38, color: C.acc}}><span style={{fontSize: 52}}>↑</span>more</div>)
            : kind === 'down' ? (<div style={{display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 38, color: RED}}><span style={{fontSize: 52}}>↓</span>less</div>)
            : (<div style={{fontWeight: 900, fontSize: 38, color: MUTED}}>base</div>)}
        </div>
      ))}
    </div>
    <Guy x={-10} y={1030} sc={0.36} mood={lerp(f, 0, len0(lines, w), 0.3, -0.6)} f={f} hold="laptop" o={shown ? 1 : ease(f - 6, 10)} />
  </>);
};
const len0 = (lines, w) => (lines.length ? w(lines[lines.length - 1][0]) : 30);

const Strip = ({f}) => (
  <div style={{position: 'absolute', left: 0, right: 0, height: 44, background: C.ink, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -60 + ((f * 3) % 60), top: 10, display: 'flex', gap: 30}}>{Array.from({length: 16}, (_, i) => <div key={i} style={{width: 30, height: 24, borderRadius: 5, background: '#F6F5F1'}} />)}</div>
  </div>
);
const Versus = ({f, w, s}) => {
  const L = s.left || {}, Rr = s.right || {};
  const Card = ({c, side, at, edited}) => {
    const p = ease(f - at + 4, 14);
    return (
      <FromSide f={f - at + 4} side={side} style={{left: side === 'left' ? 60 : 560, top: 250, width: 460}}>
        <div style={{position: 'relative', height: 640, borderRadius: 36, background: '#fff', overflow: 'hidden', boxShadow: edited ? '0 24px 80px rgba(46,125,79,0.32)' : glow('0,0,0', 0.14, 60)}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0}}><Strip f={f} /></div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, transform: 'translateY(0)'}}><div style={{position: 'relative', height: 44}}><Strip f={-f} /></div></div>
          {edited ? (<>
            <div style={{position: 'absolute', left: 40, right: 40, top: 90, height: 380, borderRadius: 20, background: 'linear-gradient(135deg, #E9C46A, #C9962F)'}}>
              <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, marginLeft: -20, marginTop: -34, borderLeft: '60px solid #fff', borderTop: '34px solid transparent', borderBottom: '34px solid transparent'}} />
              <div style={{position: 'absolute', left: 20, right: 20, bottom: 20, background: 'rgba(0,0,0,0.75)', color: '#fff', fontWeight: 900, fontSize: 30, textAlign: 'center', borderRadius: 10, padding: 6}}>captions + music</div>
            </div>
          </>) : (<>
            {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 40 + i * 130, top: 110 + (i % 2) * 40, width: 110, height: 330, borderRadius: 14, background: ['#D6D2C4', '#C9C4B4', '#BEB8A6'][i], transform: `rotate(${(i - 1) * 5}deg)`}} />)}
          </>)}
          <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontWeight: 900, fontSize: 48}}>{c.t}</div>
        </div>
        <div style={{position: 'absolute', right: -14, top: -34, transform: `rotate(${side === 'left' ? -8 : 8}deg) scale(${pop(f - at - 6)})`}}>
          <div style={{background: edited ? C.acc : C.ink, color: '#fff', borderRadius: 20, padding: '12px 26px', fontWeight: 900, fontSize: 44, boxShadow: edited ? '0 0 50px rgba(46,125,79,0.45)' : glow('0,0,0', 0.2, 40)}}>{c.tag}</div>
        </div>
      </FromSide>
    );
  };
  return (<>
    <Card c={L} side="left" at={w(L.word || 'raw')} />
    <Card c={Rr} side="right" at={w(Rr.word || 'finished')} edited />
    <PopIn f={f - w(Rr.word || 'finished') + 2} style={{left: 480, top: 520}}><div style={{width: 120, height: 120, borderRadius: 60, background: '#fff', border: `6px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 50}}>vs</div></PopIn>
    <Guy x={340} y={960} sc={0.4} mood={-0.4} f={f} hold="film" />
  </>);
};

const Contract = ({f, w, s}) => {
  const p = ease(f - 2, 16);
  const items = s.items || [];
  const sig = ease(f - w(s.sign || 'writing') + 2, 18);
  return (<>
    <div style={{position: 'absolute', left: 150, top: 160, width: 760, height: 880, borderRadius: 26, background: '#fff', boxShadow: glow('0,0,0', 0.16, 80), opacity: p,
      transform: `perspective(2200px) rotateY(${-10 + (1 - p) * 40}deg) rotateX(6deg) translateX(${(1 - p) * 300}px)`}}>
      <div style={{position: 'absolute', left: 60, top: 50, fontWeight: 900, fontSize: 58}}>{s.title || 'Agreement'}</div>
      {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 60, top: 140 + i * 30, width: 500 - i * 140, height: 14, borderRadius: 7, background: C.line}} />)}
      {items.map(([k, t], i) => {
        const tk = ease(f - w(k) + 2, 8);
        return (
          <div key={k} style={{position: 'absolute', left: 60, top: 240 + i * 150, display: 'flex', alignItems: 'center', gap: 30}}>
            <div style={{width: 78, height: 78, borderRadius: 18, border: `6px solid ${C.ink}`, position: 'relative', background: tk > 0.5 ? C.ink : '#fff'}}>
              <svg width="78" height="78" style={{position: 'absolute', left: -6, top: -6}} fill="none"><path d="M18 40 L32 54 L60 24" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - tk)} /></svg>
            </div>
            <div style={{fontWeight: 900, fontSize: 54}}>{t}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 60, right: 60, top: 760, height: 4, background: C.ink, opacity: 0.6}} />
      <svg width="640" height="160" style={{position: 'absolute', left: 60, top: 620}} fill="none">
        <path d="M10 120 C 40 20, 70 20, 80 110 S 120 40, 150 90 S 200 140, 230 70 S 270 30, 300 100 S 360 120, 400 60 C 430 30, 470 110, 520 80 L 620 70" stroke={C.ink} strokeWidth="7" strokeLinecap="round" strokeDasharray="1100" strokeDashoffset={1100 * (1 - sig)} />
      </svg>
      <div style={{position: 'absolute', left: 60, top: 780, fontWeight: 700, fontSize: 30, color: MUTED}}>Both sides sign before filming</div>
    </div>
    <Guy x={700} y={1000} sc={0.36} mood={lerp(f, 0, w(s.sign || 'writing'), 0.2, -0.8)} f={f} hold="laptop" />
  </>);
};

// ---------- video 6: where to find UGC jobs
const FourDoors = ({f, w, s}) => {
  const items = s.items || [];
  const go = ease(f - w(s.at || 'four') + 6, 14);
  return (<>
    {['?', '?', '?'].map((q, i) => {
      const p = pop(f - 6 - i * 6);
      return <div key={i} style={{position: 'absolute', left: [180, 470, 760][i], top: [300, 210, 320][i] + Math.sin(f / 8 + i) * 12, fontWeight: 900, fontSize: 150, color: C.ink, transform: `scale(${p}) rotate(${(i - 1) * 12}deg)`, opacity: 1 - go}}>{q}</div>;
    })}
    <Guy x={lerp(go, 0, 1, 170, 360)} y={lerp(go, 0, 1, 470, 1030)} sc={lerp(go, 0, 1, 0.8, 0.38)} mood={lerp(go, 0, 1, 0.5, -0.6)} f={f} hold={go > 0.5 ? 'laptop' : null} />
    {items.map(([t, logo], i) => {
      const p = ease(f - w(s.at || 'four') - i * 5 + 4, 14);
      return (
        <div key={t} style={{position: 'absolute', left: i % 2 ? 560 : 90, top: i < 2 ? 200 : 600, width: 430, height: 360, borderRadius: 34, background: i === 3 ? C.ink : '#fff', color: i === 3 ? '#fff' : C.ink,
          boxShadow: glow('0,0,0', 0.16, 60), opacity: p, transform: `perspective(1600px) rotateY(${(1 - p) * (i % 2 ? -90 : 90)}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <div style={{position: 'absolute', left: 24, top: 24, width: 60, height: 60, borderRadius: 30, background: i === 3 ? '#fff' : C.ink, color: i === 3 ? C.ink : '#fff', fontWeight: 900, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          {logo === 'mail' ? <div style={{width: 120, height: 84, borderRadius: 12, border: '8px solid #fff', position: 'relative', overflow: 'hidden'}}><div style={{position: 'absolute', left: -10, top: -60, width: 140, height: 100, border: '8px solid #fff', transform: 'rotate(45deg)', transformOrigin: 'center'}} /></div> : null}
          <div style={{fontWeight: 900, fontSize: 56, textAlign: 'center', lineHeight: 1.05, padding: '0 20px'}}>{t}</div>
        </div>
      );
    })}
  </>);
};

const Gig = ({f, w, s}) => {
  const p = ease(f - 4, 16);
  const msgs = s.msgs || [];
  return (<>
    <NumHead f={f} n={s.n} title={s.title} />
    <div style={{position: 'absolute', left: 120, top: 270, width: 840, borderRadius: 36, background: '#fff', overflow: 'hidden', boxShadow: glow('0,0,0', 0.16, 70), opacity: p,
      transform: `perspective(2000px) rotateX(${(1 - p) * 40}deg) rotateY(${(1 - p) * -30 + 4}deg) translateX(${(1 - p) * 300}px)`}}>
      <div style={{height: 420, background: 'linear-gradient(135deg, #F4B6A6, #D9644A)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 40, top: 40, width: 420, color: '#fff', fontWeight: 900, fontSize: 64, lineHeight: 1.02, textShadow: '0 3px 14px rgba(0,0,0,0.3)'}}>UGC VIDEOS FOR YOUR BRAND</div>
        <Guy x={470} y={110} sc={0.38} mood={-0.6} f={f} hold="film" />
      </div>
      <div style={{padding: '26px 36px 34px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: '#F2C9A5', border: `4px solid ${C.ink}`}} />
          <div style={{fontWeight: 900, fontSize: 36}}>Your gig</div>
          <div style={{marginLeft: 'auto', background: C.line, borderRadius: 14, padding: '6px 16px', fontWeight: 800, fontSize: 28}}>New seller</div>
        </div>
        <div style={{fontWeight: 800, fontSize: 44, lineHeight: 1.15, marginTop: 20}}>I will film a UGC video for your brand</div>
      </div>
    </div>
    {msgs.map(([k, t], i) => (
      <FromSide key={i} f={f - w(k) - i * 8 + 2} side={i % 2 ? 'left' : 'right'} style={{left: i % 2 ? 80 : 200, top: 980 + i * 140}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, background: C.ink, color: '#fff', borderRadius: 30, padding: '18px 30px', fontWeight: 800, fontSize: 40, boxShadow: glow('0,0,0', 0.2, 50), whiteSpace: 'nowrap'}}>
          <div style={{width: 54, height: 54, borderRadius: 27, background: ['#E9C46A', '#9CC9B0'][i % 2], color: C.ink, fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{'BG'[i % 2]}</div>{t}
        </div>
      </FromSide>
    ))}
  </>);
};

const PitchMail = ({f, w, s}) => {
  const body = s.body || '';
  const sendAt = w(s.send || 'use') + 12;
  const chars = Math.floor(lerp(f, 8, sendAt - 10, 0, body.length));
  const fold = ease(f - sendAt, 14);
  const att = pop(f - w(s.attach || 'sample') + 2);
  return (<>
    <NumHead f={f} n={s.n} title={s.title} />
    <div style={{position: 'absolute', left: 80, top: 270, width: 920, height: 760, borderRadius: 30, background: '#fff', boxShadow: glow('0,0,0', 0.16, 70), overflow: 'hidden', opacity: ease(f - 2, 10) * (1 - fold),
      transformOrigin: '80% 20%', transform: `perspective(2000px) scale(${1 - fold * 0.8}) rotateZ(${fold * -20}deg) translate(${fold * 400}px, ${-fold * 300}px)`}}>
      <div style={{height: 80, background: C.ink, color: '#fff', display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', fontWeight: 800, fontSize: 32}}>
        {[0, 1, 2].map((i) => <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: '#F6F5F1', opacity: 0.5}} />)}<span style={{marginLeft: 14}}>New message</span>
      </div>
      {[['To', s.to || 'hello@brand.com'], ['Subject', s.subject || 'A UGC video for you']].map(([a, b]) => (
        <div key={a} style={{margin: '0 36px', padding: '22px 0', borderBottom: `3px solid ${C.line}`, fontSize: 36}}><span style={{color: MUTED, fontWeight: 700}}>{a}: </span><span style={{fontWeight: 800}}>{b}</span></div>
      ))}
      <div style={{margin: '26px 36px', fontWeight: 600, fontSize: 38, lineHeight: 1.35, whiteSpace: 'pre-wrap'}}>{body.slice(0, chars)}<span style={{opacity: Math.floor(f / 10) % 2 ? 1 : 0}}>|</span></div>
      <div style={{position: 'absolute', left: 36, bottom: 40, display: 'flex', alignItems: 'center', gap: 14, background: C.ink, color: '#fff', borderRadius: 18, padding: '14px 24px', fontWeight: 800, fontSize: 32, transform: `scale(${att})`}}>
        <div style={{width: 0, height: 0, borderLeft: '22px solid #fff', borderTop: '14px solid transparent', borderBottom: '14px solid transparent'}} />sample.mp4
      </div>
      <div style={{position: 'absolute', right: 36, bottom: 40, background: C.ink, color: '#fff', borderRadius: 18, padding: '16px 40px', fontWeight: 900, fontSize: 36, transform: `scale(${f > sendAt - 4 && f < sendAt + 2 ? 0.92 : 1})`}}>Send</div>
      {f > sendAt - 16 && f < sendAt + 2 && <Cursor x={lerp(f, sendAt - 16, sendAt - 4, 600, 820)} y={lerp(f, sendAt - 16, sendAt - 4, 560, 705)} press={f > sendAt - 4 ? 1 : 0} />}
    </div>
    {fold > 0 && (
      <svg width="1080" height="1300" style={{position: 'absolute', left: 0, top: 0}} fill="none">
        <path d={`M540 650 Q 760 ${600 - fold * 200}, ${540 + fold * 520} ${650 - fold * 520}`} stroke={C.ink} strokeWidth="6" strokeDasharray="14 16" opacity={0.5} />
        <g transform={`translate(${540 + fold * 520} ${650 - fold * 520}) rotate(-35) scale(${0.6 + fold * 0.6})`}>
          <path d="M-60 0 L60 -40 L20 50 L0 10 Z" fill="#fff" stroke={C.ink} strokeWidth="6" strokeLinejoin="round" />
          <path d="M60 -40 L0 10" stroke={C.ink} strokeWidth="5" />
        </g>
      </svg>
    )}
    <Guy x={-10} y={1030} sc={0.36} mood={fold > 0.3 ? -0.9 : -0.3} f={f} hold="laptop" />
  </>);
};

// ---------- video 7: spot fake brand deals
const FlagIcon = ({size = 56, on = true}) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
    <path d="M14 6 V52" stroke={on ? C.ink : '#B9B6AE'} strokeWidth="6" strokeLinecap="round" />
    <path d="M17 8 H46 L38 20 L46 32 H17 Z" fill={on ? RED : '#D6D2C4'} />
  </svg>
);
const FlagRow = ({f, done = 0, at = [], top = 1230, left = 90}) => (
  <div style={{position: 'absolute', left, top, display: 'flex', gap: 16, alignItems: 'center'}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const k = i - done; const on = i < done || (k >= 0 && k < at.length && f >= at[k]);
      const sc = k >= 0 && k < at.length ? pop(f - at[k]) || 1 : 1;
      return (
        <div key={i} style={{width: 84, height: 84, borderRadius: 22, background: '#fff', border: `4px solid ${on ? RED : C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: on ? '0 0 40px rgba(217,58,58,0.35)' : 'none', transform: `scale(${on ? sc : 1})`}}><FlagIcon on={on} /></div>
      );
    })}
  </div>
);

const DmAlert = ({f, w, s}) => {
  const ph = ease(f - 2, 14);
  const drop = ease(f - 10, 12);
  const sus = ease(f - w('before') + 2, 12);
  const glass = ease(f - w('check') + 4, 18);
  return (<>
    <Phone w={520} h={980} style={{left: 470, top: 170, opacity: ph, transform: `perspective(2200px) rotateY(${-10 + (1 - ph) * -45}deg) translateX(${(1 - ph) * 300}px)`}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #2B2B2B, #151515)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', color: '#fff', fontWeight: 300, fontSize: 130}}>9:41</div>
      <div style={{position: 'absolute', left: 18, right: 18, top: lerp(drop, 0, 1, -200, 330), background: 'rgba(255,255,255,0.95)', borderRadius: 30, padding: '20px 22px', display: 'flex', gap: 16}}>
        <Logo name="instagram" size={64} />
        <div><div style={{fontWeight: 800, fontSize: 26}}>brand.ambassador.team</div><div style={{fontWeight: 600, fontSize: 28, lineHeight: 1.2}}>We LOVE your style! Want a paid collab?</div></div>
      </div>
    </Phone>
    <Guy x={-30} y={520} sc={0.55} mood={lerp(sus, 0, 1, -0.9, 0.55)} f={f} hold={null} />
    {glass > 0 && (
      <svg width="300" height="300" style={{position: 'absolute', left: lerp(glass, 0, 1, 900, 600), top: lerp(glass, 0, 1, 900, 470)}} fill="none">
        <circle cx="120" cy="120" r="90" stroke={C.ink} strokeWidth="18" fill="rgba(255,255,255,0.25)" />
        <path d="M185 185 L270 270" stroke={C.ink} strokeWidth="28" strokeLinecap="round" />
      </svg>
    )}
    <div style={{opacity: ease(f - w('five') + 4, 10)}}><FlagRow f={f} done={0} top={1220} left={300} /></div>
  </>);
};

const Flags = ({f, w, s}) => {
  const msgs = s.msgs || [];
  const at = msgs.map(([k]) => w(k) + 8);
  return (<>
    <Phone w={540} h={1000} style={{left: 40, top: 160, transform: 'perspective(2200px) rotateY(10deg)'}}>
      <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 140, borderBottom: `2px solid ${C.line}`, display: 'flex', alignItems: 'flex-end', gap: 14, padding: '0 24px 18px'}}>
        <Logo name="instagram" size={60} /><div style={{fontWeight: 800, fontSize: 28}}>brand.ambassador.team</div>
      </div>
      {msgs.map(([k, t, , link], i) => {
        const p = ease(f - w(k) + 4, 8);
        const bad = ease(f - at[i], 8);
        return (
          <div key={k} style={{position: 'absolute', left: 22, top: 180 + i * 250, maxWidth: 420, background: '#EFEEEA', borderRadius: '28px 28px 28px 8px', padding: '20px 24px', fontWeight: 700, fontSize: 32, lineHeight: 1.25,
            opacity: p, transform: `translateX(${(1 - p) * -60}px)`, boxShadow: `0 0 0 ${bad * 5}px rgba(217,58,58,${0.8 * bad})`}}>
            {t}{link && <div style={{color: bad > 0.5 ? RED : '#3D6FA8', textDecoration: 'underline', marginTop: 8, fontWeight: 800}}>{link}</div>}
          </div>
        );
      })}
    </Phone>
    {msgs.map(([k, , flag], i) => (
      <FromSide key={k} f={f - at[i]} side="right" style={{left: 610, top: 250 + i * 330}}>
        <div style={{width: 420, background: '#fff', borderRadius: 30, padding: '22px 26px', boxShadow: '0 18px 60px rgba(217,58,58,0.3), 0 0 0 3px rgba(217,58,58,0.35)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}><FlagIcon size={64} /><div style={{fontWeight: 900, fontSize: 50, color: RED}}>#{(s.done || 0) + i + 1}</div></div>
          <div style={{fontWeight: 900, fontSize: 44, lineHeight: 1.1, marginTop: 8}}>{flag}</div>
        </div>
      </FromSide>
    ))}
    <Guy x={640} y={930} sc={0.33} mood={lerp(f, 0, at[at.length - 1] || 30, 0.3, 0.95)} f={f} hold={null} />
    <FlagRow f={f} done={s.done || 0} at={at} top={1230} left={60} />
  </>);
};

const BankAsk = ({f, w, s}) => {
  const red = ease(f - w('bank') + 2, 8);
  const fields = [['Full name', false], ['Bank account number', true], ['Routing / sort code', true], ['Date of birth', true]];
  return (<>
    <Phone w={540} h={1000} style={{left: 270, top: 160, transform: `perspective(2200px) rotateY(${-8 + (1 - ease(f - 2, 14)) * -40}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: 30, top: 70, fontWeight: 900, fontSize: 40}}>Start your payments</div>
      <div style={{position: 'absolute', left: 30, top: 125, fontWeight: 600, fontSize: 26, color: MUTED}}>brand-ambassadors-team.co</div>
      {fields.map(([t, bad], i) => (
        <div key={t} style={{position: 'absolute', left: 30, right: 30, top: 200 + i * 160}}>
          <div style={{fontWeight: 800, fontSize: 28, color: bad && red > 0.5 ? RED : C.ink}}>{t}</div>
          <div style={{height: 80, borderRadius: 18, marginTop: 10, border: `4px solid ${bad ? `rgba(217,58,58,${0.3 + 0.7 * red})` : C.line}`, boxShadow: bad ? `0 0 ${30 * red}px rgba(217,58,58,0.4)` : 'none', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8}}>
            {i === 1 && [0, 1, 2].map((j) => <div key={j} style={{width: 14, height: 14, borderRadius: 7, background: MUTED, opacity: (Math.sin(f / 4 - j) + 1) / 2}} />)}
          </div>
        </div>
      ))}
    </Phone>
    {f >= w(s.stamp || 'start') && <Stamp f={f - w(s.stamp || 'start')} text="SCAM SIGN" color={RED} size={110} rot={-10} style={{left: 160, top: 560}} />}
    <Guy x={720} y={900} sc={0.36} mood={1} f={f} hold={null} />
    <FlagRow f={f} done={4} at={[w('five') + 4]} top={1230} left={60} />
  </>);
};

const Verify = ({f, w, s}) => {
  const ok = ease(f - w('real') + 4, 12); const no = ease(f - w('never') + 4, 12);
  return (<>
    <Guy x={-40} y={300} sc={0.62} mood={lerp(ok, 0, 1, 0.3, -0.5)} f={f} hold="call" />
    <FromSide f={f - w('real') + 4} side="right" style={{left: 560, top: 260, width: 460}}>
      <div style={{background: '#fff', borderRadius: 30, padding: '26px 30px', boxShadow: glow('0,0,0', 0.16, 60), border: `4px solid ${C.ink}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{width: 64, height: 64, borderRadius: 32, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f - w('real') - 4) || 0})`}}>✓</div>
          <div style={{fontWeight: 900, fontSize: 40, lineHeight: 1.1}}>Number you already know</div>
        </div>
        <div style={{fontWeight: 600, fontSize: 30, color: MUTED, marginTop: 10}}>from the brand's own site</div>
      </div>
    </FromSide>
    <FromSide f={f - w('never') + 4} side="right" style={{left: 560, top: 620, width: 460}}>
      <div style={{background: '#fff', borderRadius: 30, padding: '26px 30px', boxShadow: '0 18px 60px rgba(217,58,58,0.3)', position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}><XMark size={64} /><div style={{fontWeight: 900, fontSize: 40, lineHeight: 1.1, color: no > 0.5 ? MUTED : C.ink}}>Number from the DM</div></div>
        <div style={{position: 'absolute', left: 20, right: 20, top: '50%', height: 10, borderRadius: 5, background: RED, transform: `scaleX(${ease(f - w('never') - 4, 8)})`, transformOrigin: 'left'}} />
      </div>
    </FromSide>
    <FromSide f={f - w(s.last || 'share') + 4} side="left" style={{left: 90, top: 1130}}><BlackChip x style={{fontSize: 46}}>No bank details in DMs</BlackChip></FromSide>
  </>);
};

// ---------- video 8: disclose links the right way
const BioFail = ({f, w}) => {
  const no = ease(f - w("isn't") + 2, 10);
  const p = ease(f - 2, 14);
  return (<>
    <FromSide f={f - 2} side="left" style={{left: 60, right: 60, top: 170}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '36px 40px', boxShadow: glow('0,0,0', 0.14, 70)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{width: 150, height: 150, borderRadius: 75, background: '#F2C9A5', border: `6px solid ${C.ink}`, position: 'relative', overflow: 'hidden', flexShrink: 0}}>
            <div style={{position: 'absolute', left: 10, right: 10, top: 0, height: 56, background: C.ink, borderRadius: '0 0 60px 60px'}} />
          </div>
          <div style={{display: 'flex', gap: 40}}>{[['128', 'posts'], ['847', 'followers'], ['210', 'following']].map(([a, b]) => <div key={b} style={{textAlign: 'center'}}><div style={{fontWeight: 900, fontSize: 46}}>{a}</div><div style={{fontWeight: 600, fontSize: 28, color: MUTED}}>{b}</div></div>)}</div>
        </div>
        <div style={{fontWeight: 900, fontSize: 38, marginTop: 24}}>@yourname</div>
        <div style={{fontWeight: 600, fontSize: 36, marginTop: 6}}>Tech tips for small creators</div>
        <div style={{position: 'relative', display: 'inline-block', fontWeight: 800, fontSize: 36, marginTop: 6, color: no > 0.5 ? MUTED : C.ink}}>Some links are affiliate #ad
          <div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 9, borderRadius: 5, background: RED, transform: `scaleX(${no})`, transformOrigin: 'left'}} />
        </div>
      </div>
    </FromSide>
    <PopIn f={f - w("isn't") - 6} style={{left: 420, top: 640, transform: `rotate(6deg) scale(${pop(f - w("isn't") - 6)})`}}><BlackChip x>Bio only: not enough</BlackChip></PopIn>
    <Guy x={180} y={760} sc={0.6} mood={lerp(f, 0, w("isn't"), -0.3, 0.8)} f={f} hold={null} o={p} />
  </>);
};

const PostPlace = ({f, w}) => {
  const ad = f - w('post') + 2;
  const end = ease(f - w('end') + 2, 10); const more = ease(f - w('more') + 2, 10);
  return (<>
    <Phone w={560} h={1080} style={{left: 260, top: 140, transform: `perspective(2200px) rotateY(${-6 + (1 - ease(f - 2, 14)) * -40}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#fff'}} />
      <div style={{position: 'absolute', left: 24, top: 60, display: 'flex', alignItems: 'center', gap: 14}}>
        <div style={{width: 60, height: 60, borderRadius: 30, background: '#F2C9A5', border: `4px solid ${C.ink}`}} /><div style={{fontWeight: 800, fontSize: 30}}>yourname</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, height: 480, background: 'linear-gradient(135deg, #C7B8E8, #6E58B8)'}}>
        <div style={{position: 'absolute', left: 200, top: 90, width: 120, height: 220, borderRadius: 60, background: C.ink}} />
        <div style={{position: 'absolute', left: 254, top: 300, width: 12, height: 90, background: C.ink}} />
        <div style={{position: 'absolute', left: 190, top: 380, width: 140, height: 16, borderRadius: 8, background: C.ink}} />
      </div>
      <div style={{position: 'absolute', left: 24, right: 24, top: 660, fontSize: 32, lineHeight: 1.35}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          {ad > 0 && <span style={{display: 'inline-block', background: C.ink, color: '#fff', fontWeight: 900, borderRadius: 10, padding: '2px 14px', transform: `scale(${interpolate(ad, [0, 6, 10], [2.2, 0.95, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
            boxShadow: `0 0 0 ${Math.max(0, Math.sin(ad / 5)) * 10}px rgba(21,21,21,0.12)`}}>Ad</span>}
          <span style={{fontWeight: 700}}>I use this mic every day</span>
        </div>
        <div style={{color: MUTED, fontWeight: 600, marginTop: 10}}>#mic #creator #setup #podcast <span style={{position: 'relative', color: end > 0.5 ? RED : MUTED}}>#ad<span style={{position: 'absolute', left: -4, right: -4, top: '52%', height: 6, background: RED, transform: `scaleX(${end})`, transformOrigin: 'left'}} /></span></div>
        <div style={{fontWeight: 800, marginTop: 10, color: more > 0.5 ? RED : MUTED}}>... more</div>
      </div>
    </Phone>
    {end > 0 && <div style={{position: 'absolute', left: 820, top: 780, transform: `scale(${pop(f - w('end') + 2)})`}}><XMark size={90} /></div>}
    {more > 0 && <div style={{position: 'absolute', left: 820, top: 900, transform: `scale(${pop(f - w('more') + 2)})`}}><XMark size={90} /></div>}
    <FromSide f={f - w('hard') + 4} side="left" style={{left: 40, top: 760}}><BlackChip style={{fontSize: 40}}>In the post</BlackChip></FromSide>
    <Guy x={-30} y={1000} sc={0.33} mood={-0.4} f={f} hold={null} />
  </>);
};

const MuteShow = ({f, w}) => {
  const say = ease(f - w('say') + 2, 8); const show = f - w('show') + 2; const mute = pop(f - w('without') + 2);
  return (<>
    <Phone w={560} h={1000} style={{left: 260, top: 160, transform: `perspective(2200px) rotateY(${-6 + (1 - ease(f - 2, 14)) * -40}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #EDEBE4, #D6D2C4)'}} />
      <Guy x={30} y={360} sc={0.5} mood={-0.4 + Math.sin(f / 2.6) * 0.2} f={f} hold={null} />
      <div style={{position: 'absolute', left: 60, top: 220, background: '#fff', borderRadius: '30px 30px 30px 6px', padding: '16px 26px', fontWeight: 900, fontSize: 36, opacity: say, transform: `scale(${pop(f - w('say') + 2)})`, transformOrigin: 'left bottom', boxShadow: glow('0,0,0', 0.15, 30)}}>"This video is an ad"</div>
      {show > 0 && <div style={{position: 'absolute', left: 30, top: 60, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 64, borderRadius: 18, padding: '6px 30px', letterSpacing: 3,
        transform: `scale(${interpolate(show, [0, 6, 10], [2.2, 0.95, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}}>AD</div>}
      {mute > 0 && (
        <div style={{position: 'absolute', right: 30, top: 60, width: 100, height: 100, borderRadius: 50, background: 'rgba(21,21,21,0.8)', transform: `scale(${mute})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M8 24 H20 L34 12 V52 L20 40 H8 Z" fill="#fff" /><path d="M42 24 L58 40 M58 24 L42 40" stroke={RED} strokeWidth="7" strokeLinecap="round" /></svg>
        </div>
      )}
    </Phone>
    <FromSide f={f - w('say') + 4} side="left" style={{left: 30, top: 1100}}><BlackChip style={{fontSize: 46}}>Say it</BlackChip></FromSide>
    <FromSide f={f - w('show') + 4} side="right" style={{left: 660, top: 1100}}><BlackChip style={{fontSize: 46}}>Show it</BlackChip></FromSide>
  </>);
};

const WordSort = ({f, w, s}) => {
  const words = s.words || [];
  const bins = [{x: 70, t: 'Clear', good: true}, {x: 570, t: 'Vague', good: false}];
  const count = [0, 0];
  return (<>
    {bins.map((b, i) => (
      <FromSide key={i} f={f - 2 - i * 4} side={i ? 'right' : 'left'} style={{left: b.x, top: 700, width: 440}}>
        <div style={{height: 600, borderRadius: 40, border: `8px solid ${b.good ? C.ink : RED}`, background: 'rgba(255,255,255,0.7)', boxShadow: b.good ? glow('0,0,0', 0.12, 50) : '0 18px 60px rgba(217,58,58,0.25)'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 26}}>
            {b.good ? <div style={{width: 64, height: 64, borderRadius: 32, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div> : <XMark size={64} />}
            <div style={{fontWeight: 900, fontSize: 56, color: b.good ? C.ink : RED}}>{b.t}</div>
          </div>
        </div>
      </FromSide>
    ))}
    {words.map(([k, t, good], i) => {
      const at = w(k);
      if (f < at - 4) return null;
      const slot = count[good ? 0 : 1]++;
      const fly = ease(f - at - 8, 12);
      const bx = good ? 290 : 790; const by = 860 + slot * 120;
      return (
        <div key={i} style={{position: 'absolute', left: lerp(fly, 0, 1, 540, bx), top: lerp(fly, 0, 1, 380, by) - Math.sin(fly * Math.PI) * 120, transform: `translateX(-50%) scale(${pop(f - at + 4)}) rotate(${(1 - fly) * (good ? -8 : 8)}deg)`,
          background: good ? C.ink : '#fff', color: good ? '#fff' : RED, border: good ? 'none' : `5px solid ${RED}`, borderRadius: 24, padding: '14px 34px', fontWeight: 900, fontSize: 52, whiteSpace: 'nowrap', boxShadow: glow('0,0,0', 0.18, 40)}}>{t}</div>
      );
    })}
    <Guy x={760} y={120} sc={0.3} mood={-0.3} f={f} hold={null} />
  </>);
};

export const SCENES2 = {
  no_samples: NoSamples, viewfinder: Viewfinder, portfolio: Portfolio,
  dm_freeze: DmFreeze, scale: Scale, receipt: Receipt, versus: Versus, contract: Contract,
  four_doors: FourDoors, gig: Gig, pitch_mail: PitchMail,
  dm_alert: DmAlert, flags: Flags, bank_ask: BankAsk, verify: Verify,
  bio_fail: BioFail, post_place: PostPlace, mute_show: MuteShow, word_sort: WordSort,
};
