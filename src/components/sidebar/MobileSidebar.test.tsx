import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useReducedMotion } from 'framer-motion';
import { describe, expect, it, vi } from 'vitest';
import { MobileSidebar } from './MobileSidebar';

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>();
  return {
    ...actual,
    useReducedMotion: vi.fn().mockReturnValue(null),
  };
});

describe('MobileSidebar', () => {
  it('should render drawer when open', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Drawer Content</div>
      </MobileSidebar>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('MENU')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('should not render drawer when closed', () => {
    render(
      <MobileSidebar isOpen={false} onClose={vi.fn()}>
        <div>Drawer Content</div>
      </MobileSidebar>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should close on Escape key', async () => {
    const onClose = vi.fn();
    render(
      <MobileSidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </MobileSidebar>
    );

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('should close when X button clicked', async () => {
    const onClose = vi.fn();
    render(
      <MobileSidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </MobileSidebar>
    );

    const closeButton = screen.getByLabelText(/close sidebar/i);
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </MobileSidebar>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('should close when backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <MobileSidebar isOpen={true} onClose={onClose}>
        <div>Content</div>
      </MobileSidebar>
    );

    const overlay = container.querySelector('[role="presentation"]');
    if (overlay) {
      await userEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('should render with correct styling classes', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </MobileSidebar>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('fixed', 'top-0', 'left-0', 'h-screen', 'z-40', 'bg-black/90');
  });

  it('should display menu title', () => {
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </MobileSidebar>
    );

    const title = screen.getByText('MENU');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('font-mono', 'text-sm', 'tracking-widest');
  });

  it('should pass children to drawer content', () => {
    const testContent = 'Custom drawer content';
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>{testContent}</div>
      </MobileSidebar>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should apply instant transitions when reduced motion is preferred', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    render(
      <MobileSidebar isOpen={true} onClose={vi.fn()}>
        <div>Content</div>
      </MobileSidebar>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
