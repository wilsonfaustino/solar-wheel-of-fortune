import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Upload } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';

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
    <div className="px-4 py-4 border-b border-b-border-light">
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
            className="w-full px-3 py-3 h-11 font-mono text-sm text-text bg-black/50 border border-border-light shadow-none focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30 "
            maxLength={100}
          />
          {showCharCount && (
            <div
              className={cn(
                'text-xs font-mono mt-1',
                charCount >= 100 ? 'text-red-400' : 'text-white/50'
              )}
            >
              {charCount}/100
            </div>
          )}
          {error && <div className="text-xs text-red-400 font-mono mt-1">{error}</div>}
        </div>
        <button
          type="submit"
          className="px-4 py-3 h-11 font-mono text-sm text-accent border border-border-light bg-accent-10 tracking-wider transition-colors flex items-center justify-center"
          aria-label="Add name"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Bulk Import Link */}
      <button
        type="button"
        onClick={() => setShowBulkImport(true)}
        className="mt-3 text-xs text-accent/70 font-mono tracking-wider flex items-center gap-1"
      >
        <Upload className="w-3 h-3" />
        BULK IMPORT
      </button>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <Dialog.Root
          open
          onOpenChange={() => {
            setShowBulkImport(false);
            setBulkText('');
            setError('');
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-lg w-full bg-black border border-border-light z-50 focus:outline-none">
              <Dialog.Title className="font-mono text-lg mb-4 tracking-wider text-accent">
                BULK IMPORT
              </Dialog.Title>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste names (one per line)"
                className="w-full h-64 px-3 py-2 font-mono text-sm text-text border border-border-light bg-black/50 shadow-none focus:shadow-xs focus:shadow-accent focus:outline-none placeholder:text-white/30 resize-none"
              />
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="flex-1 px-4 py-3 h-11 font-mono text-sm text-accent border border-border-light bg-accent-10 tracking-wider transition-colors"
                >
                  IMPORT
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors"
                  >
                    CANCEL
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}

export const AddNameForm = memo(AddNameFormComponent);
