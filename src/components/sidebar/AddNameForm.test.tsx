import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MAX_NAME_LENGTH } from '../../constants/defaults';
import { AddNameForm } from './AddNameForm';

const renderForm = () => {
  const onAddName = vi.fn();
  const onBulkImport = vi.fn();
  render(<AddNameForm onAddName={onAddName} onBulkImport={onBulkImport} />);
  const input = screen.getByPlaceholderText('Enter name...');
  return { onAddName, onBulkImport, input };
};

describe('AddNameForm', () => {
  it('rejects a name longer than the maximum length', () => {
    const { onAddName, input } = renderForm();

    // fireEvent bypasses the maxLength attribute, which a paste cannot
    fireEvent.change(input, { target: { value: 'A'.repeat(MAX_NAME_LENGTH + 1) } });
    fireEvent.submit(screen.getByLabelText('Add name').closest('form') as HTMLFormElement);

    expect(screen.getByText(`Name must be ${MAX_NAME_LENGTH} characters or less`)).toBeVisible();
    expect(onAddName).not.toHaveBeenCalled();
  });

  it('warns only once the counter reaches the maximum length', () => {
    const { input } = renderForm();

    fireEvent.change(input, { target: { value: 'A'.repeat(MAX_NAME_LENGTH - 10) } });
    expect(screen.getByText(`${MAX_NAME_LENGTH - 10}/${MAX_NAME_LENGTH}`)).toHaveClass(
      'text-white/50'
    );

    fireEvent.change(input, { target: { value: 'A'.repeat(MAX_NAME_LENGTH) } });
    expect(screen.getByText(`${MAX_NAME_LENGTH}/${MAX_NAME_LENGTH}`)).toHaveClass('text-red-400');
  });
});
