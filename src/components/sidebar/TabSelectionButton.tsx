import { type ComponentProps, memo } from 'react';
import { cn } from '../../utils/cn';

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
    <button
      type="button"
      onClick={onSelectTab}
      className={cn(
        'flex-1 px-4 py-3 font-mono text-sm transition-colors',
        isActiveTab ? 'text-accent border-b-2 border-accent' : 'text-text/50 border-b-0'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export const TabSelectionButton = memo(TabSelectionButtonComponent);
