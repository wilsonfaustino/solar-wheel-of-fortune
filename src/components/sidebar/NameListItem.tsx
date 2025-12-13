import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import type { Name } from '../../types/name';

interface NameListItemProps {
  name: Name;
  onEdit: (nameId: string, newValue: string) => void;
  onDelete: (nameId: string) => void;
  onToggleExclude: (nameId: string) => void;
}

function NameListItemComponent({ name, onEdit, onDelete, onToggleExclude }: NameListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name.value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== name.value) {
      onEdit(name.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(name.value);
    setIsEditing(false);
  };

  return (
    <div
      className="px-4 py-3 last:border-b-0 transition-colors group"
      style={{
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        borderBottomWidth: '1px',
        opacity: name.isExcluded ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
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
          maxLength={100}
        />
      ) : (
        <div className="flex items-center justify-between">
          <button
            onDoubleClick={() => setIsEditing(true)}
            className="flex-1 text-left flex items-center gap-2"
          >
            <span
              className={`font-mono text-sm ${name.isExcluded ? 'line-through' : ''}`}
              style={{ color: 'var(--color-text)' }}
            >
              {name.value}
            </span>
            {name.selectionCount > 0 && (
              <span
                className="px-2 py-0.5 text-xs font-mono rounded"
                style={{
                  backgroundColor: 'var(--color-accent-20)',
                  color: 'var(--color-accent)',
                }}
              >
                {name.selectionCount}x
              </span>
            )}
          </button>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onToggleExclude(name.id)}
              className="p-2 rounded transition-colors h-10 w-10 flex items-center justify-center"
              style={{
                color: name.isExcluded ? 'var(--color-text)' : 'var(--color-accent)',
                opacity: name.isExcluded ? 0.3 : 0.7,
              }}
              aria-label={name.isExcluded ? 'Include name' : 'Exclude name'}
              title={name.isExcluded ? 'Include in spins' : 'Exclude from spins'}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {name.isExcluded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 rounded transition-colors h-10 w-10 flex items-center justify-center"
              style={{ color: 'var(--color-accent)', opacity: 0.7 }}
              aria-label={`Edit ${name.value}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(name.id)}
              className="p-2 rounded transition-colors text-red-400/70 h-10 w-10 flex items-center justify-center"
              aria-label={`Delete ${name.value}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const NameListItem = memo(NameListItemComponent);
