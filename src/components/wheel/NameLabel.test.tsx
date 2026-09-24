import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LABEL_CONFIG } from '../../constants/defaults';
import { NameLabel } from './NameLabel';

function renderLabel(isSelected: boolean, isUnavailable?: boolean) {
  render(
    <svg>
      <title>Wheel</title>
      <NameLabel
        name="ALEX"
        index={0}
        totalNames={4}
        isSelected={isSelected}
        isUnavailable={isUnavailable}
      />
    </svg>
  );
  return screen.getByText('ALEX');
}

describe('NameLabel opacity', () => {
  it('should be fully opaque when selected', () => {
    expect(renderLabel(true, true)).toHaveAttribute('opacity', '1');
  });

  it('should use the unavailable opacity when unavailable and not selected', () => {
    expect(renderLabel(false, true)).toHaveAttribute(
      'opacity',
      String(LABEL_CONFIG.unavailableOpacity)
    );
  });

  it('should use the default opacity otherwise', () => {
    expect(renderLabel(false)).toHaveAttribute('opacity', String(LABEL_CONFIG.defaultOpacity));
  });
});
