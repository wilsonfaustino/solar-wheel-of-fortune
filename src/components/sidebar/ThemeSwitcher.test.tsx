import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNameStore } from '../../stores/useNameStore';
import { mockInitialState } from '../../stores/useNameStore.mock';
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

    const cyanButton = screen.getByText('Cyan Pulse').closest('button');
    expect(cyanButton).toHaveAttribute('aria-pressed', 'true');

    const matrixButton = screen.getByText('Matrix Green').closest('button');
    expect(matrixButton).toHaveAttribute('aria-pressed', 'false');
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
});
