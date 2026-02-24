import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useNameStore } from '@/stores/useNameStore';

/**
 * Render component with access to real Zustand store
 * Use this for integration tests that need store state
 */
export function renderWithStore(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, options);
}

/**
 * Clear persisted state between tests
 * Prevents test pollution from localStorage
 */
export function clearPersistedState(): void {
  const initialList = {
    id: crypto.randomUUID(),
    title: 'Default List',
    names: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  useNameStore.setState({
    lists: [initialList],
    activeListId: initialList.id,
    history: [],
    currentTheme: 'cyan',
  });
}
