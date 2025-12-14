import * as Dialog from '@radix-ui/react-dialog';
import { Download, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import type { SelectionRecord } from '../../types/name';
import { cn } from '../../utils/cn';
import { type ExportFormat, exportToCSV, exportToJSON } from '../../utils/export';

interface ExportModalProps {
  records: SelectionRecord[];
  onClose: () => void;
}

function ExportModalComponent({ records, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');

  const getDefaultFilename = useCallback((): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'csv' ? 'csv' : 'json';
    return `selections_${timestamp}.${extension}`;
  }, [format]);

  const handleExport = useCallback(() => {
    const finalFilename = filename.trim() || getDefaultFilename();

    if (format === 'csv') {
      exportToCSV(records, finalFilename);
    } else {
      exportToJSON(records, finalFilename);
    }

    onClose();
  }, [records, format, filename, getDefaultFilename, onClose]);

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm z-50 bg-black/80" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-lg w-full bg-black border border-border-light z-50 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-mono text-lg tracking-wider text-accent">
              EXPORT HISTORY
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="transition-colors text-accent/50 bg-transparent hover:text-accent"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Format Selection */}
          <div className="mb-4">
            <span className="block font-mono text-xs uppercase tracking-wide mb-2 text-text/70">
              Format
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={cn(
                  'flex-1 px-3 py-2 font-mono text-sm tracking-wider transition-colors border',
                  format === 'csv'
                    ? 'border-accent bg-accent-20 text-accent'
                    : 'bg-transparent border-white/20 text-text/70 hover:border-white/40 hover:text-text'
                )}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={cn(
                  'flex-1 px-3 py-2 font-mono text-sm tracking-wider transition-colors border',
                  format === 'json'
                    ? 'border-accent bg-accent-20 text-accent'
                    : 'bg-transparent border-white/20 text-text/70 hover:border-white/40 hover:text-text'
                )}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Filename Input */}
          <div className="mb-6">
            <label
              htmlFor="filename"
              className="block font-mono text-xs uppercase tracking-wide mb-2 text-text/70"
            >
              Filename (optional)
            </label>
            <input
              type="text"
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={getDefaultFilename()}
              className={cn(
                'w-full px-3 py-2 font-mono text-sm focus:outline-none placeholder:text-white/30 bg-black/50 border border-border-light text-text shadow-none',
                'focus:shadow-accent focus:shadow-xs'
              )}
            />
            <p className="text-xs font-mono mt-1 text-text/40">
              {`${records.length} record${records.length !== 1 ? 's' : ''} to export`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className={cn(
                'flex-1 px-4 py-2 transition-colors font-mono text-sm tracking-wider flex items-center justify-center gap-2',
                'bg-accent-10 border border-border-light text-accent hover:bg-accent-20'
              )}
            >
              <Download className="w-4 h-4" />
              DOWNLOAD
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 transition-colors font-mono text-sm tracking-wider bg-transparent border border-white/20 text-text/70 hover:bg-white/5"
            >
              CANCEL
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ExportModal = memo(ExportModalComponent);
