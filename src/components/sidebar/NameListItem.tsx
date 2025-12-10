import { memo, useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import type { Name } from "../../types/name";

interface NameListItemProps {
  name: Name;
  onEdit: (nameId: string, newValue: string) => void;
  onDelete: (nameId: string) => void;
  onToggleExclude: (nameId: string) => void;
}

function NameListItemComponent({
  name,
  onEdit,
  onDelete,
  onToggleExclude,
}: NameListItemProps) {
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
      className={`px-4 py-3 border-b border-white/5 last:border-b-0
                 hover:bg-white/5 transition-colors group
                 ${name.isExcluded ? "opacity-50" : ""}`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="w-full px-2 py-1 bg-black/50 border border-cyan-400/50
                     text-white font-mono text-sm
                     focus:outline-none focus:ring-2 focus:ring-cyan-400"
          maxLength={100}
        />
      ) : (
        <div className="flex items-center justify-between">
          <button
            onDoubleClick={() => setIsEditing(true)}
            className="flex-1 text-left flex items-center gap-2"
          >
            <span
              className={`text-white font-mono text-sm
                             ${name.isExcluded ? "line-through" : ""}`}
            >
              {name.value}
            </span>
            {name.selectionCount > 0 && (
              <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400
                               text-xs font-mono rounded">
                {name.selectionCount}x
              </span>
            )}
          </button>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleExclude(name.id)}
              className={`p-1.5 hover:bg-white/10 rounded transition-colors
                         ${name.isExcluded ? "text-white/30" : "text-cyan-400/70"}`}
              aria-label={name.isExcluded ? "Include name" : "Exclude name"}
              title={name.isExcluded ? "Include in spins" : "Exclude from spins"}
            >
              {name.isExcluded ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-cyan-400/70"
              aria-label={`Edit ${name.value}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(name.id)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors text-red-400/70"
              aria-label={`Delete ${name.value}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const NameListItem = memo(NameListItemComponent);
