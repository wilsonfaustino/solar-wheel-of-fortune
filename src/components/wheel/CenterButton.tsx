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
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full backdrop-blur-sm transition-all duration-300 disabled:cursor-not-allowed border border-text bg-black/40">
        <Sparkles
          className="size-8 transition-transform duration-300 text-text opacity-80 group-hover:scale-150"
          strokeWidth={2}
        />
      </div>

      {isSpinning && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping-custom border border-text opacity-30" />
          <div className="absolute inset-0 rounded-full animate-ping-custom delay-500 border border-text opacity-20" />
        </>
      )}
    </button>
  );
}

export const CenterButton = memo(CenterButtonComponent);
