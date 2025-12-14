import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WHEEL_CONFIG } from '../../constants/defaults';
import { calculateTargetRotation } from './wheel.utils';

describe('calculateTargetRotation', () => {
  let originalRandom: () => number;

  beforeEach(() => {
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  /**
   * Helper function to mock Math.random with a specific sequence of values.
   * Used to control spins and finalIndex selection.
   */
  const mockRandomSequence = (values: number[]) => {
    let callIndex = 0;
    Math.random = vi.fn(() => {
      const value = values[callIndex % values.length];
      callIndex++;
      return value;
    });
  };

  /**
   * Verify that a selected name lands at 0 degrees (right side of wheel).
   * Formula: visualAngle = (initialNameAngle + targetRotation) % 360
   * Where initialNameAngle = -90 + finalIndex * degreesPerName
   */
  const verifyNameLandsAt0Degrees = (
    finalIndex: number,
    namesLength: number,
    targetRotation: number
  ) => {
    const degreesPerName = 360 / namesLength;
    const initialNameAngle = -90 + finalIndex * degreesPerName;
    const visualAngle = (initialNameAngle + targetRotation) % 360;

    // Account for floating point precision
    const normalizedAngle = visualAngle < 0 ? visualAngle + 360 : visualAngle;
    expect(Math.abs(normalizedAngle) < 0.01 || Math.abs(normalizedAngle - 360) < 0.01).toBe(true);
  };

  describe('Return value structure', () => {
    it('should return an object with targetRotation and finalIndex', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 12);

      expect(result).toHaveProperty('targetRotation');
      expect(result).toHaveProperty('finalIndex');
      expect(typeof result.targetRotation).toBe('number');
      expect(typeof result.finalIndex).toBe('number');
    });

    it('finalIndex should be within valid range', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 12);

      expect(result.finalIndex).toBeGreaterThanOrEqual(0);
      expect(result.finalIndex).toBeLessThan(12);
    });
  });

  describe('Name landing position (core requirement)', () => {
    it('should land selected name at 0 degrees on first spin with 1 name', () => {
      mockRandomSequence([0.5, 0]); // 0 = select index 0
      const result = calculateTargetRotation(0, 1);

      verifyNameLandsAt0Degrees(result.finalIndex, 1, result.targetRotation);
    });

    it('should land selected name at 0 degrees on first spin with 2 names', () => {
      mockRandomSequence([0.5, 0]); // 0 = select index 0
      const result = calculateTargetRotation(0, 2);
      verifyNameLandsAt0Degrees(result.finalIndex, 2, result.targetRotation);

      mockRandomSequence([0.5, 0.5]); // 0.5 = select index 1
      const result2 = calculateTargetRotation(0, 2);
      verifyNameLandsAt0Degrees(result2.finalIndex, 2, result2.targetRotation);
    });

    it('should land selected name at 0 degrees with 12 names', () => {
      for (let nameIndex = 0; nameIndex < 12; nameIndex++) {
        const randomValueForIndex = nameIndex / 12;
        mockRandomSequence([0.5, randomValueForIndex]);
        const result = calculateTargetRotation(0, 12);

        verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
      }
    });

    it('should land selected name at 0 degrees on subsequent spins', () => {
      // After 3 full spins: rotation = -1080
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(-1080, 12);

      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });

    it('should land selected name at 0 degrees after multiple full spins', () => {
      // After 10 full spins: rotation = -3600
      mockRandomSequence([0.5, 0.25]);
      const result = calculateTargetRotation(-3600, 12);

      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });
  });

  describe('Rotation calculation with different current rotations', () => {
    it('should accumulate rotation on subsequent spins', () => {
      mockRandomSequence([0.5, 0.5]);
      const result1 = calculateTargetRotation(0, 12);

      mockRandomSequence([0.5, 0.5]);
      const result2 = calculateTargetRotation(result1.targetRotation, 12);

      // Second spin should have greater (more negative) rotation
      expect(result2.targetRotation).toBeLessThan(result1.targetRotation);
    });

    it('should handle partial rotations correctly', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(-180, 12); // Half a rotation already done

      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });

    it('should handle large accumulated rotations', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(-7200, 12); // 20 full rotations

      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });
  });

  describe('Spin randomization', () => {
    it('should include full spins in the rotation', () => {
      mockRandomSequence([0.5, 0]); // Control finalIndex
      const result = calculateTargetRotation(0, 12);

      // targetRotation should be negative (spins go counter-clockwise)
      expect(result.targetRotation).toBeLessThan(0);

      // Should include at least minSpins rotations
      const spinsInRotation = Math.abs(result.targetRotation) / 360;
      expect(spinsInRotation).toBeGreaterThanOrEqual(WHEEL_CONFIG.minSpins);
      expect(spinsInRotation).toBeLessThanOrEqual(WHEEL_CONFIG.maxSpins + 1);
    });

    it('should vary spins based on random value', () => {
      const results = [];

      // Test with different random values for spin calculation
      // Using values distributed across the min/max range
      const spinsRandomValues = [0.1, 0.3, 0.5, 0.7, 0.9];
      for (const spinRandom of spinsRandomValues) {
        mockRandomSequence([spinRandom, 0.5]); // Fixed finalIndex (0.5 = roughly middle)
        results.push(calculateTargetRotation(0, 12));
      }

      // Check that different random values produce different rotation magnitudes
      const magnitudes = results.map((r) => Math.abs(r.targetRotation));
      // At least some should differ (allowing for floating point variations)
      const maxMagnitude = Math.max(...magnitudes);
      const minMagnitude = Math.min(...magnitudes);
      expect(maxMagnitude - minMagnitude).toBeGreaterThan(0.1);
    });
  });

  describe('Final index selection', () => {
    it('should select different indices based on random value', () => {
      const indices = [];

      for (let i = 0; i < 12; i++) {
        mockRandomSequence([0.5, i / 12]);
        const result = calculateTargetRotation(0, 12);
        indices.push(result.finalIndex);
      }

      // All 12 indices should be selected
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(12);
    });

    it('should select index 0 when random is near 0', () => {
      mockRandomSequence([0.5, 0.01]);
      const result = calculateTargetRotation(0, 12);

      expect(result.finalIndex).toBe(0);
    });

    it('should select last index when random is near 1', () => {
      mockRandomSequence([0.5, 0.99]);
      const result = calculateTargetRotation(0, 12);

      expect(result.finalIndex).toBe(11);
    });
  });

  describe('Edge cases', () => {
    it('should work with single name (namesLength = 1)', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 1);

      expect(result.finalIndex).toBe(0);
      verifyNameLandsAt0Degrees(result.finalIndex, 1, result.targetRotation);
    });

    it('should work with many names (namesLength = 24)', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 24);

      expect(result.finalIndex).toBeGreaterThanOrEqual(0);
      expect(result.finalIndex).toBeLessThan(24);
      verifyNameLandsAt0Degrees(result.finalIndex, 24, result.targetRotation);
    });

    it('should handle zero rotation (first spin)', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 12);

      expect(result.targetRotation).toBeLessThan(0);
      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });

    it('should handle negative rotation (after previous spins)', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(-1440, 12); // After 4 full spins

      verifyNameLandsAt0Degrees(result.finalIndex, 12, result.targetRotation);
    });
  });

  describe('Mathematical correctness', () => {
    it('should satisfy the landing equation for all cases', () => {
      const testCases = [
        { rotation: 0, namesLength: 3 },
        { rotation: 0, namesLength: 12 },
        { rotation: -360, namesLength: 4 },
        { rotation: -1080, namesLength: 6 },
        { rotation: -3600, namesLength: 24 },
      ];

      testCases.forEach(({ rotation, namesLength }) => {
        mockRandomSequence([0.5, 0.5]);
        const result = calculateTargetRotation(rotation, namesLength);

        // Verify the mathematical relationship
        verifyNameLandsAt0Degrees(result.finalIndex, namesLength, result.targetRotation);
      });
    });

    it('should produce consistent results for same inputs and random values', () => {
      mockRandomSequence([0.3, 0.7]);
      const result1 = calculateTargetRotation(0, 12);

      mockRandomSequence([0.3, 0.7]);
      const result2 = calculateTargetRotation(0, 12);

      expect(result1.targetRotation).toBe(result2.targetRotation);
      expect(result1.finalIndex).toBe(result2.finalIndex);
    });
  });

  describe('Rotation direction and magnitude', () => {
    it('should rotate counter-clockwise (negative rotation)', () => {
      mockRandomSequence([0.5, 0.5]);
      const result = calculateTargetRotation(0, 12);

      expect(result.targetRotation).toBeLessThan(0);
    });

    it('should have magnitude of at least minSpins * 360', () => {
      mockRandomSequence([WHEEL_CONFIG.minSpins / WHEEL_CONFIG.maxSpins, 0.5]);
      const result = calculateTargetRotation(0, 12);

      const magnitude = Math.abs(result.targetRotation);
      expect(magnitude).toBeGreaterThanOrEqual(WHEEL_CONFIG.minSpins * 360);
    });

    it('should have magnitude of at most (maxSpins + 1) * 360', () => {
      mockRandomSequence([0.99, 0.5]);
      const result = calculateTargetRotation(0, 12);

      const magnitude = Math.abs(result.targetRotation);
      expect(magnitude).toBeLessThanOrEqual((WHEEL_CONFIG.maxSpins + 1) * 360);
    });
  });
});
