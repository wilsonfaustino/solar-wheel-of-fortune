import { memo, useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";

interface AddNameFormProps {
  onAddName: (name: string) => void;
  onBulkImport: (names: string[]) => void;
}

function AddNameFormComponent({
  onAddName,
  onBulkImport,
}: AddNameFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();

      if (trimmed.length === 0) {
        setError("Name cannot be empty");
        return;
      }
      if (trimmed.length > 100) {
        setError("Name must be 100 characters or less");
        return;
      }

      onAddName(trimmed);
      setInputValue("");
      setError("");
    },
    [inputValue, onAddName]
  );

  const handleBulkImport = useCallback(() => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n.length <= 100);

    if (names.length === 0) {
      setError("No valid names to import");
      return;
    }

    onBulkImport(names);
    setBulkText("");
    setShowBulkImport(false);
    setError("");
  }, [bulkText, onBulkImport]);

  const charCount = inputValue.length;
  const showCharCount = charCount > 80;

  return (
    <div className="px-4 py-4 border-b border-white/10">
      {/* Add Name Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            placeholder="Enter name..."
            className="w-full px-3 py-2 bg-black/50 border border-cyan-400/30
                       text-white font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-400
                       placeholder:text-white/30"
            maxLength={100}
          />
          {showCharCount && (
            <div
              className={`text-xs font-mono mt-1
                            ${charCount >= 100 ? "text-red-400" : "text-white/50"}`}
            >
              {charCount}/100
            </div>
          )}
          {error && (
            <div className="text-xs text-red-400 font-mono mt-1">{error}</div>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/30
                     hover:bg-cyan-400/20 transition-colors
                     text-cyan-400 font-mono text-sm tracking-wider"
          aria-label="Add name"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Bulk Import Link */}
      <button
        onClick={() => setShowBulkImport(true)}
        className="mt-3 text-xs text-cyan-400/70 hover:text-cyan-400
                   font-mono tracking-wider flex items-center gap-1"
      >
        <Upload className="w-3 h-3" />
        BULK IMPORT
      </button>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50
                        flex items-center justify-center p-4"
          onClick={() => {
            setShowBulkImport(false);
            setBulkText("");
            setError("");
          }}
        >
          <div
            className="bg-black border border-cyan-400/30 p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-cyan-400 font-mono text-lg mb-4 tracking-wider">
              BULK IMPORT
            </h3>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowBulkImport(false);
                  setBulkText("");
                  setError("");
                }
              }}
              placeholder="Paste names (one per line)"
              className="w-full h-64 px-3 py-2 bg-black/50 border border-cyan-400/30
                         text-white font-mono text-sm
                         focus:outline-none focus:ring-2 focus:ring-cyan-400
                         placeholder:text-white/30 resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleBulkImport}
                className="flex-1 px-4 py-2 bg-cyan-400/10 border border-cyan-400/30
                           hover:bg-cyan-400/20 transition-colors
                           text-cyan-400 font-mono text-sm tracking-wider"
              >
                IMPORT
              </button>
              <button
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkText("");
                  setError("");
                }}
                className="px-4 py-2 border border-white/20
                           hover:bg-white/5 transition-colors
                           text-white/70 font-mono text-sm tracking-wider"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const AddNameForm = memo(AddNameFormComponent);
