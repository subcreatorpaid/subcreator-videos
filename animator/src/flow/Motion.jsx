// "Motion" film (owner sent a motion breakdown, 30 Oct 2026): one continuous vertical camera travel linking every scene (no cuts),
// elastic overshoot + heavy deceleration, kinetic text rising from a mask, floating idle cards, dotted trim-path draw-ons,
// pop-in badges, radial bursts, one inverted flash cut, a circular mask at the end. Brand stays: off-white #F5F5F2, ink #0E0E10,
// lime #CDF24F, red only for loss, Inter. Sample topic: "views won't pay" (script 20261027_views_wont_pay).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {expo, spring, kf, mix, clamp01, Rise, useTimes, hash} from './kit';
import {BrandLogo, Icon, Check} from './art';

const K = {bg: '#F5F5F2', ui: '#0E0E10', lime: '#CDF24F', mut: '#8B8B86', red: '#E5484D', line: '#D9D9D3'};
const GAP = 2300; // world distance between scene centres
const cy = (i) => i * GAP + 960;
const shadow = '0 30px 60px rgba(14,14,16,0.14), 0 6px 14px rgba(14,14,16,0.08)';

const Pop = ({f, at, children, style = {}, from = 0.2}) => {
  const p = spring(f - at, {w: 0.34, z: 0.55}); if (f < at) return null;
  return <div style={{position: 'absolute', transform: `scale(${mix(from, 1, p)})`, opacity: clamp01((f - at) / 3), ...style}}>{children}</div>;
};
const Float = ({f, seed = 0, amp = 10, children, style = {}}) => (
  <div style={{position: 'absolute', transform: `translateY(${Math.sin(f / 22 + seed) * amp}px) rotate(${Math.sin(f / 31 + seed * 2) * 1.6}deg)`, ...style}}>{children}</div>
);
const Dot = ({size = 90, color = K.lime, ink = K.ui, heart}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: color, border: `4px solid ${ink}`, position: 'relative', boxSizing: 'border-box'}}>
    <div style={{position: 'absolute', left: '28%', top: '38%', width: size * 0.09, height: size * 0.09, borderRadius: '50%', background: ink}} />
    <div style={{position: 'absolute', right: '28%', top: '38%', width: size * 0.09, height: size * 0.09, borderRadius: '50%', background: ink}} />
    <div style={{position: 'absolute', left: '30%', top: '52%', width: '40%', height: '20%', borderBottom: `4px solid ${ink}`, borderRadius: '0 0 50% 50%'}} />
    {heart && <div style={{position: 'absolute', right: -size * 0.12, top: -size * 0.14, width: size * 0.44, height: size * 0.44, borderRadius: '50%', background: K.ui, color: K.lime, fontWeight: 900, fontSize: size * 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>$</div>}
  </div>
);
const Ring = ({f, x, y, at, d = 700, color = K.lime, n = 4}) => (
  <>{Array.from({length: n}, (_, k) => { const t = (f - at - k * 9) / 46; if (t < 0) return null; const p = (t % 1);
    return <div key={k} style={{position: 'absolute', left: x - (d * p) / 2, top: y - (d * p) / 2, width: d * p, height: d * p, borderRadius: '50%', border: `${10 - p * 6}px solid ${color}`, opacity: 1 - p}} />; })}</>
);
const Draw = ({d, p, w = 12, color = K.ui, dash = '2 26'}) => (
  <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} opacity={0.35} />
    <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" pathLength="1" strokeDasharray={`${p} 1`} />
  </svg>
);
const Card = ({w, h, children, style = {}, dark}) => (
  <div style={{width: w, height: h, borderRadius: 44, background: dark ? K.ui : '#fff', color: dark ? '#fff' : K.ui, boxShadow: shadow, fontFamily: FONT, ...style}}>{children}</div>
);
const Box = ({children, color = K.lime, ink = K.ui}) => <span style={{background: color, color: ink, borderRadius: 22, padding: '0 22px', display: 'inline-block'}}>{children}</span>;

