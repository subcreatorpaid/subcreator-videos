// Film 2, "Keynote" (from the owner's Apple-keynote product-sting prompt, 29 Oct 2026), topic: UGC for beginners.
// Soft white, bright blue, glassy. Every shot enters already moving (exponential ease-out) and blur follows speed.
// Shots: header lockup rises out of blue haze in an app window, cursor clicks the disc -> hard cut to the app icon with
// four squares orbiting into a cross -> Mac menu bar, frosted prompt box types the question -> whip-tilt to the answer
// page with one key phrase in black -> a card rises (the catch) -> three stacked cards with frosted glass titles ->
// logo disc hold -> black end card with the glowing wordmark. No purple, magenta or orange. Green only for money, red for the catch.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {expo, expoIn, kf, mix, clamp01, typedCount, Cursor, useTimes} from './kit';
import {StreamArt, Icon, Avatar} from './art';

const K = {page: '#FDFDFB', haze: '#B7CFEB', ice: '#E6F0FA', deep: '#294376', sky: '#769CC2', navy: '#1E2F52', blue: '#2F6BFF', cyan: '#3CC8F0', mint: '#4ED6A0',
  ink: '#111214', grey: '#BCBCBA', money: '#1F8A4C', red: '#E5484D'};
const PROMPT = 'What does UGC pay a beginner?';

