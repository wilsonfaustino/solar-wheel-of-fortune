import { type ComponentProps, memo } from 'react';
import { cn } from '../../../utils/cn';

interface ActionButtonsProps extends ComponentProps<'button'> {
  hasTargetContent: boolean;
}

function ActionButtonsComponent({
  hasTargetContent,
  children,
  className,
  ...props
}: ActionButtonsProps) {
  return (
    <button
      type="button"
      disabled={!hasTargetContent}
      className={cn(
        'flex-1 px-3 py-3 h-11 transition-colors font-mono text-xs tracking-wider bg-transparent disabled:cursor-not-allowed flex items-center justify-center gap-2',
        'border border-white/20 hover:bg-white/10 cursor-pointer transition-colors',
        hasTargetContent ? 'text-text/70 bg-white/5' : 'text-text/30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);
