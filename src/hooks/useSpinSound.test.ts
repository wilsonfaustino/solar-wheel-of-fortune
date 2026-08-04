import { renderHook } from '@testing-library/react';
import { useSettingsStore } from '../stores/useSettingsStore';
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
    useSettingsStore.setState({ soundEnabled: false });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useSettingsStore.setState({ soundEnabled: false });
  });

  it('does not create or play audio when the sound setting is off', () => {
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(0);
    expect(playMock).not.toHaveBeenCalled();
  });

  it('creates audio with the sound URL and plays when the sound setting is on', () => {
    useSettingsStore.setState({ soundEnabled: true });
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/sounds/roletrando.mp3');
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('picks up a setting change without re-rendering the hook', () => {
    const { result } = renderHook(() => useSpinSound());
    const initialCallback = result.current.playSpinSound;

    result.current.playSpinSound();
    expect(playMock).not.toHaveBeenCalled();

    useSettingsStore.setState({ soundEnabled: true });
    result.current.playSpinSound();

    expect(playMock).toHaveBeenCalledTimes(1);
    expect(result.current.playSpinSound).toBe(initialCallback);
  });

  it('reuses a single audio instance and resets currentTime on replay', () => {
    useSettingsStore.setState({ soundEnabled: true });
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    result.current.playSpinSound();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('does not throw when play is rejected by the browser', () => {
    useSettingsStore.setState({ soundEnabled: true });
    playMock.mockRejectedValue(new Error('autoplay blocked'));
    const { result } = renderHook(() => useSpinSound());
    expect(() => result.current.playSpinSound()).not.toThrow();
  });

  it('ignores the legacy ff=sound url flag', () => {
    window.history.replaceState(null, '', '/?ff=sound');
    const { result } = renderHook(() => useSpinSound());
    result.current.playSpinSound();
    expect(playMock).not.toHaveBeenCalled();
    window.history.replaceState(null, '', '/');
  });
});
