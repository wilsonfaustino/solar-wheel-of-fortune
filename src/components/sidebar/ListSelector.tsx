import { ChevronDown, Edit2, Plus, Trash2 } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import type { NameList } from '../../types/name';

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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-black/60 border border-cyan-400/30
                   hover:bg-white/5 transition-colors duration-200
                   flex items-center justify-between group"
      >
        <div className="flex-1 text-left">
          <div className="text-xs text-white/50 tracking-wider mb-1 font-mono">ACTIVE LIST</div>
          <div className="text-cyan-400 tracking-wider font-light font-mono">
            {activeList?.title || 'No List'}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-cyan-400/50 transition-transform
                      ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-black/90
                        border border-cyan-400/30 backdrop-blur-sm z-50
                        max-h-80 overflow-y-auto"
        >
          {/* List Items */}
          {lists.map((list) => (
            <div
              key={list.id}
              className={`px-4 py-3 border-b border-white/5 last:border-b-0
                         hover:bg-white/5 transition-colors group
                         ${list.id === activeListId ? 'bg-cyan-400/10' : ''}`}
            >
              {editingId === list.id ? (
                <input
                  type="text"
                  defaultValue={list.title}
                  className="w-full bg-black/50 border border-cyan-400/50
                             px-2 py-1 text-white font-mono text-sm
                             focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                    onClick={() => {
                      onSelectList(list.id);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-white font-mono text-sm">{list.title}</div>
                    <div className="text-white/40 text-xs font-mono">{list.names.length} names</div>
                  </button>

                  {list.id !== activeListId && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(list.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                        aria-label={`Edit ${list.title}`}
                      >
                        <Edit2 className="w-4 h-4 text-cyan-400/70" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(list.id);
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                        aria-label={`Delete ${list.title}`}
                        disabled={lists.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-400/70" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Create New Button */}
          <button
            onClick={() => {
              onCreateList();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 bg-cyan-400/5 hover:bg-cyan-400/10
                       transition-colors flex items-center gap-2
                       border-t border-cyan-400/30"
          >
            <Plus className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-sm tracking-wider">CREATE NEW LIST</span>
          </button>
        </div>
      )}
    </div>
  );
}

export const ListSelector = memo(ListSelectorComponent);
