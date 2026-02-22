import { memo } from 'react';
import { WHEEL_CONFIG } from '../../constants/defaults';

interface RadialLineProps {
  isSelected: boolean;
}

function RadialLineComponent({ isSelected }: RadialLineProps) {
  return (
    <line
      x1="0"
      y1="0"
      x2={WHEEL_CONFIG.lineLength}
      y2="0"
      stroke="var(--color-text)"
      strokeWidth="0.5"
      opacity={isSelected ? 0.6 : 0.12}
      style={{ transition: 'opacity 0.3s ease' }}
    />
  );
}

export const RadialLine = memo(RadialLineComponent);
