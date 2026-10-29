// Film 1, "Launch" (from the owner's product-launch-film prompt, 29 Oct 2026), topic: the free AI Income Finder.
// One continuous take, no fades or cuts: the composer is typed into, the send button ripples lime and the message becomes
// a bubble, the button grows into the finder ring that tosses stream tiles, a lime flood bursts into result cards that
// land on the best match, the flood contracts back into the chat, the black button expands into the page, and a route
// ends on a pin that becomes the brand mark. Warm white #F5F5F2, black UI #0E0E10, lime #CDF24F, blue send #2F6BFF.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FONT} from '../Short';
import {Logo} from '../graphics';
import {expo, expoIn, inOut, spring, kf, mix, clamp01, camera, Rise, typedCount, Cursor, useTimes} from './kit';
import {StreamArt, Avatar, Icon, Check} from './art';

const K = {bg: '#F5F5F2', ui: '#0E0E10', lime: '#CDF24F', blue: '#2F6BFF', mut: '#8B8B86', money: '#1F8A4C', red: '#E5484D'};
const LINES = ['I film cozy cooking,', '600 followers.', 'What can pay me?'];
const CARDS = [
  {name: 'Etsy templates', line: 'Sell a digital file again and again', pay: 'about $8.60 of a $10 sale', bg: '#F1641E', kind: 'etsy'},
  {name: 'Amazon Associates', line: 'Earn a cut when someone buys', pay: '3%–4.5% on most categories', bg: '#2B2B2B', kind: 'amazon'},
  {name: 'Fiverr gigs', line: 'Sell a small service', pay: 'Fiverr keeps 20%', bg: '#1DBF73', kind: 'fiverr'},
  {name: 'UGC videos', line: 'Brands pay for videos they run as ads', pay: '$50–$400 a video', bg: '#2F6BFF', kind: 'ugc', best: true},
  {name: 'ElevenLabs voices', line: 'Earn when paying users pick your voice', pay: 'Paid through Stripe', bg: '#111', kind: 'voice'},
];

const Iridescent = ({f, w, h, r}) => (
  <div style={{position: 'absolute', left: -40, top: -40, width: w + 80, height: h + 80, borderRadius: r + 40, filter: 'blur(34px)', opacity: 0.85, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 1600, height: 1600, marginLeft: -800, marginTop: -800, transform: `rotate(${f * 3}deg)`,
      background: 'conic-gradient(from 0deg, #FF6FB5, #FF9A3C, #CDF24F, #3CD3F0, #8B6CFF, #FF6FB5)'}} />
  </div>
);

