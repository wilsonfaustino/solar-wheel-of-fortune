import { Eraser, RotateCcw } from 'lucide-react';
import { memo } from 'react';
import { ActionButtons } from './names-list/ActionButtons';

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
    <div className="px-4 py-4 flex gap-2 border-t border-t-white/10">
      <ActionButtons
        hasTargetContent={hasSelections}
        onClick={onClearSelections}
        title={hasSelections ? 'Clear selection history' : 'No selections to clear'}
      >
        <Eraser className="size-4" />
        CLEAR
      </ActionButtons>
      <ActionButtons
        hasTargetContent={hasNames}
        onClick={handleReset}
        title={hasNames ? 'Reset selections and exclusions' : 'No names to reset'}
      >
        <RotateCcw className="size-4" />
        RESET
      </ActionButtons>
    </div>
  );
}

export const BulkActionsPanel = memo(BulkActionsPanelComponent);
