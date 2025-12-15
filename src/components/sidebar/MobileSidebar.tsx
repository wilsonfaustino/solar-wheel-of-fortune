import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { memo } from 'react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function MobileSidebarComponent({ isOpen, onClose, children }: MobileSidebarProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>

        {/* Drawer */}
        <Dialog.Content asChild>
          <motion.div
            className="fixed top-0 left-0 h-screen z-40 border-r flex flex-col overflow-hidden bg-black/90 border-r-(--color-border-light) focus:outline-none"
            initial={{ x: '-100%' }}
            animate={{ x: isOpen ? 0 : '-100%' }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Drawer Header */}
            <div className="px-4 py-4 border-b flex items-center justify-between border-b-(--color-border-light)">
              <Dialog.Title className="font-mono text-sm tracking-widest font-light text-(--color-accent)">
                MENU
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded transition-colors text-accent bg-transparent hover:bg-white/10"
                  aria-label="Close sidebar"
                >
                  <X className="size-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto scrollbar-themed">{children}</div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const MobileSidebar = memo(MobileSidebarComponent);
