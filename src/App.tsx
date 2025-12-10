import { useState, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { RadialWheel } from "./components/wheel";
import { NameManagementSidebar } from "./components/sidebar";
import { useNameStore } from "./stores/useNameStore";
import type { Name } from "./types/name";

function App() {
  const { lists, activeListId } = useNameStore(
    useShallow((state) => ({ lists: state.lists, activeListId: state.activeListId }))
  );
  const markSelected = useNameStore((state) => state.markSelected);

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

  return (
    <div className="bg-black min-h-screen flex">
      {/* Sidebar */}
      <NameManagementSidebar />

      {/* Main Wheel Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center">
          <RadialWheel names={names} onSelect={handleSelect} />

          {selectedName && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <div className="px-6 py-3 border border-cyan-400/30 bg-black/60 backdrop-blur-sm rounded">
                <div className="text-xs text-white/50 tracking-wider mb-1 font-mono">
                  SELECTED
                </div>
                <div className="text-2xl text-cyan-400 tracking-wider font-light font-mono">
                  {selectedName.value}
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-wider font-mono">
            CLICK CENTER TO RANDOMIZE
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
