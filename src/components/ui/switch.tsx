import * as SwitchPrimitive from '@radix-ui/react-switch';
import type * as React from 'react';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all',
        'data-[state=checked]:border-accent data-[state=checked]:bg-accent/20',
        'data-[state=unchecked]:border-white/20 data-[state=unchecked]:bg-white/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-4 rounded-full transition-transform',
          'data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent',
          'data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-white/50'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
