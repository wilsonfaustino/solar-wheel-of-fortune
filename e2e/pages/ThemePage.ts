import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ThemePage extends BasePage {
  readonly settingsTab: Locator;
  readonly cyanThemeButton: Locator;
  readonly matrixThemeButton: Locator;
  readonly sunsetThemeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsTab = page.getByRole('button', { name: /settings tab/i });
    // RadioGroup buttons with theme labels
    this.cyanThemeButton = page.getByRole('radio', { name: /cyan pulse/i });
    this.matrixThemeButton = page.getByRole('radio', { name: /matrix green/i });
    this.sunsetThemeButton = page.getByRole('radio', { name: /sunset orange/i });
  }

  async switchToSettingsTab() {
    await this.settingsTab.click();
  }

  async selectTheme(theme: 'cyan' | 'matrix' | 'sunset') {
    const buttonMap = {
      cyan: this.cyanThemeButton,
      matrix: this.matrixThemeButton,
      sunset: this.sunsetThemeButton,
    };
    await buttonMap[theme].click();
  }

  async getCurrentTheme(): Promise<string | null> {
    // Read data-theme attribute from html element
    return await this.page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme');
    });
  }

  async verifyThemeApplied(expectedTheme: string) {
    const currentTheme = await this.getCurrentTheme();
    return currentTheme === expectedTheme;
  }

  async isThemeChecked(theme: 'cyan' | 'matrix' | 'sunset'): Promise<boolean> {
    const buttonMap = {
      cyan: this.cyanThemeButton,
      matrix: this.matrixThemeButton,
      sunset: this.sunsetThemeButton,
    };
    return await buttonMap[theme].isChecked();
  }
}
