import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Name Exclusion and Editing', () => {
  test('should show edit and exclude buttons on hover', async ({ page }) => {
    // Find the name item containing ALEX
    const nameItem = page.locator('.group').filter({ hasText: 'ALEX' });

    // Hover over the item
    await nameItem.hover();

    // Verify edit button is visible
    const editButton = nameItem.getByRole('button', { name: /edit alex/i });
    await expect(editButton).toBeVisible();

    // Verify exclude button is visible
    const excludeButton = nameItem.getByRole('button', { name: /exclude/i });
    await expect(excludeButton).toBeVisible();

    // Verify delete button is visible
    const deleteButton = nameItem.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible();
  });

  test('should display selection count badge', async ({ sidebarPage, wheelPage, page }) => {
    // Spin wheel to select ALEX
    await wheelPage.spin();

    // Wait for toast
    await page.waitForTimeout(1000);

    // Check if any name has a selection badge (count badge)
    const badge = page.locator('.group .px-2.py-0\\.5').first();
    const badgeExists = await badge.count();
    expect(badgeExists).toBeGreaterThan(0);
  });

  test('should exclude name from wheel', async ({ sidebarPage, page }) => {
    // Verify initial name count in sidebar (12 names)
    const initialCount = await sidebarPage.getNameCount();
    expect(initialCount).toBe(12);

    // Verify initial wheel has 12 name labels
    const initialWheelLabels = await page.locator('g[data-index] text').count();
    expect(initialWheelLabels).toBe(12);

    // Exclude first name (ALEX)
    await sidebarPage.excludeName('ALEX');

    // Wait for wheel to update
    await page.waitForTimeout(500);

    // Verify wheel count decreased to 11
    const wheelLabelsAfter = await page.locator('g[data-index] text').count();
    expect(wheelLabelsAfter).toBe(11);

    // Verify ALEX is no longer visible on wheel
    const wheelText = await page.locator('g[data-index] text').allTextContents();
    expect(wheelText).not.toContain('ALEX');
  });
});
