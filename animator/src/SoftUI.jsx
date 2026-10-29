// "Soft UI" style (owner ask, 29 Oct 2026: "give me a video like this", reference reel De-6dDfynG_). Used when spec.json has
// "style": "softui". Warm off-white canvas with soft pastel light, a big bold headline at the top that builds word by word
// (key words in italic serif, steel blue, or a soft highlight box), and ONE glossy product-UI card in the middle per line.
// Shots change with a focus pull (blur out / blur in), things in the background sit out of focus, small 3D app tiles with
// pulse rings, typed text, a light cursor. Green only for money, red only for loss or "the catch". No emojis.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing, staticFile, Audio} from 'remotion';
import {FONT, Fonts} from './Short';
import {Logo} from './graphics';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const ease = (t, d = 12) => interpolate(t, [0, d], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
const out3 = (t, d = 12) => interpolate(t, [0, d], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const pop = (t, d = 10) => interpolate(t, [0, d * 0.65, d], [0, 1.07, 1], {...clamp, easing: Easing.out(Easing.cubic)});
const lerp = (f, a, b, x, y) => interpolate(f, [a, Math.max(b, a + 1)], [x, y], clamp);
const clean = (s) => String(s).replace(/[^\w$%'-]/g, '').toLowerCase();

const U = {bg: '#F4F0EB', ink: '#1D1D1F', mut: '#8E8A85', line: '#ECE7E1', serif: '#B5573B', blue: '#3B6A8E', blue2: '#5F8FB3', hl: '#F8DCCB',
  green: '#2E8B57', greenSoft: '#E2F2E8', red: '#E0393E', redSoft: '#FCE3E2', card: '#FFFFFF'};
const SERIF = '"SerifX", "DejaVu Serif", Georgia, serif';
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';
const SHADOW = '0 50px 90px rgba(70,45,30,0.13), 0 10px 24px rgba(70,45,30,0.07), 0 0 0 1.5px rgba(0,0,0,0.035)';
const OV = 10; // focus-pull overlap between shots (frames)

const SerifFont = () => <style>{`@font-face{font-family:SerifX;font-style:italic;src:url(${staticFile('DejaVuSerif-Italic.ttf')})}`}</style>;

// ---------- small parts
const Card = ({children, style = {}}) => <div style={{position: 'absolute', background: U.card, borderRadius: 40, boxShadow: SHADOW, fontFamily: FONT, color: U.ink, overflow: 'hidden', ...style}}>{children}</div>;
const Tile = ({size = 180, children, style = {}, bg = 'linear-gradient(160deg, #FFFFFF, #EFEBE6)'}) => (
  <div style={{position: 'absolute', width: size, height: size, borderRadius: size * 0.26, background: bg, boxShadow: '0 30px 50px rgba(70,45,30,0.16), inset 0 2px 0 rgba(255,255,255,0.9), 0 0 0 1.5px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);
// Our brand mark as an app icon: green rounded square with a white dollar-S.
const Mark = ({size = 110}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: 'linear-gradient(160deg, #3FA36C, #24764A)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: size * 0.56, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)'}}>S</div>
);
const Pulse = ({f, x, y, r = 170, color = U.red, every = 36}) => [0, 1].map((k) => {
  const t = ((f + k * every / 2) % every) / every;
  return <div key={k} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, border: `4px solid ${color}`, opacity: 0.55 * (1 - t), transform: `scale(${0.75 + 0.6 * t})`}} />;
});
const Cursor = ({x, y, press = 0}) => (
  <svg width="54" height="64" viewBox="0 0 27 32" style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.25))'}}>
    <path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill="#111" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);
const Chip = ({children, style = {}, bg = '#fff', color = U.ink}) => (
  <div style={{position: 'absolute', background: bg, color, borderRadius: 999, padding: '12px 24px', fontFamily: FONT, fontWeight: 700, fontSize: 28, boxShadow: '0 12px 26px rgba(70,45,30,0.12)', whiteSpace: 'nowrap', ...style}}>{children}</div>
);
const Example = ({f, style = {}}) => <Chip style={{fontSize: 24, padding: '8px 18px', opacity: ease(f - 6, 10), ...style}}>Illustrative example</Chip>;
const Typed = ({text, p}) => { const n = Math.floor(text.length * Math.max(0, Math.min(1, p))); return <>{text.slice(0, n)}<span style={{opacity: p < 1.05 ? 1 : 0, color: U.blue}}>|</span></>; };
// Something out of focus in the background (depth of field).
const Far = ({children, style = {}, blur = 10, o = 0.55}) => <div style={{position: 'absolute', filter: `blur(${blur}px)`, opacity: o, ...style}}>{children}</div>;

// ---------- shots: ({f, w, s}) f = frames since the shot started, w('word') = frame of that word in the shot
const STREAMS = ['UGC videos', 'Amazon Associates', 'Etsy templates', 'ElevenLabs voices', 'Fiverr gigs', 'TikTok Rewards'];
const Guess = ({f, w}) => {
  const k = Math.floor(f / 7) % STREAMS.length; const jump = [0, 3, 1, 5, 2, 4][k];
  const shake = f > w('guessing') - 4 ? Math.sin(f * 1.3) * 4 * Math.exp(-(f - w('guessing')) / 20) : 0;
  return (<>
    <Far style={{left: 70, top: 640}}><Tile size={150}><div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, color: U.serif}}>?</div></Tile></Far>
    <Far style={{left: 860, top: 1260}} blur={8}><Tile size={120}><Logo name="tiktok" size={70} /></Tile></Far>
    <Card style={{left: 170, top: 700, width: 740, padding: '34px 30px', transform: `translateX(${shake}px)`}}>
      <div style={{fontWeight: 800, fontSize: 36, padding: '0 14px 18px', color: U.mut}}>Which one should I try?</div>
      {STREAMS.map((t, i) => (
        <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '20px 18px', borderRadius: 22, background: i === jump ? '#F4EFE9' : 'transparent', fontWeight: 700, fontSize: 38, opacity: ease(f - 2 - i * 2, 8)}}>
          <div style={{width: 30, height: 30, borderRadius: 15, border: `4px solid ${i === jump ? U.ink : '#D9D3CC'}`, background: i === jump ? U.ink : 'transparent'}} />{t}
        </div>
      ))}
    </Card>
    <Cursor x={lerp(f, 0, 200, 700, 760) + Math.sin(f / 6) * 30} y={820 + jump * 82} />
  </>);
};
const App = ({f, w}) => {
  const free = pop(f - w('free') + 6, 12); const three = f - w('three') + 6;
  return (<>
    <Pulse f={f} x={540} y={900} color={U.green} />
    <Tile size={250} style={{left: 415, top: 775, transform: `scale(${pop(f, 14)})`}}><Mark size={160} /></Tile>
    <div style={{position: 'absolute', left: 600, top: 700, transform: `rotate(-9deg) scale(${free})`, background: `linear-gradient(160deg, ${U.blue2}, ${U.blue})`, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 64,
      padding: '14px 34px', borderRadius: 24, boxShadow: '0 20px 40px rgba(59,106,142,0.4)', letterSpacing: 2}}>FREE</div>
    {[0, 1, 2].map((i) => {
      const p = pop(three - i * 4, 12); const x = [230, 465, 700][i];
      return <Tile key={i} size={150} style={{left: x, top: 1130, transform: `scale(${p})`}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 72, color: U.blue}}>{i + 1}</div></Tile>;
    })}
    <Far style={{left: 60, top: 1180}} blur={9}><Tile size={110}><Logo name="instagram" size={64} /></Tile></Far>
    <Far style={{left: 900, top: 640}} blur={9}><Tile size={110}><Logo name="youtube" size={64} /></Tile></Far>
  </>);
};
const Site = ({f, w}) => {
  const p = out3(f, 16); const click = f - w('finder');
  return (<>
    <Card style={{left: 110, top: 680, width: 860, height: 640, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{height: 84, background: '#F3F0EC', display: 'flex', alignItems: 'center', gap: 12, padding: '0 28px'}}>
        {['#F26B5E', '#F5BE4F', '#5FC454'].map((c) => <div key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />)}
        <div style={{marginLeft: 20, flex: 1, height: 50, borderRadius: 25, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', fontFamily: MONO, fontSize: 28, color: U.mut}}>
          <Typed text="subcreatorpaid.com/finder" p={lerp(f, 4, 34, 0, 1)} />
        </div>
      </div>
      <div style={{padding: '50px 54px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}><Mark size={84} /><div style={{fontWeight: 900, fontSize: 52, lineHeight: 1.05}}>AI Creator<br />Income Finder</div></div>
        <div style={{marginTop: 26, fontWeight: 600, fontSize: 34, color: U.mut}}>Three income streams that fit you, in seconds.</div>
        <div style={{marginTop: 40, display: 'inline-block', background: U.ink, color: '#fff', fontWeight: 800, fontSize: 36, padding: '22px 40px', borderRadius: 24, transform: `scale(${click > 0 && click < 8 ? 0.95 : 1})`}}>Find my streams</div>
      </div>
    </Card>
    <Cursor x={lerp(f, 10, w('finder'), 900, 420)} y={lerp(f, 10, w('finder'), 1400, 1180)} press={click > 0 && click < 8 ? 1 : 0} />
  </>);
};
const Typing = ({f, w}) => (<>
  <Example f={f} style={{left: 360, top: 640}} />
  <Card style={{left: 110, top: 720, width: 860, padding: '44px 48px', transform: `scale(${0.96 + 0.04 * out3(f, 14)})`, opacity: out3(f, 10)}}>
    <div style={{fontWeight: 800, fontSize: 30, color: U.mut, letterSpacing: 1}}>DESCRIBE YOUR ACCOUNT</div>
    <div style={{marginTop: 22, minHeight: 220, borderRadius: 26, border: `3px solid ${f > w('describe') ? U.blue2 : U.line}`, padding: '28px 30px', fontWeight: 700, fontSize: 46, lineHeight: 1.3,
      boxShadow: f > w('describe') ? '0 0 0 8px rgba(95,143,179,0.15)' : 'none'}}>
      <Typed text="I film cozy home cooking, 600 followers on TikTok" p={lerp(f, w('describe'), w('words') + 6, 0, 1)} />
    </div>
    <div style={{marginTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 28, fontWeight: 600, color: U.mut}}><span>A few words is enough</span><span>{Math.round(lerp(f, w('describe'), w('words') + 6, 0, 49))}/300</span></div>
  </Card>
</>);
const Seg = ({label, opts, sel, on, top}) => (
  <div style={{position: 'absolute', left: 48, right: 48, top}}>
    <div style={{fontWeight: 800, fontSize: 28, color: U.mut, letterSpacing: 1, marginBottom: 14}}>{label}</div>
    <div style={{display: 'flex', gap: 14}}>
      {opts.map((o, i) => (
        <div key={i} style={{flex: 1, height: 96, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32,
          background: i === sel && on ? U.ink : '#F4F1ED', color: i === sel && on ? '#fff' : U.ink, transform: `scale(${i === sel && on ? 1.04 : 1})`}}>{o}</div>
      ))}
    </div>
  </div>
);
const Pick = ({f, w}) => {
  const a = f > w('followers') - 2, b = f > w('platform') - 2, c = f > w('enjoy') - 2;
  const target = c ? [260, 1240] : b ? [520, 1035] : [260, 830];
  return (<>
    <Card style={{left: 90, top: 660, width: 900, height: 700, opacity: out3(f, 10)}}>
      <Seg label="FOLLOWERS" opts={['0–1k', '1k–5k', '5k–10k', '10k+']} sel={0} on={a} top={44} />
      <Seg label="MAIN PLATFORM" opts={[<Logo key="i" name="instagram" size={56} />, <Logo key="t" name="tiktok" size={56} />, <Logo key="y" name="youtube" size={56} />]} sel={1} on={b} top={250} />
      <Seg label="YOU ENJOY" opts={['Filming', 'Recommending', 'Making', 'Writing'].map((t) => <span key={t} style={{fontSize: 26}}>{t}</span>)} sel={0} on={c} top={456} />
    </Card>
    <Cursor x={lerp(f, 0, 12, 700, target[0])} y={lerp(f, 0, 12, 1500, target[1])} press={a && f < w('followers') + 6 ? 1 : 0} />
  </>);
};
const GRID = ['UGC', 'Amazon', 'Etsy', 'Voices', 'Fiverr', 'TikTok', 'YouTube', 'Patreon', 'Substack', 'Gumroad', 'Ko-fi', 'Spotify'];
const Scan = ({f, w}) => {
  const sweep = lerp(f, w('checks') - 4, w('three') - 4, 0, 1); const pick = ease(f - w('three') + 6, 12); const top3 = [0, 3, 4];
  return (<>
    <Chip style={{left: 340, top: 600, opacity: ease(f, 8)}}><span style={{color: U.green}}>✓</span> 16 verified streams</Chip>
    {GRID.map((t, i) => {
      const r = Math.floor(i / 3), c = i % 3; const hot = top3.includes(i); const n = top3.indexOf(i) + 1;
      return (
        <div key={t} style={{position: 'absolute', left: 120 + c * 290, top: 700 + r * 170, width: 260, height: 140, borderRadius: 30, background: '#fff', boxShadow: SHADOW, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT, fontWeight: 800, fontSize: 36, color: U.ink, filter: `blur(${hot ? 0 : pick * 6}px)`, opacity: (hot ? 1 : 1 - 0.5 * pick) * ease(f - i, 8), transform: `scale(${hot ? 1 + 0.08 * pick : 1 - 0.05 * pick})`,
          outline: hot && pick > 0.5 ? `4px solid ${U.blue2}` : 'none'}}>
          {t}
          {hot && <div style={{position: 'absolute', right: -14, top: -14, width: 56, height: 56, borderRadius: 28, background: U.blue, color: '#fff', fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f - w('three') + 4 - n * 3, 10)})`}}>{n}</div>}
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 100, right: 100, top: 690 + sweep * 690, height: 6, borderRadius: 3, background: U.blue2, boxShadow: '0 0 30px rgba(95,143,179,0.8)', opacity: sweep > 0 && sweep < 1 ? 1 : 0}} />
  </>);
};
const Row = ({p, label, children, top}) => (
  <div style={{position: 'absolute', left: 48, right: 48, top, opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 30}px)`}}>
    <div style={{fontWeight: 800, fontSize: 26, color: U.mut, letterSpacing: 1}}>{label}</div>
    <div style={{marginTop: 8, fontWeight: 800, fontSize: 42}}>{children}</div>
  </div>
);
const Result = ({f, w}) => {
  const fit = Math.round(lerp(f, 4, 30, 0, 92));
  return (<>
    <Example f={f} style={{left: 360, top: 600}} />
    <Card style={{left: 110, top: 680, width: 860, height: 700, opacity: out3(f, 10)}}>
      <div style={{position: 'absolute', left: 48, top: 44, fontWeight: 800, fontSize: 28, color: U.mut, letterSpacing: 1}}>YOUR TOP MATCH</div>
      <div style={{position: 'absolute', left: 48, top: 88, fontWeight: 900, fontSize: 64}}>UGC videos</div>
      <div style={{position: 'absolute', right: 44, top: 50, width: 130, height: 130, borderRadius: 65, background: `conic-gradient(${U.blue} ${fit * 3.6}deg, #EEE9E3 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 102, height: 102, borderRadius: 51, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 34}}>{fit}%</div>
      </div>
      <div style={{position: 'absolute', left: 48, right: 48, top: 210, height: 2, background: U.line}} />
      <Row p={ease(f - w('why') + 6, 10)} label="WHY IT FITS" top={240}>You already film food at home</Row>
      <Row p={ease(f - w('pays') + 6, 10)} label="WHAT IT PAYS" top={380}><span style={{color: U.green, background: U.greenSoft, padding: '2px 16px', borderRadius: 14}}>$50–$400 a video</span><span style={{fontSize: 24, color: U.mut, fontWeight: 600}}>  beginner range · Insense</span></Row>
      <Row p={ease(f - w('step') + 6, 10)} label="FIRST STEP" top={520}>Film 3 samples this week</Row>
    </Card>
  </>);
};
const Proof = ({f, w}) => {
  const no = pop(f - w('never') + 6, 12);
  return (<>
    <Card style={{left: 110, top: 690, width: 600, padding: '40px 44px', opacity: out3(f, 10)}}>
      <div style={{fontWeight: 800, fontSize: 28, color: U.mut, letterSpacing: 1}}>OUR CHECKED DATA</div>
      {[['UGC rates', 'Insense · Sep 2026'], ['Amazon fees', 'Associates fee table'], ['Etsy fees', 'Etsy checkout page']].map(([a, b], i) => (
        <div key={a} style={{display: 'flex', gap: 20, alignItems: 'center', marginTop: 26, opacity: ease(f - 6 - i * 5, 8)}}>
          <div style={{width: 48, height: 48, borderRadius: 24, background: U.greenSoft, color: U.green, fontWeight: 900, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
          <div><div style={{fontWeight: 800, fontSize: 36}}>{a}</div><div style={{fontWeight: 600, fontSize: 26, color: U.mut}}>{b}</div></div>
        </div>
      ))}
    </Card>
    <Tile size={220} style={{left: 740, top: 1000, transform: `scale(${pop(f - 8, 12)})`}}><div style={{fontFamily: FONT, fontWeight: 900, fontSize: 80, color: U.blue}}>AI</div></Tile>
    <div style={{position: 'absolute', left: 860, top: 960, transform: `scale(${no}) rotate(8deg)`, background: U.red, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: '10px 22px', borderRadius: 18, boxShadow: '0 14px 30px rgba(224,57,62,0.4)'}}>no $ figures</div>
  </>);
};
const Calendar = ({f, w}) => {
  const n = Math.round(lerp(f, w('thirty') - 6, w('thirty') + 30, 0, 30));
  return (<>
    <Card style={{left: 140, top: 680, width: 800, padding: '40px 44px', opacity: out3(f, 10)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 46}}>Test your top match</div>
        <div style={{fontWeight: 900, fontSize: 46, color: U.blue}}>{n}/30</div>
      </div>
      <div style={{marginTop: 8, fontWeight: 600, fontSize: 30, color: U.mut}}>A starting point, not a promise</div>
      <div style={{marginTop: 30, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12}}>
        {Array.from({length: 30}, (_, i) => (
          <div key={i} style={{height: 84, borderRadius: 18, background: i < n ? U.blue : '#F4F1ED', color: i < n ? '#fff' : U.mut, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${i === n - 1 ? 1.08 : 1})`}}>{i + 1}</div>
        ))}
      </div>
    </Card>
    <Chip bg={U.redSoft} color={U.red} style={{left: 110, top: 610, fontWeight: 900, transform: `scale(${pop(f - w('catch') + 6, 10)})`}}>The catch</Chip>
  </>);
};
const Cta = ({f, w, s}) => {
  const kw = s.keyword || 'FINDER'; const fol = f - w('follow');
  return (<>
    <Card style={{left: 110, top: 660, width: 860, padding: '34px 36px', opacity: out3(f, 10)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        <div style={{width: 76, height: 76, borderRadius: 38, background: '#E8DED3'}} />
        <div style={{flex: 1, height: 96, borderRadius: 48, border: `3px solid ${U.line}`, display: 'flex', alignItems: 'center', padding: '0 34px', fontWeight: 900, fontSize: 52, letterSpacing: 2}}>
          <Typed text={kw} p={lerp(f, w('comment'), w(kw) + 6, 0, 1)} />
        </div>
        <div style={{width: 96, height: 96, borderRadius: 48, background: U.blue, color: '#fff', fontWeight: 900, fontSize: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>↑</div>
      </div>
      <div style={{marginTop: 18, fontWeight: 600, fontSize: 30, color: U.mut}}>Comment {kw} for the free guide</div>
    </Card>
    <Card style={{left: 110, top: 960, width: 860, padding: '30px 36px', display: 'flex', alignItems: 'center', gap: 24, opacity: ease(f - w('try') + 6, 10), transform: `translateY(${(1 - ease(f - w('try') + 6, 10)) * 30}px)`}}>
      <Mark size={84} /><div><div style={{fontWeight: 900, fontSize: 44}}>subcreatorpaid.com</div><div style={{fontWeight: 600, fontSize: 28, color: U.mut}}>Free guide + AI Income Finder</div></div>
    </Card>
    <Chip style={{left: 110, top: 1180, opacity: ease(f - w('tools') + 6, 8)}}>Tools I use: link in bio · Affiliate link</Chip>
    <div style={{position: 'absolute', left: 300, top: 1280, width: 480, height: 110, borderRadius: 55, background: fol > 4 ? '#EDEAE6' : U.ink, color: fol > 4 ? U.ink : '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 42,
      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f - w('follow') + 10, 8), transform: `scale(${fol > 0 && fol < 6 ? 0.95 : 1})`, boxShadow: SHADOW}}>{fol > 4 ? 'Following' : 'Follow'}</div>
    <Cursor x={lerp(f, w('follow') - 14, w('follow'), 820, 600)} y={lerp(f, w('follow') - 14, w('follow'), 1500, 1330)} press={fol > 0 && fol < 6 ? 1 : 0} />
  </>);
};
const SHOTS = {guess: Guess, app: App, site: Site, typing: Typing, pick: Pick, scan: Scan, result: Result, proof: Proof, calendar: Calendar, cta: Cta};

// ---------- headline: the spoken line builds word by word at the top
const chunkWords = (beats) => {
  const all = []; beats.forEach((b, bi) => (b.words || []).forEach((w) => all.push({...w, bi, s: b.show})));
  const out = []; let cur = [];
  all.forEach((w, i) => {
    const p = all[i - 1];
    if (cur.length && (cur.length >= 6 || (cur.length >= 3 && /[.,:;?!]$/.test(p.w)) || w.bi !== p.bi || w.f - p.f > 16)) { out.push(cur); cur = []; }
    if (/\w/.test(w.w)) cur.push(w); else if (cur.length) cur[cur.length - 1] = {...cur[cur.length - 1], w: cur[cur.length - 1].w + w.w};
  });
  if (cur.length) out.push(cur);
  return out;
};
const Headline = ({beats}) => {
  const f = useCurrentFrame();
  const chunks = React.useMemo(() => chunkWords(beats), [beats]);
  let ci = -1; chunks.forEach((c, i) => { if (f >= c[0].f - 3) ci = i; });
  if (ci < 0) return null;
  const ch = chunks[ci]; const next = chunks[ci + 1]; const leave = next ? ease(f - next[0].f + 6, 4) : 0;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 260, height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: 1 - leave, filter: `blur(${leave * 8}px)`}}>
      <div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.12, letterSpacing: -2.5, color: U.ink}}>
        {ch.map((w, i) => {
          const t = f - w.f + 3; const p = ease(t, 7);
          const txt = String(w.w).replace(/\*/g, ''); const c = clean(txt); const S = w.s || {};
          const has = (k) => (S[k] || []).map(clean).includes(c);
          const money = /^\$/.test(c) || has('green');
          const st = {display: 'inline-block', marginRight: 20, opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 12}px)`};
          if (has('red')) return <span key={i} style={{...st, color: '#fff', background: U.red, borderRadius: 16, padding: '0 16px'}}>{txt}</span>;
          if (has('hl')) return <span key={i} style={{...st, color: U.serif, background: `rgba(248,220,203,${p})`, borderRadius: 14, padding: '0 12px'}}>{txt}</span>;
          if (has('serif')) return <span key={i} style={{...st, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: U.serif, fontSize: '1.02em', letterSpacing: -1}}>{txt}</span>;
          if (has('blue')) return <span key={i} style={{...st, color: U.blue}}>{txt}</span>;
          if (money) return <span key={i} style={{...st, color: U.green}}>{txt}</span>;
          return <span key={i} style={st}>{txt}</span>;
        })}
      </div>
    </div>
  );
};

// ---------- shots with a focus pull between them
const Shot = ({b, i, start, len, last}) => {
  const f = useCurrentFrame();
  const w = (k) => { const ws = b.words || []; const hit = ws.find((x) => clean(x.w) === clean(k)) || ws.find((x) => clean(x.w).startsWith(clean(k))); return (hit ? hit.f : b.speakFrom) - start; };
  const S = SHOTS[b.show.type] || App;
  const inn = i === 0 ? 1 : ease(f, OV); const out = last ? 0 : ease(f - (len - OV), OV);
  const drift = lerp(f, 0, len, 1, 1.025);
  return (
    <AbsoluteFill style={{opacity: Math.min(inn, 1 - out), filter: `blur(${(1 - inn) * 18 + out * 18}px)`, transform: `scale(${drift * (1.06 - 0.06 * inn) * (1 - 0.05 * out)})`}}>
      <S f={f} w={w} s={b.show} len={len} />
    </AbsoluteFill>
  );
};

export const SoftUI = ({beats = [], handle = '@subcreatorpaid', total = 90}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: U.bg, overflow: 'hidden', fontFamily: FONT}}>
      <Fonts /><SerifFont />
      <AbsoluteFill style={{background: `radial-gradient(38% 26% at ${30 + Math.sin(f / 90) * 6}% ${78 + Math.cos(f / 110) * 4}%, rgba(246,196,176,0.55), transparent 70%),
        radial-gradient(34% 24% at ${80 + Math.cos(f / 100) * 5}% ${20 + Math.sin(f / 80) * 4}%, rgba(242,198,200,0.45), transparent 70%),
        radial-gradient(40% 28% at ${75 + Math.sin(f / 120) * 5}% 92%, rgba(205,220,234,0.6), transparent 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, transparent 60%, rgba(120,90,70,0.10))'}} />
      {beats.map((b, i) => {
        const start = Math.max(0, b.from - (i ? OV : 0));
        const end = i + 1 < beats.length ? beats[i + 1].from + 2 : total;
        return <Sequence key={i} from={start} durationInFrames={Math.max(1, end - start)}><Shot b={b} i={i} start={start} len={Math.max(1, end - start)} last={i === beats.length - 1} /></Sequence>;
      })}
      <Headline beats={beats} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1600, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 32, color: U.ink, opacity: 0.5}}>{handle}</div>
      <Audio src={staticFile('voice.wav')} />
    </AbsoluteFill>
  );
};
