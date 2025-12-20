import type { Locator, Page } from '@playwright/test';
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
    this.historyTab = page.getByRole('tab', { name: /history/i });
    this.historyItems = page
      .locator('.group')
      .filter({ has: page.getByRole('button', { name: /delete/i }) });
    this.clearHistoryButton = page.getByRole('button', { name: /clear all/i });
    this.exportButton = page.getByRole('button', { name: /export/i });
    this.statsText = page.locator('text=Total:').or(page.locator('text=Unique:'));
    this.noHistoryMessage = page.getByText(/no history yet/i);
  }

  async switchToHistoryTab() {
    await this.historyTab.click();
  }

  async getHistoryCount(): Promise<number> {
    return await this.historyItems.count();
  }

  async deleteHistoryItem(index: number) {
    const item = this.historyItems.nth(index);
    const deleteButton = item.getByRole('button', { name: /delete/i });
    await deleteButton.click();
  }

  async clearAllHistory() {
    await this.clearHistoryButton.click();
    // Confirm in dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
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
