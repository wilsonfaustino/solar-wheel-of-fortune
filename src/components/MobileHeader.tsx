import { Menu } from 'lucide-react';
import { memo } from 'react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

function MobileHeaderComponent({ onToggleSidebar }: Readonly<MobileHeaderProps>) {
  return (
    <div className="flex items-center justify-between px-4 h-15 border-b border-border-light bg-background">
      <h1 className="font-mono text-sm tracking-widest font-light text-accent">SOLAR WHEEL</h1>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-2 rounded transition-colors text-accent hover:bg-white/10"
        aria-label="Toggle sidebar menu"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}

export const MobileHeader = memo(MobileHeaderComponent);
