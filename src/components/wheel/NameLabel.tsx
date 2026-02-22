import { memo } from 'react';
import { LABEL_CONFIG, WHEEL_CONFIG } from '../../constants/defaults';
import { RadialLine } from './RadialLine';

interface NameLabelProps {
  name: string;
  index: number;
  totalNames: number;
  isSelected: boolean;
}

function NameLabelComponent({ name, index, totalNames, isSelected }: NameLabelProps) {
  const angleStep = (2 * Math.PI) / totalNames;
  const angle = index * angleStep - Math.PI / 2;
  const positionX = WHEEL_CONFIG.centerOffset + Math.cos(angle) * WHEEL_CONFIG.circleRadius;
  const positionY = WHEEL_CONFIG.centerOffset + Math.sin(angle) * WHEEL_CONFIG.circleRadius;
  const rotationAngle = index * (360 / totalNames) - 90;

  return (
    <g
      transform={`translate(${positionX}, ${positionY}) rotate(${rotationAngle})`}
      data-index={index}
    >
      <RadialLine isSelected={isSelected} />
      <text
        x="0"
        y="-5"
        className="font-mono"
        fontSize={isSelected ? LABEL_CONFIG.selectedFontSize : LABEL_CONFIG.defaultFontSize}
        fontWeight={isSelected ? '600' : '300'}
        fill={isSelected ? 'var(--color-accent)' : 'var(--color-text)'}
        opacity={isSelected ? 1 : LABEL_CONFIG.defaultOpacity}
        letterSpacing="2"
        style={{
          transition: 'all 0.3s ease',
        }}
      >
        {name}
      </text>
    </g>
  );
}

export const NameLabel = memo(NameLabelComponent);
