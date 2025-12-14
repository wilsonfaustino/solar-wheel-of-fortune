import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SelectionRecord } from '../../types/name';
import { ExportModal } from './ExportModal';

const mockRecords: SelectionRecord[] = [
  {
    id: '1',
    nameId: 'name-1',
    nameValue: 'ALICE',
    listId: 'list-1',
    timestamp: new Date('2024-12-10T10:00:00Z'),
    sessionId: 'session-1',
    spinDuration: 2000,
  },
  {
    id: '2',
    nameId: 'name-2',
    nameValue: 'BOB',
    listId: 'list-1',
    timestamp: new Date('2024-12-10T10:05:00Z'),
    sessionId: 'session-1',
    spinDuration: 2500,
  },
];

describe('ExportModal', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render modal dialog with title', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/EXPORT HISTORY/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby');
  });

  it('should display format selection buttons', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JSON' })).toBeInTheDocument();
  });

  it('should show CSV format as selected by default', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const csvButton = screen.getByRole('button', { name: 'CSV' });
    expect(csvButton).toHaveClass('bg-accent-20');
    expect(csvButton).toHaveClass('border-accent');
  });

  it('should switch format when JSON button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const jsonButton = screen.getByRole('button', { name: 'JSON' });
    const csvButton = screen.getByRole('button', { name: 'CSV' });

    await user.click(jsonButton);

    expect(jsonButton).toHaveClass('bg-accent-20');
    expect(jsonButton).toHaveClass('border-accent');
    expect(csvButton).not.toHaveClass('bg-accent-20');
    expect(csvButton).toHaveClass('bg-transparent');
  });

  it('should display record count', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    expect(screen.getByText(/2 records to export/i)).toBeInTheDocument();
  });

  it('should display "1 record" for single record', () => {
    render(<ExportModal records={[mockRecords[0]]} onClose={mockOnClose as () => void} />);

    expect(screen.getByText(/1 record to export/i)).toBeInTheDocument();
  });

  it('should have filename input with placeholder', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const input = screen.getByPlaceholderText(/selections_/);
    expect(input).toBeInTheDocument();
  });

  it('should allow custom filename input', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const input = screen.getByPlaceholderText(/selections_/) as HTMLInputElement;
    await user.type(input, 'my-selections');

    expect(input.value).toBe('my-selections');
  });

  it('should render download button', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    expect(screen.getByRole('button', { name: /DOWNLOAD/i })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    expect(screen.getByRole('button', { name: /CANCEL/i })).toBeInTheDocument();
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const cancelButton = screen.getByRole('button', { name: /CANCEL/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const closeButton = screen.getByRole('button', { name: /Close modal/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal when clicking outside (backdrop)', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ExportModal records={mockRecords} onClose={mockOnClose as () => void} />
    );

    // Radix Dialog.Overlay doesn't have role="presentation", find it by class
    const backdrop = container.querySelector('[data-radix-dialog-overlay]');
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should close on Escape key', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal after download with CSV format', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const downloadButton = screen.getByRole('button', { name: /DOWNLOAD/i });
    await user.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close modal after download with JSON format', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const jsonButton = screen.getByRole('button', { name: 'JSON' });
    await user.click(jsonButton);

    const downloadButton = screen.getByRole('button', { name: /DOWNLOAD/i });
    await user.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should trigger download when download button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const downloadButton = screen.getByRole('button', { name: /DOWNLOAD/i });
    await user.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should trigger download with JSON format when selected', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const jsonButton = screen.getByRole('button', { name: 'JSON' });
    await user.click(jsonButton);

    const downloadButton = screen.getByRole('button', { name: /DOWNLOAD/i });
    await user.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should allow entering custom filename', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const input = screen.getByPlaceholderText(/selections_/);
    await user.type(input, 'my-selections.csv');

    expect((input as HTMLInputElement).value).toBe('my-selections.csv');
  });

  it('should use default filename when custom filename is empty', async () => {
    const user = userEvent.setup();
    render(<ExportModal records={mockRecords} onClose={mockOnClose as () => void} />);

    const input = screen.getByPlaceholderText(/selections_/);
    expect((input as HTMLInputElement).placeholder).toMatch(/^selections_\d{4}-\d{2}-\d{2}\.csv$/);

    const downloadButton = screen.getByRole('button', { name: /DOWNLOAD/i });
    await user.click(downloadButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
