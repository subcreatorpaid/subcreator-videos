// Film 1, "Launch" (from the owner's product-launch-film prompt, 29 Oct 2026), topic: the free AI Income Finder.
// One continuous take, no fades or cuts: the composer is typed into, the send button ripples lime and the message becomes
// a bubble, the button grows into the finder ring that tosses stream tiles, a lime flood bursts into result cards that
// land on the best match, the flood contracts back into the chat, the black button expands into the page, and a route
// ends on a pin that becomes the brand mark. Warm white #F5F5F2, black UI #0E0E10, lime #CDF24F. One palette all the way through (owner, 29 Oct 2026: "keep the colour consistent"): white, black, lime; red only on "The catch".
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {Logo} from '../graphics';
import {expo, expoIn, inOut, spring, kf, mix, clamp01, camera, Rise, typedCount, Cursor, useTimes, hash} from './kit';
import {StreamArt, Avatar, Icon, Check, BrandLogo} from './art';

const K = {bg: '#F5F5F2', ui: '#0E0E10', lime: '#CDF24F', mut: '#8B8B86', red: '#E5484D', card: '#1C1C1F'};
const ART = {ink: '#0E0E10', a: '#CDF24F', b: '#FFFFFF', c: '#2E2E33', box: '#FFFFFF', rec: '#CDF24F', recInk: '#0E0E10'};
const LINES = ['I film cozy cooking,', '600 followers.', 'What can pay me?'];
const CARDS = [
  {name: 'Etsy templates', line: 'Sell a digital file again and again', pay: 'about $8.60 of a $10 sale', kind: 'etsy', logos: ['etsy']},
  {name: 'Amazon Associates', line: 'Earn a cut when someone buys', pay: '3%–4.5% on most categories', kind: 'amazon', logos: ['amazon']},
  {name: 'Fiverr gigs', line: 'Sell a small service', pay: 'Fiverr keeps 20%', kind: 'fiverr', logos: ['fiverr']},
  {name: 'UGC videos', line: 'Brands pay for videos they run as ads', pay: '$50–$400 a video', kind: 'ugc', best: true, logos: ['billo', 'joinbrands']},
  {name: 'ElevenLabs voices', line: 'Earn when paying users pick your voice', pay: 'Paid through Stripe', kind: 'voice', logos: ['elevenlabs']},
];

// Owner, 29 Oct 2026 09:22: "more animations, a little bit fast". Extra layers below: drifting lime dust, punch zooms on key
// words, live counters, orbiting tiles with a spinner, card tilt + shine, pulse rings, lime bursts, flying sample phones.
const Burst = ({f, at, x, y, n = 14, r = 260, color = '#CDF24F', size = 18}) => {
  const t = f - at; if (t < 0 || t > 26) return null; const p = expo(t, 18);
  return <>{Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2 + i; const d = r * p * (0.6 + hash(i + at) * 0.6);
    return <div key={i} style={{position: 'absolute', left: x + Math.cos(a) * d - size / 2, top: y + Math.sin(a) * d - size / 2, width: size, height: size, borderRadius: i % 3 ? size / 2 : 4,
      background: i % 4 === 0 ? '#0E0E10' : color, opacity: 1 - clamp01((t - 12) / 14), transform: `rotate(${t * 12 + i * 30}deg) scale(${1 - p * 0.4})`}} />; })}</>;
};
const Pulse = ({f, x, y, d, color = '#CDF24F', every = 24, from = 0}) => (
  <>{[0, 1].map((k) => { const t = ((f - from + k * every / 2) % every) / every; if (f < from) return null;
    return <div key={k} style={{position: 'absolute', left: x - (d / 2) * (1 + t * 0.7), top: y - (d / 2) * (1 + t * 0.7), width: d * (1 + t * 0.7), height: d * (1 + t * 0.7), borderRadius: '50%', border: `6px solid ${color}`, opacity: (1 - t) * 0.8}} />; })}</>
);
const Dust = ({f, dark}) => (
  <>{Array.from({length: 18}, (_, i) => { const x = (hash(i) * 1080 + f * (0.6 + hash(i + 5))) % 1120 - 20, y = (hash(i + 9) * 1920 - f * (1.2 + hash(i + 3) * 1.6) + 4000) % 1960 - 20;
    const s = 6 + hash(i + 2) * 12; return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s / 2, background: '#CDF24F', opacity: dark ? 0.5 : 0.7 * (0.4 + 0.6 * Math.abs(Math.sin(f / 20 + i)))}} />; })}</>
);

