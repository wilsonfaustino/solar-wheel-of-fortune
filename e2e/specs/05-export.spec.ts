import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Export Functionality', () => {
  test('should export history as CSV', async ({ page, wheelPage, historyPage }) => {
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    await historyPage.openExportModal();

    // CSV format is default, just download
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.getByRole('button', { name: /download/i });
    await downloadButton.click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/selections_.*\.csv/);
  });

  test('should export history as JSON', async ({ page, wheelPage, historyPage }) => {
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    await historyPage.openExportModal();

    // Select JSON format by clicking the JSON button
    const jsonButton = page.getByRole('button', { name: /^JSON$/i });
    await jsonButton.click();

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.getByRole('button', { name: /download/i });
    await downloadButton.click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/selections_.*\.json/);
  });

  test('should use custom filename', async ({ page, wheelPage, historyPage }) => {
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    await historyPage.openExportModal();

    // Change filename using the id selector
    const filenameInput = page.locator('#filename');
    await filenameInput.clear();
    await filenameInput.fill('my-selections');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    const downloadButton = page.getByRole('button', { name: /download/i });
    await downloadButton.click();

    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    expect(filename).toContain('my-selections');
  });
});
