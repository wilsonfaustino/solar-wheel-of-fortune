import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

/** `asChild` is unsupported: the arrow renders beside `children`, which a Slot cannot take. */
function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, 'asChild'>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          'z-50 border border-accent bg-background font-mono shadow-[0_0_18px_var(--color-accent-20)]',
          'animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow width={14} height={7} className="fill-accent" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
