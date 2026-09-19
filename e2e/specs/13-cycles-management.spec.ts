import { expect, test } from '../fixtures/localStorage.fixture';

function isoDayOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

test.describe('Cycles management', () => {
  test('should add a cycle and show the widget with the current position', async ({
    cyclesPage,
  }) => {
    await cyclesPage.switchToCyclesTab();
    await cyclesPage.addCycle('Cycle 2', isoDayOffset(-14), isoDayOffset(20), 2);

    await expect(cyclesPage.widget).toBeVisible();
    await expect(cyclesPage.widget).toContainText('IN CYCLE');
    await expect(cyclesPage.widget).toContainText('WEEK 3');
    await expect(cyclesPage.widget).toContainText('TO COOLDOWN');
    await expect(cyclesPage.widget).toContainText('7 DAYS');
    await expect(cyclesPage.widget).toContainText('20 DAYS');
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
});
