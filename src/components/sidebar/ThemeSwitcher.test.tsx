import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockInitialState } from '@/test/test-data';
import { useNameStore } from '../../stores/useNameStore';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    useNameStore.setState(mockInitialState);
  });

  it('should render all 3 theme buttons', () => {
    render(<ThemeSwitcher />);

    expect(screen.getByText('Cyan Pulse')).toBeInTheDocument();
    expect(screen.getByText('Matrix Green')).toBeInTheDocument();
    expect(screen.getByText('Sunset Orange')).toBeInTheDocument();
  });

  it('should highlight active theme', () => {
    render(<ThemeSwitcher />);

    const cyanButton = screen.getByRole('radio', { name: 'Cyan Pulse' });
    expect(cyanButton).toHaveAttribute('aria-checked', 'true');
    expect(cyanButton).toHaveAttribute('data-state', 'checked');

    const matrixButton = screen.getByRole('radio', { name: 'Matrix Green' });
    expect(matrixButton).toHaveAttribute('aria-checked', 'false');
    expect(matrixButton).toHaveAttribute('data-state', 'unchecked');
  });

  it('should call setTheme when button clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const matrixButton = screen.getByText('Matrix Green');
    await user.click(matrixButton);

    const state = useNameStore.getState();
    expect(state.currentTheme).toBe('matrix');
  });

  it('should be memoized (no re-render)', () => {
    const { rerender } = render(<ThemeSwitcher />);
    const firstRender = screen.getByText('Cyan Pulse');

    rerender(<ThemeSwitcher />);
    const secondRender = screen.getByText('Cyan Pulse');

    expect(firstRender).toBe(secondRender);
  });

  it('should have proper radio group semantics', () => {
    render(<ThemeSwitcher />);

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);
  });

  it('should support keyboard focus and tab navigation', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    // Tab to focus the radio group
    await user.tab();

    // The currently checked radio should be focused
    const cyanButton = screen.getByRole('radio', { name: 'Cyan Pulse' });
    expect(cyanButton).toHaveFocus();
    expect(cyanButton).toHaveAttribute('aria-checked', 'true');
  });

  it('should support Space key to select theme', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const matrixButton = screen.getByRole('radio', { name: 'Matrix Green' });
    matrixButton.focus();

    await user.keyboard(' ');

    const state = useNameStore.getState();
    expect(state.currentTheme).toBe('matrix');
  });
});
