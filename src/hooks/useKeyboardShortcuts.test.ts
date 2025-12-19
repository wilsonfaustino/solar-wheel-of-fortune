import { fireEvent, renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  describe('Space key in normal context', () => {
    it('should trigger onSpinTrigger callback when Space pressed', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      fireEvent.keyDown(document, { code: 'Space' });

      expect(onSpinTrigger).toHaveBeenCalledTimes(1);
    });

    it('should call preventDefault to avoid page scroll', () => {
      const onSpinTrigger = vi.fn();
      const preventDefaultMock = vi.fn();

      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      const event = new KeyboardEvent('keydown', {
        code: 'Space',
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultMock });

      document.dispatchEvent(event);

      expect(preventDefaultMock).toHaveBeenCalled();
    });

    it('should NOT trigger on Space keyup event', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      fireEvent.keyUp(document, { code: 'Space' });

      expect(onSpinTrigger).not.toHaveBeenCalled();
    });
  });

  describe('Space key in input fields', () => {
    it('should NOT trigger onSpinTrigger when Space pressed in input element', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      fireEvent.keyDown(input, { code: 'Space' });

      expect(onSpinTrigger).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should NOT trigger onSpinTrigger when Space pressed in textarea element', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      fireEvent.keyDown(textarea, { code: 'Space' });

      expect(onSpinTrigger).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should NOT call preventDefault in input fields to allow space character', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', { code: 'Space', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      input.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should NOT trigger onSpinTrigger when Space pressed in contentEditable element', () => {
      const onSpinTrigger = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);

      fireEvent.keyDown(div, { code: 'Space' });

      expect(onSpinTrigger).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });
  });

  describe('Escape key behavior', () => {
    it('should trigger onEscapePress callback in normal context', () => {
      const onEscapePress = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onEscapePress }));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onEscapePress).toHaveBeenCalledTimes(1);
    });

    it('should trigger onEscapePress even when in input field (for modal close)', () => {
      const onEscapePress = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onEscapePress }));

      const input = document.createElement('input');
      document.body.appendChild(input);

      fireEvent.keyDown(input, { key: 'Escape', bubbles: true });

      expect(onEscapePress).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });

    it('should NOT call preventDefault for Escape key', () => {
      const onEscapePress = vi.fn();
      renderHook(() => useKeyboardShortcuts({ onEscapePress }));

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      document.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should NOT crash when onSpinTrigger is undefined', () => {
      expect(() => {
        renderHook(() => useKeyboardShortcuts({}));
        fireEvent.keyDown(document, { code: 'Space' });
      }).not.toThrow();
    });

    it('should NOT crash when onEscapePress is undefined', () => {
      expect(() => {
        renderHook(() => useKeyboardShortcuts({}));
        fireEvent.keyDown(document, { key: 'Escape' });
      }).not.toThrow();
    });

    it('should remove event listener on unmount to prevent memory leaks', () => {
      const onSpinTrigger = vi.fn();
      const { unmount } = renderHook(() => useKeyboardShortcuts({ onSpinTrigger }));

      unmount();

      fireEvent.keyDown(document, { code: 'Space' });

      expect(onSpinTrigger).not.toHaveBeenCalled();
    });
  });
});