const Mark = ({size = 80, color = K.ink}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M14 30 V14 H30 M70 14 H86 V30 M86 70 V86 H70 M30 86 H14 V70" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
    <text x="50" y="66" textAnchor="middle" fontFamily="InterX" fontWeight="900" fontSize="46" fill={color}>$</text>
  </svg>
);
const Disc = ({d = 160, mark = K.ink}) => (
  <div style={{width: d, height: d, borderRadius: '50%', background: '#FBFCFE', border: '2px solid #E8E8EA', boxShadow: '0 10px 30px rgba(41,67,118,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Mark size={d * 0.62} color={mark} />
  </div>
);
// motion blur from speed: px moved this frame -> blur px
const sm = (fn, f, k = 0.18, max = 22) => Math.min(max, Math.abs(fn(f) - fn(f - 1)) * k);

export const Keynote = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W, E} = useTimes(beats);
  const cut1 = W(0, 'zero') - 2, cut2 = B(1), cut3 = B(2), cut4 = B(3), cut5 = B(4), cut6 = B(5), cut7 = B(5) + 46;
  const shot = f < cut1 ? 1 : f < cut2 ? 2 : f < cut3 ? 3 : f < cut4 ? 4 : f < cut5 ? 5 : f < cut6 ? 6 : f < cut7 ? 7 : 8;
  let body = null;

  if (shot === 1) {
    const rise = (x) => kf(x, [[0, 1400], [2, 1120], [5, 900], [10, 760], [24, 640], [40, 620]], 'lin');
    const y = rise(f); const bl = sm(rise, f, 0.12);
    const haze = clamp01(f / 28);
    const cx = kf(f, [[8, 1180], [cut1 - 14, 270]], (t, d) => expo(t, d)); const cy = kf(f, [[8, 1500], [cut1 - 14, y + 70]], (t, d) => expo(t, d));
    const hover = expo(f - cut1 + 16, 6); const press = f >= cut1 - 8 && f < cut1 - 3;
    body = (<>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${mixC(K.haze, K.page, haze)} 0%, ${K.page} 70%, #DBEEFD 100%)`}} />
      <div style={{position: 'absolute', left: 60, top: 300, width: 960, height: 1300, borderRadius: 44, background: 'rgba(255,255,255,0.75)', border: '2px solid #E8EDF4', boxShadow: '0 40px 100px rgba(41,67,118,0.12)'}}>
        <div style={{position: 'absolute', left: 36, top: 30, display: 'flex', gap: 16}}>{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 24, height: 24, borderRadius: 12, background: c}} />)}</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#9AA3B2'}}>subcreatorpaid.com</div>
      </div>
      <div style={{position: 'absolute', left: 100, top: y, display: 'flex', alignItems: 'center', gap: 28, filter: `blur(${bl}px)`}}>
        <div style={{transform: `scale(${1 + hover * 0.06 - (press ? 0.08 : 0)})`}}><Disc d={180} /></div>
        <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 84, color: K.ink, letterSpacing: -2}}>Sub-Creator</div>
        <div style={{background: '#2F2E2F', color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: 40, borderRadius: 40, padding: '14px 30px'}}>UGC</div>
      </div>
      <div style={{position: 'absolute', left: 100, right: 100, top: y + 230, fontFamily: FONT, fontWeight: 700, fontSize: 82, lineHeight: 1.12, color: K.ink, opacity: expo(f - W(0, 'pay') + 4, 12),
        transform: `translateY(${(1 - expo(f - W(0, 'pay') + 4, 12)) * 40}px)`}}>
        Brands pay for videos.<br /><span style={{color: K.blue}}>Even at 0 followers.</span>
      </div>
      <div style={{position: 'absolute', left: 100, right: 100, top: y + 520, display: 'flex', justifyContent: 'space-between'}}>
        {[0, 1, 2].map((i) => { const p = expo(f - W(0, 'videos') + 2 - i * 4, 12);
          return <div key={i} style={{width: 260, height: 340, borderRadius: 34, background: [K.ice, '#E3F4EC', '#E7EEFB'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 80}px)`}}>
            <StreamArt kind="ugc" size={240} p={{ink: K.navy, a: [K.mint, K.cyan, '#fff'][i], c: [K.blue, K.deep, K.cyan][i]}} /></div>; })}
      </div>
      <Cursor x={cx} y={cy} s={1 + hover * 0.25 - (press ? 0.15 : 0)} rot={kf(f, [[8, -30], [cut1 - 14, 0]])} />
    </>);
  }

  if (shot === 2) {
    const t = f - cut1;
    const size = mix(420, 270, expo(t, 14)); const halo = mix(360, 500, expo(t - 3, 12));
    const items = [['play', '#FFFFFF', K.ink], ['box', K.blue, '#fff'], ['star', K.cyan, '#fff'], ['search', K.mint, '#fff']];
    const lock = expo(t, 16);
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <div style={{position: 'absolute', left: 540 - halo / 2, top: 900 - halo / 2, width: halo, height: halo, borderRadius: '50%', background: '#E9E9E7'}} />
      {items.map(([ic, bg, fg], i) => {
        const ang = (-90 * i + 180) + (1 - lock) * 260; const R = mix(520, 330, lock);
        const x = 540 + Math.cos((ang * Math.PI) / 180) * R, y = 900 + Math.sin((ang * Math.PI) / 180) * R;
        return <div key={i} style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 40, background: bg, border: bg === '#FFFFFF' ? '2px solid #E3E8EF' : 'none',
          boxShadow: '0 10px 24px rgba(30,47,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${(1 - lock) * -90}deg)`}}><Icon name={ic} size={70} color={fg} /></div>;
      })}
      <div style={{position: 'absolute', left: 540 - size / 2, top: 900 - size / 2, width: size, height: size, borderRadius: size * 0.28, background: `linear-gradient(160deg, ${K.deep}, ${K.navy})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(30,47,82,0.3)'}}><Mark size={size * 0.62} color="#fff" /></div>
      {['Unboxing', 'Reviews', 'How-tos', 'Ads'].map((w, i) => (
        <div key={w} style={{position: 'absolute', left: 0, right: 0, top: 1360 + i * 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 64, color: K.navy,
          opacity: clamp01(1 - Math.abs(t - 6 - i * 9) / 6)}}>{w}</div>
      ))}
    </>);
  }

  if (shot === 3) {
    const t = f - cut2;
    const box = expo(t - 8, 14); const n = typedCount(f, cut2 + 14, PROMPT.length, 5, 1.6);
    const click = t >= 4 && t < 8;
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, height: 70, background: '#111', borderTop: '3px solid #686866'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 630, bottom: 0, background: `linear-gradient(180deg, ${K.deep} 0%, ${K.sky} 100%)`, overflow: 'hidden'}}>
        <svg width="1080" height="1300" style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}}>
          <circle cx="760" cy="640" r="420" stroke="#fff" strokeWidth="2" fill="none" /><path d="M0 420 H1080 M0 980 H1080 M340 0 V1300" stroke="#fff" strokeWidth="2" />
          <path d="M340 420 l10 -40 l10 40 l40 10 l-40 10 l-10 40 l-10 -40 l-40 -10 z" fill="#fff" />
        </svg>
        <div style={{position: 'absolute', right: -200, top: -200, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,214,160,0.45), transparent 70%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 74, background: K.navy, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 34, paddingRight: 40}}>
          <Icon name="search" size={36} color="#fff" /><div style={{width: 46, height: 22, border: '3px solid #fff', borderRadius: 6}} />
          <div style={{width: 50, height: 50, borderRadius: 12, background: click ? '#3A4E78' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Mark size={44} color="#fff" /></div>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#fff'}}>9:41</div>
        </div>
        <div style={{position: 'absolute', left: 70, right: 70, top: 150, height: 380, borderRadius: 44, background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(30px)', border: '2px solid rgba(255,255,255,0.6)',
          transform: `scale(${mix(0.2, 1, box)})`, transformOrigin: '90% 0%', opacity: clamp01(box * 3), boxShadow: '0 30px 80px rgba(14,26,52,0.35)'}}>
          <div style={{position: 'absolute', left: 50, top: 46, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: 'rgba(255,255,255,0.85)'}}><Icon name="spark" size={34} color="#fff" />Ask the Income Finder</div>
          <div style={{position: 'absolute', left: 50, right: 50, top: 120, fontFamily: FONT, fontWeight: 500, fontSize: 64, lineHeight: 1.2, color: '#fff'}}>{PROMPT.slice(0, n)}<span style={{opacity: f % 30 < 15 ? 1 : 0}}>|</span></div>
          <div style={{position: 'absolute', right: 40, bottom: 36, width: 84, height: 84, borderRadius: 42, background: n >= PROMPT.length ? '#fff' : 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 900, fontSize: 44, color: K.navy}}>↑</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 60, color: K.ink, opacity: expo(t, 10)}}>So what does it pay?</div>
      {t < 10 && <Cursor x={mix(700, 920, expo(t, 6))} y={mix(900, 655, expo(t, 6))} s={click ? 0.85 : 1} />}
    </>);
  }

  if (shot === 4) {
    const t = f - cut3;
    const off = (x) => kf(x - cut3, [[0, 620], [2, 460], [4, 310], [7, 200], [12, 30], [18, 0], [40, -14]], 'lin');
    const blur = kf(t, [[0, 26], [6, 1.5], [10, 0]], 'lin');
    const key = expo(f - W(2, '$50') + 6, 10);
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <AbsoluteFill style={{background: '#E2F4FE', opacity: clamp01(1 - t / 6)}} />
      <div style={{position: 'absolute', left: 110, right: 90, top: 420 + off(f), filter: `blur(${blur}px)`, fontFamily: FONT}}>
        <div style={{fontWeight: 500, fontSize: 32, color: '#9A9A98'}}>Income streams  ›  UGC</div>
        <div style={{fontWeight: 700, fontSize: 84, color: K.ink, marginTop: 24, letterSpacing: -2, lineHeight: 1.05}}>What UGC pays a beginner</div>
        <div style={{display: 'flex', gap: 16, alignItems: 'center', marginTop: 34}}><Avatar size={64} hat={false} bg="#DDE8F6" /><div style={{fontWeight: 600, fontSize: 30, color: '#8A8A88'}}>Checked Oct 2026 · Insense</div></div>
        <div style={{fontWeight: 400, fontSize: 58, lineHeight: 1.3, color: K.grey, marginTop: 50}}>
          Brands pay you to film videos they run as ads. Most beginners charge{' '}
          <span style={{color: mixC('#BCBCBA', K.money, key), fontWeight: 700, background: `rgba(31,138,76,${0.12 * key})`, borderRadius: 12, padding: '0 8px'}}>$50–$400 per video</span>.
          {' '}You need <span style={{color: mixC('#BCBCBA', K.ink, expo(f - W(2, 'followers') + 6, 10)), fontWeight: 600}}>no followers</span> to start.
        </div>
      </div>
      <div style={{position: 'absolute', left: 110, right: 90, top: 1250 + off(f), filter: `blur(${blur}px)`, borderRadius: 40, background: '#F2F8F4', border: '2px solid #DCEFE3', padding: '40px 50px', opacity: key}}>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#5C7A68'}}>Beginner rate, per video</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 150, color: K.money, letterSpacing: -5, lineHeight: 1.1}}>$50–$400</div>
      </div>
    </>);
  }

  if (shot === 5) {
    const t = f - cut4;
    const top = kf(t, [[0, 1500], [4, 1000], [9, 860], [13, 800], [18, 760]], 'lin') - Math.max(0, t - 18) * 2.2;
    const bl = kf(t, [[0, 0], [2, 6], [14, 0]], 'lin');
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <div style={{position: 'absolute', left: 110, right: 90, top: 420, fontFamily: FONT, filter: `blur(${clamp01(t / 10) * 10}px)`, opacity: 0.6}}>
        <div style={{fontWeight: 700, fontSize: 84, color: K.ink, letterSpacing: -2, lineHeight: 1.05}}>What UGC pays a beginner</div>
      </div>
      <div style={{position: 'absolute', left: 90, width: 900, top, height: 1500, borderRadius: 64, background: '#fff', boxShadow: '0 -20px 80px rgba(30,47,82,0.18)', filter: `blur(${bl}px)`}}>
        <div style={{position: 'absolute', left: 390, top: 18, width: 120, height: 10, borderRadius: 5, background: '#E3E3E3'}} />
        <div style={{position: 'absolute', left: 36, right: 36, top: 44, height: 640, borderRadius: 48, background: `linear-gradient(160deg, ${K.ice}, ${K.haze})`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
            {[0, 1, 2].map((i) => <div key={i} style={{width: 190, height: 300, borderRadius: 26, border: '5px dashed rgba(30,47,82,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT, fontWeight: 800, fontSize: 40, color: 'rgba(30,47,82,0.5)', opacity: expo(t - 6 - i * 4, 8)}}>?</div>)}
          </div>
          <div style={{position: 'absolute', right: 40, top: 40}}><StreamArt kind="ugc" size={200} p={{ink: K.navy, a: K.mint, c: K.blue}} /></div>
        </div>
        <div style={{position: 'absolute', left: 60, top: 730, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: K.red}}>The catch</div>
        <div style={{position: 'absolute', left: 60, right: 60, top: 820, fontFamily: FONT, fontWeight: 500, fontSize: 44, lineHeight: 1.3, color: '#6B6B69'}}>
          Brands want to see samples first. Rates vary by niche and usage rights.
        </div>
      </div>
    </>);
  }

  if (shot === 6) {
    const t = f - cut5;
    const cards = [['Unboxing', 'box', W(4, 'unboxing')], ['Review', 'star', W(4, 'review')], ['How-to', 'play', W(4, 'how-to')]];
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 64, color: K.ink, opacity: expo(t, 10)}}>Film 3 samples</div>
      {cards.map(([title, ic, at], i) => {
        const p = expo(f - at + 8, 14); const y = 330 + i * 470 + (1 - p) * 700;
        const grads = [[K.blue, K.cyan], [K.navy, K.sky], [K.mint, '#2BA77A']][i];
        return (
          <div key={title} style={{position: 'absolute', left: 150, top: y, width: 780, height: 430, borderRadius: 64, overflow: 'hidden', background: `linear-gradient(150deg, ${grads[0]}, ${grads[1]})`,
            boxShadow: '0 30px 60px rgba(30,47,82,0.18)', filter: `blur(${(1 - p) * 8}px)`}}>
            <div style={{position: 'absolute', right: 70, top: 60, opacity: 0.9}}><Icon name={ic} size={190} color="rgba(255,255,255,0.9)" /></div>
            <div style={{position: 'absolute', left: 34, top: 30, background: 'rgba(255,255,255,0.3)', border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 30, padding: '10px 24px', fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#fff'}}>Sample {i + 1}</div>
            <div style={{position: 'absolute', left: 40, bottom: 24, fontFamily: FONT, fontWeight: 800, fontSize: 132, letterSpacing: -5, color: 'rgba(255,255,255,0.72)', textShadow: '0 1px 0 rgba(255,255,255,0.6)'}}>{title}</div>
          </div>
        );
      })}
    </>);
  }

  if (shot === 7) {
    const t = f - cut6;
    const top = kf(t, [[0, 1300], [5, 940], [10, 860], [24, 830]], 'lin');
    const d = t < 34 ? 220 : mix(220, 150, expoIn(t - 34, 12));
    body = (<>
      <AbsoluteFill style={{background: K.page}} />
      <div style={{position: 'absolute', left: 540 - d / 2, top: top - d / 2 + (220 - d) / 2, filter: `blur(${t < 3 ? 10 : 0}px)`}}><Disc d={d} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 60, color: K.ink, opacity: expo(t - 4, 10)}}>Comment <span style={{color: K.blue}}>UGC</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 40, color: '#8A8A88', opacity: expo(t - 8, 10)}}>for the free guide</div>
    </>);
  }

  if (shot === 8) {
    const t = f - cut7;
    const w = kf(t, [[0, 2.6], [1, 2.1], [2, 1.75], [3, 1.65], [8, 1.16], [10, 1.07], [19, 0.89], [41, 0.82], [60, 0.78]], 'lin');
    body = (<>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, #272729 0%, #020204 70%)'}} />
      {t < 6 && Array.from({length: 12}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 120, color: '#F3F3F5', opacity: 0.08 * (1 - t / 6),
          transform: `scale(${w * (1 + i * 0.06)})`}}>subcreatorpaid</div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 120, color: '#F3F3F5', transform: `scale(${w})`,
        textShadow: '0 0 12px rgba(255,255,255,0.35), 0 0 60px rgba(150,190,255,0.25)', letterSpacing: -3}}>subcreatorpaid</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1020, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 44, color: '#9A9AA0', opacity: expo(t - 10, 12)}}>Comment UGC · Follow for more</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1110, textAlign: 'center', opacity: expo(t - 16, 12)}}>
        <span style={{background: '#1E1E21', color: '#CFCFCA', borderRadius: 40, padding: '14px 28px', fontFamily: FONT, fontWeight: 600, fontSize: 30}}>Free AI Income Finder · subcreatorpaid.com</span>
      </div>
    </>);
  }

  return (
    <AbsoluteFill style={{background: K.page, overflow: 'hidden'}}>
      {body}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1700, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 30, color: shot === 8 || shot === 3 ? '#fff' : K.ink, opacity: 0.45}}>@subcreatorpaid</div>
    </AbsoluteFill>
  );
};

// hex colour mix
function mixC(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * clamp01(t))).join(',')})`;
}
