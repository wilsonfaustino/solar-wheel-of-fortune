import { motion, useReducedMotion } from 'framer-motion';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { ANIMATION_CONFIG, WHEEL_CONFIG } from '../../constants/defaults';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useNameStore } from '../../stores/useNameStore';
import type { Name } from '../../types/name';
import { CenterButton } from './CenterButton';
import { NameLabel } from './NameLabel';
import { calculateTargetRotation } from './wheel.utils';

interface RadialWheelProps {
  names: Name[];
  onSelect: (name: Name) => void;
}

export interface RadialWheelRef {
  spin: () => void;
  clearSelection: () => void;
}

export const RadialWheel = forwardRef<RadialWheelRef, RadialWheelProps>(
  function RadialWheelComponent({ names, onSelect }, ref) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [pendingSelectionIndex, setPendingSelectionIndex] = useState<number | null>(null);
    const recordSelection = useNameStore((state) => state.recordSelection);
    const { isSmallScreen, isMediumScreen } = useMediaQuery();
    const shouldReduceMotion = useReducedMotion();

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

      const { targetRotation, finalIndex } = calculateTargetRotation(rotation, names.length);

      setPendingSelectionIndex(finalIndex);
      setRotation(targetRotation);
    }, [isSpinning, names, rotation]);

    useImperativeHandle(
      ref,
      () => ({
        spin: handleSpin,
        clearSelection: () => setSelectedIndex(null),
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
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  damping: ANIMATION_CONFIG.spring.damping,
                  stiffness: ANIMATION_CONFIG.spring.stiffness,
                  mass: ANIMATION_CONFIG.spring.mass,
                  velocity: ANIMATION_CONFIG.spring.velocity,
                }
          }
          onAnimationComplete={() => {
            if (pendingSelectionIndex !== null) {
              const selectedName = names[pendingSelectionIndex];
              setIsSpinning(false);
              setSelectedIndex(pendingSelectionIndex);
              onSelect(selectedName);
              recordSelection(selectedName.value, selectedName.id);
              setPendingSelectionIndex(null);
            }
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
