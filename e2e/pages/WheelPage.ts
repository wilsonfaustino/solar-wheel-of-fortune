import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WheelPage extends BasePage {
  readonly centerButton: Locator;
  readonly wheelContainer: Locator;
  readonly nameLabels: Locator;

  constructor(page: Page) {
    super(page);
    this.centerButton = page.getByRole('button', {
      name: /randomize selection/i,
    });
    this.wheelContainer = page.locator('svg').filter({ hasText: 'Wheel of Fortune' });
    this.nameLabels = page.locator('g[data-index]');
  }

  async spin() {
    await this.centerButton.click();

    // Wait for spin animation to complete (button re-enabled)
    await expect(this.centerButton).toBeEnabled({ timeout: 10000 });

    // CRITICAL: Additional 2s buffer for motion.div overlay to fully settle
    // The button becomes enabled when onAnimationComplete fires, but the overlay
    // (motion.div with absolute inset-0) can still have imperceptible micro-movements
    // that cause Playwright to think it's intercepting pointer events
    // Testing: 1s buffer = still flaky, 2s buffer = reliable
    await this.page.waitForTimeout(2000);
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
    const toast = this.page.locator('.toast-container').first();
    await toast.waitFor({ timeout: 10000 });
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
