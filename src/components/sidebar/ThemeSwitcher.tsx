import * as RadioGroup from '@radix-ui/react-radio-group';
import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { THEMES } from '../../constants/themes';
import { useNameStore } from '../../stores/useNameStore';
import type { Theme } from '../../types/theme';

function ThemeSwitcherComponent() {
  const { currentTheme, setTheme } = useNameStore(
    useShallow((state) => ({
      currentTheme: state.currentTheme,
      setTheme: state.setTheme,
    }))
  );

  const themeList: Theme[] = ['cyan', 'matrix', 'sunset'];

  return (
    <div className="px-4 py-4 border-b border-b-white/10">
      <div className="text-xs font-mono tracking-wider mb-3 text-text/70">THEME</div>
      <RadioGroup.Root value={currentTheme} onValueChange={setTheme} className="flex gap-2">
        {themeList.map((theme) => (
          <RadioGroup.Item
            key={theme}
            value={theme}
            className={cn(
              'flex-1 px-3 py-2 font-mono text-xs tracking-wider transition-colors border',
              'data-[state=checked]:border-accent data-[state=checked]:bg-accent-10 data-[state=checked]:text-accent data-[state=checked]:opacity-100',
              'data-[state=unchecked]:border-white/20 data-[state=unchecked]:bg-transparent data-[state=unchecked]:text-text data-[state=unchecked]:opacity-50',
              'hover:opacity-70 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent/50'
            )}
          >
            {THEMES[theme].name}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}

export const ThemeSwitcher = memo(ThemeSwitcherComponent);
