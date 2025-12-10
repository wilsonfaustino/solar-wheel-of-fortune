import { memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useNameStore } from "../../stores/useNameStore";
import { ListSelector } from "./ListSelector";
import { AddNameForm } from "./AddNameForm";
import { NameListDisplay } from "./NameListDisplay";
import { BulkActionsPanel } from "./BulkActionsPanel";

interface NameManagementSidebarProps {
  className?: string;
}

function NameManagementSidebarComponent({
  className = "",
}: NameManagementSidebarProps) {
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
  const toggleNameExclusion = useNameStore(
    (state) => state.toggleNameExclusion
  );
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
    const title = prompt("Enter list name:", "New List");
    if (title && title.trim()) {
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
      className={`w-80 bg-black/90 border-r border-white/10 flex flex-col ${className}`}
    >
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
  );
}

export const NameManagementSidebar = memo(NameManagementSidebarComponent);
