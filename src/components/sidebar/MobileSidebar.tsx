import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { memo, useEffect } from 'react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function MobileSidebarComponent({ isOpen, onClose, children }: MobileSidebarProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        className="fixed top-0 left-0 h-screen z-40 border-r flex flex-col overflow-hidden bg-black/90 border-r-(--color-border-light)"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Drawer Header */}
        <div className="px-4 py-4 border-b flex items-center justify-between border-b-(--color-border-light)">
          <h2 className="font-mono text-sm tracking-widest font-light text-(--color-accent)">
            MENU
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded transition-colors text-accent bg-transparent hover:bg-white/10"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto scrollbar-themed">{children}</div>
      </motion.div>
    </>
  );
}

export const MobileSidebar = memo(MobileSidebarComponent);
