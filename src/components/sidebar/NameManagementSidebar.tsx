import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNameStore } from '../../stores/useNameStore';
import { AddNameForm } from './AddNameForm';
import { BulkActionsPanel } from './BulkActionsPanel';
import { HistoryPanel } from './HistoryPanel';
import { ListSelector } from './ListSelector';
import { NameListDisplay } from './NameListDisplay';

interface NameManagementSidebarProps {
  className?: string;
}

function NameManagementSidebarComponent({ className = '' }: NameManagementSidebarProps) {
  const [activeTab, setActiveTab] = useState<'names' | 'history'>('names');

  // Select store state
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({
      lists: state.lists,
      activeListId: state.activeListId,
    }))
  );

  // Select store actions
  const addName = useNameStore((state) => state.addName);
  const updateName = useNameStore((state) => state.updateName);
  const deleteName = useNameStore((state) => state.deleteName);
  const toggleNameExclusion = useNameStore((state) => state.toggleNameExclusion);
  const setActiveList = useNameStore((state) => state.setActiveList);
  const createList = useNameStore((state) => state.createList);
  const deleteList = useNameStore((state) => state.deleteList);
  const updateListTitle = useNameStore((state) => state.updateListTitle);
  const clearSelections = useNameStore((state) => state.clearSelections);
  const resetList = useNameStore((state) => state.resetList);
  const bulkAddNames = useNameStore((state) => state.bulkAddNames);

  // Get active list
  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId),
    [lists, activeListId]
  );

  // Check if list has selections
  const hasSelections = useMemo(
    () => activeList?.names.some((name) => name.selectionCount > 0) || false,
    [activeList]
  );

  // Callbacks
  const handleCreateList = useCallback(() => {
    const title = prompt('Enter list name:', 'New List');
    if (title?.trim()) {
      createList(title.trim());
    }
  }, [createList]);

  const handleEditName = useCallback(
    (nameId: string, newValue: string) => {
      updateName(nameId, { value: newValue.toUpperCase() });
    },
    [updateName]
  );

  return (
    <div className={`w-80 bg-black/90 border-r border-white/10 flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab('names')}
          className={`flex-1 px-4 py-3 font-mono text-sm transition-colors
                      ${
                        activeTab === 'names'
                          ? 'border-b-2 border-cyan-400 text-cyan-400'
                          : 'text-white/50 hover:text-white/70'
                      }`}
        >
          Names
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 font-mono text-sm transition-colors
                      ${
                        activeTab === 'history'
                          ? 'border-b-2 border-cyan-400 text-cyan-400'
                          : 'text-white/50 hover:text-white/70'
                      }`}
        >
          History
        </button>
      </div>

      {/* Names Tab Content */}
      {activeTab === 'names' && (
        <>
          {/* List Selector */}
          <ListSelector
            lists={lists}
            activeListId={activeListId}
            onSelectList={setActiveList}
            onCreateList={handleCreateList}
            onDeleteList={deleteList}
            onRenameList={updateListTitle}
          />

          {/* Add Name Form */}
          <AddNameForm onAddName={addName} onBulkImport={bulkAddNames} />

          {/* Name List Display */}
          <NameListDisplay
            names={activeList?.names || []}
            onEdit={handleEditName}
            onDelete={deleteName}
            onToggleExclude={toggleNameExclusion}
          />

          {/* Bulk Actions */}
          <BulkActionsPanel
            hasNames={!!activeList && activeList.names.length > 0}
            hasSelections={hasSelections}
            onClearSelections={clearSelections}
            onResetList={resetList}
          />
        </>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && <HistoryPanel />}
    </div>
  );
}

export const NameManagementSidebar = memo(NameManagementSidebarComponent);
