import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Edit2, Plus, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { NameList } from '../../types/name';
import { ConfirmDialog } from '../shared';
import { Button } from '../ui/button';

interface ListSelectorProps {
  lists: NameList[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onCreateList: (title: string) => void;
  onDeleteList: (listId: string) => void;
  onRenameList: (listId: string, newTitle: string) => void;
}

function ListSelectorComponent({
  lists,
  activeListId,
  onSelectList,
  onCreateList,
  onDeleteList,
  onRenameList,
}: ListSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    listId: string;
    title: string;
    nameCount: number;
  } | null>(null);
  const [createTitle, setCreateTitle] = useState<string | null>(null);

  const activeList = lists.find((list) => list.id === activeListId);

  const handleCreateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = createTitle?.trim();
    if (!trimmed) return;

    onCreateList(trimmed);
    setCreateTitle(null);
  };

  const handleDeleteClick = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    if (lists.length === 1) {
      setDeleteConfirm({
        listId: 'error',
        title: 'Cannot delete the only list',
        nameCount: 0,
      });
      return;
    }

    // Only confirm when the delete would lose names; an empty list costs nothing to recreate
    if (list.names.length > 0) {
      setDeleteConfirm({
        listId: list.id,
        title: list.title,
        nameCount: list.names.length,
      });
    } else {
      onDeleteList(listId);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm && deleteConfirm.listId !== 'error') {
      onDeleteList(deleteConfirm.listId);
    }
    setDeleteConfirm(null);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="tech-outline"
          size="tech-default"
          className="w-full h-auto justify-between data-[state=open]:bg-white/5"
        >
          <div className="flex-1 text-left">
            <div className="text-xs tracking-wider mb-1 font-mono text-text/50">ACTIVE LIST</div>
            <div className="tracking-wider font-light font-mono text-accent">
              {activeList?.title ?? 'No List'}
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-accent/50 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="w-(--radix-dropdown-menu-trigger-width) mt-2 backdrop-blur-sm z-50 max-h-80 overflow-y-auto scrollbar-themed bg-black/90 border border-border-light focus:outline-none"
          align="start"
          sideOffset={8}
        >
          {/* List Items */}
          {lists.map((list) => (
            <div
              key={list.id}
              className={cn(
                'last:border-b-0 border-b border-b-white/5',
                list.id === activeListId ? 'bg-accent-10' : 'bg-transparent'
              )}
            >
              {editingId === list.id ? (
                <div className="px-4 py-3">
                  <input
                    type="text"
                    defaultValue={list.title}
                    className="w-full px-2 py-1 font-mono text-sm focus:outline-none bg-black/50 border border-accent text-text/50 focus:shadow-accent focus:shadow-xs"
                    onBlur={(e) => {
                      onRenameList(list.id, e.target.value);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onRenameList(list.id, e.currentTarget.value);
                        setEditingId(null);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                  />
                </div>
              ) : (
                <DropdownMenu.Item
                  className="px-4 py-3 transition-colors group hover:bg-white/5 focus:bg-white/5 focus:outline-none cursor-default"
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectList(list.id);
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="font-mono text-sm text-text">{list.title}</div>
                      <div className="text-xs font-mono text-text/40">
                        {list.names.length} names
                      </div>
                    </button>

                    {list.id !== activeListId && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(list.id);
                          }}
                          variant="tech-ghost"
                          size="icon-sm"
                          className="text-accent/70"
                          aria-label={`Edit ${list.title}`}
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(list.id);
                          }}
                          variant="tech-destructive"
                          size="icon-sm"
                          disabled={lists.length === 1}
                          aria-label={`Delete ${list.title}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </DropdownMenu.Item>
              )}
            </div>
          ))}

          {/* Create New Button */}
          <DropdownMenu.Separator className="h-px bg-border-light my-0" />
          <DropdownMenu.Item
            className="w-full px-4 py-3 transition-colors flex items-center gap-2 bg-accent-05 text-accent hover:bg-accent-10 focus:bg-accent-10 focus:outline-none cursor-default"
            onSelect={() => setCreateTitle('New List')}
          >
            <Plus className="size-5" />
            <span className="font-mono text-sm tracking-wider">CREATE NEW LIST</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>

      {createTitle !== null && (
        <Dialog.Root open onOpenChange={() => setCreateTitle(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-sm w-full bg-black border border-border-light z-50 focus:outline-none">
              <Dialog.Title className="font-mono text-lg mb-2 tracking-wider text-accent">
                CREATE NEW LIST
              </Dialog.Title>
              <Dialog.Description className="font-mono text-xs mb-4 text-text/50">
                Name the list you want to add.
              </Dialog.Description>
              <form onSubmit={handleCreateSubmit}>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Enter list name..."
                  aria-label="List name"
                  maxLength={100}
                  className="w-full px-3 py-3 h-11 font-mono text-sm text-text bg-black/50 border border-border-light shadow-none focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30"
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    type="submit"
                    disabled={createTitle.trim().length === 0}
                    variant="tech"
                    size="tech-default"
                    className="flex-1 text-sm"
                  >
                    CREATE
                  </Button>
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      variant="tech-outline"
                      size="tech-default"
                      className="text-sm"
                    >
                      CANCEL
                    </Button>
                  </Dialog.Close>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title={deleteConfirm?.listId === 'error' ? 'Cannot Delete List' : 'Delete List?'}
        description={
          deleteConfirm?.listId === 'error'
            ? 'You must have at least one list. Create another list before deleting this one.'
            : `Delete "${deleteConfirm?.title}" and its ${deleteConfirm?.nameCount} ${deleteConfirm?.nameCount === 1 ? 'name' : 'names'}? This action cannot be undone.`
        }
        confirmLabel={deleteConfirm?.listId === 'error' ? undefined : 'Delete'}
        onConfirm={handleConfirmDelete}
        variant={deleteConfirm?.listId === 'error' ? 'info' : 'danger'}
      />
    </DropdownMenu.Root>
  );
}

export const ListSelector = memo(ListSelectorComponent);
