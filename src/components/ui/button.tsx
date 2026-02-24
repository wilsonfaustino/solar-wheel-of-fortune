import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        tech: 'font-mono tracking-wider bg-accent-10 border border-border-light text-accent hover:bg-accent-20 transition-colors',
        'tech-ghost':
          'font-mono tracking-wider bg-transparent text-text/70 hover:bg-white/10 transition-colors',
        'tech-destructive':
          'font-mono tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors',
        'tech-toggle': 'font-mono tracking-wider border transition-colors',
        'tech-outline':
          'font-mono tracking-wider border border-white/20 bg-transparent text-text/70 hover:border-white/40 hover:text-text transition-colors',
      },
      size: {
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        'icon-sm': 'size-8',
        'tech-default': 'h-11 px-4 py-3',
        'tech-sm': 'h-10 px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'tech-ghost',
      size: 'tech-default',
    },
  }
);

function Button({
  className,
  variant = 'tech-ghost',
  size = 'tech-default',
  asChild = false,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
