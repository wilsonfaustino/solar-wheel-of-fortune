import { X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { daysBetween } from '../../utils/cycle';
import { toLocalISODay } from '../../utils/name';

const CLAUDE_CODE_LOST_ON = '2026-09-30';

const MASCOTS = [
  { src: '/mascots/claude-sob.png', alt: 'ClaudeCode mascot crying' },
  { src: '/mascots/claude-fail.png', alt: 'ClaudeCode mascot failed' },
];

function MemorialBannerComponent() {
  const memorialBannerEnabled = useSettingsStore((state) => state.memorialBannerEnabled);
  const setMemorialBannerEnabled = useSettingsStore((state) => state.setMemorialBannerEnabled);
  const [mascot] = useState(
    () => MASCOTS[crypto.getRandomValues(new Uint32Array(1))[0] % MASCOTS.length]
  );
  const [today, setToday] = useState(() => toLocalISODay(new Date()));

  useEffect(() => {
    const nextMidnight = new Date(`${today}T00:00`);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    const timer = setTimeout(
      () => setToday(toLocalISODay(new Date())),
      nextMidnight.getTime() - Date.now()
    );
    return () => clearTimeout(timer);
  }, [today]);

  if (!memorialBannerEnabled) return null;

  const daysWithout = daysBetween(CLAUDE_CODE_LOST_ON, today);

  return (
    <div
      data-testid="memorial-banner"
      className="pointer-events-auto hidden items-stretch border border-accent bg-black/90 font-mono md:[@media(min-height:700px)]:flex"
    >
      <div className="flex flex-col items-center justify-center gap-0.5 border-r border-accent px-4 py-2.5">
        <span className="text-[44px] font-medium leading-none text-accent">
          {String(daysWithout).padStart(2, '0')}
        </span>
        <span className="text-[10px] tracking-[0.2em] text-text/40">DAYS</span>
      </div>
      <div className="flex flex-col justify-center gap-1.5 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <img src={mascot.src} alt={mascot.alt} className="size-7 object-contain" />
          <span className="text-[10px] tracking-[0.2em] text-text/40">HAPPENING NOW</span>
        </div>
        <span className="text-sm tracking-[0.14em] text-text">WITHOUT CLAUDECODE</span>
        <span className="text-[10px] tracking-[0.12em] text-text/40">
          SINCE {CLAUDE_CODE_LOST_ON}
        </span>
      </div>
      <Button
        variant="tech-ghost"
        size="icon-sm"
        aria-label="Dismiss memorial banner"
        className="self-start"
        onClick={() => setMemorialBannerEnabled(false)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

export const MemorialBanner = memo(MemorialBannerComponent);
