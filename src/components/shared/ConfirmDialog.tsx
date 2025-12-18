import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

function ConfirmDialogComponent({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-md w-full bg-black border border-border-light z-50 focus:outline-none">
          <AlertDialog.Title className="font-mono text-lg tracking-wider text-accent mb-3">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="font-mono text-sm text-text/70 mb-6">
            {description}
          </AlertDialog.Description>

          <div className="flex gap-2">
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  'flex-1 px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors border',
                  variant === 'danger' &&
                    'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
                  variant === 'warning' &&
                    'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
                  variant === 'info' &&
                    'bg-accent-10 border-border-light text-accent hover:bg-accent-20'
                )}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>

            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors hover:bg-white/5"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export const ConfirmDialog = memo(ConfirmDialogComponent);
