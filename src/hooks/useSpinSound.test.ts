import { renderHook } from '@testing-library/react';
import { useSpinSound } from './useSpinSound';

describe('useSpinSound', () => {
  const playMock = vi.fn();
  let audioInstances: Array<{ src: string; play: typeof playMock; currentTime: number }>;

  beforeEach(() => {
    playMock.mockReset().mockResolvedValue(undefined);
    audioInstances = [];
    vi.stubGlobal(
      'Audio',
      // biome-ignore lint/complexity/useArrowFunction: mock must be constructable (called with `new Audio(...)`)
      vi.fn(function (src: string) {
        const audioInstance = { src, play: playMock, currentTime: -1 };
        audioInstances.push(audioInstance);
        return audioInstance;
      })
    );
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('does not create or play audio when flag is absent', () => {
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });

  it('creates audio with the sound URL and plays when ?ff=sound', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/roletrando.mp3');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('recognizes the flag inside a comma-separated list', () => {
    window.history.replaceState(null, '', '/?ff=other,sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('reuses a single audio instance and resets currentTime on replay', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does not throw when play is rejected by the browser', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    playMock.mockRejectedValue(new Error('autoplay blocked'));
    const { result } = renderHook(() => useSpinSound());
    expect(() => result.current.playSpinSound()).not.toThrow();
  });
});
