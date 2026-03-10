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

  it('changes button background on mouseenter', () => {
    render(<MobileHeader onToggleSidebar={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Toggle sidebar menu' });
    fireEvent.mouseEnter(button);
    expect(button.style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
  });

  it('resets button background on mouseleave', () => {
    render(<MobileHeader onToggleSidebar={vi.fn()} />);
    const button = screen.getByRole('button', { name: 'Toggle sidebar menu' });
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    expect(button.style.backgroundColor).toBe('transparent');
  });
});
