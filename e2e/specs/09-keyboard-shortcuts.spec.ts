import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Keyboard Shortcuts', () => {
  test('should not spin when typing in input field', async ({ page, sidebarPage }) => {
    // Focus on Add Name input
    await sidebarPage.addNameInput.focus();

    // Type a name with spaces
    await sidebarPage.addNameInput.fill('John Doe');

    // Wait a bit to ensure no spin triggered
    await page.waitForTimeout(1000);

    // Verify input still contains "John Doe" (space was not interpreted as spin command)
    const inputValue = await sidebarPage.addNameInput.inputValue();
    expect(inputValue).toBe('John Doe');

    // Verify no toast appeared (which would indicate a spin)
    const toastCount = await page.locator('.sonner-toast').count();
    expect(toastCount).toBe(0);
  });

  test('should close all modals on Escape', async ({
    page,
    sidebarPage,
    historyPage,
    wheelPage,
  }) => {
    // Test 1: Bulk import modal
    await sidebarPage.bulkImportButton.click();
    const bulkImportModal = page.locator('[role="dialog"]').filter({ hasText: /bulk import/i });
    await expect(bulkImportModal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(bulkImportModal).not.toBeVisible();

    // Test 2: Export modal (need history first)
    // Spin wheel to create history
    await wheelPage.spin();
    await page.waitForTimeout(1000);

    await historyPage.switchToHistoryTab();
    await historyPage.openExportModal();
    const exportModal = page.locator('[role="dialog"]').filter({ hasText: /export history/i });
    await expect(exportModal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(exportModal).not.toBeVisible();
  });
});
