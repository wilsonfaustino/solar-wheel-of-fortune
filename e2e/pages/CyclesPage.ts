import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CyclesPage extends BasePage {
  readonly cyclesTab: Locator;
  readonly nameInput: Locator;
  readonly startInput: Locator;
  readonly endInput: Locator;
  readonly cooldownWeeksInput: Locator;
  readonly addCycleButton: Locator;
  readonly widget: Locator;

  constructor(page: Page) {
    super(page);
    this.cyclesTab = page.getByRole('button', { name: /cycles tab/i });
    this.nameInput = page.getByLabel('Cycle name');
    this.startInput = page.getByLabel('Cycle start date');
    this.endInput = page.getByLabel('Cycle end date');
    this.cooldownWeeksInput = page.getByLabel('COOLDOWN WEEKS');
    this.addCycleButton = page.getByRole('button', { name: /add cycle/i });
    this.widget = page.getByTestId('cycle-widget');
  }

  async switchToCyclesTab() {
    await this.cyclesTab.click();
  }

  async addCycle(name: string, start: string, end: string, cooldownWeeks = 1) {
    await this.nameInput.fill(name);
    await this.startInput.fill(start);
    await this.endInput.fill(end);
    await this.cooldownWeeksInput.fill(String(cooldownWeeks));
    await this.addCycleButton.click();
  }

  cycleCard(name: string): Locator {
    return this.page
      .locator('div')
      .filter({ hasText: new RegExp(`^${name}`) })
      .last();
  }

  async deleteCycle(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async getCycleCount(): Promise<number> {
    return await this.page.getByRole('button', { name: /^Delete Cycle/ }).count();
  }
}
