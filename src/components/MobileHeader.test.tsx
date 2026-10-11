import { fireEvent, render, screen } from '@testing-library/react';
import { MobileHeader } from './MobileHeader';

describe('MobileHeader', () => {
  it('renders the title "SOLAR WHEEL"', () => {
    render(<MobileHeader onToggleSidebar={() => {}} />);
    expect(screen.getByText('SOLAR WHEEL')).toBeInTheDocument();
  });

  it('renders menu button with correct aria-label', () => {
    render(<MobileHeader onToggleSidebar={() => {}} />);
    expect(screen.getByRole('button', { name: 'Toggle sidebar menu' })).toBeInTheDocument();
  });

  it('calls onToggleSidebar when button is clicked', () => {
    const handleToggleSidebar = vi.fn();
    render(<MobileHeader onToggleSidebar={handleToggleSidebar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar menu' }));
    expect(handleToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('has hover class for background highlight', () => {
    render(<MobileHeader onToggleSidebar={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Toggle sidebar menu' });
    expect(button.className).toContain('hover:bg-white/10');
  });
});
