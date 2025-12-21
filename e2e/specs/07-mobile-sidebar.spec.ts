import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Mobile Sidebar', () => {
  test('should open drawer on mobile header button', async ({ page, mobilePage, historyPage }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Verify hamburger menu button visible
    const isMenuVisible = await mobilePage.isMenuButtonVisible();
    expect(isMenuVisible).toBe(true);

    // Open drawer
    await mobilePage.openDrawer();

    // Verify drawer visible
    const isDrawerOpen = await mobilePage.isDrawerVisible();
    expect(isDrawerOpen).toBe(true);

    // Verify drawer contains History tab by trying to switch
    await historyPage.switchToHistoryTab();
    const noHistoryVisible = await historyPage.isNoHistoryMessageVisible();
    expect(noHistoryVisible).toBe(true);
  });

  test('should close drawer on overlay click', async ({ page, mobilePage }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Open drawer
    await mobilePage.openDrawer();

    // Verify drawer open
    const isDrawerOpen = await mobilePage.isDrawerVisible();
    expect(isDrawerOpen).toBe(true);

    // Close via overlay click
    await mobilePage.closeDrawerViaOverlay();

    // Verify drawer closed
    const isDrawerClosed = await mobilePage.isDrawerVisible();
    expect(isDrawerClosed).toBe(false);
  });
});
