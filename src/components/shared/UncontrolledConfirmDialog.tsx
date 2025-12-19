import { memo, type PropsWithChildren } from 'react';
import { AlertDialog } from '../ui/alert-dialog';

interface ConfirmDialogProps extends PropsWithChildren {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

function UncontrolledConfirmDialogComponent({
  children,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
}: Readonly<ConfirmDialogProps>) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description>{description}</AlertDialog.Description>
        <AlertDialog.Footer
          onConfirm={onConfirm}
          confirmLabel={confirmLabel}
          variant={variant}
          cancelLabel={cancelLabel}
        />
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

export const UncontrolledConfirmDialog = memo(UncontrolledConfirmDialogComponent);
