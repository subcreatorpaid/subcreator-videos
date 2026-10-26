// "Story" style (owner pick, 26 Oct 2026): one continuous piece. The same creator face acts out the script, scenes
// overlap by 8 frames so there is never a blank frame, green only for money, red for loss or denial, real logos and
// real app pages, subtitles with the handle under them. Used when spec.json has "style": "story".
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, Img, staticFile, Audio} from 'remotion';
import {C, FONT, Fonts} from './Short';
import {RED, ease, pop, glow, FromSide, PopIn, CountUp, RedPill, Logo, BRAND_GLOW, Face, Phone, Cursor, Chip, ReelWall, Stamp, DrawLine, XMark, BlackChip, Payout} from './graphics';
import {SCENES2} from './Story2';

const OV = 8; // overlap between scenes (frames)
const clean = (s) => String(s).replace(/[^\w$%'-]/g, '').toLowerCase();
const lerp = (f, a, b, x, y) => interpolate(f, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// ---------- shared bits
const AdScreen = ({f}) => (
  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(170deg, #F4EDE4, #E7D9C6)', fontFamily: FONT}}>
    <div style={{position: 'absolute', left: 30, top: 40, background: C.ink, color: '#fff', fontWeight: 800, fontSize: 26, padding: '4px 14px', borderRadius: 8}}>Ad</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontWeight: 900, fontSize: 40, padding: '0 30px'}}>ok I was NOT expecting this</div>
    <div style={{position: 'absolute', left: '50%', top: 300, width: 130, height: 290, marginLeft: -65, borderRadius: 30, background: C.acc, transform: `perspective(800px) rotateY(${f * 4}deg)`}}>
      <div style={{position: 'absolute', left: 30, right: 30, top: -40, height: 50, borderRadius: 12, background: C.ink}} />
      <div style={{position: 'absolute', left: 15, right: 15, top: 110, height: 60, borderRadius: 10, background: '#fff'}} />
    </div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 640, height: 140, borderRadius: 16, background: '#C49A6C', border: `6px solid ${C.ink}`}} />
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 44, background: C.ink, color: '#fff', textAlign: 'center', fontWeight: 800, fontSize: 34, padding: 22, borderRadius: 20}}>Shop now</div>
  </div>
);
const Snap = ({src, show = 1}) => <Img src={staticFile(src)} style={{position: 'absolute', left: 0, top: 0, width: '100%', opacity: show}} />;

// ---------- scenes: ({f, w, s, len}) f = frames since the scene started (8 before the voice line), w('word') = frame of that word
const Counters = ({f, w}) => {
  const rows = [['instagram', 'Instagram', 847], ['tiktok', 'TikTok', 1204], ['youtube', 'YouTube', 392]];
  return (<>
    {rows.map(([ic, name, n], i) => (
      <FromSide key={ic} f={f - i * 5} side={i % 2 ? 'right' : 'left'} style={{left: 80, right: 80, top: 250 + i * 240}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, padding: '34px 44px', background: '#fff', borderRadius: 40, position: 'relative', overflow: 'hidden',
          boxShadow: `0 18px 70px rgba(${BRAND_GLOW[ic]},0.28), 0 0 0 3px rgba(${BRAND_GLOW[ic]},0.18)`}}>
          <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: `rgb(${BRAND_GLOW[ic]})`}} />
          <Logo name={ic} size={96} />
          <div style={{flex: 1, fontWeight: 700, fontSize: 46}}>{name}</div>
          <div style={{fontWeight: 900, fontSize: 84}}><CountUp f={f - i * 5} from={0} to={n} d={50} /></div>
        </div>
      </FromSide>
    ))}
    <FromSide f={f - w('zero') + 10} side="right" style={{left: 80, right: 80, top: 1000}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 44px', background: C.ink, color: '#fff', borderRadius: 40,
        boxShadow: `0 20px 80px rgba(217,58,58,0.45), 0 0 0 3px rgba(217,58,58,0.5)`}}>
        <div style={{fontWeight: 800, fontSize: 54}}>Earned</div><RedPill size={96}>$0.00</RedPill>
      </div>
    </FromSide>
  </>);
};

const FaceStrike = ({f, w}) => {
  const strike = ease(f - w('problem'), 10);
  return (<>
    <div style={{position: 'absolute', left: 90, top: 170}}><Face mood={lerp(f, 4, w('problem'), 0.3, 1)} f={f} size={780} /></div>
    <PopIn f={f - 6} style={{left: 50, top: 210, transform: `rotate(-7deg) scale(${pop(f - 6)})`}}><Chip style={{position: 'static'}}>847 followers</Chip></PopIn>
    <PopIn f={f - 12} style={{right: 40, top: 760, transform: `rotate(6deg) scale(${pop(f - 12)})`}}><Chip style={{position: 'static'}}>posting daily</Chip></PopIn>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', fontWeight: 900, fontSize: 130, opacity: ease(f - w('follower') + 4, 8), color: strike > 0 ? '#A9A79F' : C.ink}}>
      <span style={{position: 'relative'}}>Followers
        <span style={{position: 'absolute', left: -10, top: '52%', height: 18, width: `${strike * 104}%`, background: RED, borderRadius: 9}} />
      </span>
    </div>
  </>);
};

