import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Auto-Exclude Selected Names', () => {
  test('should auto-exclude name 2 seconds after selection', async ({ wheelPage, page }) => {
    // Verify initial state (12 names on wheel)
    const initialCount = await page.locator('g[data-index] text').count();
    expect(initialCount).toBe(12);

    // Spin wheel
    await wheelPage.spin();

    // Verify toast appears immediately
    const toast = page.locator('.toast-container').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/selected/i);

    // Wait 2.5 seconds for auto-exclusion to complete
    await page.waitForTimeout(2500);

    // Verify wheel count decreased to 11
    const finalCount = await page.locator('g[data-index] text').count();
    expect(finalCount).toBe(11);
  });

  test('should exclude multiple names in sequence', async ({ wheelPage, page }) => {
    // Initial count
    const initialCount = await page.locator('g[data-index] text').count();
    expect(initialCount).toBe(12);

    // Spin 3 times with 2.5s wait between each
    for (let i = 0; i < 3; i++) {
      await wheelPage.spin();
      await page.waitForTimeout(2500); // Wait for auto-exclusion
    }

    // Verify 3 names excluded (12 → 9)
    const finalCount = await page.locator('g[data-index] text').count();
    expect(finalCount).toBe(9);
  });

  test('should show toast immediately and then exclude after delay', async ({
    wheelPage,
    page,
  }) => {
    // Get initial count
    const initialCount = await page.locator('g[data-index] text').count();
    expect(initialCount).toBe(12);

    // Spin wheel
    await wheelPage.spin();

    // Toast should appear immediately after spin completes
    const toast = page.locator('.toast-container').first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(/selected/i);

    // Wait for auto-exclusion (2.5s total)
    await page.waitForTimeout(2500);

    // Name should now be excluded
    const finalCount = await page.locator('g[data-index] text').count();
    expect(finalCount).toBe(11);
  });

  test('should NOT exclude last remaining name', async ({ wheelPage, sidebarPage, page }) => {
    // Exclude 11 names manually, leaving only 1 (correct default names)
    const namesToExclude = [
      'JORDAN',
      'CASEY',
      'MORGAN',
      'RILEY',
      'AVERY',
      'TAYLOR',
      'SKYLAR',
      'QUINN',
      'SAGE',
      'ROWAN',
      'DAKOTA',
    ];

    for (const name of namesToExclude) {
      await sidebarPage.excludeName(name);
      await page.waitForTimeout(100); // Small delay for UI update
    }

    // Verify only 1 name left on wheel
    const countBefore = await page.locator('g[data-index] text').count();
    expect(countBefore).toBe(1);

    // Spin the wheel (should select the last name)
    await wheelPage.spin();

    // Wait 2.5 seconds for auto-exclusion timer
    await page.waitForTimeout(2500);

    // Verify last name NOT excluded (count still 1)
    const countAfter = await page.locator('g[data-index] text').count();
    expect(countAfter).toBe(1);

    // Verify wheel still spinnable
    await expect(wheelPage.centerButton).toBeEnabled();
  });
});
