import React from 'react';
import {Composition} from 'remotion';
import {Short} from './Short';
import {Thumb} from './Thumb';
import {Sample} from './Samples';
import {Story} from './Story';
import {Mock} from './Mocks';
import {SoftUI} from './SoftUI';
import {Flow} from './flow/Flow';

// spec "style": "story" uses the Story renderer (owner pick, 26 Oct 2026); everything else uses Short.
const Video = (p) => (['launch', 'keynote', 'showreel', 'overview'].includes(p.style) ? <Flow {...p} /> : p.style === 'softui' ? <SoftUI {...p} /> : p.style === 'story' ? <Story {...p} /> : <Short {...p} />);

const sample = {slug: 'sample', handle: '@subcreatorpaid', fps: 30, total: 90, beats: [
  {say: 'Sample', from: 0, frames: 90, speakFrom: 10, speakFrames: 60, show: {type: 'hook', lines: ['Going viral', "*WON'T PAY* you yet", 'the real numbers']}},
]};

export const Root = () => (
  <>
  <Composition id="Sample" component={Sample} width={1080} height={1920} fps={30} durationInFrames={150} defaultProps={{n: 1}} />
  <Composition id="Mock" component={Mock} width={1080} height={1920} fps={30} durationInFrames={90} defaultProps={{n: 1, beats: [], total: 90}}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(30, props.total || 90)})} />
  <Composition id="Thumb" component={Thumb} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{thumb: {}}} />
  <Composition
    id="Short"
    component={Video}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={90}
    defaultProps={sample}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(30, props.total || 90), fps: props.fps || 30})}
  />
  </>
);
