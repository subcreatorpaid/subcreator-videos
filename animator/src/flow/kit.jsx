// Shared motion kit for the "flow" films (owner's animation prompts, 29 Oct 2026). Everything is a pure function of the
// frame number: closed-form springs, exponential ease-outs, keyframe tables, a log-space camera, text that rises from a
// mask line, a natural typing rhythm from seeded hashes (no Math.random), one macOS-style cursor.
import React from 'react';
import {useCurrentFrame} from 'remotion';

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const mix = (a, b, t) => a + (b - a) * t;
// Exponential ease-out: covers ~k of the remaining distance per frame.
export const expo = (t, d) => (t <= 0 ? 0 : t >= d ? 1 : (1 - Math.pow(2, -10 * t / d)) / (1 - Math.pow(2, -10)));
export const expoIn = (t, d) => (t <= 0 ? 0 : t >= d ? 1 : Math.pow(2, 10 * (t / d - 1)) - Math.pow(2, -10));
export const inOut = (t, d) => { const x = clamp01(t / d); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
// Closed-form under-damped step response (a spring that settles, no overshoot beyond ~4%).
export const spring = (t, {w = 0.32, z = 0.82} = {}) => {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
};
// Keyframe table: kf(f, [[f0, v0], [f1, v1], ...], ease) with per-segment easing.
export const kf = (f, table, ease = inOut) => {
  if (f <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    const [f1, v1] = table[i]; const [f0, v0] = table[i - 1];
    if (f <= f1) return mix(v0, v1, ease === 'lin' ? (f - f0) / (f1 - f0) : ease(f - f0, f1 - f0));
  }
  return table[table.length - 1][1];
};
// Seeded hash in 0..1 (deterministic per index).
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Word timing helper from prep.py beats: W(i, 'word') -> global frame of that word in beat i (else the beat's speech start).
export const useTimes = (beats) => {
  const clean = (s) => String(s).replace(/[^\w$%.'-]/g, '').replace(/\.$/, '').toLowerCase();
  const B = (i) => (beats[i] ? beats[i].from : 0);
  const W = (i, k) => {
    const b = beats[i]; if (!b) return 0;
    const ws = b.words || []; const hit = ws.find((x) => clean(x.w) === clean(k)) || ws.find((x) => clean(x.w).startsWith(clean(k)));
    return hit ? hit.f : b.speakFrom;
  };
  const E = (i) => (beats[i + 1] ? beats[i + 1].from : (beats[i] ? beats[i].from + beats[i].frames : 0));
  return {B, W, E};
};

// Camera: one transform on the world container. track = [[frame, zoom, x, y], ...]; zoom interpolated in log space.
export const camera = (f, track, ease = inOut) => {
  const z = Math.exp(kf(f, track.map(([t, zz]) => [t, Math.log(zz)]), ease));
  const x = kf(f, track.map(([t, , xx]) => [t, xx]), ease);
  const y = kf(f, track.map(([t, , , yy]) => [t, yy]), ease);
  return {z, x, y, css: `translate(540px, 960px) scale(${z}) translate(${-x}px, ${-y}px)`};
};

// Text that rises from a mask line (each word staggered).
export const Rise = ({text, at, f, size = 80, weight = 700, color = '#0E0E10', font, stagger = 2, style = {}, lh = 1.12}) => {
  const words = String(text).split(' ');
  return (
    <div style={{fontFamily: font, fontSize: size, fontWeight: weight, color, lineHeight: lh, letterSpacing: -size * 0.03, ...style}}>
      {words.map((w, i) => {
        const p = expo(f - at - i * stagger, 14);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', marginRight: size * 0.24, paddingBottom: size * 0.08}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 110}%)`}}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};
// Natural typing: n characters shown at frame f, starting at `at`, ~1 char/frame with small seeded pauses.
export const typedCount = (f, at, len, seed = 1, speed = 1) => {
  let t = at; let n = 0;
  while (n < len) { t += (1 + (hash(seed + n) < 0.28 ? 1 + Math.floor(hash(seed * 7 + n) * 2) : 0)) / speed; if (t > f) break; n++; }
  return n;
};
export const Cursor = ({x, y, s = 1, rot = 0, halo = null}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${s})`, transformOrigin: '4px 4px', zIndex: 50}}>
    {halo && <div style={{position: 'absolute', left: -38, top: -38, width: 84, height: 84, borderRadius: 42, background: halo, opacity: 0.35}} />}
    <svg width="44" height="54" viewBox="0 0 27 33" style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.28))'}}>
      <path d="M2 2 L2 26 L8.5 20 L13 30 L17 28 L12.5 18.5 L21 18.5 Z" fill="#0E0E10" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  </div>
);
export const useF = () => useCurrentFrame();
