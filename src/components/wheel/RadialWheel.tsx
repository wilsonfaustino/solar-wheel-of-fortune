import { motion } from 'framer-motion';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { WHEEL_CONFIG } from '../../constants/defaults';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNameStore } from '../../stores/useNameStore';
import type { Name } from '../../types/name';
import { CenterButton } from './CenterButton';
import { NameLabel } from './NameLabel';

interface RadialWheelProps {
  names: Name[];
  onSelect: (name: Name) => void;
}

export interface RadialWheelRef {
  spin: () => void;
}

export const RadialWheel = forwardRef<RadialWheelRef, RadialWheelProps>(
  function RadialWheelComponent({ names, onSelect }, ref) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const recordSelection = useNameStore((state) => state.recordSelection);
    const { isSmallScreen, isMediumScreen } = useMediaQuery();

    const responsiveStyles = useMemo(() => {
      if (isSmallScreen) {
        return { maxWidth: '350px' };
      }
      if (isMediumScreen) {
        return { maxWidth: '500px' };
      }
      return { maxWidth: '900px' };
    }, [isSmallScreen, isMediumScreen]);

    const handleSpin = useCallback(() => {
      if (isSpinning || names.length === 0) return;

      setIsSpinning(true);
      setSelectedIndex(null);

      const spins =
        WHEEL_CONFIG.minSpins + Math.random() * (WHEEL_CONFIG.maxSpins - WHEEL_CONFIG.minSpins);
      const finalIndex = Math.floor(Math.random() * names.length);
      const degreesPerName = 360 / names.length;
      const targetRotation = rotation - (spins * 360 + finalIndex * degreesPerName);

      setRotation(targetRotation);

      setTimeout(() => {
        const selectedName = names[finalIndex];
        setIsSpinning(false);
        setSelectedIndex(finalIndex);
        onSelect(selectedName);
        recordSelection(selectedName.value, selectedName.id);
      }, WHEEL_CONFIG.spinDuration);
    }, [isSpinning, names, rotation, onSelect, recordSelection]);

    useImperativeHandle(
      ref,
      () => ({
        spin: handleSpin,
      }),
      [handleSpin]
    );

    return (
      <div
        className="relative w-full aspect-square flex items-center justify-center"
        style={responsiveStyles}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: rotation }}
          transition={{
            duration: WHEEL_CONFIG.spinDuration / 1000,
            ease: [0.17, 0.67, 0.3, 0.98],
          }}
        >
          <svg
            className="absolute"
            style={{
              width: WHEEL_CONFIG.svgSize,
              height: WHEEL_CONFIG.svgSize,
            }}
          >
            <title>Wheel of Fortune with names</title>
            <circle
              cx={WHEEL_CONFIG.centerOffset}
              cy={WHEEL_CONFIG.centerOffset}
              r={WHEEL_CONFIG.circleRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.5"
            />
            <g id="names-container">
              {names.map((name, index) => (
                <NameLabel
                  key={name.id}
                  name={name.value}
                  index={index}
                  totalNames={names.length}
                  isSelected={selectedIndex === index}
                />
              ))}
            </g>
          </svg>
        </motion.div>

        <CenterButton onClick={handleSpin} isSpinning={isSpinning} disabled={names.length === 0} />
      </div>
    );
  }
);