const PhoneFly = ({f, w}) => {
  const fly = ease(f - w('they') + 6, 18);
  const pay = ease(f - w('videos') + 2, 10);
  const shake = f > w('followers') && f < w('followers') + 10 ? Math.sin(f * 2.2) * 10 : 0;
  return (<>
    <div style={{position: 'absolute', left: lerp(fly, 0, 1, 90, -10), top: lerp(fly, 0, 1, 330, 880), transform: `scale(${lerp(fly, 0, 1, 1, 0.55)})`, transformOrigin: 'left top'}}>
      <Face mood={pay > 0.5 ? -1 : lerp(fly, 0, 1, 0.9, 0)} f={f} size={780} hold={fly > 0.05 ? (pay > 0.5 ? 'money' : null) : 'phone0'} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 190, display: 'flex', justifyContent: 'center', opacity: 1 - fly, transform: `translateX(${shake - fly * 500}px)`}}>
      <PopIn f={f - 4} style={{position: 'relative'}}><BlackChip x style={{fontSize: 70, padding: '30px 50px'}}>Followers</BlackChip></PopIn>
    </div>
    {fly > 0 && (
      <Phone w={520} h={1040} style={{left: lerp(fly, 0, 1, 640, 400), top: lerp(fly, 0, 1, 760, 170),
        transform: `perspective(2200px) rotateY(${lerp(fly, 0, 1, 70, -10)}deg) rotateX(${(1 - fly) * 20}deg) scale(${lerp(fly, 0, 1, 0.15, 1)})`, transformOrigin: 'center'}}>
        <AdScreen f={f} />
      </Phone>
    )}
    <Payout p={pay} style={{left: 300, top: 90}} />
  </>);
};

const UgcExplain = ({f, w}) => {
  const ph = ease(f - 4, 16);
  return (<>
    <div style={{position: 'absolute', left: -20, top: 560}}><Face mood={-0.2} f={f} size={560} hold="film" /></div>
    <Phone w={430} h={860} style={{left: 600, top: 120 + (1 - ph) * 40, opacity: ph, transform: `perspective(2200px) rotateY(${-16 + (1 - ph) * -30}deg)`}}><AdScreen f={f} /></Phone>
    <DrawLine d="M 470 700 C 520 560, 520 420, 600 360" p={ease(f - w('film'), 14)} color={C.ink} width={8} len={600} />
    <PopIn f={f - w('ugc') + 4} style={{left: 70, top: 200}}>
      <div style={{background: C.ink, color: '#fff', fontWeight: 900, fontSize: 130, padding: '6px 40px', borderRadius: 30, letterSpacing: 2}}>UGC</div>
    </PopIn>
    <FromSide f={f - w('brands') + 4} side="right" style={{left: 640, top: 1000}}><BlackChip style={{fontSize: 40}}>Brand's own ad</BlackChip></FromSide>
    <FromSide f={f - w('zero') + 4} side="left" style={{left: 60, top: 420}}><BlackChip style={{fontSize: 44}}>0 followers needed</BlackChip></FromSide>
  </>);
};

