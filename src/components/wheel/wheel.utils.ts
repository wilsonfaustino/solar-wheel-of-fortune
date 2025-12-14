import { WHEEL_CONFIG } from '../../constants/defaults';

const calculateSpinsValue = () =>
  WHEEL_CONFIG.minSpins + Math.random() * (WHEEL_CONFIG.maxSpins - WHEEL_CONFIG.minSpins);

/**
 * Calculates the target rotation for a wheel spin that lands a randomly selected name
 * at exactly 0 degrees (right side/3 o'clock position).
 *
 * The function performs several steps:
 * 1. Randomly selects a name index from 0 to namesLength-1
 * 2. Generates a random number of full spins (between minSpins and maxSpins)
 * 3. Calculates the landing position where the selected name ends up at 0°
 * 4. Accounts for accumulated rotations from previous spins
 *
 * @param {number} rotation - Current rotation state in degrees. Negative values indicate
 *   counter-clockwise rotations. On first spin, this is 0. After previous spins, this
 *   accumulates (e.g., -1080 after 3 full rotations).
 * @param {number} namesLength - The total number of names on the wheel. Used to calculate
 *   degrees per name segment (360 / namesLength) and to randomly select a final index.
 *
 * @returns {Object} An object containing:
 *   @returns {number} targetRotation - The new rotation value to set. Always negative
 *     (counter-clockwise). Includes full spins plus the landing offset to position
 *     the selected name at 0°.
 *   @returns {number} finalIndex - The randomly selected name index (0 to namesLength-1)
 *     that will appear at 0° after the rotation completes.
 *
 * @example
 * // First spin with 12 names
 * const result = calculateTargetRotation(0, 12);
 * // Returns: { targetRotation: -1245, finalIndex: 3 }
 * // After rotation, the name at index 3 will be at 0° (right side)
 *
 * @example
 * // Subsequent spin after previous rotation
 * const result = calculateTargetRotation(-1245, 12);
 * // Returns: { targetRotation: -2190, finalIndex: 7 }
 * // The wheel accumulates rotation from the previous spin
 *
 * @example
 * // Different wheel sizes
 * const smallWheel = calculateTargetRotation(0, 3);  // 3 names
 * const largeWheel = calculateTargetRotation(0, 24); // 24 names
 * // Both will land their selected names at 0°, but with different landing offsets
 *
 * @remarks
 * Mathematical Foundation:
 * - Names are initially positioned at: -90° + index × (360° / namesLength)
 * - Index 0 starts at -90° (top/12 o'clock position)
 * - To land a name at 0° (right/3 o'clock position), the wheel must rotate by:
 *   rotationNeeded = 90° - (index × degreesPerName)
 * - With multiple spins: rotationNeeded = -(spins × 360°) + (90° - index × degreesPerName)
 * - The targetRotation accumulates: newRotation = currentRotation + rotationNeeded
 *
 * @see {@link WHEEL_CONFIG} for minSpins, maxSpins configuration
 * @see {@link NameLabel} for name positioning calculation
 */
export const calculateTargetRotation = (
  rotation: number,
  namesLength: number
): { targetRotation: number; finalIndex: number } => {
  const spins = calculateSpinsValue();
  const finalIndex = Math.floor(Math.random() * namesLength);
  const degreesPerName = 360 / namesLength;

  // Name at finalIndex starts at: -90 + finalIndex * degreesPerName
  // To land at 0°, the wheel rotation must be: 90 - finalIndex * degreesPerName
  const landingRotation = 90 - finalIndex * degreesPerName;

  // Normalize current rotation to find how many full spins we've done
  const currentFullSpins = Math.floor(rotation / -360);

  // Calculate target: enough full spins + the exact landing position
  const fullSpinsDegrees = (currentFullSpins + Math.ceil(spins)) * -360;
  const targetRotation = fullSpinsDegrees + landingRotation;
  return { targetRotation, finalIndex };
};
