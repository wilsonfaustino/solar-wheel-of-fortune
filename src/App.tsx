import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { Footer } from './components/Footer';
import { MobileHeader } from './components/MobileHeader';
import { MobileSidebar, NameManagementSidebar } from './components/sidebar';
import { RadialWheel, type RadialWheelRef } from './components/wheel';
import { useKeyboardShortcuts, useMediaQuery } from './hooks';
import { useNameStore } from './stores/useNameStore';
import type { Name } from './types/name';

function App() {
  const wheelRef = useRef<RadialWheelRef>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isSmallScreen, isMediumScreen, isLargeScreen } = useMediaQuery();

  const { lists, activeListId, currentTheme } = useNameStore(
    useShallow((state) => ({
      lists: state.lists,
      activeListId: state.activeListId,
      currentTheme: state.currentTheme,
    }))
  );
  const markSelected = useNameStore((state) => state.markSelected);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const names = useMemo(() => {
    const activeList = lists.find((list) => list.id === activeListId);
    if (!activeList) return [];
    return activeList.names.filter((name) => !name.isExcluded);
  }, [lists, activeListId]);
  const [selectedName, setSelectedName] = useState<Name | null>(null);

  const handleSelect = useCallback(
    (name: Name) => {
      setSelectedName(name);
      markSelected(name.id);
    },
    [markSelected]
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useKeyboardShortcuts({
    onSpinTrigger: () => wheelRef.current?.spin(),
  });

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {/* Mobile Header */}
      {(isSmallScreen || isMediumScreen) && <MobileHeader onToggleSidebar={handleToggleSidebar} />}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {isLargeScreen && <NameManagementSidebar />}

        {/* Mobile/Tablet Sidebar Drawer */}
        {(isSmallScreen || isMediumScreen) && (
          <MobileSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar}>
            <NameManagementSidebar isMobile />
          </MobileSidebar>
        )}

        {/* Main Wheel Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <div className="relative w-full max-w-sm sm:max-w-2xl lg:max-w-4xl aspect-square flex items-center justify-center">
            <RadialWheel ref={wheelRef} names={names} onSelect={handleSelect} />

            {selectedName && (
              <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2">
                <div className="px-6 py-3 backdrop-blur-sm rounded bg-black/60 border border-(--color-border-light)">
                  <div className="text-xs tracking-wider mb-1 font-mono text-text/50">SELECTED</div>
                  <div className="text-2xl tracking-wider font-light font-mono text-(--color-accent)">
                    {selectedName.value}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-2 sm:top-4 lg:top-8 left-1/2 -translate-x-1/2 text-xs tracking-wider font-mono text-text/40">
              CLICK CENTER TO RANDOMIZE
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
