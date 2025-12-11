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
  minSpins: 3,
  maxSpins: 5,
  spinDuration: 3000,
} as const;

export const ANIMATION_CONFIG = {
  spinEasing: 'cubic-bezier(0.17, 0.67, 0.3, 0.98)',
} as const;
