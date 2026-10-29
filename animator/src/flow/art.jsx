// Drawn elements for the "flow" films (owner, 29 Oct 2026: "update the graphics and elements as well"): flat-shaded
// SVG illustrations instead of letter glyphs, one per income stream, plus small UI pieces (avatar, waveform, ring,
// coin, check). Other companies' marks are never drawn; streams are shown by what you make, not by a logo.
import React from 'react';

// Creator avatar: same friendly cartoon face as the rest of the channel (round head, dot eyes, smile), cooking hat.
export const Avatar = ({size = 120, hat = true, bg = '#FFD9B8'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill={bg} />
    {hat && <g><rect x="30" y="14" width="40" height="16" rx="4" fill="#fff" stroke="#0E0E10" strokeWidth="3" /><circle cx="36" cy="14" r="9" fill="#fff" stroke="#0E0E10" strokeWidth="3" /><circle cx="50" cy="9" r="10" fill="#fff" stroke="#0E0E10" strokeWidth="3" /><circle cx="64" cy="14" r="9" fill="#fff" stroke="#0E0E10" strokeWidth="3" /><rect x="31" y="15" width="38" height="12" fill="#fff" /></g>}
    <circle cx="50" cy="58" r="26" fill="#F2B98C" stroke="#0E0E10" strokeWidth="3" />
    <circle cx="41" cy="55" r="3.4" fill="#0E0E10" /><circle cx="59" cy="55" r="3.4" fill="#0E0E10" />
    <path d="M41 66 Q50 74 59 66" stroke="#0E0E10" strokeWidth="3.2" fill="none" strokeLinecap="round" />
  </svg>
);

// Stream art, each fits a 1:1 box. Palette per art is passed so a film can keep its own colours.
export const StreamArt = ({kind, size = 300, p = {}}) => {
  const ink = p.ink || '#0E0E10', a = p.a || '#CDF24F', b = p.b || '#FFFFFF', c = p.c || '#2F6BFF';
  const S = (children) => <svg width={size} height={size} viewBox="0 0 200 200">{children}</svg>;
  if (kind === 'etsy') return S(<g>
    <rect x="50" y="30" width="100" height="135" rx="8" fill={b} stroke={ink} strokeWidth="5" />
    <rect x="64" y="46" width="72" height="34" rx="4" fill={a} /><rect x="64" y="90" width="72" height="8" rx="4" fill={ink} opacity="0.8" />
    <rect x="64" y="106" width="56" height="8" rx="4" fill={ink} opacity="0.35" /><rect x="64" y="122" width="64" height="8" rx="4" fill={ink} opacity="0.35" />
    <rect x="110" y="128" width="62" height="40" rx="10" fill={c} /><text x="141" y="155" textAnchor="middle" fontFamily="InterX" fontWeight="900" fontSize="20" fill="#fff">PDF</text>
  </g>);
  if (kind === 'amazon') return S(<g>
    <path d="M40 80 L100 55 L160 80 L160 150 L100 175 L40 150 Z" fill={p.box || '#E9B97A'} stroke={ink} strokeWidth="5" strokeLinejoin="round" />
    <path d="M40 80 L100 105 L160 80 M100 105 L100 175" stroke={ink} strokeWidth="5" fill="none" strokeLinejoin="round" />
    <path d="M66 67 L126 92 L126 112" stroke={ink} strokeWidth="5" fill="none" opacity="0.5" />
    <circle cx="150" cy="52" r="26" fill={a} stroke={ink} strokeWidth="5" /><text x="150" y="61" textAnchor="middle" fontFamily="InterX" fontWeight="900" fontSize="26" fill={ink}>%</text>
  </g>);
  if (kind === 'fiverr') return S(<g>
    <rect x="30" y="45" width="140" height="110" rx="14" fill={b} stroke={ink} strokeWidth="5" />
    <rect x="30" y="45" width="140" height="48" rx="14" fill={c} /><rect x="30" y="80" width="140" height="13" fill={c} />
    <circle cx="58" cy="118" r="12" fill={a} stroke={ink} strokeWidth="4" /><rect x="78" y="110" width="70" height="7" rx="3.5" fill={ink} /><rect x="78" y="124" width="46" height="7" rx="3.5" fill={ink} opacity="0.4" />
    <path d="M70 70 l10 -14 l10 14 z" fill="#fff" /><circle cx="118" cy="66" r="9" fill="#fff" />
  </g>);
  if (kind === 'ugc') return S(<g>
    <rect x="58" y="22" width="84" height="156" rx="16" fill={ink} /><rect x="64" y="34" width="72" height="132" rx="10" fill={c} />
    <rect x="86" y="70" width="28" height="62" rx="8" fill={a} stroke={ink} strokeWidth="4" /><rect x="92" y="60" width="16" height="12" rx="3" fill={ink} />
    <circle cx="100" cy="150" r="8" fill={p.rec || '#E5484D'} stroke="#fff" strokeWidth="3" />
    <rect x="72" y="42" width="30" height="10" rx="5" fill={p.rec || '#E5484D'} /><text x="87" y="50.5" textAnchor="middle" fontFamily="InterX" fontWeight="900" fontSize="8" fill={p.recInk || '#fff'}>REC</text>
  </g>);
  if (kind === 'voice') return S(<g>
    <rect x="76" y="28" width="48" height="84" rx="24" fill={b} stroke={ink} strokeWidth="5" />
    <path d="M58 96 Q58 136 100 136 Q142 136 142 96" stroke={ink} strokeWidth="5" fill="none" /><path d="M100 136 L100 162 M76 166 L124 166" stroke={ink} strokeWidth="5" strokeLinecap="round" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={20 + i * 10} y={86 - [10, 22, 14, 6][i]} width="6" height={[20, 44, 28, 12][i]} rx="3" fill={a} />)}
    {[0, 1, 2, 3].map((i) => <rect key={'r' + i} x={150 + i * 10} y={86 - [6, 14, 22, 10][i]} width="6" height={[12, 28, 44, 20][i]} rx="3" fill={a} />)}
  </g>);
  return null;
};

