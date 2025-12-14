import { Download, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNameStore } from '../../stores/useNameStore';
import type { SelectionRecord } from '../../types/name';
import { ExportModal } from './ExportModal';
import { HistoryItem } from './HistoryItem';

const DISPLAY_LIMIT = 20;

function HistoryPanelComponent() {
  const history = useNameStore((state) => state.history);
  const deleteHistoryItem = useNameStore((state) => state.deleteHistoryItem);
  const clearHistory = useNameStore((state) => state.clearHistory);
  const [showExportModal, setShowExportModal] = useState(false);

  const stats = useMemo(() => {
    const total = history.length;
    const uniqueNames = new Set(history.map((r) => r.nameId)).size;
    const lastSelection = history.at(-1)?.timestamp ?? null;
    return {
      total,
      unique: uniqueNames,
      lastSelection,
    };
  }, [history]);

  const handleDeleteItem = useCallback(
    (recordId: string) => {
      deleteHistoryItem(recordId);
    },
    [deleteHistoryItem]
  );

  const handleClearHistory = useCallback(() => {
    if (confirm('Clear all selection history? This cannot be undone.')) {
      clearHistory();
    }
  }, [clearHistory]);

  const handleOpenExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const handleCloseExport = useCallback(() => {
    setShowExportModal(false);
  }, []);

  const displayedHistory = useMemo(() => history.slice(-DISPLAY_LIMIT).reverse(), [history]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-b-(--color-border-light)">
        <h2 className="font-mono text-sm font-semibold text-text">History</h2>
        <p className="text-xs mt-1 text-text/50">
          {stats.total === 0
            ? 'No selections yet'
            : `${stats.total} total • ${stats.unique} unique`}
        </p>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <p className="text-sm text-center text-text/40">
            Spin the wheel to record selections here
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-themed">
            {displayedHistory.map((record: SelectionRecord) => (
              <HistoryItem key={record.id} record={record} onDelete={handleDeleteItem} />
            ))}
          </div>

          <div className="px-4 py-3 flex gap-2 border-t border-t-(--color-border-light)">
            <button
              type="button"
              onClick={handleOpenExport}
              className="flex-1 px-4 py-2 transition-colors font-mono text-sm flex items-center justify-center gap-2 border border-(--color-border-light) text-(--color-accent) bg-transparent hover:bg-accent-20"
              aria-label="Export selection history"
            >
              <Download className="size-4" />
              Export
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex-1 px-4 py-2 transition-colors font-mono text-sm flex items-center justify-center gap-2 text-red-400 border border-destructive/30 bg-transparent hover:bg-destructive/20"
              aria-label="Clear all history"
            >
              <Trash2 className="size-4" />
              Clear
            </button>
          </div>
        </>
      )}

      {showExportModal && <ExportModal records={history} onClose={handleCloseExport} />}
    </div>
  );
}

export const HistoryPanel = memo(HistoryPanelComponent);
