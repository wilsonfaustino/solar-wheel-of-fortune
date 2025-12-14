import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useNameStore } from '../../stores/useNameStore';
import { cn } from '../../utils/cn';
import { AddNameForm } from './AddNameForm';
import { BulkActionsPanel } from './BulkActionsPanel';
import { HistoryPanel } from './HistoryPanel';
import { ListSelector } from './ListSelector';
import { NameListDisplay } from './NameListDisplay';
import { TabSelectionButton } from './TabSelectionButton';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NameManagementSidebarProps {
  className?: string;
  isMobile?: boolean;
}

function NameManagementSidebarComponent({
  className = '',
  isMobile = false,
}: NameManagementSidebarProps) {
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
      className={cn(
        'w-80 border-r flex flex-col bg-black/90 border-r-border-light',
        isMobile ? 'h-full' : 'h-screen',
        className
      )}
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-b-border-light">
        <TabSelectionButton
          aria-label="Names tab"
          isActiveTab={activeTab === 'names'}
          onSelectTab={() => setActiveTab('names')}
        >
          Names
        </TabSelectionButton>
        <TabSelectionButton
          aria-label="History tab"
          isActiveTab={activeTab === 'history'}
          onSelectTab={() => setActiveTab('history')}
        >
          History
        </TabSelectionButton>
        <TabSelectionButton
          aria-label="Settings tab"
          isActiveTab={activeTab === 'settings'}
          onSelectTab={() => setActiveTab('settings')}
        >
          Settings
        </TabSelectionButton>
      </div>

      {/* Names Tab Content */}
      {activeTab === 'names' && (
        <div className="flex flex-col flex-1 min-h-0">
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
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="flex flex-col flex-1 min-h-0">
          <HistoryPanel />
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="flex flex-col flex-1 min-h-0">
          <ThemeSwitcher />
        </div>
      )}
    </div>
  );
}

export const NameManagementSidebar = memo(NameManagementSidebarComponent);
