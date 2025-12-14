import { Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import type { Name } from '../../types/name';
import { cn } from '../../utils/cn';

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
      className={cn(
        'px-4 py-3 last:border-b-0 transition-colors group bg-transparent border-b border-b-white/5 hover:bg-white/5',
        name.isExcluded ? 'opacity-50' : 'opacity-100'
      )}
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
          className="w-full px-2 py-1 font-mono text-sm text-text bg-black/50 border border-accent shadow-none focus:outline-none focus:shadow-accent focus:shadow-xs"
          maxLength={100}
        />
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onDoubleClick={() => setIsEditing(true)}
            className="flex-1 text-left flex items-center gap-2"
          >
            <span className={cn('font-mono text-sm text-text', name.isExcluded && 'line-through')}>
              {name.value}
            </span>
            {name.selectionCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono rounded text-accent bg-accent-20">
                {name.selectionCount}x
              </span>
            )}
          </button>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onToggleExclude(name.id)}
              className={cn(
                'p-2 rounded transition-colors h-10 w-10 flex items-center justify-center bg-transparent hover:bg-white/10',
                name.isExcluded ? 'text-text opacity-30' : 'text-accent opacity-70'
              )}
              aria-label={name.isExcluded ? 'Include name' : 'Exclude name'}
              title={name.isExcluded ? 'Include in spins' : 'Exclude from spins'}
            >
              {name.isExcluded ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-2 rounded transition-colors h-10 w-10 flex items-center justify-center bg-transparent text-accent opacity-70 hover:bg-white/10"
              aria-label={`Edit ${name.value}`}
            >
              <Edit2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(name.id)}
              className="p-2 rounded transition-colors text-red-400/70 h-10 w-10 flex items-center justify-center bg-transparent hover:bg-white/10"
              aria-label={`Delete ${name.value}`}
            >
              <Trash2 className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const NameListItem = memo(NameListItemComponent);