export const Waveform = ({f, n = 22, w = 300, h = 80, color = '#0E0E10', seed = 1}) => (
  <svg width={w} height={h}>
    {Array.from({length: n}, (_, i) => {
      const v = 0.25 + 0.75 * Math.abs(Math.sin(f * 0.22 + i * 0.9 + seed) * Math.cos(f * 0.13 + i * 0.37));
      const bw = w / n * 0.55;
      return <rect key={i} x={i * (w / n)} y={(h - v * h) / 2} width={bw} height={v * h} rx={bw / 2} fill={color} />;
    })}
  </svg>
);

export const Check = ({size = 60, color = '#0E0E10', p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6.5" stroke={color} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30" strokeDashoffset={30 * (1 - p)} /></svg>
);

// Simple drawn icons for menus and chips.
export const Icon = ({name, size = 44, color = '#0E0E10'}) => {
  const P = {
    search: <g><circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="2.4" fill="none" /><path d="M15.5 15.5 L21 21" stroke={color} strokeWidth="2.4" strokeLinecap="round" /></g>,
    spark: <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color} />,
    box: <g><path d="M3 7 L12 3 L21 7 L21 17 L12 21 L3 17 Z M3 7 L12 11 L21 7 M12 11 L12 21" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" /></g>,
    play: <path d="M7 4 L20 12 L7 20 Z" fill={color} />,
    star: <path d="M12 2.5 L14.9 8.6 L21.5 9.3 L16.6 13.8 L18 20.4 L12 17 L6 20.4 L7.4 13.8 L2.5 9.3 L9.1 8.6 Z" fill={color} />,
    cal: <g><rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="2" fill="none" /><path d="M3 10 H21 M8 3 V7 M16 3 V7" stroke={color} strokeWidth="2" strokeLinecap="round" /></g>,
    cart: <g><path d="M3 4 H6 L8.5 15 H18.5 L21 7 H7" stroke={color} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" /><circle cx="9.5" cy="19" r="1.6" fill={color} /><circle cx="17.5" cy="19" r="1.6" fill={color} /></g>,
    link: <g><path d="M10 14 L14 10" stroke={color} strokeWidth="2.2" strokeLinecap="round" /><path d="M8.5 11.5 L6.5 13.5 A3.5 3.5 0 0 0 11.5 18.5 L13.5 16.5 M15.5 12.5 L17.5 10.5 A3.5 3.5 0 0 0 12.5 5.5 L10.5 7.5" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{P[name]}</svg>;
};