export const Launch = ({beats = []}) => {
  const f = useCurrentFrame();
  const {B, W} = useTimes(beats);
  const send = B(1), drop = B(2) + 2, chat = B(3), page = B(4), outro = B(5);
  // ---- camera (world space; the composer sits at 540, 960)
  const cam = camera(f, [
    [0, 1.08, 540, 960], [send - 2, 1.22, 560, 980], [send + 22, 1.0, 540, 960], [drop, 1.0, 540, 960], [drop + 30, 1.04, 540, 940],
    [chat, 1.04, 540, 940], [chat + 24, 1.0, 540, 960], [page, 1.0, 540, 960],
  ], (t, d) => (t <= 0 ? 0 : 1 - Math.pow(1 - inOut(t, d), 1)));
  const toScreen = (x, y) => [540 + (x - cam.x) * cam.z, 960 + (y - cam.y) * cam.z];

  // ---- composer -> bubble
  const sent = expo(f - send, 16);
  const press = f >= send - 3 && f < send + 4 ? 0.86 : 1;
  const typed = (() => { let left = typedCount(f, B(0) + 6, LINES.join('').length, 3, 1.25); return LINES.map((l) => { const s = l.slice(0, Math.max(0, left)); left -= l.length; return s; }); })();
  const comp = {x: mix(90, 250, sent), y: mix(770, 300, sent), w: mix(900, 740, sent), h: mix(380, 220, sent)};
  const ripple = expo(f - send, 18); // lime ripple from the send button
  // ---- think: the send button grows into the finder ring and tosses stream tiles
  const think = expo(f - send - 8, 18);
  const ring = {x: mix(910, 540, think), y: mix(1070, 1060, think), d: mix(96, 300, think)};
  const tossAt = [W(1, 'checks'), W(1, '16'), W(1, 'verified'), W(1, 'streams')];
  const TILES = ['instagram', 'tiktok', 'youtube', 'spotify', 'E', 'a', 'fi', 'EL', 'K', 'P', 'S', 'G', 'T', 'Y', 'U', 'Ko'];
  // ---- drop: lime flood fills the frame, cards burst, strip lands on the best match
  const flood = expoIn(f - drop + 10, 10) * (1 - expo(f - chat, 16));
  const burst = spring(f - drop, {w: 0.28, z: 0.78});
  const strip = kf(f, [[drop + 6, 0], [W(2, 'fit') + 2, 3]], inOut);
  const lift = expo(f - W(2, 'best') + 4, 12);
  const toChat = expo(f - chat, 18);
  // ---- page: the black button expands into the page
  const click = page + 8; const spin = f >= click && f < click + 12; const done = f >= click + 12;
  const grow = expo(f - click - 16, 20);

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
      {sent > 0.3 && <div style={{position: 'absolute', left: 120, top: 320, opacity: expo(f - send - 6, 10)}}><Avatar size={110} /></div>}
      {/* composer / bubble */}
      <div style={{position: 'absolute', left: comp.x, top: comp.y, width: comp.w, height: comp.h}}>
        {sent < 0.6 && <div style={{opacity: 1 - sent * 1.6}}><Iridescent f={f} w={comp.w} h={comp.h} r={48} /></div>}
        <div style={{position: 'absolute', inset: 0, borderRadius: mix(48, 56, sent), background: sent > 0.5 ? K.lime : '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.10)'}} />
        <div style={{position: 'absolute', left: mix(54, 44, sent), top: mix(50, 34, sent), fontFamily: FONT, fontWeight: 600, fontSize: mix(54, 44, sent), lineHeight: 1.3, color: K.ui}}>
          {typed.map((l, i) => <div key={i} style={{height: mix(70, 57, sent)}}>{l}{sent === 0 && i === typed.findIndex((x, j) => x.length < LINES[j].length) ? <span style={{color: K.blue}}>|</span> : null}</div>)}
        </div>
        {sent < 0.3 && <div style={{position: 'absolute', right: 34, bottom: 34, width: 96, height: 96, borderRadius: 48, background: K.blue, transform: `scale(${press})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 54, fontWeight: 900, fontFamily: FONT}}>↑</div>}
      </div>
      {/* ripple */}
      {ripple > 0 && ripple < 1 && <div style={{position: 'absolute', left: 910 - ripple * 900, top: 1070 - ripple * 900, width: ripple * 1800, height: ripple * 1800, borderRadius: '50%', border: `${mix(60, 2, ripple)}px solid ${K.lime}`, opacity: 1 - ripple}} />}
      {/* finder ring + tossed tiles */}
      {f >= send && f < chat && (
        <div style={{position: 'absolute', left: ring.x - ring.d / 2, top: ring.y - ring.d / 2, width: ring.d, height: ring.d, borderRadius: '50%', background: think < 0.5 ? K.blue : K.ui, border: `${mix(0, 14, think)}px solid ${K.lime}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: mix(54, 110, think)}}>{think > 0.5 ? 'S' : '↑'}</div>
      )}
      {f >= send && f < chat && TILES.map((t, i) => {
        const at = tossAt[i % 4] - 4; const p = clamp01((f - at) / 22); if (p <= 0) return null;
        const ang = (i * 360) / TILES.length + 10; const R = 330;
        const x = ring.x + Math.cos((ang * Math.PI) / 180) * R * expo(f - at, 22); const y = ring.y + Math.sin((ang * Math.PI) / 180) * R * expo(f - at, 22) - Math.sin(p * Math.PI) * 140;
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 28, background: '#fff', boxShadow: '0 12px 26px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 900, fontSize: 40, color: K.ui, transform: `rotate(${(1 - expo(f - at, 22)) * 120}deg)`}}>
            {['instagram', 'tiktok', 'youtube', 'spotify'].includes(t) ? <Logo name={t} size={62} /> : t}
          </div>
        );
      })}
      {f >= send + 10 && f < drop && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 1470, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 46, color: 'transparent',
          backgroundImage: `linear-gradient(90deg, #8B8B86 0%, #8B8B86 ${((f * 3) % 140) - 30}%, #0E0E10 ${((f * 3) % 140) - 15}%, #8B8B86 ${(f * 3) % 140}%, #8B8B86 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text'}}>
          Checking 16 verified streams
        </div>
      )}
      {/* chat (after the flood contracts) */}
      {f >= chat && (<>
        <div style={{position: 'absolute', left: 120, top: 600, width: 620, transform: `translate(${(1 - toChat) * 300}px, ${(1 - toChat) * 300}px) scale(${mix(1.4, 1, toChat)})`, transformOrigin: 'left top'}}>
          <MiniCard c={CARDS[3]} />
        </div>
        <div style={{position: 'absolute', left: 120, top: 980, width: 840}}>
          <Rise f={f} at={W(3, 'ugc') - 4} text="UGC fits you." size={84} weight={800} font={FONT} />
          <div style={{marginTop: 18}}><Rise f={f} at={W(3, 'beginners') - 4} text="Beginners usually charge" size={62} weight={600} font={FONT} color="#45453F" /></div>
          <div style={{marginTop: 4}}><Rise f={f} at={W(3, '$50') - 4} text="$50–$400 a video." size={88} weight={900} font={FONT} color={K.money} /></div>
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
  const o = expo(f - outro, 18);
  return (
    <AbsoluteFill style={{background: K.bg, overflow: 'hidden', fontFamily: FONT}}>
      {world}
      {flood > 0 && <div style={{position: 'absolute', left: rx - floodR, top: ry - floodR, width: floodR * 2, height: floodR * 2, borderRadius: '50%', background: K.lime}} />}
      {f >= drop && f < chat + 12 && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - expo(f - chat, 10)}}>
          {CARDS.map((c, i) => {
            const x = 540 + (i - strip) * 640; const best = c.best; const l = best ? lift : 0;
            return (
              <div key={c.name} style={{position: 'absolute', left: x - 290, top: 520 - l * 50, width: 580, transform: `scale(${burst * (1 + l * 0.06)})`, opacity: clamp01(burst * 1.4)}}>
                {best && <div style={{position: 'absolute', left: 170, top: -84, background: '#fff', borderRadius: 40, padding: '14px 30px', fontWeight: 800, fontSize: 36, opacity: l, transform: `translateY(${(1 - l) * 20}px)`}}>Best match</div>}
                <DarkCard c={c} />
              </div>
            );
          })}
        </div>
      )}
      {f >= click + 16 && f < outro + 30 && (
        <div style={{position: 'absolute', left: pageX, top: pageY, width: pageW, height: pageH, borderRadius: mix(60 * cam.z, 0, expo(f - click - 30, 10)), background: K.ui, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 90, top: 640, opacity: 1 - expo(f - W(4, 'catch') + 2, 6), transform: `translateX(${-expo(f - W(4, 'catch') + 2, 10) * 400}px)`,
            fontWeight: 900, fontSize: mix(40, 100, grow), color: '#fff'}}>First step</div>
          <div style={{position: 'absolute', left: 90, right: 70, top: 560}}>
            <Rise f={f} at={W(4, 'catch') - 3} text="The catch:" size={92} weight={900} font={FONT} color={K.red} />
            <Rise f={f} at={W(4, 'brands') - 3} text="brands want samples first." size={92} weight={900} font={FONT} color="#fff" />
            <div style={{height: 60}} />
            <Rise f={f} at={W(4, 'first') - 3} text="Your first step:" size={92} weight={900} font={FONT} color="#9A9A94" />
            <Rise f={f} at={W(4, 'three') - 3} text="3 sample videos." size={92} weight={900} font={FONT} color={K.lime} />
          </div>
        </div>
      )}
      {f >= outro && (
        <div style={{position: 'absolute', inset: 0, background: K.ui}}>
          <svg width="1080" height="1920" style={{position: 'absolute', left: 0, top: 0}}>
            <path d="M140 1500 C 300 1300, 220 1100, 440 1050 S 700 900, 540 760" stroke="#333" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="2000" strokeDashoffset={2000 * (1 - o)} />
          </svg>
          {(() => {
            const p = expo(f - outro - 2, 26); const t = p; // dot along the route (approximate cubic)
            const x = mix(mix(140, 440, t), mix(440, 540, t), t), y = mix(mix(1500, 1050, t), mix(1050, 760, t), t);
            const mark = expo(f - outro - 28, 14);
            return (<>
              {mark < 1 && <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: K.lime, opacity: 1 - mark}} />}
              <div style={{position: 'absolute', left: 540 - 110, top: 760 - 110 - mark * 120, width: 220, height: 220, borderRadius: mix(110, 56, mark), background: mark > 0.3 ? 'linear-gradient(160deg, #3FA36C, #24764A)' : K.lime,
                transform: `scale(${mix(0.2, 1, mark)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 130 * mark}}>S</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', overflow: 'hidden'}}>
                <div style={{fontWeight: 900, fontSize: 84, color: '#fff', clipPath: `inset(0 ${(1 - expo(f - outro - 36, 16)) * 50}% 0 ${(1 - expo(f - outro - 36, 16)) * 50}%)`}}>subcreatorpaid.com</div>
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1460, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 56, color: K.lime, opacity: expo(f - W(5, 'comment') + 4, 10)}}>Comment FINDER for the free guide</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', fontWeight: 700, fontSize: 40, color: '#9A9A94', opacity: expo(f - outro - 44, 10)}}>Free AI Income Finder</div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 1120, textAlign: 'center', opacity: expo(f - W(5, 'tools') + 4, 10)}}>
                <span style={{background: '#1E1E21', color: '#CFCFCA', borderRadius: 40, padding: '14px 28px', fontWeight: 700, fontSize: 30}}>Tools I use: link in bio · Affiliate link</span>
              </div>
              <div style={{position: 'absolute', left: 300, top: 1300, width: 480, height: 110, borderRadius: 55, background: f > W(5, 'follow') + 4 ? '#2A2A2D' : '#fff', color: f > W(5, 'follow') + 4 ? '#fff' : K.ui,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 44, opacity: expo(f - W(5, 'follow') + 10, 8)}}>{f > W(5, 'follow') + 4 ? 'Following' : 'Follow'}</div>
            </>);
          })()}
        </div>
      )}
      {f >= page && f < page + 30 && (() => { const [cx, cy] = toScreen(285, 1472); const p = expo(f - page, 8); return <Cursor x={mix(900, cx, p)} y={mix(1700, cy, p)} s={f >= click && f < click + 5 ? 0.85 : 1} />; })()}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1610, textAlign: 'center', fontWeight: 700, fontSize: 30, color: f >= page + 20 ? '#fff' : K.ui, opacity: 0.45}}>@subcreatorpaid</div>
    </AbsoluteFill>
  );
};

