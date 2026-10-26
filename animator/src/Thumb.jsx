import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT, Fonts} from './Short';
import {Face, RED} from './graphics';

// Cover / thumbnail, 1080x1920 (Reels, TikTok, Shorts). Rules: brain/brand.md visuals + docs/animator-rules.md
// - everything that matters sits in the centre 4:5 crop (y 285-1635) so the Instagram grid shows it
// - one green focal element, a 2-5 word headline at 120 px or more, nothing below y = 1536 except the handle
// "*word*" in a headline = the green focal word
const Head = ({text, size = 150}) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 0.98, letterSpacing: '-0.045em', color: C.ink, textAlign: 'center'}}>
    {String(text).split('\n').map((line, i) => (
      <div key={i}>{line.split(/(\*[^*]+\*|~[^~]+~|\^[^^]+\^)/).filter(Boolean).map((p, j) => /^[*~^]/.test(p)
        ? <span key={j} style={{color: '#fff', background: p[0] === '*' ? C.acc : p[0] === '~' ? RED : C.ink, borderRadius: 18, padding: '0 22px', boxDecorationBreak: 'clone'}}>{p.slice(1, -1)}</span>
        : <span key={j}>{p}</span>)}</div>
    ))}
  </div>
);

const Card = ({children, style = {}}) => (
  <div style={{background: C.card, border: `5px solid ${C.ink}`, borderRadius: 34, boxShadow: '0 24px 80px rgba(21,21,21,0.16)', ...style}}>{children}</div>
);
const Tag = ({text, style = {}}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#5F5E58', background: C.bg, border: `2px solid ${C.line}`, borderRadius: 8, padding: '2px 10px', ...style}}>{text}</div>
);

const Heroes = {
  // a creator dashboard with a big $0.00 (views/earnings myths)
  dashboard: ({h}) => (
    <Card style={{width: 820, padding: '40px 50px', position: 'relative', transform: 'rotate(-2deg)'}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '.14em', color: '#5F5E58'}}>YOUR CREATOR DASHBOARD</div>
      {(h.rows || []).map(([k, v], i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, borderBottom: `3px solid ${C.line}`, paddingBottom: 14}}>
          <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>{k}</span>
          <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 74, color: C.ink}}>{v}</span>
        </div>
      ))}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24}}>
        <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.ink}}>Earned</span>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#fff', background: C.ink, borderRadius: 18, padding: '4px 26px'}}>{h.earned || '$0.00'}</span>
      </div>
    </Card>
  ),
  // a phone playing an invented UGC ad + sticker
  phone: ({h}) => (
    <div style={{position: 'relative', transform: 'rotate(-4deg)'}}>
      <div style={{width: 420, height: 660, borderRadius: 56, background: C.ink, padding: 15, boxShadow: '18px 18px 0 rgba(21,21,21,.16)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 46, background: 'linear-gradient(170deg,#F3E9DC,#FBF7F1)', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 60, left: 26, background: C.ink, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 28, borderRadius: 8, padding: '4px 14px'}}>Ad</div>
          <svg width="390" height="370" viewBox="0 0 300 300" style={{position: 'absolute', top: 140, left: 0}}>
            <g transform="translate(150 120)"><rect x="-30" y="-80" width="60" height="110" rx="16" fill={C.ink} /><rect x="-16" y="-104" width="32" height="28" rx="7" fill={C.ink} /><rect x="-20" y="-46" width="40" height="24" rx="5" fill="#fff" /></g>
            <rect x="60" y="170" width="180" height="90" rx="10" fill="#C79A6B" stroke={C.ink} strokeWidth="5" /><rect x="140" y="170" width="20" height="90" fill={C.ink} opacity=".35" />
          </svg>
          <div style={{position: 'absolute', bottom: 60, left: 30, right: 30, background: C.ink, color: '#fff', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, borderRadius: 14, padding: '14px 0'}}>Shop now</div>
        </div>
      </div>
      {h.sticker && <div style={{position: 'absolute', right: -150, top: 230, transform: 'rotate(9deg)', background: C.card, color: C.ink, border: `5px solid ${C.ink}`, borderRadius: 20,
        padding: '16px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 48, boxShadow: '0 16px 50px rgba(21,21,21,0.18)', whiteSpace: 'nowrap'}}>{h.sticker}</div>}
    </div>
  ),
  // the recurring creator face acting the topic, with a sticker (red = loss/warning, green = money, else black)
  face: ({h}) => (
    <div style={{position: 'relative', width: 760, height: 700}}>
      <div style={{position: 'absolute', left: 0, top: 0}}><Face mood={h.mood ?? 0.6} f={0} size={560} hold={h.hold ?? null} /></div>
      {h.sticker && <div style={{position: 'absolute', right: -40, top: 40, transform: 'rotate(8deg)', background: h.sticker_color === 'red' ? RED : h.sticker_color === 'green' ? C.acc : C.ink, color: '#fff',
        borderRadius: 26, padding: '18px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 64, whiteSpace: 'nowrap',
        boxShadow: h.sticker_color === 'red' ? '0 0 70px rgba(217,58,58,0.45)' : h.sticker_color === 'green' ? '0 0 70px rgba(46,125,79,0.45)' : '0 20px 60px rgba(21,21,21,0.25)'}}>{h.sticker}</div>}
    </div>
  ),
  // a big struck-out number next to the real one (requirements myths)
  strike: ({h}) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
      <div style={{position: 'relative', fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#B9B6AE', letterSpacing: '-0.04em'}}>{h.old}
        <div style={{position: 'absolute', left: -10, right: -10, top: '50%', height: 18, background: C.ink, borderRadius: 9, transform: 'rotate(-6deg)'}} /></div>
      <Card style={{padding: '24px 40px', textAlign: 'center', transform: 'rotate(2deg)'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 140, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1}}>{h.real}</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#5F5E58'}}>{h.real_sub}</div>
      </Card>
    </div>
  ),
};

export const Thumb = ({thumb = {}}) => {
  const Hero = Heroes[thumb.hero] || Heroes.dashboard;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Fonts />
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: '72px 72px',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, black 95%)'}} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: thumb.top || 330, gap: 64}}>
        <Head text={thumb.headline || ''} size={thumb.size || 150} />
        <Hero h={thumb} />
        {thumb.chip && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: '#fff', background: C.ink, borderRadius: 999, padding: '16px 40px'}}>{thumb.chip}</div>}
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#8A887F'}}>@subcreatorpaid</div>
    </AbsoluteFill>
  );
};
