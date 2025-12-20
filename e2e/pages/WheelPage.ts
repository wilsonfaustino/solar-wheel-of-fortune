import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class WheelPage extends BasePage {
  readonly centerButton: Locator;
  readonly wheelContainer: Locator;
  readonly nameLabels: Locator;

  constructor(page) {
    super(page);
    this.centerButton = page.getByRole('button', {
      name: /click to randomize/i,
    });
    this.wheelContainer = page.locator('svg').filter({ hasText: 'Wheel of Fortune' });
    this.nameLabels = page.locator('text[data-index]');
  }

  async spin() {
    await this.centerButton.click();
    // Wait for 5s spring animation + 1s buffer
    await this.page.waitForTimeout(6000);
  }

  async spinViaKeyboard() {
    await this.pressSpace();
    await this.page.waitForTimeout(6000);
  }

  async waitForSpinComplete() {
    // Wait for rotation animation to complete
    await this.page.waitForTimeout(6000);
  }

  async getSelectedName(): Promise<string | null> {
    const toast = this.page.getByRole('status').first();
    const text = await toast.textContent();
    return text;
  }

  async verifyNamesDisplayed(count: number) {
    await expect(this.nameLabels).toHaveCount(count);
  }

  async isSpinning(): Promise<boolean> {
    return await this.centerButton.isDisabled();
  }
}
