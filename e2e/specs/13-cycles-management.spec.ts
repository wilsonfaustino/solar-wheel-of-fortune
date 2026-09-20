import { expect, test } from '../fixtures/localStorage.fixture';

function isoDayOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Week blocks follow the calendar, so a cycle opening on a Monday two weeks back spans exactly
 * five whole weeks whichever day the suite runs on, and today always lands in week 3.
 */
function mondayAnchoredCycle(): { start: string; end: string } {
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - 14);
  const end = new Date(monday);
  end.setDate(end.getDate() + 34);
  return { start: monday.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

test.describe('Cycles management', () => {
  test('should add a cycle and show the widget with the current position', async ({
    cyclesPage,
  }) => {
    const { start, end } = mondayAnchoredCycle();
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', start, end, 2);

    await expect(cyclesPage.widget).toBeVisible();
    await expect(cyclesPage.widget).toContainText('IN CYCLE');
    await expect(cyclesPage.widget).toContainText('WEEK 3');
    await expect(cyclesPage.widget).toContainText('TO COOLDOWN');
  });

  test('should divide the bar into weeks of five weekdays', async ({ cyclesPage }) => {
    const { start, end } = mondayAnchoredCycle();
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', start, end, 2);

    await expect(cyclesPage.weekLabels).toHaveCount(5);
    await expect(cyclesPage.weekBlocks).toHaveCount(5);
    await expect(cyclesPage.weekdayCount).toContainText('/ 25');
  });

  test('should show the cooldown state and the next cycle countdown', async ({ cyclesPage }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 1', isoDayOffset(-40), isoDayOffset(4), 2);
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(15), isoDayOffset(50), 1);

    await expect(cyclesPage.widget).toContainText('COOLDOWN LEFT');
    await expect(cyclesPage.widget).toContainText('DAY 10');
    await expect(cyclesPage.widget).toContainText('4 DAYS');
    await expect(cyclesPage.widget).toContainText('STARTS IN 15 DAYS');
  });

  test('should hide the widget when today falls outside every cycle', async ({ cyclesPage }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 1', isoDayOffset(30), isoDayOffset(60), 1);

    await expect(cyclesPage.widget).toBeHidden();
  });

  test('should persist cycles across a reload and delete them', async ({ cyclesPage, page }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-7), isoDayOffset(21), 1);

    await page.reload();
    await cyclesPage.switchToCyclesTab();
    expect(await cyclesPage.getCycleCount()).toBe(1);
    await expect(cyclesPage.widget).toBeVisible();

    await cyclesPage.deleteCycle('Cycle 2');
    expect(await cyclesPage.getCycleCount()).toBe(0);
    await expect(cyclesPage.widget).toBeHidden();
  });

  test('should edit a cycle and persist the change across a reload', async ({
    cyclesPage,
    page,
  }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-14), isoDayOffset(20), 2);

    await cyclesPage.editCycle('Cycle 2', { name: 'Cycle 2 Revised', end: isoDayOffset(30) });

    await expect(cyclesPage.addCycleButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Cycle 2 Revised' })).toBeVisible();
    expect(await cyclesPage.getCycleCount()).toBe(1);

    await page.reload();
    await cyclesPage.switchToCyclesTab();
    await expect(page.getByRole('button', { name: 'Delete Cycle 2 Revised' })).toBeVisible();
    await expect(cyclesPage.widget).toContainText('30 DAYS');
  });
  test('should gray out a holiday event band and keep the flag across a reload', async ({
    cyclesPage,
    page,
  }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-7), isoDayOffset(21), 1);
    await cyclesPage.addEvent('Launch Day', isoDayOffset(1), 2);
    await cyclesPage.addEvent('Independence', isoDayOffset(5), 1, true);

    await expect(cyclesPage.eventBands).toHaveCount(2);
    await expect(page.locator('[data-testid="cycle-event-band"][data-holiday="true"]')).toHaveCount(
      1
    );
    await expect(
      page.locator('[data-testid="cycle-event-band"][data-holiday="false"]')
    ).toHaveCount(1);

    await page.reload();
    await cyclesPage.switchToCyclesTab();
    await expect(page.locator('[data-testid="cycle-event-band"][data-holiday="true"]')).toHaveCount(
      1
    );
    await page.getByRole('button', { name: 'Edit Independence' }).click();
    await expect(cyclesPage.holidaySwitch).toBeChecked();
  });
  test('should span the duration in days and reload it into the edit form', async ({
    cyclesPage,
    page,
  }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-7), isoDayOffset(21), 1);
    await cyclesPage.addEvent('Launch Week', isoDayOffset(1), 3);

    await page.reload();
    await cyclesPage.switchToCyclesTab();
    await page.getByRole('button', { name: 'Edit Launch Week' }).click();
    await expect(cyclesPage.eventStartInput).toHaveValue(isoDayOffset(1));
    await expect(cyclesPage.eventDurationInput).toHaveValue('3');
  });
  test('should show the event details in a tooltip on hover', async ({ cyclesPage }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-7), isoDayOffset(21), 1);
    await cyclesPage.addEvent('Independence', isoDayOffset(1), 2, true);

    await expect(cyclesPage.eventTooltip).toHaveCount(0);

    await cyclesPage.hoverEventBand('Independence');

    await expect(cyclesPage.eventTooltip).toBeVisible();
    await expect(cyclesPage.eventTooltip).toContainText('INDEPENDENCE');
    await expect(cyclesPage.eventTooltip).toContainText('HOLIDAY');
    await expect(cyclesPage.eventTooltip).toContainText(isoDayOffset(1));
    await expect(cyclesPage.eventTooltip).toContainText(isoDayOffset(2));
  });
});
