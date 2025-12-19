import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Root({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function Trigger({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function Portal({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

function Overlay({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm bg-black/50',
        className
      )}
      {...props}
    />
  );
}

function Content({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <Portal>
      <Overlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 max-w-md w-full bg-black border border-border-light z-50 focus:outline-none',
          className
        )}
        {...props}
      />
    </Portal>
  );
}

function Title({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('font-mono text-lg tracking-wider text-accent mb-3', className)}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('font-mono text-sm text-text/70 mb-6', className)}
      {...props}
    />
  );
}

interface ActionProps extends ComponentProps<typeof AlertDialogPrimitive.Action> {
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

function Action({ className, confirmLabel, onConfirm, variant, ...props }: ActionProps) {
  return (
    <AlertDialogPrimitive.Action asChild {...props} data-slot="alert-dialog-action">
      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          'flex-1 px-4 py-3 h-11 font-mono text-sm tracking-wider transition-colors border',
          variant === 'danger' &&
            'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
          variant === 'warning' &&
            'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
          variant === 'info' && 'bg-accent-10 border-border-light text-accent hover:bg-accent-20'
        )}
      >
        {confirmLabel}
      </button>
    </AlertDialogPrimitive.Action>
  );
}

interface CancelProps extends ComponentProps<typeof AlertDialogPrimitive.Cancel> {
  cancelLabel?: string;
}

function Cancel({ cancelLabel, className, ...props }: CancelProps) {
  return (
    <AlertDialogPrimitive.Cancel asChild {...props} data-slot="alert-dialog-cancel">
      <button
        type="button"
        className={cn(
          'px-4 py-3 h-11 font-mono text-sm text-text/70 border border-border-light tracking-wider transition-colors hover:bg-white/5',
          className
        )}
      >
        {cancelLabel}
      </button>
    </AlertDialogPrimitive.Cancel>
  );
}

interface FooterProps
  extends ComponentProps<'div'>,
    Pick<ActionProps, 'onConfirm' | 'confirmLabel' | 'variant'>,
    Pick<CancelProps, 'cancelLabel'> {}

function Footer({
  onConfirm,
  confirmLabel,
  variant,
  cancelLabel,
  className,
  ...props
}: FooterProps) {
  return (
    <div className={cn('flex gap-2', className)} {...props}>
      <Action onConfirm={onConfirm} confirmLabel={confirmLabel} variant={variant} />
      <Cancel cancelLabel={cancelLabel} />
    </div>
  );
}

const AlertDialog = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Action,
  Cancel,
  Footer,
};

export { AlertDialog };
