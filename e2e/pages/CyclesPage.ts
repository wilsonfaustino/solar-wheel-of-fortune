import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CyclesPage extends BasePage {
  readonly cyclesTab: Locator;
  readonly nameInput: Locator;
  readonly startInput: Locator;
  readonly endInput: Locator;
  readonly cooldownWeeksInput: Locator;
  readonly addCycleButton: Locator;
  readonly saveCycleButton: Locator;
  readonly widget: Locator;
  readonly weekLabels: Locator;
  readonly weekBlocks: Locator;
  readonly weekdayCount: Locator;

  constructor(page: Page) {
    super(page);
    this.cyclesTab = page.getByRole('button', { name: /cycles tab/i });
    this.nameInput = page.getByLabel('Cycle name');
    this.startInput = page.getByLabel('Cycle start date');
    this.endInput = page.getByLabel('Cycle end date');
    this.cooldownWeeksInput = page.getByLabel('COOLDOWN WEEKS');
    this.addCycleButton = page.getByRole('button', { name: /add cycle/i });
    this.saveCycleButton = page.getByRole('button', { name: /save cycle/i });
    this.widget = page.getByTestId('cycle-widget');
    this.weekLabels = page.getByTestId('cycle-week-label');
    this.weekBlocks = page.getByTestId('cycle-week-block');
    this.weekdayCount = page.getByTestId('cycle-weekday-count');
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

  async editCycle(name: string, updates: { name?: string; start?: string; end?: string }) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();
    if (updates.name !== undefined) await this.nameInput.fill(updates.name);
    if (updates.start !== undefined) await this.startInput.fill(updates.start);
    if (updates.end !== undefined) await this.endInput.fill(updates.end);
    await this.saveCycleButton.click();
  }

  async deleteCycle(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async getCycleCount(): Promise<number> {
    return await this.page.getByRole('button', { name: /^Delete Cycle/ }).count();
  }
}
