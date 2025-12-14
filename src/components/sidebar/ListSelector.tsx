import { ChevronDown, Edit2, Plus, Trash2 } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import type { NameList } from '../../types/name';
import { cn } from '../../utils/cn';

interface ListSelectorProps {
  lists: NameList[];
  activeListId: string | null;
  onSelectList: (listId: string) => void;
  onCreateList: () => void;
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
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeList = lists.find((list) => list.id === activeListId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setEditingId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleDeleteClick = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    if (lists.length === 1) {
      alert('Cannot delete the only list');
      return;
    }

    if (list.names.length > 5) {
      const confirmed = confirm(
        `Delete "${list.title}" with ${list.names.length} names? This cannot be undone.`
      );
      if (!confirmed) return;
    }

    onDeleteList(listId);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between group border border-(--color-border-light) bg-black/60 hover:bg-white/5"
      >
        <div className="flex-1 text-left">
          <div className="text-xs tracking-wider mb-1 font-mono text-text/50">ACTIVE LIST</div>
          <div className="tracking-wider font-light font-mono text-accent">
            {activeList?.title ?? 'No List'}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-accent/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 backdrop-blur-sm z-50 max-h-80 overflow-y-auto scrollbar-themed bg-black/90 border border-border-light">
          {/* List Items */}
          {lists.map((list) => (
            <div
              key={list.id}
              className={cn(
                'px-4 py-3 last:border-b-0 transition-colors group border-b border-b-white/5',
                list.id === activeListId ? 'bg-accent-10' : 'bg-transparent hover:bg-white/5'
              )}
            >
              {editingId === list.id ? (
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
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectList(list.id);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="font-mono text-sm text-text">{list.title}</div>
                    <div className="text-xs font-mono text-text/40">{list.names.length} names</div>
                  </button>

                  {list.id !== activeListId && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(list.id);
                        }}
                        className="p-1 rounded text-accent/70 bg-transparent hover:bg-white/5"
                        aria-label={`Edit ${list.title}`}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(list.id);
                        }}
                        className="p-1 rounded text-red-400/70 bg-transparent hover:bg-white/5"
                        aria-label={`Delete ${list.title}`}
                        disabled={lists.length === 1}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Create New Button */}
          <button
            type="button"
            onClick={() => {
              onCreateList();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 transition-colors flex items-center gap-2 bg-accent-05 border-t border-border-light hover:bg-accent-10 text-accent"
          >
            <Plus className="size-5" />
            <span className="font-mono text-sm tracking-wider">CREATE NEW LIST</span>
          </button>
        </div>
      )}
    </div>
  );
}

export const ListSelector = memo(ListSelectorComponent);
