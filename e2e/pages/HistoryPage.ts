import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HistoryPage extends BasePage {
  readonly historyTab: Locator;
  readonly historyItems: Locator;
  readonly clearHistoryButton: Locator;
  readonly exportButton: Locator;
  readonly statsText: Locator;
  readonly noHistoryMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.historyTab = page.getByRole('button', { name: /history tab/i });
    this.historyItems = page
      .locator('.group')
      .filter({ has: page.getByRole('button', { name: /delete/i }) });
    this.clearHistoryButton = page.getByRole('button', { name: /clear all/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.statsText = page.getByText(/total.*unique/i);
    this.noHistoryMessage = page.getByText(/spin the wheel to record selections/i);
  }

  async switchToHistoryTab() {
    await this.historyTab.click();
  }

  async getHistoryCount(): Promise<number> {
    return await this.historyItems.count();
  }

  async waitForHistoryItems(expectedCount: number): Promise<void> {
    await expect(this.historyItems).toHaveCount(expectedCount, {
      timeout: 5000, // Max wait time, but returns immediately when condition met
    });
  }

  async deleteHistoryItem(index: number) {
    const item = this.historyItems.nth(index);
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async clearAllHistory() {
    await this.clearHistoryButton.click();
    // Confirm in dialog
    const confirmButton = this.page.getByRole('button', { name: /clear all/i });
    await confirmButton.click();
  }

  async getStatsText(): Promise<string | null> {
    return await this.statsText.first().textContent();
  }

  async openExportModal() {
    await this.exportButton.click();
  }

  async isNoHistoryMessageVisible(): Promise<boolean> {
    return await this.noHistoryMessage.isVisible();
  }
}
