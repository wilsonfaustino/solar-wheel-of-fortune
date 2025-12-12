import type { Theme, ThemeConfig } from '../types/theme';

export const THEMES: Record<Theme, ThemeConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Cyan Pulse',
    colors: {
      accent: '#00FFFF',
      accentGlow: 'rgba(0, 255, 255, 0.8)',
      background: '#000000',
      text: '#FFFFFF',
      border: '#00FFFF',
      borderLight: 'rgba(0, 255, 255, 0.3)',
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Green',
    colors: {
      accent: '#00FF00',
      accentGlow: 'rgba(0, 255, 0, 0.8)',
      background: '#000000',
      text: '#00FF00',
      border: '#00FF00',
      borderLight: 'rgba(0, 255, 0, 0.3)',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      accent: '#FF6B35',
      accentGlow: 'rgba(255, 107, 53, 0.8)',
      background: '#000000',
      text: '#FFFFFF',
      border: '#FF6B35',
      borderLight: 'rgba(255, 107, 53, 0.3)',
    },
  },
};

export const DEFAULT_THEME: Theme = 'cyan';
