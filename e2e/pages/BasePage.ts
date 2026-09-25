import type { Locator, Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async waitForToast(text: string) {
    await this.page.getByRole('status').getByText(text).waitFor();
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async pressSpace() {
    await this.page.keyboard.press('Space');
  }

  /** Opens a DatePicker and clicks the local ISO day (YYYY-MM-DD). */
  async pickDate(trigger: Locator, isoDay: string) {
    const [year, month] = isoDay.split('-').map(Number);
    await trigger.click();
    await this.page.getByLabel('Choose the Year').selectOption(String(year));
    await this.page.getByLabel('Choose the Month').selectOption(String(month - 1));
    await this.page.locator(`[data-day="${isoDay}"] button`).click();
  }
}
