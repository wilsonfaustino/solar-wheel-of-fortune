export const DEFAULT_NAMES = [
  'ALEX',
  'JORDAN',
  'CASEY',
  'MORGAN',
  'RILEY',
  'AVERY',
  'TAYLOR',
  'SKYLAR',
  'QUINN',
  'SAGE',
  'ROWAN',
  'DAKOTA',
];

export const WHEEL_CONFIG = {
  circleRadius: 100,
  lineLength: 120,
  svgSize: 500,
  centerOffset: 250,
  minSpins: 5,
  maxSpins: 9,
  spinDuration: 3000,
} as const;

export const LABEL_CONFIG = {
  selectedFontSize: 24,
  defaultFontSize: 13,
  defaultOpacity: 0.85,
} as const;

export const ANIMATION_CONFIG = {
  spinEasing: 'cubic-bezier(0.17, 0.67, 0.3, 0.98)',
  spring: {
    damping: 15,
    stiffness: 80,
    mass: 1.2,
    velocity: 2,
  },
} as const;
