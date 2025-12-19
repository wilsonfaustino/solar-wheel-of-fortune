import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UncontrolledConfirmDialog } from './UncontrolledConfirmDialog';

describe('UncontrolledConfirmDialog', () => {
  it('should render trigger button with children', () => {
    render(
      <UncontrolledConfirmDialog
        title="Delete Item?"
        description="This action cannot be undone."
        onConfirm={vi.fn()}
      >
        <button type="button">Delete</button>
      </UncontrolledConfirmDialog>
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should show dialog when trigger is clicked', async () => {
    render(
      <UncontrolledConfirmDialog
        title="Delete Item?"
        description="This action cannot be undone."
        onConfirm={vi.fn()}
      >
        <button type="button">Delete</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(trigger);

    expect(screen.getByText('Delete Item?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('should not render dialog initially', () => {
    const { container } = render(
      <UncontrolledConfirmDialog
        title="Delete Item?"
        description="This action cannot be undone."
        onConfirm={vi.fn()}
      >
        <button type="button">Delete</button>
      </UncontrolledConfirmDialog>
    );

    expect(container.querySelector('[role="alertdialog"]')).not.toBeInTheDocument();
  });

  it('should call onConfirm when confirm button clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <UncontrolledConfirmDialog
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={onConfirm}
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should close dialog when cancel button clicked', async () => {
    render(
      <UncontrolledConfirmDialog
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={vi.fn()}
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('should render danger variant styling by default', async () => {
    render(
      <UncontrolledConfirmDialog title="Delete" description="Delete this?" onConfirm={vi.fn()}>
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('text-red-400');
  });

  it('should render warning variant styling', async () => {
    render(
      <UncontrolledConfirmDialog
        title="Warning"
        description="This is a warning."
        onConfirm={vi.fn()}
        variant="warning"
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('text-yellow-400');
  });

  it('should render info variant styling', async () => {
    render(
      <UncontrolledConfirmDialog
        title="Info"
        description="This is info."
        onConfirm={vi.fn()}
        variant="info"
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toHaveClass('text-accent');
  });

  it('should use custom label text when provided', async () => {
    render(
      <UncontrolledConfirmDialog
        title="Custom Confirm"
        description="Are you sure?"
        confirmLabel="Yes, Proceed"
        cancelLabel="No, Go Back"
        onConfirm={vi.fn()}
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    expect(screen.getByRole('button', { name: 'Yes, Proceed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, Go Back' })).toBeInTheDocument();
  });

  it('should use default labels when not provided', async () => {
    render(
      <UncontrolledConfirmDialog title="Confirm" description="Are you sure?" onConfirm={vi.fn()}>
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render complex children as trigger', () => {
    render(
      <UncontrolledConfirmDialog title="Delete" description="Are you sure?" onConfirm={vi.fn()}>
        <button type="button" className="custom-class">
          <span>Delete Icon</span>
          <span>Delete Text</span>
        </button>
      </UncontrolledConfirmDialog>
    );

    expect(screen.getByText('Delete Icon')).toBeInTheDocument();
    expect(screen.getByText('Delete Text')).toBeInTheDocument();
  });

  it('should not call onConfirm when dialog is closed via cancel', async () => {
    const onConfirm = vi.fn();
    render(
      <UncontrolledConfirmDialog title="Confirm" description="Are you sure?" onConfirm={onConfirm}>
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should close dialog after confirm is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <UncontrolledConfirmDialog
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={onConfirm}
      >
        <button type="button">Trigger</button>
      </UncontrolledConfirmDialog>
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    await userEvent.click(trigger);

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await userEvent.click(confirmButton);

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });
});
