import { Eraser, RotateCcw } from 'lucide-react';
import { memo } from 'react';

interface BulkActionsPanelProps {
  hasNames: boolean;
  hasSelections: boolean;
  onClearSelections: () => void;
  onResetList: () => void;
}

function BulkActionsPanelComponent({
  hasNames,
  hasSelections,
  onClearSelections,
  onResetList,
}: BulkActionsPanelProps) {
  const handleReset = () => {
    if (!hasNames) return;

    const confirmed = confirm(
      'Reset list? This will clear all selections and exclusions. Names will remain.'
    );
    if (confirmed) {
      onResetList();
    }
  };

  return (
    <div
      className="px-4 py-4 flex gap-2"
      style={{
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderTopWidth: '1px',
      }}
    >
      <button
        type="button"
        onClick={onClearSelections}
        disabled={!hasSelections}
        className="flex-1 px-3 py-2 transition-colors font-mono text-xs tracking-wider disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: '1px',
          color: 'var(--color-text)',
          opacity: hasSelections ? 0.7 : 0.3,
        }}
        title={hasSelections ? 'Clear selection history' : 'No selections to clear'}
        onMouseEnter={(e) => {
          if (hasSelections) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Eraser className="size-4" />
        CLEAR
      </button>
      <button
        type="button"
        onClick={handleReset}
        disabled={!hasNames}
        className="flex-1 px-3 py-2 transition-colors font-mono text-xs tracking-wider disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: '1px',
          color: 'var(--color-text)',
          opacity: hasNames ? 0.7 : 0.3,
        }}
        title={hasNames ? 'Reset selections and exclusions' : 'No names to reset'}
        onMouseEnter={(e) => {
          if (hasNames) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <RotateCcw className="size-4" />
        RESET
      </button>
    </div>
  );
}

export const BulkActionsPanel = memo(BulkActionsPanelComponent);
