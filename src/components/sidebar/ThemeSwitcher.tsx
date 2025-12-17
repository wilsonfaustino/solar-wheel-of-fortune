import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { THEMES } from '../../constants/themes';
import { useNameStore } from '../../stores/useNameStore';
import type { Theme } from '../../types/theme';
import { cn } from '../../utils/cn';

function ThemeSwitcherComponent() {
  const { currentTheme, setTheme } = useNameStore(
    useShallow((state) => ({
      currentTheme: state.currentTheme,
      setTheme: state.setTheme,
    }))
  );

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      setTheme(theme);
    },
    [setTheme]
  );

  const themeList: Theme[] = ['cyan', 'matrix', 'sunset'];

  return (
    <div className="px-4 py-4 border-b border-b-white/10">
      <div className="text-xs font-mono tracking-wider mb-3 text-text/70">THEME</div>
      <div className="flex gap-2">
        {themeList.map((theme) => (
          <button
            type="button"
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={cn(
              'flex-1 px-3 py-2 font-mono text-xs tracking-wider transition-colors border',
              currentTheme === theme
                ? 'border-accent bg-accent-10 text-accent opacity-100'
                : 'border-white/20 bg-transparent text-text opacity-50 hover:opacity-70 hover:bg-white/5'
            )}
            aria-pressed={currentTheme === theme}
          >
            {THEMES[theme].name}
          </button>
        ))}
      </div>
    </div>
  );
}

export const ThemeSwitcher = memo(ThemeSwitcherComponent);
