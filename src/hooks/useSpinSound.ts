import { useCallback, useRef } from 'react';

const SPIN_SOUND_URL = '/sounds/roletrando.mp3';

function isSoundEnabled(): boolean {
  const featureFlags = new URLSearchParams(window.location.search).get('ff');
  return featureFlags?.split(',').includes('sound') ?? false;
}

export function useSpinSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpinSound = useCallback(() => {
    if (!isSoundEnabled()) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(SPIN_SOUND_URL);
    }
    audioRef.current.currentTime = 0;
    // rejection swallowed: sound must never break the spin
    audioRef.current.play().catch(() => {});
  }, []);

  return { playSpinSound };
}
