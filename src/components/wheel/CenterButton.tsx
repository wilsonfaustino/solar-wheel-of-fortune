import { memo } from "react";
import { Sparkles } from "lucide-react";

interface CenterButtonProps {
  onClick: () => void;
  isSpinning: boolean;
  disabled?: boolean;
}

function CenterButtonComponent({
  onClick,
  isSpinning,
  disabled,
}: CenterButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isSpinning}
      className="relative z-10 group"
      aria-label="Randomize selection"
    >
      <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/5 disabled:cursor-not-allowed">
        <Sparkles
          className="w-8 h-8 text-white/80 transition-transform duration-300 group-hover:scale-150"
          strokeWidth={2}
        />
      </div>

      {isSpinning && (
        <>
          <div className="absolute inset-0 rounded-full border border-white/30 animate-ping-custom" />
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping-custom delay-500" />
        </>
      )}
    </button>
  );
}

export const CenterButton = memo(CenterButtonComponent);
