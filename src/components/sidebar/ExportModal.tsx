import { Download, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import type { SelectionRecord } from '../../types/name';
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50
                    flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-label="Export selection history"
        className="bg-black border border-cyan-400/30 p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-mono text-lg tracking-wider">EXPORT HISTORY</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <span className="block text-white/70 font-mono text-xs uppercase tracking-wide mb-2">
            Format
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`flex-1 px-3 py-2 border font-mono text-sm tracking-wider transition-colors ${
                format === 'csv'
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                  : 'border-white/20 hover:border-white/40 text-white/70 hover:text-white'
              }`}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`flex-1 px-3 py-2 border font-mono text-sm tracking-wider transition-colors ${
                format === 'json'
                  ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                  : 'border-white/20 hover:border-white/40 text-white/70 hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Filename Input */}
        <div className="mb-6">
          <label
            htmlFor="filename"
            className="block text-white/70 font-mono text-xs uppercase tracking-wide mb-2"
          >
            Filename (optional)
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getDefaultFilename()}
            className="w-full px-3 py-2 bg-black/50 border border-cyan-400/30
                       text-white font-mono text-sm
                       focus:outline-none focus:ring-2 focus:ring-cyan-400
                       placeholder:text-white/30"
          />
          <p className="text-white/40 text-xs font-mono mt-1">
            {`${records.length} record${records.length !== 1 ? 's' : ''} to export`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-cyan-400/10 border border-cyan-400/30
                       hover:bg-cyan-400/20 transition-colors
                       text-cyan-400 font-mono text-sm tracking-wider
                       flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-white/20
                       hover:bg-white/5 transition-colors
                       text-white/70 font-mono text-sm tracking-wider"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

export const ExportModal = memo(ExportModalComponent);
