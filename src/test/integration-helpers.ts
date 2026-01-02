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
 * Wait for Zustand store to update
 * Useful for async store actions
 */
export async function waitForStoreUpdate(
  selector: (state: ReturnType<typeof useNameStore.getState>) => unknown,
  expectedValue: unknown,
  timeout = 1000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentValue = selector(useNameStore.getState());
    if (currentValue === expectedValue) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(`Store did not update to expected value within ${timeout}ms`);
}

/**
 * Clear persisted state between tests
 * Prevents test pollution from localStorage
 */
export function clearPersistedState(): void {
  localStorage.clear();
  useNameStore.persist.clearStorage();
  useNameStore.setState(useNameStore.getInitialState());
}

/**
 * Mock localStorage for tests that need persistence
 */
export function mockLocalStorage(): void {
  const store: Record<string, string> = {};

  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length,
  } as Storage;
}
