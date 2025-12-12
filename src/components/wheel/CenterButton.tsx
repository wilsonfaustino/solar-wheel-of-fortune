import { Sparkles } from 'lucide-react';
import { memo } from 'react';

interface CenterButtonProps {
  onClick: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

function CenterButtonComponent({ onClick, isSpinning, disabled }: CenterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isSpinning}
      className="relative z-10 group"
      aria-label="Randomize selection"
    >
      <div
        className="relative flex items-center justify-center w-24 h-24 rounded-full backdrop-blur-sm transition-all duration-300 disabled:cursor-not-allowed"
        style={{
          border: '1px solid var(--color-text)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <Sparkles
          className="w-8 h-8 transition-transform duration-300 group-hover:scale-150"
          strokeWidth={2}
          style={{ color: 'var(--color-text)', opacity: 0.8 }}
        />
      </div>

      {isSpinning && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-ping-custom"
            style={{ border: '1px solid var(--color-text)', opacity: 0.3 }}
          />
          <div
            className="absolute inset-0 rounded-full animate-ping-custom delay-500"
            style={{ border: '1px solid var(--color-text)', opacity: 0.2 }}
          />
        </>
      )}
    </button>
  );
}

export const CenterButton = memo(CenterButtonComponent);
