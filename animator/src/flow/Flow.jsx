// The three "flow" films (owner's animation prompts, 29 Oct 2026). Spec "style": launch | keynote | showreel | overview.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../Short';
import {Launch} from './Launch';
import {Keynote} from './Keynote';
import {Reel} from './Reel';
import {Overview} from './Overview';
import {Motion} from './Motion';
import {CaseFile} from './CaseFile';

export const Flow = (p) => (
  <AbsoluteFill>
    <Fonts />
    {p.style === 'casefile' ? <CaseFile {...p} /> : p.style === 'overview' ? <Overview {...p} /> : p.style === 'motion' ? <Motion {...p} /> : p.style === 'launch' ? <Launch {...p} /> : p.style === 'keynote' ? <Keynote {...p} /> : <Reel {...p} />}
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
