import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Toaster } from './Toaster';

vi.mock('../../hooks', () => ({
  useMediaQuery: vi.fn(() => ({
    isSmallScreen: false,
    isMediumScreen: false,
    isLargeScreen: true,
  })),
}));

vi.mock('sonner', () => ({
  Toaster: ({
    position,
    visibleToasts,
    duration,
    gap,
    offset,
  }: {
    position: string;
    visibleToasts: number;
    duration: number;
    gap: number;
    offset: number;
  }) => (
    <div
      data-testid="toaster"
      data-position={position}
      data-visible-toasts={visibleToasts}
      data-duration={duration}
      data-gap={gap}
      data-offset={offset}
    />
  ),
}));

describe('Toaster', () => {
  it('renders the Toaster component', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toBeInTheDocument();
  });

  it('uses bottom-center position on desktop', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toHaveAttribute('data-position', 'bottom-center');
  });

  it('uses top-center position on mobile', async () => {
    const { useMediaQuery } = await import('../../hooks');
    vi.mocked(useMediaQuery).mockReturnValue({
      isSmallScreen: true,
      isMediumScreen: false,
      isLargeScreen: false,
    });

    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toHaveAttribute('data-position', 'bottom-center');
  });

  it('configures visible toasts limit to 3', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toHaveAttribute('data-visible-toasts', '3');
  });

  it('configures toast duration to 5000ms', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toHaveAttribute('data-duration', '5000');
  });

  it('configures gap between toasts', () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId('toaster')).toHaveAttribute('data-gap', '8');
  });

  it('uses different offset on mobile vs desktop', async () => {
    const { useMediaQuery } = await import('../../hooks');

    // Desktop
    vi.mocked(useMediaQuery).mockReturnValue({
      isSmallScreen: false,
      isMediumScreen: false,
      isLargeScreen: true,
    });
    const { getByTestId: getDesktop, unmount: unmountDesktop } = render(<Toaster />);
    expect(getDesktop('toaster')).toHaveAttribute('data-offset', '150');
    unmountDesktop();

    // Mobile
    vi.mocked(useMediaQuery).mockReturnValue({
      isSmallScreen: true,
      isMediumScreen: false,
      isLargeScreen: false,
    });
    const { getByTestId: getMobile } = render(<Toaster />);
    expect(getMobile('toaster')).toHaveAttribute('data-offset', '100');
  });
});
