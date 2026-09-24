import { expect, test } from '../fixtures/localStorage.fixture';

const DEFAULT_NAMES = [
  'ALEX',
  'JORDAN',
  'CASEY',
  'MORGAN',
  'RILEY',
  'AVERY',
  'TAYLOR',
  'SKYLAR',
  'QUINN',
  'SAGE',
  'ROWAN',
  'DAKOTA',
];

function localISODay(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

test.describe('Unavailability', () => {
  test('keeps unavailable names greyed on the wheel and only selects available ones', async ({
    sidebarPage,
    wheelPage,
    page,
  }) => {
    for (const name of DEFAULT_NAMES.slice(1)) {
      await sidebarPage.markUnavailableToday(name);
    }

    await wheelPage.verifyNamesDisplayed(12);
    await expect(page.locator('g[data-index] text[data-unavailable="true"]')).toHaveCount(11);

    await wheelPage.spin();

    expect(await wheelPage.getSelectedName()).toContain('ALEX');
  });

  test('disables spin when every name is unavailable', async ({ sidebarPage, wheelPage }) => {
    for (const name of DEFAULT_NAMES) {
      await sidebarPage.markUnavailableToday(name);
    }

    await expect(wheelPage.centerButton).toBeDisabled();
  });

  test('greys a name during a date range and restores it when marked available', async ({
    sidebarPage,
    page,
  }) => {
    await sidebarPage.setUnavailability('ALEX', localISODay(-1), localISODay(2));

    const alexOnWheel = page.locator('g[data-index] text', { hasText: 'ALEX' });
    await expect(alexOnWheel).toHaveAttribute('data-unavailable', 'true');
    await expect(sidebarPage.nameItems.filter({ hasText: 'ALEX' })).toContainText('BACK');

    await sidebarPage.markAvailable('ALEX');

    await expect(alexOnWheel).not.toHaveAttribute('data-unavailable');
  });

  test('keeps a name available before its range starts', async ({ sidebarPage, page }) => {
    await sidebarPage.setUnavailability('ALEX', localISODay(3), localISODay(5));

    await expect(page.locator('g[data-index] text', { hasText: 'ALEX' })).not.toHaveAttribute(
      'data-unavailable'
    );
    await expect(sidebarPage.nameItems.filter({ hasText: 'ALEX' })).not.toContainText('BACK');
  });
});
