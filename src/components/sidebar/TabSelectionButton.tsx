import { type ComponentProps, memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface TabSelectionButtonProps extends ComponentProps<'button'> {
  isActiveTab: boolean;
  onSelectTab: () => void;
}

function TabSelectionButtonComponent({
  isActiveTab,
  onSelectTab,
  children,
  ...props
}: TabSelectionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onSelectTab}
      variant="tech-ghost"
      size="tech-default"
      className={cn(
        'flex-1 text-sm',
        isActiveTab ? 'text-accent border-b-2 border-accent' : 'text-text/50 border-b-0'
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export const TabSelectionButton = memo(TabSelectionButtonComponent);
