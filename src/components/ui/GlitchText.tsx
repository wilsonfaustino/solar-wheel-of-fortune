interface GlitchTextProps {
  children: string;
  speed?: number;
  className?: string;
}

export const GlitchText = ({ children, speed = 0.5, className = '' }: GlitchTextProps) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        animationDuration,
      }}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 z-0 w-full"
        style={{
          animationName: 'glitch-1',
          animationDuration,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          textShadow: '-2px 0 var(--color-accent)',
          opacity: 0.8,
        }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 z-0 w-full"
        style={{
          animationName: 'glitch-2',
          animationDuration,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          textShadow: '2px 0 var(--color-destructive)',
          opacity: 0.8,
        }}
      >
        {children}
      </span>
    </span>
  );
};
