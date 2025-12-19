import { Eraser, RotateCcw } from 'lucide-react';
import { memo } from 'react';
import { UncontrolledConfirmDialog } from '../shared';
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

      <UncontrolledConfirmDialog
        title="Reset List?"
        description="This will clear all selections and exclusions. Names will remain."
        confirmLabel="Reset"
        onConfirm={onResetList}
        variant="danger"
      >
        <ActionButtons
          hasTargetContent={hasNames}
          title={hasNames ? 'Reset selections and exclusions' : 'No names to reset'}
        >
          <RotateCcw className="size-4" />
          RESET
        </ActionButtons>
      </UncontrolledConfirmDialog>
    </div>
  );
}

export const BulkActionsPanel = memo(BulkActionsPanelComponent);
