import { Plus, Upload } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

interface AddNameFormProps {
  onAddName: (name: string) => void;
  onBulkImport: (names: string[]) => void;
}

function AddNameFormComponent({ onAddName, onBulkImport }: AddNameFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();

      if (trimmed.length === 0) {
        setError('Name cannot be empty');
        return;
      }
      if (trimmed.length > 100) {
        setError('Name must be 100 characters or less');
        return;
      }

      onAddName(trimmed);
      setInputValue('');
      setError('');
    },
    [inputValue, onAddName]
  );

  const handleBulkImport = useCallback(() => {
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n.length <= 100);

    if (names.length === 0) {
      setError('No valid names to import');
      return;
    }

    onBulkImport(names);
    setBulkText('');
    setShowBulkImport(false);
    setError('');
  }, [bulkText, onBulkImport]);

  const charCount = inputValue.length;
  const showCharCount = charCount > 80;

  return (
    <div className="px-4 py-4 border-b" style={{ borderBottomColor: 'var(--color-border-light)' }}>
      {/* Add Name Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            placeholder="Enter name..."
            className="w-full px-3 py-3 h-11 font-mono text-sm focus:outline-none placeholder:text-white/30"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderColor: 'var(--color-border-light)',
              borderWidth: '1px',
              color: 'var(--color-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            maxLength={100}
          />
          {showCharCount && (
            <div
              className={`text-xs font-mono mt-1
                            ${charCount >= 100 ? 'text-red-400' : 'text-white/50'}`}
            >
              {charCount}/100
            </div>
          )}
          {error && <div className="text-xs text-red-400 font-mono mt-1">{error}</div>}
        </div>
        <button
          type="submit"
          className="px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-accent-10)',
            borderColor: 'var(--color-border-light)',
            borderWidth: '1px',
            color: 'var(--color-accent)',
          }}
          aria-label="Add name"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Bulk Import Link */}
      <button
        type="button"
        onClick={() => setShowBulkImport(true)}
        className="mt-3 text-xs font-mono tracking-wider flex items-center gap-1"
        style={{
          color: 'var(--color-accent)',
          opacity: 0.7,
        }}
      >
        <Upload className="w-3 h-3" />
        BULK IMPORT
      </button>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50
                        flex items-center justify-center p-4"
          onClick={() => {
            setShowBulkImport(false);
            setBulkText('');
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowBulkImport(false);
              setBulkText('');
              setError('');
            }
          }}
        >
          <div
            role="dialog"
            aria-label="Bulk import names"
            className="p-6 max-w-lg w-full"
            style={{
              backgroundColor: 'black',
              borderColor: 'var(--color-border-light)',
              borderWidth: '1px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-mono text-lg mb-4 tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              BULK IMPORT
            </h3>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowBulkImport(false);
                  setBulkText('');
                  setError('');
                }
              }}
              placeholder="Paste names (one per line)"
              className="w-full h-64 px-3 py-2 font-mono text-sm focus:outline-none placeholder:text-white/30 resize-none"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'var(--color-border-light)',
                borderWidth: '1px',
                color: 'var(--color-text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={handleBulkImport}
                className="flex-1 px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors"
                style={{
                  backgroundColor: 'var(--color-accent-10)',
                  borderColor: 'var(--color-border-light)',
                  borderWidth: '1px',
                  color: 'var(--color-accent)',
                }}
              >
                IMPORT
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkImport(false);
                  setBulkText('');
                  setError('');
                }}
                className="px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors"
                style={{
                  borderColor: 'var(--color-border-light)',
                  borderWidth: '1px',
                  color: 'var(--color-text)',
                  opacity: 0.7,
                }}
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