// ---- scenes (local coords 0..1080 x 0..1920, t = frames since the scene's beat started)
const Viral = ({f, B, W}) => {
  const t = f - B(0); const n = Math.round(2400000 * expo(t - 4, 60));
  const arc = [['instagram', -60], ['tiktok', 0], ['youtube', 60]];
  return (<>
    <Ring f={f} x={540} y={760} at={B(0) + 2} />
    <Pop f={f} at={B(0) + 2} style={{left: 190, top: 560, width: 700, height: 400}}>
      <Card w={700} h={400} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 130, letterSpacing: -5}}>{n.toLocaleString('en-US')}</div>
        <div style={{fontWeight: 700, fontSize: 44, color: K.mut}}>views</div>
      </Card>
    </Pop>
    {arc.map(([name, a], i) => { const ang = (a - 90) * Math.PI / 180, r = 520 * expo(t - 8 - i * 5, 14);
      return <Float key={name} f={f} seed={i} style={{left: 540 + Math.cos(ang) * r * 1.25 - 55, top: 760 + Math.sin(ang) * r * 0.75 - 140 - 55 + 140, opacity: clamp01(t / 10)}}>
        <div style={{width: 110, height: 110, borderRadius: 30, background: '#fff', boxShadow: shadow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BrandLogo name={name} size={70} /></div></Float>; })}
    <Rise text="You went viral." at={B(0) + 8} f={f} size={104} style={{position: 'absolute', left: 90, top: 1080, width: 900}} />
    <Pop f={f} at={W(0, 'zero')} style={{left: 250, top: 1290, width: 580}} from={0.1}>
      <div style={{background: K.red, color: '#fff', borderRadius: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 170, letterSpacing: -6, padding: '10px 0', boxShadow: shadow}}>$0</div>
    </Pop>
  </>);
};
const Fans = ({f, B, W}) => {
  const t = f - B(1);
  return (<>
    <Rise text="Views" at={B(1) + 10} f={f} size={96} style={{position: 'absolute', left: 90, top: 280}} />
    <Rise text="don't pay first." at={B(1) + 14} f={f} size={96} style={{position: 'absolute', left: 90, top: 390}} />
    {/* conveyor of views: grey, slides across on X, fades out */}
    {Array.from({length: 7}, (_, i) => { const x = ((i * 190 + 1200 - t * 9) % 1330) - 120;
      return <div key={i} style={{position: 'absolute', left: x, top: 640 + (i % 2) * 40, opacity: 0.8}}><Dot size={110} color="#E4E4DE" ink="#B8B8B2" /></div>; })}
    <div style={{position: 'absolute', left: 90, top: 900, width: 900, height: 6, background: K.line}} />
    <Rise text="Fans do." at={W(1, 'fans') - 2} f={f} size={150} style={{position: 'absolute', left: 90, top: 960}} />
    {Array.from({length: 4}, (_, i) => <Pop key={i} f={f} at={W(1, 'fans') + 4 + i * 5} style={{left: 140 + i * 215, top: 1250}}><Float f={f} seed={i * 1.7}><Dot size={170} heart={i === 1 || i === 3} /></Float></Pop>)}
    <Pop f={f} at={W(1, 'fans') + 12} style={{left: 90, top: 1540}}><Box><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 70}}>Fans pay first</span></Box></Pop>
  </>);
};
const Ypp = ({f, B, W}) => {
  const t = f - B(2); const p = expo(t - 18, 40);
  return (<>
    <Rise text="YouTube Shorts ad money" at={B(2) + 6} f={f} size={84} style={{position: 'absolute', left: 90, top: 250, width: 900}} />
    <Pop f={f} at={W(2, 'one')} style={{left: 140, top: 640}}><Float f={f} seed={1}>
      <Card w={800} h={290} style={{padding: 40, boxSizing: 'border-box'}}><div style={{fontWeight: 900, fontSize: 120, letterSpacing: -4}}>1,000</div><div style={{fontWeight: 700, fontSize: 48, color: K.mut}}>subscribers</div></Card></Float></Pop>
    <Draw d="M 540 940 C 540 1060 200 1060 200 1180 C 200 1260 540 1260 540 1330" p={p} />
    <Pop f={f} at={W(2, '10')} style={{left: 140, top: 1330}}><Float f={f} seed={4}>
      <Card w={800} h={330} style={{padding: 40, boxSizing: 'border-box'}}><div style={{fontWeight: 900, fontSize: 112, letterSpacing: -4, color: K.red}}>10,000,000</div><div style={{fontWeight: 700, fontSize: 48, color: K.mut}}>Shorts views in 90 days</div></Card></Float></Pop>
    <Pop f={f} at={W(2, '10') + 8} from={0.1} style={{left: 760, top: 1250}}><div style={{width: 130, height: 130, borderRadius: 65, background: K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: shadow}}><BrandLogo name="youtube" size={80} /></div></Pop>
  </>);
};
const Ladder = ({f, B, W}) => {
  const t = f - B(3); const p = expo(t - 8, 70);
  return (<>
    <Rise text="Fan money starts earlier." at={B(3) + 6} f={f} size={92} style={{position: 'absolute', left: 90, top: 240, width: 900}} />
    <Draw d="M 220 1650 C 220 1450 860 1500 860 1250 C 860 1050 220 1100 220 850" p={p} w={14} />
    <Pop f={f} at={W(3, 'five')} style={{left: 90, top: 1060}}>
      <Float f={f} seed={2}><Card w={600} h={250} style={{display: 'flex', alignItems: 'center', gap: 30, padding: 36, boxSizing: 'border-box'}}><BrandLogo name="youtube" size={110} /><div><div style={{fontWeight: 900, fontSize: 78, letterSpacing: -3}}>500</div><div style={{fontWeight: 700, fontSize: 36, color: K.mut}}>subscribers</div></div></Card></Float></Pop>
    <Pop f={f} at={W(3, 'spotify')} style={{left: 390, top: 700}}>
      <Float f={f} seed={5}><Card w={600} h={250} style={{display: 'flex', alignItems: 'center', gap: 30, padding: 36, boxSizing: 'border-box'}}><BrandLogo name="spotify" size={110} /><div><div style={{fontWeight: 900, fontSize: 78, letterSpacing: -3}}>100</div><div style={{fontWeight: 700, fontSize: 36, color: K.mut}}>listeners</div></div></Card></Float></Pop>
    <Pop f={f} at={W(3, 'five') + 10} style={{left: 640, top: 1000}}><Box><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 40}}>fan funding</span></Box></Pop>
    <Pop f={f} at={W(3, 'spotify') + 10} style={{left: 90, top: 640}}><Box><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 40}}>Memberships</span></Box></Pop>
  </>);
};
const Group = ({f, B, W}) => {
  const t = f - B(4); const b = W(4, 'small');
  return (<>
    {/* crowd that scrolls: grey, drifts up and away */}
    {Array.from({length: 36}, (_, i) => { const x = 40 + hash(i) * 960, y = 360 + hash(i + 40) * 1200 - clamp01((t - 40) / 50) * 300 * (0.5 + hash(i + 9));
      return <div key={i} style={{position: 'absolute', left: x, top: y, opacity: 0.55 * (1 - clamp01((t - 60) / 40)), transform: `scale(${0.6 + hash(i + 3) * 0.5})`}}><Dot size={90} color="#E4E4DE" ink="#B8B8B2" /></div>; })}
    {/* small group: radial burst from the centre, then idle */}
    {Array.from({length: 6}, (_, i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2, r = 300 * spring(f - b - i * 2, {w: 0.3, z: 0.6});
      return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r - 80, top: 960 + Math.sin(a) * r - 80}}><Float f={f} seed={i} amp={7}><Dot size={160} heart /></Float></div>; })}
    <Rise text="Build a small group" at={B(4) + 6} f={f} size={84} style={{position: 'absolute', left: 90, top: 220, width: 900}} />
    <Rise text="who would pay." at={B(4) + 10} f={f} size={84} style={{position: 'absolute', left: 90, top: 320}} />
    <Pop f={f} at={W(4, 'crowd')} style={{left: 90, top: 1600}}><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 56, color: K.red}}>not a crowd that scrolls</span></Pop>
  </>);
};
const ITEMS = [['Bonus episodes', 'bonus'], ['Live chats', 'live'], ['Country + review rules', 'country']];
const Catch = ({f, B, W}) => (<>
  <Pop f={f} at={B(5) + 14} from={0.1} style={{left: 90, top: 240}}><div style={{background: K.red, color: '#fff', borderRadius: 30, padding: '8px 36px', fontFamily: FONT, fontWeight: 900, fontSize: 80}}>The catch</div></Pop>
  <Rise text="Fans need a reason to pay." at={B(5) + 20} f={f} size={86} color="#fff" style={{position: 'absolute', left: 90, top: 440, width: 900}} />
  {ITEMS.map(([label, key], i) => { const at = W(5, key); const last = i === 2;
    return <Pop key={key} f={f} at={at} style={{left: 90, top: 840 + i * 270}}>
      <Float f={f} seed={i}><Card w={900} h={210} dark style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 44px', boxSizing: 'border-box', border: `5px solid ${last ? K.red : K.lime}`, boxShadow: 'none'}}>
        <div style={{width: 90, height: 90, borderRadius: 45, background: last ? K.red : K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{last ? <span style={{fontWeight: 900, fontSize: 60, color: '#fff'}}>!</span> : <Check size={56} p={clamp01((f - at - 4) / 10)} />}</div>
        <div style={{fontWeight: 800, fontSize: 58}}>{label}</div></Card></Float></Pop>; })}
</>);
const End = ({f, B, W}) => (<>
  <Rise text="Comment" at={W(6, 'comment')} f={f} size={90} color="#fff" style={{position: 'absolute', left: 90, top: 260}} />
  <Pop f={f} at={W(6, 'guide') || B(6) + 12} style={{left: 90, top: 400}}><div style={{background: K.lime, color: K.ui, borderRadius: 30, padding: '0 34px', fontFamily: FONT, fontWeight: 900, fontSize: 130}}>GUIDE</div></Pop>
  <Pop f={f} at={W(6, 'free')} style={{left: 90, top: 640}}><Float f={f} seed={3}><Card w={900} h={190} dark style={{display: 'flex', alignItems: 'center', padding: '0 44px', border: `4px solid ${K.lime}`, boxShadow: 'none', fontWeight: 900, fontSize: 56, boxSizing: 'border-box'}}>Fan money before ad money</Card></Float></Pop>
  <Pop f={f} at={W(6, 'subcreatorpaid')} style={{left: 90, top: 900}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 82, color: '#fff'}}>subcreatorpaid.com</div><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: K.lime, marginTop: 12}}>Free AI Income Finder</div></Pop>
  <Pop f={f} at={W(6, 'tools')} style={{left: 90, top: 1130}}><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 52, color: '#A5A5A0'}}>Tools I use: link in bio</div></Pop>
  <Pop f={f} at={W(6, 'follow')} style={{left: 270, top: 1360}}><div style={{width: 540, height: 130, borderRadius: 65, background: f > W(6, 'follow') + 8 ? '#2A2A2D' : K.lime, color: f > W(6, 'follow') + 8 ? '#fff' : K.ui, fontFamily: FONT, fontWeight: 900, fontSize: 56, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{f > W(6, 'follow') + 8 ? 'Following' : 'Follow'}</div></Pop>
</>);


// ---- second sample: "You don't need 10k followers" (script 20261027_no_10k_needed, plan in motion-sample/PLAN_no_10k_needed.md)
const Wait = ({f, B, W}) => {
  const t = f - B(0); const n = Math.min(9987, Math.round(9987 * expo(t - 4, 40)));
  return (<>
    <Ring f={f} x={540} y={800} at={B(0) + 2} d={820} />
    <Pop f={f} at={B(0) + 2} style={{left: 130, top: 600}}><Float f={f} seed={1}>
      <Card w={820} h={420} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 190, letterSpacing: -8}}>{n.toLocaleString('en-US')}</div>
        <div style={{fontWeight: 700, fontSize: 46, color: K.mut}}>followers</div></Card></Float></Pop>
    {['instagram', 'tiktok', 'youtube'].map((name, i) => <Pop key={name} f={f} at={B(0) + 10 + i * 5} style={{left: 250 + i * 250, top: 1130}}><Float f={f} seed={i}>
      <div style={{width: 110, height: 110, borderRadius: 30, background: '#fff', boxShadow: shadow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BrandLogo name={name} size={70} /></div></Float></Pop>)}
    <Rise text="Still waiting for 10,000?" at={B(0) + 8} f={f} size={96} style={{position: 'absolute', left: 90, top: 280, width: 900}} />
  </>);
};
const Reframe = ({f, B, W}) => {
  const t = f - B(1); const x = expo(t - W(1, 'need') + B(1), 12);
  return (<>
    <Float f={f} seed={2} style={{left: 130, top: 560}}><Card w={820} h={420} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      <div style={{fontWeight: 900, fontSize: 190, letterSpacing: -8, color: x > 0.5 ? K.mut : K.ui}}>10,000</div>
      <div style={{position: 'absolute', left: 80, top: 205, width: 660 * x, height: 16, borderRadius: 8, background: K.red, transform: 'rotate(-6deg)', transformOrigin: '0 50%'}} /></Card></Float>
    <Rise text="You don't need them." at={B(1) + 6} f={f} size={100} style={{position: 'absolute', left: 90, top: 1090, width: 900}} />
    <Pop f={f} at={W(1, 'official') || B(1) + 40} style={{left: 90, top: 1330}}><Box><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 64}}>3 official pages</span></Box></Pop>
    {Array.from({length: 10}, (_, i) => { const a = (i / 10) * Math.PI * 2, r = 330 * expo(t - W(1, 'need') + B(1) - i, 16); return t > W(1, 'need') - B(1) ? <div key={i} style={{position: 'absolute', left: 540 + Math.cos(a) * r - 12, top: 770 + Math.sin(a) * r * 0.7 - 12, width: 24, height: 24, borderRadius: 12, background: K.lime, opacity: 1 - expo(t - 40, 20)}} /> : null; })}
  </>);
};
const PROOF = [['youtube', '500', 'subscribers', 'fan funding'], ['spotify', '100', 'listeners', 'Memberships'], ['opusclip', '0', 'follower minimum', 'affiliate']];
const Proof = ({f, B, W}) => {
  const t = f - B(2);
  const at = [W(2, 'youtube'), W(2, 'spotify'), W(2, 'opusclip')];
  const draw = [expo(f - at[1] + 14, 24), expo(f - at[2] + 14, 24)];
  return (<>
    <Rise text="Official pages say so." at={B(2) + 6} f={f} size={86} style={{position: 'absolute', left: 90, top: 230, width: 900}} />
    {PROOF.map(([logo, num, unit, tag], i) => <Pop key={logo} f={f} at={at[i]} style={{left: 90, top: 470 + i * 430}}><Float f={f} seed={i * 2}>
      <Card w={900} h={300} style={{display: 'flex', alignItems: 'center', gap: 34, padding: 40, boxSizing: 'border-box'}}>
        <div style={{width: 130, height: 130, borderRadius: 34, background: K.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BrandLogo name={logo} size={90} /></div>
        <div><div style={{fontWeight: 900, fontSize: 120, letterSpacing: -5, lineHeight: 1}}>{num}</div><div style={{fontWeight: 700, fontSize: 40, color: K.mut}}>{unit}</div></div>
        <div style={{marginLeft: 'auto'}}><Box><span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34}}>{tag}</span></Box></div></Card></Float></Pop>)}
    <Draw d="M 130 770 C 60 850 60 880 130 900" p={draw[0]} w={10} />
    <Draw d="M 130 1200 C 60 1280 60 1310 130 1330" p={draw[1]} w={10} />
  </>);
};
const Catch2 = ({f, B, W}) => (<>
  <Pop f={f} at={B(3) + 14} from={0.1} style={{left: 90, top: 240}}><div style={{background: K.red, color: '#fff', borderRadius: 30, padding: '8px 36px', fontFamily: FONT, fontWeight: 900, fontSize: 80}}>The catch</div></Pop>
  <Rise text="Each one needs:" at={B(3) + 20} f={f} size={90} color="#fff" style={{position: 'absolute', left: 90, top: 440, width: 900}} />
  {[['Approval', 'approval'], ['Real work', 'real']].map(([label, key], i) => { const at = W(3, key); return <Pop key={key} f={f} at={at} style={{left: 90, top: 760 + i * 280}}><Float f={f} seed={i}>
    <Card w={900} h={220} dark style={{display: 'flex', alignItems: 'center', gap: 30, padding: '0 44px', boxSizing: 'border-box', border: `5px solid ${i ? K.red : K.lime}`, boxShadow: 'none'}}>
      <div style={{width: 90, height: 90, borderRadius: 45, background: i ? K.red : K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i ? <span style={{fontWeight: 900, fontSize: 60, color: '#fff'}}>!</span> : <Check size={56} p={clamp01((f - at - 4) / 10)} />}</div>
      <div style={{fontWeight: 800, fontSize: 66}}>{label}</div></Card></Float></Pop>; })}
</>);
const SETS = {
  views: {scenes: [Viral, Fans, Ypp, Ladder, Group, Catch, End], catchIdx: 5},
  no10k: {scenes: [Wait, Reframe, Proof, Catch2, End], catchIdx: 3},
};


export const Motion = ({beats = [], total = 300, variant = 'views'}) => {
  const {scenes: SCENES, catchIdx} = SETS[variant] || SETS.views;
  const f = useCurrentFrame();
  const {B, W} = useTimes(beats);
  const N = SCENES.length;
  // ---- one camera: scene i -> i+1 on a spring (overshoot), with a zoom dip in the middle of each travel
  let i = 0; for (let k = 1; k < N; k++) if (f >= B(k)) i = k;
  const t = f - B(i); const p = i === 0 ? 1 : spring(t, {w: 0.26, z: 0.68});
  const camY = i === 0 ? cy(0) : mix(cy(i - 1), cy(i), p);
  const dip = i === 0 ? 0 : Math.sin(Math.PI * clamp01(t / 26));
  const zoom = (1 - 0.2 * dip) * (i === catchIdx - 1 && variant === 'views' ? mix(1.0, 0.9, clamp01((t - 20) / 60)) : 1) * (1 + (i === 0 ? 0.04 * expo(24 - t, 24) : 0));
  const sway = Math.sin(f / 37) * 5;
  const flash = i === catchIdx && t >= 14 && t < 18; // inverted flash cut into the catch
  const dark = i >= catchIdx;
  // ---- end: circular mask closes onto the brand mark
  const endAt = total - 26; const close = clamp01((f - endAt) / 22);
  const bg = K.bg;
  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, right: 140, top: 168, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18}}>
        <div style={{width: 66, height: 66, borderRadius: 18, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44}}>S</div>
        <div style={{fontWeight: 800, fontSize: 46, color: K.ui, letterSpacing: -1}}>@subcreatorpaid</div>
      </div>
      <div style={{position: 'absolute', left: 92, top: 262, width: 1080, height: 1920, transform: 'scale(0.7)', transformOrigin: '0 0', overflow: 'hidden', borderRadius: 60, background: K.bg, boxShadow: shadow}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', filter: flash ? 'invert(1)' : 'none',
          transform: `translate(540px, 960px) scale(${zoom}) translate(-540px, ${-camY + sway}px)`}}>
          {/* light backdrop with a faint grid, dark panel behind the last two scenes */}
          <div style={{position: 'absolute', left: -400, top: -900, width: 1880, height: N * GAP + 1800, backgroundImage: 'linear-gradient(#E9E9E3 2px, transparent 2px), linear-gradient(90deg, #E9E9E3 2px, transparent 2px)', backgroundSize: '90px 90px'}} />
          <div style={{position: 'absolute', left: -400, top: catchIdx * GAP - 120, width: 1880, height: (N - catchIdx) * GAP + 1600, background: K.ui}} />
          {Array.from({length: 22}, (_, d) => <div key={d} style={{position: 'absolute', left: hash(d) * 1080, top: hash(d + 7) * N * GAP - 200 + Math.sin(f / 30 + d) * 20, width: 10 + hash(d + 2) * 10, height: 10 + hash(d + 2) * 10, borderRadius: 20, background: K.lime, opacity: 0.7}} />)}
          {SCENES.map((S, k) => (Math.abs(k - i) <= 1 ? <div key={k} style={{position: 'absolute', left: 0, top: k * GAP, width: 1080, height: 1920}}><S f={f} B={B} W={W} /></div> : null))}
        </div>
        {close > 0 && <div style={{position: 'absolute', inset: 0, background: K.lime, clipPath: `circle(${mix(0, 1700, expo(f - endAt, 22))}px at 540px 960px)`, opacity: 1}} />}
        {close > 0 && <div style={{position: 'absolute', left: 540 - 130, top: 960 - 130, width: 260, height: 260, borderRadius: 70, background: K.ui, color: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 190, transform: `scale(${spring(f - endAt - 6, {w: 0.34, z: 0.55})})`}}>S</div>}
      </div>
    </AbsoluteFill>
  );
};
