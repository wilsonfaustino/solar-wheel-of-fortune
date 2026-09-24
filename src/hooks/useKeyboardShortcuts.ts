import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onSpinTrigger?: () => void;
  onEscapePress?: () => void;
}

export function useKeyboardShortcuts({ onSpinTrigger, onEscapePress }: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Check if user is typing in an input field (input, textarea, contentEditable)
      const isInputField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      // Space on a dialog button must press that button, not spin the wheel
      const isInsideDialog = target instanceof Element && target.closest('[role="dialog"]');

      // Space: Spin the wheel (but NOT when typing in input fields or inside a dialog)
      if (event.code === 'Space' && !isInputField && !isInsideDialog) {
        event.preventDefault();
        onSpinTrigger?.();
      }

      // Escape: Close modals/dropdowns (works everywhere)
      if (event.key === 'Escape') {
        onEscapePress?.();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [onSpinTrigger, onEscapePress]);
}
