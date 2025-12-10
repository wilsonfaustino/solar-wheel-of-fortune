import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onSpinTrigger?: () => void;
  onEscapePress?: () => void;
}

export function useKeyboardShortcuts({
  onSpinTrigger,
  onEscapePress,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        onSpinTrigger?.();
      }

      if (event.key === "Escape") {
        onEscapePress?.();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [onSpinTrigger, onEscapePress]);
}