const Iridescent = ({f, w, h, r}) => (
  <div style={{position: 'absolute', left: -40, top: -40, width: w + 80, height: h + 80, borderRadius: r + 40, filter: 'blur(34px)', opacity: 0.85, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 1600, height: 1600, marginLeft: -800, marginTop: -800, transform: `rotate(${f * 3}deg)`,
      background: 'conic-gradient(from 0deg, #CDF24F, rgba(205,242,79,0.15), #CDF24F, rgba(205,242,79,0.15), #CDF24F)'}} />
  </div>
);

export const Launch = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W} = useTimes(beats);
  const send = B(1), drop = B(2) + 2, chat = B(3), page = B(4), outro = B(5);
  // ---- camera (world space; the composer sits at 540, 960)
  const cam = camera(f, [
    [0, 1.0, 540, 960], [send - 2, 1.1, 540, 960], [send + 22, 1.0, 540, 960], [drop, 1.0, 540, 960], [drop + 30, 1.04, 540, 940],
    [chat, 1.04, 540, 940], [chat + 24, 1.0, 540, 960], [page, 1.0, 540, 960],
  ], (t, d) => (t <= 0 ? 0 : 1 - Math.pow(1 - inOut(t, d), 1)));
  const punch = [W(0, '600'), W(1, '16'), W(2, 'best'), W(3, '$50'), W(4, 'three')].reduce((a, w) => a + 0.035 * Math.max(0, 1 - Math.abs(f - w - 2) / 7), 0);
  cam.z *= 1 + punch; cam.x += Math.sin(f / 37) * 6; cam.y += Math.cos(f / 43) * 8;
  cam.css = `translate(540px, 960px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`;
  const toScreen = (x, y) => [540 + (x - cam.x) * cam.z, 960 + (y - cam.y) * cam.z];

  // ---- composer -> bubble
  const sent = expo(f - send, 10);
  const press = f >= send - 3 && f < send + 4 ? 0.86 : 1;
  const typed = (() => { let left = typedCount(f, B(0) + 4, LINES.join('').length, 3, 2.1); return LINES.map((l) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return s; }); })();
  const comp = {x: mix(90, 250, sent), y: mix(770, 300, sent), w: mix(900, 740, sent), h: mix(380, 220, sent)};
  const ripple = expo(f - send, 12); // lime ripple from the send button
  // ---- think: the send button grows into the finder ring and tosses stream tiles
  const think = expo(f - send - 5, 12);
  const ring = {x: mix(910, 540, think), y: mix(1070, 1060, think), d: mix(96, 300, think)};
  const tossAt = [W(1, 'checks'), W(1, '16'), W(1, 'verified'), W(1, 'streams')];
  const TILES = ['instagram', 'tiktok', 'youtube', 'spotify', 'etsy', 'amazon', 'fiverr', 'elevenlabs', 'kit', 'patreon', 'substack', 'gumroad', 'twitch', 'beehiiv', 'billo', 'kofi'];
  // ---- drop: lime flood fills the frame, cards burst, strip lands on the best match
  const flood = expoIn(f - drop + 8, 8) * (1 - expo(f - chat, 10));
  const burst = spring(f - drop, {w: 0.4, z: 0.7});
  const strip = kf(f, [[drop + 6, 0], [W(2, 'fit') + 2, 3]], inOut);
  const lift = expo(f - W(2, 'best') + 4, 8);
  const toChat = expo(f - chat, 11);
  // ---- page: the black button expands into the page
  const click = page + 5; const spin = f >= click && f < click + 8; const done = f >= click + 8;
  const grow = expo(f - click - 10, 12);

  const world = (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: cam.css}}>
      {/* phone around the scene, revealed by the pull-back */}
      <div style={{position: 'absolute', left: 50, top: 70, width: 980, height: 1780, borderRadius: 120, border: '22px solid #0E0E10', opacity: clamp01((sent - 0.2) * 2), boxShadow: '0 60px 120px rgba(0,0,0,0.18)'}}>
        <div style={{position: 'absolute', left: 70, top: 34, fontFamily: FONT, fontWeight: 700, fontSize: 40, color: K.ui}}>9:41</div>
        <div style={{position: 'absolute', left: 400, top: 22, width: 160, height: 50, borderRadius: 25, background: K.ui}} />
      </div>
      {/* finder header + creator avatar */}
      <div style={{position: 'absolute', left: 90, top: mix(600, 170, sent), display: 'flex', alignItems: 'center', gap: 20, opacity: expo(f - 4, 12)}}>
        <div style={{width: 84, height: 84, borderRadius: 26, background: K.ui, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="spark" size={48} color={K.lime} /></div>
        <div><div style={{fontWeight: 800, fontSize: 44, color: K.ui}}>AI Income Finder</div><div style={{fontWeight: 600, fontSize: 30, color: K.mut}}>Free · 16 verified streams</div></div>
      </div>
      {sent > 0.3 && <div style={{position: 'absolute', left: 120, top: 320 + (f >= W(3, '$50') && f < W(3, '$50') + 20 ? -Math.abs(Math.sin((f - W(3, '$50')) / 3)) * 30 : Math.sin(f / 11) * 5), opacity: expo(f - send - 6, 10)}}><Avatar size={110} /></div>}
      {/* composer / bubble */}
      <div style={{position: 'absolute', left: comp.x, top: comp.y, width: comp.w, height: comp.h, transform: `scale(${mix(0.55, 1, spring(f, {w: 0.45, z: 0.7}))}) rotate(${(1 - spring(f, {w: 0.45, z: 0.7})) * -8}deg)`}}>
        {sent < 0.6 && <div style={{opacity: 1 - sent * 1.6}}><Iridescent f={f} w={comp.w} h={comp.h} r={48} /></div>}
        <div style={{position: 'absolute', inset: 0, borderRadius: mix(48, 56, sent), background: sent > 0.5 ? K.lime : '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.10)'}} />
        <div style={{position: 'absolute', left: mix(54, 44, sent), top: mix(50, 34, sent), fontFamily: FONT, fontWeight: 600, fontSize: mix(54, 44, sent), lineHeight: 1.3, color: K.ui}}>
          {typed.map((l, i) => <div key={i} style={{height: mix(70, 57, sent)}}>{l}{sent === 0 && i === typed.findIndex((x, j) => x.length < LINES[j].length) ? <span style={{color: K.ui}}>|</span> : null}</div>)}
        </div>
        {sent < 0.3 && <div style={{position: 'absolute', right: 34, bottom: 34, width: 96, height: 96, borderRadius: 48, background: K.ui, transform: `scale(${press})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontSize: 54, fontWeight: 900, fontFamily: FONT}}>↑</div>}
      </div>
      {/* live chips under the composer: niche, follower counter across platforms, the question; they fly into the bubble on send */}
      {sent < 1 && [[W(0, 'cooking'), 110, 1230, -6, 'pan'], [W(0, '600'), 520, 1260, 5, 'count'], [W(0, 'pay'), 300, 1460, -3, 'q']].map(([at, x, y, r, k], i) => {
        const p = spring(f - at + 3, {w: 0.5, z: 0.6}); if (p <= 0) return null; const fly = expoIn(f - send + 2, 8);
        const n = Math.round(600 * expo(f - at + 3, 16));
        return (
          <div key={k} style={{position: 'absolute', left: mix(x, 500, fly), top: mix(y + Math.sin(f / 9 + i) * 8, 500, fly), transform: `scale(${p * (1 - fly * 0.8)}) rotate(${r + Math.sin(f / 13 + i) * 2}deg)`, opacity: 1 - fly,
            background: k === 'count' ? K.ui : k === 'q' ? K.lime : '#fff', color: k === 'count' ? '#fff' : K.ui, borderRadius: 999, padding: '20px 34px', display: 'flex', alignItems: 'center', gap: 16,
            fontFamily: FONT, fontWeight: 800, fontSize: 44, boxShadow: '0 16px 40px rgba(0,0,0,0.12)'}}>
            {k === 'pan' && <><svg width="54" height="54" viewBox="0 0 24 24"><circle cx="10" cy="13" r="7" fill={K.ui} /><path d="M16 11 L23 8" stroke={K.ui} strokeWidth="3" strokeLinecap="round" /><circle cx="10" cy="13" r="3" fill="#FFD27A" /></svg>Cozy cooking</>}
            {k === 'count' && <><Logo name="instagram" size={44} /><Logo name="tiktok" size={44} /><span style={{color: K.lime}}>{n}</span> followers</>}
            {k === 'q' && <>What can pay me? <span style={{display: 'inline-block', transform: `rotate(${Math.sin(f / 4) * 12}deg)`}}>$</span></>}
          </div>
        );
      })}
      {/* ripple */}
      {ripple > 0 && ripple < 1 && <div style={{position: 'absolute', left: 910 - ripple * 900, top: 1070 - ripple * 900, width: ripple * 1800, height: ripple * 1800, borderRadius: '50%', border: `${mix(60, 2, ripple)}px solid ${K.lime}`, opacity: 1 - ripple}} />}
      {/* finder ring + tossed tiles */}
      {f >= send && f < chat && (
        <div style={{position: 'absolute', left: ring.x - ring.d / 2, top: ring.y - ring.d / 2, width: ring.d, height: ring.d, borderRadius: '50%', background: K.ui, border: `${mix(0, 14, think)}px solid ${K.lime}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.lime, fontFamily: FONT, fontWeight: 900, fontSize: mix(54, 110, think)}}>{think > 0.5 ? 'S' : '↑'}</div>
      )}
      {f >= send + 6 && f < drop && (
        <svg width="460" height="460" style={{position: 'absolute', left: ring.x - 230, top: ring.y - 230, transform: `rotate(${f * 9}deg)`}}>
          <circle cx="230" cy="230" r="210" stroke={K.lime} strokeWidth="14" fill="none" strokeDasharray="300 1020" strokeLinecap="round" />
          <circle cx="230" cy="230" r="210" stroke={K.ui} strokeWidth="6" fill="none" strokeDasharray="60 1260" strokeDashoffset="-500" strokeLinecap="round" />
        </svg>
      )}
      {f >= send && f < chat && TILES.map((t, i) => {
        const at = tossAt[i % 4] - 4; const p = clamp01((f - at) / 14); if (p <= 0) return null;
        const ang = (i * 360) / TILES.length + 10 + (f - send) * 1.6; const R = 330 + Math.sin(f / 8 + i) * 14;
        const x = ring.x + Math.cos((ang * Math.PI) / 180) * R * expo(f - at, 14); const y = ring.y + Math.sin((ang * Math.PI) / 180) * R * expo(f - at, 14) - Math.sin(p * Math.PI) * 140;
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 28, background: '#fff', boxShadow: '0 12px 26px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 900, fontSize: 40, color: K.ui, transform: `rotate(${(1 - expo(f - at, 14)) * 120}deg) scale(${f >= drop - 8 ? 1 - expoIn(f - drop + 8, 8) : 1})`}}>
            <BrandLogo name={t} size={62} />
          </div>
        );
      })}
      {f >= send + 10 && f < drop && (
        <div style={{position: 'absolute', left: 190, right: 190, top: 1460, fontFamily: FONT}}>
          {(() => { const n = Math.min(16, Math.round(16 * clamp01((f - send - 10) / Math.max(10, drop - send - 22)))); return (<>
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 44, color: K.ui}}><span>Checking streams</span><span>{n}/16</span></div>
            <div style={{height: 22, borderRadius: 11, background: '#E4E4DE', marginTop: 18, overflow: 'hidden'}}><div style={{width: `${(n / 16) * 100}%`, height: '100%', background: K.lime, borderRight: `6px solid ${K.ui}`}} /></div>
          </>); })()}
        </div>
      )}
      {/* chat (after the flood contracts) */}
      {f >= chat && (<>
        <div style={{position: 'absolute', left: 120, top: 600, width: 620, transform: `translate(${(1 - toChat) * 300}px, ${(1 - toChat) * 300 + Math.sin(f / 10) * 8}px) scale(${mix(1.4, 1, toChat)}) rotate(${Math.sin(f / 14) * 1.2}deg)`, transformOrigin: 'left top'}}>
          <MiniCard c={CARDS[3]} />
        </div>
        <div style={{position: 'absolute', left: 120, top: 980, width: 840}}>
          <Rise f={f} at={W(3, 'ugc') - 4} text="UGC fits you." size={84} weight={800} font={FONT} />
          <div style={{marginTop: 18}}><Rise f={f} at={W(3, 'beginners') - 4} text="Beginners usually charge" size={62} weight={600} font={FONT} color="#45453F" /></div>
          <div style={{marginTop: 4}}><span style={{display: 'inline-block', background: K.lime, borderRadius: 18, padding: '4px 22px 0', transform: `scaleX(${expo(f - W(3, '$50') + 6, 10)})`, transformOrigin: 'left'}}><Rise f={f} at={W(3, '$50') - 4} text="$50–$400 a video." size={76} weight={900} font={FONT} color={K.ui} /></span></div>
        </div>
        <div style={{position: 'absolute', left: 120, top: 1420, display: 'flex', gap: 22, opacity: expo(f - W(3, 'video'), 10), transform: `translateY(${(1 - expo(f - W(3, 'video'), 10)) * 30}px)`}}>
          <div style={{background: K.ui, color: '#fff', borderRadius: 60, padding: '30px 44px', fontFamily: FONT, fontWeight: 800, fontSize: 40, transform: `scale(${f >= click && f < click + 5 ? 0.94 : 1})`, minWidth: 330, textAlign: 'center'}}>
            {spin ? <span style={{display: 'inline-block', width: 36, height: 36, borderRadius: 18, border: '6px solid #555', borderTopColor: '#fff', transform: `rotate(${f * 30}deg)`}} /> : done ? '✓ First step' : 'Show first step'}
          </div>
          <div style={{border: `3px solid ${K.ui}`, color: K.ui, borderRadius: 60, padding: '27px 40px', fontFamily: FONT, fontWeight: 800, fontSize: 40}}>More options</div>
        </div>
      </>)}
    </div>
  );

  // screen-space layers: flood, cards, page, outro
  const [rx, ry] = toScreen(ring.x, ring.y);
  const floodR = flood * 2300;
  const [bx, by] = toScreen(120 + 165, 1420 + 52);
  const pageW = mix(330 * cam.z, 1080, grow), pageH = mix(104 * cam.z, 1920, grow);
  const pageX = mix(bx - 165 * cam.z, 0, grow), pageY = mix(by - 52 * cam.z, 0, grow);
  const o = expo(f - outro, 12);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden', fontFamily: FONT}}>
      <Dust f={f} />
      {world}
      {flood > 0 && <div style={{position: 'absolute', left: rx - floodR, top: ry - floodR, width: floodR * 2, height: floodR * 2, borderRadius: '50%', background: K.lime}} />}
      {f >= drop && f < chat + 12 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - expo(f - chat, 10)}}>
          {CARDS.map((c, i) => {
            const x = 540 + (i - strip) * 640; const best = c.best; const l = best ? lift : 0;
            return (
              <div key={c.name} style={{position: 'absolute', left: x - 290, top: 520 - l * 50 + Math.sin(f / 9 + i) * 10, width: 580, transform: `perspective(1400px) rotateY(${clamp01(Math.abs(i - strip)) * Math.sign(strip - i) * 18}deg) scale(${burst * (1 + l * 0.06)})`, opacity: clamp01(burst * 1.4)}}>
                {best && l > 0.5 && <Pulse f={f} x={290} y={380} d={600} from={W(2, 'best')} every={20} />}
                {best && <div style={{position: 'absolute', left: 170, top: -84, background: '#fff', borderRadius: 40, padding: '14px 30px', fontWeight: 800, fontSize: 36, opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}>Best match</div>}
                <DarkCard c={c} shine={((f - drop) * 40 + i * 300) % 1800 - 400} />
              </div>
            );
          })}
        </div>
      )}
      <Burst f={f} at={W(2, 'best')} x={540} y={700} n={18} r={420} />
      {(() => { const [mx, my] = toScreen(400, 1200); return <Burst f={f} at={W(3, '$50')} x={mx} y={my} n={16} r={320} />; })()}
      {f >= click + 10 && f < outro + 20 && (
        <div style={{position: 'absolute', left: pageX, top: pageY, width: pageW, height: pageH, borderRadius: mix(60 * cam.z, 0, expo(f - click - 18, 8)), background: K.ui, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 90, top: 640, opacity: 1 - expo(f - W(4, 'catch') + 2, 6), transform: `translateX(${-expo(f - W(4, 'catch') + 2, 10) * 400}px)`,
            fontWeight: 900, fontSize: mix(40, 100, grow), color: '#fff'}}>First step</div>
          <div style={{position: 'absolute', left: 90, right: 70, top: 560}}>
            <div style={{transform: `translateX(${f >= W(4, 'catch') && f < W(4, 'catch') + 10 ? Math.sin((f - W(4, 'catch')) * 2.4) * 12 * (1 - (f - W(4, 'catch')) / 10) : 0}px)`}}><Rise f={f} at={W(4, 'catch') - 3} text="The catch:" size={92} weight={900} font={FONT} color={K.red} /></div>
            <Rise f={f} at={W(4, 'brands') - 3} text="brands want samples first." size={92} weight={900} font={FONT} color="#fff" />
            <div style={{height: 60}} />
            <Rise f={f} at={W(4, 'first') - 3} text="Your first step:" size={92} weight={900} font={FONT} color="#9A9A94" />
            <Rise f={f} at={W(4, 'three') - 3} text="3 sample videos." size={92} weight={900} font={FONT} color={K.lime} />
          </div>
          {['Unboxing', 'Review', 'How-to'].map((lab, i) => { const p = spring(f - W(4, 'three') - i * 4, {w: 0.45, z: 0.62}); if (p <= 0) return null;
            return (
              <div key={lab} style={{position: 'absolute', left: 90 + i * 310, top: 1180 + Math.sin(f / 9 + i * 2) * 10, width: 270, height: 400, borderRadius: 34, background: '#1C1C1F', border: `4px solid ${K.lime}`,
                transform: `translateY(${(1 - p) * 700}px) rotate(${(1 - p) * (i - 1) * 30 + (i - 1) * 4}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <StreamArt kind="ugc" size={230} p={{...ART, c: '#2E2E33'}} />
                <div style={{fontWeight: 800, fontSize: 36, color: '#fff'}}>{lab}</div>
              </div>
            ); })}
        </div>
      )}
      {f >= outro && (
        <div style={{position: 'absolute', inset: 0, background: K.ui}}>
          <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M140 1500 C 300 1300, 220 1100, 440 1050 S 700 900, 540 760" stroke="#333" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 * (1 - o)} />
          </svg>
          {(() => {
            const p = expo(f - outro - 1, 16); const t = p; // dot along the route (approximate cubic)
            const x = mix(mix(140, 440, t), mix(440, 540, t), t), y = mix(mix(1500, 1050, t), mix(1050, 760, t), t);
            const mark = expo(f - outro - 17, 10);
            return (<>
              {mark < 1 && <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: K.lime, opacity: 1 - mark}} />}
              <div style={{position: 'absolute', left: 540 - 110, top: 760 - 110 - mark * 120, width: 220, height: 220, borderRadius: mix(110, 56, mark), background: K.lime,
                transform: `scale(${mix(0.2, 1, mark)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: K.ui, fontWeight: 900, fontSize: 130 * mark}}>S</div>
              {mark > 0.9 && <Pulse f={f} x={540} y={640} d={240} from={outro + 26} every={22} />}
              <Burst f={f} at={outro + 22} x={540} y={640} n={18} r={380} />
              <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', overflow: 'hidden'}}>
                <div style={{fontWeight: 900, fontSize: 84, color: '#fff', clipPath: `inset(0 ${(1 - expo(f - outro - 22, 10)) * 50}% 0 ${(1 - expo(f - outro - 22, 10)) * 50}%)`}}>subcreatorpaid.com</div>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 56, color: K.lime, opacity: expo(f - W(5, 'comment') + 4, 10)}}>Comment FINDER for the free guide</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontWeight: 700, fontSize: 40, color: '#9A9A94', opacity: expo(f - outro - 28, 8)}}>Free AI Income Finder</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1120, textAlign: 'center', opacity: expo(f - W(5, 'tools') + 4, 10)}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#1E1E21', color: '#CFCFCA', borderRadius: 40, padding: '12px 26px', fontWeight: 700, fontSize: 30}}>Tools I use:
                  {['beehiiv', 'elevenlabs', 'opusclip', 'skool'].map((n, i) => <span key={n} style={{display: 'inline-flex', width: 56, height: 56, borderRadius: 14, background: '#fff', alignItems: 'center', justifyContent: 'center',
                    transform: `scale(${spring(f - W(5, 'tools') - i * 3, {w: 0.5, z: 0.6})})`}}><BrandLogo name={n} size={42} /></span>)} · Affiliate links</span>
              </div>
              <div style={{position: 'absolute', left: 300, top: 1300, width: 480, height: 110, borderRadius: 55, background: f > W(5, 'follow') + 4 ? '#2A2A2D' : '#fff', color: f > W(5, 'follow') + 4 ? '#fff' : K.ui,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44, opacity: expo(f - W(5, 'follow') + 10, 8)}}>{f > W(5, 'follow') + 4 ? 'Following' : 'Follow'}</div>
            </>);
          })()}
        </div>
      )}
      {f >= page && f < page + 30 && (() => { const [cx, cy] = toScreen(285, 1472); const p = expo(f - page, 5); return <Cursor x={mix(900, cx, p)} y={mix(1700, cy, p)} s={f >= click && f < click + 5 ? 0.85 : 1} />; })()}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1610, textAlign: 'center', fontWeight: 700, fontSize: 30, color: f >= page + 20 ? '#fff' : K.ui, opacity: 0.45}}>@subcreatorpaid</div>
    </AbsoluteFill>
  );
};