const Rate = ({f, w}) => {
  const cards = [['$50', w('$50')], ['$150', w('$50') + 8], ['$400', w('$400')]];
  return (<>
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontWeight: 800, fontSize: 44, letterSpacing: 6, color: '#5F5E58', opacity: ease(f, 10)}}>BEGINNER RATES · PER VIDEO</div>
    {cards.map(([v, at], i) => {
      const p = ease(f - at + 6, 14);
      return (
        <div key={v} style={{position: 'absolute', left: 150 + i * 120, top: 300 + i * 40, width: 520, height: 700, borderRadius: 50, background: i === 2 ? 'linear-gradient(160deg, #FFFFFF, #E3F0E7)' : '#fff',
          opacity: p, transform: `perspective(1800px) rotateY(${18 - i * 8 + (1 - p) * 40}deg) rotateX(6deg) translateZ(${(i - 2) * 80}px) translateY(${(1 - p) * 100}px)`,
          boxShadow: i === 2 ? '0 30px 90px rgba(46,125,79,0.35)' : glow('0,0,0', 0.12, 70), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
          <div style={{fontWeight: 900, fontSize: i === 2 ? 170 : 120, color: i === 2 ? C.acc : '#A9A79F'}}>{v}</div>
          <div style={{fontWeight: 700, fontSize: 40, color: '#5F5E58'}}>per video</div>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 0, top: 960, transform: 'scale(0.5)', transformOrigin: 'left top', opacity: ease(f - w('$400'), 10)}}><Face mood={-1} f={f} size={700} hold="money" /></div>
    <div style={{position: 'absolute', right: 60, top: 1310, fontWeight: 600, fontSize: 28, color: '#5F5E58'}}>Source: Insense, Sep 2026</div>
  </>);
};

const Apps = ({f, w}) => {
  const inP = ease(f, 16);
  const swap = ease(f - w('joinbrands') + 10, 16);
  const page2 = ease(f - w('takes'), 8);
  const ring = ease(f - w('us') + 4, 10) * (1 - swap);
  const tap1 = w('billo') + 14, tap2 = w('free') - 2;
  const press = (t) => (f > t && f < t + 7 ? 1 : 0);
  return (<>
    <div style={{position: 'absolute', left: -20, top: 860, transform: `translateX(${(1 - ease(f - 6, 14)) * -500}px)`}}><Face mood={-0.3} f={f} size={400} hold="laptop" /></div>
    <Phone w={520} h={860} style={{left: 500 + 700 * (1 - inP) - 1100 * swap, top: 150, transform: `perspective(2200px) rotateY(${lerp(inP, 0, 1, -40, -10) - swap * 50}deg)`}}>
      <Snap src="a_snap_billo_home.png" />
      <Snap src="a_snap_billo_countries.png" show={page2} />
      <div style={{position: 'absolute', left: 14, right: 14, top: 164, height: 50, borderRadius: 25, border: `5px solid ${C.ink}`, opacity: ring}} />
      <div style={{position: 'absolute', left: 110, right: 110, top: 214, height: 48, borderRadius: 24, border: `5px solid ${C.ink}`, opacity: ring}} />
      {f < tap1 + 10 && <Cursor x={lerp(f, tap1 - 18, tap1, 380, 238)} y={lerp(f, tap1 - 18, tap1, 760, 569)} press={press(tap1)} />}
    </Phone>
    <Phone w={520} h={860} style={{left: 500 + 900 * (1 - swap), top: 150, opacity: swap > 0 ? 1 : 0, transform: `perspective(2200px) rotateY(${lerp(swap, 0, 1, 40, -10)}deg)`}}>
      <Snap src="a_snap_jb.png" />
      {f > tap2 - 18 && <Cursor x={lerp(f, tap2 - 18, tap2, 330, 127)} y={lerp(f, tap2 - 18, tap2, 800, 699)} press={press(tap2)} />}
    </Phone>
  </>);
};

const SAMPLE_STEPS = [['unbox', 'Unbox it'], ['use', 'Use it'], ['liked', 'Say what you liked']];
const Wall = ({f, w, gf}) => (<>
  <div style={{position: 'absolute', inset: 0, opacity: ease(f, 10)}}><ReelWall f={gf} /></div>
  <div style={{position: 'absolute', left: 40, top: 60, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 24, padding: '12px 22px', boxShadow: glow('0,0,0', 0.15, 40)}}>
    <Logo name="youtube" size={64} /><span style={{fontWeight: 900, fontSize: 40}}>Sample videos</span>
  </div>
  {SAMPLE_STEPS.map(([k, t], i) => (
    <FromSide key={k} f={f - w(k) + 4} side={i % 2 ? 'right' : 'left'} style={{left: i % 2 ? 420 : 60, top: 640 + i * 150}}><BlackChip style={{fontSize: 46}}>{i + 1}  {t}</BlackChip></FromSide>
  ))}
  <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: `linear-gradient(180deg, rgba(246,245,241,0), ${C.bg} 30%)`}} />
</>);

const StampScene = ({f, w, gf}) => (<>
  <div style={{position: 'absolute', inset: 0}}><ReelWall f={gf} /></div>
  <div style={{position: 'absolute', inset: 0, background: 'rgba(246,245,241,0.35)'}} />
  {f >= w('not') && <Stamp f={f - w('not')} text="NOT SPONSORED" color={RED} style={{left: 110, top: 560}} />}
  <FromSide f={f - w('never') + 4} side="left" style={{left: 140, top: 900}}><BlackChip x style={{fontSize: 46}}>"A brand hired me"</BlackChip></FromSide>
  <div style={{position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: `linear-gradient(180deg, rgba(246,245,241,0), ${C.bg} 30%)`}} />
</>);

const Catch = ({f, w, s}) => {
  const items = s.items || [['samples', 'No samples, no yes', true], ['rates', 'Rates vary by niche', true]];
  return (<>
    <PopIn f={f - 2} style={{left: 0, right: 0, top: 170, textAlign: 'center'}}><div style={{display: 'inline-block', color: RED, fontWeight: 900, fontSize: 110, letterSpacing: 2}}>THE CATCH</div></PopIn>
    <div style={{position: 'absolute', left: 260, top: 330}}><Face mood={lerp(f, 0, w(items[items.length - 1][0]), 0.2, 0.8)} f={f} size={450} hold={s.hold || 'laptop'} /></div>
    {items.map(([k, t, x], i) => (
      <FromSide key={k} f={f - w(k) + 4} side={i % 2 ? 'right' : 'left'} style={{left: i % 2 ? 300 : 70, top: 960 + i * 140}}><BlackChip x={x}>{t}</BlackChip></FromSide>
    ))}
  </>);
};

