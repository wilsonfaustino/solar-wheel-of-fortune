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
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        role="dialog"
        aria-label="Export selection history"
        className="p-6 max-w-lg w-full"
        style={{
          backgroundColor: 'black',
          borderColor: 'var(--color-border-light)',
          borderWidth: '1px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-lg tracking-wider" style={{ color: 'var(--color-accent)' }}>
            EXPORT HISTORY
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--color-text)', opacity: 0.5 }}
            aria-label="Close modal"
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.5';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <span
            className="block font-mono text-xs uppercase tracking-wide mb-2"
            style={{ color: 'var(--color-text)', opacity: 0.7 }}
          >
            Format
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className="flex-1 px-3 py-2 font-mono text-sm tracking-wider transition-colors"
              style={{
                borderColor: format === 'csv' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
                backgroundColor: format === 'csv' ? 'var(--color-accent-20)' : 'transparent',
                color: format === 'csv' ? 'var(--color-accent)' : 'var(--color-text)',
                opacity: format === 'csv' ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (format !== 'csv') {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (format !== 'csv') {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.opacity = '0.7';
                }
              }}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className="flex-1 px-3 py-2 font-mono text-sm tracking-wider transition-colors"
              style={{
                borderColor: format === 'json' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.2)',
                borderWidth: '1px',
                backgroundColor: format === 'json' ? 'var(--color-accent-20)' : 'transparent',
                color: format === 'json' ? 'var(--color-accent)' : 'var(--color-text)',
                opacity: format === 'json' ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (format !== 'json') {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.opacity = '1';
                }
              }}
              onMouseLeave={(e) => {
                if (format !== 'json') {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.opacity = '0.7';
                }
              }}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Filename Input */}
        <div className="mb-6">
          <label
            htmlFor="filename"
            className="block font-mono text-xs uppercase tracking-wide mb-2"
            style={{ color: 'var(--color-text)', opacity: 0.7 }}
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
            className="w-full px-3 py-2 font-mono text-sm focus:outline-none placeholder:text-white/30"
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
          <p
            className="text-xs font-mono mt-1"
            style={{ color: 'var(--color-text)', opacity: 0.4 }}
          >
            {`${records.length} record${records.length !== 1 ? 's' : ''} to export`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 px-4 py-2 transition-colors font-mono text-sm tracking-wider flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-accent-10)',
              borderColor: 'var(--color-border-light)',
              borderWidth: '1px',
              color: 'var(--color-accent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-20)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-10)';
            }}
          >
            <Download className="w-4 h-4" />
            DOWNLOAD
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 transition-colors font-mono text-sm tracking-wider"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: '1px',
              color: 'var(--color-text)',
              opacity: 0.7,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

export const ExportModal = memo(ExportModalComponent);
