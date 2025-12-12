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
        className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between group"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderColor: 'var(--color-border-light)',
          borderWidth: '1px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        }}
      >
        <div className="flex-1 text-left">
          <div
            className="text-xs tracking-wider mb-1 font-mono"
            style={{ color: 'var(--color-text)', opacity: 0.5 }}
          >
            ACTIVE LIST
          </div>
          <div
            className="tracking-wider font-light font-mono"
            style={{ color: 'var(--color-accent)' }}
          >
            {activeList?.title || 'No List'}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--color-accent)', opacity: 0.5 }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 backdrop-blur-sm z-50 max-h-80 overflow-y-auto"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            borderColor: 'var(--color-border-light)',
            borderWidth: '1px',
          }}
        >
          {/* List Items */}
          {lists.map((list) => (
            <div
              key={list.id}
              className="px-4 py-3 last:border-b-0 transition-colors group"
              style={{
                borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                borderBottomWidth: '1px',
                backgroundColor:
                  list.id === activeListId ? 'var(--color-accent-10)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (list.id !== activeListId) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (list.id !== activeListId) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {editingId === list.id ? (
                <input
                  type="text"
                  defaultValue={list.title}
                  className="w-full px-2 py-1 font-mono text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderColor: 'var(--color-accent)',
                    borderWidth: '1px',
                    color: 'var(--color-text)',
                    opacity: 0.5,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
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
                    <div className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>
                      {list.title}
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: 'var(--color-text)', opacity: 0.4 }}
                    >
                      {list.names.length} names
                    </div>
                  </button>

                  {list.id !== activeListId && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(list.id);
                        }}
                        className="p-1 rounded"
                        style={{ color: 'var(--color-accent)', opacity: 0.7 }}
                        aria-label={`Edit ${list.title}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(list.id);
                        }}
                        className="p-1 rounded text-red-400/70"
                        aria-label={`Delete ${list.title}`}
                        disabled={lists.length === 1}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
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
            className="w-full px-4 py-3 transition-colors flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-accent-05)',
              borderTopColor: 'var(--color-border-light)',
              borderTopWidth: '1px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-10)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-05)';
            }}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
            <span
              className="font-mono text-sm tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              CREATE NEW LIST
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export const ListSelector = memo(ListSelectorComponent);
