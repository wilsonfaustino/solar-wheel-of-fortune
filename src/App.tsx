import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { Footer } from './components/Footer';
import { MobileHeader } from './components/MobileHeader';
import { NameManagementSidebar } from './components/sidebar';
import { showSelectionToast, Toaster } from './components/toast';
import { RadialWheel, type RadialWheelRef } from './components/wheel';
import { useKeyboardShortcuts, useMediaQuery } from './hooks';
import { useNameStore } from './stores/useNameStore';
import type { Name } from './types/name';

const MobileSidebar = lazy(() =>
  import('./components/sidebar').then((module) => ({ default: module.MobileSidebar }))
);

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
  const toggleNameExclusion = useNameStore((state) => state.toggleNameExclusion);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const names = useMemo(() => {
    const activeList = lists.find((list) => list.id === activeListId);
    if (!activeList) return [];
    return activeList.names.filter((name) => !name.isExcluded);
  }, [lists, activeListId]);

  const handleSelect = useCallback(
    (name: Name) => {
      markSelected(name.id);
      showSelectionToast(name);

      // Auto-exclude after 2 seconds (only if not the last name)
      setTimeout(() => {
        const state = useNameStore.getState();
        const activeList = state.lists.find((list) => list.id === state.activeListId);
        if (!activeList) return;

        const activeNames = activeList.names.filter((n) => !n.isExcluded);

        // Only auto-exclude if more than 1 active name remains
        if (activeNames.length > 1) {
          toggleNameExclusion(name.id);
        }
      }, 2000);
    },
    [markSelected, toggleNameExclusion]
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
          <Suspense fallback={null}>
            <MobileSidebar isOpen={sidebarOpen} onClose={handleCloseSidebar}>
              <NameManagementSidebar isMobile />
            </MobileSidebar>
          </Suspense>
        )}

        {/* Main Wheel Area */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
          <Toaster />
          <div className="relative w-full sm:max-w-2xl lg:max-w-4xl h-full flex items-center justify-center">
            <RadialWheel ref={wheelRef} names={names} onSelect={handleSelect} />

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
