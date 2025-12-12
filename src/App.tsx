import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { NameManagementSidebar } from './components/sidebar';
import { RadialWheel, type RadialWheelRef } from './components/wheel';
import { useKeyboardShortcuts } from './hooks';
import { useNameStore } from './stores/useNameStore';
import type { Name } from './types/name';

function App() {
  const wheelRef = useRef<RadialWheelRef>(null);

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

  useKeyboardShortcuts({
    onSpinTrigger: () => wheelRef.current?.spin(),
  });

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <NameManagementSidebar />

      {/* Main Wheel Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
          <RadialWheel ref={wheelRef} names={names} onSelect={handleSelect} />

          {selectedName && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div
                className="px-6 py-3 backdrop-blur-sm rounded"
                style={{
                  borderColor: 'var(--color-border-light)',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderWidth: '1px',
                }}
              >
                <div
                  className="text-xs tracking-wider mb-1 font-mono"
                  style={{ color: 'var(--color-text)', opacity: 0.5 }}
                >
                  SELECTED
                </div>
                <div
                  className="text-2xl tracking-wider font-light font-mono"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {selectedName.value}
                </div>
              </div>
            </div>
          )}

          <div
            className="absolute top-8 left-1/2 -translate-x-1/2 text-xs tracking-wider font-mono"
            style={{ color: 'var(--color-text)', opacity: 0.4 }}
          >
            CLICK CENTER TO RANDOMIZE
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
