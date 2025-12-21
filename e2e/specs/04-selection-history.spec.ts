import { expect, test } from '../fixtures/localStorage.fixture';

test.describe('Selection History', () => {
  test('should record selections after spins', async ({ wheelPage, historyPage }) => {
    await historyPage.switchToHistoryTab();
    const noHistoryVisible = await historyPage.isNoHistoryMessageVisible();
    expect(noHistoryVisible).toBe(true);

    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    const count = await historyPage.getHistoryCount();
    expect(count).toBe(3);
  });

  test('should delete individual history item', async ({ wheelPage, historyPage }) => {
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();

    // Wait for history items to render (Playwright auto-retries)
    await historyPage.waitForHistoryItems(2);

    const initialCount = await historyPage.getHistoryCount();
    expect(initialCount).toBe(2);

    await historyPage.deleteHistoryItem(0);

    // Wait for count to change (Playwright auto-retries)
    await historyPage.waitForHistoryItems(1);

    const finalCount = await historyPage.getHistoryCount();
    expect(finalCount).toBe(1);
  });

  test('should clear all history with confirmation', async ({ wheelPage, historyPage }) => {
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    const initialCount = await historyPage.getHistoryCount();
    expect(initialCount).toBe(3);

    await historyPage.clearAllHistory();
    const noHistoryVisible = await historyPage.isNoHistoryMessageVisible();
    expect(noHistoryVisible).toBe(true);
  });

  test('should update stats correctly', async ({ wheelPage, historyPage }) => {
    await wheelPage.spin();
    await wheelPage.spin();
    await wheelPage.spin();

    await historyPage.switchToHistoryTab();
    const statsText = await historyPage.getStatsText();
    expect(statsText).toContain('3 total');
    expect(statsText).toContain('unique');
  });
});
