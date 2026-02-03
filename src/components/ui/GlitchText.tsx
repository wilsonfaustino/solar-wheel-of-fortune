interface GlitchTextProps {
  children: string;
  className?: string;
}

export const GlitchText = ({ children, className = '' }: GlitchTextProps) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="animate-glitch-1 absolute left-0 top-0 z-0 w-full will-change-transform"
        style={{
          textShadow: '-2px 0 var(--color-accent)',
        }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="animate-glitch-2 absolute left-0 top-0 z-0 w-full will-change-transform"
        style={{
          textShadow: '2px 0 var(--color-destructive)',
        }}
      >
        {children}
      </span>
    </span>
  );
};