const JSTEPS = [
  {k: 'samples', t: 'Film 3 samples', hold: 'film', mood: 0},
  {k: 'apply', t: 'Apply on Billo', hold: 'laptop', mood: -0.2},
  {k: 'pitch', t: 'Pitch on JoinBrands', hold: 'call', mood: -0.4},
  {k: 'paid', t: 'Get paid', hold: 'money', mood: -1},
];
const Journey = ({f, w}) => {
  const GAP = 560; const Y = (i) => 300 + i * GAP; const L = (i) => i % 2 === 0; const X = (i) => (L(i) ? 300 : 780);
  let cam = Y(0) - 330;
  JSTEPS.forEach((p, i) => { if (i > 0) cam += GAP * ease(f - w(p.k) + 6, 14); });
  const book = ease(f - w('guide') + 4, 14);
  const at = (i) => (i === 0 ? Math.min(4, w(JSTEPS[0].k) - 6) : w(JSTEPS[i].k) - 6);
  const path = `M${X(0)} ${Y(0) + 50}` + JSTEPS.slice(1).map((_, j) => { const i = j + 1; return ` C ${X(i - 1)} ${Y(i - 1) + 330}, ${X(i)} ${Y(i) - 230}, ${X(i)} ${Y(i) + 50}`; }).join('');
  return (<>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 3000, transform: `translateY(${-cam}px)`, opacity: 1 - book * 0.85}}>
      <DrawLine d={path} p={lerp(f, at(0), at(3) + 10, 0, 1)} color={C.ink} width={10} len={2600} />
      {JSTEPS.map((p, i) => (
        <React.Fragment key={i}>
          <FromSide f={f - at(i)} side={L(i) ? 'left' : 'right'} dist={500} style={{left: L(i) ? 60 : 500, top: Y(i)}}>
            <Chip green={i === 3} dark={i !== 3} style={{position: 'static'}}>{p.t}</Chip>
          </FromSide>
          <div style={{position: 'absolute', left: L(i) ? 470 : 20, top: Y(i) + 90, opacity: ease(f - at(i) - 4, 10)}}><Face mood={p.mood} f={f} size={430} hold={p.hold} /></div>
        </React.Fragment>
      ))}
    </div>
    <div style={{position: 'absolute', left: 290, top: 300, width: 500, height: 660, opacity: book, transform: `perspective(1800px) translateY(${(1 - book) * 300}px) rotateY(${-24 + book * 10}deg) rotateX(6deg)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '12px 30px 30px 12px', background: `linear-gradient(150deg, ${C.ink}, #2B2B2B)`, boxShadow: '0 30px 90px rgba(46,125,79,0.35)', padding: 50, boxSizing: 'border-box', color: '#fff'}}>
        <div style={{fontSize: 30, fontWeight: 800, letterSpacing: 4, color: '#7BE0A0'}}>FREE GUIDE</div>
        <div style={{fontSize: 74, fontWeight: 900, lineHeight: 1.05, marginTop: 20}}>UGC: your first paid video</div>
        <div style={{position: 'absolute', left: 50, right: 50, bottom: 110, height: 8, borderRadius: 4, background: C.acc}} />
        <div style={{position: 'absolute', left: 50, bottom: 50, fontSize: 30, fontWeight: 700}}>subcreatorpaid.com</div>
      </div>
      <div style={{position: 'absolute', left: -16, top: 10, bottom: 10, width: 24, borderRadius: 8, background: '#000'}} />
    </div>
  </>);
};

const EndRows = [
  ['comment', (<>Comment <span style={{background: C.acc, color: '#fff', borderRadius: 12, padding: '0 14px'}}>GUIDE</span></>), 'free guide'],
  ['subcreatorpaid', 'subcreatorpaid.com', 'every step, free'],
  ['tools', 'Tools I use', 'affiliate links in bio'],
  ['follow', 'Follow @subcreatorpaid', 'one income stream at a time'],
];
const EndCta = ({f, w, s}) => (<>
  <div style={{position: 'absolute', left: 60, top: 160, width: 330, height: 440, transform: 'perspective(1600px) rotateY(18deg) rotateX(4deg)', opacity: ease(f, 12)}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: '10px 24px 24px 10px', background: `linear-gradient(150deg, ${C.ink}, #2B2B2B)`, boxShadow: '0 30px 80px rgba(46,125,79,0.3)', padding: 34, boxSizing: 'border-box', color: '#fff'}}>
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#7BE0A0'}}>FREE GUIDE</div>
      <div style={{fontSize: 50, fontWeight: 900, lineHeight: 1.05, marginTop: 14}}>{s.guide || 'UGC: your first paid video'}</div>
    </div>
  </div>
  <div style={{position: 'absolute', left: 520, top: 180, transform: 'scale(0.62)', transformOrigin: 'left top'}}><Face mood={-1} f={f} size={700} hold="money" /></div>
  {EndRows.map(([k, t, sub], i) => (
    <FromSide key={k} f={f - w(k) + 6} side={i % 2 ? 'right' : 'left'} style={{left: 70, right: 70, top: 680 + i * 165}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, background: i === 0 ? C.ink : '#fff', color: i === 0 ? '#fff' : C.ink, borderRadius: 30, padding: '22px 32px',
        border: i === 0 ? 'none' : `3px solid ${C.ink}`, boxShadow: glow('0,0,0', 0.12, 50)}}>
        <div style={{width: 56, height: 56, borderRadius: 28, background: i === 0 ? '#fff' : C.ink, color: i === 0 ? C.ink : '#fff', fontWeight: 900, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
        <div style={{flex: 1}}><div style={{fontWeight: 900, fontSize: 46}}>{t}</div><div style={{fontWeight: 600, fontSize: 28, opacity: 0.65}}>{sub}</div></div>
      </div>
    </FromSide>
  ))}
</>);


// ---------- video 2 scenes (views won't pay)
const fmtM = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round(n).toLocaleString('en-US'));
const Viral = ({f, w}) => {
  const g = ease(f - 4, 40);
  const pts = Array.from({length: 12}, (_, i) => [80 + i * 76, 560 - Math.pow(i / 11, 2.6) * 380]);
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  return (<>
    <FromSide f={f} side="left" style={{left: 70, right: 70, top: 170}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '30px 40px', boxShadow: '0 18px 70px rgba(255,0,0,0.18), 0 0 0 3px rgba(255,0,0,0.12)', position: 'relative', height: 560}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Logo name="youtube" size={80} /><div style={{fontWeight: 800, fontSize: 44}}>Your Short</div></div>
        <div style={{fontWeight: 900, fontSize: 120, marginTop: 10}}>{fmtM(interpolate(g, [0, 1], [0, 2400000]))}</div>
        <div style={{fontWeight: 700, fontSize: 36, color: '#5F5E58', marginTop: -10}}>views</div>
        <svg width="940" height="600" style={{position: 'absolute', left: 0, top: 0}} fill="none"><path d={d} stroke={C.ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1600" strokeDashoffset={1600 * (1 - g)} /></svg>
      </div>
    </FromSide>
    <FromSide f={f - w('zero') + 8} side="right" style={{left: 70, right: 70, top: 780}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 44px', background: C.ink, color: '#fff', borderRadius: 40,
        boxShadow: '0 20px 80px rgba(217,58,58,0.45), 0 0 0 3px rgba(217,58,58,0.5)'}}>
        <div style={{fontWeight: 800, fontSize: 54}}>Earned</div><RedPill size={96}>$0.00</RedPill>
      </div>
    </FromSide>
    <div style={{position: 'absolute', left: 620, top: 990, transform: `translateX(${(1 - ease(f - w('why'), 12)) * 600}px) scale(0.5)`, transformOrigin: 'left top'}}><Face mood={0.9} f={f} size={700} /></div>
  </>);
};

