import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

const SPIN_SOUND_URL = '/sounds/roletrando.mp3';

export function useSpinSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpinSound = useCallback(() => {
    // read at call time so the callback identity stays stable across setting changes
    if (!useSettingsStore.getState().soundEnabled) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(SPIN_SOUND_URL);
    }
    audioRef.current.currentTime = 0;
    // rejection swallowed: sound must never break the spin
    audioRef.current.play().catch(() => {});
  }, []);

  return { playSpinSound };
}
