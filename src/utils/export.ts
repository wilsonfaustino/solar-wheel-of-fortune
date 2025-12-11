import type { SelectionRecord } from '../types/name';

export type ExportFormat = 'csv' | 'json';

/**
 * Escapes CSV field values (handles commas, quotes, newlines)
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/**
 * Converts SelectionRecord array to CSV format with headers
 * Headers: name, timestamp, list_id
 * One record per row with proper escaping
 */
export function exportToCSV(records: SelectionRecord[], filename?: string): void {
  const headers = ['name', 'timestamp', 'list_id'];
  const rows = records.map((record) => [
    escapeCSVField(record.nameValue),
    record.timestamp instanceof Date ? record.timestamp.toISOString() : String(record.timestamp),
    escapeCSVField(record.listId),
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename || generateFilename('csv'));
}

/**
 * Converts SelectionRecord array to JSON format with metadata
 * Includes export date and record count in metadata
 */
export function exportToJSON(records: SelectionRecord[], filename?: string): void {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRecords: records.length,
      format: 'selection-history-v1',
    },
    records: records.map((record) => ({
      id: record.id,
      nameId: record.nameId,
      nameValue: record.nameValue,
      listId: record.listId,
      timestamp:
        record.timestamp instanceof Date ? record.timestamp.toISOString() : record.timestamp,
      sessionId: record.sessionId,
      spinDuration: record.spinDuration,
    })),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadFile(blob, filename || generateFilename('json'));
}

/**
 * Generates a timestamped filename for exports
 */
function generateFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'csv' ? 'csv' : 'json';
  return `selections_${timestamp}.${extension}`;
}

/**
 * Triggers browser file download using Blob and anchor element
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
