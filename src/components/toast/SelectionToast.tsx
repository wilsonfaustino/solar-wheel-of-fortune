import { X } from 'lucide-react';
import type { Name } from '../../types/name';

interface SelectionToastProps {
  name: Name;
  timestamp: Date;
  onDismiss?: () => void;
}

export function SelectionToast({ name, timestamp, onDismiss }: SelectionToastProps) {
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="w-120 sm:max-w-sm p-3 sm:p-4 bg-black border border-border-light font-mono shadow-lg lg:translate-x-40">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 sm:gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[0.625rem] sm:text-xs tracking-wider text-text/50 mb-1">
            SELECTED
          </div>
          <div className="text-xl sm:text-2xl tracking-wider font-light text-(--color-accent) wrap-break-word leading-tight">
            {name.value}
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 w-5 h-5 flex items-center justify-center text-text/40 hover:text-text/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-50 rounded"
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[0.625rem] sm:text-xs text-text/40 tracking-wider">
        <span>{formattedTime}</span>
        {name.selectionCount > 0 && (
          <span className="ml-2 truncate">PICKED {name.selectionCount + 1}x</span>
        )}
      </div>
    </div>
  );
}
