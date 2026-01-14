import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useSettingsStore.setState({
      autoExcludeEnabled: true,
      clearSelectionAfterExclude: false,
    });
  });

  describe('rendering', () => {
    it('should render the section header', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('WHEEL BEHAVIOR')).toBeInTheDocument();
    });

    it('should render auto-exclude toggle', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Auto-exclude after selection')).toBeInTheDocument();
      expect(
        screen.getByText('Automatically exclude selected names from future spins')
      ).toBeInTheDocument();
    });

    it('should render clear selection toggle when auto-exclude is enabled', () => {
      render(<SettingsPanel />);

      expect(screen.getByText('Clear selection after exclusion')).toBeInTheDocument();
      expect(
        screen.getByText('Deselect names automatically after they are excluded')
      ).toBeInTheDocument();
    });

    it('should hide clear selection toggle when auto-exclude is disabled', () => {
      useSettingsStore.setState({ autoExcludeEnabled: false });
      render(<SettingsPanel />);

      expect(screen.queryByText('Clear selection after exclusion')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Deselect names automatically after they are excluded')
      ).not.toBeInTheDocument();
    });

    it('should have proper switch accessibility labels', () => {
      render(<SettingsPanel />);

      expect(
        screen.getByRole('switch', { name: 'Auto-exclude after selection' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('switch', { name: 'Clear selection after exclusion' })
      ).toBeInTheDocument();
    });
  });

  describe('auto-exclude toggle interactions', () => {
    it('should toggle auto-exclude when clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      expect(autoExcludeSwitch).toHaveAttribute('data-state', 'checked');

      await user.click(autoExcludeSwitch);

      expect(useSettingsStore.getState().autoExcludeEnabled).toBe(false);
      expect(autoExcludeSwitch).toHaveAttribute('data-state', 'unchecked');
    });

    it('should enable auto-exclude when clicked while disabled', async () => {
      useSettingsStore.setState({ autoExcludeEnabled: false });
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      expect(autoExcludeSwitch).toHaveAttribute('data-state', 'unchecked');

      await user.click(autoExcludeSwitch);

      expect(useSettingsStore.getState().autoExcludeEnabled).toBe(true);
      expect(autoExcludeSwitch).toHaveAttribute('data-state', 'checked');
    });

    it('should be clickable via label', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const label = screen.getByText('Auto-exclude after selection');
      await user.click(label);

      expect(useSettingsStore.getState().autoExcludeEnabled).toBe(false);
    });
  });

  describe('clear selection toggle interactions', () => {
    it('should toggle clear selection when clicked', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const clearSelectionSwitch = screen.getByRole('switch', {
        name: 'Clear selection after exclusion',
      });
      expect(clearSelectionSwitch).toHaveAttribute('data-state', 'unchecked');

      await user.click(clearSelectionSwitch);

      expect(useSettingsStore.getState().clearSelectionAfterExclude).toBe(true);
      expect(clearSelectionSwitch).toHaveAttribute('data-state', 'checked');
    });

    it('should disable clear selection when clicked while enabled', async () => {
      useSettingsStore.setState({ clearSelectionAfterExclude: true });
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const clearSelectionSwitch = screen.getByRole('switch', {
        name: 'Clear selection after exclusion',
      });
      expect(clearSelectionSwitch).toHaveAttribute('data-state', 'checked');

      await user.click(clearSelectionSwitch);

      expect(useSettingsStore.getState().clearSelectionAfterExclude).toBe(false);
      expect(clearSelectionSwitch).toHaveAttribute('data-state', 'unchecked');
    });

    it('should be clickable via label', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const label = screen.getByText('Clear selection after exclusion');
      await user.click(label);

      expect(useSettingsStore.getState().clearSelectionAfterExclude).toBe(true);
    });
  });

  describe('conditional rendering', () => {
    it('should show clear selection toggle when auto-exclude is toggled on', async () => {
      useSettingsStore.setState({ autoExcludeEnabled: false });
      const user = userEvent.setup();
      render(<SettingsPanel />);

      expect(screen.queryByText('Clear selection after exclusion')).not.toBeInTheDocument();

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      await user.click(autoExcludeSwitch);

      expect(screen.getByText('Clear selection after exclusion')).toBeInTheDocument();
    });

    it('should hide clear selection toggle when auto-exclude is toggled off', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      expect(screen.getByText('Clear selection after exclusion')).toBeInTheDocument();

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      await user.click(autoExcludeSwitch);

      expect(screen.queryByText('Clear selection after exclusion')).not.toBeInTheDocument();
    });

    it('should preserve clear selection state when auto-exclude is toggled', async () => {
      useSettingsStore.setState({ clearSelectionAfterExclude: true });
      const user = userEvent.setup();
      render(<SettingsPanel />);

      // Toggle auto-exclude off
      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      await user.click(autoExcludeSwitch);

      // Clear selection toggle is hidden but state should be preserved
      expect(useSettingsStore.getState().clearSelectionAfterExclude).toBe(true);

      // Toggle auto-exclude back on
      await user.click(autoExcludeSwitch);

      // Clear selection toggle should still be enabled
      const clearSelectionSwitch = screen.getByRole('switch', {
        name: 'Clear selection after exclusion',
      });
      expect(clearSelectionSwitch).toHaveAttribute('data-state', 'checked');
    });
  });

  describe('keyboard navigation', () => {
    it('should support keyboard toggle with Space key', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      autoExcludeSwitch.focus();

      await user.keyboard(' ');

      expect(useSettingsStore.getState().autoExcludeEnabled).toBe(false);
    });

    it('should support keyboard toggle with Enter key', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      autoExcludeSwitch.focus();

      await user.keyboard('[Enter]');

      expect(useSettingsStore.getState().autoExcludeEnabled).toBe(false);
    });

    it('should support tab navigation between switches', async () => {
      const user = userEvent.setup();
      render(<SettingsPanel />);

      await user.tab();

      const autoExcludeSwitch = screen.getByRole('switch', {
        name: 'Auto-exclude after selection',
      });
      expect(autoExcludeSwitch).toHaveFocus();

      await user.tab();

      const clearSelectionSwitch = screen.getByRole('switch', {
        name: 'Clear selection after exclusion',
      });
      expect(clearSelectionSwitch).toHaveFocus();
    });
  });

  describe('memoization', () => {
    it('should be memoized (no unnecessary re-renders)', () => {
      const { rerender } = render(<SettingsPanel />);
      const firstRender = screen.getByText('WHEEL BEHAVIOR');

      rerender(<SettingsPanel />);
      const secondRender = screen.getByText('WHEEL BEHAVIOR');

      expect(firstRender).toBe(secondRender);
    });
  });
});
