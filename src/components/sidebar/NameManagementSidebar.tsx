import { memo, useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { cn } from '@/lib/utils';
import { selectActiveList, useNameStore } from '../../stores/useNameStore';
import { AddNameForm } from './AddNameForm';
import { BulkActionsPanel } from './BulkActionsPanel';
import { CyclesPanel } from './CyclesPanel';
import { EventsPanel } from './EventsPanel';
import { HistoryPanel } from './HistoryPanel';
import { ListSelector } from './ListSelector';
import { NameListDisplay } from './NameListDisplay';
import { SettingsPanel } from './SettingsPanel';
import { ShareListActions } from './ShareListActions';
import { TabSelectionButton } from './TabSelectionButton';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NameManagementSidebarProps {
  className?: string;
  isMobile?: boolean;
}

function NameManagementSidebarComponent({
  className = '',
  isMobile = false,
}: Readonly<NameManagementSidebarProps>) {
  const [activeTab, setActiveTab] = useState<'names' | 'history' | 'cycles' | 'settings'>('names');

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
  const volunteerName = useNameStore((state) => state.volunteerName);
  const setUnavailability = useNameStore((state) => state.setUnavailability);
  const clearUnavailability = useNameStore((state) => state.clearUnavailability);

  // Get active list
  const activeList = useMemo(
    () => selectActiveList({ lists, activeListId }),
    [lists, activeListId]
  );

  // Check if list has selections
  const hasSelections = useMemo(
    () => activeList?.names.some((name) => name.selectionCount > 0) || false,
    [activeList]
  );

  // Callbacks
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
          aria-label="Cycles tab"
          isActiveTab={activeTab === 'cycles'}
          onSelectTab={() => setActiveTab('cycles')}
        >
          Cycles
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
            onCreateList={createList}
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
            onVolunteer={volunteerName}
            onSetUnavailability={setUnavailability}
            onClearUnavailability={clearUnavailability}
          />

          {/* Bulk Actions */}
          <BulkActionsPanel
            hasNames={!!activeList && activeList.names.length > 0}
            hasSelections={hasSelections}
            onClearSelections={clearSelections}
            onResetList={resetList}
          />

          <ShareListActions activeList={activeList} />
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
        <div className="flex flex-col flex-1 min-h-0">
          <HistoryPanel />
        </div>
      )}

      {/* Cycles Tab Content */}
      {activeTab === 'cycles' && (
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <CyclesPanel />
          <EventsPanel />
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="flex flex-col flex-1 min-h-0">
          <ThemeSwitcher />
          <SettingsPanel />
        </div>
      )}
    </div>
  );
}

export const NameManagementSidebar = memo(NameManagementSidebarComponent);
