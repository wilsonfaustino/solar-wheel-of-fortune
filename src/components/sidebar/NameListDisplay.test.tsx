import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { sampleNames } from '../../test/test-data';
import { toLocalISODay } from '../../utils/name';
import { NameListDisplay } from './NameListDisplay';

const handlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onToggleExclude: vi.fn(),
  onVolunteer: vi.fn(),
  onToggleUnavailable: vi.fn(),
};

describe('NameListDisplay', () => {
  it('should count unavailable names apart from active ones', () => {
    const today = toLocalISODay(new Date());
    const names = [
      { ...sampleNames[0], unavailableFrom: today, unavailableUntil: today },
      { ...sampleNames[1], unavailableFrom: today, unavailableUntil: today },
      { ...sampleNames[2], isExcluded: true },
      sampleNames[3],
      sampleNames[4],
    ];
    render(<NameListDisplay names={names} {...handlers} />);

    expect(screen.getByText('2 ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('· 2 UNAVAILABLE')).toBeInTheDocument();
    expect(screen.getByText('· 1 EXCLUDED')).toBeInTheDocument();
  });

  it('should keep each count whole so the header only wraps at a separator', () => {
    const today = toLocalISODay(new Date());
    const names = [{ ...sampleNames[0], unavailableFrom: today, unavailableUntil: today }];
    render(<NameListDisplay names={names} {...handlers} />);

    expect(screen.getByText('0 ACTIVE')).toHaveClass('whitespace-nowrap');
    expect(screen.getByText('· 1 UNAVAILABLE')).toHaveClass('whitespace-nowrap');
  });

  it('should omit the unavailable count when nobody is unavailable', () => {
    render(<NameListDisplay names={sampleNames} {...handlers} />);

    expect(screen.getByTestId('name-count-header')).toHaveTextContent(/^5 ACTIVE$/);
  });
});
