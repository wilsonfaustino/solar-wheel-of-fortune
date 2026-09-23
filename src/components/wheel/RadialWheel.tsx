import { m, useReducedMotion } from 'motion/react';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { ANIMATION_CONFIG, WHEEL_CONFIG } from '../../constants/defaults';
import { useSpinSound } from '../../hooks';
import { useNameStore } from '../../stores/useNameStore';
import type { Name } from '../../types/name';
import { isUnavailableToday } from '../../utils/name';
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
    const shouldReduceMotion = useReducedMotion();
    const { playSpinSound } = useSpinSound();

    const hasSelectableNames = names.some((name) => !isUnavailableToday(name));

    const handleSpin = useCallback(() => {
      // Read today at spin time so a tab left open overnight drops yesterday's marks
      const selectableIndices = names.flatMap((name, index) =>
        isUnavailableToday(name) ? [] : [index]
      );
      if (isSpinning || selectableIndices.length === 0) return;

      playSpinSound();
      setIsSpinning(true);
      setSelectedIndex(null);

      const { targetRotation, finalIndex } = calculateTargetRotation(
        rotation,
        names.length,
        selectableIndices
      );

      setPendingSelectionIndex(finalIndex);
      setRotation(targetRotation);
    }, [isSpinning, names, rotation, playSpinSound]);

    useImperativeHandle(
      ref,
      () => ({
        spin: handleSpin,
        clearSelection: () => setSelectedIndex(null),
      }),
      [handleSpin]
    );

    return (
      <div className="relative w-full aspect-square flex items-center justify-center sm:max-w-[500px] lg:max-w-[900px]">
        <m.div
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
              setPendingSelectionIndex(null);
              // Marked unavailable from the sidebar while the wheel was spinning
              if (isUnavailableToday(selectedName)) return;
              setSelectedIndex(pendingSelectionIndex);
              onSelect(selectedName);
              recordSelection(selectedName.value, selectedName.id, 'wheel');
            }
          }}
        >
          <svg
            className="absolute w-full h-full"
            viewBox={`0 0 ${WHEEL_CONFIG.svgSize} ${WHEEL_CONFIG.svgSize}`}
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
              {names.map((name, index) => {
                const isUnavailable = isUnavailableToday(name);
                return (
                  <NameLabel
                    key={name.id}
                    name={name.value}
                    index={index}
                    totalNames={names.length}
                    isSelected={selectedIndex === index && !isUnavailable}
                    isUnavailable={isUnavailable}
                  />
                );
              })}
            </g>
          </svg>
        </m.div>

        <CenterButton onClick={handleSpin} isSpinning={isSpinning} disabled={!hasSelectableNames} />
      </div>
    );
  }
);
