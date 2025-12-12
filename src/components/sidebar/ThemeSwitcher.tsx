import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
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

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      setTheme(theme);
    },
    [setTheme]
  );

  const themeList: Theme[] = ['cyan', 'matrix', 'sunset'];

  return (
    <div
      className="px-4 py-4"
      style={{
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomWidth: '1px',
      }}
    >
      <div
        className="text-xs font-mono tracking-wider mb-3"
        style={{ color: 'var(--color-text)', opacity: 0.7 }}
      >
        THEME
      </div>
      <div className="flex gap-2">
        {themeList.map((theme) => (
          <button
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className="flex-1 px-3 py-2 font-mono text-xs tracking-wider transition-colors"
            style={{
              borderWidth: '1px',
              borderColor:
                currentTheme === theme ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: currentTheme === theme ? 'var(--color-accent-10)' : 'transparent',
              color: currentTheme === theme ? 'var(--color-accent)' : 'var(--color-text)',
              opacity: currentTheme === theme ? 1 : 0.5,
            }}
            aria-pressed={currentTheme === theme}
            onMouseEnter={(e) => {
              if (currentTheme !== theme) {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTheme !== theme) {
                e.currentTarget.style.opacity = '0.5';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {THEMES[theme].name}
          </button>
        ))}
      </div>
    </div>
  );
}

export const ThemeSwitcher = memo(ThemeSwitcherComponent);