const DarkCard = ({c}) => (
  <div style={{width: 580, height: 760, borderRadius: 40, background: '#0E0E10', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.25)', fontFamily: FONT}}>
    <div style={{height: 380, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><StreamArt kind={c.kind} size={320} /></div>
    <div style={{padding: '34px 38px'}}>
      <div style={{fontWeight: 800, fontSize: 46, color: '#fff'}}>{c.name}</div>
      <div style={{fontWeight: 500, fontSize: 30, color: '#A5A5A0', marginTop: 10}}>{c.line}</div>
      <div style={{fontWeight: 800, fontSize: 36, color: c.best ? '#CDF24F' : '#fff', marginTop: 26}}>{c.pay}</div>
    </div>
  </div>
);
const MiniCard = ({c}) => (
  <div style={{display: 'flex', gap: 22, alignItems: 'center', background: '#0E0E10', borderRadius: 34, padding: 20, fontFamily: FONT}}>
    <div style={{width: 120, height: 120, borderRadius: 24, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><StreamArt kind={c.kind} size={110} /></div>
    <div><div style={{fontWeight: 800, fontSize: 40, color: '#fff'}}>{c.name}</div><div style={{fontWeight: 700, fontSize: 28, color: '#CDF24F', marginTop: 6}}>Best match</div></div>
  </div>
);
