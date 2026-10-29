// Film 3, "Showreel" (from the owner's motion-design showreel prompt, 29 Oct 2026), topic: Amazon Associates.
// Concept, named before building: "a link becomes a percent becomes money". Every shot is made out of the previous one:
// kinetic type -> the word "link" morphs into a link shape -> the shape closes into a 0 -> the 0 splits into a % ->
// the % pours into two bars that turn 3D (3% and 4.5%) -> the tall bar folds flat into a receipt (data/UI moment:
// $40 x 4.5% = $1.80) -> the receipt's rule bends into the 180-day ring with 3 sale dots (the catch) -> the ring
// becomes the O of the end title. One typeface (Inter), cream + green + red plus black and white, one camera language
// (a constant slow push, with a quick settle on each transform). No glows, no bounce.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {expo, expoIn, inOut, kf, mix, clamp01, useTimes, Rise} from './kit';
import {StreamArt, Icon} from './art';

const K = {cream: '#F1EADB', green: '#1F8A4C', red: '#E5484D', ink: '#111111', white: '#FFFFFF'};

export const Reel = ({beats = [], total = 600}) => {
  const f = useCurrentFrame();
  const {B, W} = useTimes(beats);
  const s1 = B(1), s2 = B(2), s3 = B(3), s4 = B(4);
  const push = 1 + (f / Math.max(1, total)) * 0.08; // one camera language: a slow constant push
  const bg = f >= s3 && f < s4 ? K.ink : K.cream;
  const inkOn = bg === K.ink ? K.cream : K.ink;
  let body = null;

  if (f < s1) {
    // kinetic type, then "link" morphs into a chain-link shape
    const words = [['Share', W(0, 'pays')], ['a', W(0, 'people')], ['link.', W(0, 'link')]];
    const morph = expo(f - W(0, 'link') - 6, 14);
    body = (<>
      <div style={{position: 'absolute', left: 80, top: 480}}>
        <Rise f={f} at={0} text="Amazon pays you" size={124} weight={900} font={FONT} color={K.ink} />
        <Rise f={f} at={W(0, 'buy') - 4} text="when people buy" size={124} weight={900} font={FONT} color={K.ink} />
        <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 10}}>
          <Rise f={f} at={W(0, 'your') - 4} text="from your" size={124} weight={900} font={FONT} color={K.ink} />
          <div style={{position: 'relative', width: 300, height: 140}}>
            <div style={{position: 'absolute', left: 0, top: 0, fontFamily: FONT, fontWeight: 900, fontSize: 124, color: K.green, letterSpacing: -3, opacity: 1 - morph,
              transform: `scaleX(${1 - morph * 0.4})`, transformOrigin: 'left center', clipPath: `inset(0 0 ${(1 - expo(f - W(0, 'link') + 4, 8)) * 100}% 0)`}}>link</div>
            <div style={{position: 'absolute', left: -10, top: -40, opacity: morph, transform: `rotate(${(1 - morph) * -45}deg) scale(${mix(0.5, 1, morph)})`}}><Icon name="link" size={220} color={K.green} /></div>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1080, display: 'flex', gap: 24, opacity: expo(f - W(0, 'buy'), 10)}}>
        <div style={{background: K.white, borderRadius: 28, padding: 18}}><StreamArt kind="amazon" size={230} p={{ink: K.ink, a: K.green}} /></div>
        <div style={{alignSelf: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 56, color: '#6B6457', lineHeight: 1.25}}>Someone buys.<br />You earn a cut.</div>
      </div>
    </>);
  } else if (f < s2) {
    // link -> 0 -> % -> two bars that turn 3D
    const t = f - s1;
    const toZero = expo(t, 12); const toPct = expo(f - W(1, '3%') + 10, 12);
    const bars = expo(f - W(1, '3%') + 2, 16); const third = expo(f - W(1, '4.5%') + 2, 16); const tilt = inOut(f - W(1, '4.5%') - 6, 22);
    const h1 = 3 / 4.5 * 620 * bars, h2 = 620 * third;
    body = (<>
      <div style={{position: 'absolute', left: 0, right: 0, top: 180, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 84, color: K.ink, opacity: expo(t - 4, 10)}}>Most categories pay</div>
      {toPct < 1 && <div style={{position: 'absolute', left: 540 - 160, top: 560, width: 320, height: 420, borderRadius: mix(60, 160, toZero), border: `${mix(28, 46, toZero)}px solid ${K.green}`,
        transform: `rotate(${(1 - toZero) * 40}deg) scale(${1 - toPct * 0.6})`, opacity: 1 - toPct}} />}
      {toPct > 0 && bars < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 520, color: K.green, lineHeight: 1,
        opacity: toPct * (1 - bars), transform: `scale(${mix(0.6, 1, toPct)})`}}>%</div>}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, perspective: 1800}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformStyle: 'preserve-3d', transform: `rotateX(${tilt * 28}deg) rotateY(${tilt * -24}deg)`, transformOrigin: '540px 1300px'}}>
          <div style={{position: 'absolute', left: 140, top: 1320, width: 800, height: 6, background: K.ink}} />
          {[[230, h1, '3%', bars], [600, h2, '4.5%', third]].map(([x, h, lab, p], i) => (
            <div key={i}>
              <Bar3D x={x} w={250} h={h} d={tilt * 120} color={K.green} />
              <div style={{position: 'absolute', left: x, width: 250, top: 1320 - h - 140, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 100, color: K.ink, opacity: p}}>{lab}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 44, color: '#6B6457', opacity: third}}>commission on what they buy</div>
    </>);
  } else if (f < s3) {
    // the tall bar folds flat into a receipt: $40 x 4.5% = $1.80
    const t = f - s2;
    const fold = expo(t, 16);
    const r1 = expo(f - W(2, '$40') + 4, 10), r2 = expo(f - W(2, '4.5%') + 4, 10), r3 = expo(f - W(2, '$1.80') + 4, 12);
    body = (<>
      <div style={{position: 'absolute', left: mix(600, 140, fold), top: mix(700, 420, fold), width: mix(250, 800, fold), height: mix(620, 1000, fold), background: mix(0, 1, fold) > 0.5 ? K.white : K.green,
        borderRadius: mix(0, 36, fold), overflow: 'hidden'}}>
        {fold > 0.5 && <div style={{padding: '56px 60px', fontFamily: FONT, opacity: clamp01((fold - 0.5) * 2)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}><Icon name="cart" size={56} color={K.ink} /><div style={{fontWeight: 800, fontSize: 40, color: K.ink}}>Order from your link</div></div>
          <div style={{height: 4, background: K.ink, margin: '36px 0'}} />
          <Row label="Item price" val="$40.00" p={r1} />
          <Row label="Commission" val="× 4.5%" p={r2} />
          <div style={{height: 4, background: K.ink, margin: '30px 0', transform: `scaleX(${r3})`, transformOrigin: 'left'}} />
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: r3}}>
            <div style={{fontWeight: 800, fontSize: 52, color: K.ink}}>You earn</div>
            <div style={{fontWeight: 900, fontSize: 150, color: K.green, letterSpacing: -5}}>${(1.8 * r3).toFixed(2)}</div>
          </div>
          <div style={{marginTop: 30, fontWeight: 600, fontSize: 30, color: '#8A8476', opacity: r3}}>Example. Rates differ by category.</div>
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 20, opacity: r1}}><StreamArt kind="amazon" size={260} p={{ink: K.ink, a: K.green}} /></div>
        </div>}
      </div>
    </>);
  } else if (f < s4) {
    // the receipt rule bends into the 180-day ring with 3 sale dots
    const t = f - s3;
    const bend = expo(t, 18);
    const sales = [W(3, 'three'), W(3, 'sales'), W(3, 'first')];
    const prog = clamp01((f - W(3, 'first')) / 40) * 0.7;
    const closes = expo(f - W(3, 'closes') + 4, 10);
    const C = 2 * Math.PI * 300;
    body = (<>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 92, color: K.red, opacity: expo(t - 2, 10)}}>The catch</div>
      {bend < 1 && <div style={{position: 'absolute', left: 140, top: 940, width: 800, height: 8, background: K.cream, transform: `scaleX(${1 - bend})`}} />}
      <svg width="1080" height="1080" style={{position: 'absolute', left: 0, top: 420}}>
        <circle cx="540" cy="540" r="300" stroke="#333" strokeWidth="40" fill="none" strokeDasharray={C} strokeDashoffset={C * (1 - bend)} transform="rotate(-90 540 540)" />
        <circle cx="540" cy="540" r="300" stroke={K.red} strokeWidth="40" fill="none" strokeDasharray={C} strokeDashoffset={C * (1 - prog)} transform="rotate(-90 540 540)" strokeLinecap="round" />
        {sales.map((at, i) => { const p = expo(f - at + 4, 8); const a = (-90 + i * 40 + 20) * Math.PI / 180;
          return <circle key={i} cx={540 + Math.cos(a) * 300} cy={540 + Math.sin(a) * 300} r={34 * p} fill={K.green} stroke={K.ink} strokeWidth="6" />; })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150, color: K.cream, letterSpacing: -5, opacity: bend}}>180</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 48, color: '#BDB6A6', opacity: bend}}>days</div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1440, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 58, color: K.cream, lineHeight: 1.2}}>
        <span style={{opacity: expo(f - W(3, 'three') + 4, 10)}}>3 sales in your first 180 days</span><br />
        <span style={{color: K.red, opacity: closes}}>or the account closes.</span>
      </div>
    </>);
  } else {
    // ring -> the O of the end title; last frame echoes the first (cream, ink type, green accent)
    const t = f - s4;
    const shrink = expoIn(t, 10); const title = expo(t - 6, 14);
    body = (<>
      {t < 14 && <div style={{position: 'absolute', left: 540 - mix(320, 60, shrink), top: 960 - mix(320, 60, shrink), width: mix(640, 120, shrink), height: mix(640, 120, shrink), borderRadius: '50%', border: `${mix(40, 22, shrink)}px solid ${K.green}`, opacity: 1 - clamp01((t - 10) / 4)}} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 96, color: K.ink, opacity: title}}>Comment</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 810, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 170, color: K.ink, letterSpacing: -6, clipPath: `inset(0 ${(1 - title) * 50}% 0 ${(1 - title) * 50}%)`}}>
        AMAZ<span style={{color: K.green}}>O</span>N
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1040, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 46, color: '#6B6457', opacity: expo(f - W(4, 'guide') + 4, 10)}}>for the free guide</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1170, textAlign: 'center', opacity: expo(f - W(4, 'follow') + 4, 10)}}>
        <span style={{background: K.ink, color: K.cream, borderRadius: 50, padding: '20px 44px', fontFamily: FONT, fontWeight: 800, fontSize: 44}}>Follow for more</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 32, color: '#8A8476', opacity: expo(f - W(4, 'follow'), 10)}}>subcreatorpaid.com · Affiliate links in bio</div>
    </>);
  }

  return (
    <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${push})`, transformOrigin: '540px 960px'}}>{body}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1720, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: inkOn, opacity: 0.45}}>@subcreatorpaid</div>
    </AbsoluteFill>
  );
};

const Row = ({label, val, p}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontSize: 56, marginBottom: 22, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
    <div style={{fontWeight: 600, color: '#6B6457'}}>{label}</div><div style={{fontWeight: 900, color: K.ink}}>{val}</div>
  </div>
);
// A bar that gains depth: front face + top + side drawn as skewed planes (2D-to-3D moment).
const Bar3D = ({x, w, h, d, color}) => (
  <>
    <div style={{position: 'absolute', left: x, top: 1320 - h, width: w, height: h, background: color}} />
    <div style={{position: 'absolute', left: x, top: 1320 - h - d * 0.5, width: w, height: d * 0.5, background: '#3FAE6C', transform: `skewX(${-45}deg)`, transformOrigin: 'bottom left'}} />
    <div style={{position: 'absolute', left: x + w, top: 1320 - h, width: d * 0.5, height: h, background: '#145E33', transform: `skewY(${-45}deg)`, transformOrigin: 'top left'}} />
  </>
);
