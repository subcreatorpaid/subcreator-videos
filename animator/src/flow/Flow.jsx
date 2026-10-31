// The three "flow" films (owner's animation prompts, 29 Oct 2026). Spec "style": launch | keynote | showreel | overview.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../Short';
import {Launch} from './Launch';
import {Keynote} from './Keynote';
import {Reel} from './Reel';
<<<<<<< HEAD
import {Overview} from './Overview';
=======
import {Motion} from './Motion';
>>>>>>> origin/main

export const Flow = (p) => (
  <AbsoluteFill>
    <Fonts />
<<<<<<< HEAD
    {p.style === 'overview' ? <Overview {...p} /> : p.style === 'launch' ? <Launch {...p} /> : p.style === 'keynote' ? <Keynote {...p} /> : <Reel {...p} />}
=======
    {p.style === 'launch' ? <Launch {...p} /> : p.style === 'keynote' ? <Keynote {...p} /> : p.style === 'motion' ? <Motion {...p} /> : <Reel {...p} />}
>>>>>>> origin/main
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
