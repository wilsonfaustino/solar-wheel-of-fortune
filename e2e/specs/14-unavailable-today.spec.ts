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

test.describe('Unavailable Today', () => {
  test('keeps unavailable names greyed on the wheel and only selects available ones', async ({
    sidebarPage,
    wheelPage,
    page,
  }) => {
    for (const name of DEFAULT_NAMES.slice(1)) {
      await sidebarPage.toggleUnavailable(name);
    }

    await wheelPage.verifyNamesDisplayed(12);
    await expect(page.locator('g[data-index] text[data-unavailable="true"]')).toHaveCount(11);

    await wheelPage.spin();

    expect(await wheelPage.getSelectedName()).toContain('ALEX');
  });

  test('disables spin when every name is unavailable', async ({ sidebarPage, wheelPage }) => {
    for (const name of DEFAULT_NAMES) {
      await sidebarPage.toggleUnavailable(name);
    }

    await expect(wheelPage.centerButton).toBeDisabled();
  });
});
