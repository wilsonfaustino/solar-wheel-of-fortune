import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  readonly settingsTab: Locator;
  readonly autoExcludeSwitch: Locator;
  readonly clearSelectionSwitch: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsTab = page.getByRole('button', { name: /settings tab/i });
    // Use IDs from SettingsPanel component
    this.autoExcludeSwitch = page.locator('#auto-exclude');
    this.clearSelectionSwitch = page.locator('#clear-selection-after-exclude');
  }

  async switchToSettingsTab() {
    await this.settingsTab.click();
  }

  async toggleAutoExclude() {
    await this.autoExcludeSwitch.click();
  }

  async toggleClearSelection() {
    await this.clearSelectionSwitch.click();
  }

  async isAutoExcludeEnabled(): Promise<boolean> {
    return await this.autoExcludeSwitch.isChecked();
  }

  async isClearSelectionEnabled(): Promise<boolean> {
    return await this.clearSelectionSwitch.isChecked();
  }

  async isClearSelectionVisible(): Promise<boolean> {
    return await this.clearSelectionSwitch.isVisible();
  }

  async getSettingsFromStorage(): Promise<{
    autoExcludeEnabled: boolean;
    clearSelectionAfterExclude: boolean;
  }> {
    return await this.page.evaluate(() => {
      const stored = localStorage.getItem('settings-storage');
      if (!stored) {
        return { autoExcludeEnabled: true, clearSelectionAfterExclude: false };
      }
      const parsed = JSON.parse(stored);
      return {
        autoExcludeEnabled: parsed.state.autoExcludeEnabled,
        clearSelectionAfterExclude: parsed.state.clearSelectionAfterExclude,
      };
    });
  }
}