const Avatar = ({x, y, s = 1, col = '#F2C9A5', o = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 70 * s, height: 70 * s, borderRadius: 35 * s, background: col, border: `${4 * s}px solid ${C.ink}`, opacity: o, boxSizing: 'border-box'}}>
    <div style={{position: 'absolute', left: '28%', top: '40%', width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: C.ink}} />
    <div style={{position: 'absolute', right: '28%', top: '40%', width: 8 * s, height: 8 * s, borderRadius: 4 * s, background: C.ink}} />
  </div>
);
const ViewsFans = ({f, w}) => {
  const gone = ease(f - w('fans') + 6, 12);
  const ring = Array.from({length: 10}, (_, i) => [Math.cos(i / 10 * 2 * Math.PI) * 330, Math.sin(i / 10 * 2 * Math.PI) * 300]);
  return (<>
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', opacity: 1 - gone, transform: `translateX(${-gone * 600}px)`}}>
      <PopIn f={f - w('views') + 4} style={{position: 'relative'}}><BlackChip x style={{fontSize: 70, padding: '30px 50px'}}>Views</BlackChip></PopIn>
    </div>
    <div style={{position: 'absolute', left: 300, top: 420}}><Face mood={gone > 0.5 ? -0.8 : 0.5} f={f} size={480} hold={gone > 0.5 ? 'money' : null} /></div>
    {ring.map(([x, y], i) => {
      const p = ease(f - w('fans') - i * 2, 10);
      return <Avatar key={i} x={540 + x * p - 35} y={720 + y * p - 35} o={p} />;
    })}
    <PopIn f={f - w('fans') - 10} style={{left: 0, right: 0, top: 1190, textAlign: 'center'}}>
      <div style={{display: 'inline-block', background: C.acc, color: '#fff', fontWeight: 900, fontSize: 60, padding: '12px 40px', borderRadius: 26, boxShadow: '0 0 60px rgba(46,125,79,0.45)'}}>Fans pay</div>
    </PopIn>
  </>);
};

