// The three "flow" films (owner's animation prompts, 29 Oct 2026). Spec "style": launch | keynote | showreel.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../Short';
import {Launch} from './Launch';
import {Keynote} from './Keynote';
import {Reel} from './Reel';
import {Motion} from './Motion';

export const Flow = (p) => (
  <AbsoluteFill>
    <Fonts />
    {p.style === 'launch' ? <Launch {...p} /> : p.style === 'keynote' ? <Keynote {...p} /> : p.style === 'motion' ? <Motion {...p} /> : <Reel {...p} />}
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
