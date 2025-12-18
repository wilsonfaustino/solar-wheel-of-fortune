import { type ComponentProps, memo } from 'react';
import { cn } from '../../../utils/cn';
import { Button } from '../../ui/button';

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
    <Button
      type="button"
      disabled={!hasTargetContent}
      variant="tech-ghost"
      size="tech-default"
      className={cn(
        'flex-1 text-xs',
        hasTargetContent && 'border border-white/20 bg-white/5',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export const ActionButtons = memo(ActionButtonsComponent);