const Bar = ({label, val, max, p, fmt, red}) => (
  <div style={{marginTop: 34}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 44}}><span>{label}</span><span>{fmt(val * p)} / {fmt(max)}</span></div>
    <div style={{height: 34, borderRadius: 17, background: C.line, marginTop: 14, overflow: 'hidden'}}>
      <div style={{width: `${Math.min(1, val / max) * p * 100}%`, height: '100%', background: red ? RED : C.ink, borderRadius: 17}} />
    </div>
  </div>
);
const Ypp = ({f, w}) => {
  const p1 = ease(f - w('one') + 4, 24); const p2 = ease(f - w('10') + 4, 24);
  return (<>
    <FromSide f={f} side="right" style={{left: 70, right: 70, top: 170}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '36px 44px 46px', boxShadow: '0 18px 70px rgba(255,0,0,0.16), 0 0 0 3px rgba(255,0,0,0.12)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Logo name="youtube" size={80} /><div style={{fontWeight: 900, fontSize: 50}}>Shorts ad money</div></div>
        <Bar label="Subscribers" val={847} max={1000} p={p1} fmt={(n) => Math.round(n).toLocaleString('en-US')} />
        <Bar label="Views / 90 days" val={2400000} max={10000000} p={p2} fmt={fmtM} red />
      </div>
    </FromSide>
    <PopIn f={f - w('10') - 6} style={{left: 0, right: 0, top: 760, textAlign: 'center'}}><div style={{display: 'inline-block', fontWeight: 900, fontSize: 150, color: RED}}>10,000,000</div></PopIn>
    <div style={{position: 'absolute', left: 340, top: 900, transform: 'scale(0.5)', transformOrigin: 'left top'}}><Face mood={lerp(f, 0, w('ninety'), 0.3, 1)} f={f} size={700} hold="phone0" /></div>
  </>);
};

const FanLadder = ({f, w}) => {
  const steps = [
    {k: 'spotify', logo: 'spotify', t: 'Spotify Memberships', v: '100 listeners', x: 50, y: 900, green: true},
    {k: 'five', logo: 'youtube', t: 'YouTube fan funding', v: '500 subscribers', x: 220, y: 640, green: true},
    {k: 'ads', logo: 'youtube', t: 'Shorts ad money', v: '1,000 subs + 10M views', x: 390, y: 380, green: false},
  ];
  const at = [w('spotify'), w('five'), Math.min(4, w('fan'))];
  const climb = f >= w('spotify') ? 0 : f >= w('five') ? 1 : 2;
  return (<>
    {steps.map((s, i) => {
      const p = ease(f - at[i] + 6, 14);
      return (
        <div key={i} style={{position: 'absolute', left: s.x, top: s.y, width: 560, opacity: i === 2 ? 0.55 + 0.45 * p : p,
          transform: `perspective(1800px) rotateX(18deg) rotateZ(-4deg) translateY(${(1 - p) * 80}px)`}}>
          <div style={{background: i === 2 ? '#fff' : C.ink, color: i === 2 ? C.ink : '#fff', borderRadius: 30, padding: '24px 30px', border: i === 2 ? `3px dashed ${C.muted}` : 'none',
            boxShadow: s.green ? '0 20px 70px rgba(46,125,79,0.4)' : glow('0,0,0', 0.1, 50), display: 'flex', alignItems: 'center', gap: 20}}>
            <Logo name={s.logo} size={70} />
            <div><div style={{fontWeight: 700, fontSize: 32, opacity: 0.75}}>{s.t}</div><div style={{fontWeight: 900, fontSize: 48, color: s.green ? '#7BE0A0' : C.ink}}>{s.v}</div></div>
          </div>
        </div>
      );
    })}
    <PopIn f={f - 4} style={{left: 60, top: 200}}><div style={{fontWeight: 900, fontSize: 70, lineHeight: 1.05}}>Fan money starts<br /><span style={{color: C.acc}}>much earlier</span></div></PopIn>
    <div style={{position: 'absolute', left: [690, 700, 20][climb], top: [1010, 720, 470][climb], transform: 'scale(0.36)', transformOrigin: 'left top'}}>
      <Face mood={climb < 2 ? -0.9 : 0.3} f={f} size={700} hold={climb < 2 ? 'money' : null} />
    </div>
  </>);
};

const SmallGroup = ({f, w}) => {
  const g = ease(f - 2, 14); const c = ease(f - w('crowd') + 4, 14); const x = ease(f - w('scrolls') + 2, 10);
  const small = Array.from({length: 8}, (_, i) => [Math.cos(i / 8 * 2 * Math.PI) * 150, Math.sin(i / 8 * 2 * Math.PI) * 150]);
  return (<>
    <div style={{position: 'absolute', left: 60, top: 160, width: 460, height: 760, borderRadius: 40, background: '#fff', boxShadow: '0 20px 80px rgba(46,125,79,0.35)', opacity: g}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontWeight: 900, fontSize: 48}}>Small group</div>
      {small.map(([a, b], i) => <Avatar key={i} x={230 + a * g - 35} y={380 + b * g - 35} />)}
      <div style={{position: 'absolute', left: 175, top: 325, width: 110, height: 110, borderRadius: 55, background: C.acc, color: '#fff', fontWeight: 900, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center', fontWeight: 900, fontSize: 52, color: C.acc}}>pays</div>
    </div>
    <div style={{position: 'absolute', left: 560, top: 160, width: 460, height: 760, borderRadius: 40, background: '#fff', overflow: 'hidden', boxShadow: '0 20px 80px rgba(217,58,58,0.25)', opacity: c}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center', fontWeight: 900, fontSize: 48, zIndex: 2}}>Big crowd</div>
      {Array.from({length: 40}, (_, i) => <Avatar key={i} x={20 + (i % 5) * 86} y={130 + Math.floor(i / 5) * 86 - ((f * 6) % 86)} s={0.9} col="#D6D2C4" o={0.8} />)}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: '#fff'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 50, textAlign: 'center', fontWeight: 900, fontSize: 52, color: RED}}>scrolls</div>
    </div>
    {x > 0 && <div style={{position: 'absolute', left: 730, top: 440, transform: `scale(${pop(f - w('scrolls') + 2)})`}}><XMark size={130} /></div>}
    <div style={{position: 'absolute', left: 120, top: 960, transform: 'scale(0.48)', transformOrigin: 'left top'}}><Face mood={-0.8} f={f} size={700} hold="money" /></div>
  </>);
};

// ---------- video 3 scenes (you don't need 10K)
const Wait10k = ({f, w}) => {
  const p = ease(f - 4, 30);
  return (<>
    <FromSide f={f} side="left" style={{left: 70, right: 70, top: 200}}>
      <div style={{background: '#fff', borderRadius: 40, padding: '36px 44px 44px', boxShadow: glow('0,0,0', 0.12, 70)}}>
        <div style={{display: 'flex', gap: 16}}><Logo name="instagram" size={64} /><Logo name="tiktok" size={64} /><Logo name="youtube" size={64} /></div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 24}}>
          <div style={{fontWeight: 900, fontSize: 96}}><CountUp f={f - 4} from={0} to={847} d={30} /></div>
          <div style={{fontWeight: 800, fontSize: 48, color: '#5F5E58'}}>/ 10,000</div>
        </div>
        <div style={{height: 34, borderRadius: 17, background: C.line, marginTop: 16, overflow: 'hidden'}}><div style={{width: `${8.5 * p}%`, height: '100%', background: RED, borderRadius: 17}} /></div>
        <div style={{fontWeight: 700, fontSize: 36, color: '#5F5E58', marginTop: 16}}>followers before you earn?</div>
      </div>
    </FromSide>
    <div style={{position: 'absolute', left: 230, top: 680}}><Face mood={lerp(f, 0, w('earn'), 0.3, 0.9)} f={f} size={520} hold="phone0" /></div>
  </>);
};

