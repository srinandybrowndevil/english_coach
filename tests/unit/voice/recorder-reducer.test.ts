import { describe, expect, it } from 'vitest';
import { recorderReducer, type RecorderStatus } from '@/hooks/useRecorder';

describe('recorder state machine', () => {
  it('idle → requesting → recording → stopped', () => {
    let s: RecorderStatus = 'idle';
    s = recorderReducer(s, { type: 'start' });
    expect(s).toBe('requesting');
    s = recorderReducer(s, { type: 'recording' });
    expect(s).toBe('recording');
    s = recorderReducer(s, { type: 'stop' });
    expect(s).toBe('stopped');
  });

  it('never starts two recorders: start ignored while requesting/recording', () => {
    expect(recorderReducer('requesting', { type: 'start' })).toBe('requesting');
    expect(recorderReducer('recording', { type: 'start' })).toBe('recording');
  });

  it('pause/resume only valid while recording', () => {
    expect(recorderReducer('idle', { type: 'pause' })).toBe('idle');
    expect(recorderReducer('recording', { type: 'pause' })).toBe('paused');
    expect(recorderReducer('paused', { type: 'resume' })).toBe('recording');
    expect(recorderReducer('paused', { type: 'stop' })).toBe('stopped');
  });

  it('denied and unsupported are terminal until retried', () => {
    expect(recorderReducer('requesting', { type: 'denied' })).toBe('denied');
    expect(recorderReducer('requesting', { type: 'unsupported' })).toBe('unsupported');
    expect(recorderReducer('denied', { type: 'start' })).toBe('denied');
    expect(recorderReducer('stopped', { type: 'reset' })).toBe('idle');
    expect(recorderReducer('idle', { type: 'start' })).toBe('requesting');
  });

  it('reset returns to idle from any state', () => {
    for (const s of ['recording', 'paused', 'error', 'denied'] as RecorderStatus[])
      expect(recorderReducer(s, { type: 'reset' })).toBe('idle');
  });
});
