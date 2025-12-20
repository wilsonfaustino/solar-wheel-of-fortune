import type { Page } from '@playwright/test';

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
}
