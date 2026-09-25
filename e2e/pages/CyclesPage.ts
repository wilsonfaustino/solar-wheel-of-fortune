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
  readonly eventNameInput: Locator;
  readonly eventStartInput: Locator;
  readonly eventDurationInput: Locator;
  readonly holidaySwitch: Locator;
  readonly addEventButton: Locator;
  readonly eventBands: Locator;
  readonly eventTooltip: Locator;

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
    this.eventNameInput = page.getByLabel('Event name');
    this.eventStartInput = page.getByLabel('Event start date');
    this.eventDurationInput = page.getByLabel('Event duration in days');
    this.holidaySwitch = page.getByRole('switch', { name: 'Holiday' });
    this.addEventButton = page.getByRole('button', { name: /add event/i });
    this.eventBands = page.getByTestId('cycle-event-band');
    this.eventTooltip = page.getByRole('tooltip');
  }

  async switchToCyclesTab() {
    await this.cyclesTab.click();
  }

  async addCycle(name: string, start: string, end: string, cooldownWeeks = 1) {
    await this.nameInput.fill(name);
    await this.pickDate(this.startInput, start);
    await this.pickDate(this.endInput, end);
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
    if (updates.start !== undefined) await this.pickDate(this.startInput, updates.start);
    if (updates.end !== undefined) await this.pickDate(this.endInput, updates.end);
    await this.saveCycleButton.click();
  }

  async deleteCycle(name: string) {
    await this.page.getByRole('button', { name: `Delete ${name}` }).click();
  }

  async addEvent(name: string, start: string, durationDays = 1, isHoliday = false) {
    await this.eventNameInput.fill(name);
    await this.pickDate(this.eventStartInput, start);
    await this.eventDurationInput.fill(String(durationDays));
    if (isHoliday) await this.holidaySwitch.click();
    await this.addEventButton.click();
  }

  async hoverEventBand(name: string) {
    await this.page.getByRole('button', { name, exact: true }).hover();
  }

  async getCycleCount(): Promise<number> {
    return await this.page.getByRole('button', { name: /^Delete Cycle/ }).count();
  }
}