const DarkCard = ({c, shine = -999}) => (
  <div style={{position: 'relative', width: 580, height: 760, borderRadius: 40, background: K.ui, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.25)', fontFamily: FONT}}>
    <div style={{position: 'absolute', left: shine, top: -200, width: 120, height: 1200, background: 'rgba(255,255,255,0.14)', transform: 'rotate(20deg)', zIndex: 2}} />
    <div style={{position: 'relative', height: 380, background: c.best ? K.lime : K.card, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {c.best ? <StreamArt kind={c.kind} size={300} p={{...ART, a: '#FFFFFF', rec: K.ui, recInk: K.lime}} /> : (
        <div style={{width: 230, height: 230, borderRadius: 56, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}><BrandLogo name={c.logos[0]} size={150} /></div>)}
      {c.best && <div style={{position: 'absolute', right: 22, bottom: 22, display: 'flex', gap: 12}}>{c.logos.map((n) => <div key={n} style={{width: 96, height: 96, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BrandLogo name={n} size={74} /></div>)}</div>}
    </div>
    <div style={{padding: '34px 38px'}}>
      <div style={{fontWeight: 800, fontSize: 46, color: '#fff'}}>{c.name}</div>
      <div style={{fontWeight: 500, fontSize: 30, color: '#A5A5A0', marginTop: 10}}>{c.line}</div>
      <div style={{fontWeight: 800, fontSize: 36, color: c.best ? '#CDF24F' : '#fff', marginTop: 26}}>{c.pay}</div>
    </div>
  </div>
);
const MiniCard = ({c}) => (
  <div style={{display: 'flex', gap: 22, alignItems: 'center', background: '#0E0E10', borderRadius: 34, padding: 20, fontFamily: FONT}}>
    <div style={{width: 120, height: 120, borderRadius: 24, background: K.lime, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><StreamArt kind={c.kind} size={110} p={{...ART, a: '#FFFFFF', rec: K.ui, recInk: K.lime}} /></div>
    <div><div style={{fontWeight: 800, fontSize: 40, color: '#fff'}}>{c.name}</div><div style={{fontWeight: 700, fontSize: 28, color: '#CDF24F', marginTop: 6}}>Best match</div></div>
  </div>
);