const ProofIntro = ({f, w}) => {
  const strike = ease(f - w("don't") + 2, 10);
  const cards = [['youtube', 'YouTube'], ['spotify', 'Spotify'], [null, 'OpusClip']];
  return (<>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontWeight: 900, fontSize: 170, color: strike > 0 ? '#A9A79F' : C.ink}}>
      <span style={{position: 'relative'}}>10,000<span style={{position: 'absolute', left: -10, top: '50%', height: 22, width: `${strike * 106}%`, background: RED, borderRadius: 11}} /></span>
    </div>
    {cards.map(([lg, t], i) => {
      const p = ease(f - w('three') - i * 4 + 4, 14);
      return (
        <div key={t} style={{position: 'absolute', left: 90 + i * 300, top: 470, width: 300, height: 400, opacity: p, borderRadius: 30, background: '#fff', boxShadow: glow('0,0,0', 0.16, 60),
          transform: `perspective(1600px) translateY(${(1 - p) * 200}px) rotateY(${(i - 1) * -22}deg) rotateZ(${(i - 1) * 4}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          <div style={{position: 'absolute', left: 22, top: 22, width: 54, height: 54, borderRadius: 27, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
          {lg ? <Logo name={lg} size={110} /> : <div style={{width: 110, height: 110, borderRadius: 26, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Op</div>}
          <div style={{fontWeight: 900, fontSize: 44}}>{t}</div>
          <div style={{fontWeight: 700, fontSize: 26, color: '#5F5E58'}}>official page</div>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 340, top: 900, transform: 'scale(0.5)', transformOrigin: 'left top'}}><Face mood={-0.6} f={f} size={700} hold={null} /></div>
  </>);
};

// An official page (summary card or phone snap) tilted in 3D, the key line called out, the face reacting.
const Official = ({f, w, s}) => {
  const p = ease(f - 2, 16);
  const call = ease(f - w(s.key_word || 'starts') + 4, 12);
  return (<>
    <PopIn f={f - 2} style={{left: 70, top: 150}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 64, height: 64, borderRadius: 32, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{s.n}</div>
        {s.logo ? <Logo name={s.logo} size={72} /> : null}<div style={{fontWeight: 900, fontSize: 56}}>{s.name}</div>
      </div>
    </PopIn>
    {s.phone ? (
      <Phone w={480} h={790} style={{left: 520, top: 280, opacity: p, transform: `perspective(2200px) rotateY(${-14 + (1 - p) * -40}deg)`}}><Snap src={s.images[0].replace('assets/', 'a_')} /></Phone>
    ) : (
      <div style={{position: 'absolute', left: 130, top: 280, width: 820, borderRadius: 30, overflow: 'hidden', opacity: p, boxShadow: glow('0,0,0', 0.18, 80),
        transform: `perspective(2200px) rotateY(${(1 - p) * 40 - 8}deg) rotateX(6deg) translateX(${(1 - p) * 300}px)`}}>
        <Img src={staticFile(s.images[0].replace('assets/', 'a_'))} style={{width: '100%', display: 'block'}} />
      </div>
    )}
    <div style={{position: 'absolute', left: s.phone ? 60 : 70, top: s.phone ? 560 : 1080, opacity: call, transform: `scale(${pop(f - w(s.key_word || 'starts') + 4)})`}}>
      <div style={{background: s.call_green ? C.acc : C.ink, color: '#fff', fontWeight: 900, fontSize: 52, padding: '18px 34px', borderRadius: 26, boxShadow: s.call_green ? '0 0 60px rgba(46,125,79,0.45)' : glow('0,0,0', 0.2, 50), whiteSpace: 'pre-line', maxWidth: 520}}>{s.call}</div>
    </div>
    <div style={{position: 'absolute', left: s.phone ? 40 : 700, top: s.phone ? 860 : 1040, transform: 'scale(0.4)', transformOrigin: 'left top', opacity: ease(f - 6, 10)}}><Face mood={-0.7} f={f} size={700} hold="laptop" /></div>
  </>);
};

const SCENES = {...SCENES2, wait10k: Wait10k, proof_intro: ProofIntro, official: Official, viral: Viral, views_fans: ViewsFans, ypp: Ypp, fan_ladder: FanLadder, small_group: SmallGroup, counters: Counters, face_strike: FaceStrike, phone_fly: PhoneFly, ugc_explain: UgcExplain, rate3d: Rate, apps: Apps, wall: Wall, stamp_wall: StampScene, catch: Catch, journey: Journey, end_rows: EndCta};

const Scene = ({b, i, start, len, last}) => {
  const lf = useCurrentFrame();
  const gf = lf + start;
  const w = (k) => { const ws = b.words || []; const hit = ws.find((x) => clean(x.w) === clean(k)) || ws.find((x) => clean(x.w).startsWith(clean(k))); return (hit ? hit.f : b.speakFrom) - start; };
  const S = SCENES[b.show.type] || Catch;
  const cont = b.show.continue; // keeps the background running into the next scene (no exit)
  const out = last || cont ? 0 : ease(lf - (len - OV), OV);
  const inn = i === 0 || b.show.from_prev ? 1 : ease(lf, OV + 2);
  return (
    <AbsoluteFill style={{opacity: 1 - out * 0.4, transform: `perspective(2400px) translateX(${(1 - inn) * 1080 - out * 1080}px) rotateY(${out * 14 - (1 - inn) * 14}deg)`}}>
      <S f={lf} w={w} s={b.show} len={len} gf={gf} />
    </AbsoluteFill>
  );
};

// Subtitles: 2-4 word chunks, red for loss words, green for money words; the handle sits under them.
const Subs = ({beats, handle}) => {
  const f = useCurrentFrame();
  const all = []; beats.forEach((b, bi) => (b.words || []).forEach((w) => all.push({...w, bi, red: (b.show.red || []).map(clean), green: (b.show.green || []).map(clean)})));
  const chunks = []; let cur = [];
  all.forEach((w, i) => {
    const prev = all[i - 1];
    if (cur.length && (cur.length >= 4 || (cur.length >= 2 && /[.,:;?!]$/.test(prev.w)) || w.bi !== prev.bi || w.f - prev.f > 14)) { chunks.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) chunks.push(cur);
  for (let i = chunks.length - 1; i >= 0; i--) if (chunks[i].every((x) => !/\w/.test(x.w))) { if (i > 0) chunks[i - 1].push(...chunks[i]); chunks.splice(i, 1); }
  let ci = -1; chunks.forEach((c, i) => { if (f >= c[0].f - 2) ci = i; });
  const ch = ci >= 0 ? chunks[ci] : null;
  const kin = ch ? ease(f - ch[0].f + 2, 5) : 0;
  return (<>
    {ch && (
      <div style={{position: 'absolute', left: 50, right: 50, top: 1420, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.12, opacity: kin, transform: `translateY(${(1 - kin) * 10}px)`}}>
        {ch.map((w, i) => {
          const c = clean(w.w);
          const col = w.red.includes(c) ? RED : w.green.includes(c) ? C.acc : C.ink;
          return <span key={i} style={{color: col}}>{String(w.w).replace(/\*/g, '')} </span>;
        })}
      </div>
    )}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1590, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink, opacity: 0.55}}>{handle}</div>
  </>);
};

export const Story = ({beats = [], handle = '@subcreatorpaid', total}) => (
  <AbsoluteFill style={{background: C.bg, overflow: 'hidden', fontFamily: FONT, color: C.ink}}>
    <Fonts />
    <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: '90px 90px', opacity: 0.35}} />
    {beats.map((b, i) => {
      const start = Math.max(0, b.from - (i ? OV : 0));
      const end = i + 1 < beats.length ? beats[i + 1].from : total;
      const len = Math.max(1, end - start);
      return <Sequence key={i} from={start} durationInFrames={len}><Scene b={b} i={i} start={start} len={len} last={i === beats.length - 1} /></Sequence>;
    })}
    <Subs beats={beats} handle={handle} />
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
