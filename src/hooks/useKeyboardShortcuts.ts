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

      // Space: Spin the wheel (but NOT when typing in input fields)
      if (event.code === 'Space' && !isInputField) {
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
