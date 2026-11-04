// The three "flow" films (owner's animation prompts, 29 Oct 2026). Spec "style": launch | keynote | showreel | overview | fluid.
import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../Short';
import {Launch} from './Launch';
import {Keynote} from './Keynote';
import {Reel} from './Reel';
import {Overview} from './Overview';
import {Motion} from './Motion';
import {Fluid} from './Fluid';
import {FluidKit} from './FluidKit';

export const Flow = (p) => (
  <AbsoluteFill>
    <Fonts />
    {p.style === 'fluid' && (p.beats || []).some((b) => b.show && b.show.scene) ? <FluidKit {...p} /> : p.style === 'fluid' ? <Fluid {...p} /> : p.style === 'overview' ? <Overview {...p} /> : p.style === 'launch' ? <Launch {...p} /> : p.style === 'keynote' ? <Keynote {...p} /> : p.style === 'motion' ? <Motion {...p} /> : <Reel {...p} />}
    <Audio src={staticFile('voice.wav')} />
  </AbsoluteFill>
);
