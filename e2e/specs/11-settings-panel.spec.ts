import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('SettingsPanel', () => {
  test('should disable auto-exclusion when toggled OFF', async ({
    settingsPage,
    wheelPage,
    page,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Verify auto-exclude is ON by default
    const initialState = await settingsPage.isAutoExcludeEnabled();
    expect(initialState).toBe(true);

    // Verify initial localStorage state
    const initialStorage = await settingsPage.getSettingsFromStorage();
    expect(initialStorage.autoExcludeEnabled).toBe(true);

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Verify toggle state changed
    const toggledState = await settingsPage.isAutoExcludeEnabled();
    expect(toggledState).toBe(false);

    // Verify localStorage updated
    const updatedStorage = await settingsPage.getSettingsFromStorage();
    expect(updatedStorage.autoExcludeEnabled).toBe(false);

    // Get initial wheel count
    const initialCount = await page.locator('g[data-index] text').count();
    expect(initialCount).toBe(12);

    // Spin wheel
    await wheelPage.spin();

    // Wait 2.5 seconds (auto-exclusion timer would fire at 2s)
    await page.waitForTimeout(2500);

    // Verify name NOT excluded (count still 12)
    const finalCount = await page.locator('g[data-index] text').count();
    expect(finalCount).toBe(12);
  });

  test('should clear selection after exclusion when enabled', async ({
    settingsPage,
    wheelPage,
    page,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Auto-exclude should be ON by default, enable clear-selection
    await settingsPage.toggleClearSelection();

    // Verify clear-selection enabled
    const clearSelectionState = await settingsPage.isClearSelectionEnabled();
    expect(clearSelectionState).toBe(true);

    // Verify localStorage updated
    const settings = await settingsPage.getSettingsFromStorage();
    expect(settings.clearSelectionAfterExclude).toBe(true);

    // Spin wheel
    await wheelPage.spin();

    // Wait 2.5 seconds for auto-exclusion (and clear selection)
    await page.waitForTimeout(2500);

    // Verify selection was cleared by checking that no name has data-selected attribute
    const selectedNames = await page.locator('[data-selected="true"]').count();
    expect(selectedNames).toBe(0);
  });

  test('should persist settings across reloads', async ({ settingsPage, page }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Verify toggle state
    const beforeReload = await settingsPage.isAutoExcludeEnabled();
    expect(beforeReload).toBe(false);

    // Verify localStorage
    const storageBeforeReload = await settingsPage.getSettingsFromStorage();
    expect(storageBeforeReload.autoExcludeEnabled).toBe(false);

    // Reload page
    await page.reload();

    // Switch to Settings tab again
    await settingsPage.switchToSettingsTab();

    // Verify auto-exclude still OFF (UI)
    const afterReload = await settingsPage.isAutoExcludeEnabled();
    expect(afterReload).toBe(false);

    // Verify localStorage persisted
    const storageAfterReload = await settingsPage.getSettingsFromStorage();
    expect(storageAfterReload.autoExcludeEnabled).toBe(false);
  });

  test('should show/hide clear-selection toggle based on auto-exclude', async ({
    settingsPage,
  }) => {
    // Switch to Settings tab
    await settingsPage.switchToSettingsTab();

    // Auto-exclude ON by default, clear-selection should be visible
    const initialVisibility = await settingsPage.isClearSelectionVisible();
    expect(initialVisibility).toBe(true);

    // Toggle auto-exclude OFF
    await settingsPage.toggleAutoExclude();

    // Clear-selection toggle should be hidden
    const hiddenState = await settingsPage.isClearSelectionVisible();
    expect(hiddenState).toBe(false);

    // Toggle auto-exclude back ON
    await settingsPage.toggleAutoExclude();

    // Clear-selection toggle should be visible again
    const visibleAgain = await settingsPage.isClearSelectionVisible();
    expect(visibleAgain).toBe(true);
  });
});
