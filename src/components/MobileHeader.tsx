import { Menu } from 'lucide-react';
import { memo } from 'react';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

function MobileHeaderComponent({ onToggleSidebar }: MobileHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 h-15 border-b"
      style={{
        backgroundColor: 'var(--color-background)',
        borderBottomColor: 'var(--color-border-light)',
        borderBottomWidth: '1px',
      }}
    >
      <h1
        className="font-mono text-sm tracking-widest font-light"
        style={{ color: 'var(--color-accent)' }}
      >
        SOLAR WHEEL
      </h1>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="p-2 rounded transition-colors"
        style={{
          color: 'var(--color-accent)',
          backgroundColor: 'transparent',
        }}
        aria-label="Toggle sidebar menu"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  );
}

export const MobileHeader = memo(MobileHeaderComponent);
