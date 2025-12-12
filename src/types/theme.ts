export type Theme = 'cyan' | 'matrix' | 'sunset';

export interface ThemeColors {
  accent: string;
  accentGlow: string;
  background: string;
  text: string;
  border: string;
  borderLight: string;
}

export interface ThemeConfig {
  id: Theme;
  name: string;
  colors: ThemeColors;
}
