import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNameStore } from '../../stores/useNameStore';
import { AddNameForm } from './AddNameForm';
import { BulkActionsPanel } from './BulkActionsPanel';
import { HistoryPanel } from './HistoryPanel';
import { ListSelector } from './ListSelector';
import { NameListDisplay } from './NameListDisplay';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NameManagementSidebarProps {
  className?: string;
}

function NameManagementSidebarComponent({ className = '' }: NameManagementSidebarProps) {
  const [activeTab, setActiveTab] = useState<'names' | 'history' | 'settings'>('names');

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
    <div
      className={`w-80 border-r flex flex-col h-screen ${className}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRightColor: 'var(--color-border-light)',
        borderRightWidth: '1px',
      }}
    >
      {/* Tab Navigation */}
      <div
        className="flex"
        style={{
          borderBottomColor: 'var(--color-border-light)',
          borderBottomWidth: '1px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('names')}
          className="flex-1 px-4 py-3 font-mono text-sm transition-colors"
          style={{
            borderBottom: activeTab === 'names' ? '2px solid var(--color-accent)' : 'none',
            color: activeTab === 'names' ? 'var(--color-accent)' : 'var(--color-text)',
            opacity: activeTab === 'names' ? 1 : 0.5,
          }}
        >
          Names
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="flex-1 px-4 py-3 font-mono text-sm transition-colors"
          style={{
            borderBottom: activeTab === 'history' ? '2px solid var(--color-accent)' : 'none',
            color: activeTab === 'history' ? 'var(--color-accent)' : 'var(--color-text)',
            opacity: activeTab === 'history' ? 1 : 0.5,
          }}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="flex-1 px-4 py-3 font-mono text-sm transition-colors"
          style={{
            borderBottom: activeTab === 'settings' ? '2px solid var(--color-accent)' : 'none',
            color: activeTab === 'settings' ? 'var(--color-accent)' : 'var(--color-text)',
            opacity: activeTab === 'settings' ? 1 : 0.5,
          }}
        >
          Settings
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

      {/* Settings Tab Content */}
      {activeTab === 'settings' && <ThemeSwitcher />}
    </div>
  );
}

export const NameManagementSidebar = memo(NameManagementSidebarComponent);
